// components/tasks/TaskDetailList.tsx
"use client";

import { useState } from "react";
import axiosInstance from "@/utils/axios";
import toast from "react-hot-toast";
import { useGlobalAppStore } from "@/store/globalAppStore";
import { RequirementRule, TaskWithCompletion } from "@/hooks/useTasksByCode";

interface TaskDetailListProps {
  tasks: TaskWithCompletion[];
  questTitle: string;
  isWalletConnected: boolean;
  requiredChainType?: "sui" | "evm";
  highlightTaskCode?: string;
  onTaskComplete?: () => void;
}

export const TaskDetailList: React.FC<TaskDetailListProps> = ({
  tasks,
  questTitle,
  isWalletConnected,
  requiredChainType = "sui",
  highlightTaskCode,
  onTaskComplete,
}) => {
  const [completingTasks, setCompletingTasks] = useState<Set<number>>(
    new Set()
  );
  const { setOpenModal, user } = useGlobalAppStore();

  const getTaskStatusIcon = (task: TaskWithCompletion): string => {
    if (!isWalletConnected) return "🔒";
    return task.is_completed ? "✅" : "⏳";
  };

  const getTaskStatusText = (task: TaskWithCompletion): string => {
    if (!isWalletConnected) return "Connect Wallet";
    return task.is_completed ? "Completed" : "Pending";
  };

  const getTaskStatusColor = (task: TaskWithCompletion): string => {
    if (!isWalletConnected)
      return "text-gray-400 bg-gray-800/20 border-gray-600";
    return task.is_completed
      ? "text-green-400 bg-green-900/20 border-green-700"
      : "text-blue-400 bg-blue-900/20 border-blue-700";
  };

  const getTaskButton = (task: TaskWithCompletion) => {
    const isCompleting = completingTasks.has(task.id);

    if (!isWalletConnected) {
      return null; // No button when wallet not connected
    }

    if (task.is_completed) {
      return (
        <span className="text-xs sm:text-sm px-3 py-2 rounded border text-green-400 bg-green-900/20 border-green-700 inline-block text-center">
          ✅ Completed
        </span>
      );
    }

    if (task.can_complete) {
      return (
        <button
          onClick={() => handleCompleteTask(task)}
          disabled={isCompleting}
          className={`text-xs sm:text-sm px-3 py-2 rounded border transition-colors ${
            isCompleting
              ? "bg-gray-600 text-gray-400 border-gray-600 cursor-not-allowed"
              : "bg-white text-black border-white hover:bg-gray-100 font-medium"
          }`}
        >
          {isCompleting ? "Completing..." : "Complete Task"}
        </button>
      );
    }

    // Task is pending but cannot be completed yet
    return (
      <span className="text-xs sm:text-sm px-3 py-2 rounded border text-blue-400 bg-blue-900/20 border-blue-700 inline-block text-center">
        ⏳ Pending
      </span>
    );
  };

  const handleCompleteTask = async (task: TaskWithCompletion) => {
    if (!isWalletConnected && !user?.id) {
      toast.error("Please connect wallet or sign in to complete tasks");
      setOpenModal(true);
      return;
    }

    try {
      setCompletingTasks((prev) => new Set(prev).add(task.id));

      const payload: any = {
        task_id: task.id,
        owner_id: task.owner_id,
      };

      if (user?.id) {
        payload.user_id = user.id;
      }

      // Find task code - we need this for the API call
      // Since we don't have task_code in the response, we'll use the highlighted one
      // or we need to modify the backend to include task_code
      const taskCodeToUse = highlightTaskCode; // This should be the current task code

      if (!taskCodeToUse) {
        throw new Error("Task code not available");
      }

      await axiosInstance.post(
        `/platform/quests/tasks/${taskCodeToUse}/complete`,
        payload
      );

      toast.success("Task completed successfully!");

      // Call the callback to refetch task data
      if (onTaskComplete) {
        onTaskComplete();
      }

      // Ping other tabs about the update
      try {
        localStorage.setItem(
          "task_progress_ping",
          JSON.stringify({
            ts: Date.now(),
            wallet: user?.id,
            taskCode: taskCodeToUse,
          })
        );
        localStorage.removeItem("task_progress_ping");
      } catch {}
    } catch (err: any) {
      console.error("Error completing task:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to complete task";

      if (errorMessage.includes("already completed")) {
        toast.error("Task has already been completed");
        if (onTaskComplete) {
          onTaskComplete();
        }
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setCompletingTasks((prev) => {
        const newSet = new Set(prev);
        newSet.delete(task.id);
        return newSet;
      });
    }
  };

  // Filter active tasks
  const activeTasks = tasks.filter((task) => task.is_active);

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
      {activeTasks.map((task, index) => {
        const isHighlighted = highlightTaskCode && task.can_complete;
        const isCompleting = completingTasks.has(task.id);

        return (
          <div
            key={task.id}
            className={`group bg-gray-900 border rounded-lg p-3 sm:p-4 relative overflow-hidden transition-all duration-200 ${
              isHighlighted
                ? "border-purple-500/50 bg-purple-900/10 ring-1 ring-purple-500/30"
                : "border-gray-700"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-3 sm:space-y-0">
              {/* Task Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {/* <span className="text-sm">{getTaskStatusIcon(task)}</span> */}
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    {task.title}
                  </h3>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500 bg-gray-800/50 px-2 py-1 rounded">
                      Task {index + 1}
                    </span>
                    {isHighlighted && (
                      <span className="text-xs ml-1 bg-purple-600 text-white px-2 py-1 rounded-full">
                        Current
                      </span>
                    )}
                  </div>
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
                  {task.completion_count > 0 && (
                    <span className="flex items-center gap-1">
                      <span className="text-green-400">✓</span>
                      {task.completion_count}/{task.required_completions}{" "}
                      completed
                    </span>
                  )}
                </div>
              </div>

              {/* Task Actions - Single Button */}
              <div className="flex-shrink-0 sm:ml-4 flex justify-center items-center">
                {getTaskButton(task)}
              </div>
            </div>

            {/* Task completion indicator */}
            {task.is_completed && (
              <div className="absolute top-2 left-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            )}

            {/* Requirement Rules Display */}
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

            {/* Loading Indicator for Current Task */}
            {isCompleting && (
              <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center rounded-lg">
                <div className="flex items-center gap-2 text-white">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span className="text-sm">Completing...</span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
