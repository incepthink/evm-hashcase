// components/quests/QuestDetailPageContent.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import axiosInstance from "@/utils/axios";
import toast from "react-hot-toast";
import { useGlobalAppStore } from "@/store/globalAppStore";
import { useAccount } from "wagmi";
import { usePrivy } from "@privy-io/react-auth";
import { useCollectionById } from "@/hooks/useCollections";

// Components
import { LoadingScreen } from "../quests/LoadingScreen";
import { ErrorScreen } from "../quests/ErrorScreen";
import { Navigation } from "../quests/Navigation";
import { NFTSuccessModal } from "../quests/NFTSuccessModal";
import { QuestDetailList } from "./QuestDetailList";
import { ClaimableNFTDisplay } from "./ClaimableNFTDisplay";
import { ConnectWalletMessage } from "./ConnectWalletMessage";
import { NFTClaimButton } from "./NFTClaimButton";

interface Quest {
  id: number;
  title: string;
  description: string;
  quest_code: string;
  points_reward: number;
  is_completed?: boolean;
  owner_id: number;
  created_at: string;
  updated_at: string;
  claimable_metadata?: number | null;
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

const QuestDetailPageContent = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeQuestCode = String(params?.id || "");
  const allowClaim = true;

  const [mounted, setMounted] = useState(false);
  const [activeQuest, setActiveQuest] = useState<Quest | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [claimingQuestId, setClaimingQuestId] = useState<number | null>(null);
  const [showNftModal, setShowNftModal] = useState(false);
  const [mintedNftData, setMintedNftData] = useState<{
    name: string;
    description: string;
    image_url: string;
    recipient: string;
  } | null>(null);

  // Claimable NFT states
  const [claimableMetadata, setClaimableMetadata] =
    useState<MetadataInstance | null>(null);
  const [canMintAgain, setCanMintAgain] = useState<boolean>(false);
  const [nftClaimed, setNftClaimed] = useState<boolean>(false);

  const { user, getWalletForChain, hasWalletForChain, setOpenModal } =
    useGlobalAppStore();

  // Wallet connections - EVM and Privy only
  const { address: evmAddress } = useAccount(); // EVM wallet
  const { authenticated: privyAuthenticated, user: privyUser } = usePrivy(); // Privy

  // Get collection from URL params
  const cid = searchParams.get("collection_id");

  const {
    collection,
    isLoading: isCollectionLoading,
    isError: isCollectionError,
  } = useCollectionById(cid!);

  // Always return "evm" since we only support EVM now
  const getRequiredChainType = (): "evm" => {
    return "evm";
  };

  // Get the appropriate wallet address (EVM or Privy)
  const getWalletAddress = (): string | null => {
    if (!mounted) return null;

    // First check for regular EVM wallet
    if (evmAddress) {
      return evmAddress;
    }

    // Then check for Privy wallet
    if (privyAuthenticated && privyUser?.wallet?.address) {
      return privyUser.wallet.address;
    }

    return null;
  };

  // Check if user has any EVM wallet connected (regular or Privy)
  const isCorrectWalletConnected = (): boolean => {
    if (!mounted) return false;
    return !!(evmAddress || (privyAuthenticated && privyUser?.wallet?.address));
  };

  const walletAddress = getWalletAddress();
  const isWalletConnected = isCorrectWalletConnected();
  const requiredChainType = getRequiredChainType();

  // Get wallet type for display purposes
  const getWalletType = (): "EVM" | "Google" | null => {
    if (evmAddress) return "EVM";
    if (privyAuthenticated && privyUser?.wallet?.address) return "Google";
    return null;
  };

  const isNSCollection =
    collection?.name === "NS" ||
    collection?.name?.includes("NS") ||
    collection?.name === "Network School Collection Base";

  useEffect(() => setMounted(true), []);

