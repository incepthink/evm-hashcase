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
            <Image
              src={collection.image_uri}
              alt="Collection NFT"
              width={192}
              height={192}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* NFT Info */}
        <div className="flex-1 text-center sm:text-left max-w-lg">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            {collection.name}
          </h2>
          <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
            {collection.description}
          </p>
        </div>
      </div>
    </div>
  );
};
