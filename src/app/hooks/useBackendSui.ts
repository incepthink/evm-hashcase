import { useState } from "react";
import { useAccounts } from "@mysten/dapp-kit";
import { toast } from "react-hot-toast";
import { suiApi, MintNftRequest, AddLoyaltyPointsRequest } from "@/utils/suiApi";

interface MintingForm {
  title: string;
  description: string;
  image_url: string;
  collection_id: string;
  attributes: string;
}

export const useBackendSui = () => {
  const [isLoading, setIsLoading] = useState(false);
  const accounts = useAccounts();
  const address = accounts[0]?.address;

  /**
   * Mint NFT using backend service (no gas fees for user)
   */
  const mintNftWithBackend = async (nftForm: MintingForm) => {
    if (!address) {
      toast.error("Please connect your wallet first.");
      return;
    }

    if (!nftForm.collection_id || !nftForm.title || !nftForm.image_url || !nftForm.attributes) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsLoading(true);

    try {
      const request: MintNftRequest = {
        userAddress: address,
        nftForm: {
          collection_id: nftForm.collection_id,
          title: nftForm.title,
          description: nftForm.description,
          image_url: nftForm.image_url,
          attributes: nftForm.attributes,
        },
      };

      const result = await suiApi.mintNft(request);
      
      toast.success("NFT minted and transferred successfully!");
      console.log("Mint result:", result);
      
      return result;
    } catch (error: any) {
      console.error("Error minting NFT:", error);
      const errorMessage = error.response?.data?.message || "Failed to mint NFT";
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Add loyalty points to user
   */
  const addLoyaltyPoints = async (points: number) => {
    if (!address) {
      toast.error("Please connect your wallet first.");
      return;
    }

    setIsLoading(true);

    try {
      const request: AddLoyaltyPointsRequest = {
        userAddress: address,
        points,
      };

      const result = await suiApi.addLoyaltyPoints(request);
      
      toast.success(`Successfully added ${points} loyalty points!`);
      console.log("Loyalty points result:", result);
      
      return result;
    } catch (error: any) {
      console.error("Error adding loyalty points:", error);
      const errorMessage = error.response?.data?.message || "Failed to add loyalty points";
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Get user's loyalty balance
   */
  const getLoyaltyBalance = async () => {
    if (!address) {
      toast.error("Please connect your wallet first.");
      return null;
    }

    try {
      const result = await suiApi.getLoyaltyBalance(address);
      console.log("Loyalty balance:", result);
      return result.balance;
    } catch (error: any) {
      console.error("Error getting loyalty balance:", error);
      const errorMessage = error.response?.data?.message || "Failed to get loyalty balance";
      toast.error(errorMessage);
      return null;
    }
  };

  /**
   * Get contract information
   */
  const getContractInfo = async () => {
    try {
      const result = await suiApi.getContractInfo();
      console.log("Contract info:", result);
      return result;
    } catch (error: any) {
      console.error("Error getting contract info:", error);
      const errorMessage = error.response?.data?.message || "Failed to get contract info";
      toast.error(errorMessage);
      return null;
    }
  };

  /**
   * Test backend connection
   */
  const testBackendConnection = async () => {
    try {
      const result = await suiApi.testConnection();
      console.log("Backend connection test:", result);
      return result;
    } catch (error: any) {
      console.error("Error testing backend connection:", error);
      toast.error("Backend connection failed");
      return null;
    }
  };

  return {
    isLoading,
    mintNftWithBackend,
    addLoyaltyPoints,
    getLoyaltyBalance,
    getContractInfo,
    testBackendConnection,
  };
}; 