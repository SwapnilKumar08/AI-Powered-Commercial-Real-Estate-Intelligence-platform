"""Hybrid pgvector + knowledge-graph retrieval for evidence-backed CRE RAG."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

import psycopg
from neo4j import GraphDatabase


@dataclass(frozen=True)
class RetrievedEvidence:
    id: str
    content: str
    title: str
    locator: str
    source_hash: str
    vector_score: float
    graph_score: float
    final_score: float


class HybridRetriever:
    def __init__(self, postgres_dsn: str, neo4j_uri: str, neo4j_auth: tuple[str, str]):
        self.postgres_dsn = postgres_dsn
        self.driver = GraphDatabase.driver(neo4j_uri, auth=neo4j_auth)

    def retrieve(
        self,
        query_embedding: list[float],
        property_id: str | None,
        limit: int = 8,
    ) -> list[RetrievedEvidence]:
        with psycopg.connect(self.postgres_dsn) as connection:
            rows = connection.execute(
                """
                SELECT id, content, title, locator, source_hash,
                       1 - (embedding <=> %s::vector) AS vector_score
                FROM evidence_chunks
                ORDER BY embedding <=> %s::vector
                LIMIT %s
                """,
                (query_embedding, query_embedding, limit * 3),
            ).fetchall()

        graph_scores: dict[str, float] = {}
        if property_id:
            with self.driver.session() as session:
                result = session.run(
                    """
                    MATCH (p:Property {id: $property_id})-[*1..2]-(e:Evidence)
                    RETURN e.id AS id, max(1.0 / length(shortestPath((p)-[*]-(e)))) AS score
                    """,
                    property_id=property_id,
                )
                graph_scores = {record["id"]: float(record["score"]) for record in result}

        evidence = []
        for row in rows:
            vector_score = float(row[5])
            graph_score = graph_scores.get(row[0], 0.0)
            final_score = 0.78 * vector_score + 0.22 * graph_score
            evidence.append(
                RetrievedEvidence(
                    id=row[0],
                    content=row[1],
                    title=row[2],
                    locator=row[3],
                    source_hash=row[4],
                    vector_score=vector_score,
                    graph_score=graph_score,
                    final_score=final_score,
                )
            )
        return sorted(evidence, key=lambda item: item.final_score, reverse=True)[:limit]

