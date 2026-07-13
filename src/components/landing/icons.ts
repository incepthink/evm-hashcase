import {
  Bot,
  CalendarClock,
  Database,
  FileSearch,
  LayoutDashboard,
  Layers,
  MessagesSquare,
  PackageCheck,
  PenLine,
  Plug,
  ShieldCheck,
  Sparkles,
  Telescope,
  Workflow,
  type LucideIcon,
} from "lucide-react";

/** Resolves the icon names used in content.ts to lucide components. */
const ICONS: Record<string, LucideIcon> = {
  Bot,
  CalendarClock,
  Database,
  FileSearch,
  LayoutDashboard,
  Layers,
  MessagesSquare,
  PackageCheck,
  PenLine,
  Plug,
  ShieldCheck,
  Telescope,
  Workflow,
};

export function getIcon(name: string): LucideIcon {
  return ICONS[name] ?? Sparkles;
}
