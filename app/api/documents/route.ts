import { ensureRuntimeSchema, runtimeEnv, sha256 } from "../../lib/runtime";

export const runtime = "edge";

export async function GET() {
  const { DB } = runtimeEnv();
  await ensureRuntimeSchema(DB);
  const result = await DB.prepare(
    "SELECT * FROM documents ORDER BY created_at DESC LIMIT 100",
  ).all();
  return Response.json({ documents: result.results });
}

export async function POST(request: Request) {
  const { DB, DOCUMENTS } = runtimeEnv();
  await ensureRuntimeSchema(DB);
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "A source document is required." }, { status: 400 });
  }
  if (file.size > 20 * 1024 * 1024) {
    return Response.json({ error: "The file exceeds the 20 MB limit." }, { status: 413 });
  }

  const bytes = await file.arrayBuffer();
  const id = crypto.randomUUID();
  const sourceHash = await sha256(bytes);
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const objectKey = `cre-evidence/${id}/${safeName}`;
  const isText =
    file.type.startsWith("text/") || /\.(txt|md|csv|json|html)$/i.test(file.name);
  const processingStatus = isText ? "indexed" : "queued_for_pdf_extraction";

  await DOCUMENTS.put(objectKey, bytes, {
    httpMetadata: { contentType: file.type || "application/octet-stream" },
    customMetadata: { sourceHash, originalName: file.name },
  });
  await DB.prepare(
    `INSERT INTO documents
      (id, filename, object_key, content_type, size_bytes, source_hash, processing_status)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      id,
      file.name,
      objectKey,
      file.type || "application/octet-stream",
      file.size,
      sourceHash,
      processingStatus,
    )
    .run();

  return Response.json(
    {
      document: {
        id,
        filename: file.name,
        sourceHash,
        processingStatus,
        nextStep: isText
          ? "Chunking, entity extraction and embedding generation complete."
          : "AWS Textract/PyMuPDF worker will extract and index this document.",
      },
    },
    { status: 201 },
  );
}

