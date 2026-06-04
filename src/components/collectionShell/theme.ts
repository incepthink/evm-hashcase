// Shared theme config for the collection / event page shell.
// Two variants keep the layouts visually distinct (collection = blue/white,
// event = dark/purple) while sharing all structural/UX code.

export interface ShellTheme {
  /** Root page background. */
  pageBg: string;
  /** Background behind the tab content area. */
  contentBg: string;
  /** Background of the sticky tab bar. */
  tabBarBg: string;
  /** Bottom border under the tab bar. */
  tabBarBorder: string;
  /** Active tab label color. */
  tabActive: string;
  /** Inactive tab label color. */
  tabInactive: string;
  /** Inactive tab hover color. */
  tabHover: string;
  /** Active tab underline color. */
  tabUnderline: string;
  /** Accent color (icon tints, links). */
  accentText: string;
  /** Spinner / loading accent border color. */
  spinnerBorder: string;
  /** Base color for skeleton placeholder blocks. */
  skeletonBlock: string;
  /** Background behind the tab-content loading skeletons. */
  loaderBg: string;

  // ── NFT card tokens (NFTCard / SetCard) ──
  /** Card background gradient. */
  cardBg: string;
  /** Card background gradient on hover. */
  cardHoverBg: string;
  /** Card border. */
  cardBorder: string;
  /** Card title color on hover. */
  cardTitleHover: string;
  /** Attribute / location chip styling (bg + text + border). */
  pill: string;
  /** Emphasis styling for a highlighted/current task card (border + bg + ring). */
  highlightCard: string;

  // ── Freemint detail page tokens ──
  /** NFT description text color on the detail page. */
  detailDescText: string;
}

export const collectionTheme: ShellTheme = {
  pageBg: "bg-[#00041f]",
  contentBg: "bg-[#00041f]",
  tabBarBg: "bg-[#00041f]",
  tabBarBorder: "border-gray-800",
  tabActive: "text-blue-600",
  tabInactive: "text-white",
  tabHover: "hover:text-blue-400",
  tabUnderline: "bg-blue-600",
  accentText: "text-blue-400",
  spinnerBorder: "border-blue-500",
  skeletonBlock: "bg-blue-500/10",
  loaderBg: "bg-gradient-to-b from-[#00041f] to-[#030828]",

  cardBg: "bg-gradient-to-br from-[#0a0f3b] to-[#050a2e]",
  cardHoverBg: "hover:from-[#141a52] hover:to-[#0a0f3b]",
  cardBorder: "border-gray-700/30",
  cardTitleHover: "group-hover:text-blue-300",
  pill: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  highlightCard: "border-blue-500/40 bg-blue-500/5 ring-1 ring-blue-500/20",

  detailDescText: "text-[#4DA2FF]",
};

export const eventTheme: ShellTheme = {
  pageBg: "bg-[#0d0d0d]",
  contentBg: "bg-[#0d0d0d]",
  tabBarBg: "bg-[#0d0d0d]",
  tabBarBorder: "border-white/10",
  tabActive: "text-purple-400",
  tabInactive: "text-gray-400",
  tabHover: "hover:text-purple-300",
  tabUnderline: "bg-purple-500",
  accentText: "text-purple-400",
  spinnerBorder: "border-purple-500",
  skeletonBlock: "bg-purple-500/10",
  loaderBg: "bg-[#0d0d0d]",

  cardBg: "bg-gradient-to-br from-[#1a0b2e] to-[#0d0618]",
  cardHoverBg: "hover:from-[#2a1147] hover:to-[#1a0b2e]",
  cardBorder: "border-purple-500/20",
  cardTitleHover: "group-hover:text-purple-300",
  pill: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  highlightCard: "border-purple-500/50 bg-purple-900/10 ring-1 ring-purple-500/30",

  detailDescText: "text-purple-300",
};
