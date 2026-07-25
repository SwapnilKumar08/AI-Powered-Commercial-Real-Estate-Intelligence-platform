# Architecture

## System boundaries

Landmark AI separates evidence acquisition from interpretation. Raw documents
and provider responses are immutable inputs. Normalised entities, embeddings,
relationships, forecasts and generated answers are derived records that retain
links to those inputs.

### Collection and ingestion

1. EventBridge schedules licensed APIs and public-record collectors.
2. Browser automation is restricted to sources whose terms explicitly permit
   it. LinkedIn is limited to authorised APIs and user-owned exports.
3. S3 stores the original payload and computes a source digest.
4. Step Functions chooses PyPDF, Textract or a structured-data parser.
5. Chunks retain page number, character span, source URI and hashes.

### Semantic retrieval

Evidence chunks are embedded and stored in PostgreSQL with pgvector. Retrieval
uses metadata filters before approximate-nearest-neighbour search. A reranker
combines vector similarity, lexical signal, freshness and source quality.

### Knowledge graph

Canonical nodes include `Property`, `Address`, `Owner`, `Company`, `Person`,
`Lease`, `Transaction`, `PlanningApplication`, `Market`, `Signal` and
`Evidence`. Every inferred edge stores confidence, extraction version and the
supporting evidence identifier.

Entity resolution uses:

- address normalisation and coordinates;
- company numbers and LEIs when available;
- deterministic identifiers from licensed feeds;
- fuzzy name matching with review thresholds;
- temporal validity for ownership, leases and appointments.

### RAG

The orchestration layer performs:

1. intent and property/entity resolution;
2. filtered vector retrieval;
3. one-to-two-hop graph expansion;
4. cross-encoder reranking;
5. evidence-constrained answer generation;
6. quote/locator validation;
7. confidence calculation and audit recording.

The LLM never writes directly to the source or graph stores.

### Geospatial forecasting

Quarterly or monthly grid tensors combine market, planning, supply, mobility and
macro channels. ConvLSTM is the low-latency baseline; PredRNN is evaluated for
longer temporal dependencies. Production releases require time-based
backtesting, spatial holdouts and benchmark comparison against persistence,
seasonal and gradient-boosted baselines.

### Outreach

Professional profiles and email candidates are separated from outreach
decisions. A policy service checks verification, lawful basis, jurisdiction,
suppression, frequency and campaign purpose. Passing a policy check only
creates a human-review task; it never sends automatically.

## Production trust controls

- exact source quotes and SHA-256 provenance;
- licensed-data access controls and deletion policies;
- retrieval precision/recall and citation-validity tests;
- prompt-injection isolation for uploaded documents;
- model registry, drift detection and rollback;
- uncertainty thresholds with human escalation;
- immutable policy decisions for outreach.

