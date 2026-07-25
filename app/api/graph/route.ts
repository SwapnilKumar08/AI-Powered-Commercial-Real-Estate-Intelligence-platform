import { evidenceCorpus, properties } from "../../lib/cre-data";

export const runtime = "edge";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const propertyId = url.searchParams.get("propertyId") ?? properties[0].id;
  const property = properties.find((item) => item.id === propertyId) ?? properties[0];
  const sources = evidenceCorpus.filter((item) => item.propertyId === property.id);
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

