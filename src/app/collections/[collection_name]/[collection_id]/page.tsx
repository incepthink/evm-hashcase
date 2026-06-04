// ============================================================================
// File: app/collection/[collection_id]/page.tsx (EVM Version)
// ============================================================================
"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { notify } from "@/utils/notify";

import { useLoyaltyPointsTransactions } from "@/app/hooks/useLoyaltyPointsTransactions";
import { useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit";
import { useZkLogin } from "@mysten/enoki/react";
import { useAccount } from "wagmi";
import { usePrivy } from "@privy-io/react-auth";

import { useGlobalAppStore } from "@/store/globalAppStore";
import { useCollectionById } from "@/hooks/useCollections";

import LeaderboardTable from "./LeaderboardTable";
import LoyaltyCodesTable from "./LoyaltyCodesTable";
import ContentSkeleton from "@/components/collectionShell/ContentSkeleton";
import { collectionTheme } from "@/components/collectionShell/theme";

export default function CollectionPointsPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const params = useParams();
  const currentAccount = useCurrentAccount();
  const { address: zkAddress } = useZkLogin();
  const { address: evmAddress } = useAccount();
  const { authenticated: privyAuthenticated, user: privyUser } = usePrivy();
  const { user } = useGlobalAppStore();

  // Check if any wallet is connected (Sui wallet, zk Google login, EVM wallet, or Privy)
  const hasSuiWallet = !!(currentAccount?.address || zkAddress);
  const hasEvmWallet = !!evmAddress;
  const hasPrivyWallet = !!(privyAuthenticated && privyUser?.wallet?.address);

  const userTokenType =
    process.env.NEXT_PUBLIC_USER_TOKEN_TYPE ||
    "0x2::token::Token<0xdcbdbd4ef617c266d71cb8b5042d09cfcf2895bb7e05b1cbebd8adb5fc6f1f8d::loyalty_points::LOYALTY_POINTS>";

  const [onChainPointsState, setOnChainPointsState] = useState(0);
  const [offChainPointsState, setOffChainPointsState] = useState(0);
  const [points, setPoints] = useState<string>("");
  const [userTokenId, setUserTokenId] = useState<string | null>(null);

  const { spendLoyaltyPoints } = useLoyaltyPointsTransactions();

  // Fetch collection data
  const {
    collection,
    isLoading: isCollectionLoading,
    isError: isCollectionError,
  } = useCollectionById(params.collection_id as string);

  // Get owner_id directly from collection data
  const ownerId = collection?.owner_id;

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

  // For zk login users, EVM users, and Privy users, set on-chain points to 0
  useEffect(() => {
    if (
      (zkAddress && !currentAccount?.address) ||
      hasEvmWallet ||
      hasPrivyWallet
    ) {
      setOnChainPointsState(0);
    }
  }, [zkAddress, currentAccount?.address, hasEvmWallet, hasPrivyWallet]);

  const handleSpendLoyaltyPoints = async () => {
    if (points && userTokenId) {
      await spendLoyaltyPoints(userTokenId, points);
      const { data } = await refetchTokenData();
      if (data?.data?.[0]?.data?.content) {
        const newBalance = (data.data[0].data.content as any)?.fields?.balance;
        setOnChainPointsState(newBalance);
      }
      setPoints("");
    } else {
      notify("Please enter an amount and ensure you have loyalty tokens", "error");
    }
  };

  // Show loading skeleton for token data
  if (isTokenLoading && hasSuiWallet && !hasEvmWallet && !hasPrivyWallet) {
    return <ContentSkeleton theme={collectionTheme} variant="points" />;
  }

  if (!mounted) return null;

  return (
    <>
      {ownerId && (
        <LoyaltyCodesTable
          owner_id={ownerId}
          onPointsUpdate={handlePointsUpdate}
          collection={collection}
        />
      )}
      {ownerId && <LeaderboardTable owner_id={ownerId} />}
    </>
  );
}
