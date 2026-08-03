import { ensureRuntimeSchema, runtimeEnv } from "../../lib/runtime";

export const runtime = "edge";

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => ({}))) as {
    contactName?: string;
    email?: string;
    emailStatus?: string;
    lawfulBasis?: string;
    suppressed?: boolean;
    action?: string;
  };
  const reasons: string[] = [];
  if (!payload.contactName || !payload.email) reasons.push("contact details are incomplete");
  if (payload.emailStatus !== "verified") reasons.push("email is not verified");
  if (!["consent", "legitimate-interest-reviewed"].includes(payload.lawfulBasis ?? "")) {
    reasons.push("lawful basis has not been approved");
  }
  if (payload.suppressed) reasons.push("contact appears on the suppression list");

  const decision = reasons.length ? "held" : "human-review-required";
  const reason = reasons.length
    ? reasons.join("; ")
    : "All automated policy checks passed; a person must approve the message.";
  const id = crypto.randomUUID();

  const { DB } = await runtimeEnv();
  await ensureRuntimeSchema(DB);
  await DB.prepare(
    `INSERT INTO outreach_events
      (id, contact_name, email_domain, lawful_basis, email_status, action, decision, reason)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      id,
      payload.contactName ?? "Unknown",
      payload.email?.split("@")[1] ?? "unknown",
      payload.lawfulBasis ?? "unconfirmed",
      payload.emailStatus ?? "unknown",
      payload.action ?? "queue",
      decision,
      reason,
    )
    .run();

  return Response.json(
    {
      id,
      decision,
      reason,
      policy: {
        automatedSending: false,
        linkedInSources: "Authorised API or user-provided export only",
        regulations: ["UK GDPR", "PECR", "CAN-SPAM where applicable"],
      },
    },
    { status: decision === "held" ? 422 : 202 },
  );
}

