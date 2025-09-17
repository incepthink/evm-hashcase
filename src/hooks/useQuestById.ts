// hooks/useQuestsById.ts
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axios";

// Types based on your backend models and controller
interface RequirementRule {
  field: string;
  values?: number[];
  stringValues?: string[];
}

interface TaskWithCompletion {
  id: number;
  quest_id: number;
  owner_id: number;
  title: string;
  description: string | null;
  task_code: string | null;
  requirement_rules: RequirementRule[];
  required_completions: number;
  reward_loyalty_points: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  isCompleted: boolean; // Added by the controller
}

interface QuestWithCompletion {
  id: number;
  owner_id: number;
  title: string;
  description: string | null;
  claimable_metadata: number | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  tasksWithCompletion: TaskWithCompletion[];
}

interface UseQuestByIdProps {
  id: string | number;
  userId: string | number;
}

interface UseQuestByIdReturn {
  data: QuestWithCompletion | undefined;
  isLoading: boolean;
  refetch: () => void;
  error: any;
}

export const useQuestById = ({ id, userId }: UseQuestByIdProps): UseQuestByIdReturn => {
  const { data, isLoading, refetch, error } = useQuery({
    queryKey: ["quest", id, userId],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/platform/quest/user/${id}/${userId}`);
      return data.quest as QuestWithCompletion;
    },
    enabled: !!id && !!userId, // Only run query if both id and userId are provided
  });

  return {
    data,
    isLoading,
    refetch,
    error,
  };
};

// Export types for use in components
export type { QuestWithCompletion, TaskWithCompletion, RequirementRule };