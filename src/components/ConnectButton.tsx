"use client";

import { useGlobalAppStore } from "@/store/globalAppStore";
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

  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [activeWalletType, setActiveWalletType] = useState<
    "evm" | "privy" | null
  >(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Get wallet info from store only
  const evmWallet = getWalletForChain("evm");

  // Handle initialization state
  useEffect(() => {
    // Simple initialization - just set to false after a short delay
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Update display based on verified user and store wallets ONLY
  useEffect(() => {
    let displayAddress: string | null = null;
    let walletType: "evm" | "privy" | null = null;

    // Only show wallet info if user is verified AND has wallet in store
    if (isUserVerified && evmWallet && evmWallet.address) {
      displayAddress = `${evmWallet.address.slice(
        0,
        10
      )}...${evmWallet.address.slice(-8)}`;

      // Determine wallet type from store
      if (evmWallet.type === "privy") {
        walletType = "privy";
      } else {
        walletType = "evm";
      }
    }

    setWalletAddress(displayAddress);
    setActiveWalletType(walletType);
  }, [isUserVerified, evmWallet]);

  // Clear wallet address when user is not verified
  useEffect(() => {
    if (!isUserVerified) {
      setWalletAddress(null);
      setActiveWalletType(null);
    }
  }, [isUserVerified]);

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
      // Since we removed direct wallet hooks, we don't need to call
      // disconnect functions here - the cleanup is handled by the global store
      console.log("Disconnected all wallets from global store");
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

  // If user is verified and has wallet in store, show address and disconnect button
  if (walletAddress && isUserVerified && evmWallet) {
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
      disabled={isInitializing}
      className="flex justify-center items-center gap-x-2 sm:gap-x-3 md:gap-x-5 px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-2.5 border-b-2 text-white font-medium sm:font-semibold rounded-2xl w-max ml-4 sm:ml-6 md:ml-10 text-xs sm:text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <span className="hidden sm:inline">Connect</span>
      <span className="sm:hidden">Connect</span>
      <Wallet className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
    </button>
  );
};

export default ConnectButton;
