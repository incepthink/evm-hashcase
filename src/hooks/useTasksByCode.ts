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

export interface RewardToken {
  id: number;
  name: string;
  symbol: string;
  total_supply?: string | null;
  can_claim_again: boolean; // NEW FIELD
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
  reward_token_id?: number | null;
  reward_token_amount?: number | null;
  reward_token?: RewardToken | null;
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
        throw error;
      }
    },
    enabled: enabled && !!taskCode,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 404 || error?.response?.data?.error?.includes("Task not found")) {
        return false;
      }
      return failureCount < 2;
    },
  });
};