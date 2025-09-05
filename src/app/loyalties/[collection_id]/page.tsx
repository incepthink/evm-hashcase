"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";

import { useLoyaltyPointsTransactions } from "@/app/hooks/useLoyaltyPointsTransactions";
import { useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit";
import { useZkLogin } from "@mysten/enoki/react";
import { useAccount } from "wagmi";
import { usePrivy } from "@privy-io/react-auth";

import { PlusCircle, MinusCircle } from "lucide-react";
import HeroImage from "@/assets/images/sui-bg.png";

import { useGlobalAppStore } from "@/store/globalAppStore";
import { useCollectionById } from "@/hooks/useCollections";
import ChainMismatchInfo from "@/components/WalletConnect/ChainMismatchInfo";

import LeaderboardTable from "./LeaderboardTable";
import LoyaltyCodesTable from "./LoyaltyCodesTable";
import BadgesTable from "./BadgesTable";

const CollectionLoyaltiesPage = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const params = useParams();
  const router = useRouter();
  const currentAccount = useCurrentAccount();
  const { address: zkAddress } = useZkLogin();
  const { address: evmAddress } = useAccount();
  const { authenticated: privyAuthenticated, user: privyUser } = usePrivy();
  const { user } = useGlobalAppStore();

  // Check if any wallet is connected (Sui wallet, zk Google login, EVM wallet, or Privy)
  const hasSuiWallet = !!(currentAccount?.address || zkAddress);
  const hasEvmWallet = !!evmAddress;
  const hasPrivyWallet = !!(privyAuthenticated && privyUser?.wallet?.address);
  const isWalletConnected = hasSuiWallet || hasEvmWallet || hasPrivyWallet;

  console.log("COLLECTION_PAGE_DEBUG: Wallet states:", {
    hasSuiWallet,
    hasEvmWallet,
    hasPrivyWallet,
    isWalletConnected,
    privyAuthenticated,
    privyWalletAddress: privyUser?.wallet?.address,
    evmAddress,
    zkAddress,
    currentAccountAddress: currentAccount?.address,
  });

  const userTokenType =
    process.env.NEXT_PUBLIC_USER_TOKEN_TYPE ||
    "0x2::token::Token<0xdcbdbd4ef617c266d71cb8b5042d09cfcf2895bb7e05b1cbebd8adb5fc6f1f8d::loyalty_points::LOYALTY_POINTS>";

  const [onChainPointsState, setOnChainPointsState] = useState(0);
  const [offChainPointsState, setOffChainPointsState] = useState(0);
  const [points, setPoints] = useState<string>("");
  const [userTokenId, setUserTokenId] = useState<string | null>(null);

  const { spendLoyaltyPoints } = useLoyaltyPointsTransactions();

  // States to handle the tab change
  const [activeTab, setActiveTab] = useState<"loyalty" | "badges">("loyalty");

  const handleTabChange = (tab: "loyalty" | "badges") => {
    setActiveTab(tab);
  };

  // Fetch collection data
  const {
    collection,
    isLoading: isCollectionLoading,
    isError: isCollectionError,
  } = useCollectionById(params.collection_id! as string);

  console.log("COLLECTION_PAGE_DEBUG: Collection data:", collection);

  // Get owner_id directly from collection data
  const ownerId = collection?.owner_id;
  const requiredChain = collection?.contract?.Chain?.chain_type as
    | "ethereum"
    | "sui";

  console.log("COLLECTION_PAGE_DEBUG: Required chain:", requiredChain);

  // Handle points update from loyalty codes
  const handlePointsUpdate = (newPoints: number) => {
    setOffChainPointsState(newPoints);
  };

  // Fetch token data - only for Sui wallets
  const {
    data: fetchedTokenData,
    isLoading: isTokenLoading,
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
      enabled: !!currentAccount?.address, // Only enable for Sui wallet, not zk login
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

  // For zk login users, EVM users, and Privy users, we don't have on-chain tokens, so show 0
  useEffect(() => {
    if (
      (zkAddress && !currentAccount?.address) ||
      hasEvmWallet ||
      hasPrivyWallet
    ) {
      // For zk login users, EVM users, and Privy users, set on-chain points to 0
      setOnChainPointsState(0);
      console.log(
        "COLLECTION_PAGE_DEBUG: Setting on-chain points to 0 for non-Sui wallet"
      );
    }
  }, [zkAddress, currentAccount?.address, hasEvmWallet, hasPrivyWallet]);

  const handleSpendLoyaltyPoints = async () => {
    if (points && userTokenId) {
      console.log("COLLECTION_PAGE_DEBUG: Handle Spend Loyalty Points:", {
        points,
        userTokenId,
      });
      await spendLoyaltyPoints(userTokenId, points);
      // Refetch the token data to get updated balance
      const { data } = await refetchTokenData();
      if (data?.data?.[0]?.data?.content) {
        const newBalance = (data.data[0].data.content as any)?.fields?.balance;
        setOnChainPointsState(newBalance);
      }
      setPoints(""); // Clear input after operation
    } else {
      toast.error("Please enter an amount and ensure you have loyalty tokens");
    }
  };

  // Check if user has the correct chain wallet connected
  const hasCorrectChainWallet = () => {
    if (!requiredChain) return true; // If no required chain, any wallet is fine

    if (requiredChain === "sui") {
      return hasSuiWallet;
    } else if (requiredChain === "ethereum") {
      return hasEvmWallet || hasPrivyWallet; // Both regular EVM and Privy wallets work for Ethereum
    }

    return false;
  };

  console.log(
    "COLLECTION_PAGE_DEBUG: Has correct chain wallet:",
    hasCorrectChainWallet()
  );

  // Show loading spinner while collection is loading
  if (!mounted || isCollectionLoading) {
    return (
      <div className="w-full min-h-[70vh] flex flex-col items-center justify-center bg-gradient-to-br from-[#000212] via-[#03082a] to-[#0a0e3a] px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Glowing background elements */}
        <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-blue-900/20 to-transparent -skew-x-12 -translate-x-1/3"></div>
        <div className="absolute bottom-0 right-0 w-1/3 h-full bg-gradient-to-l from-purple-900/20 to-transparent skew-x-12 translate-x-1/3"></div>

        <div className="relative z-10 text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h1 className="text-4xl sm:text-4xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-blue-400 to-purple-500 drop-shadow-lg leading-tight">
            Loading...
          </h1>
          <p className="text-xl sm:text-2xl text-white/80 mb-8 leading-relaxed max-w-2xl">
            Fetching collection data
          </p>
        </div>
      </div>
    );
  }

  // Show error if collection failed to load
  if (isCollectionError || !collection) {
    return (
      <div className="w-full min-h-[70vh] flex flex-col items-center justify-center bg-gradient-to-br from-[#000212] via-[#03082a] to-[#0a0e3a] px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="relative z-10 text-center">
          <h1 className="text-4xl sm:text-4xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-red-600 drop-shadow-lg leading-tight">
            Collection Not Found
          </h1>
          <p className="text-xl sm:text-2xl text-white/80 mb-8 leading-relaxed max-w-2xl">
            The requested collection could not be found.
          </p>
        </div>
      </div>
    );
  }

  // Show wallet not connected message if wallet is not connected
  if (!isWalletConnected) {
    return (
      <div className="w-full min-h-[70vh] flex flex-col items-center justify-center bg-gradient-to-br from-[#000212] via-[#03082a] to-[#0a0e3a] px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Glowing background elements */}
        <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-blue-900/20 to-transparent -skew-x-12 -translate-x-1/3"></div>
        <div className="absolute bottom-0 right-0 w-1/3 h-full bg-gradient-to-l from-purple-900/20 to-transparent skew-x-12 translate-x-1/3"></div>

        <div className="relative z-10 text-center">
          <p className="text-sm text-white/80">Wallet not connected</p>
        </div>
      </div>
    );
  }

  // Show loading spinner for token data (only when Sui wallet is connected but token data is loading)
  if (isTokenLoading && hasSuiWallet && !hasEvmWallet && !hasPrivyWallet) {
    return (
      <div className="w-full min-h-[70vh] flex flex-col items-center justify-center bg-gradient-to-br from-[#000212] via-[#03082a] to-[#0a0e3a] px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Glowing background elements */}
        <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-blue-900/20 to-transparent -skew-x-12 -translate-x-1/3"></div>
        <div className="absolute bottom-0 right-0 w-1/3 h-full bg-gradient-to-l from-purple-900/20 to-transparent skew-x-12 translate-x-1/3"></div>

        <div className="relative z-10 text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h1 className="text-4xl sm:text-4xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-blue-400 to-purple-500 drop-shadow-lg leading-tight">
            Loading...
          </h1>
          <p className="text-xl sm:text-2xl text-white/80 mb-8 leading-relaxed max-w-2xl">
            Fetching your loyalty data
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Chain Mismatch Warning */}
      {/* {requiredChain && (
        <div className="bg-[#00041f] pt-6 px-4">
          <ChainMismatchInfo
            requiredChain={requiredChain}
            className="max-w-6xl"
          />
        </div>
      )} */}

      {/* Navbar Element */}
      <div
        className={`bg-[#00041f] flex flex-col items-center pt-12 sm:pt-16 md:pt-20 gap-3 sm:gap-4 px-4 pb-3 md:pb-0`}
      >
        {/* Tab Buttons Container */}
        <div className="backdrop-blur-sm rounded-xl border p-1.5 sm:p-2 flex gap-2 sm:gap-4 shadow-md w-full max-w-sm sm:max-w-md md:max-w-lg">
          {[
            { key: "loyalty", label: "Loyalty Codes" },
            { key: "badges", label: "Badges" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key as any)}
              className={`relative flex-1 px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg font-semibold text-xs sm:text-sm md:text-base transition-all duration-300 
          ${
            activeTab === tab.key
              ? "text-white bg-gradient-to-r from-blue-500 to-purple-500 shadow-md"
              : "text-white/60 hover:text-white hover:bg-white/10"
          }`}
            >
              <span className="truncate">{tab.label}</span>
              {/* Neon border glow on hover */}
              <span
                className={`absolute inset-0 rounded-lg pointer-events-none transition duration-300 ${
                  activeTab === tab.key
                    ? "ring-2 ring-blue-500/40"
                    : "hover:ring-1 hover:ring-purple-500/20"
                }`}
              />
            </button>
          ))}
        </div>

        {/* View Quests Button */}
        <button
          onClick={() => {
            if (!isWalletConnected) {
              toast.error("Please connect your wallet to view quests", {
                duration: 3000,
                style: {
                  background: "#1f2937",
                  color: "#fff",
                  border: "1px solid #374151",
                },
              });
              return;
            }

            // Check if user has the correct chain connected
            const hasCorrectChain = hasCorrectChainWallet();
            if (requiredChain && !hasCorrectChain) {
              let walletTypeNeeded = "";
              if (requiredChain === "sui") {
                walletTypeNeeded = "Sui";
              } else if (requiredChain === "ethereum") {
                walletTypeNeeded = "EVM or Google";
              }

              toast.error(
                `Please connect a ${walletTypeNeeded} wallet to view quests`,
                {
                  duration: 3000,
                  style: {
                    background: "#1f2937",
                    color: "#fff",
                    border: "1px solid #374151",
                  },
                }
              );
              return;
            }

            router.push(`/quests?collection_id=${params.collection_id}`);
          }}
          className={`border-2 transition duration-300 font-semibold sm:font-bold py-2.5 sm:py-3 md:py-3.5 px-4 sm:px-5 md:px-6 rounded-lg sm:rounded-xl text-xs sm:text-sm md:text-base transition-all duration-300 transform w-full max-w-xs sm:max-w-sm md:max-w-md ${
            isWalletConnected
              ? "border-gray-600 hover:border-gray-500 text-white cursor-pointer hover:scale-105"
              : "border-gray-700 text-gray-400 cursor-not-allowed opacity-60"
          }`}
        >
          <span className="block sm:hidden">
            {isWalletConnected ? "View Quests" : "Connect Wallet"}
          </span>
          <span className="hidden sm:block">
            {isWalletConnected
              ? "View All Quests"
              : "Connect Wallet to View Quests"}
          </span>
        </button>
      </div>

      {ownerId && activeTab === "loyalty" && (
        <LoyaltyCodesTable
          owner_id={ownerId}
          onPointsUpdate={handlePointsUpdate}
          collection={collection}
        />
      )}
      {ownerId && activeTab === "loyalty" && (
        <LeaderboardTable owner_id={ownerId} />
      )}

      {ownerId && activeTab === "badges" && <BadgesTable owner_id={ownerId} />}
    </>
  );
};

export default CollectionLoyaltiesPage;
