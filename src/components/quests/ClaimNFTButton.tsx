// components/ClaimNFTButton.tsx
"use client";

import { useEffect } from "react";
import toast from "react-hot-toast";
import { useNFTMinting, MintNFTData } from "@/hooks/useNFTMinting";
import { useGlobalAppStore } from "@/store/globalAppStore";

interface ClaimNFTButtonProps {
  nftMinted: boolean;
  completionPercentage: number;
  totalQuests: number;
  completedQuests: number;
  collection: any;
  collectionId: string;
  onSuccess: (nftData: any) => void;
  onNftMintedChange: (minted: boolean) => void;
  chain?: "sui" | "ethereum" | "polygon" | "solana";
  requiredChainType?: "sui" | "evm";
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
  chain = "sui",
  requiredChainType = "sui",
}) => {
  const { getWalletForChain, hasWalletForChain, setOpenModal } =
    useGlobalAppStore();

  const { mintNFT, isLoading: claiming, isSuccess, data } = useNFTMinting();

  // Get wallet info from store
  const walletInfo = getWalletForChain(requiredChainType);
  const walletAddress = walletInfo?.address;
  const isWalletConnected = hasWalletForChain(requiredChainType);

  // Handle success case and set localStorage
  useEffect(() => {
    if (isSuccess && data?.success && walletAddress) {
      // Set the localStorage item to persist minted state
      localStorage.setItem("nft_minted_ns_daily", "true");

      // Update component state
      onNftMintedChange(true);

      // Prepare NFT data for modal
      const nftData = {
        collection_id: collectionId,
        name: collection.name,
        description: collection.description,
        image_url: collection.image_uri,
        recipient: walletAddress,
      };

      // Call success handler
      onSuccess(nftData);

      // Show success toast
      toast.success("NFT successfully minted!");
    }
  }, [
    isSuccess,
    data,
    onNftMintedChange,
    onSuccess,
    collectionId,
    collection,
    walletAddress,
  ]);

  // Check localStorage on component mount to restore minted state
  useEffect(() => {
    if (completionPercentage === 100) {
      const savedNftStatus = localStorage.getItem("nft_minted_ns_daily");
      if (savedNftStatus === "true" && !nftMinted) {
        onNftMintedChange(true);
      }
    }
  }, [completionPercentage, nftMinted, onNftMintedChange]);

  const handleClaimNFT = async () => {
    if (nftMinted) {
      toast("NFT already minted for today's quests!");
      return;
    }

    if (completionPercentage !== 100) {
      toast.error("Complete all quests to claim the NFT");
      return;
    }

    if (!isWalletConnected || !walletAddress) {
      const chainName =
        requiredChainType === "evm"
          ? "EVM wallet (MetaMask, Phantom, Coinbase)"
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

    try {
      const nftData: MintNFTData = {
        collection_id: collectionId,
        name: collection.name,
        description: collection.description,
        image_url: collection.image_uri,
        attributes: collection.attributes?.split(", ") || [],
        recipient: walletAddress,
        chain: chain,
      };

      mintNFT(nftData);
    } catch (error) {
      console.error("Failed to mint NFT:", error);
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
