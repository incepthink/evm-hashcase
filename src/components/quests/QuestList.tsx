// components/QuestList.tsx
import React from "react";
import { useRouter } from "next/navigation";
import {
  ClipboardList,
  CheckCircle2,
  Trophy,
  ChevronRight,
  ClipboardX,
} from "lucide-react";
import { Collection } from "@/utils/modelTypes";
import { ShellTheme } from "@/components/collectionShell/theme";

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
  collection: Collection;
  theme: ShellTheme;
}

export const QuestList: React.FC<QuestListProps> = ({
  quests,
  isWalletConnected,
  requiredChainType = "sui",
  collection,
  theme,
}) => {
  const router = useRouter();

  const handleQuestClick = (questId: number) => {
    router.push(
      `/collections/${collection.name}/${collection.id}/quests/${questId}`
    );
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
                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mt-4">
                  <span className="flex items-center gap-1.5">
                    <ClipboardList className="w-3.5 h-3.5 text-gray-400" />
                    {quest.total_tasks}{" "}
                    {quest.total_tasks === 1 ? "task" : "tasks"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-gray-400" />
                    {quest.completed_tasks} completed
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5 text-gray-400" />
                    {quest.total_points} points
                  </span>
                </div>
              </div>

              {/* Quest Status */}
              <div className="flex-shrink-0 pr-4">
                {quest.is_completed ? (
                  <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-green-400 bg-green-900/20 px-2 sm:px-3 py-1 rounded border border-green-700">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Quest Completed
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
                  <span
                    className={`text-xs sm:text-sm ${theme.pill} px-2 sm:px-3 py-1 rounded border inline-block`}
                  >
                    {quest.completed_tasks}/{quest.total_tasks} Tasks
                  </span>
                )}
              </div>
            </div>

            {/* Click indicator arrow */}
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-white transition-colors">
              <ChevronRight className="w-5 h-5" />
            </div>
          </div>
        );
      })}

      {quests.length === 0 && (
        <div className="flex flex-col items-center text-center py-12">
          <div
            className={`mb-4 flex h-14 w-14 items-center justify-center rounded-full ${theme.pill}`}
          >
            <ClipboardX className="h-6 w-6" strokeWidth={1.75} />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            No Quests Available
          </h3>
          <p className="text-gray-400 text-sm">
            Check back later for new quests and challenges.
          </p>
        </div>
      )}
    </div>
  );
};
