// hooks/useTasksByCode.ts
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axios";

export interface RequirementRule {
  field: string;
  operator: string;
  values?: string[];
  stringValues?: string[];
}

export interface TaskWithCompletion {
  id: number;
  quest_id: number;
  owner_id: number;
  title: string;
  description?: string;
  requirement_rules?: RequirementRule[];
  required_completions: number;
  reward_loyalty_points: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  is_completed: boolean;
  completion_count: number;
  can_complete: boolean;
}

export interface QuestInfo {
  id: number;
  owner_id: number;
  title: string;
  description?: string;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
  claimable_metadata?: number | null;
}

export interface TasksByCodeResponse {
  tasks: TaskWithCompletion[];
  quest: QuestInfo;
}

interface UseTasksByCodeParams {
  taskCode: string;
  userId?: string | number;
  walletAddress?: string;
  enabled?: boolean;
}

export const useTasksByCode = ({
  taskCode,
  userId,
  walletAddress,
  enabled = true,
}: UseTasksByCodeParams) => {
  return useQuery({
    queryKey: ["tasks-by-code", taskCode, userId, walletAddress],
    queryFn: async (): Promise<TasksByCodeResponse> => {
      const params: any = {};
      
      if (userId) {
        params.user_id = userId;
      }
      
      if (walletAddress) {
        params.wallet_address = walletAddress;
      }

      try {
        const response = await axiosInstance.get(
          `/platform/quests/tasks/${taskCode}`,
          { params }
        );

        return response.data;
      } catch (error: any) {
        // Re-throw the error to preserve the original error structure
        throw error;
      }
    },
    enabled: enabled && !!taskCode,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry if it's a 404 or task not found error
      if (error?.response?.status === 404 || error?.response?.data?.error?.includes("Task not found")) {
        return false;
      }
      // Retry other errors up to 2 times
      return failureCount < 2;
    },
  });
};