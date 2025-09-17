// components/quests/QuestDetailPageContent.tsx
"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import axiosInstance from "@/utils/axios";
import toast from "react-hot-toast";
import { useGlobalAppStore } from "@/store/globalAppStore";
import {
  useQuestById,
  QuestWithCompletion,
  TaskWithCompletion,
} from "@/hooks/useQuestById";
import {
  NFTMintingService,
  MintingStateManager,
} from "@/utils/mintingStateManager";

// Components
import { LoadingScreen } from "../quests/LoadingScreen";
import { ErrorScreen } from "../quests/ErrorScreen";
import { Navigation } from "../quests/Navigation";
import { NFTSuccessModal } from "../quests/NFTSuccessModal";
import { QuestDetailList } from "./QuestDetailList";
import { QuestDetailHeader } from "./QuestDetailHeader";
import { QuestDetailClaimButton } from "./QuestDetailClaimButton";

interface MintedNftData {
  name: string;
  description: string;
  image_url: string;
  recipient: string;
}

interface Contract {
  id: number;
  Chain: {
    id: number;
    chain_type: string;
    chain_name: string;
  };
}

interface Collection {
  id: number;
  name: string;
  description: string;
  image_uri: string;
  chain_name: string;
  contract: Contract;
}

interface MetadataInstance {
  id: number;
  title: string;
  description: string;
  image_url: string;
  token_uri: string;
  attributes: string;
  collection: Collection;
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

// Transform the quest data to match the expected format
const transformQuestData = (questData: QuestWithCompletion): any => {
  const completedTasks = questData.tasksWithCompletion.filter(
    (task) => task.isCompleted
  ).length;
  const totalTasks = questData.tasksWithCompletion.length;
  const totalPoints = questData.tasksWithCompletion.reduce(
    (sum, task) => sum + task.reward_loyalty_points,
    0
  );

  return {
    id: questData.id,
    owner_id: questData.owner_id,
    title: questData.title,
    description: questData.description,
    is_active: questData.is_active,
    createdAt: questData.created_at,
    updatedAt: questData.updated_at,
    claimable_metadata: questData.claimable_metadata,
    tasks: questData.tasksWithCompletion.map((task) => ({
      ...task,
      is_completed: task.isCompleted,
    })),
    total_tasks: totalTasks,
    completed_tasks: completedTasks,
    is_completed: completedTasks === totalTasks,
    total_points: totalPoints,
  };
};

const QuestDetailPageContent = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const questIdParam = String(params?.id || "");
  const questId = parseInt(questIdParam);

  const [mounted, setMounted] = useState(false);
  const [showNftModal, setShowNftModal] = useState(false);
  const [mintedNftData, setMintedNftData] = useState<MintedNftData | null>(
    null
  );
  const [claimingTaskId, setClaimingTaskId] = useState<number | null>(null);
  const [requiredChainType, setRequiredChainType] = useState<"sui" | "evm">(
    "evm"
  );

  // Metadata states
  const [metadata, setMetadata] = useState<MetadataInstance | null>(null);
  const [metadataLoading, setMetadataLoading] = useState<boolean>(true);
  const [metadataError, setMetadataError] = useState<string>("");

  const {
    user,
    getWalletForChain,
    hasWalletForChain,
    setOpenModal,
    nftClaiming,
    setCanMintAgain,
    // canStartMinting,           // ← COMMENTED OUT
    // setAutoClaimInProgress,    // ← COMMENTED OUT
  } = useGlobalAppStore();

  // Validate questId early
  const isValidQuestId = !isNaN(questId) && questId > 0;

  // Get user ID
  const userId = user?.id;
  const isValidUserId = userId && !isNaN(Number(userId)) && Number(userId) > 0;

  // Get wallet info from global store
  const walletInfo = useMemo(() => {
    if (!mounted) return null;
    return getWalletForChain(requiredChainType);
  }, [mounted, getWalletForChain, requiredChainType]);

  const walletAddress = walletInfo?.address || null;
  const isWalletConnected = mounted && hasWalletForChain(requiredChainType);

  // Always call hooks - conditional execution comes later
  const {
    data: questData,
    isLoading: questLoading,
    refetch: refetchQuest,
    error: questError,
  } = useQuestById({
    id: questId,
    userId: userId || "temp",
  });

  // Transform the quest data to match expected format
  const currentQuest = useMemo(() => {
    if (!questData) return null;
    return transformQuestData(questData);
  }, [questData]);

  // Get the metadata ID from the quest's claimable_metadata
  const metadataId = currentQuest?.claimable_metadata;

  // Check if it's NS Collection based on metadata
  const isNSCollection = useMemo(() => {
    if (!metadata?.collection) return false;
    const collectionName = metadata.collection.name;
    return (
      collectionName === "NS" ||
      collectionName === "Network School Collection" ||
      collectionName === "Network School Collection Base"
    );
  }, [metadata?.collection?.name]);

