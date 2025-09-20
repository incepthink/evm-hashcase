// components/quests/QuestDetailList.tsx
"use client";

import { RequirementRule, TaskWithCompletion } from "@/hooks/useQuestById";

interface Task extends TaskWithCompletion {
  is_completed?: boolean; // Legacy compatibility
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
  tasks: Task[];
  total_tasks: number;
  completed_tasks: number;
  is_completed: boolean;
  total_points: number;
}

interface QuestDetailListProps {
  quest: Quest;
  isWalletConnected: boolean;
  requiredChainType?: "sui" | "evm";
}

export const QuestDetailList: React.FC<QuestDetailListProps> = ({
  quest,
  isWalletConnected,
  requiredChainType = "sui",
}) => {
  const getTaskStatusIcon = (task: Task): string => {
    if (!isWalletConnected) return "🔒";
    // Check both isCompleted (from backend) and is_completed (legacy)
    const completed = task.isCompleted || task.is_completed;
    return completed ? "✅" : "⏳";
  };

  const getTaskStatusText = (task: Task): string => {
    if (!isWalletConnected) return "Connect Wallet";
    const completed = task.isCompleted || task.is_completed;
    return completed ? "Completed" : "Pending";
  };

  const getTaskStatusColor = (task: Task): string => {
    if (!isWalletConnected)
      return "text-gray-400 bg-gray-800/20 border-gray-600";
    const completed = task.isCompleted || task.is_completed;
    return completed
      ? "text-green-400 bg-green-900/20 border-green-700"
      : "text-blue-400 bg-blue-900/20 border-blue-700";
  };

  // Filter active tasks
  const activeTasks = quest.tasks.filter((task: Task) => task.is_active);

  if (activeTasks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl sm:text-6xl mb-4">📝</div>
        <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
          No Active Tasks
        </h3>
        <p className="text-gray-400 text-sm sm:text-base">
          This quest has no active tasks at the moment.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2 sm:space-y-3">
      {activeTasks.map((task: Task, index: number) => {
        const isCompleted = task.isCompleted || task.is_completed;

        return (
          <div
            key={task.id}
            className="group bg-gray-900 border border-gray-700 rounded-lg p-3 sm:p-4 relative overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-3 sm:space-y-0">
              {/* Task Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm">{getTaskStatusIcon(task)}</span>
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    {task.title}
                  </h3>
                  <span className="text-xs text-gray-500 bg-gray-800/50 px-2 py-1 rounded">
                    Task {index + 1}
                  </span>
                </div>

                {task.description && (
                  <p className="text-gray-400 text-xs sm:text-sm mb-3 ml-6">
                    {task.description}
                  </p>
                )}

                {/* Task Stats */}
                <div className="flex flex-wrap items-center gap-3 ml-6 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <span className="text-yellow-400">🎯</span>
                    {task.reward_loyalty_points} points
                  </span>
                  {task.required_completions > 1 && (
                    <span className="flex items-center gap-1">
                      <span className="text-blue-400">🔄</span>
                      {task.required_completions} completions required
                    </span>
                  )}
                </div>
              </div>

              {/* Task Status */}
              <div className="flex-shrink-0 sm:ml-4">
                <span
                  className={`text-xs sm:text-sm px-3 py-2 rounded border inline-block ${getTaskStatusColor(
                    task
                  )}`}
                >
                  {getTaskStatusText(task)}
                </span>
              </div>
            </div>

            {/* Task completion indicator */}
            {isCompleted && (
              <div className="absolute top-2 right-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            )}

            {/* Requirement Rules Display (if available) */}
            {task.requirement_rules &&
              Array.isArray(task.requirement_rules) &&
              task.requirement_rules.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <div className="text-xs text-gray-500 mb-2">
                    Requirements:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {task.requirement_rules.map(
                      (rule: RequirementRule, ruleIndex: number) => (
                        <span
                          key={ruleIndex}
                          className="text-xs bg-gray-800/50 text-gray-400 px-2 py-1 rounded border border-gray-600"
                        >
                          {rule.field}:{" "}
                          {rule.values?.join(", ") ||
                            rule.stringValues?.join(", ") ||
                            "Any"}
                        </span>
                      )
                    )}
                  </div>
                </div>
              )}
          </div>
        );
      })}
    </div>
  );
};
