import { marketSeries } from "../../lib/cre-data";

export const runtime = "edge";

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => ({}))) as {
    model?: "convlstm" | "predrnn";
    market?: string;
    horizon?: number;
  };
  const model = payload.model === "convlstm" ? "convlstm" : "predrnn";
  const horizon = Math.max(1, Math.min(12, Number(payload.horizon ?? 12)));
  const series = marketSeries[model].slice(0, horizon);
  const movement = ((series.at(-1)! - series[0]) / series[0]) * 100;
  return Response.json({
    model,
    modelVersion: model === "predrnn" ? "cre-predrnn-0.4.0" : "cre-convlstm-0.4.0",
    market: payload.market ?? "London / King's Cross",
    horizonMonths: horizon,
    indexForecast: series,
    movementPercent: Number(movement.toFixed(1)),
    interval90: [
      Number(Math.max(0, movement - 7).toFixed(1)),
      Number((movement + 8).toFixed(1)),
    ],
    status: "demonstration-model",
    disclaimer: "Synthetic model output for engineering demonstration only.",
  });
}

