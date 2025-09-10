// components/QuestsPageContent.tsx
"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useGlobalAppStore } from "@/store/globalAppStore";
import { useCollectionById } from "@/hooks/useCollections";
import { useQuests } from "@/hooks/useQuests";
import axiosInstance from "@/utils/axios";
import backgroundImageHeroSection from "@/assets/images/high_rise.jpg";

// Components
import { LoadingScreen } from "./LoadingScreen";
import { ErrorScreen } from "./ErrorScreen";
import { Navigation } from "./Navigation";
import { NFTDisplay } from "./NFTDisplay";
import { QuestHeader } from "./QuestHeader";
import { QuestList } from "./QuestList";
import { ClaimNFTButton } from "./ClaimNFTButton";
import { NFTSuccessModal } from "./NFTSuccessModal";
import { METADATA_ID } from "@/utils/constants";

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
  const cid = searchParams.get("collection_id") || "219";

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

  // Fetch metadata when wallet is connected
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

      const response = await axiosInstance.get(
        "/platform/metadata/geofenced-by-id",
        {
          params: {
            metadata_id: METADATA_ID,
            user_address: walletAddress,
          },
        }
      );

      const { metadata_instance, can_mint_again } = response.data;

      console.log("can_mint_again", can_mint_again);
      setMetadata(metadata_instance);
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
      router.push("/loyalties/219");
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
        message="Loading NFT Details..."
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

  return (
    <div className={`min-h-screen bg-[#000421]`}>
      <Navigation onBack={handleBack} />

      {/* Main Content */}
      <div className="pt-20 sm:pt-20 md:pt-32 pb-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* NFT Display Section - Using Dynamic Metadata */}
          <NFTDisplay
            collection={displayCollection}
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
          />

          {/* Claim NFT Button - Using Dynamic Metadata */}
          {quests.length > 0 && claimCollection && (
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
              disabled={
                nftClaiming.isMinting || nftClaiming.autoClaimInProgress
              }
            />
          )}
        </div>
      </div>

      {/* NFT Success Modal */}
      <NFTSuccessModal {...modalProps} />
    </div>
  );
};

export default QuestsPageContent;
