import { RESUME_ACCEPT, RESUME_MAX_BYTES } from "@/components/home/careers";
import { forwardToWebhook, isEmail, jsonError, jsonOk, text } from "@/utils/formsWebhook";

const ALLOWED_EXT = RESUME_ACCEPT.split(",");

/** Job applications (multipart, with the resume attached). */
export async function POST(req: Request) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return jsonError("Invalid request.", 400);
  }

  // Honeypot field — pretend success so bots move on.
  if (text(form.get("website"))) return jsonOk();

  const fields = {
    form: "careers",
    submittedAt: new Date().toISOString(),
    role: text(form.get("role"), 200),
    name: text(form.get("name"), 200),
    email: text(form.get("email"), 200),
    phone: text(form.get("phone"), 50),
    location: text(form.get("location"), 200),
    linkedin: text(form.get("linkedin"), 300),
    portfolio: text(form.get("portfolio"), 300),
    experience: text(form.get("experience"), 20),
    notice: text(form.get("notice"), 50),
    shipped: text(form.get("shipped"), 5000),
    consent: text(form.get("consent"), 10),
  };

  if (!fields.role || !fields.name || !fields.location || !fields.shipped || !isEmail(fields.email)) {
    return jsonError("Please fill in all required fields.", 400);
  }
  if (fields.consent !== "yes") {
    return jsonError("Consent is required to process your application.", 400);
  }

  const resume = form.get("resume");
  if (!(resume instanceof File) || resume.size === 0) {
    return jsonError("Please attach your resume.", 400);
  }
  const ext = resume.name.slice(resume.name.lastIndexOf(".")).toLowerCase();
  if (!ALLOWED_EXT.includes(ext)) return jsonError("Resume must be a PDF, DOC or DOCX file.", 400);
  if (resume.size > RESUME_MAX_BYTES) return jsonError("Resume is too large.", 413);

  const out = new FormData();
  for (const [k, v] of Object.entries(fields)) out.append(k, v);
  out.append("resume", resume, resume.name);

  return forwardToWebhook(out);
}