  // Cross-tab sync
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "quest_progress_ping" && e.newValue) {
        fetchActiveQuest();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const prevIsConnectedRef = useRef<boolean | null>(null);

  // Wallet connection state management
  useEffect(() => {
    if (!mounted) return;

    const prev = prevIsConnectedRef.current;
    prevIsConnectedRef.current = isWalletConnected;

    if (prev !== isWalletConnected) {
      setLoading(true);
      setInitialLoad(true);
    }

    if (prev === true && isWalletConnected === false) {
      if (activeQuest) {
        setActiveQuest((prev) =>
          prev ? { ...prev, is_completed: false } : null
        );
      }
      setNftClaimed(false);
      setClaimableMetadata(null);
      setCanMintAgain(false);
      try {
        localStorage.removeItem(`nft_claimed_${activeQuestCode}`);
        const keysToRemove: string[] = [];
        for (let i = 0; i < sessionStorage.length; i++) {
          const k = sessionStorage.key(i);
          if (k && k.startsWith("quest_progress_session_"))
            keysToRemove.push(k);
        }
        keysToRemove.forEach((k) => sessionStorage.removeItem(k));
      } catch {}
    }
  }, [
    mounted,
    isWalletConnected,
    activeQuest,
    requiredChainType,
    activeQuestCode,
  ]);

  // Fetch active quest on mount and wallet change
  useEffect(() => {
    if (mounted) {
      setLoading(true);
      fetchActiveQuest();
    }
  }, [user?.id, walletAddress]);

  useEffect(() => {
    if (mounted && activeQuestCode) {
      setLoading(true);
      fetchActiveQuest();
    }
  }, [activeQuestCode, mounted]);

  const fetchActiveQuest = async () => {
    try {
      setLoading(true);

      const {
        data: { quest },
      } = await axiosInstance.get("/platform/quests/data/" + activeQuestCode);
      if (!quest) {
        throw new Error("Quest code Invalid");
      }

      const params: { owner_id: number; wallet_address?: string } = {
        owner_id: quest.owner_id,
      };
      if (walletAddress) {
        params.wallet_address = walletAddress;
      }

      const response = await axiosInstance.get("/platform/quest/by-owner", {
        params,
      });

      let sessionCompleted: number[] = [];
      try {
        const sessionKey = walletAddress
          ? `quest_progress_session_${walletAddress}`
          : null;
        sessionCompleted = sessionKey
          ? JSON.parse(sessionStorage.getItem(sessionKey) || "[]")
          : [];
      } catch {}

      // Find the specific quest with the active quest code
      const questData = response.data.quests.find(
        (q: any) => q.quest_code === activeQuestCode
      );

      if (questData) {
        const isCompletedFromAPI = questData.userProgress?.isCompleted || false;
        const isCompletedFromSession = sessionCompleted.includes(questData.id);
        const isCompleted = isCompletedFromAPI || isCompletedFromSession;

        const transformedQuest: Quest = {
          id: questData.id,
          title: questData.title,
          description: questData.description,
          quest_code: questData.quest_code,
          points_reward: questData.reward_loyalty_points,
          owner_id: questData.owner_id,
          created_at: questData.createdAt,
          updated_at: questData.updatedAt,
          is_completed: walletAddress ? isCompleted : false,
          claimable_metadata: questData.claimable_metadata,
        };

        setActiveQuest(transformedQuest);

        // Check NFT claimed status
        const claimedStatus = localStorage.getItem(
          `nft_claimed_${activeQuestCode}`
        );
        setNftClaimed(claimedStatus === "true");

        return transformedQuest;
      } else {
        throw new Error("Quest not found");
      }
    } catch (error) {
      console.error("Error fetching quest:", error);
      toast.error("Failed to load quest");
      return null;
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  const handleClaimQuest = async (questId: number) => {
    // Validate wallet connection before proceeding
    if (!isWalletConnected || !walletAddress) {
      toast.error(
        "Please connect an EVM wallet or sign in with Google to claim quests",
        {
          duration: 5000,
          style: {
            background: "#1f2937",
            color: "#fff",
            border: "1px solid #374151",
          },
        }
      );

      setOpenModal(true);
      return;
    }

    try {
      setClaimingQuestId(questId);

      if (!activeQuest || activeQuest.id !== questId) {
        toast.error("Quest not found");
        return;
      }

      setActiveQuest((prev) => (prev ? { ...prev, is_completed: true } : null));

      try {
        const sessionKey = `quest_progress_session_${walletAddress}`;
        const sessionProgress: number[] = JSON.parse(
          sessionStorage.getItem(sessionKey) || "[]"
        );
        if (!sessionProgress.includes(questId)) {
          sessionProgress.push(questId);
          sessionStorage.setItem(sessionKey, JSON.stringify(sessionProgress));
        }
      } catch {}

      const walletType = getWalletType();
      toast.success(`Quest completed with ${walletType} wallet!`);

      try {
        const response = await axiosInstance.post("/platform/quests/complete", {
          quest_id: questId,
          owner_id: activeQuest.owner_id,
          wallet_address: walletAddress,
          chain_type: requiredChainType, // Always "evm"
        });

        const latest = await fetchActiveQuest();
        const verified = latest?.is_completed === true;
        if (verified) {
          toast.success("Quest saved to your account");
        } else {
          toast("Recorded locally. Syncing with server...", { icon: "⏳" });
        }

        try {
          localStorage.setItem(
            "quest_progress_ping",
            JSON.stringify({ ts: Date.now(), wallet: walletAddress })
          );
          localStorage.removeItem("quest_progress_ping");
        } catch {}
      } catch (apiError: any) {
        // Handle wallet-specific errors
        if (apiError.response?.data?.message?.includes("wrong wallet")) {
          toast.error(
            "Incorrect wallet type connected. Please connect an EVM wallet or sign in with Google."
          );
        }
      }
      fetchActiveQuest();
    } catch (error: any) {
      console.error("Error claiming quest:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to claim quest";
      toast.error(errorMessage);
    } finally {
      setClaimingQuestId(null);
    }
  };

  const handleMetadataLoaded = (
    metadata: MetadataInstance,
    canMint: boolean
  ) => {
    setClaimableMetadata(metadata);
    setCanMintAgain(canMint);
  };

  const handleNFTClaimSuccess = (claimedMetadata: MetadataInstance) => {
    setNftClaimed(true);
    setCanMintAgain(false);
    localStorage.setItem(`nft_claimed_${activeQuestCode}`, "true");

    setMintedNftData({
      name: claimedMetadata.title,
      description: claimedMetadata.description,
      image_url: claimedMetadata.image_url,
      recipient: walletAddress!,
    });
    setShowNftModal(true);
  };

  const handleBack = () => {
    try {
      const cid = searchParams.get("collection_id");
      if (cid) {
        router.push(`/loyalties/${cid}`);
        return;
      }
      router.push("/loyalties/214");
    } catch {
      if (typeof window !== "undefined" && window.history.length > 1) {
        window.history.back();
      } else {
        router.push("/loyalties");
      }
    }
  };

  // Get the display title - always show collection name
  const getDisplayTitle = () => {
    return collection?.name || "Quest";
  };

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
        collectionName={collection?.name}
        isNSCollection={isNSCollection}
      />
    );
  }

  if (isCollectionError || (cid && !collection)) {
    return (
      <ErrorScreen
        title="Collection Not Found"
        message="Unable to load collection data"
        onBack={() => router.push("/collections")}
        isNSCollection={isNSCollection}
      />
    );
  }

  if (initialLoad || loading || !activeQuest) {
    return (
      <LoadingScreen
        message="Loading Quest..."
        collectionName={collection?.name}
        isNSCollection={isNSCollection}
      />
    );
  }

  return (
    <div
      className={`min-h-screen ${isNSCollection ? "bg-black" : "bg-[#000421]"}`}
    >
      <Navigation onBack={handleBack} />

      {/* Main Content */}
      <div className="pt-20 sm:pt-20 md:pt-32 pb-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
              {getDisplayTitle()}
            </h1>
          </div>

          {/* Conditional Content Based on Wallet Connection and Claimable Metadata */}
          {!isWalletConnected && activeQuest.claimable_metadata ? (
            <ConnectWalletMessage />
          ) : isWalletConnected &&
            activeQuest.claimable_metadata &&
            walletAddress ? (
            <>
              {/* Claimable NFT Display */}
              <ClaimableNFTDisplay
                metadataId={activeQuest.claimable_metadata}
                userAddress={walletAddress}
                onMetadataLoaded={handleMetadataLoaded}
              />
            </>
          ) : (
            /* Default Quest Display for non-claimable quests */
            <div className="text-center py-8 mb-8">
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-medium text-white mb-2">
                  Quest Details
                </h3>
                <p className="text-gray-300 mb-4">
                  Complete this quest to earn loyalty points
                </p>
                <div className="text-2xl font-bold text-yellow-400">
                  {activeQuest.points_reward} Points
                </div>
              </div>
            </div>
          )}

          {/* Quest Display - Single Quest Only */}
          <QuestDetailList
            quests={[activeQuest]} // Pass only the active quest as an array
            isWalletConnected={isWalletConnected}
            allowClaim={allowClaim}
            activeQuestCode={activeQuestCode}
            claimingQuestId={claimingQuestId}
            onClaimQuest={handleClaimQuest}
            requiredChainType={requiredChainType}
          />

          {/* NFT Claim Button - Shows below quest list */}
          {claimableMetadata && isWalletConnected && walletAddress && (
            <NFTClaimButton
              metadata={claimableMetadata}
              canMintAgain={canMintAgain && !nftClaimed}
              walletAddress={walletAddress}
              questCompleted={activeQuest.is_completed || false}
              onClaimSuccess={handleNFTClaimSuccess}
            />
          )}
        </div>
      </div>

      {/* NFT Success Modal */}
      <NFTSuccessModal
        isOpen={showNftModal}
        onClose={() => setShowNftModal(false)}
        mintedNftData={mintedNftData}
        walletAddress={walletAddress}
        isNSCollection={isNSCollection}
      />
    </div>
  );
};

export default QuestDetailPageContent;
