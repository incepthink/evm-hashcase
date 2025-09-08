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
import { QuestDetailHeader } from "./QuestDetailHeader";
import { ConnectWalletMessage } from "./ConnectWalletMessage";
import { QuestDetailClaimButton } from "./QuestDetailClaimButton";

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

// Hardcoded metadata ID
const METADATA_ID = 22;

const QuestDetailPageContent = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeQuestCode = String(params?.id || "");
  const allowClaim = true;

  const [mounted, setMounted] = useState(false);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [claimingQuestId, setClaimingQuestId] = useState<number | null>(null);
  const [showNftModal, setShowNftModal] = useState(false);
  const [mintedNftData, setMintedNftData] = useState<MintedNftData | null>(
    null
  );

  // NFT states
  const [claiming, setClaiming] = useState<boolean>(false);

  // Metadata states
  const [metadata, setMetadata] = useState<MetadataInstance | null>(null);
  const [metadataLoading, setMetadataLoading] = useState<boolean>(true);
  const [metadataError, setMetadataError] = useState<string>("");
  const [canMintAgain, setCanMintAgain] = useState<boolean>(true);

  // Auto-mint prevention states
  const [hasAutoMintAttempted, setHasAutoMintAttempted] = useState(false);
  const [autoMinting, setAutoMinting] = useState(false);

  const { user, getWalletForChain, hasWalletForChain, setOpenModal } =
    useGlobalAppStore();

  // Wallet connections - EVM and Privy only
  const { address: evmAddress } = useAccount(); // EVM wallet
  const { authenticated: privyAuthenticated, user: privyUser } = usePrivy(); // Privy

  // Use fallback collection_id of "217" if not present
  const cid = searchParams.get("collection_id") || "218";

  const {
    collection,
    isLoading: isCollectionLoading,
    isError: isCollectionError,
  } = useCollectionById(cid);

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

  // Helper function to generate auto-mint attempt key
  const getAutoMintAttemptKey = (questCode: string, walletAddr: string) => {
    return `auto_mint_attempted_quest_${questCode}_${walletAddr}`;
  };

  // Check localStorage for previous auto-mint attempts when wallet connection changes
  useEffect(() => {
    if (activeQuestCode && walletAddress) {
      const autoMintKey = getAutoMintAttemptKey(activeQuestCode, walletAddress);
      const previouslyAttempted = localStorage.getItem(autoMintKey) === "true";
      setHasAutoMintAttempted(previouslyAttempted);
    } else {
      setHasAutoMintAttempted(false);
    }
  }, [activeQuestCode, walletAddress]);

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
  }, [mounted, isWalletConnected, walletAddress]);

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
      setMetadata(metadata_instance);
      setCanMintAgain(can_mint_again !== undefined ? can_mint_again : true);
    } catch (error: any) {
      console.error("Error fetching metadata:", error);
      setMetadataError("Failed to load NFT details");
    } finally {
      setMetadataLoading(false);
    }
  };

  // Cross-tab sync
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "quest_progress_ping" && e.newValue) {
        fetchQuests();
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
      // Reset auto-mint when wallet changes
      setHasAutoMintAttempted(false);
      setAutoMinting(false);
    }

    if (prev === true && isWalletConnected === false) {
      // Reset quest completion states
      setQuests((prev) =>
        prev.map((quest) => ({ ...quest, is_completed: false }))
      );
      setCanMintAgain(true);
      setHasAutoMintAttempted(false);
      setAutoMinting(false);
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
  }, [mounted, isWalletConnected, activeQuestCode]);

  // Fetch quests on mount and wallet change
  useEffect(() => {
    if (mounted && isWalletConnected) {
      setLoading(true);
      fetchQuests();
    }
  }, [user?.id, walletAddress, mounted, isWalletConnected]);

  useEffect(() => {
    if (mounted && activeQuestCode && isWalletConnected) {
      setLoading(true);
      fetchQuests();
    }
  }, [activeQuestCode, mounted, isWalletConnected]);

  const fetchQuests = async () => {
    if (!isWalletConnected || !walletAddress) return;

    try {
      setLoading(true);

      // First get the active quest to get owner_id
      const {
        data: { quest },
      } = await axiosInstance.get("/platform/quests/data/" + activeQuestCode);
      if (!quest) {
        throw new Error("Quest code Invalid");
      }

      // Then get all quests for this owner
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

      // Transform all quests
      const transformedQuests: Quest[] = response.data.quests.map(
        (questData: any) => {
          const isCompletedFromAPI =
            questData.userProgress?.isCompleted || false;
          const isCompletedFromSession = sessionCompleted.includes(
            questData.id
          );
          const isCompleted = isCompletedFromAPI || isCompletedFromSession;

          return {
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
        }
      );

      setQuests(transformedQuests);

      return transformedQuests;
    } catch (error) {
      console.error("Error fetching quests:", error);
      toast.error("Failed to load quests");
      return [];
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  const handleClaimQuest = async (questId: number) => {
    // Find the quest being claimed
    const questToClaim = quests.find((q) => q.id === questId);

    // Only allow completion of the active quest
    if (!questToClaim || questToClaim.quest_code !== activeQuestCode) {
      toast.error("You can only complete the active quest");
      return;
    }

    // Validate wallet connection before proceeding
    if (!isWalletConnected || !walletAddress) {
      toast.error(
        "Please connect wallet or sign in with Google to claim quests",
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

      // Update quest state optimistically
      setQuests((prev) =>
        prev.map((quest) =>
          quest.id === questId ? { ...quest, is_completed: true } : quest
        )
      );

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
          owner_id: questToClaim.owner_id,
          wallet_address: walletAddress,
          chain_type: requiredChainType, // Always "evm"
        });

        const latest = await fetchQuests();
        const latestQuest = latest?.find((q) => q.id === questId);
        const verified = latestQuest?.is_completed === true;
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
            "Incorrect wallet type connected. Please connect wallet or sign in with Google."
          );
        }
      }
    } catch (error: any) {
      console.error("Error claiming quest:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to claim quest";
      toast.error(errorMessage);

      // Revert optimistic update on error
      fetchQuests();
    } finally {
      setClaimingQuestId(null);
    }
  };

  // Calculate completion stats
  const completedQuests = quests.filter((quest) => quest.is_completed).length;
  const totalQuests = quests.length;
  const completionPercentage =
    totalQuests > 0 ? Math.round((completedQuests / totalQuests) * 100) : 0;

  // Auto-claim NFT function with secure duplicate prevention
  const handleAutoClaimNFT = async () => {
    if (hasAutoMintAttempted || autoMinting || !metadata || !walletAddress) {
      return;
    }

    console.log("Auto-claim conditions check:", {
      allQuestsCompleted: completionPercentage === 100,
      canMintAgain,
      walletAddress: !!walletAddress,
      hasAutoMintAttempted,
    });

    // Check all conditions including server-side can_mint_again
    if (completionPercentage !== 100 || !canMintAgain) {
      return;
    }

    // Mark that we've attempted auto-mint to prevent duplicates
    const autoMintKey = getAutoMintAttemptKey(activeQuestCode, walletAddress);
    localStorage.setItem(autoMintKey, "true");
    setHasAutoMintAttempted(true);
    setAutoMinting(true);

    try {
      console.log("Auto-claiming NFT for completed quests");

      const nftData = {
        collection_id: cid,
        name: metadata.title,
        description: metadata.description,
        image_url: metadata.image_url,
        attributes: metadata.attributes ? metadata.attributes.split(", ") : [],
        recipient: walletAddress,
        chain_type: requiredChainType,
      };

      // Call the NFT minting endpoint directly
      const response = await axiosInstance.post("/platform/mint-nft", nftData);

      if (response.data.success) {
        toast.success("NFT automatically claimed!");
        setCanMintAgain(false);

        setMintedNftData({
          name: metadata.title,
          description: metadata.description,
          image_url: metadata.image_url,
          recipient: walletAddress,
        });
        setShowNftModal(true);
      } else {
        console.error("Auto-claim failed:", response.data.message);
        toast.error(response.data.message || "Failed to auto-claim NFT");
        // Reset auto-mint attempt flag on failure
        localStorage.removeItem(autoMintKey);
        setHasAutoMintAttempted(false);
      }
    } catch (error: any) {
      console.error("Auto-claim error:", error);
      const errorMessage = error.response?.data?.message || "Auto-claim failed";

      if (
        errorMessage.includes("already claimed") ||
        errorMessage.includes("already minted")
      ) {
        setCanMintAgain(false);
        toast.success("NFT has already been claimed");
      } else {
        toast.error(`Auto-claim failed: ${errorMessage}`);
        // Reset auto-mint attempt flag on failure
        localStorage.removeItem(autoMintKey);
        setHasAutoMintAttempted(false);
      }
    } finally {
      setAutoMinting(false);
    }
  };

  // Auto-claim trigger with secure duplicate prevention
  useEffect(() => {
    const shouldAutoMint = () => {
      return (
        mounted &&
        completionPercentage === 100 &&
        canMintAgain && // Use server-side can_mint_again instead of localStorage
        !autoMinting &&
        !hasAutoMintAttempted &&
        walletAddress &&
        quests.length > 0 &&
        metadata
      );
    };

    if (shouldAutoMint()) {
      console.log("Triggering auto-claim in 2 seconds...");
      const timer = setTimeout(() => {
        handleAutoClaimNFT();
      }, 2000); // 2 second delay

      return () => clearTimeout(timer);
    }
  }, [
    mounted,
    completionPercentage,
    canMintAgain, // Use can_mint_again instead of nftMinted
    autoMinting,
    hasAutoMintAttempted,
    walletAddress,
    quests.length,
    metadata,
  ]);

  const handleNFTMintSuccess = (nftData: any) => {
    const formattedData: MintedNftData = {
      name: nftData.name,
      description: nftData.description,
      image_url: nftData.image_url,
      recipient: nftData.recipient,
    };
    setMintedNftData(formattedData);
    setShowNftModal(true);
    // Update can_mint_again state after successful mint
    setCanMintAgain(false);
  };

  const handleBack = () => {
    try {
      const cid = searchParams.get("collection_id");
      if (cid) {
        router.push(`/loyalties/${cid}`);
        return;
      }
      router.push("/loyalties/218"); // Use fallback here too
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

  // Prepare NFT data for components
  const nftData = metadata
    ? {
        collection_id: cid,
        name: metadata.title,
        description: metadata.description,
        image_url: metadata.image_url,
        attributes: metadata.attributes ? metadata.attributes.split(", ") : [],
        recipient: walletAddress,
      }
    : null;

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
      <div
        className={`min-h-screen ${
          isNSCollection ? "bg-black" : "bg-[#000421]"
        }`}
      >
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

  if (initialLoad || loading || quests.length === 0) {
    return (
      <LoadingScreen
        message="Loading Quests..."
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

          {/* Auto-claiming indicator */}
          {autoMinting && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <div className="flex items-center justify-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-400"></div>
                <p className="text-green-300 font-medium">
                  Auto-claiming your NFT reward...
                </p>
              </div>
            </div>
          )}

          {/* NFT Display Header */}
          {nftData && <QuestDetailHeader nftData={nftData} />}

          {/* Quest Progress Header */}
          <div className="text-center mb-8">
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-medium text-white mb-4">
                Available Quests
              </h3>
              <p className="text-gray-300 mb-4">
                Requires EVM wallet connection
              </p>
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Progress</span>
                  <span>
                    {completedQuests}/{totalQuests} ({completionPercentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quest List */}
          <QuestDetailList
            quests={quests}
            isWalletConnected={isWalletConnected}
            allowClaim={allowClaim}
            activeQuestCode={activeQuestCode}
            claimingQuestId={claimingQuestId}
            onClaimQuest={handleClaimQuest}
            requiredChainType={requiredChainType}
          />

          {/* Claim NFT Button */}
          {nftData && (
            <QuestDetailClaimButton
              nftMinted={!canMintAgain} // Use inverse of can_mint_again
              claiming={claiming}
              setClaiming={setClaiming}
              setNftMinted={(minted: boolean) => setCanMintAgain(!minted)}
              completionPercentage={completionPercentage}
              totalQuests={totalQuests}
              completedQuests={completedQuests}
              isWalletConnected={isWalletConnected}
              nftData={nftData}
              onSuccess={handleNFTMintSuccess}
              requiredChainType={requiredChainType}
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
