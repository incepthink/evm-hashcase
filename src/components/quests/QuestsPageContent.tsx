// components/QuestsPageContent.tsx
"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useGlobalAppStore } from "@/store/globalAppStore";
import { useCollectionById } from "@/hooks/useCollections";
import { useQuests } from "@/hooks/useQuests";
import axiosInstance from "@/utils/axios";
import backgroundImageHeroSection from "@/assets/images/high_rise.jpg";
// import {
//   NFTMintingService,
//   MintingStateManager,
// } from "@/utils/mintingStateManager";  // ← COMMENTED OUT

// Components
import { LoadingScreen } from "./LoadingScreen";
import { ErrorScreen } from "./ErrorScreen";
import { Navigation } from "./Navigation";
import { NFTDisplay } from "./NFTDisplay";
import { QuestHeader } from "./QuestHeader";
import { QuestList } from "./QuestList";
// import { ClaimNFTButton } from "./ClaimNFTButton";
import { NFTSuccessModal } from "./NFTSuccessModal";
// import { METADATA_ID } from "@/utils/constants";  // ← COMMENTED OUT

interface MintedNftData {
  name: string;
  description: string;
  image_url: string;
  recipient: string;
}

interface MetadataInstance {
  id: number;
  title: string;
  description: string;
  image_url: string;
  token_uri: string;
  attributes: string;
  collection: {
    id: number;
    name: string;
    description: string;
    image_uri: string;
    chain_name: string;
  };
  collection_id: number;
  animation_url?: string;
  latitude?: number;
  longitude?: number;
  price?: number;
  set_id?: number;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

// Updated Quest interface to match the new structure
interface RequirementRule {
  type: string;
  value: any;
}

interface Task {
  id: number;
  quest_id: number;
  owner_id: number;
  title: string;
  description: string | null;
  task_code: string | null;
  requirement_rules: RequirementRule[] | string;
  required_completions: number;
  reward_loyalty_points: number;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
  is_completed?: boolean;
}

interface Quest {
  id: number;
  owner_id: number;
  title: string;
  description?: string;
  is_active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  claimable_metadata?: number | null;
  tasks: Task[];
  total_tasks: number;
  completed_tasks: number;
  is_completed: boolean;
  total_points: number;
}

const QuestsPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    user,
    getWalletForChain,
    hasWalletForChain,
    setOpenModal,
    isUserVerified,
    nftClaiming,
    setCanMintAgain,
    // canStartMinting,        // ← COMMENTED OUT
    // setAutoClaimInProgress, // ← COMMENTED OUT
    setIsMinting,
  } = useGlobalAppStore();

  const [mounted, setMounted] = useState(false);
  const [showNftModal, setShowNftModal] = useState(false);
  const [mintedNftData, setMintedNftData] = useState<MintedNftData | null>(
    null
  );

  // Metadata states
  const [metadata, setMetadata] = useState<MetadataInstance | null>(null);
  const [metadataLoading, setMetadataLoading] = useState<boolean>(true);
  const [metadataError, setMetadataError] = useState<string>("");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Use fallback collection_id if not present
  const cid = searchParams.get("collection_id") || "218";

  const {
    collection,
    isLoading: isCollectionLoading,
    isError: isCollectionError,
  } = useCollectionById(cid);

  // Determine required chain type
  const requiredChainType = useMemo((): "sui" | "evm" => {
    if (!collection?.contract?.Chain?.chain_type) return "sui"; // Default fallback
    return collection.contract.Chain.chain_type === "ethereum" ? "evm" : "sui";
  }, [collection?.contract?.Chain?.chain_type]);

  // Get wallet info from global store only
  const walletInfo = useMemo(() => {
    if (!mounted) return null;
    return getWalletForChain(requiredChainType);
  }, [mounted, getWalletForChain, requiredChainType]);

  // Simple wallet address and connection status from global store
  const walletAddress = walletInfo?.address || null;
  const isWalletConnected = mounted && hasWalletForChain(requiredChainType);

  // ========== COMMENTED OUT COMPLEX MINTING STATE SYNC ==========
  // useEffect(() => {
  //   if (mounted && walletAddress) {
  //     // Check if already minted
  //     const hasMinted = MintingStateManager.hasMintedSuccessfully(
  //       walletAddress,
  //       METADATA_ID
  //     );
  //     if (hasMinted) {
  //       setCanMintAgain(false);
  //     }

  //     // Check if minting is locked by another tab
  //     const isLocked = MintingStateManager.isMintingLocked(
  //       walletAddress,
  //       METADATA_ID
  //     );
  //     if (isLocked) {
  //       console.log("Minting locked by another tab");
  //     }
  //   }
  // }, [mounted, walletAddress, setCanMintAgain]);

  // ========== COMMENTED OUT CLEANUP LISTENERS ==========
  // useEffect(() => {
  //   return () => {
  //     const store = useGlobalAppStore.getState();
  //     store.cleanupMintingListeners();
  //   };
  // }, []);

  // Simplified metadata fetch - only depends on API response
  useEffect(() => {
    if (mounted && isWalletConnected && walletAddress) {
      fetchMetadata();
    } else if (mounted && !isWalletConnected) {
      // Reset metadata when wallet disconnected
      setMetadata(null);
      setMetadataLoading(true);
      setMetadataError("");
      setCanMintAgain(true);
    }
  }, [mounted, isWalletConnected, walletAddress, setCanMintAgain]);

  const fetchMetadata = async () => {
    if (!walletAddress) return;

    try {
      setMetadataLoading(true);
      setMetadataError("");

      // Note: You'll need to determine which metadata_id to use here
      // since METADATA_ID is commented out. This might come from quest data
      // or collection data, depending on your implementation

      // Placeholder - you'll need to replace this with actual metadata_id logic
      const metadataId = 1; // Replace with actual logic

      const response = await axiosInstance.get(
        "/platform/metadata/geofenced-by-id",
        {
          params: {
            metadata_id: metadataId,
            user_address: walletAddress,
          },
        }
      );

      const { metadata_instance, can_mint_again } = response.data;

      console.log("can_mint_again", can_mint_again);
      setMetadata(metadata_instance);

      // SIMPLIFIED: Only depend on API response
      setCanMintAgain(can_mint_again !== undefined ? can_mint_again : true);
    } catch (error: any) {
      console.error("Error fetching metadata:", error);
      setMetadataError("Failed to load NFT details");
    } finally {
      setMetadataLoading(false);
    }
  };

  const {
    quests,
    isLoading: questsLoading,
    completedQuests,
    totalQuests,
    completionPercentage,
    nftMinted,
    setNftMinted,
    refetch: refetchQuests,
  } = useQuests({
    collection,
    walletAddress,
    isWalletConnected,
    mounted,
    requiredChainType,
  });

  // Trigger quest refetch when wallet connection changes
  useEffect(() => {
    if (mounted && refetchQuests) {
      refetchQuests();
    }
  }, [isWalletConnected, walletAddress, mounted, refetchQuests]);

  // Memoize handlers to prevent re-renders
  const handleBack = useCallback(() => {
    try {
      const cid = searchParams.get("collection_id");
      if (cid) {
        router.push(`/loyalties/${cid}`);
        return;
      }
      router.push("/loyalties/218");
    } catch {
      if (typeof window !== "undefined" && window.history.length > 1) {
        window.history.back();
      } else {
        router.push("/loyalties");
      }
    }
  }, [searchParams, router]);

  const handleNFTMintSuccess = useCallback(
    (nftData: any) => {
      const formattedData: MintedNftData = {
        name: nftData.name,
        description: nftData.description,
        image_url: nftData.image_url,
        recipient: nftData.recipient,
      };
      setMintedNftData(formattedData);
      setShowNftModal(true);
      setCanMintAgain(false);
    },
    [setCanMintAgain]
  );

  const handleCloseModal = useCallback(() => {
    setShowNftModal(false);
    setTimeout(() => {
      setMintedNftData(null);
    }, 300);
  }, []);

  // Memoize collection check
  const isNSCollection = useMemo(() => {
    return (
      collection?.name === "NS" ||
      collection?.name === "Network School Collection" ||
      collection?.name === "Network School Collection Base"
    );
  }, [collection?.name]);

  // Create collection-like object for NFTDisplay
  const displayCollection = useMemo(() => {
    if (!metadata) return null;
    return {
      name: metadata.title,
      description: metadata.description,
      image_uri: metadata.image_url,
    };
  }, [metadata]);

  // Create collection-like object for ClaimNFTButton
  const claimCollection = useMemo(() => {
    if (!metadata) return null;
    return {
      name: metadata.title,
      description: metadata.description,
      image_uri: metadata.image_url,
      image_url: metadata.image_url,
      attributes: metadata.attributes ? metadata.attributes.split(", ") : [],
    };
  }, [metadata]);

  // ========== COMMENTED OUT CUSTOM CLAIM FUNCTION ==========
  // const handleCustomClaim = useCallback(async () => {
  //   if (!walletAddress || !metadata) return;

  //   // Check if we can start minting
  //   if (!canStartMinting(walletAddress, METADATA_ID)) {
  //     console.log("Cannot start minting - global check failed");
  //     return;
  //   }

  //   const nftData = {
  //     collection_id: cid,
  //     name: metadata.title,
  //     description: metadata.description,
  //     image_url: metadata.image_url,
  //     attributes: metadata.attributes ? metadata.attributes.split(", ") : [],
  //     recipient: walletAddress,
  //     chain_type: requiredChainType === "evm" ? "ethereum" : "sui",
  //     metadata_id: METADATA_ID,
  //   };

  //   // Use the enhanced minting service
  //   await NFTMintingService.mintNFT({
  //     walletAddress,
  //     metadataId: METADATA_ID,
  //     nftData,
  //     onSuccess: (data) => {
  //       handleNFTMintSuccess(data);
  //     },
  //     onError: (error) => {
  //       console.error("Manual claim error:", error);
  //     },
  //   });
  // }, [
  //   walletAddress,
  //   metadata,
  //   cid,
  //   requiredChainType,
  //   handleNFTMintSuccess,
  //   canStartMinting,
  // ]);

  // Memoize stable props for modal
  const modalProps = useMemo(
    () => ({
      isOpen: showNftModal,
      onClose: handleCloseModal,
      mintedNftData,
      walletAddress,
      isNSCollection,
    }),
    [
      showNftModal,
      handleCloseModal,
      mintedNftData,
      walletAddress,
      isNSCollection,
    ]
  );

  // Loading states
  if (!mounted) {
    return (
      <LoadingScreen message="Loading..." isNSCollection={isNSCollection} />
    );
  }

  if (isCollectionLoading) {
    return (
      <LoadingScreen
        message="Loading Collection..."
        isNSCollection={isNSCollection}
      />
    );
  }

  if (isCollectionError || !collection) {
    return (
      <ErrorScreen
        title="Collection Not Found"
        message="Unable to load collection data"
        onBack={() => router.push("/collections")}
        isNSCollection={isNSCollection}
      />
    );
  }

  // Show wallet connection required screen if not connected
  if (!isWalletConnected) {
    return (
      <div className={`min-h-screen bg-[#000421]`}>
        <Navigation onBack={handleBack} />
        <div className="pt-20 sm:pt-20 md:pt-32 pb-6 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-12">
              <div className="text-4xl sm:text-6xl mb-4">🔒</div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">
                Login or Connect Wallet
              </h3>
              <p className="text-gray-400 text-sm sm:text-base mb-6">
                Please Connect wallet to view quests and claim rewards
              </p>
              <button
                onClick={() => setOpenModal(true)}
                className="bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Connect Wallet or Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show loading screen while fetching metadata
  if (metadataLoading) {
    return (
      <LoadingScreen
        message="Loading Collection Details..."
        collectionName={collection?.name}
        isNSCollection={isNSCollection}
      />
    );
  }

  // Show error if metadata failed to load
  if (metadataError || !metadata) {
    return (
      <ErrorScreen
        title="NFT Details Not Found"
        message="Unable to load NFT reward details"
        onBack={handleBack}
        isNSCollection={isNSCollection}
      />
    );
  }

  if (questsLoading || quests.length === 0) {
    return (
      <LoadingScreen
        message="Loading Quests..."
        collectionName={collection?.name}
        isNSCollection={isNSCollection}
      />
    );
  }

  // ========== SIMPLIFIED MINTING DISABLED CHECK ==========
  const isMintingDisabled = nftClaiming.isMinting;

  return (
    <div className={`min-h-screen bg-[#000421]`}>
      <Navigation onBack={handleBack} />

      {/* Main Content */}
      <div className="pt-20 sm:pt-20 md:pt-32 pb-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* ========== COMMENTED OUT CROSS-TAB MINTING INDICATOR ========== */}
          {/* {MintingStateManager.isMintingLocked(
            walletAddress || "",
            METADATA_ID
          ) &&
            !nftClaiming.autoClaimInProgress && (
              <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <div className="flex items-center justify-center gap-3">
                  <div className="animate-pulse h-3 w-3 bg-blue-400 rounded-full"></div>
                  <p className="text-blue-300 font-medium">
                    NFT minting in progress in another tab...
                  </p>
                </div>
              </div>
            )} */}

          {/* NFT Display Section - Using Dynamic Metadata */}
          <NFTDisplay
            collection={collection}
            backgroundImage={backgroundImageHeroSection}
          />

          {/* Quest Section */}
          <QuestHeader
            completedQuests={completedQuests}
            totalQuests={totalQuests}
            completionPercentage={completionPercentage}
            showProgress={mounted && isWalletConnected && !questsLoading}
            requiredChainType={requiredChainType}
          />

          {/* Quest List */}
          <QuestList
            quests={quests}
            isWalletConnected={isWalletConnected}
            requiredChainType={requiredChainType}
            collectionId={cid}
          />

          {/* ========== COMMENTED OUT CLAIM NFT BUTTON ========== */}
          {/* {quests.length > 0 && claimCollection && (
            <ClaimNFTButton
              nftMinted={!nftClaiming.canMintAgain}
              completionPercentage={completionPercentage}
              totalQuests={totalQuests}
              completedQuests={completedQuests}
              collection={claimCollection}
              collectionId={cid}
              onSuccess={handleNFTMintSuccess}
              onNftMintedChange={(minted: boolean) => setCanMintAgain(!minted)}
              chain={requiredChainType === "evm" ? "ethereum" : "sui"}
              requiredChainType={requiredChainType}
              disabled={isMintingDisabled}
              onCustomClaim={handleCustomClaim}
            />
          )} */}
        </div>
      </div>

      {/* NFT Success Modal */}
      <NFTSuccessModal {...modalProps} />
    </div>
  );
};

export default QuestsPageContent;
