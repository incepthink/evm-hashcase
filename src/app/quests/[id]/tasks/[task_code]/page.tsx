// evm app/quests/[id]/tasks/[task_code]/page.tsx
"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import axiosInstance from "@/utils/axios";
import { useGlobalAppStore } from "@/store/globalAppStore";
import { useTasksByCode } from "@/hooks/useTasksByCode";

// Components
import { LoadingScreen } from "@/components/quests/LoadingScreen";
import { ErrorScreen } from "@/components/quests/ErrorScreen";
import { Navigation } from "@/components/quests/Navigation";
import { NFTSuccessModal } from "@/components/quests/NFTSuccessModal";
import { TaskDetailHeader } from "@/components/tasks/TaskDetailHeader";
import { TaskDetailList } from "@/components/tasks/TaskDetailList";
import { QuestDetailClaimButton } from "@/components/questsDetails/QuestDetailClaimButton";

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

const TaskDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const questIdParam = String(params?.id || "");
  const taskCode = String(params?.task_code || "");
  const questId = parseInt(questIdParam);

  const [mounted, setMounted] = useState(false);
  const [showNftModal, setShowNftModal] = useState(false);
  const [mintedNftData, setMintedNftData] = useState<MintedNftData | null>(
    null
  );
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
    connectedWallets,
  } = useGlobalAppStore();

  // Validate questId early
  const isValidQuestId = !isNaN(questId) && questId > 0;

  // Get user ID
  const userId = user?.id;
  const isValidUserId = userId && !isNaN(Number(userId)) && Number(userId) > 0;

  // Get wallet info from global store
  const walletInfo = mounted ? getWalletForChain(requiredChainType) : null;
  const walletAddress = walletInfo?.address || null;
  const isWalletConnected = mounted && hasWalletForChain(requiredChainType);

  // Use the new hook to get tasks by task code
  const {
    data: tasksData,
    isLoading: tasksLoading,
    refetch: refetchTasks,
    error: tasksError,
  } = useTasksByCode({
    taskCode,
    userId: userId || "",
    walletAddress: walletAddress || "",
    enabled: mounted && !!taskCode && (!!userId || !!walletAddress),
  });

  // Calculate quest statistics
  const questStats = useMemo(() => {
    if (!tasksData?.tasks) {
      return {
        totalTasks: 0,
        completedTasks: 0,
        totalPoints: 0,
        isCompleted: false,
      };
    }

    const totalTasks = tasksData.tasks.length;
    const completedTasks = tasksData.tasks.filter(
      (task) => task.is_completed
    ).length;
    const totalPoints = tasksData.tasks.reduce(
      (sum, task) => sum + task.reward_loyalty_points,
      0
    );
    const isCompleted = completedTasks === totalTasks && totalTasks > 0;

    return {
      totalTasks,
      completedTasks,
      totalPoints,
      isCompleted,
    };
  }, [tasksData?.tasks]);

  // Get the metadata ID from the quest's claimable_metadata
  const metadataId = tasksData?.quest?.claimable_metadata;

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
    try {
      router.push(`/quests/${questId}`);
    } catch {
      if (typeof window !== "undefined" && window.history.length > 1) {
        window.history.back();
      } else {
        router.push("/loyalties");
      }
    }
  }, [questId, router]);

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

  // Fetch metadata when we have the metadata ID
  useEffect(() => {
    if (mounted && isWalletConnected && walletAddress && metadataId) {
      fetchMetadata();
    } else if (mounted && (!isWalletConnected || !metadataId)) {
      setMetadata(null);
      setMetadataLoading(false); // Change from true to false
      setMetadataError("");
      setCanMintAgain(true);
    }
  }, [mounted, isWalletConnected, walletAddress, metadataId]);

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
      <div className="min-h-screen bg-[#000421]">
        <Navigation onBack={handleBack} />
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

  if (tasksLoading) {
    return (
      <LoadingScreen
        message="Loading Tasks..."
        isNSCollection={isNSCollection}
      />
    );
  }

  if (tasksError || !tasksData) {
    // Handle specific "Task not found" error
    const errorMessage =
      tasksError?.response?.data?.error ||
      tasksError?.message ||
      "The requested tasks could not be found";
    const isTaskNotFound = errorMessage.includes("Task not found");

    return (
      <ErrorScreen
        title={isTaskNotFound ? "Invalid Task Code" : "Tasks Not Found"}
        message={
          isTaskNotFound
            ? `Task code "${taskCode}" was not found. Please check the task code and try again.`
            : errorMessage
        }
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

  const isMintingDisabled = nftClaiming.isMinting;

  return (
    <div className="min-h-screen bg-[#000421]">
      <Navigation onBack={handleBack} />

      <div className="pt-20 sm:pt-20 md:pt-32 pb-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
              {tasksData.quest.title}
            </h1>
            {tasksData.quest.description && (
              <p className="text-gray-400 text-sm sm:text-base mt-2">
                {tasksData.quest.description}
              </p>
            )}
            <div className="mt-2 text-sm text-purple-400">
              Task Code: {taskCode}
            </div>
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

          {/* NFT Display Header (only if quest has claimable metadata) */}
          {/* {nftData && <TaskDetailHeader nftData={nftData} />} */}

          {/* Combined Quest Progress Header */}
          <div className="text-center mb-8">
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {questStats.isCompleted ? "🎉" : "📋"}
                  </span>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-white">
                      {questStats.isCompleted
                        ? "Quest Completed!"
                        : "Quest Tasks"}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {questStats.completedTasks} of {questStats.totalTasks}{" "}
                      tasks completed
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-bold text-white">
                    {questStats.totalPoints} pts
                  </div>
                  <div className="text-xs text-gray-400">Total Reward</div>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Progress</span>
                  <span>
                    {questStats.totalTasks > 0
                      ? Math.round(
                          (questStats.completedTasks / questStats.totalTasks) *
                            100
                        )
                      : 0}
                    %
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        questStats.totalTasks > 0
                          ? Math.round(
                              (questStats.completedTasks /
                                questStats.totalTasks) *
                                100
                            )
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              {questStats.isCompleted && tasksData.quest.claimable_metadata ? (
                <div className="mt-4">
                  <p className="text-sm text-green-400 text-center flex items-center justify-center gap-2">
                    <span>✨</span>
                    NFT reward available for claiming!
                  </p>
                </div>
              ) : (
                <div className="mt-4">
                  <p className="text-sm text-green-400 text-center flex items-center justify-center gap-2">
                    <span>✨</span>
                    Complete all tasks to claim your NFT reward!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Claim NFT Button (only if quest has claimable metadata) */}
          {nftData && (
            <QuestDetailClaimButton
              nftMinted={!nftClaiming.canMintAgain}
              claiming={false}
              setClaiming={() => {}}
              setNftMinted={(minted: boolean) => setCanMintAgain(!minted)}
              completionPercentage={Math.round(
                (questStats.completedTasks / questStats.totalTasks) * 100
              )}
              totalQuests={1}
              completedQuests={questStats.isCompleted ? 1 : 0}
              isWalletConnected={isWalletConnected}
              nftData={nftData}
              onSuccess={handleNFTMintSuccess}
              requiredChainType={requiredChainType}
              disabled={isMintingDisabled}
              metadataId={metadataId || undefined}
            />
          )}

          {/* Task List with Completion Functionality */}
          <TaskDetailList
            tasks={tasksData.tasks}
            questTitle={tasksData.quest.title}
            isWalletConnected={isWalletConnected}
            requiredChainType={requiredChainType}
            highlightTaskCode={taskCode}
            onTaskComplete={refetchTasks}
          />
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

export default TaskDetailPage;
