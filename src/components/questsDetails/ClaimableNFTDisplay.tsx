// components/quests/ClaimableNFTDisplay.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import axiosInstance from "@/utils/axios";

interface MetadataInstance {
  id: number;
  title: string;
  description: string;
  image_url: string;
  token_uri: string;
  attributes: string;
  collection: {
    id: number;
    name: string;
    description: string;
    image_uri: string;
    chain_name: string;
  };
  collection_id: number;
  animation_url?: string;
  latitude?: number;
  longitude?: number;
  price?: number;
  set_id?: number;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ClaimableNFTDisplayProps {
  metadataId: number;
  userAddress: string;
  onMetadataLoaded: (metadata: MetadataInstance, canMint: boolean) => void;
}

export const ClaimableNFTDisplay: React.FC<ClaimableNFTDisplayProps> = ({
  metadataId,
  userAddress,
  onMetadataLoaded,
}) => {
  const [metadata, setMetadata] = useState<MetadataInstance | null>(null);
  const [canMintAgain, setCanMintAgain] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    fetchMetadata();
  }, [metadataId, userAddress]);

  const fetchMetadata = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axiosInstance.get(
        "/platform/metadata/geofenced-by-id",
        {
          params: {
            metadata_id: metadataId,
            user_address: userAddress,
          },
        }
      );

      const { metadata_instance, can_mint_again } = response.data;

      setMetadata(metadata_instance);
      setCanMintAgain(can_mint_again);
      onMetadataLoaded(metadata_instance, can_mint_again);
    } catch (error: any) {
      console.error("Error fetching metadata:", error);
      setError("Failed to load NFT details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-white">Loading NFT details...</p>
      </div>
    );
  }

  if (error || !metadata) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 mb-2">Failed to load NFT details</p>
        <button
          onClick={fetchMetadata}
          className="text-blue-400 hover:text-blue-300 text-sm"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="mb-12 sm:mb-16 md:mb-16">
      <div className="flex flex-col sm:flex-row items-center sm:space-x-6 md:space-x-8 space-y-6 sm:space-y-0">
        {/* NFT Image */}
        <div className="w-full sm:flex-shrink-0 sm:w-auto">
          <div className="w-full sm:w-40 sm:h-40 md:w-48 md:h-48 aspect-square rounded-2xl shadow-2xl border-2 border-purple-300/30 overflow-hidden">
            <Image
              src={metadata.image_url}
              alt={metadata.title}
              className="w-full h-full object-cover"
              width={192}
              height={192}
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder-nft.png";
              }}
            />
          </div>
        </div>

        {/* NFT Info */}
        <div className="flex-1 text-center sm:text-left max-w-lg">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            {metadata.title}
          </h2>
          <p className="text-gray-300 text-base sm:text-lg leading-relaxed mb-4">
            {metadata.description}
          </p>

          {/* Collection Info */}
          <div className="bg-gray-800/50 rounded-lg p-3 mb-3 border border-gray-700">
            <p className="text-sm text-gray-400">Collection</p>
            <p className="text-white font-medium">{metadata.collection.name}</p>
          </div>

          {/* Attributes */}
          {metadata.attributes && (
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
              <p className="text-sm text-gray-400 mb-2">Attributes</p>
              <p className="text-white text-sm">{metadata.attributes}</p>
            </div>
          )}

          {/* Claim Status */}
          {!canMintAgain && (
            <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
              <p className="text-yellow-200 text-sm">
                This NFT has already been claimed
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