  // Prepare NFT data for components
  const nftData = useMemo(() => {
    if (!metadata) return null;
    return {
      collection_id: metadata.collection.id,
      name: metadata.title,
      description: metadata.description,
      image_url: metadata.image_url,
      attributes: metadata.attributes ? metadata.attributes.split(", ") : [],
      recipient: walletAddress,
    };
  }, [metadata, walletAddress]);

  const handleBack = useCallback(() => {
    // try {
    //   const collectionId =
    //     metadata?.collection?.id || searchParams.get("collection_id") || "218";
    //   router.push(
    //     `/loyalties/${collectionId}/quests?collection_id=${collectionId}`
    //   );
    // } catch {
    //   if (typeof window !== "undefined" && window.history.length > 1) {
    //     window.history.back();
    //   } else {
    //     router.push("/loyalties");
    //   }
    // }
    router.back();
  }, [metadata?.collection?.id, searchParams, router]);

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

  // ========== COMMENTED OUT AUTO-CLAIM LOGIC ==========
  // const handleAutoClaimNFT = useCallback(async () => {
  //   if (!metadata || !walletAddress || !metadataId || !currentQuest) {
  //     return;
  //   }

  //   if (!canStartMinting(walletAddress, metadataId)) {
  //     console.log("Cannot start minting - global check failed");
  //     return;
  //   }

  //   if (!currentQuest.is_completed || !nftClaiming.canMintAgain) {
  //     console.log(
  //       "Cannot start minting - quest not completed or already minted"
  //     );
  //     return;
  //   }

  //   console.log("Starting auto-claim NFT process");
  //   setAutoClaimInProgress(true);

  //   const nftData = {
  //     collection_id: metadata.collection.id,
  //     name: metadata.title,
  //     description: metadata.description,
  //     image_url: metadata.image_url,
  //     attributes: metadata.attributes ? metadata.attributes.split(", ") : [],
  //     recipient: walletAddress,
  //     chain_type: requiredChainType === "evm" ? "ethereum" : "sui",
  //     metadata_id: metadataId,
  //   };

  //   await NFTMintingService.mintNFT({
  //     walletAddress,
  //     metadataId,
  //     nftData,
  //     onSuccess: (data) => {
  //       toast.success("NFT automatically claimed!");
  //       setMintedNftData({
  //         name: metadata.title,
  //         description: metadata.description,
  //         image_url: metadata.image_url,
  //         recipient: walletAddress,
  //       });
  //       setShowNftModal(true);
  //     },
  //     onError: (error) => {
  //       console.error("Auto-claim error:", error);
  //       const errorMessage =
  //         error.response?.data?.message || error.message || "Auto-claim failed";

  //       if (
  //         errorMessage.includes("already claimed") ||
  //         errorMessage.includes("already minted")
  //       ) {
  //         toast.success("NFT has already been claimed");
  //       } else {
  //         toast.error(`Auto-claim failed: ${errorMessage}`);
  //       }
  //     },
  //   });
  // }, [
  //   metadata,
  //   walletAddress,
  //   metadataId,
  //   currentQuest,
  //   canStartMinting,
  //   nftClaiming.canMintAgain,
  //   requiredChainType,
  //   setAutoClaimInProgress,
  // ]);

  const handleClaimTask = async (taskId: number) => {
    if (!isWalletConnected || !walletAddress || !currentQuest) {
      toast.error("Please connect wallet to complete tasks");
      setOpenModal(true);
      return;
    }

    const task = currentQuest.tasks.find((t: any) => t.id === taskId);
    if (!task) {
      toast.error("Task not found");
      return;
    }

    try {
      setClaimingTaskId(taskId);

      try {
        const sessionKey = `task_progress_session_${walletAddress}`;
        const sessionProgress: number[] = JSON.parse(
          sessionStorage.getItem(sessionKey) || "[]"
        );
        if (!sessionProgress.includes(taskId)) {
          sessionProgress.push(taskId);
          sessionStorage.setItem(sessionKey, JSON.stringify(sessionProgress));
        }
      } catch {}

      toast.success("Task completed!");
      await refetchQuest();

      try {
        localStorage.setItem(
          "task_progress_ping",
          JSON.stringify({ ts: Date.now(), wallet: walletAddress })
        );
        localStorage.removeItem("task_progress_ping");
      } catch {}

      try {
        await axiosInstance.post("/platform/tasks/complete", {
          task_id: taskId,
          quest_id: currentQuest.id,
          owner_id: currentQuest.owner_id,
          wallet_address: walletAddress,
          chain_type: requiredChainType,
        });
        toast.success("Progress saved to your account");
      } catch (apiError: any) {
        console.error("Failed to save to API:", apiError);
        toast("Recorded locally. Syncing with server...", { icon: "⏳" });
      }
    } catch (error: any) {
      console.error("Error claiming task:", error);
      toast.error("Failed to complete task");
    } finally {
      setClaimingTaskId(null);
    }
  };

