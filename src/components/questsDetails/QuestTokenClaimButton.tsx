"use client";

import React, { useState } from "react";
import axiosInstance from "@/utils/axios";
import { useGlobalAppStore } from "@/store/globalAppStore";
import toast from "react-hot-toast";

interface QuestTokenClaimButtonProps {
  tokenReward: {
    id: number;
    name: string;
    symbol: string;
    total_supply?: string | null;
    can_claim_again: boolean; // NEW FIELD
  };
  tokenAmount: number;
  completionPercentage: number;
  isWalletConnected: boolean;
  questCompleted: boolean;
  questId: number;
  disabled?: boolean;
}

export const QuestTokenClaimButton: React.FC<QuestTokenClaimButtonProps> = ({
  tokenReward,
  tokenAmount,
  completionPercentage,
  isWalletConnected,
  questCompleted,
  questId,
  disabled = false,
}) => {
  const [isClaiming, setIsClaiming] = useState(false);
  const [hasClaimed, setHasClaimed] = useState(false);
  const { getWalletForChain } = useGlobalAppStore();

  // Check if already claimed based on can_claim_again
  const alreadyClaimed = !tokenReward.can_claim_again;

  const handleClaimTokens = async () => {
    if (!isWalletConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    const walletInfo = getWalletForChain("evm");
    if (!walletInfo?.address) {
      toast.error("Wallet address not found");
      return;
    }

    setIsClaiming(true);

    try {
      const claimData = {
        to_address: walletInfo.address,
        quest_id: questId,
      };

      const response = await axiosInstance.post("/user/claim/erc20", claimData);

      if (response.data.success) {
        toast.success(
          `Successfully claimed ${Number(tokenAmount).toFixed(2)} ${
            tokenReward.symbol
          }!`
        );
        setHasClaimed(true);

        const blockchainTx =
          response.data.data?.transaction?.blockchain_transaction;
        if (blockchainTx?.hash) {
          console.log(`Blockchain transaction: ${blockchainTx.hash}`);
        }
      } else {
        toast.error(response.data.message || "Failed to claim tokens");
      }
    } catch (error: any) {
      console.error("Error claiming tokens:", error);
      let errorMessage = "An error occurred while claiming tokens";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsClaiming(false);
    }
  };

  const getButtonContent = () => {
    if (!isWalletConnected) {
      return "Connect Wallet to Claim";
    }

    if (alreadyClaimed || hasClaimed) {
      return `${Number(tokenAmount).toFixed(2)} ${
        tokenReward.symbol
      } Already Claimed`;
    }

    if (isClaiming) {
      return (
        <div className="flex items-center justify-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span>Processing Claim...</span>
        </div>
      );
    }

    if (completionPercentage < 100) {
      return `Complete All Tasks to Claim ${Number(tokenAmount).toFixed(2)} ${
        tokenReward.symbol
      }`;
    }

    return `Claim ${Number(tokenAmount).toFixed(2)} ${tokenReward.symbol}`;
  };

  const isButtonDisabled =
    disabled ||
    !isWalletConnected ||
    completionPercentage < 100 ||
    !questCompleted ||
    isClaiming ||
    hasClaimed ||
    alreadyClaimed; // NEW CONDITION

  return (
    <div className="mt-4 mb-4 text-center">
      <button
        onClick={handleClaimTokens}
        disabled={isButtonDisabled}
        className={`w-full max-w-md py-4 px-6 rounded-lg font-semibold text-white transition-all duration-200 ${
          isButtonDisabled
            ? "bg-gray-600 cursor-not-allowed opacity-50"
            : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 hover:scale-105"
        }`}
      >
        {getButtonContent()}
      </button>
    </div>
  );
};
