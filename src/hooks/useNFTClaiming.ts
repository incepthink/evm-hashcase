// hooks/useNFTClaiming.ts
import { useCallback } from "react";
import { useGlobalAppStore } from "@/store/globalAppStore";
import axiosInstance from "@/utils/axios";
import toast from "react-hot-toast";

interface NFTData {
  collection_id: string;
  name: string;
  description: string;
  image_url: string;
  attributes: string[];
  recipient: string;
  chain_type: string;
  metadata_id: number;
}

interface UseNFTClaimingReturn {
  // State
  isMinting: boolean;
  canMintAgain: boolean;
  autoClaimInProgress: boolean;
  
  // Functions
  claimNFT: (nftData: NFTData) => Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }>;
  
  canStartClaiming: (walletAddress: string, metadataId: number) => boolean;
  
  // For manual claim buttons
  isClaimDisabled: boolean;
}

export const useNFTClaiming = (): UseNFTClaimingReturn => {
  const {
    nftClaiming,
    setIsMinting,
    setCanMintAgain,
    canStartMinting,
  } = useGlobalAppStore();

  const claimNFT = useCallback(async (nftData: NFTData) => {
    const { recipient, metadata_id } = nftData;
    
    // Check if we can start minting
    if (!canStartMinting(recipient, metadata_id)) {
      return {
        success: false,
        error: "Cannot start minting at this time"
      };
    }

    // Set minting state
    setIsMinting(true, metadata_id, recipient);

    try {
      console.log("Claiming NFT:", nftData);

      const response = await axiosInstance.post("/platform/mint-nft", nftData);

      if (response.data.success) {
        // Update global state
        setCanMintAgain(false);
        
        return {
          success: true,
          data: response.data
        };
      } else {
        return {
          success: false,
          error: response.data.message || "Failed to claim NFT"
        };
      }
    } catch (error: any) {
      console.error("NFT claim error:", error);
      const errorMessage = error.response?.data?.message || "Failed to claim NFT";

      // Handle specific error cases
      if (
        errorMessage.includes("already claimed") ||
        errorMessage.includes("already minted")
      ) {
        setCanMintAgain(false);
        return {
          success: false,
          error: "NFT has already been claimed"
        };
      }

      return {
        success: false,
        error: errorMessage
      };
    } finally {
      // Always reset minting state
      setIsMinting(false);
    }
  }, [canStartMinting, setIsMinting, setCanMintAgain]);

  const canStartClaiming = useCallback((walletAddress: string, metadataId: number) => {
    return canStartMinting(walletAddress, metadataId);
  }, [canStartMinting]);

  const isClaimDisabled = nftClaiming.isMinting || 
                         nftClaiming.autoClaimInProgress || 
                         !nftClaiming.canMintAgain;

  return {
    // State
    isMinting: nftClaiming.isMinting,
    canMintAgain: nftClaiming.canMintAgain,
    autoClaimInProgress: nftClaiming.autoClaimInProgress,
    
    // Functions
    claimNFT,
    canStartClaiming,
    
    // For manual claim buttons
    isClaimDisabled,
  };
};