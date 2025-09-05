// components/quests/QuestDetailHeader.tsx
"use client";

import Image, { StaticImageData } from "next/image";

interface NFTData {
  collection_id: string;
  name: string;
  description: string;
  image_url: string;
  attributes: string[];
  recipient: string | null;
}

interface QuestDetailHeaderProps {
  nftData: NFTData;
}

export const QuestDetailHeader: React.FC<QuestDetailHeaderProps> = ({
  nftData,
}) => {
  return (
    <div className="mb-12 sm:mb-16 md:mb-16">
      <div className="flex flex-col sm:flex-row items-center sm:space-x-6 md:space-x-8 space-y-6 sm:space-y-0">
        {/* NFT Image */}
        <div className="w-full sm:flex-shrink-0 sm:w-auto">
          <div className="w-full sm:w-40 sm:h-40 md:w-48 md:h-48 aspect-square rounded-2xl shadow-2xl border-2 border-purple-300/30 overflow-hidden">
            <Image
              src={nftData.image_url}
              alt="NFT Reward"
              className="w-full h-full object-cover"
              width={192}
              height={192}
            />
          </div>
        </div>

        {/* NFT Info */}
        <div className="flex-1 text-center sm:text-left max-w-lg">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            {nftData.name}
          </h2>
          <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
            {nftData.description}
          </p>
        </div>
      </div>
    </div>
  );
};
