import { defaultCountryCode, type CountryCode } from "../../lib/cre-data";
import {
  globalSearchStats,
  searchGlobalRealEstate,
} from "../../lib/global-real-estate";

export const runtime = "edge";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q") ?? "";
  const countryCode =
    (url.searchParams.get("countryCode") as CountryCode | "ALL" | null) ?? "ALL";
  const limit = Number(url.searchParams.get("limit") ?? 20);

  const result = searchGlobalRealEstate(query, {
    countryCode,
    limit: Number.isFinite(limit) ? Math.max(1, Math.min(50, limit)) : 20,
  });

  return Response.json({
    ...result,
    stats: globalSearchStats,
    defaultCountryCode,
  });
}

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => ({}))) as {
    query?: string;
    countryCode?: CountryCode | "ALL";
    limit?: number;
  };

  const result = searchGlobalRealEstate(payload.query ?? "", {
    countryCode: payload.countryCode ?? "ALL",
    limit: Math.max(1, Math.min(50, Number(payload.limit ?? 20))),
  });

  return Response.json({
    ...result,
    stats: globalSearchStats,
    defaultCountryCode,
  });
}
