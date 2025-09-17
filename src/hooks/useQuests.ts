// hooks/useQuests.ts
"use client";

import { useEffect, useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axios";
import toast from "react-hot-toast";

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
  is_completed?: boolean;
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
  // Computed properties
  total_tasks: number;
  completed_tasks: number;
  is_completed: boolean;
  total_points: number;
}

interface UseQuestsProps {
  collection: any;
  walletAddress: string | null | undefined;
  isWalletConnected: boolean;
  mounted: boolean;
  requiredChainType?: 'sui' | 'evm';
}

export const useQuests = ({ 
  collection, 
  walletAddress, 
  isWalletConnected, 
  mounted, 
  requiredChainType = 'sui' 
}: UseQuestsProps) => {
  const [nftMinted, setNftMinted] = useState(false);
  const prevIsConnectedRef = useRef<boolean | null>(null);

  const {
    data: quests = [],
    isLoading,
    refetch,
    error,
  } = useQuery({
    queryKey: ["quests", collection?.owner_id, walletAddress, requiredChainType],
    queryFn: async () => {
      if (!collection || !collection.owner_id) {
        return [];
      }

      try {
        // Use the new API endpoint
        const response = await axiosInstance.get(`/platform/quest/owner/${collection.owner_id}`);
        console.log("QUEST", response.data);
        
        // Get session completed tasks if wallet is connected
        let sessionCompletedTasks: number[] = [];
        try {
          const sessionKey = walletAddress
            ? `task_progress_session_${walletAddress}`
            : null;
          sessionCompletedTasks = sessionKey
            ? JSON.parse(sessionStorage.getItem(sessionKey) || "[]")
            : [];
        } catch {}

        return (response.data.quests || []).map((quest: any) => {
          const tasks = (quest.tasks || []).map((task: any) => {
            // Check if task is completed from session storage
            const isCompletedFromSession = sessionCompletedTasks.includes(task.id);
            
            return {
              id: task.id,
              quest_id: task.quest_id,
              owner_id: task.owner_id,
              title: task.title,
              description: task.description,
              task_code: task.task_code,
              requirement_rules: task.requirement_rules,
              required_completions: task.required_completions,
              reward_loyalty_points: task.reward_loyalty_points,
              is_active: task.is_active,
              created_at: task.created_at,
              updated_at: task.updated_at,
              is_completed: walletAddress ? isCompletedFromSession : false,
            } as Task;
          });

          // Calculate quest completion metrics
          const totalTasks = tasks.length;
          const completedTasks = tasks.filter((task: any) => task.is_completed).length;
          const isQuestCompleted = totalTasks > 0 && completedTasks === totalTasks;
          const totalPoints = tasks.reduce((sum: any, task: any) => sum + task.reward_loyalty_points, 0);

          return {
            id: quest.id,
            owner_id: quest.owner_id,
            title: quest.title,
            description: quest.description,
            is_active: quest.is_active,
            createdAt: quest.createdAt,
            updatedAt: quest.updatedAt,
            claimable_metadata: quest.claimable_metadata,
            tasks,
            total_tasks: totalTasks,
            completed_tasks: completedTasks,
            is_completed: isQuestCompleted,
            total_points: totalPoints,
          } as Quest;
        });
      } catch (err) {
        console.error("Error fetching quests:", err);
        toast.error("Failed to load quests");
        throw err;
      }
    },
    enabled: mounted && !!collection?.owner_id,
    retry: 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Handle error state
  useEffect(() => {
    if (error) {
      console.error("Quest query error:", error);
      toast.error("Failed to load quests");
    }
  }, [error]);

  // Handle wallet connection changes
  useEffect(() => {
    if (!mounted) return;
    const prev = prevIsConnectedRef.current;
    prevIsConnectedRef.current = isWalletConnected;

    if (prev !== isWalletConnected) {
      refetch();
    }

    if (prev === true && isWalletConnected === false) {
      setNftMinted(false);
      try {
        localStorage.removeItem("nft_minted_ns_daily");
        const keysToRemove: string[] = [];
        for (let i = 0; i < sessionStorage.length; i++) {
          const k = sessionStorage.key(i);
          if (k && (k.startsWith("quest_progress_session_") || k.startsWith("task_progress_session_")))
            keysToRemove.push(k);
        }
        keysToRemove.forEach((k) => sessionStorage.removeItem(k));
      } catch {}
    }
  }, [mounted, isWalletConnected, refetch, requiredChainType]);

  // Handle NFT minted status - FIXED VERSION
  useEffect(() => {
    if (!mounted || isLoading) return;

    // Always check localStorage first to restore minted state
    const savedNftStatus = localStorage.getItem("nft_minted_ns_daily");
    
    if (quests.length > 0) {
      const completedQuests = quests.filter((quest: Quest) => quest.is_completed).length;
      const totalQuests = quests.length;
      const currentCompletionPercentage =
        totalQuests > 0 ? Math.round((completedQuests / totalQuests) * 100) : 0;

      // If localStorage says NFT is minted and completion is 100%, keep it minted
      if (savedNftStatus === "true" && currentCompletionPercentage === 100) {
        setNftMinted(true);
      }
      // If localStorage says NFT is minted but completion is < 100%, trust localStorage
      // This handles the case where data is still loading or there's a temporary inconsistency
      else if (savedNftStatus === "true") {
        setNftMinted(true);
      }
      // Only set to false and remove localStorage if completion drops below 100% 
      // AND there's no saved status (meaning user hasn't minted yet)
      else if (currentCompletionPercentage < 100 && savedNftStatus !== "true") {
        setNftMinted(false);
        // Don't remove localStorage here - only remove when user actually disconnects wallet
      }
      // If no saved status and 100% complete, don't mint (wait for user to claim)
      else if (!savedNftStatus && currentCompletionPercentage === 100) {
        setNftMinted(false);
      }
    } else {
      // If no quests loaded but localStorage says minted, trust localStorage
      if (savedNftStatus === "true") {
        setNftMinted(true);
      }
    }
  }, [quests, mounted, isLoading]);

  // Listen for storage events
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if ((e.key === "quest_progress_ping" || e.key === "task_progress_ping") && e.newValue) {
        refetch();
      }
      // Also listen for NFT minted status changes
      if (e.key === "nft_minted_ns_daily") {
        setNftMinted(e.newValue === "true");
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [refetch]);

  const completedQuests = mounted && isWalletConnected && !isLoading
    ? quests.filter((q: Quest) => q.is_completed).length
    : 0;
  const totalQuests = !isLoading ? quests.length : 0;
  const completionPercentage = mounted && isWalletConnected && !isLoading && totalQuests > 0
    ? Math.round((completedQuests / totalQuests) * 100)
    : 0;

  return {
    quests,
    isLoading,
    completedQuests,
    totalQuests,
    completionPercentage,
    nftMinted,
    setNftMinted,
    refetch,
    error,
  };
};