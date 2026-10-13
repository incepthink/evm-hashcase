import { forwardToWebhook, isEmail, jsonError, jsonOk, text } from "@/utils/formsWebhook";

/** "Evaluate your use case" modal submissions. */
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid request.", 400);
  }

  // Honeypot field — pretend success so bots move on.
  if (text(body.website)) return jsonOk();

  const lead = {
    form: "contact",
    submittedAt: new Date().toISOString(),
    name: text(body.name, 200),
    email: text(body.email, 200),
    organisation: text(body.organisation, 200),
    role: text(body.role, 200),
    message: text(body.message, 5000),
    deployment: text(body.deployment, 100),
    timeline: text(body.timeline, 100),
  };

  if (!lead.name || !lead.organisation || !lead.message || !isEmail(lead.email)) {
    return jsonError("Please fill in your name, a valid email, organisation and use case.", 400);
  }

  return forwardToWebhook(lead);
}
