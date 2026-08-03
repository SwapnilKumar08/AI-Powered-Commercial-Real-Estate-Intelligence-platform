import {
  defaultCountryCode,
  getCountryEvidence,
  getCountryProperties,
  type CountryCode,
} from "../../lib/cre-data";

export const runtime = "edge";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const countryCode = (url.searchParams.get("countryCode") as CountryCode | null) ??
    defaultCountryCode;
  const countryProperties = getCountryProperties(countryCode);
  const countryEvidence = getCountryEvidence(countryCode);
  const propertyId = url.searchParams.get("propertyId") ?? countryProperties[0].id;
  const property = countryProperties.find((item) => item.id === propertyId) ?? countryProperties[0];
  const sources = countryEvidence.filter((item) => item.propertyId === property.id);
  const nodes = [
    { id: property.id, type: "Property", label: property.name },
    { id: `signal:${property.id}`, type: "Signal", label: property.signal },
    { id: `district:${property.district}`, type: "Market", label: property.district },
    ...sources.map((source) => ({ id: source.id, type: "Evidence", label: source.title })),
  ];
  const edges = [
    {
      source: property.id,
      relationship: "LOCATED_IN",
      target: `district:${property.district}`,
      confidence: 1,
    },
    {
      source: property.id,
      relationship: "HAS_SIGNAL",
      target: `signal:${property.id}`,
      confidence: 0.88,
    },
    ...sources.map((source) => ({
      source: source.id,
      relationship: "SUPPORTS",
      target: `signal:${property.id}`,
      confidence: 0.84,
      evidenceHash: source.hash,
    })),
  ];
  return Response.json({ nodes, edges });
}

