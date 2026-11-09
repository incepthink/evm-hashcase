"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, CloseIcon, PlayCircle } from "@/components/home/icons";
import { POCS, type Poc } from "./pocs";

type Overlay = { kind: "video"; poc: Poc } | { kind: "poster"; poc: Poc } | null;

export default function PocGallery() {
  const [overlay, setOverlay] = useState<Overlay>(null);

  return (
    <>
      <ul className="m-0 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
        {POCS.map((poc) => (
          <li key={poc.slug}>
            <PocCard poc={poc} onOpen={setOverlay} />
          </li>
        ))}
      </ul>
      {overlay && <OverlayView overlay={overlay} onClose={() => setOverlay(null)} />}
    </>
  );
}

function PocCard({ poc, onOpen }: { poc: Poc; onOpen: (o: Overlay) => void }) {
  return (
    <article className="hc-lift flex h-full flex-col gap-4 rounded-[24px] border border-white/80 bg-white/75 p-6 backdrop-blur-[18px]">
      <div className="flex items-center justify-between gap-3">
        <span className="hc-m rounded-full bg-[#E6EEFF] px-2.5 py-1 text-[11px] text-[#1A4FC0]">{poc.category}</span>
        {poc.poster && (
          <button
            type="button"
            onClick={() => onOpen({ kind: "poster", poc })}
            className="text-[13px] font-medium text-[#5B6170] underline-offset-4 hover:text-[#0E1116] hover:underline"
          >
            Poster
          </button>
        )}
      </div>

      <h2 className="hc-d m-0 text-[24px] font-extrabold leading-[1.05] tracking-[-0.025em]">{poc.name}</h2>
      <p className="m-0 flex-1 text-[15px] leading-[1.55] text-[#3D4350]">{poc.description}</p>

      <div className="flex flex-wrap gap-2 pt-1">
        <a
          href={`/examples/${poc.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hc-btn flex items-center gap-2 rounded-full bg-[#0E1116] px-4 py-2.5 text-[14px] font-semibold text-white"
        >
          Try it live <ArrowRight size={14} />
        </a>
        {poc.youtubeId && (
          <button
            type="button"
            onClick={() => onOpen({ kind: "video", poc })}
            className="flex items-center gap-2 rounded-full border border-[#D8D9DE] bg-white px-4 py-2.5 text-[14px] font-semibold transition-colors hover:border-[#0E1116]"
          >
            <PlayCircle size={16} /> Watch demo
          </button>
        )}
      </div>
    </article>
  );
}

function OverlayView({ overlay, onClose }: { overlay: NonNullable<Overlay>; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const { poc } = overlay;
  const label = overlay.kind === "video" ? `${poc.name} demo video` : `${poc.name} poster`;

  // Portalled to <body> so it sits above the page header's stacking context.
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={label}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0E1116]/70 p-4 backdrop-blur-[3px]"
    >
      <div className="hc-pop relative w-full max-w-[960px]" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute -top-12 right-0 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#0E1116]"
        >
          <CloseIcon />
        </button>
        {overlay.kind === "video" ? (
          <div className="aspect-video w-full overflow-hidden rounded-[20px] bg-[#0E1116] shadow-2xl">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${poc.youtubeId}?autoplay=1`}
              title={label}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={poc.poster} alt={label} className="max-h-[82vh] w-full rounded-[20px] object-contain shadow-2xl" />
        )}
      </div>
    </div>,
    document.body,
  );
}
