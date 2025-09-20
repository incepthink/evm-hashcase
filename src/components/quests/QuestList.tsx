// components/QuestList.tsx
import React from "react";
import { useRouter } from "next/navigation";

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
  isCompleted: boolean; // Updated to match new API response
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
  tasksWithCompletion: Task[]; // Updated to match new API response
  total_tasks: number;
  completed_tasks: number;
  is_completed: boolean;
  total_points: number;
}

interface QuestListProps {
  quests: Quest[];
  isWalletConnected: boolean;
  requiredChainType?: "sui" | "evm";
  collectionId: number | string;
}

export const QuestList: React.FC<QuestListProps> = ({
  quests,
  isWalletConnected,
  requiredChainType = "sui",
  collectionId,
}) => {
  const router = useRouter();

  const handleQuestClick = (questId: number) => {
    router.push(`/quests/${questId}`);
  };

  const getWalletConnectMessage = () => {
    const chainName = requiredChainType === "evm" ? "EVM Wallet" : "Sui Wallet";
    return `Connect ${chainName} to Claim`;
  };

  return (
    <div className="space-y-2 sm:space-y-3">
      {quests.map((quest) => {
        return (
          <div
            key={quest.id}
            className="group bg-gray-900 border border-gray-700 rounded-lg p-3 sm:p-4 relative overflow-hidden cursor-pointer hover:bg-gray-800/50 transition-colors"
            onClick={() => handleQuestClick(quest.id)}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              {/* Quest Info */}
              <div className="flex-1">
                <h3 className="text-sm sm:text-base font-bold text-white mb-1 sm:mb-0">
                  {quest.title}
                </h3>

                {quest.description && (
                  <p className="text-gray-400 text-xs sm:text-sm mb-2">
                    {quest.description}
                  </p>
                )}

                {/* Quest Stats */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <span className="text-blue-400">📋</span>
                    {quest.total_tasks}{" "}
                    {quest.total_tasks === 1 ? "task" : "tasks"}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="text-green-400">✅</span>
                    {quest.completed_tasks} completed
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="text-yellow-400">🎯</span>
                    {quest.total_points} points
                  </span>
                </div>
              </div>

              {/* Quest Status */}
              <div className="flex-shrink-0 pr-4">
                {quest.is_completed ? (
                  <span className="text-xs sm:text-sm text-green-400 bg-green-900/20 px-2 sm:px-3 py-1 rounded border border-green-700 inline-block">
                    ✓ Quest Completed
                  </span>
                ) : !isWalletConnected ? (
                  <span
                    className="text-xs sm:text-sm text-gray-400 bg-gray-800/20 px-2 sm:px-3 py-1 rounded border border-gray-600 inline-block"
                    title={`Connect a ${
                      requiredChainType === "evm" ? "EVM" : "Sui"
                    } wallet to complete quests`}
                  >
                    {getWalletConnectMessage()}
                  </span>
                ) : (
                  <span className="text-xs sm:text-sm text-blue-400 bg-blue-900/20 px-2 sm:px-3 py-1 rounded border border-blue-600 inline-block">
                    {quest.completed_tasks}/{quest.total_tasks} Tasks
                  </span>
                )}
              </div>
            </div>

            {/* Click indicator arrow */}
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-white transition-colors">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
        );
      })}

      {quests.length === 0 && (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📝</div>
          <h3 className="text-lg font-semibold text-white mb-2">
            No Quests Available
          </h3>
          <p className="text-gray-400 text-sm">
            Check back later for new quests and challenges!
          </p>
        </div>
      )}
    </div>
  );
};
