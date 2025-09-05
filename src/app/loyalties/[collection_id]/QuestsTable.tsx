"use client";
import { useEffect, useState } from "react";
import axiosInstance from "@/utils/axios";
import { Flame } from "lucide-react";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

type RequirementRule = {
  action: string;
  count: number;
};

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
  requirement_rules: RequirementRule;
  createdAt: string;
  updatedAt: string;
  userProgress?: UserProgress;
};

const QuestsTable = ({
  owner_id,
  user_id,
}: {
  owner_id: number;
  user_id?: number;
}) => {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  console.log("QuestsTable props:", { owner_id, user_id });

  const fetchQuests = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/platform/quest/by-owner", {
        params: { 
          owner_id,
          user_id: user_id || undefined // Include user_id to get progress data
        },
      });

      console.log("Quests response:", response.data.quests);

      setQuests(response.data.quests);
    } catch (error) {
      console.error("Error fetching quests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuestAction = async (actionType: string, quest_id: number) => {
    try {
      const questActionResponse = await axiosInstance.post(
        "/user/quest/complete-objective-single",
        {
          owner_id,
          quest_id,
          action: { type: actionType || "offchain_demo" },
        }
      );

      console.log("Quest action response:", questActionResponse.data);

      // Optimized update - no need to refetch all quests
      setQuests((prevQuests) => {
        return prevQuests.map((quest) => {
          if (quest.id === quest_id) {
            // Update only the specific quest that changed
            // The API returns { achievement, updatedQuest: { questId, progress } }
            const updatedProgress = questActionResponse.data.updatedQuest?.progress;
            if (updatedProgress) {
              return {
                ...quest,
                userProgress: updatedProgress,
              };
            }
          }
          return quest;
        });
      });

      // Refetch quests to ensure we have the latest data
      await fetchQuests();
    } catch (error) {
      console.error("Error updating quest:", error);
    }
  };

  useEffect(() => {
    fetchQuests();
  }, [owner_id, user_id]);

  if (loading) {
    return (
      <div className="bg-gradient-to-b from-[#00041f] to-[#030828] flex flex-col items-center justify-center p-8 text-white min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading quests...</p>
        </div>
      </div>
    );
  }

  if (!quests || quests.length === 0) {
    return (
      <div className="bg-gradient-to-b from-[#00041f] to-[#030828] text-center py-8">
        No quests found
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
            QUEST BOARD
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
            const rules: any = (quest as any).requirement_rules;
            // Normalize rules: can be array or JSON string
            let normalizedRules: any[] = [];
            if (Array.isArray(rules)) normalizedRules = rules;
            else if (typeof rules === "string") {
              try {
                const parsed = JSON.parse(rules);
                if (Array.isArray(parsed)) normalizedRules = parsed;
              } catch {}
            }
            const actionRule = normalizedRules.find(
              (r: any) => (
                r?.field === "action_type" || r?.field === "action"
              ) && Array.isArray(r?.stringValues) && r.stringValues.length > 0
            );
            const requiredActionType = typeof actionRule?.stringValues?.[0] === "string" && actionRule.stringValues[0].length > 0 ? actionRule.stringValues[0] : undefined;
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
                      {quest.reward_loyalty_points} XP
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
                  requiredActionType ? (
                    <button
                      onClick={() => handleQuestAction(requiredActionType, quest.id)}
                      className="ml-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white"
                    >
                      Complete Action
                    </button>
                  ) : (
                    <button
                      disabled
                      title="This quest requires an unsupported action"
                      className="ml-4 px-4 py-2 bg-gray-600 rounded-lg text-white opacity-60 cursor-not-allowed"
                    >
                      Unavailable
                    </button>
                  )
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

export default QuestsTable;
