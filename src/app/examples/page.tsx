"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Work_Sans } from "next/font/google";
import { ArrowRight, Sparkles, Play, X } from "lucide-react";

const workSans = Work_Sans({ subsets: ["latin"] });

type Example = {
  slug: string;
  name: string;
  category: string;
  description: string;
  youtubeId?: string;
  poster?: string;
};

const EXAMPLES: Example[] = [
  {
    slug: "ip-royalties",
    name: "IP Royalties",
    category: "Finance",
    description: "Manage and track intellectual property royalty flows.",
    youtubeId: "hF9YDRBYJu0",
    poster: "/posters/IP-Royalties.png",
  },
  {
    slug: "digital-twins",
    name: "Digital Twins",
    category: "Asset Mgmt",
    description: "Tokenized digital representations of real-world assets.",
    youtubeId: "Bxvx-T4Iuko",
    poster: "/posters/Digital-Twins.png",
  },
  {
    slug: "governance-dao",
    name: "Governance DAO",
    category: "Governance",
    description: "On-chain governance and proposal management demo.",
    youtubeId: "1Bf4P8kEVZ4",
    poster: "/posters/Governance-DAO.png",
  },
  {
    slug: "tokenized-real-estate",
    name: "Tokenized Real Estate",
    category: "Real Estate",
    description: "Real estate ownership and investment workflows.",
    youtubeId: "_qJaIyasvlw",
    poster: "/posters/Tokenized-RealEstate.png",
  },
  {
    slug: "tokenized-data",
    name: "Tokenized Data",
    category: "Data",
    description: "Data asset ownership, licensing, and monetization.",
    youtubeId: "tcECTqOhXOo",
  },
  {
    slug: "medical-records",
    name: "Medical Records",
    category: "Healthcare",
    description: "Secure medical record access and ownership flows.",
    youtubeId: "TRLwHBxO5yA",
  },
  {
    slug: "luxury-passport",
    name: "Luxury Passport",
    category: "Authenticity",
    description: "Authenticity and ownership passport for luxury goods.",
    youtubeId: "17iBB5hTvEM",
    poster: "/posters/luxury-passport.png",
  },
  {
    slug: "edu-cred",
    name: "Edu Cred",
    category: "Education",
    description: "Verifiable education credentials and certificates.",
  },
  {
    slug: "fan-tokens",
    name: "Fan Tokens",
    category: "Community",
    description: "Community and fan engagement token experience.",
    youtubeId: "b-97kVHb4t4",
    poster: "/posters/Fan-Tokens.png",
  },
  {
    slug: "ecommerce",
    name: "Ecommerce",
    category: "Commerce",
    description: "Commerce flow with tokenized ownership or loyalty.",
  },
  {
    slug: "chog",
    name: "Chog",
    category: "Collectibles",
    description: "Branded collectible and community experience.",
  },
  {
    slug: "safty",
    name: "SAFTY",
    category: "Legal",
    description: "SAFT / token agreement workflow demo.",
    youtubeId: "PYgfZP3yTLo",
  },
];

