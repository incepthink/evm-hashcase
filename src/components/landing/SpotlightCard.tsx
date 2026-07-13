"use client";

import { useRef, useState } from "react";
import { cn } from "@/components/lib/utils";

type SpotlightCardProps = {
  children: React.ReactNode;
  className?: string;
};

/**
 * Glass card with a cursor-tracking radial highlight and a gradient border
 * that lights up on hover. The signature interaction of the landing page.
 */
export default function SpotlightCard({
  children,
  className,
}: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [active, setActive] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur",
        "transition-all duration-300 hover:-translate-y-1 hover:border-white/20",
        className,
      )}
    >
      {/* Cursor spotlight */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: active ? 1 : 0,
          background: `radial-gradient(340px circle at ${pos.x}px ${pos.y}px, rgba(124,92,255,0.16), rgba(34,211,238,0.08) 40%, transparent 65%)`,
        }}
      />
      {/* Gradient hairline on hover */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "linear-gradient(135deg, rgba(124,92,255,0.5), rgba(77,162,255,0.3), rgba(34,211,238,0.5))",
          WebkitMask:
            "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          padding: "1px",
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}
