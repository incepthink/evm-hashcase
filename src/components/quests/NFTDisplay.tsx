// components/NFTDisplay.tsx
import Image, { StaticImageData } from "next/image";

interface NFTDisplayProps {
  collection: any;
  backgroundImage: StaticImageData;
}

export const NFTDisplay: React.FC<NFTDisplayProps> = ({
  collection,
  backgroundImage,
}) => {
  return (
    <div className="mb-12 sm:mb-16 md:mb-24">
      <div className="flex flex-col sm:flex-row items-center sm:space-x-6 md:space-x-8 space-y-6 sm:space-y-0">
        {/* NFT Image */}
        <div className="w-full sm:flex-shrink-0 sm:w-auto">
          <div className="w-full sm:w-40 sm:h-40 md:w-48 md:h-48 aspect-square rounded-2xl shadow-2xl border-2 border-purple-300/30 overflow-hidden">
            {collection.name === "NS" ||
            collection.name === "Network School Collection" ? (
              <img
                src="https://client-uploads.nyc3.digitaloceanspaces.com/images/3b1daaad-c7dc-4884-a78b-739a3ce3dfaa/2025-08-28T12-25-58-895Z-38bc0eae.png"
                alt="NS Daily NFT"
                className="w-full h-full object-cover"
              />
            ) : (
              <Image
                src={backgroundImage}
                alt="Collection NFT"
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </div>

        {/* NFT Info */}
        <div className="flex-1 text-center sm:text-left max-w-lg">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            {collection.name}
          </h2>
          <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
            Complete the tasks for the day to claim this reward.
          </p>
        </div>
      </div>
    </div>
  );
};
