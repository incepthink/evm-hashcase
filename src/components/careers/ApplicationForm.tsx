"use client";

import { useRef, useState, type DragEvent, type FormEvent } from "react";
import Link from "next/link";
import { cn } from "@/components/lib/utils";
import { RESUME_ACCEPT, RESUME_MAX_BYTES } from "@/components/home/careers";
import { CONTACT_EMAIL } from "@/components/home/content";
import { ArrowRight, Check } from "@/components/home/icons";

const label = "flex flex-col gap-2";
const labelText = "text-sm font-semibold";
const field = "hc-field rounded-[14px] border border-[#D8D9DE] bg-white px-4 py-3.5 text-[15px] text-[#0E1116]";
const grid = "grid gap-[18px] sm:grid-cols-2";

const MAX_MB = RESUME_MAX_BYTES / (1024 * 1024);
const ALLOWED = RESUME_ACCEPT.split(",");

function Req() {
  return (
    <span aria-hidden="true" className="text-[#C2336A]">
      *
    </span>
  );
}

function UploadIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M10 13V3M6 7l4-4 4 4M4 13v3h12v-3" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function resumeError(file: File | undefined) {
  if (!file) return "Please attach your resume.";
  const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
  if (!ALLOWED.includes(ext)) return "Resume must be a PDF, DOC or DOCX file.";
  if (file.size > RESUME_MAX_BYTES) return `Resume must be ${MAX_MB} MB or smaller.`;
  return "";
}

type Status = "idle" | "sending" | "sent" | "error";

