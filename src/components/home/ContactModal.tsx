"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import { cn } from "@/components/lib/utils";
import { CONTACT_EMAIL, CONTACT_HREF } from "./content";
import { ArrowRight, Check, CloseIcon, Lock } from "./icons";

const DEPLOYMENTS = ["Not sure yet", "On-premises", "Private cloud", "VPC", "Air-gapped"];
const TIMELINES = ["Exploring", "Within 3 months", "Within 6 months", "Have a tender / RFP"];

const STEPS = [
  { title: "A discovery call", body: "We map your outcomes, data sources and constraints." },
  { title: "Models benchmarked", body: "We compare candidate models for quality, latency and cost." },
  { title: "A deployment plan", body: "Architecture and rollout inside your infrastructure." },
];

const HASH = "#contact";

const label = "flex flex-col gap-1.5";
const labelText = "text-[13px] font-semibold";
const field =
  "hc-field rounded-xl border border-[#0E1116]/[.12] bg-white/75 px-[15px] py-[13px] text-[15px] text-[#0E1116]";

type Status = "idle" | "sending" | "sent" | "error";

/**
 * "Evaluate your use case" modal. Opens whenever the URL hash is #contact,
 * so any plain <a href="#contact"> on the page opens it.
 */
export default function ContactModal() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    const sync = () => {
      const d = dialogRef.current;
      if (!d || d.open || window.location.hash !== HASH) return;
      d.showModal();
      setOpen(true);
      firstFieldRef.current?.focus();
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = prev;
    };
  }, [open]);

  const close = useCallback(() => dialogRef.current?.close(), []);

  // Fires for Esc, the close button and backdrop clicks alike.
  const handleClose = () => {
    setOpen(false);
    setStatus((s) => (s === "sent" ? "idle" : s));
    if (window.location.hash === HASH) {
      window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search);
    }
  };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(String(res.status));
      form.reset();
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="contact-title"
      onClose={handleClose}
      className="hc-dialog fixed inset-0 m-0 h-full max-h-none w-full max-w-none overflow-y-auto bg-transparent p-0 text-[#0E1116]"
    >
      <div
        className="relative flex min-h-full items-center justify-center p-3 sm:p-8"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) close();
        }}
      >
        <div aria-hidden="true" className="pointer-events-none fixed left-[22%] top-[18%] h-[420px] w-[420px] rounded-full bg-[#8B4DFF] opacity-55 blur-[90px]" />
        <div aria-hidden="true" className="pointer-events-none fixed bottom-[10%] right-[20%] h-[420px] w-[460px] rounded-full bg-[#1A6DFF] opacity-50 blur-[100px]" />

        <div className="hc-pop relative grid w-full max-w-[1040px] overflow-hidden rounded-[24px] border border-white/70 bg-white/[.72] shadow-[inset_0_1px_0_rgba(255,255,255,.9),0_50px_100px_-30px_rgba(0,0,0,.5)] backdrop-blur-[28px] backdrop-saturate-[1.7] sm:rounded-[32px] md:grid-cols-[380px_minmax(0,1fr)]">
          <aside className="relative hidden flex-col gap-[26px] overflow-hidden border-r border-white/70 bg-[#E6EEFF]/60 px-9 py-10 text-[#0B2A66] md:flex">
            <div
              aria-hidden="true"
              className="absolute -bottom-[50px] -right-[60px] h-[260px] w-[260px] bg-contain bg-no-repeat opacity-[.14]"
              style={{ backgroundImage: "url('/landing/hashcase-k.png')" }}
            />
            <Image src="/landing/hashcase-logo.png" alt="HashCase" width={640} height={120} className="relative h-6 w-auto self-start" />
            <span className="hc-d relative text-2xl font-extrabold">What happens next</span>
            <ol className="relative m-0 flex list-none flex-col gap-5 p-0">
              {STEPS.map((s, i) => (
                <li key={s.title} className="flex gap-3.5">
                  <span className="hc-d flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px] bg-[#0E1116] font-extrabold text-[#9EC0FF]">
                    {i + 1}
                  </span>
                  <span className="flex flex-col gap-1">
                    <span className="text-[17px] font-bold">{s.title}</span>
                    <span className="text-sm leading-normal text-[#1D3F80]">{s.body}</span>
                  </span>
                </li>
              ))}
            </ol>
            <p className="relative m-0 mt-auto flex items-center gap-2.5 text-sm font-semibold">
              <Lock /> Happy to sign an NDA first.
            </p>
          </aside>

          <div className="relative flex flex-col gap-5 px-5 py-7 sm:px-10 sm:py-9">
            <button
              type="button"
              aria-label="Close"
              onClick={close}
              className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-[#E3E4E8] bg-white sm:right-5 sm:top-5"
            >
              <CloseIcon />
            </button>

            {status === "sent" ? (
              <div role="status" className="flex min-h-[420px] flex-col justify-center gap-4 pr-0 sm:min-h-[520px] sm:pr-10">
                <span className="flex h-[60px] w-[60px] items-center justify-center rounded-[18px] bg-[#EEF4FF] text-[#1A4FC0]">
                  <Check size={28} strokeWidth={2} />
                </span>
                <h2 id="contact-title" className="hc-d m-0 text-[34px] font-extrabold leading-none tracking-[-0.03em] sm:text-[40px]">
                  We&apos;re on it.
                </h2>
                <p className="m-0 max-w-[460px] text-[17px] leading-[1.55] text-[#3D4350]">
                  Thanks — someone from our team will reach out to schedule your discovery call. Meanwhile, see how
                  we&apos;ve done it for others.
                </p>
                <div className="flex flex-wrap gap-2.5">
                  <a
                    href="/#cases"
                    onClick={close}
                    className="rounded-full bg-[#0E1116] px-5 py-3.5 font-semibold text-white hover:text-white"
                  >
                    See case studies
                  </a>
                  <button
                    type="button"
                    onClick={() => setStatus("idle")}
                    className="rounded-full border border-[#D8D9DE] bg-white px-5 py-3.5 text-[15px] font-semibold"
                  >
                    Send another
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-2 pr-[50px]">
                  <h2 id="contact-title" className="hc-d m-0 text-[30px] font-extrabold leading-none tracking-[-0.03em] sm:text-4xl">
                    Evaluate your use case
                  </h2>
                  <p className="m-0 text-[15px] leading-normal text-[#3D4350]">
                    Tell us what you want AI to do. We&apos;ll come back to you by email.
                  </p>
                </div>

                <form onSubmit={submit} className="flex flex-col gap-4">
                  {/* Honeypot: hidden from people, filled in by bots. */}
                  <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

                  <div className="grid gap-3.5 sm:grid-cols-2">
                    <label className={label}>
                      <span className={labelText}>Name</span>
                      <input ref={firstFieldRef} name="name" type="text" required autoComplete="name" placeholder="Full name" className={field} />
                    </label>
                    <label className={label}>
                      <span className={labelText}>Email</span>
                      <input name="email" type="email" required autoComplete="email" placeholder="you@organisation.com" className={field} />
                    </label>
                    <label className={label}>
                      <span className={labelText}>Organisation</span>
                      <input name="organisation" type="text" required autoComplete="organization" placeholder="Company or department" className={field} />
                    </label>
                    <label className={label}>
                      <span className={labelText}>Role</span>
                      <input name="role" type="text" autoComplete="organization-title" placeholder="Your role" className={field} />
                    </label>
                  </div>

                  <label className={label}>
                    <span className={labelText}>What should AI do for you?</span>
                    <textarea
                      name="message"
                      required
                      rows={3}
                      placeholder="e.g. Draft Marathi press releases from official notes, score 5M business records, monitor brand sentiment…"
                      className={cn(field, "resize-y leading-normal")}
                    />
                  </label>

                  <div className="grid gap-3.5 sm:grid-cols-2">
                    <label className={label}>
                      <span className={labelText}>Where should it run?</span>
                      <select name="deployment" className={cn(field, "bg-white")}>
                        {DEPLOYMENTS.map((d) => (
                          <option key={d}>{d}</option>
                        ))}
                      </select>
                    </label>
                    <label className={label}>
                      <span className={labelText}>Timeline</span>
                      <select name="timeline" className={cn(field, "bg-white")}>
                        {TIMELINES.map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                    </label>
                  </div>

                  {status === "error" && (
                    <p role="alert" className="m-0 rounded-xl bg-[#FFE9EA] px-4 py-3 text-sm text-[#A3141A]">
                      Something went wrong sending your request. Please try again, or email us at{" "}
                      <a href={CONTACT_HREF} className="font-semibold text-[#A3141A] underline">
                        {CONTACT_EMAIL}
                      </a>
                      .
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className="hc-btn mt-1 flex items-center justify-center gap-2.5 rounded-full bg-[#0E1116] px-[22px] py-4 text-base font-semibold text-white disabled:cursor-wait disabled:opacity-70"
                  >
                    {status === "sending" ? "Sending…" : "Evaluate my use case"}
                    <ArrowRight strokeWidth={2} className="text-[#9EC0FF]" />
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </dialog>
  );
}
