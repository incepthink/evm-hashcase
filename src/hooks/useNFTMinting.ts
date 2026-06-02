// hooks/useNFTMinting.ts
"use client";

import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/utils/axios";
import { notify } from "@/utils/notify";

export interface MintNFTData {
  collection_id: string;
  name: string;
  description: string;
  image_url: string;
  attributes: string[];
  recipient: string;
  chain?: "sui" | "ethereum" | "polygon" | "solana"; // Add more chains as needed
}

export const useNFTMinting = () => {
  const mintNFTMutation = useMutation({
    mutationFn: async (data: MintNFTData) => {
      // Default to sui if no chain specified
      const chain = data.chain || "sui";
      
      const endpoint = chain === "sui" 
        ? "/platform/sui/mint-nft"
        : `/platform/mint-nft`; // For future chains
      
      const response = await axiosInstance.post(endpoint, data);
      return response.data;
    },
  });

  // Handle success
  useEffect(() => {
    if (mintNFTMutation.isSuccess && mintNFTMutation.data) {
      const data = mintNFTMutation.data;
      if (data.success) {
        localStorage.setItem("nft_minted_ns_daily", "true");
        notify("🎉 NFT minted successfully!", "success");
      } else {
        notify(data.message || "Failed to mint NFT", "error");
      }
    }
  }, [mintNFTMutation.isSuccess, mintNFTMutation.data]);

  // Handle error
  useEffect(() => {
    if (mintNFTMutation.isError) {
      const error = mintNFTMutation.error as any;
      console.error("Error minting NFT:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to mint NFT";
      
      if (errorMessage.includes("already minted") || errorMessage.includes("already claimed")) {
        localStorage.setItem("nft_minted_ns_daily", "true");
        notify("NFT already minted for today's quests!", "error");
      } else {
        notify(errorMessage, "error");
      }
    }
  }, [mintNFTMutation.isError, mintNFTMutation.error]);

  return {
    mintNFT: mintNFTMutation.mutate,
    mintNFTAsync: mintNFTMutation.mutateAsync,
    isLoading: mintNFTMutation.isPending,
    isSuccess: mintNFTMutation.isSuccess,
    isError: mintNFTMutation.isError,
    error: mintNFTMutation.error,
    data: mintNFTMutation.data,
    reset: mintNFTMutation.reset,
  };
};