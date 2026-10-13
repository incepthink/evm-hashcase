import { cn } from "@/components/lib/utils";
import { Lock } from "./icons";

function Chips({ items, className }: { items: string[]; className: string }) {
  return (
    <div className="mt-auto flex flex-wrap gap-1.5">
      {items.map((t) => (
        <span key={t} className={cn("rounded-full px-2.5 py-[5px] text-xs", className)}>
          {t}
        </span>
      ))}
    </div>
  );
}

const MODEL_TILES = [
  { name: "Llama", h: "h-[104px]", kind: "open" },
  { name: "Qwen", h: "h-[134px]", kind: "best" },
  { name: "DeepSeek", h: "h-[116px]", kind: "open" },
  { name: "Mistral", h: "h-24", kind: "open" },
  { name: "+ more", h: "h-[86px]", kind: "more" },
] as const;

const FILE_TYPES = [
  { label: "PDF", bg: "#FFEDE6", color: "#9A3412" },
  { label: "XLSX", bg: "#E8F6EF", color: "#0E5C3E" },
  { label: "SQL", bg: "#EEF4FF", color: "#163E8C" },
];

const SCORES = [
  { label: "Quality", value: "A+" },
  { label: "Latency", value: "Fast" },
  { label: "Cost", value: "Low" },
  { label: "Reliability", value: "High" },
];

const card = "hc-lift flex flex-col rounded-[28px] col-span-12";

