// components/quests/QuestDetailHeader.tsx
"use client";

import Image from "next/image";
import { ShellTheme } from "@/components/collectionShell/theme";

interface NFTData {
  collection_id: number; // Changed from string to number
  name: string;
  description: string;
  image_url: string;
  attributes: string[];
  recipient: string | null;
}

interface QuestDetailHeaderProps {
  nftData: NFTData;
  theme: ShellTheme;
}

export const QuestDetailHeader: React.FC<QuestDetailHeaderProps> = ({
  nftData,
  theme,
}) => {
  return (
    <div className="mb-12 sm:mb-16 md:mb-16">
      <div className="flex flex-col sm:flex-row items-center sm:space-x-6 md:space-x-8 space-y-6 sm:space-y-0">
        {/* NFT Image */}
        <div className="w-full sm:flex-shrink-0 sm:w-auto">
          <div
            className={`w-full sm:w-40 sm:h-40 md:w-48 md:h-48 aspect-square rounded-2xl shadow-2xl border-2 ${theme.cardBorder} overflow-hidden`}
          >
            <Image
              src={nftData.image_url}
              alt="NFT Reward"
              className="w-full h-full object-cover"
              width={192}
              height={192}
              onError={(e) => {
                // Fallback to a default image if the NFT image fails to load
                (e.target as HTMLImageElement).src = "/default-nft.png";
              }}
            />
          </div>
        </div>

        {/* NFT Info */}
        <div className="flex-1 text-center sm:text-left max-w-lg">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            {nftData.name}
          </h2>
          <p className="text-gray-300 text-base sm:text-lg leading-relaxed mb-4">
            {nftData.description}
          </p>

          {/* NFT Attributes */}
          {nftData.attributes && nftData.attributes.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-400 mb-2">
                Attributes:
              </h4>
              <div className="flex flex-wrap gap-2">
                {nftData.attributes.map((attribute, index) => (
                  <span
                    key={index}
                    className={`text-xs px-2 py-1 rounded border ${theme.pill}`}
                  >
                    {attribute}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Collection ID Display */}
          {/* <div className="text-xs text-gray-500">
            <span className="bg-gray-800/50 px-2 py-1 rounded border border-gray-600">
              Collection ID: {nftData.collection_id}
            </span>
          </div> */}
        </div>
      </div>

      {/* Reward Banner */}
      <div
        className={`mt-8 p-4 ${theme.cardBg} rounded-xl border ${theme.cardBorder}`}
      >
        <div className="flex items-center justify-center gap-3">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-white">Quest Reward</h3>
            <p className="text-sm text-gray-300 mt-2">
              Complete all tasks to claim this exclusive NFT
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
