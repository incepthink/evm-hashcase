// hooks/useQuests.ts
"use client";

import { useEffect, useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axios";
import toast from "react-hot-toast";

interface Quest {
  id: number;
  title: string;
  description: string;
  quest_code: string;
  points_reward: number;
  is_completed?: boolean;
  owner_id: number;
  created_at: string;
  updated_at: string;
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
        const params: { owner_id: number; wallet_address?: string } = {
          owner_id: collection.owner_id,
        };
        if (walletAddress) {
          params.wallet_address = walletAddress;
        }

        console.log(`🔍 Fetching quests for ${requiredChainType} chain with wallet:`, walletAddress?.slice(0, 8) + '...');

        const response = await axiosInstance.get("/platform/quest/by-owner", {
          params,
        });

        let sessionCompleted: number[] = [];
        try {
          const sessionKey = walletAddress
            ? `quest_progress_session_${walletAddress}`
            : null;
          sessionCompleted = sessionKey
            ? JSON.parse(sessionStorage.getItem(sessionKey) || "[]")
            : [];
        } catch {}

        return (response.data.quests || []).map((quest: any) => {
          const isCompletedFromAPI = quest.userProgress?.isCompleted || false;
          const isCompletedFromSession = sessionCompleted.includes(quest.id);
          const isCompleted = isCompletedFromAPI || isCompletedFromSession;

          return {
            id: quest.id,
            title: quest.title,
            description: quest.description,
            quest_code: quest.quest_code,
            points_reward: quest.reward_loyalty_points,
            owner_id: quest.owner_id,
            created_at: quest.createdAt,
            updated_at: quest.updatedAt,
            is_completed: walletAddress ? isCompleted : false,
          } as Quest;
        });
      } catch (err) {
        console.error("❌ Error fetching quests:", err);
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
      console.error("❌ Quest query error:", error);
      toast.error("Failed to load quests");
    }
  }, [error]);

  // Handle wallet connection changes
  useEffect(() => {
    if (!mounted) return;
    const prev = prevIsConnectedRef.current;
    prevIsConnectedRef.current = isWalletConnected;

    if (prev !== isWalletConnected) {
      console.log(`🔄 Wallet connection changed for ${requiredChainType}, refetching quests`);
      refetch();
    }

    if (prev === true && isWalletConnected === false) {
      setNftMinted(false);
      try {
        localStorage.removeItem("nft_minted_ns_daily");
        const keysToRemove: string[] = [];
        for (let i = 0; i < sessionStorage.length; i++) {
          const k = sessionStorage.key(i);
          if (k && k.startsWith("quest_progress_session_"))
            keysToRemove.push(k);
        }
        keysToRemove.forEach((k) => sessionStorage.removeItem(k));
      } catch {}
    }
  }, [mounted, isWalletConnected, refetch, requiredChainType]);

  // Handle NFT minted status
  useEffect(() => {
    if (!mounted) return;

    if (quests.length > 0) {
      const completedQuests = quests.filter((quest: any) => quest.is_completed).length;
      const totalQuests = quests.length;
      const currentCompletionPercentage =
        totalQuests > 0 ? Math.round((completedQuests / totalQuests) * 100) : 0;

      const savedNftStatus = localStorage.getItem("nft_minted_ns_daily");
      if (savedNftStatus === "true" && currentCompletionPercentage === 100) {
        setNftMinted(true);
      } else if (currentCompletionPercentage < 100) {
        setNftMinted(false);
        localStorage.removeItem("nft_minted_ns_daily");
      }
    }
  }, [quests, mounted]);

  // Listen for storage events
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "quest_progress_ping" && e.newValue) {
        refetch();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [refetch]);

  const completedQuests = mounted && isWalletConnected && !isLoading
    ? quests.filter((q: any) => q.is_completed).length
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