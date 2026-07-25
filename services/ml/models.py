"""ConvLSTM and PredRNN building blocks for CRE geospatial forecasting.

Input convention: [batch, time, channels, height, width].  Grid channels can
contain rents, vacancy, take-up, planning intensity, mobility and new supply.
"""

from __future__ import annotations

import torch
from torch import Tensor, nn


class ConvLSTMCell(nn.Module):
    def __init__(self, input_channels: int, hidden_channels: int, kernel_size: int = 3):
        super().__init__()
        padding = kernel_size // 2
        self.hidden_channels = hidden_channels
        self.gates = nn.Conv2d(
            input_channels + hidden_channels,
            4 * hidden_channels,
            kernel_size,
            padding=padding,
        )

    def forward(
        self,
        x: Tensor,
        state: tuple[Tensor, Tensor] | None = None,
    ) -> tuple[Tensor, Tensor]:
        if state is None:
            shape = (x.shape[0], self.hidden_channels, x.shape[2], x.shape[3])
            hidden = x.new_zeros(shape)
            cell = x.new_zeros(shape)
        else:
            hidden, cell = state
        ingate, forgetgate, candidate, outgate = self.gates(
            torch.cat([x, hidden], dim=1)
        ).chunk(4, dim=1)
        ingate = torch.sigmoid(ingate)
        forgetgate = torch.sigmoid(forgetgate)
        candidate = torch.tanh(candidate)
        outgate = torch.sigmoid(outgate)
        cell = forgetgate * cell + ingate * candidate
        hidden = outgate * torch.tanh(cell)
        return hidden, cell


class ConvLSTMForecaster(nn.Module):
    def __init__(
        self,
        input_channels: int,
        hidden_channels: int = 48,
        output_channels: int = 1,
    ):
        super().__init__()
        self.cell = ConvLSTMCell(input_channels, hidden_channels)
        self.head = nn.Sequential(
            nn.Conv2d(hidden_channels, hidden_channels // 2, 3, padding=1),
            nn.GELU(),
            nn.Conv2d(hidden_channels // 2, output_channels, 1),
        )

    def forward(self, sequence: Tensor, horizon: int = 4) -> Tensor:
        state = None
        for time_index in range(sequence.shape[1]):
            state = self.cell(sequence[:, time_index], state)
        hidden, cell = state
        outputs = []
        recurrent_input = sequence[:, -1]
        for _ in range(horizon):
            hidden, cell = self.cell(recurrent_input, (hidden, cell))
            prediction = self.head(hidden)
            outputs.append(prediction)
            recurrent_input = torch.cat(
                [
                    prediction,
                    recurrent_input[:, prediction.shape[1] :],
                ],
                dim=1,
            )
        return torch.stack(outputs, dim=1)


class SpatiotemporalLSTMCell(nn.Module):
    """PredRNN-style cell with separate temporal and spatial memories."""

    def __init__(self, input_channels: int, hidden_channels: int):
        super().__init__()
        self.hidden_channels = hidden_channels
        self.x_gates = nn.Conv2d(input_channels, hidden_channels * 7, 5, padding=2)
        self.h_gates = nn.Conv2d(hidden_channels, hidden_channels * 4, 5, padding=2)
        self.m_gates = nn.Conv2d(hidden_channels, hidden_channels * 3, 5, padding=2)
        self.output = nn.Conv2d(hidden_channels * 2, hidden_channels, 1)

    def forward(
        self,
        x: Tensor,
        hidden: Tensor,
        cell: Tensor,
        spatial_memory: Tensor,
    ) -> tuple[Tensor, Tensor, Tensor]:
        x_i, x_f, x_g, x_i2, x_f2, x_g2, x_o = self.x_gates(x).chunk(7, dim=1)
        h_i, h_f, h_g, h_o = self.h_gates(hidden).chunk(4, dim=1)
        m_i, m_f, m_g = self.m_gates(spatial_memory).chunk(3, dim=1)
        cell = torch.sigmoid(x_f + h_f) * cell + torch.sigmoid(x_i + h_i) * torch.tanh(x_g + h_g)
        spatial_memory = (
            torch.sigmoid(x_f2 + m_f) * spatial_memory
            + torch.sigmoid(x_i2 + m_i) * torch.tanh(x_g2 + m_g)
        )
        mixed = torch.cat([cell, spatial_memory], dim=1)
        hidden = torch.sigmoid(x_o + h_o) * torch.tanh(self.output(mixed))
        return hidden, cell, spatial_memory


class PredRNNForecaster(nn.Module):
    def __init__(
        self,
        input_channels: int,
        hidden_channels: int = 48,
        layers: int = 2,
        output_channels: int = 1,
    ):
        super().__init__()
        self.hidden_channels = hidden_channels
        self.cells = nn.ModuleList(
            [
                SpatiotemporalLSTMCell(
                    input_channels if index == 0 else hidden_channels,
                    hidden_channels,
                )
                for index in range(layers)
            ]
        )
        self.head = nn.Conv2d(hidden_channels, output_channels, 1)

    def forward(self, sequence: Tensor, horizon: int = 4) -> Tensor:
        batch, _, _, height, width = sequence.shape
        hidden = [
            sequence.new_zeros(batch, self.hidden_channels, height, width)
            for _ in self.cells
        ]
        cells = [state.clone() for state in hidden]
        memory = hidden[0].clone()
        current = sequence[:, 0]
        total_steps = sequence.shape[1] + horizon
        outputs = []
        for step in range(total_steps):
            if step < sequence.shape[1]:
                current = sequence[:, step]
            layer_input = current
            for index, cell in enumerate(self.cells):
                hidden[index], cells[index], memory = cell(
                    layer_input,
                    hidden[index],
                    cells[index],
                    memory,
                )
                layer_input = hidden[index]
            prediction = self.head(hidden[-1])
            if step >= sequence.shape[1]:
                outputs.append(prediction)
            current = torch.cat(
                [prediction, current[:, prediction.shape[1] :]],
                dim=1,
            )
        return torch.stack(outputs, dim=1)

