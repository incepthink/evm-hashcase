"use client";

import { Lock, LucideIcon } from "lucide-react";

interface EmptyStateProps {
  /** Lucide icon component. Defaults to a lock. */
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  /** Tailwind classes for the icon badge tint. */
  accentClassName?: string;
}

export default function EmptyState({
  icon: Icon = Lock,
  title,
  description,
  actionLabel,
  onAction,
  accentClassName = "bg-white/10 text-white",
}: EmptyStateProps) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <div
        className={`mb-5 flex h-16 w-16 items-center justify-center rounded-full ${accentClassName}`}
      >
        <Icon className="h-7 w-7" strokeWidth={1.75} />
      </div>
      <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">{title}</h3>
      {description && (
        <p className="text-gray-400 text-sm sm:text-base mb-6 max-w-md">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
