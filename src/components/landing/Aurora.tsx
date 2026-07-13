import { cn } from "@/components/lib/utils";

/**
 * Shared page backdrop: slow-drifting blurred blobs, a faint grid, and a
 * vignette. CSS-only and fully inert — never intercepts pointer events.
 */
export default function Aurora({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
    >
      {/* Grid */}
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 30%, #000 40%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 60% at 50% 30%, #000 40%, transparent 100%)",
        }}
      />

      {/* Drifting blobs */}
      <div className="absolute -left-32 -top-40 h-[36rem] w-[36rem] rounded-full bg-brand-violet/20 blur-[128px] animate-aurora motion-reduce:animate-none" />
      <div
        className="absolute -right-40 top-0 h-[32rem] w-[32rem] rounded-full bg-brand-blue/20 blur-[128px] animate-aurora motion-reduce:animate-none"
        style={{ animationDelay: "-6s" }}
      />
      <div
        className="absolute bottom-0 left-1/3 h-[28rem] w-[28rem] rounded-full bg-brand-cyan/10 blur-[128px] animate-aurora motion-reduce:animate-none"
        style={{ animationDelay: "-12s" }}
      />

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(5,6,15,0.9)_100%)]" />
    </div>
  );
}
