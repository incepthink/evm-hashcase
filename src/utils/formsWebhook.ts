/**
 * Server-only helpers for the marketing-site forms (contact + careers).
 * Submissions are forwarded to FORMS_WEBHOOK_URL (e.g. an n8n / Zapier / Make webhook),
 * which is responsible for emailing or storing them.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isEmail = (v: string) => EMAIL_RE.test(v);

/** Trimmed string value, capped at `max` characters; "" for anything else. */
export function text(v: unknown, max = 500): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export const jsonError = (message: string, status: number) =>
  Response.json({ ok: false, error: message }, { status });

export const jsonOk = () => Response.json({ ok: true });

/** POSTs JSON or multipart form data to the webhook. Returns a Response to send back to the browser. */
export async function forwardToWebhook(body: Record<string, string> | FormData): Promise<Response> {
  const url = process.env.FORMS_WEBHOOK_URL;
  if (!url) {
    console.error("[forms] FORMS_WEBHOOK_URL is not set — submission dropped", body instanceof FormData ? "(multipart)" : body.form);
    return jsonError("Form delivery is not configured.", 503);
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      ...(body instanceof FormData
        ? { body }
        : { body: JSON.stringify(body), headers: { "Content-Type": "application/json" } }),
      cache: "no-store",
    });
    if (!res.ok) {
      console.error("[forms] webhook responded", res.status);
      return jsonError("Could not deliver the form.", 502);
    }
    return jsonOk();
  } catch (err) {
    console.error("[forms] webhook request failed", err);
    return jsonError("Could not deliver the form.", 502);
  }
}
