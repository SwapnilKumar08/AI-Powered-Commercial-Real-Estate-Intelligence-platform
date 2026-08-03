import {
  defaultCountryCode,
  getCountryEvidence,
  getCountryProperties,
  type CountryCode,
} from "../../lib/cre-data";
import { cosine, semanticVector } from "../../lib/runtime";

export const runtime = "edge";

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => ({}))) as {
    question?: string;
    propertyId?: string;
    countryCode?: CountryCode;
  };
  const question = payload.question?.trim();
  if (!question) {
    return Response.json({ error: "A research question is required." }, { status: 400 });
  }

  const countryCode = payload.countryCode ?? defaultCountryCode;
  const countryProperties = getCountryProperties(countryCode);
  const countryEvidence = getCountryEvidence(countryCode);
  const selectedProperty = countryProperties.find((property) => property.id === payload.propertyId);
  const queryVector = semanticVector(question);
  const ranked = countryEvidence
    .map((evidence) => {
      const vectorScore = cosine(queryVector, semanticVector(evidence.excerpt));
      const graphBonus = evidence.propertyId === payload.propertyId ? 0.22 : 0;
      return { ...evidence, score: vectorScore + graphBonus };
    })
    .sort((left, right) => right.score - left.score)
    .slice(0, 3);

  const primary = ranked[0];
  const secondary = ranked[1];
  const propertyName = selectedProperty?.name ?? "The selected property";
  const answer = primary
    ? `${propertyName} is supported by two converging signals. ${primary.excerpt} ${
        secondary?.excerpt ?? ""
      } The conclusion should be reviewed against the cited source passages before an investment decision.`
    : "No indexed evidence was found for this question.";

  return Response.json({
    answer,
    confidence: Math.round(Math.min(96, 72 + Math.max(0, primary?.score ?? 0) * 24)),
    citations: ranked.map((evidence, index) => ({
      index: index + 1,
      id: evidence.id,
      title: evidence.title,
      source: evidence.source,
      locator: evidence.locator,
      quote: evidence.excerpt,
      sourceHash: evidence.hash,
      retrievalScore: Number(evidence.score.toFixed(4)),
    })),
    retrieval: {
      architecture: "hybrid-vector-plus-knowledge-graph",
      candidates: countryEvidence.length,
      graphPath:
        selectedProperty
          ? [propertyName, selectedProperty.signal, "NOI growth"]
          : [propertyName, "market signal"],
    },
    disclaimer: "Demonstration intelligence, not investment advice.",
  });
}

