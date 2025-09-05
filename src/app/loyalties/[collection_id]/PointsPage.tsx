"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";

import axiosInstance from "@/utils/axios";

import { useLoyaltyPointsTransactions } from "@/app/hooks/useLoyaltyPointsTransactions";
import { useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit";

import { PlusCircle, MinusCircle } from "lucide-react";
import HeroImage from "@/assets/images/sui-bg.png";

import { useGlobalAppStore } from "@/store/globalAppStore";

import LeaderboardTable from "./LeaderboardTable";
import LoyaltyCodesTable from "./LoyaltyCodesTable";
import QuestsTable from "./QuestsTable";

const PointsPage = () => {
  const params = useParams();
  const currentAccount = useCurrentAccount();

  const userTokenType =
    process.env.NEXT_PUBLIC_USER_TOKEN_TYPE ||
    "0x2::token::Token<0xdcbdbd4ef617c266d71cb8b5042d09cfcf2895bb7e05b1cbebd8adb5fc6f1f8d::loyalty_points::LOYALTY_POINTS>";

  const { user } = useGlobalAppStore();

  const [ownerId, setOwnerId] = useState<number | null>(null);
  const [onChainPointsState, setOnChainPointsState] = useState(0);
  const [points, setPoints] = useState<string>("");
  const [userTokenId, setUserTokenId] = useState<string | null>(null);

  const { completeQuest, spendLoyaltyPoints } =
    useLoyaltyPointsTransactions();

  // Fetch token data
  // Add refetch capability to the query
  const {
    data: fetchedTokenData,
    isLoading,
    refetch: refetchTokenData,
  } = useSuiClientQuery(
    "getOwnedObjects",
    {
      owner: currentAccount?.address!,
      filter: {
        StructType: userTokenType,
      },
      options: {
        showDisplay: true,
        showContent: true,
        showType: true,
      },
    },
    {
      enabled: !!currentAccount?.address,
    }
  );

  // Process token data and set states
  useEffect(() => {
    if (fetchedTokenData?.data?.[0]?.data?.objectId) {
      setUserTokenId(fetchedTokenData.data[0].data.objectId);
      const balance = (fetchedTokenData.data[0].data?.content as any)?.fields
        ?.balance;
      if (balance !== undefined) {
        setOnChainPointsState(balance);
      }
    }
  }, [fetchedTokenData]);

  const handleAddLoyaltyPoints = async () => {
    if (points) {
      // Use completeQuest to add points - you might need to adjust this based on your quest system
      await completeQuest("manual_points_add");
      // Refetch the token data to get updated balance
      const { data } = await refetchTokenData();
      if (data?.data?.[0]?.data?.content) {
        const newBalance = (data.data[0].data.content as any)?.fields?.balance;
        setOnChainPointsState(newBalance);
      }
      setPoints(""); // Clear input after operation
    }
  };

  const handleSpendLoyaltyPoints = async () => {
    if (points && userTokenId) {
      await spendLoyaltyPoints(userTokenId, points);
      // Refetch the token data to get updated balance
      const { data } = await refetchTokenData();
      if (data?.data?.[0]?.data?.content) {
        const newBalance = (data.data[0].data.content as any)?.fields?.balance;
        setOnChainPointsState(newBalance);
      }
      setPoints(""); // Clear input after operation
    }
  };

  if (isLoading) return <div>Loading</div>;

  if (!fetchedTokenData)
    return <div>Unable to get data from the blockchain</div>;

  return (
    <>
      <div className="w-full min-h-[70vh] flex flex-col lg:flex-row items-center justify-center bg-gradient-to-br from-[#000212] via-[#03082a] to-[#0a0e3a] px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Glowing background elements */}
        <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-blue-900/20 to-transparent -skew-x-12 -translate-x-1/3"></div>
        <div className="absolute bottom-0 right-0 w-1/3 h-full bg-gradient-to-l from-purple-900/20 to-transparent skew-x-12 translate-x-1/3"></div>

        {/* Left Side: Image with enhanced styling */}
        <div className="w-full lg:w-1/2 flex justify-center items-center relative z-10 px-4 py-8 lg:py-0">
          <div className="relative w-full max-w-md group">
            <Image
              src={HeroImage}
              alt="Loyalty Points"
              width={600}
              height={600}
              className="w-full h-auto rounded-xl shadow-2xl transform transition-all duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 via-transparent to-purple-500/20 rounded-xl mix-blend-overlay"></div>
            <div className="absolute -inset-4 rounded-xl border-2 border-blue-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          </div>
        </div>

        {/* Right Side: Content */}
        <div className="w-full lg:w-1/2 flex flex-col items-start justify-center text-left space-y-6 relative z-10 px-4 py-8 lg:py-0">
          <div className="max-w-lg">
            <h1 className="text-4xl sm:text-5xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-blue-400 to-purple-500 drop-shadow-lg leading-tight">
              {onChainPointsState !== undefined ? (
                <>
                  Your <span className="text-white">Loyalty Points</span>
                  <span className="block text-2xl sm:text-3xl mt-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                    {onChainPointsState} Points
                  </span>
                </>
              ) : (
                "Fetching Loyalty Points..."
              )}
            </h1>

            <p className="text-lg sm:text-xl text-white/80 mb-8 leading-relaxed">
              Earn and redeem points in our secure, transparent, and
              decentralized loyalty ecosystem powered by blockchain technology.
            </p>

            <div className="space-y-6 w-full">
              <div className="relative">
                <input
                  type="number"
                  value={points}
                  onChange={(e) => setPoints(e.target.value)}
                  placeholder="Enter points amount"
                  className="w-full px-5 py-4 text-lg rounded-xl bg-white/5 text-white placeholder-white/40 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/30 backdrop-blur-sm transition-all duration-300"
                />
                <div className="absolute inset-0 rounded-xl border border-blue-400/20 opacity-0 hover:opacity-100 pointer-events-none transition-opacity duration-300"></div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleAddLoyaltyPoints}
                  className="flex-1 flex items-center justify-center gap-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white text-lg px-6 py-4 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-blue-500/20 hover:-translate-y-0.5"
                >
                  <PlusCircle size={24} className="flex-shrink-0" />
                  <span>Add Points</span>
                </button>
                <button
                  onClick={handleSpendLoyaltyPoints}
                  className="flex-1 flex items-center justify-center gap-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 text-white text-lg px-6 py-4 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-purple-500/20 hover:-translate-y-0.5"
                >
                  <MinusCircle size={24} className="flex-shrink-0" />
                  <span>Spend Points</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PointsPage;