export default function Capabilities() {
  return (
    <section className="relative z-[2] mx-auto max-w-[1280px] px-4 pb-24 sm:px-8 lg:pb-[140px]">
      <h2 className="hc-d mx-auto mb-14 max-w-[900px] text-center text-[30px] font-extrabold leading-[1.04] tracking-[-0.035em] [text-wrap:balance] sm:text-[44px] lg:text-[56px] lg:leading-[1.02]">
        Everything you need to build, deploy and scale AI in your environment.
      </h2>

      <div className="grid grid-cols-12 gap-4">
        {/* Multi-model */}
        <div className={cn(card, "relative gap-2 overflow-hidden bg-[#0E1116] p-[22px] text-white sm:gap-[26px] sm:p-8 lg:col-span-7")}>
          <div aria-hidden="true" className="absolute -right-10 -top-10 h-[140px] w-[200px] bg-gradient-to-r from-[#8B4DFF] to-[#1A6DFF] opacity-40 blur-[60px] sm:-right-[60px] sm:-top-20 sm:h-[280px] sm:w-[420px] sm:opacity-35 sm:blur-[90px]" />
          <div className="relative flex flex-wrap items-end justify-between gap-2 sm:gap-4">
            <h3 className="hc-d m-0 text-[21px] font-extrabold tracking-[-0.02em] sm:text-[28px]">Multi-Model Support</h3>
            <p className="m-0 max-w-[330px] text-sm leading-normal text-[#B7BECB] sm:text-base">
              The best model for every task<span className="sm:hidden"> — open-source and proprietary.</span>
              <span className="hidden sm:inline">. Support for leading open-source and proprietary models.</span>
            </p>
          </div>
          <div aria-hidden="true" className="relative hidden grid-cols-5 items-end gap-2.5 sm:grid">
            {MODEL_TILES.map((m) => (
              <div
                key={m.name}
                className={cn(
                  "box-border flex flex-col rounded-[18px] p-3.5",
                  m.h,
                  m.kind === "more" ? "justify-end border-[1.5px] border-dashed border-white/25" : "justify-between",
                  m.kind === "best" && "bg-[linear-gradient(160deg,#8B4DFF,#1A6DFF)] shadow-[0_20px_40px_-16px_rgba(26,109,255,.7)]",
                  m.kind === "open" && "border border-white/[.16] bg-white/[.07] backdrop-blur-[14px]",
                )}
              >
                {m.kind !== "more" && (
                  <span className={cn("hc-m text-[10px]", m.kind === "open" && "text-[#A9B0BE]")}>
                    {m.kind === "best" ? "best fit ✓" : "open"}
                  </span>
                )}
                <span className={cn("hc-d text-[17px] font-bold", m.kind === "more" && "text-[#A9B0BE]")}>{m.name}</span>
              </div>
            ))}
          </div>
          <div className="relative mt-1.5 flex flex-wrap gap-1.5 sm:hidden">
            {MODEL_TILES.filter((m) => m.kind !== "more").map((m) => (
              <span
                key={m.name}
                className={cn(
                  "rounded-full px-2.5 py-[5px] text-xs",
                  m.kind === "best" ? "bg-gradient-to-r from-[#8B4DFF] to-[#1A6DFF]" : "bg-white/10",
                )}
              >
                {m.name}
              </span>
            ))}
          </div>
          <div className="relative hidden flex-wrap gap-2 sm:flex">
            {["Open-source", "Proprietary", "SLMs", "Fine-tuned"].map((t) => (
              <span key={t} className="rounded-full bg-white/10 px-3 py-1.5 text-[13px]">
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Your data */}
        <div className={cn(card, "min-h-[300px] gap-[18px] border border-[#E3E4E8] bg-white p-8 lg:col-span-5")}>
          <div className="flex flex-col gap-2">
            <h3 className="hc-d m-0 text-[28px] font-extrabold tracking-[-0.02em]">Your Data, Your Control</h3>
            <p className="m-0 text-base leading-normal text-[#3D4350]">
              Connect internal data sources securely — databases, documents, APIs and enterprise systems.
            </p>
          </div>
          <div aria-hidden="true" className="flex items-center gap-2">
            {FILE_TYPES.map((f) => (
              <span key={f.label} className="hc-m rounded-[10px] px-2.5 py-2 text-[11px]" style={{ background: f.bg, color: f.color }}>
                {f.label}
              </span>
            ))}
            <span className="hc-dash-h h-0.5 flex-1" />
            <span className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#0E1116] text-[#9EC0FF]">
              <Lock size={20} />
            </span>
          </div>
          <div className="mt-auto flex flex-wrap gap-2">
            {["RAG", "Structured data", "Unstructured data", "Real-time integrations"].map((t) => (
              <span key={t} className="rounded-full bg-[#F2F2EF] px-3 py-1.5 text-[13px]">
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Security */}
        <div
          className={cn(card, "min-h-[290px] gap-3.5 p-[30px] md:col-span-6 lg:col-span-4")}
          style={{
            backgroundColor: "#E8F6EF",
            backgroundImage: "radial-gradient(rgba(14,92,62,.14) 1.2px, transparent 1.2px)",
            backgroundSize: "16px 16px",
          }}
        >
          <svg width="56" height="64" viewBox="0 0 56 64" aria-hidden="true">
            <path d="M28 3l22 8v17c0 15-9.5 26-22 32C15.5 54 6 43 6 28V11z" fill="#FFFFFF" stroke="#0E5C3E" strokeWidth="2.5" strokeLinejoin="round" />
            <path d="M19 32l6 6 12-12" stroke="#12A36B" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <h3 className="hc-d m-0 text-2xl font-extrabold tracking-[-0.02em] text-[#0A3D29]">Enterprise-Grade Security</h3>
          <p className="m-0 text-[15px] leading-normal text-[#134D36]">
            Built for regulated environments with full data privacy, access control and auditability.
          </p>
          <Chips items={["On-premises", "VPC", "SSO", "Audit logs", "Encryption"]} className="bg-white text-[#0A3D29]" />
        </div>

        {/* Workflows */}
        <div className={cn(card, "min-h-[290px] gap-3.5 border border-[#E3E4E8] bg-white p-[30px] md:col-span-6 lg:col-span-4")}>
          <div aria-hidden="true" className="hc-m grid grid-cols-2 gap-2 text-center text-[11px]">
            <span className="rounded-[10px] bg-[#F2F2EF] p-2.5">trigger</span>
            <span className="rounded-[10px] bg-[#F1ECFF] p-2.5 text-[#4A23B0]">agent</span>
            <span className="rounded-[10px] bg-[#EEF4FF] p-2.5 text-[#163E8C]">tools</span>
            <span className="rounded-[10px] bg-[#0E1116] p-2.5 text-white">output ✓</span>
          </div>
          <h3 className="hc-d m-0 text-2xl font-extrabold tracking-[-0.02em]">Custom AI Workflows</h3>
          <p className="m-0 text-[15px] leading-normal text-[#3D4350]">
            Go beyond chat: workflows with tools, business logic and integrations tailored to your use case.
          </p>
          <Chips items={["Agents", "Tools & integrations", "Automations"]} className="bg-[#F2F2EF]" />
        </div>

        {/* Evaluation */}
        <div className={cn(card, "min-h-[290px] gap-3.5 bg-[#F1ECFF] p-[30px] lg:col-span-4")}>
          <h3 className="hc-d m-0 text-2xl font-extrabold tracking-[-0.02em] text-[#24135E]">Model Evaluation &amp; Benchmarking</h3>
          <p className="m-0 text-[15px] leading-normal text-[#3F2A85]">
            Compare models on your data for quality, cost, latency and reliability.
          </p>
          <div className="mt-auto grid grid-cols-2 gap-2">
            {SCORES.map((s) => (
              <div key={s.label} className="flex flex-col gap-0.5 rounded-[14px] bg-white p-3">
                <span className="text-xs text-[#5B3BC4]">{s.label}</span>
                <span className="hc-d text-[22px] font-extrabold text-[#24135E]">{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Government */}
        <div className={cn(card, "min-h-[280px] gap-3.5 bg-[#FFF1E8] p-[30px] lg:col-span-6")}>
          <h3 className="hc-d m-0 text-2xl font-extrabold tracking-[-0.02em] text-[#5C1E05]">Built for Government</h3>
          <p className="m-0 text-[15px] leading-normal text-[#7A2E0E]">
            Public-sector compliance, sovereign infrastructure and domain-specific use cases — in Indian languages.
          </p>
          <Chips
            items={["Data sovereignty", "Regulatory compliance", "Multi-department", "मराठी · हिंदी · English"]}
            className="bg-white text-[#5C1E05]"
          />
        </div>

        {/* Deployment */}
        <div className={cn(card, "min-h-[280px] gap-3.5 bg-[#EEF4FF] p-[30px] md:col-span-6 lg:col-span-3")}>
          <h3 className="hc-d m-0 text-2xl font-extrabold tracking-[-0.02em] text-[#0B2A66]">Scalable Deployment</h3>
          <div className="mt-auto flex flex-col gap-1.5">
            {["Kubernetes", "GPU nodes", "Air-gapped"].map((t) => (
              <div key={t} className="flex items-center justify-between rounded-xl bg-white px-3 py-2.5 text-[13px] font-semibold text-[#0B2A66]">
                {t}
                <span aria-hidden="true" className="relative h-4 w-[26px] rounded-[9px] bg-[#1A6DFF]">
                  <span className="absolute right-0.5 top-0.5 h-3 w-3 rounded-full bg-white" />
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Monitoring */}
        <div className={cn(card, "min-h-[280px] gap-3 border border-[#E3E4E8] bg-white p-[30px] md:col-span-6 lg:col-span-3")}>
          <h3 className="hc-d m-0 text-2xl font-extrabold tracking-[-0.02em]">Monitor, Improve, Evolve</h3>
          <p className="m-0 text-sm leading-normal text-[#3D4350]">Switch to better models as they emerge.</p>
          <svg viewBox="0 0 200 70" className="mt-auto h-[70px] w-full" aria-hidden="true">
            <path d="M0 60 C 25 56, 40 46, 65 48 S 105 30, 130 32" stroke="#AEB3C2" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M130 32 C 150 30, 165 12, 200 6" stroke="#1A6DFF" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <circle cx="130" cy="32" r="5" fill="#FFFFFF" stroke="#1A6DFF" strokeWidth="2.5" />
          </svg>
          <span className="hc-m self-start rounded-lg bg-[#E8F6EF] px-[9px] py-[5px] text-[11px] text-[#0E5C3E]">
            ↑ new model deployed
          </span>
        </div>
      </div>
    </section>
  );
}