export default function ApplicationForm({ roleTitle }: { roleTitle: string }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  const [fileError, setFileError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState<Status>("idle");

  const pickFile = (file: File | undefined) => {
    setFileName(file?.name ?? "");
    setFileError(file ? resumeError(file) : "");
  };

  const onDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragging(false);
    const input = fileRef.current;
    if (!input || e.dataTransfer.files.length === 0) return;
    input.files = e.dataTransfer.files;
    pickFile(input.files[0]);
  };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const err = resumeError(fileRef.current?.files?.[0]);
    if (err) {
      setFileError(err);
      fileRef.current?.focus();
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("/api/careers", { method: "POST", body: new FormData(form) });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <div role="status" className="flex max-w-[640px] flex-col gap-3.5 rounded-[28px] bg-[#DDF3E6] p-7 sm:p-10">
        <span className="flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-[#0E1116] text-[#9EC0FF]">
          <Check size={24} strokeWidth={2} />
        </span>
        <h2 className="hc-d m-0 text-[32px] font-extrabold text-[#0B3F2A]">Application received.</h2>
        <p className="m-0 text-[17px] leading-[1.55] text-[#164A33]">
          Thanks for applying for {roleTitle}. We&apos;ll get back to you by email.
        </p>
        <Link
          href="/careers"
          className="mt-1.5 self-start rounded-full border border-[#0B3F2A] px-[18px] py-[13px] text-[15px] font-semibold text-[#0B3F2A]"
        >
          Back to open positions
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex max-w-[760px] flex-col gap-[22px]">
      <input type="hidden" name="role" value={roleTitle} />
      {/* Honeypot: hidden from people, filled in by bots. */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

      <div className={grid}>
        <label className={label}>
          <span className={labelText}>
            Full name <Req />
          </span>
          <input name="name" type="text" required autoComplete="name" placeholder="Your name" className={field} />
        </label>
        <label className={label}>
          <span className={labelText}>
            Email <Req />
          </span>
          <input name="email" type="email" required autoComplete="email" placeholder="you@domain.com" className={field} />
        </label>
        <label className={label}>
          <span className={labelText}>Phone</span>
          <input name="phone" type="tel" autoComplete="tel" placeholder="+91" className={field} />
        </label>
        <label className={label}>
          <span className={labelText}>
            Current location <Req />
          </span>
          <input name="location" type="text" required autoComplete="address-level2" placeholder="City" className={field} />
        </label>
      </div>

      <div className="flex flex-col gap-2">
        <span id="resume-label" className={labelText}>
          Resume / CV <Req />
        </span>
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={cn(
            "flex cursor-pointer items-center gap-4 rounded-[18px] border-[1.5px] border-dashed bg-white p-5 transition-colors focus-within:outline focus-within:outline-2 focus-within:outline-offset-1 focus-within:outline-[#1A6DFF] sm:p-[22px]",
            dragging ? "border-[#1A6DFF] bg-[#EEF4FF]" : "border-[#AEB3C2]",
          )}
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#DDF3E6] text-[#0B5E3E]">
            <UploadIcon />
          </span>
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="truncate text-[15px] font-semibold">{fileName || "Upload a file or drag it here"}</span>
            <span className="text-[13px] text-[#5B6170]">
              {fileName ? "Click to choose a different file" : `PDF or DOCX, up to ${MAX_MB} MB`}
            </span>
          </span>
          <input
            ref={fileRef}
            name="resume"
            type="file"
            accept={RESUME_ACCEPT}
            aria-labelledby="resume-label"
            aria-describedby={fileError ? "resume-error" : undefined}
            onChange={(e) => pickFile(e.target.files?.[0])}
            className="sr-only"
          />
        </label>
        {fileError && (
          <span id="resume-error" role="alert" className="text-sm text-[#A3141A]">
            {fileError}
          </span>
        )}
      </div>

      <div className={grid}>
        <label className={label}>
          <span className={labelText}>LinkedIn</span>
          <input name="linkedin" type="text" inputMode="url" placeholder="linkedin.com/in/…" className={field} />
        </label>
        <label className={label}>
          <span className={labelText}>GitHub / portfolio</span>
          <input name="portfolio" type="text" inputMode="url" placeholder="github.com/…" className={field} />
        </label>
        <label className={label}>
          <span className={labelText}>Years of experience</span>
          <select name="experience" defaultValue="" className={field}>
            <option value="">Select…</option>
            <option>0–1</option>
            <option>1–3</option>
            <option>3–5</option>
            <option>5+</option>
          </select>
        </label>
        <label className={label}>
          <span className={labelText}>Notice period</span>
          <select name="notice" defaultValue="" className={field}>
            <option value="">Select…</option>
            <option>Immediate</option>
            <option>Up to 30 days</option>
            <option>30–60 days</option>
            <option>60+ days</option>
          </select>
        </label>
      </div>

      <label className={label}>
        <span className={labelText}>
          Show us something you&apos;ve shipped <Req />
        </span>
        <textarea
          name="shipped"
          required
          rows={5}
          placeholder="A system, model or product you built — what it did, and what was hard about it."
          className={cn(field, "resize-y leading-normal")}
        />
      </label>

      <label className="flex items-start gap-2.5 text-sm leading-normal text-[#3D4350]">
        <input name="consent" type="checkbox" required value="yes" className="mt-0.5 h-[18px] w-[18px] shrink-0 accent-[#1A6DFF]" />
        I agree to HashCase storing my application data for recruitment purposes.
      </label>

      {status === "error" && (
        <p role="alert" className="m-0 rounded-xl bg-[#FFE9EA] px-4 py-3 text-sm text-[#A3141A]">
          We couldn&apos;t send your application. Please try again, or email it to{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Application — ${roleTitle}`)}`}
            className="font-semibold text-[#A3141A] underline"
          >
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="hc-btn flex items-center gap-2.5 self-start rounded-full bg-[#0E1116] px-[26px] py-[17px] text-base font-semibold text-white disabled:cursor-wait disabled:opacity-70"
      >
        {status === "sending" ? "Sending…" : "Submit application"}
        <ArrowRight strokeWidth={2} className="text-[#9EC0FF]" />
      </button>
    </form>
  );
}
