// hooks/useNFTClaiming.ts
import { useCallback } from "react";
import { useGlobalAppStore } from "@/store/globalAppStore";
import axiosInstance from "@/utils/axios";

interface NFTData {
  collection_id: string | number;
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
  } = useGlobalAppStore();

  const claimNFT = useCallback(async (nftData: NFTData): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> => {
    const { recipient, metadata_id } = nftData;
    
    // Simple validation - only check if minting is already in progress
    if (nftClaiming.isMinting) {
      return {
        success: false,
        error: "Minting is already in progress"
      };
    }

    // Check if we can mint based on API response
    if (!nftClaiming.canMintAgain) {
      return {
        success: false,
        error: "NFT has already been claimed"
      };
    }

    try {
      console.log("Claiming NFT:", nftData);

      // Set minting state to disable button
      setIsMinting(true);

      // Prepare NFT data for API
      const apiData = {
        collection_id: nftData.collection_id.toString(),
        name: nftData.name,
        description: nftData.description,
        image_url: nftData.image_url,
        attributes: nftData.attributes,
        recipient: nftData.recipient,
        chain_type: nftData.chain_type,
        metadata_id: nftData.metadata_id,
      };

      // Make the API call directly
      const response = await axiosInstance.post("/platform/mint-nft", apiData);

      if (response.data.success) {
        console.log('NFT minted successfully');
        
        // Mark as no longer mintable
        setCanMintAgain(false);
        
        return {
          success: true,
          data: response.data
        };
      } else {
        throw new Error(response.data.message || 'Minting failed');
      }
      
    } catch (error: any) {
      console.error("NFT claim error:", error);
      
      const errorMessage = error.response?.data?.message || error.message || "Failed to claim NFT";
      
      // Check for specific error types
      if (
        errorMessage.includes("already claimed") ||
        errorMessage.includes("already minted") ||
        errorMessage.includes("already exists")
      ) {
        // Mark as no longer mintable even on "already claimed" errors
        setCanMintAgain(false);
        
        return {
          success: true, // Treat as success since NFT exists
          data: { 
            message: 'NFT already claimed',
            name: nftData.name,
            description: nftData.description,
            image_url: nftData.image_url,
            recipient: nftData.recipient
          }
        };
      }
      
      return {
        success: false,
        error: errorMessage
      };
      
    } finally {
      // Always clean up minting state
      setIsMinting(false);
    }
  }, [nftClaiming.isMinting, nftClaiming.canMintAgain, setIsMinting, setCanMintAgain]);

  const canStartClaiming = useCallback((walletAddress: string, metadataId: number) => {
    // Simple check - only based on global state
    return nftClaiming.canMintAgain && !nftClaiming.isMinting;
  }, [nftClaiming.canMintAgain, nftClaiming.isMinting]);

  // Simple disabled state checking - button disabled when minting or already claimed
  const isClaimDisabled = nftClaiming.isMinting || !nftClaiming.canMintAgain;

  return {
    // State
    isMinting: nftClaiming.isMinting,
    canMintAgain: nftClaiming.canMintAgain,
    
    // Functions
    claimNFT,
    canStartClaiming,
    
    // For manual claim buttons
    isClaimDisabled,
  };
};