// components/quests/QuestDetailClaimButton.tsx
"use client";

import { useState } from "react";
import { useNFTClaiming } from "@/hooks/useNFTClaiming";
import { useGlobalAppStore } from "@/store/globalAppStore";
import { notify } from "@/utils/notify";

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
    collection_id: number; // Changed from string to number
    name: string;
    description: string;
    image_url: string;
    attributes: string[];
    recipient: string | null;
  };
  onSuccess: (nftData: any) => void;
  requiredChainType: "sui" | "evm";
  disabled?: boolean;
  metadataId?: number; // Added metadata_id prop
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
  metadataId,
}) => {
  const { setOpenModal } = useGlobalAppStore();

  const {
    isMinting,
    canMintAgain,
    // autoClaimInProgress,
    claimNFT,
    canStartClaiming,
    isClaimDisabled,
  } = useNFTClaiming();

  const handleClaimNFT = async () => {
    if (!isWalletConnected) {
      notify("Please connect your wallet first", "error");
      setOpenModal(true);
      return;
    }

    if (!nftData.recipient) {
      notify("Wallet address not found", "error");
      return;
    }

    if (!metadataId) {
      notify("NFT metadata not found", "error");
      return;
    }

    if (!canStartClaiming(nftData.recipient, metadataId)) {
      notify("Cannot start claiming at this time", "error");
      return;
    }

    setClaiming(true);

    try {
      const claimData = {
        collection_id: nftData.collection_id.toString(), // Convert to string for API
        name: nftData.name,
        description: nftData.description,
        image_url: nftData.image_url,
        attributes: nftData.attributes,
        recipient: nftData.recipient,
        chain_type: requiredChainType === "evm" ? "ethereum" : "sui",
        metadata_id: metadataId,
      };

      const result = await claimNFT(claimData);

      if (result.success) {
        notify("NFT claimed successfully!", "success");
        onSuccess(result.data);
        setNftMinted(true);
      } else {
        notify(result.error || "Failed to claim NFT", "error");
      }
    } catch (error: any) {
      console.error("Error in handleClaimNFT:", error);
      notify("An unexpected error occurred", "error");
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
    !nftData.recipient ||
    !metadataId;

  // Determine button text and state
  const getButtonContent = () => {
    if (!isWalletConnected) {
      return "Connect Wallet to Claim";
    }

    if (!metadataId) {
      return "NFT Data Loading...";
    }

    // if (autoClaimInProgress) {
    //   return (
    //     <div className="flex items-center justify-center gap-2">
    //       <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
    //       <span>Auto-claiming...</span>
    //     </div>
    //   );
    // }

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
      return `Complete All Tasks (${completedQuests}/${totalQuests})`;
    }

    return "Claim NFT Reward";
  };

  // Don't render if not ready
  if (completionPercentage < 100 && !nftMinted) {
    return null;
  }

  return (
    <div className="mt-8 mb-8 text-center">
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

      {/* Additional info when quest is completed but NFT not yet claimed */}
      {/* {completionPercentage === 100 && !nftMinted && (
        <p className="text-sm text-gray-400 mt-3">
          Complete all tasks to unlock your NFT reward
        </p>
      )} */}
    </div>
  );
};
