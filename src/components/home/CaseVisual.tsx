import { cn } from "@/components/lib/utils";
import type { CaseVisual } from "./content";
import { ArrowRight } from "./icons";

const COMPILER_OUTPUT = `{
  "step": 4,
  "heat": { "stage": "saute", "temp_c": 160 },
  "stir": { "rpm": 40, "reverse": true },
  "scale": { "prompt": "tofu", "g": 400 },
  "safety": { "dry_run_lock": true }
}`;

const FUNNEL = [
  { label: "Raw KYB records", value: "5,000,000", width: "100%" },
  { label: "Rule pre-filter", value: "~500,000", width: "86%" },
  { label: "Vector similarity", value: "~100,000", width: "72%" },
  { label: "AI-scored tiers", value: "T1–T4", width: "58%", dark: true },
];

const SENTIMENT = [
  { label: "Bullish", width: "62%", color: "#12A36B" },
  { label: "Neutral", width: "40%", color: "#AEB3C2" },
  { label: "Bearish", width: "28%", color: "#1A6DFF" },
  { label: "Panic / FUD", width: "14%", color: "#E5484D" },
];

const LAND_RECORDS = [
  { doc: "7/12 extract", ok: true },
  { doc: "Property card", ok: true },
  { doc: "Tax receipts", ok: false },
  { doc: "Index II", ok: true },
];

/** The small illustration for each case, drawn on the case's accent tint. */
export default function CaseVisualPanel({ kind }: { kind: CaseVisual }) {
  switch (kind) {
    case "axis":
      return (
        <div className="flex flex-col items-center gap-2">
          {FUNNEL.map((f) => (
            <div
              key={f.label}
              className={cn(
                "box-border flex justify-between gap-3 rounded-xl px-3.5 py-[11px]",
                f.dark ? "bg-[#0E1116] text-white" : "bg-white",
              )}
              style={{ width: f.width }}
            >
              <span className="text-[13px] font-semibold">{f.label}</span>
              <span className="hc-m text-[13px]">{f.value}</span>
            </div>
          ))}
        </div>
      );
    case "mexc":
      return (
        <>
          <div className="flex flex-wrap gap-1.5">
            {["X", "Telegram", "Discord", "Reddit"].map((s) => (
              <span key={s} className="hc-m rounded-lg bg-white px-[9px] py-[5px] text-[11px]">
                {s}
              </span>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            {SENTIMENT.map((s, i) => (
              <div key={s.label} className="grid grid-cols-[92px_minmax(0,1fr)] items-center gap-2.5">
                <span className="text-[13px] font-semibold">{s.label}</span>
                <span
                  className="h-2.5 rounded-md"
                  style={{ width: s.width, background: s.color, animation: `hc-grow 1s ease-out ${i * 0.1}s both` }}
                />
              </div>
            ))}
          </div>
          <span className="flex items-center gap-1.5 self-start rounded-full bg-[#FFE9EA] px-2.5 py-1.5 text-xs font-semibold text-[#A3141A]">
            <span className="h-1.5 w-1.5 animate-[hc-blink_1s_infinite] rounded-full bg-[#E5484D]" />
            FUD spike alert sent to Slack
          </span>
        </>
      );
    case "upl":
      return (
        <>
          <span className="text-[13px] text-[#3D4350]">&ldquo;Make it low-carb, swap paneer for tofu, serve 4&rdquo;</span>
          <pre className="hc-m m-0 overflow-x-auto whitespace-pre rounded-[14px] bg-[#0E1116] px-4 py-3.5 text-xs leading-[1.7] text-[#C9CFDA]">
            {COMPILER_OUTPUT}
          </pre>
        </>
      );
    case "dgipr":
      return (
        <div className="grid grid-cols-[minmax(0,1fr)_24px_minmax(0,1fr)] items-center gap-2">
          <div className="flex flex-col gap-2 rounded-[14px] bg-white p-3.5">
            <span className="hc-m text-[10px] text-[#6B7080]">official-note.pdf</span>
            {["90%", "75%", "82%"].map((w) => (
              <span key={w} className="h-1.5 rounded bg-[#E3E4E8]" style={{ width: w }} />
            ))}
          </div>
          <ArrowRight size={24} className="text-[#0E1116]" />
          <div lang="mr" className="flex flex-col gap-1.5 rounded-[14px] bg-[#0E1116] p-3.5 text-white">
            <span className="text-base font-bold">महासंवाद</span>
            <span className="text-xs leading-normal text-[#C9CFDA]">प्रकाशनासाठी तयार लेख आणि पोस्टर</span>
          </div>
        </div>
      );
    case "rev":
      return (
        <>
          <div className="flex flex-col gap-1.5">
            {LAND_RECORDS.map((r) => (
              <div key={r.doc} className="flex justify-between rounded-[10px] bg-white px-3 py-[9px] text-[13px]">
                <span>{r.doc}</span>
                <span className={cn("font-semibold", r.ok ? "text-[#0E7A4F]" : "text-[#9A5B00]")}>
                  {r.ok ? "✓ verified" : "! arrears found"}
                </span>
              </div>
            ))}
          </div>
          <span className="self-start rounded-full bg-[#0E1116] px-3 py-[7px] text-[13px] font-semibold text-white">
            Needs attention · 1 action for applicant
          </span>
        </>
      );
    default:
      return null;
  }
}
