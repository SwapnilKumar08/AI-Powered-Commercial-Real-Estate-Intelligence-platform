"""Training entry point for CRE spatial forecasting models."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import torch
from torch import nn
from torch.utils.data import DataLoader, Dataset

from models import ConvLSTMForecaster, PredRNNForecaster


class GridDataset(Dataset):
    def __init__(self, path: Path):
        payload = torch.load(path, map_location="cpu", weights_only=True)
        self.inputs = payload["inputs"].float()
        self.targets = payload["targets"].float()

    def __len__(self) -> int:
        return self.inputs.shape[0]

    def __getitem__(self, index: int):
        return self.inputs[index], self.targets[index]


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--data", type=Path, required=True)
    parser.add_argument("--model", choices=["convlstm", "predrnn"], default="predrnn")
    parser.add_argument("--epochs", type=int, default=20)
    parser.add_argument("--out", type=Path, default=Path("artifacts"))
    args = parser.parse_args()

    torch.manual_seed(41)
    dataset = GridDataset(args.data)
    loader = DataLoader(dataset, batch_size=8, shuffle=True)
    input_channels = dataset.inputs.shape[2]
    output_channels = dataset.targets.shape[2]
    model: nn.Module = (
        ConvLSTMForecaster(input_channels, output_channels=output_channels)
        if args.model == "convlstm"
        else PredRNNForecaster(input_channels, output_channels=output_channels)
    )
    optimiser = torch.optim.AdamW(model.parameters(), lr=2e-4, weight_decay=1e-3)
    loss_fn = nn.HuberLoss()
    model.train()
    history = []
    for epoch in range(args.epochs):
        total = 0.0
        for inputs, targets in loader:
            optimiser.zero_grad()
            prediction = model(inputs, horizon=targets.shape[1])
            loss = loss_fn(prediction, targets)
            loss.backward()
            nn.utils.clip_grad_norm_(model.parameters(), 1.0)
            optimiser.step()
            total += float(loss)
        history.append(total / max(1, len(loader)))

    args.out.mkdir(parents=True, exist_ok=True)
    torch.save(model.state_dict(), args.out / f"{args.model}.pt")
    (args.out / f"{args.model}-metrics.json").write_text(
        json.dumps(
            {
                "model": args.model,
                "epochs": args.epochs,
                "training_loss": history,
                "status": "development-candidate",
            },
            indent=2,
        )
    )


if __name__ == "__main__":
    main()

