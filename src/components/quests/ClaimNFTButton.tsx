// components/ClaimNFTButton.tsx
"use client";

import { useState } from "react";
import { useNFTClaiming } from "@/hooks/useNFTClaiming";
import { useGlobalAppStore } from "@/store/globalAppStore";
import { MintingStateManager } from "@/utils/mintingStateManager";
import toast from "react-hot-toast";
import { METADATA_ID } from "@/utils/constants";

interface ClaimNFTButtonProps {
  nftMinted: boolean;
  completionPercentage: number;
  totalQuests: number;
  completedQuests: number;
  collection: {
    name: string;
    description: string;
    image_url: string;
    attributes: string[];
  };
  collectionId: string;
  onSuccess: (nftData: any) => void;
  onNftMintedChange: (minted: boolean) => void;
  chain: string;
  requiredChainType: "sui" | "evm";
  disabled?: boolean;
  onCustomClaim?: () => Promise<void>;
}

export const ClaimNFTButton: React.FC<ClaimNFTButtonProps> = ({
  nftMinted,
  completionPercentage,
  totalQuests,
  completedQuests,
  collection,
  collectionId,
  onSuccess,
  onNftMintedChange,
  chain,
  requiredChainType,
  disabled: externalDisabled = false,
  onCustomClaim,
}) => {
  const [localClaiming, setLocalClaiming] = useState(false);

  const {
    isMinting,
    canMintAgain,
    autoClaimInProgress,
    claimNFT,
    canStartClaiming,
    isClaimDisabled,
  } = useNFTClaiming();

  const { getWalletForChain, setOpenModal } = useGlobalAppStore();

  // Get wallet address
  const getWalletAddress = (): string | null => {
    const walletInfo = getWalletForChain(requiredChainType);
    return walletInfo?.address || null;
  };

  const walletAddress = getWalletAddress();

  const handleClaimNFT = async () => {
    if (!walletAddress) {
      toast.error("Please connect your wallet first");
      setOpenModal(true);
      return;
    }

    if (externalDisabled || localClaiming || isClaimDisabled) {
      return;
    }

    // Check cross-tab minting lock
    if (MintingStateManager.isMintingLocked(walletAddress, METADATA_ID)) {
      toast.error("NFT minting is in progress in another tab");
      return;
    }

    // Use custom claim function if provided (from QuestsPageContent)
    if (onCustomClaim) {
      setLocalClaiming(true);
      try {
        await onCustomClaim();
      } catch (error) {
        console.error("Custom claim error:", error);
      } finally {
        setLocalClaiming(false);
      }
      return;
    }

    // Default claim logic using the hook
    if (!canStartClaiming(walletAddress, METADATA_ID)) {
      toast.error("Cannot start claiming at this time");
      return;
    }

    setLocalClaiming(true);

    try {
      const nftData = {
        collection_id: collectionId,
        name: collection.name,
        description: collection.description,
        image_url: collection.image_url,
        attributes: collection.attributes,
        recipient: walletAddress,
        chain_type: requiredChainType,
        metadata_id: METADATA_ID,
      };

      const result = await claimNFT(nftData);

      if (result.success) {
        toast.success("NFT claimed successfully!");
        onSuccess(result.data);
        onNftMintedChange(true);
      } else {
        toast.error(result.error || "Failed to claim NFT");
      }
    } catch (error: any) {
      console.error("Error in handleClaimNFT:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setLocalClaiming(false);
    }
  };

  // Determine if button should be disabled
  const isButtonDisabled =
    externalDisabled ||
    isClaimDisabled ||
    localClaiming ||
    completionPercentage < 100 ||
    nftMinted ||
    !walletAddress ||
    !canMintAgain ||
    MintingStateManager.isMintingLocked(walletAddress || "", METADATA_ID);

  // Determine button text and state
  const getButtonContent = () => {
    if (
      MintingStateManager.isMintingLocked(walletAddress || "", METADATA_ID) &&
      !autoClaimInProgress
    ) {
      return "Minting in another tab...";
    }

    if (autoClaimInProgress) {
      return (
        <div className="flex items-center justify-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span>Auto-claiming...</span>
        </div>
      );
    }

    if (localClaiming || isMinting) {
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
      return "Complete All Quests to Claim Reward";
    }

    return "Claim NFT Reward";
  };

  // Don't render if conditions aren't met
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
