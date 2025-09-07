// components/quests/NFTClaimButton.tsx
"use client";

import { useState } from "react";
import axiosInstance from "@/utils/axios";
import toast from "react-hot-toast";

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

interface NFTClaimButtonProps {
  metadata: MetadataInstance;
  canMintAgain: boolean;
  walletAddress: string;
  questCompleted: boolean;
  onClaimSuccess: (claimedMetadata: MetadataInstance) => void;
}

export const NFTClaimButton: React.FC<NFTClaimButtonProps> = ({
  metadata,
  canMintAgain,
  walletAddress,
  questCompleted,
  onClaimSuccess,
}) => {
  const [claiming, setClaiming] = useState(false);

  const handleClaim = async () => {
    if (!questCompleted) {
      toast.error("Complete the quest first to claim the NFT");
      return;
    }

    if (!canMintAgain) {
      toast.error("This NFT has already been claimed");
      return;
    }

    setClaiming(true);
    try {
      const response = await axiosInstance.post("/platform/claim-quest-nft", {
        metadata_id: metadata.id,
        recipient: walletAddress,
      });

      if (response.data.success) {
        toast.success("NFT claimed successfully!");
        onClaimSuccess(metadata);
      } else {
        toast.error(response.data.message || "Failed to claim NFT");
      }
    } catch (error: any) {
      console.error("Error claiming NFT:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to claim NFT";

      if (errorMessage.includes("already claimed")) {
        toast.error("This NFT has already been claimed");
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setClaiming(false);
    }
  };

  const getButtonText = () => {
    if (claiming) return "Claiming NFT...";
    if (!questCompleted) return "Complete Quest to Claim";
    if (!canMintAgain) return "Already Claimed";
    return "Claim NFT";
  };

  const getButtonStyle = () => {
    if (!questCompleted || !canMintAgain) {
      return "bg-gray-600 text-gray-300 cursor-not-allowed opacity-60";
    }
    if (claiming) {
      return "bg-blue-500 text-white cursor-not-allowed opacity-80";
    }
    return "bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl cursor-pointer";
  };

  return (
    <div className="text-center mt-6">
      <button
        onClick={handleClaim}
        disabled={claiming || !questCompleted || !canMintAgain}
        className={`
          w-full sm:w-auto px-8 py-3 rounded-lg font-semibold text-base transition-all duration-300
          ${getButtonStyle()}
        `}
      >
        <span className="flex items-center justify-center gap-2">
          {claiming && (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          )}
          {getButtonText()}
        </span>
      </button>
    </div>
  );
};
