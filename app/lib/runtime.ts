import { env } from "cloudflare:workers";

export type LandmarkEnv = {
  DB: D1Database;
  DOCUMENTS: R2Bucket;
  HUNTER_API_KEY?: string;
  LLM_API_KEY?: string;
  FORECAST_API_URL?: string;
};

export const runtimeEnv = () => env as unknown as LandmarkEnv;

export async function ensureRuntimeSchema(db: D1Database) {
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      filename TEXT NOT NULL,
      object_key TEXT NOT NULL,
      content_type TEXT NOT NULL,
      size_bytes INTEGER NOT NULL,
      source_hash TEXT NOT NULL,
      processing_status TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS outreach_events (
      id TEXT PRIMARY KEY,
      contact_name TEXT NOT NULL,
      email_domain TEXT NOT NULL,
      lawful_basis TEXT NOT NULL,
      email_status TEXT NOT NULL,
      action TEXT NOT NULL,
      decision TEXT NOT NULL,
      reason TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`),
    db.prepare("CREATE INDEX IF NOT EXISTS documents_hash_idx ON documents (source_hash)"),
    db.prepare("CREATE INDEX IF NOT EXISTS outreach_decision_idx ON outreach_events (decision)"),
  ]);
}

export async function sha256(value: ArrayBuffer | string) {
  const bytes = typeof value === "string" ? new TextEncoder().encode(value) : value;
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function semanticVector(text: string, dimensions = 24) {
  const vector = Array.from({ length: dimensions }, () => 0);
  const tokens = text.toLowerCase().match(/[a-z0-9]+/g) ?? [];
  for (const token of tokens) {
    let hash = 2166136261;
    for (let index = 0; index < token.length; index += 1) {
      hash ^= token.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    const slot = Math.abs(hash) % dimensions;
    vector[slot] += 1 + Math.min(1.5, token.length / 10);
  }
  const norm = Math.sqrt(vector.reduce((sum, value) => sum + value ** 2, 0)) || 1;
  return vector.map((value) => value / norm);
}

export function cosine(left: number[], right: number[]) {
  return left.reduce((sum, value, index) => sum + value * (right[index] ?? 0), 0);
}