  const fetchMetadata = async () => {
    if (!walletAddress || !metadataId) return;

    try {
      setMetadataLoading(true);
      setMetadataError("");

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
      setMetadata(metadata_instance);

      // SIMPLIFIED: Only depend on API response for can_mint_again
      setCanMintAgain(can_mint_again !== undefined ? can_mint_again : true);
    } catch (error: any) {
      console.error("Error fetching metadata:", error);
      setMetadataError("Failed to load NFT details");
    } finally {
      setMetadataLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  // Update required chain type from metadata
  useEffect(() => {
    if (metadata?.collection?.contract?.Chain?.chain_type) {
      const chainType =
        metadata.collection.contract.Chain.chain_type === "ethereum"
          ? "evm"
          : "sui";
      setRequiredChainType(chainType);
    }
  }, [metadata?.collection?.contract?.Chain?.chain_type]);

  // ========== COMMENTED OUT MINTING STATE SYNC ==========
  // useEffect(() => {
  //   if (mounted && walletAddress && metadataId) {
  //     const hasMinted = MintingStateManager.hasMintedSuccessfully(
  //       walletAddress,
  //       metadataId
  //     );
  //     if (hasMinted) {
  //       setCanMintAgain(false);
  //     }
  //   }
  // }, [mounted, walletAddress, metadataId, setCanMintAgain]);

  // Fetch metadata when we have the metadata ID
  useEffect(() => {
    if (mounted && isWalletConnected && walletAddress && metadataId) {
      fetchMetadata();
    } else if (mounted && (!isWalletConnected || !metadataId)) {
      setMetadata(null);
      setMetadataLoading(true);
      setMetadataError("");
      setCanMintAgain(true);
    }
  }, [mounted, isWalletConnected, walletAddress, metadataId, setCanMintAgain]);

  // ========== COMMENTED OUT AUTO-CLAIM TRIGGER ==========
  // useEffect(() => {
  //   const shouldAutoMint = () => {
  //     return (
  //       mounted &&
  //       currentQuest?.is_completed &&
  //       nftClaiming.canMintAgain &&
  //       !nftClaiming.isMinting &&
  //       !nftClaiming.autoClaimInProgress &&
  //       walletAddress &&
  //       metadata &&
  //       metadataId &&
  //       canStartMinting(walletAddress, metadataId) &&
  //       !MintingStateManager.isMintingLocked(walletAddress, metadataId)
  //     );
  //   };

  //   if (shouldAutoMint()) {
  //     console.log("Triggering auto-claim in 2 seconds...");
  //     const timer = setTimeout(() => {
  //       handleAutoClaimNFT();
  //     }, 2000);

  //     return () => clearTimeout(timer);
  //   }
  // }, [
  //   mounted,
  //   currentQuest?.is_completed,
  //   nftClaiming.canMintAgain,
  //   nftClaiming.isMinting,
  //   nftClaiming.autoClaimInProgress,
  //   walletAddress,
  //   metadata,
  //   metadataId,
  //   handleAutoClaimNFT,
  // ]);

  // Loading states
  if (!mounted) {
    return (
      <LoadingScreen message="Loading..." isNSCollection={isNSCollection} />
    );
  }

  // Early return for invalid quest ID
  if (!isValidQuestId) {
    return (
      <ErrorScreen
        title="Invalid Quest"
        message="Invalid quest ID provided"
        onBack={() => router.push("/loyalties")}
        isNSCollection={isNSCollection}
      />
    );
  }

  // Early return for authentication
  if (!userId || !isWalletConnected || !isValidUserId) {
    return (
      <div className={`min-h-screen bg-[#000421]`}>
        <Navigation onBack={() => router.back()} />
        <div className="pt-20 sm:pt-20 md:pt-32 pb-6 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-12">
              <div className="text-4xl sm:text-6xl mb-4">🔒</div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">
                Login or Connect Wallet
              </h3>
              <p className="text-gray-400 text-sm sm:text-base mb-6">
                {!userId || !isValidUserId
                  ? "Please log in to view and complete quest tasks"
                  : "Please connect wallet to view and complete tasks"}
              </p>
              <button
                onClick={() => setOpenModal(true)}
                className="bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                {!userId || !isValidUserId ? "Login" : "Connect Wallet"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (questLoading) {
    return (
      <LoadingScreen
        message="Loading Quest..."
        isNSCollection={isNSCollection}
      />
    );
  }

  if (questError || !questData) {
    return (
      <ErrorScreen
        title="Quest Not Found"
        message="The requested quest could not be found"
        onBack={handleBack}
        isNSCollection={isNSCollection}
      />
    );
  }

  if (!currentQuest) {
    return (
      <ErrorScreen
        title="Quest Not Found"
        message="Unable to process quest data"
        onBack={handleBack}
        isNSCollection={isNSCollection}
      />
    );
  }

  // Show loading screen while fetching metadata (only if we have a metadata ID)
  if (metadataId && metadataLoading) {
    return (
      <LoadingScreen
        message="Loading NFT Details..."
        isNSCollection={isNSCollection}
      />
    );
  }

  // Show error if metadata failed to load (only if we have a metadata ID)
  if (metadataId && (metadataError || !metadata)) {
    return (
      <ErrorScreen
        title="NFT Details Not Found"
        message="Unable to load NFT reward details"
        onBack={handleBack}
        isNSCollection={isNSCollection}
      />
    );
  }

  // ========== SIMPLIFIED MINTING DISABLED CHECK ==========
  const isMintingDisabled = nftClaiming.isMinting;

  return (
    <div className={`min-h-screen bg-[#000421]`}>
      <Navigation onBack={handleBack} />

      <div className="pt-20 sm:pt-20 md:pt-32 pb-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
              {currentQuest.title}
            </h1>
            {currentQuest.description && (
              <p className="text-gray-400 text-sm sm:text-base mt-2">
                {currentQuest.description}
              </p>
            )}
          </div>

          {/* Collection Info Banner (if metadata is loaded) */}
          {metadata?.collection && (
            <div className="mb-6 p-4 bg-gray-800/30 rounded-lg border border-gray-600">
              <div className="flex items-center gap-3">
                <img
                  src={metadata.collection.image_uri}
                  alt={metadata.collection.name}
                  className="w-8 h-8 rounded-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "/default-collection.png";
                  }}
                />
                <div>
                  <h4 className="font-semibold text-white text-sm">
                    {metadata.collection.name}
                  </h4>
                  <p className="text-xs text-gray-400">
                    {metadata.collection.chain_name} • Quest Reward Available
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ========== COMMENTED OUT AUTO-CLAIMING INDICATORS ========== */}
          {/* {nftClaiming.autoClaimInProgress && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <div className="flex items-center justify-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-400"></div>
                <p className="text-green-300 font-medium">
                  Auto-claiming your NFT reward...
                </p>
              </div>
            </div>
          )} */}

          {/* ========== COMMENTED OUT CROSS-TAB MINTING INDICATOR ========== */}
          {/* {metadataId &&
            MintingStateManager.isMintingLocked(
              walletAddress || "",
              metadataId
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

          {/* NFT Display Header (only if quest has claimable metadata) */}
          {nftData && <QuestDetailHeader nftData={nftData} />}

          {/* Combined Quest Progress Header */}
          <div className="text-center mb-8">
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {currentQuest.is_completed ? "🎉" : "📋"}
                  </span>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-white">
                      {currentQuest.is_completed
                        ? "Quest Completed!"
                        : "Quest Tasks"}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {currentQuest.completed_tasks} of{" "}
                      {currentQuest.total_tasks} tasks completed
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-bold text-white">
                    {currentQuest.total_points} pts
                  </div>
                  <div className="text-xs text-gray-400">Total Reward</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Progress</span>
                  <span>
                    {Math.round(
                      (currentQuest.completed_tasks /
                        currentQuest.total_tasks) *
                        100
                    )}
                    %
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.round(
                        (currentQuest.completed_tasks /
                          currentQuest.total_tasks) *
                          100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              {/* NFT Reward Notice */}
              {currentQuest.is_completed && currentQuest.claimable_metadata && (
                <div className="mt-4 pt-4 border-t border-gray-600">
                  <p className="text-sm text-green-400 text-center flex items-center justify-center gap-2">
                    <span>✨</span>
                    NFT reward available for claiming!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Task List */}
          <QuestDetailList
            quest={currentQuest}
            isWalletConnected={isWalletConnected}
            requiredChainType={requiredChainType}
          />

          {/* Claim NFT Button (only if quest has claimable metadata) */}
          {nftData && (
            <QuestDetailClaimButton
              nftMinted={!nftClaiming.canMintAgain}
              claiming={false}
              setClaiming={() => {}}
              setNftMinted={(minted: boolean) => setCanMintAgain(!minted)}
              completionPercentage={Math.round(
                (currentQuest.completed_tasks / currentQuest.total_tasks) * 100
              )}
              totalQuests={1}
              completedQuests={currentQuest.is_completed ? 1 : 0}
              isWalletConnected={isWalletConnected}
              nftData={nftData}
              onSuccess={handleNFTMintSuccess}
              requiredChainType={requiredChainType}
              disabled={isMintingDisabled}
              metadataId={metadataId}
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
