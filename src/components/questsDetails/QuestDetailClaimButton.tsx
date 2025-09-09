// components/quests/QuestDetailClaimButton.tsx
"use client";

import { useState } from "react";
import { useNFTClaiming } from "@/hooks/useNFTClaiming";
import { useGlobalAppStore } from "@/store/globalAppStore";
import toast from "react-hot-toast";
import { METADATA_ID } from "@/utils/constants";

interface QuestDetailClaimButtonProps {
  nftMinted: boolean;
  claiming: boolean;
  setClaiming: (claiming: boolean) => void;
  setNftMinted: (minted: boolean) => void;
  completionPercentage: number;
  totalQuests: number;
  completedQuests: number;
  isWalletConnected: boolean;
  nftData: {
    collection_id: string;
    name: string;
    description: string;
    image_url: string;
    attributes: string[];
    recipient: string | null;
  };
  onSuccess: (nftData: any) => void;
  requiredChainType: "sui" | "evm";
  disabled?: boolean;
}

export const QuestDetailClaimButton: React.FC<QuestDetailClaimButtonProps> = ({
  nftMinted,
  claiming,
  setClaiming,
  setNftMinted,
  completionPercentage,
  totalQuests,
  completedQuests,
  isWalletConnected,
  nftData,
  onSuccess,
  requiredChainType,
  disabled: externalDisabled = false,
}) => {
  const { setOpenModal } = useGlobalAppStore();

  const {
    isMinting,
    canMintAgain,
    autoClaimInProgress,
    claimNFT,
    canStartClaiming,
    isClaimDisabled,
  } = useNFTClaiming();

  const handleClaimNFT = async () => {
    if (!isWalletConnected) {
      toast.error("Please connect your wallet first");
      setOpenModal(true);
      return;
    }

    if (!nftData.recipient) {
      toast.error("Wallet address not found");
      return;
    }

    if (!canStartClaiming(nftData.recipient, METADATA_ID)) {
      toast.error("Cannot start claiming at this time");
      return;
    }

    setClaiming(true);

    try {
      const claimData = {
        collection_id: nftData.collection_id,
        name: nftData.name,
        description: nftData.description,
        image_url: nftData.image_url,
        attributes: nftData.attributes,
        recipient: nftData.recipient,
        chain_type: requiredChainType,
        metadata_id: METADATA_ID,
      };

      const result = await claimNFT(claimData);

      if (result.success) {
        toast.success("NFT claimed successfully!");
        onSuccess(result.data);
        setNftMinted(true);
      } else {
        toast.error(result.error || "Failed to claim NFT");
      }
    } catch (error: any) {
      console.error("Error in handleClaimNFT:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setClaiming(false);
    }
  };

  // Determine if button should be disabled
  const isButtonDisabled =
    externalDisabled ||
    isClaimDisabled ||
    claiming ||
    completionPercentage < 100 ||
    nftMinted ||
    !isWalletConnected ||
    !nftData.recipient;

  // Determine button text and state
  const getButtonContent = () => {
    if (!isWalletConnected) {
      return "Connect Wallet to Claim";
    }

    if (autoClaimInProgress) {
      return (
        <div className="flex items-center justify-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span>Auto-claiming...</span>
        </div>
      );
    }

    if (claiming || isMinting) {
      return (
        <div className="flex items-center justify-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span>Claiming NFT...</span>
        </div>
      );
    }

    if (nftMinted || !canMintAgain) {
      return "NFT Already Claimed";
    }

    if (completionPercentage < 100) {
      return `Complete All Quests (${completedQuests}/${totalQuests})`;
    }

    return "Claim NFT Reward";
  };

  // Don't render if not ready
  if (completionPercentage < 100 && !nftMinted) {
    return null;
  }

  return (
    <div className="mt-8 text-center">
      <button
        onClick={handleClaimNFT}
        disabled={isButtonDisabled}
        className={`w-full max-w-md py-4 px-6 rounded-lg font-semibold text-white transition-all duration-200 ${
          isButtonDisabled
            ? "bg-gray-600 cursor-not-allowed opacity-50"
            : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 hover:scale-105"
        }`}
      >
        {getButtonContent()}
      </button>
    </div>
  );
};