export default function ExamplesPage() {
  return (
    <div className="bg-[#00041F] min-h-screen">
      {/* Hero */}
      <div className="relative overflow-hidden pt-24 pb-16 md:pt-32 md:pb-20">
        {/* Background layers */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(77,162,255,0.25),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(77,162,255,0.10),transparent_55%)]" />
          <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(to_right,rgba(255,255,255,0.35)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.35)_1px,transparent_1px)] bg-[size:40px_40px]" />
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
          <div
            className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          />
          <div
            className="absolute top-1/2 left-1/4 w-48 h-48 bg-cyan-500/15 rounded-full blur-2xl animate-pulse"
            style={{ animationDelay: "2s" }}
          />
        </div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
          <div className="text-center max-w-4xl mx-auto">
            {/* Label chip */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#4DA2FF]/10 border border-[#4DA2FF]/30 text-[#4DA2FF] text-sm font-semibold mb-6">
              <Sparkles className="w-4 h-4" />
              Live Demos
            </div>

            <h1
              className={`${workSans.className} text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-tight mb-6 drop-shadow-lg`}
            >
              HashCase{" "}
              <span className="text-transparent bg-clip-text bg-blue-500">
                Proof-of-Concept
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-white/80 leading-relaxed max-w-2xl mx-auto mb-8 px-2">
              Explore live integrations built on HashCase — from IP royalties to
              fan tokens. Each demo is a fully functional example you can
              inspect and build from.
            </p>

            {/* Feature dots */}
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-white/60">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-sm font-medium">Fully Functional</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"
                  style={{ animationDelay: "0.5s" }}
                />
                <span className="text-sm font-medium">12 Demos</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"
                  style={{ animationDelay: "1s" }}
                />
                <span className="text-sm font-medium">Blockchain Powered</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Card grid */}
      <section className="px-4 sm:px-6 md:px-8 lg:px-12 py-16 md:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {EXAMPLES.map((example) => (
              <ExampleCard key={example.slug} example={example} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function ExampleCard({ example }: { example: Example }) {
  const { slug, name, category, description, youtubeId, poster } = example;
  const [modalOpen, setModalOpen] = useState(false);
  const [posterOpen, setPosterOpen] = useState(false);

  return (
    <>
      <div
        className={`bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg hover:bg-white/15 hover:-translate-y-1 transition-all duration-200 p-6 flex flex-col gap-4${poster ? " cursor-pointer" : ""}`}
        onClick={() => poster && setPosterOpen(true)}
      >
        {/* Category badge */}
        <span className="w-fit bg-[#4DA2FF]/20 text-[#4DA2FF] text-xs font-semibold px-3 py-1 rounded-full">
          {category}
        </span>

        {/* Name */}
        <h2
          className={`${workSans.className} text-white font-bold text-lg leading-snug`}
        >
          {name}
        </h2>

        {/* Description */}
        <p className="text-white/70 text-sm leading-relaxed flex-1">
          {description}
        </p>

        {/* CTAs */}
        <div
          className="flex flex-wrap gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <Link
            target="_blank"
            href={`/examples/${slug}`}
            className="group inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#4DA2FF] to-[#7ab8ff] hover:from-[#3a8fef] hover:to-[#6aa7f0] text-black font-semibold text-sm shadow-[0_10px_30px_-10px_rgba(77,162,255,0.4)] transition-all duration-200"
          >
            Try it out
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          {youtubeId && (
            <button
              onClick={() => setModalOpen(true)}
              className="group inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/30 text-white/80 hover:bg-white/10 hover:text-white font-semibold text-sm transition-all duration-200"
            >
              <Play className="w-4 h-4 fill-current" />
              View Demo
            </button>
          )}
        </div>
      </div>

      {modalOpen && youtubeId && (
        <YouTubeModal videoId={youtubeId} onClose={() => setModalOpen(false)} />
      )}

      {posterOpen && poster && (
        <PosterModal
          src={poster}
          alt={name}
          onClose={() => setPosterOpen(false)}
        />
      )}
    </>
  );
}

function PosterModal({
  src,
  alt,
  onClose,
}: {
  src: string;
  alt: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white/70 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className="max-h-[80vh] w-full object-contain rounded-xl shadow-2xl"
        />
      </div>
    </div>
  );
}

function YouTubeModal({
  videoId,
  onClose,
}: {
  videoId: string;
  onClose: () => void;
}) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white/70 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>
        <div className="relative aspect-video w-full rounded-xl overflow-hidden shadow-2xl">
          {/* Loading placeholder */}
          <div
            className={`absolute inset-0 bg-[#00041F] flex items-center justify-center pointer-events-none transition-opacity duration-500 ${loaded ? "opacity-0" : "opacity-100"}`}
          >
            <div className="w-16 h-16 rounded-full bg-[#4DA2FF]/20 border border-[#4DA2FF]/40 flex items-center justify-center animate-pulse">
              <Play className="w-6 h-6 fill-[#4DA2FF] text-[#4DA2FF] ml-1" />
            </div>
          </div>
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onLoad={() => setLoaded(true)}
          />
        </div>
      </div>
    </div>
  );
}
