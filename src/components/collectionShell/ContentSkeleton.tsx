"use client";

import { ShellTheme } from "./theme";

export type ContentVariant =
  | "nfts"
  | "quests"
  | "badges"
  | "points"
  | "detail";

interface ContentSkeletonProps {
  theme: ShellTheme;
  variant: ContentVariant;
}

/**
 * Shared, themed loading skeleton for the collection / event tab content
 * (NFTs, Quests, Badges, Points). Every variant uses the same outer container,
 * skeleton color (`theme.skeletonBlock`), border radius, animation and spacing
 * so all four tabs feel like one design system. The fixed `min-h-[70vh]` +
 * `py-10` shell matches the layouts' content wrapper, keeping heights stable so
 * switching tabs while loading never jumps the page or scroll position.
 *
 * The NFT card grid is the reference design; `quests` reuses it, while `badges`
 * and `points` mirror their real (table-based) layouts with the same tokens.
 */
export default function ContentSkeleton({ theme, variant }: ContentSkeletonProps) {
  const block = `${theme.skeletonBlock} animate-pulse`;

  // The detail / task pages use a narrower (max-w-4xl) column, so the skeleton
  // mirrors that width and the real layout (title → progress card → task rows)
  // to keep heights stable and avoid a jump when content arrives.
  if (variant === "detail") {
    return (
      <div
        className={`py-10 ${theme.loaderBg} min-h-[70vh] px-4 sm:px-6 lg:px-8`}
      >
        <div className="max-w-4xl mx-auto">
          <DetailSkeleton block={block} />
        </div>
      </div>
    );
  }

  return (
    <div className={`py-10 ${theme.loaderBg} min-h-[70vh] px-4 sm:px-6 lg:px-8`}>
      <div className="max-w-7xl mx-auto">
        {/* Centered title bar — present on every variant for a consistent header */}
        <div className="mb-8 flex justify-center">
          <div className={`h-9 w-56 rounded-md ${block}`} />
        </div>

        {variant === "nfts" || variant === "quests" ? (
          <CardGrid block={block} />
        ) : variant === "badges" ? (
          <BadgesSkeleton block={block} />
        ) : (
          <PointsSkeleton block={block} />
        )}
      </div>
    </div>
  );
}

/** 8-card responsive grid — the NFT reference design. */
function CardGrid({ block }: { block: string }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className={`h-64 rounded-xl ${block}`} />
      ))}
    </div>
  );
}

/** Stat pills + table rows — mirrors BadgesTable's header/stats/table layout. */
function BadgesSkeleton({ block }: { block: string }) {
  return (
    <>
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className={`h-10 rounded-full ${block}`} />
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={`h-14 rounded-xl ${block}`} />
        ))}
      </div>
    </>
  );
}

/**
 * Quest / task detail layout: centered title, a progress/reward card block and a
 * short stack of task rows — mirrors QuestDetailPageContent / TaskDetailPageContent.
 */
function DetailSkeleton({ block }: { block: string }) {
  return (
    <>
      {/* Centered title + subtitle */}
      <div className="mb-10 flex flex-col items-center gap-3">
        <div className={`h-8 w-64 rounded-md ${block}`} />
        <div className={`h-4 w-80 max-w-full rounded ${block}`} />
      </div>

      {/* Progress / reward card */}
      <div className={`h-40 rounded-xl mb-8 ${block}`} />

      {/* Task rows */}
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={`h-20 rounded-lg ${block}`} />
        ))}
      </div>
    </>
  );
}

/** Header block + leaderboard rows — mirrors LoyaltyCodesTable + LeaderboardTable. */
function PointsSkeleton({ block }: { block: string }) {
  return (
    <div className="space-y-6">
      <div className={`h-28 rounded-xl ${block}`} />
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={`h-14 rounded-xl ${block}`} />
        ))}
      </div>
    </div>
  );
}
