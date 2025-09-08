// components/quests/QuestDetailClaimButton.tsx
"use client";

import { useEffect } from "react";
import { StaticImageData } from "next/image";
import { useGlobalAppStore } from "@/store/globalAppStore";
import axiosInstance from "@/utils/axios";
import toast from "react-hot-toast";

interface NFTData {
  collection_id: string;
  name: string;
  description: string;
  image_url: string | StaticImageData;
  attributes: string[];
  recipient: string | undefined | null;
}

interface QuestDetailClaimButtonProps {
  nftMinted: boolean;
  claiming: boolean;
  setClaiming: (claiming: boolean) => void;
  setNftMinted: (minted: boolean) => void;
  completionPercentage: number;
  totalQuests: number;
  completedQuests: number;
  isWalletConnected: boolean;
  nftData: NFTData;
  onSuccess: (nftData: any) => void;
  requiredChainType?: "sui" | "evm";
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
  requiredChainType = "sui",
}) => {
  const { getWalletForChain, setOpenModal } = useGlobalAppStore();

  // Check localStorage on component mount to restore minted state
  useEffect(() => {
    if (completionPercentage === 100) {
      const savedNftStatus = localStorage.getItem("nft_minted_ns_daily");
      if (savedNftStatus === "true" && !nftMinted) {
        setNftMinted(true);
      }
    }
  }, [completionPercentage, nftMinted, setNftMinted]);

  const handleClaimNFT = async () => {
    if (nftMinted) {
      toast("NFT already minted for today's quests!");
      return;
    }

    if (completionPercentage !== 100) {
      toast.error("Complete all quests to claim the NFT");
      return;
    }

    // Get the correct wallet address for this chain
    const walletInfo = getWalletForChain(requiredChainType);
    const walletAddress = walletInfo?.address;

    if (!isWalletConnected || !walletAddress) {
      const chainName =
        requiredChainType === "evm"
          ? "wallet (MetaMask, Phantom, Coinbase)"
          : "Sui wallet";

      toast.error(`Please connect a ${chainName} to claim the NFT`, {
        duration: 5000,
        style: {
          background: "#1f2937",
          color: "#fff",
          border: "1px solid #374151",
        },
      });

      setOpenModal(true);
      return;
    }

    setClaiming(true);
    try {
      // Use the appropriate endpoint based on chain type
      const endpoint =
        requiredChainType === "evm"
          ? "/platform/mint-nft" // or base-sepolia endpoint
          : "/platform/sui/mint-nft";

      // Prepare NFT data with correct wallet address
      const mintData = {
        ...nftData,
        recipient: walletAddress,
        chain_type: requiredChainType, // Include chain type for backend validation
      };

      const response = await axiosInstance.post(endpoint, mintData);

      if (response.data.success) {
        // Set localStorage to persist minted state
        localStorage.setItem("nft_minted_ns_daily", "true");

        // Update component state
        setNftMinted(true);

        // Call success handler
        onSuccess({
          name: nftData.name,
          description: nftData.description,
          image_url: nftData.image_url,
          recipient: walletAddress,
        });

        const chainName = requiredChainType === "evm" ? "EVM" : "Sui";
        toast.success(`NFT minted successfully with ${chainName} wallet!`);
      } else {
        toast.error(response.data.message || "Failed to claim NFT");
      }
    } catch (error: any) {
      console.error("Error claiming NFT:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to claim NFT";

      if (errorMessage.includes("wrong wallet")) {
        toast.error(
          "Incorrect wallet type connected. Please connect the appropriate wallet for this quest."
        );
      } else if (
        errorMessage.includes("already minted") ||
        errorMessage.includes("already claimed")
      ) {
        // If NFT was already minted, set localStorage and update state
        localStorage.setItem("nft_minted_ns_daily", "true");
        setNftMinted(true);

        onSuccess({
          name: nftData.name,
          description: nftData.description,
          image_url: nftData.image_url,
          recipient: walletAddress,
        });
        toast.error("NFT already minted for today's quests!");
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setClaiming(false);
    }
  };

  const getButtonText = () => {
    if (nftMinted) return "✓ NFT Minted";
    if (claiming) return "🎨 Minting NFT...";
    if (!isWalletConnected) {
      const chainName =
        requiredChainType === "evm" ? "EVM Wallet" : "Sui Wallet";
      return `Connect ${chainName} to Claim NFT`;
    }
    if (completionPercentage === 100) return "🎉 Claim NFT";
    return `Complete ${totalQuests - completedQuests} more quests to Claim NFT`;
  };

  const getMobileButtonText = () => {
    if (nftMinted) return "✓ NFT Minted";
    if (claiming) return "Minting...";
    if (!isWalletConnected) {
      const chainName = requiredChainType === "evm" ? "EVM" : "Sui";
      return `Connect ${chainName}`;
    }
    if (completionPercentage === 100) return "Claim NFT";
    return `Complete ${totalQuests - completedQuests} more`;
  };

  const getButtonStyle = () => {
    if (nftMinted) {
      return "bg-white text-black cursor-default";
    }
    if (!isWalletConnected) {
      return "bg-gray-600 text-gray-300 cursor-not-allowed opacity-60";
    }
    if (completionPercentage === 100 && !claiming) {
      return "bg-white text-black shadow-lg hover:shadow-xl cursor-pointer";
    }
    return "bg-gray-700 text-gray-400 cursor-not-allowed opacity-50";
  };

  return (
    <div className="text-center mt-6 sm:mt-8">
      <button
        onClick={handleClaimNFT}
        disabled={claiming || !isWalletConnected || nftMinted}
        className={`
          w-full sm:w-auto px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base md:text-lg transition-all duration-300 transform
          ${getButtonStyle()}
        `}
      >
        <span className="block sm:hidden">{getMobileButtonText()}</span>
        <span className="hidden sm:block">{getButtonText()}</span>
      </button>
    </div>
  );
};
