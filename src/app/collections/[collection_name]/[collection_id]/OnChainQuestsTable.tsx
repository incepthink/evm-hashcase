"use client";
import { useEffect, useState } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useLoyaltyPointsTransactions } from "@/app/hooks/useLoyaltyPointsTransactions";
import { useGlobalAppStore } from "@/store/globalAppStore";
import { toast } from "react-hot-toast";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

type UserProgress = {
  currentCount: number;
  requiredCount: number;
  isCompleted: boolean;
  lastUpdated: string;
  completedAt: string | null;
};

type Quest = {
  id: number;
  owner_id: number;
  title: string;
  description: string;
  reward_loyalty_points: number;
  required_completions: number;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
  userProgress?: UserProgress;
};

const OnChainQuestsTable = ({
  owner_id,
}: {
  owner_id: number;
}) => {
  const { user, isUserVerified } = useGlobalAppStore();
  const currentAccount = useCurrentAccount();
  const { completeQuest, isLoading } = useLoyaltyPointsTransactions();
  
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Single quest for now - 10 points one time
  const defaultQuest: Quest = {
    id: 1,
    owner_id: owner_id,
    title: "Complete On-Chain Quest",
    description: "Click to complete this quest and earn 10 on-chain points",
    reward_loyalty_points: 10,
    required_completions: 1,
    is_active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userProgress: {
      currentCount: 0,
      requiredCount: 1,
      isCompleted: false,
      lastUpdated: new Date().toISOString(),
      completedAt: null
    }
  };

  const fetchQuests = async () => {
    try {
      setLoading(true);
      // For now, just use the default quest
      setQuests([defaultQuest]);
    } catch (error) {
      console.error("Error fetching quests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuestAction = async (quest: Quest) => {
    if (!isUserVerified || !user) {
      toast.error("Please connect your wallet and verify your account first.");
      return;
    }

    if (!currentAccount?.address) {
      toast.error("Please connect your wallet first.");
      return;
    }

    if (quest.userProgress?.isCompleted) {
      toast.error("Quest already completed!");
      return;
    }

    try {
      const result = await completeQuest("simple_quest");
      
      if (result) {
        // Mark quest as completed
        setQuests(prevQuests => 
          prevQuests.map(q => 
            q.id === quest.id ? {
              ...q,
              userProgress: {
                ...q.userProgress!,
                currentCount: 1,
                isCompleted: true,
                completedAt: new Date().toISOString()
              }
            } : q
          )
        );
        
        toast.success(`Quest completed! You earned ${quest.reward_loyalty_points} on-chain points!`);
      }
    } catch (error) {
      console.error("Error completing quest:", error);
    }
  };

  useEffect(() => {
    fetchQuests();
  }, [owner_id]);

  if (loading) {
    return (
      <div className="bg-gradient-to-b from-[#00041f] to-[#030828] flex flex-col items-center justify-center p-8 text-white min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading on-chain quests...</p>
        </div>
      </div>
    );
  }

  if (!quests || quests.length === 0) {
    return (
      <div className="bg-gradient-to-b from-[#00041f] to-[#030828] text-center py-8">
        No on-chain quests found
      </div>
    );
  }

  const activeQuests = quests.filter((quest) => quest.is_active);
  const completedQuests = quests.filter(
    (quest) => quest.userProgress?.isCompleted
  );
  const totalXp = quests.reduce(
    (sum, quest) => sum + quest.reward_loyalty_points,
    0
  );

  return (
    <div className="bg-gradient-to-b from-[#00041f] to-[#030828] p-6 shadow-2xl">
      <div className="xl:max-w-[80%] mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            ON-CHAIN QUEST BOARD
          </h1>
          <div className="flex items-center space-x-4 text-white">
            <div className="bg-[#3f54b4]/50 px-4 py-2 rounded-full">
              <span className="text-base font-medium">
                Active: {activeQuests.length}
              </span>
            </div>
          </div>
        </div>

        {/* Quests List */}
        <div className="space-y-4 mb-8">
          {quests.map((quest) => {
            const progress = quest.userProgress || {
              currentCount: 0,
              requiredCount: quest.required_completions,
              isCompleted: false,
            };
            const percentage = Math.min(
              Math.round(
                (progress.currentCount / progress.requiredCount) * 100
              ),
              100
            );

            return (
              <div
                key={quest.id}
                className="bg-[#1a1f3d]/80 hover:bg-[#1a1f3d] transition-colors rounded-lg p-4 flex items-center"
              >
                <div className="w-16 h-16 mr-4">
                  <CircularProgressbar
                    value={percentage}
                    text={`${percentage}%`}
                    styles={{
                      path: {
                        stroke: progress.isCompleted ? "#10B981" : "#3B82F6",
                      },
                      text: {
                        fill: "#fff",
                        fontSize: "24px",
                      },
                      trail: {
                        stroke: "#1E293B",
                      },
                    }}
                  />
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-medium text-white">
                    {quest.title}
                  </h3>
                  <p className="text-sm text-gray-400">{quest.description}</p>
                  <div className="mt-2 flex items-center">
                    <span className="text-yellow-400 text-sm font-medium">
                      {quest.reward_loyalty_points} XP (On-Chain)
                    </span>
                    <span
                      className={`ml-4 px-2 py-1 rounded-full text-xs ${
                        quest.is_active
                          ? "bg-green-900/30 text-green-400"
                          : "bg-red-900/30 text-red-400"
                      }`}
                    >
                      {quest.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                {quest.is_active && !progress.isCompleted && (
                  <button
                    onClick={() => handleQuestAction(quest)}
                    disabled={isLoading}
                    className="ml-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white disabled:opacity-50"
                  >
                    {isLoading ? "Processing..." : "Complete Quest"}
                  </button>
                )}

                {quest.is_active && progress.isCompleted && (
                  <div className="ml-4 px-4 py-2 bg-green-600 rounded-lg text-white flex items-center">
                    <span className="text-sm font-medium">Completed</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 text-center text-white">
          <div className="bg-[#3f54b4]/20 p-3 rounded-lg">
            <p className="text-xs text-white/60">TOTAL QUESTS</p>
            <p className="text-xl font-bold">{quests.length}</p>
          </div>
          <div className="bg-[#3f54b4]/20 p-3 rounded-lg">
            <p className="text-xs text-white/60">COMPLETED</p>
            <p className="text-xl font-bold">{completedQuests.length}</p>
          </div>
          <div className="bg-[#3f54b4]/20 p-3 rounded-lg">
            <p className="text-xs text-white/60">TOTAL XP</p>
            <p className="text-xl font-bold">{totalXp}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnChainQuestsTable;
