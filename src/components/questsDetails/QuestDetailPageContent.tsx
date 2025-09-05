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
import backgroundImageHeroSection from "@/assets/images/high_rise.jpg";
import { StaticImageData } from "next/image";

// Components
import { LoadingScreen } from "../quests/LoadingScreen";
import { ErrorScreen } from "../quests/ErrorScreen";
import { Navigation } from "../quests/Navigation";
import { NFTSuccessModal } from "../quests/NFTSuccessModal";
import { QuestDetailHeader } from "./QuestDetailHeader";
import { QuestDetailProgress } from "./QuestDetailProgress";
import { QuestDetailList } from "./QuestDetailList";
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
}

const QuestDetailPageContent = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeQuestCode = String(params?.id || "");
  const allowClaim = true;
  const isSuper = false; // Set to false as requested

  const [mounted, setMounted] = useState(false);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [claimingQuestId, setClaimingQuestId] = useState<number | null>(null);
  const [nftMinted, setNftMinted] = useState(false);
  const [showNftModal, setShowNftModal] = useState(false);
  const [mintedNftData, setMintedNftData] = useState<{
    name: string;
    description: string;
    image_url: string;
    recipient: string;
  } | null>(null);

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

  console.log("QUEST_DEBUG: Wallet states:", {
    evmAddress,
    privyAuthenticated,
    privyWalletAddress: privyUser?.wallet?.address,
    activeQuestCode,
    collectionId: cid,
  });

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

  // Get NFT data from collection instead of hardcoded values
  const getNftData = () => {
    if (!collection) {
      // Fallback data while collection is loading
      return {
        collection_id: cid || "214",
        name: "Loading...",
        description: "Loading collection data...",
        image_url: backgroundImageHeroSection,
        attributes: ["quest_reward", "daily_completion", "loyalty"],
        recipient: walletAddress,
      };
    }

    return {
      collection_id: collection.id.toString(),
      name: collection.name,
      description:
        collection.description || "Complete the tasks to claim this reward.",
      image_url: collection.image_uri || collection.banner_image,
      attributes: [
        "quest_reward",
        "daily_completion",
        "loyalty",
        ...(collection.attributes || []),
      ],
      recipient: walletAddress,
    };
  };

  const nftData = getNftData();

  const isNSCollection =
    collection?.name === "NS" || collection?.name?.includes("NS");

  useEffect(() => setMounted(true), []);

  // Cross-tab sync
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "quest_progress_ping" && e.newValue) {
        console.log("QUEST_DEBUG: Cross-tab sync triggered:", e.newValue);
        fetchQuests();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const prevIsConnectedRef = useRef<boolean | null>(null);

  // NFT minted status management
  useEffect(() => {
    if (quests.length > 0) {
      const completedQuests = quests.filter(
        (quest) => quest.is_completed
      ).length;
      const totalQuests = quests.length;
      const currentCompletionPercentage =
        totalQuests > 0 ? Math.round((completedQuests / totalQuests) * 100) : 0;

      const savedNftStatus = localStorage.getItem("nft_minted_ns_daily");
      if (savedNftStatus === "true" && currentCompletionPercentage === 100) {
        setNftMinted(true);
      } else if (currentCompletionPercentage < 100) {
        setNftMinted(false);
        localStorage.removeItem("nft_minted_ns_daily");
      }
    }
  }, [quests]);

  // Wallet connection state management
  useEffect(() => {
    if (!mounted) return;

    const prev = prevIsConnectedRef.current;
    prevIsConnectedRef.current = isWalletConnected;

    if (prev !== isWalletConnected) {
      console.log(
        `QUEST_DEBUG: Wallet connection changed for ${requiredChainType}, reloading quests`
      );
      setLoading(true);
      setInitialLoad(true);
    }

    if (prev === true && isWalletConnected === false) {
      if (quests.length > 0) {
        setQuests((prevQuests) =>
          prevQuests.map((q) => ({ ...q, is_completed: false }))
        );
      }
      setNftMinted(false);
      try {
        localStorage.removeItem("nft_minted_ns_daily");
        const keysToRemove: string[] = [];
        for (let i = 0; i < sessionStorage.length; i++) {
          const k = sessionStorage.key(i);
          if (k && k.startsWith("quest_progress_session_"))
            keysToRemove.push(k);
        }
        keysToRemove.forEach((k) => sessionStorage.removeItem(k));
      } catch {}
    }
  }, [mounted, isWalletConnected, quests.length, requiredChainType]);

  // Progress calculations
  const completedQuests =
    mounted && isWalletConnected && !loading
      ? quests.filter((quest) => quest.is_completed).length
      : 0;
  const totalQuests = !loading ? quests.length : 0;
  const completionPercentage =
    mounted && isWalletConnected && !loading && totalQuests > 0
      ? Math.round((completedQuests / totalQuests) * 100)
      : 0;

  // Fetch quests on mount and wallet change
  useEffect(() => {
    if (mounted) {
      setLoading(true);
      fetchQuests();
    }
  }, [user?.id, walletAddress]);

  useEffect(() => {
    if (mounted && activeQuestCode) {
      setLoading(true);
      fetchQuests();
    }
  }, [activeQuestCode, mounted]);

  const fetchQuests = async () => {
    try {
      setLoading(true);
      console.log("QUEST_DEBUG: Fetching quests for code:", activeQuestCode);

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

      console.log("QUEST_DEBUG: Fetching quests with params:", params);

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

      const transformedQuests = response.data.quests.map((quest: any) => {
        const isCompletedFromAPI = quest.userProgress?.isCompleted || false;
        const isCompletedFromSession = sessionCompleted.includes(quest.id);
        const isCompleted = isCompletedFromAPI || isCompletedFromSession;

        return {
          id: quest.id,
          title: quest.title,
          description: quest.description,
          quest_code: quest.quest_code,
          points_reward: quest.reward_loyalty_points,
          owner_id: quest.owner_id,
          created_at: quest.createdAt,
          updated_at: quest.updatedAt,
          is_completed: walletAddress ? isCompleted : false,
        };
      });

      console.log("QUEST_DEBUG: Transformed quests:", transformedQuests);

      if (transformedQuests.length > 0) {
        setQuests(transformedQuests);
        return transformedQuests;
      } else {
        return [];
      }
    } catch (error) {
      console.error("QUEST_DEBUG: Error fetching quests:", error);
      toast.error("Failed to load quests");
      return [];
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

      const quest = quests.find((q) => q.id === questId);
      if (!quest?.quest_code) {
        toast.error("Quest not found");
        return;
      }

      console.log("QUEST_DEBUG: Claiming quest:", {
        questId,
        questCode: quest.quest_code,
        walletAddress,
        walletType: getWalletType(),
      });

      setQuests((prevQuests) => {
        const updatedQuests = prevQuests.map((q) =>
          q.id === questId ? { ...q, is_completed: true } : q
        );
        return updatedQuests;
      });

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
          owner_id: quest.owner_id,
          wallet_address: walletAddress,
          chain_type: requiredChainType, // Always "evm"
        });

        console.log("QUEST_DEBUG: Quest completion response:", response.data);

        const latest = await fetchQuests();
        const verified = Array.isArray(latest)
          ? latest.find((q) => q.id === questId)?.is_completed === true
          : false;
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
        console.log(
          "QUEST_DEBUG: Backend persistence failed (using localStorage fallback):",
          apiError
        );

        // Handle wallet-specific errors
        if (apiError.response?.data?.message?.includes("wrong wallet")) {
          toast.error(
            "Incorrect wallet type connected. Please connect an EVM wallet or sign in with Google."
          );
        }
      }
      fetchQuests();
    } catch (error: any) {
      console.error("QUEST_DEBUG: Error claiming quest:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to claim quest";
      toast.error(errorMessage);
    } finally {
      setClaimingQuestId(null);
    }
  };

  const handleNFTMintSuccess = (nftDataResponse: any) => {
    console.log("QUEST_DEBUG: NFT mint success:", nftDataResponse);
    setMintedNftData({
      name: nftData.name,
      description: nftData.description,
      image_url: nftData.image_url,
      recipient: nftData.recipient!,
    });
    setNftMinted(true);
    localStorage.setItem("nft_minted_ns_daily", "true");
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
          {/* Wallet Status Indicator */}
          {/* <div className="mb-6">
            <div className="flex items-center justify-center">
              <div className="bg-white/10 backdrop-blur-lg rounded-lg px-4 py-2 border border-white/20">
                <div className="flex items-center gap-3 text-sm">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isWalletConnected ? "bg-green-500" : "bg-red-500"
                    }`}
                  ></div>
                  <span className="text-white">
                    {isWalletConnected
                      ? `Connected with ${getWalletType()} wallet`
                      : "EVM wallet or Google sign-in required"}
                  </span>
                  {!isWalletConnected && (
                    <button
                      onClick={() => setOpenModal(true)}
                      className="ml-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-full transition-colors"
                    >
                      Connect
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div> */}

          {/* NFT Display Section */}
          <QuestDetailHeader nftData={nftData} />

          {/* Progress Section */}
          <QuestDetailProgress
            isWalletConnected={isWalletConnected}
            mounted={mounted}
            loading={loading}
            completedQuests={completedQuests}
            totalQuests={totalQuests}
            completionPercentage={completionPercentage}
            requiredChainType={requiredChainType}
          />

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
          {quests.length > 0 && (
            <QuestDetailClaimButton
              nftMinted={nftMinted}
              claiming={claiming}
              setClaiming={setClaiming}
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
