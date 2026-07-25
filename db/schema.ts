import { sql } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const properties = sqliteTable("properties", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  market: text("market").notNull(),
  assetType: text("asset_type").notNull(),
  askingPrice: integer("asking_price"),
  areaSqft: integer("area_sqft"),
  occupancy: real("occupancy"),
  capRate: real("cap_rate"),
  opportunityScore: integer("opportunity_score").notNull(),
  latitude: real("latitude"),
  longitude: real("longitude"),
  attributes: text("attributes").notNull().default("{}"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const evidence = sqliteTable("evidence", {
  id: text("id").primaryKey(),
  propertyId: text("property_id"),
  title: text("title").notNull(),
  source: text("source").notNull(),
  sourceUri: text("source_uri"),
  sourceHash: text("source_hash").notNull(),
  locator: text("locator").notNull(),
  content: text("content").notNull(),
  embedding: text("embedding").notNull(),
  entities: text("entities").notNull().default("[]"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const graphEdges = sqliteTable("graph_edges", {
  id: text("id").primaryKey(),
  sourceType: text("source_type").notNull(),
  sourceId: text("source_id").notNull(),
  relationship: text("relationship").notNull(),
  targetType: text("target_type").notNull(),
  targetId: text("target_id").notNull(),
  confidence: real("confidence").notNull(),
  evidenceId: text("evidence_id"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const documents = sqliteTable("documents", {
  id: text("id").primaryKey(),
  filename: text("filename").notNull(),
  objectKey: text("object_key").notNull(),
  contentType: text("content_type").notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  sourceHash: text("source_hash").notNull(),
  processingStatus: text("processing_status").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const outreachEvents = sqliteTable("outreach_events", {
  id: text("id").primaryKey(),
  contactName: text("contact_name").notNull(),
  emailDomain: text("email_domain").notNull(),
  lawfulBasis: text("lawful_basis").notNull(),
  emailStatus: text("email_status").notNull(),
  action: text("action").notNull(),
  decision: text("decision").notNull(),
  reason: text("reason").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
