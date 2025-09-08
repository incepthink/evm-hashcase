"use client";

import { useGlobalAppStore } from "@/store/globalAppStore";
import { useAccount, useDisconnect as useEvmDisconnect } from "wagmi";
import { usePrivy } from "@privy-io/react-auth";
import { Wallet } from "lucide-react";
import React, { useEffect, useState } from "react";

const ConnectButton: React.FC = () => {
  const {
    openModal,
    setOpenModal,
    unsetUser,
    isUserVerified,
    getWalletForChain,
    hasWalletForChain,
    disconnectWallet,
    disconnectAllWallets,
    setUserHasInteracted,
  } = useGlobalAppStore();

  // Wallet connections
  const { address: evmAddress, isConnected: isEvmConnected } = useAccount(); // EVM wallet
  const {
    authenticated: privyAuthenticated,
    user: privyUser,
    logout: privyLogout,
    ready: privyReady,
  } = usePrivy(); // Privy

  // Disconnect functions
  const { disconnect: disconnectEvm } = useEvmDisconnect();

  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [activeWalletType, setActiveWalletType] = useState<
    "evm" | "privy" | null
  >(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Get wallet info from store
  const evmWallet = getWalletForChain("evm");

  // Handle initialization state
  useEffect(() => {
    // Consider initialization complete when Privy is ready
    if (privyReady) {
      setIsInitializing(false);
    }
  }, [privyReady]);

  // Update display based on connected wallets
  useEffect(() => {
    let displayAddress: string | null = null;
    let walletType: "evm" | "privy" | null = null;

    // If user is verified, check for wallet connections
    if (isUserVerified) {
      // Priority 1: EVM wallet from store (most reliable after refresh)
      if (evmWallet && evmWallet.address) {
        displayAddress = `${evmWallet.address.slice(
          0,
          10
        )}...${evmWallet.address.slice(-8)}`;
        walletType = "evm";
      }
      // Priority 2: Live EVM connection
      else if (isEvmConnected && evmAddress) {
        displayAddress = `${evmAddress.slice(0, 10)}...${evmAddress.slice(-8)}`;
        walletType = "evm";
      }
      // Priority 3: Privy wallet (either from store or live)
      else if (privyAuthenticated && privyUser?.wallet?.address) {
        const address = privyUser.wallet.address;
        displayAddress = `${address.slice(0, 10)}...${address.slice(-8)}`;
        walletType = "privy";
      }
    }

    setWalletAddress(displayAddress);
    setActiveWalletType(walletType);
  }, [
    isUserVerified,
    evmWallet,
    evmAddress,
    isEvmConnected,
    privyAuthenticated,
    privyUser,
  ]);

  // Clear wallet address when user is not verified and no wallets connected
  useEffect(() => {
    if (!isUserVerified && !evmAddress && !privyAuthenticated) {
      setWalletAddress(null);
      setActiveWalletType(null);
    }
  }, [isUserVerified, evmAddress, privyAuthenticated]);

  const handleModal = () => {
    // Only allow opening modal if not initializing and no wallet is connected
    if (!isInitializing && !walletAddress) {
      // Mark user interaction when opening modal
      setUserHasInteracted(true);
      setOpenModal(!openModal);
    }
  };

  const handleDisconnect = async () => {
    // Clear wallet address state immediately for instant UI feedback
    setWalletAddress(null);
    setActiveWalletType(null);

    // Clear user data from global store immediately
    unsetUser();
    disconnectAllWallets();

    try {
      // Disconnect based on active wallet type or disconnect all
      if (activeWalletType === "evm" && evmAddress) {
        disconnectEvm();
      } else if (activeWalletType === "privy" && privyAuthenticated) {
        await privyLogout();
      } else {
        // Disconnect all if unsure
        if (evmAddress) {
          disconnectEvm();
        }
        if (privyAuthenticated) {
          await privyLogout();
        }
      }
    } catch (error) {
      console.error("Error during disconnect:", error);
    }
  };

  // Show loading state during initialization
  if (isInitializing) {
    return (
      <div className="ml-4 sm:ml-6 md:ml-10 flex items-center gap-x-2 sm:gap-x-3 px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 md:py-2.5 border-b-2 text-white border-gray-300 w-max font-medium sm:font-semibold rounded-2xl text-xs sm:text-sm md:text-base opacity-50">
        <Wallet className="w-3 h-3 sm:w-4 sm:h-4 animate-pulse" />
        <span>Loading...</span>
      </div>
    );
  }

  // If any wallet is connected and user is verified, show address and disconnect button
  if (walletAddress && isUserVerified) {
    const walletTypeDisplay = activeWalletType === "evm" ? "EVM" : "Google";

    return (
      <div className="ml-4 sm:ml-6 md:ml-10 flex items-center gap-x-2 sm:gap-x-3 px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 md:py-2.5 border-b-2 text-white border-gray-300 w-max font-medium sm:font-semibold rounded-2xl text-xs sm:text-sm md:text-base">
        <div className="flex items-center gap-x-2 sm:gap-x-3">
          <Wallet className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">{walletAddress}</span>
          <span className="sm:hidden">
            {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </span>
          <span className="text-xs opacity-75">({walletTypeDisplay})</span>
        </div>
        <button
          onClick={handleDisconnect}
          className="text-red-400 hover:text-red-300 font-medium text-xs sm:text-sm"
        >
          <span className="hidden sm:inline">Disconnect</span>
          <span className="sm:hidden">✕</span>
        </button>
      </div>
    );
  }

  // If no wallet connected or not authenticated, show connect button
  return (
    <button
      onClick={handleModal}
      disabled={isInitializing || (isUserVerified && !walletAddress)}
      className="flex justify-center items-center gap-x-2 sm:gap-x-3 md:gap-x-5 px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-2.5 border-b-2 text-white font-medium sm:font-semibold rounded-2xl w-max ml-4 sm:ml-6 md:ml-10 text-xs sm:text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <span className="hidden sm:inline">Connect</span>
      <span className="sm:hidden">Connect</span>
      <Wallet className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
    </button>
  );
};

export default ConnectButton;
