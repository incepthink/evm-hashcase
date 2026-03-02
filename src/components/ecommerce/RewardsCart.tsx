"use client";

import { useEffect, useState } from "react";
import { Gift, RefreshCw } from "lucide-react";
import axiosInstance from "@/utils/axios";
import { getRewardLabel } from "@/utils/reward";

interface RequiredTier {
  id: number;
  level: number;
  name: string;
}

interface Reward {
  id: number;
  point_cost: number;
  type: string;
  discountType: string | null;
  discountValue: string | null;
  products: Array<{ id: number; name: string }>;
  product_ids: number[] | null;
  required_tier: RequiredTier | null;
  can_claim: boolean;
}

export interface RewardDiscount {
  type: string;
  discountType: string | null;
  discountValue: string | null;
  product_ids: number[] | null;
}

interface RewardsCartProps {
  owner_id: number | null;
  userId: number | null;
  selectedRewardId: number | null;
  onSelect: (
    id: number | null,
    label: string | null,
    discount: RewardDiscount | null,
  ) => void;
}

export default function RewardsCart({
  owner_id,
  userId,
  selectedRewardId,
  onSelect,
}: RewardsCartProps) {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchRewards = () => {
    if (!owner_id || !userId) return;
    setLoading(true);
    setError(false);
    axiosInstance
      .get(`/platform/reward`, {
        params: { target_owner_id: owner_id, user_id: userId },
      })
      .then((res) => {
        setRewards(res.data.data ?? []);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRewards();
  }, [owner_id, userId]);

  const handleSelect = (reward: Reward) => {
    // if (!reward.can_claim) return;
    const next = selectedRewardId === reward.id ? null : reward.id;
    onSelect(
      next,
      next !== null ? getRewardLabel(reward) : null,
      next !== null
        ? {
            type: reward.type,
            discountType: reward.discountType,
            discountValue: reward.discountValue,
            product_ids: reward.product_ids,
          }
        : null,
    );
  };

  const costLabel = (reward: Reward): string => {
    if (reward.required_tier !== null) {
      return `0 (${reward.required_tier.name} Tier Reward)`;
    }
    return `${reward.point_cost} Points`;
  };

  return (
    <div className="">
      <div className="flex items-center gap-2 mt-8 mb-6">
        <Gift size={24} className="text-[#2979FF]" />
        <h2 className="text-2xl font-semibold text-white">Select Reward</h2>
      </div>

      {loading && (
        <div className="space-y-2 animate-pulse">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-11 rounded-lg bg-[#0d1231] border border-[#1e2a4a]"
            />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-col items-center justify-center gap-2 py-6 text-center">
          <p className="text-sm text-gray-400">Failed to load rewards.</p>
          <button
            onClick={fetchRewards}
            className="flex items-center gap-1.5 text-xs text-[#2979FF] hover:underline cursor-pointer"
          >
            <RefreshCw size={13} />
            Retry
          </button>
        </div>
      )}

      {!loading && !error && rewards.length === 0 && (
        <div className="flex items-center justify-center py-6 min-h-20">
          <p className="text-sm text-gray-500">
            No rewards available right now.
          </p>
        </div>
      )}

      {!loading && !error && rewards.length > 0 && (
        <div className="rounded-xl border border-[#1e2a4a] bg-[#0d1231] overflow-hidden">
          <table className="w-full text-sm border-separate border-spacing-0">
            <thead>
              <tr className="border-b border-[#1e2a4a] text-gray-500 text-xs uppercase">
                <th className="w-8 py-2 pl-4 border-b border-r border-[#1e2a4a]" />
                <th className="text-center py-2.5 px-4 border-b border-r border-[#1e2a4a]">
                  Reward
                </th>
                <th className="text-center py-2 px-4 border-b border-[#1e2a4a]">
                  Cost
                </th>
              </tr>
            </thead>
            <tbody>
              {rewards.map((reward) => {
                const isSelected = selectedRewardId === reward.id;
                const disabled = false;
                return (
                  <tr
                    key={reward.id}
                    onClick={() => handleSelect(reward)}
                    className={`transition-colors duration-150 ${
                      disabled
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer hover:bg-white/5"
                    } ${isSelected ? "bg-[#2979FF]/10" : ""}`}
                  >
                    <td className="py-3 pl-4 pr-3 border-b border-r border-[#1e2a4a] last-of-type:border-b-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={disabled}
                        onChange={() => handleSelect(reward)}
                        onClick={(e) => e.stopPropagation()}
                        className="accent-[#2979FF] w-4 h-4 cursor-pointer"
                      />
                    </td>
                    <td
                      className={`py-3 px-4 font-medium border-b border-r border-[#1e2a4a] ${
                        isSelected
                          ? "text-white"
                          : disabled
                            ? "text-gray-600"
                            : "text-gray-300"
                      }`}
                    >
                      {getRewardLabel(reward)}
                    </td>
                    <td
                      className={`py-3 px-4 text-center border-b border-[#1e2a4a] ${
                        isSelected
                          ? "text-[#2979FF]"
                          : disabled
                            ? "text-gray-600"
                            : "text-gray-500"
                      }`}
                    >
                      {costLabel(reward)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
