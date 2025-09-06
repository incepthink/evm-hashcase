"use client";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { usePrivy } from "@privy-io/react-auth";

import { LeaderboardPeriod } from "@/utils/enums";
import axiosInstance from "@/utils/axios";
import { useGlobalAppStore } from "@/store/globalAppStore";
import toast from "react-hot-toast";

type LeaderboardEntry = {
  user_id: number;
  total_loyalty_points: number;
  rank: number;
  user?: {
    username?: string;
    email?: string;
    eth_wallet_address?: string;
    fuel_wallet_address?: string;
    sui_wallet_address?: string;
  };
};

type UserRank = {
  rank: number;
  dense_rank: number;
  points: number;
  username?: string;
};

type LeaderboardResponse = {
  rows: LeaderboardEntry[];
  count: number;
  userRank?: UserRank;
};

const LeaderboardTable = ({ owner_id }: { owner_id: number }) => {
  const { address: evmAddress } = useAccount();
  const { authenticated: privyAuthenticated, user: privyUser } = usePrivy();
  const { user } = useGlobalAppStore();

  const [period, setPeriod] = useState<LeaderboardPeriod>(
    LeaderboardPeriod.MONTHLY
  );

  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>(
    []
  );
  const [userRank, setUserRank] = useState<UserRank | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check if any EVM wallet (regular or Privy) is connected
  const isWalletConnected = !!(
    evmAddress ||
    (privyAuthenticated && privyUser?.wallet?.address)
  );

  const refreshLeaderboard = async () => {
    if (!isWalletConnected) {
      toast.error("Please connect your wallet to refresh leaderboard");
      return;
    }

    setIsLoading(true);
    try {
      const userId = user?.id;

      const response = await axiosInstance.get("/platform/new-leaderboard", {
        params: {
          owner_id: owner_id,
          user_id: userId,
          page: 1,
          page_size: 10,
        },
      });

      const leaderboard: LeaderboardResponse = response.data.leaderboard;
      setLeaderboardData(leaderboard.rows || []);
      setUserRank(leaderboard.userRank || null);

      toast.success("Leaderboard updated with latest rankings!");
    } catch (error: any) {
      console.error("Error refreshing leaderboard:", error);
      toast.error("Failed to refresh leaderboard");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const getLeaderboardData = async () => {
      setIsLoading(true);
      try {
        // Always fetch basic leaderboard data
        const response = await axiosInstance.get("/platform/new-leaderboard", {
          params: {
            owner_id: owner_id,
            user_id: isWalletConnected ? user?.id : undefined,
            page: 1,
            page_size: 10,
          },
        });

        const leaderboard: LeaderboardResponse = response.data.leaderboard;
        setLeaderboardData(leaderboard.rows || []);

        // Only set user rank if wallet is connected
        if (isWalletConnected) {
          setUserRank(leaderboard.userRank || null);
        } else {
          setUserRank(null);
        }
      } catch (error: any) {
        console.error("Error fetching leaderboard:", error);
        // Fallback to basic leaderboard
        try {
          const response = await axiosInstance.get("/platform/leaderboard", {
            params: {
              owner_id: owner_id,
              period: period,
            },
          });
          const leaderboard = response.data.leaderboard;
          setLeaderboardData(leaderboard);
          setUserRank(null);
        } catch (fallbackError) {
          console.error("Fallback leaderboard also failed:", fallbackError);
        }
      } finally {
        setIsLoading(false);
      }
    };

    getLeaderboardData();
  }, [owner_id, isWalletConnected, user?.id]);

  const formatWalletAddress = (address: string | undefined | null) => {
    if (!address) return "Unknown";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getUserIdentifier = (entry: LeaderboardEntry) => {
    console.log("entry", entry);

    if (entry.user?.eth_wallet_address) {
      return formatWalletAddress(entry.user.eth_wallet_address);
    }
    if (entry.user?.sui_wallet_address) {
      return formatWalletAddress(entry.user.sui_wallet_address);
    }
    if (entry.user?.fuel_wallet_address) {
      return formatWalletAddress(entry.user.fuel_wallet_address);
    }
    if (entry.user?.username) {
      return entry.user.username;
    }
    if (entry.user?.email) {
      return entry.user.email;
    }
    return `User ${entry.user_id}`;
  };

  const getCurrentUserAddress = () => {
    if (evmAddress) {
      return formatWalletAddress(evmAddress);
    }
    if (privyAuthenticated && privyUser?.wallet?.address) {
      return formatWalletAddress(privyUser.wallet.address);
    }
    return "Unknown";
  };

  const getCurrentUserType = () => {
    if (evmAddress) {
      return "EVM";
    }
    if (privyAuthenticated && privyUser?.wallet?.address) {
      return "Google";
    }
    return "Unknown";
  };

  return (
    <div className="flex flex-col justify-start items-center gap-4 sm:gap-6 w-full h-full bg-gradient-to-b from-[#00041f] to-[#030828] p-4 sm:p-6 md:p-8 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-center mb-4 sm:mb-6 w-full">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white/90 drop-shadow-md text-center">
          Leaderboard
          {isLoading && (
            <span className="block sm:inline ml-0 sm:ml-3 text-blue-400 text-sm mt-2 sm:mt-0">
              <span className="animate-spin">⟳</span> Refreshing...
            </span>
          )}
        </h1>
      </div>

      {/* Time Period Buttons */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4 md:gap-6 w-full max-w-6xl mx-auto">
        {[
          { period: LeaderboardPeriod.MONTHLY, label: "Monthly" },
          { period: LeaderboardPeriod.WEEKLY, label: "Weekly" },
          { period: LeaderboardPeriod.DAILY, label: "Daily" },
        ].map(({ period: buttonPeriod, label }) => (
          <button
            key={buttonPeriod}
            onClick={() => setPeriod(buttonPeriod)}
            disabled={!isWalletConnected}
            className={`w-full sm:w-auto bg-[#3f54b4] text-white text-sm sm:text-base md:text-lg px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all duration-300 hover:bg-[#2678C2] shadow-md ${
              period === buttonPeriod ? "ring-2 ring-blue-400" : ""
            } ${!isWalletConnected ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Wallet Connection Status */}
      {!isWalletConnected && (
        <div className="w-full max-w-6xl mx-auto bg-yellow-500/20 border border-yellow-400/30 rounded-lg p-4 text-center">
          <p className="text-yellow-300 text-sm sm:text-base">
            Connect an EVM wallet or sign in with Google to see your ranking and
            interact with the leaderboard
          </p>
        </div>
      )}

      {/* Mobile Card View */}
      <div
        className={`w-full flex flex-col gap-3 max-w-6xl mx-auto md:hidden ${
          !isWalletConnected ? "opacity-60" : ""
        }`}
      >
        {/* Current User's Entry (only if wallet connected and not in top list) */}
        {isWalletConnected &&
          userRank &&
          !leaderboardData.some((entry) => entry.user_id === user?.id) && (
            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-400/30 backdrop-blur-lg rounded-lg p-4 shadow-lg">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-sm font-bold">
                    #{userRank.rank}
                  </span>
                  <span className="text-yellow-300 text-sm font-medium">
                    (You - {getCurrentUserType()})
                  </span>
                </div>
                <div className="text-white font-bold text-lg">
                  {typeof userRank.points === "number"
                    ? userRank.points.toFixed(2)
                    : "0.00"}
                </div>
              </div>
              <div className="text-white/80 text-sm">
                {getCurrentUserAddress()}
              </div>
            </div>
          )}

        {/* Leaderboard Entries */}
        {leaderboardData.map((entry, index) => {
          const isCurrentUser =
            isWalletConnected && userRank && entry.user_id === user?.id;
          return (
            <div
              key={index}
              className={`bg-white/10 backdrop-blur-lg rounded-lg p-4 shadow-lg transition-all duration-300 hover:bg-white/20 ${
                isCurrentUser
                  ? "ring-2 ring-yellow-400 bg-gradient-to-r from-yellow-600/20 to-orange-600/20"
                  : ""
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <span className="bg-gray-600 text-white px-2 py-1 rounded-full text-sm font-bold">
                    #{entry.rank}
                  </span>
                  {isCurrentUser && (
                    <span className="text-yellow-300 text-sm font-medium">
                      (You - {getCurrentUserType()})
                    </span>
                  )}
                </div>
                <div className="text-white font-bold text-lg">
                  {typeof entry.total_loyalty_points === "number"
                    ? entry.total_loyalty_points.toFixed(2)
                    : "0.00"}
                </div>
              </div>
              <div className="text-white/80 text-sm">
                {getUserIdentifier(entry)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Table View */}
      <div
        className={`w-full flex-col justify-start items-start gap-4 max-w-6xl mx-auto hidden md:flex ${
          !isWalletConnected ? "opacity-60" : ""
        }`}
      >
        {/* Table Header */}
        <div className="flex justify-between items-center w-full px-4 md:px-6 py-3 rounded-md text-base md:text-lg font-semibold text-white bg-white/10 backdrop-blur-lg shadow-lg">
          <p className="w-1/3 text-center">Rank</p>
          <p className="w-1/3 text-center">User</p>
          <p className="w-1/3 text-center">Loyalty Points</p>
        </div>

        {/* Current User's Entry (only if wallet connected and not in top list) */}
        {isWalletConnected &&
          userRank &&
          !leaderboardData.some((entry) => entry.user_id === user?.id) && (
            <div className="flex justify-between items-center w-full px-4 md:px-6 py-3 rounded-md text-base md:text-lg text-white bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-400/30 backdrop-blur-lg shadow-lg">
              <p className="w-1/3 text-center">#{userRank.rank}</p>
              <p className="w-1/3 text-center">
                {getCurrentUserAddress()}
                <span className="ml-2 text-blue-300 text-sm">
                  ({getCurrentUserType()})
                </span>
              </p>
              <p className="w-1/3 text-center">
                {typeof userRank.points === "number"
                  ? userRank.points.toFixed(2)
                  : "0.00"}
              </p>
            </div>
          )}

        {/* Leaderboard Entries */}
        {leaderboardData.map((entry, index) => {
          const isCurrentUser =
            isWalletConnected && userRank && entry.user_id === user?.id;
          return (
            <div
              key={index}
              className={`flex justify-between items-center w-full px-4 md:px-6 py-3 rounded-md text-base md:text-lg text-white bg-white/10 backdrop-blur-lg shadow-lg transition-all duration-300 hover:bg-white/20 hover:scale-105 ${
                isCurrentUser
                  ? "ring-2 ring-yellow-400 bg-gradient-to-r from-yellow-600/20 to-orange-600/20"
                  : ""
              }`}
            >
              <p className="w-1/3 text-center">#{entry.rank}</p>
              <p className="w-1/3 text-center">
                {getUserIdentifier(entry)}
                {isCurrentUser && (
                  <span className="ml-2 text-yellow-300 text-sm">
                    (You - {getCurrentUserType()})
                  </span>
                )}
              </p>
              <p className="w-1/3 text-center">
                {typeof entry.total_loyalty_points === "number"
                  ? entry.total_loyalty_points.toFixed(2)
                  : "0.00"}
              </p>
            </div>
          );
        })}
      </div>

      {/* No Data Message */}
      {!isLoading && leaderboardData.length === 0 && (
        <div className="w-full text-center py-6 sm:py-8">
          <p className="text-blue-300 text-base sm:text-lg">
            No leaderboard data available
          </p>
        </div>
      )}

      {/* Refresh Button */}
      <button
        onClick={refreshLeaderboard}
        disabled={isLoading || !isWalletConnected}
        className={`px-6 py-2 rounded-lg font-medium transition-colors ${
          isWalletConnected
            ? "bg-blue-600 hover:bg-blue-700 text-white"
            : "bg-gray-600 text-gray-400 cursor-not-allowed"
        } disabled:bg-gray-600 disabled:cursor-not-allowed`}
      >
        {isLoading
          ? "Refreshing..."
          : isWalletConnected
          ? "Refresh Leaderboard"
          : "Connect Wallet to Refresh"}
      </button>
    </div>
  );
};

export default LeaderboardTable;
