// components/Navigation.tsx
"use client";

import ConnectButton from "@/components/ConnectButton";

interface NavigationProps {
  onBack: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ onBack }) => {
  return (
    <div className="relative">
      {/* Navigation - Mobile: Centered, Desktop: Corners */}
      <div className="absolute top-3 sm:top-4 left-3 sm:left-4 right-3 sm:right-4 z-10">
        <div className="flex items-center justify-between sm:justify-start">
          {/* Back Button */}
          <button
            onClick={onBack}
            className="text-white hover:text-gray-300 font-semibold transition-colors duration-300 flex items-center gap-2 text-sm sm:text-base"
          >
            ← Back
          </button>

          {/* Connect Button - Mobile: Same row, Desktop: Positioned absolutely */}
          <div className="sm:hidden">
            <ConnectButton />
          </div>
        </div>
      </div>

      {/* Desktop Connect Button */}
      <div className="hidden sm:block absolute top-3 sm:top-4 right-3 sm:right-4 z-[9999]">
        <ConnectButton />
      </div>
    </div>
  );
};
