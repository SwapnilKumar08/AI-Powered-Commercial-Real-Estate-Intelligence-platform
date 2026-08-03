import {
  defaultCountryCode,
  getCountryMarketSeries,
  getCountryProfile,
  type CountryCode,
} from "../../lib/cre-data";

export const runtime = "edge";

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => ({}))) as {
    model?: "convlstm" | "predrnn";
    market?: string;
    horizon?: number;
    countryCode?: CountryCode;
  };
  const model = payload.model === "convlstm" ? "convlstm" : "predrnn";
  const countryCode = payload.countryCode ?? defaultCountryCode;
  const profile = getCountryProfile(countryCode);
  const horizon = Math.max(1, Math.min(12, Number(payload.horizon ?? 12)));
  const series = getCountryMarketSeries(countryCode, model).slice(0, horizon);
  const movement = ((series.at(-1)! - series[0]) / series[0]) * 100;
  return Response.json({
    model,
    modelVersion: model === "predrnn" ? "cre-predrnn-0.4.0" : "cre-convlstm-0.4.0",
    market: payload.market ?? `${profile.name} / Tier-1 metro cluster`,
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

