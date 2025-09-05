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
  } = useGlobalAppStore();

  // Wallet connections
  const { address: evmAddress, isConnected: isEvmConnected } = useAccount(); // EVM wallet
  const {
    authenticated: privyAuthenticated,
    user: privyUser,
    logout: privyLogout,
  } = usePrivy(); // Privy

  // Disconnect functions
  const { disconnect: disconnectEvm } = useEvmDisconnect();

  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [activeWalletType, setActiveWalletType] = useState<
    "evm" | "privy" | null
  >(null);

  // Get wallet info from store
  const evmWallet = getWalletForChain("evm");

  // Debug logging
  useEffect(() => {
    console.log("CONNECT_BUTTON_DEBUG: ConnectButton State:", {
      openModal,
      isUserVerified,
      evmWallet,
      evmAddress,
      privyAuthenticated,
      privyUser,
      privyWalletAddress: privyUser?.wallet?.address,
      hasEvm: hasWalletForChain("evm"),
    });
  }, [
    openModal,
    isUserVerified,
    evmWallet,
    evmAddress,
    privyAuthenticated,
    privyUser,
    hasWalletForChain,
  ]);

  // Update display based on connected wallets
  useEffect(() => {
    let displayAddress: string | null = null;
    let walletType: "evm" | "privy" | null = null;

    // Priority: Show regular EVM if connected, otherwise Privy
    if (isUserVerified && evmWallet && evmAddress) {
      displayAddress = `${evmAddress.slice(0, 10)}...${evmAddress.slice(-8)}`;
      walletType = "evm";
      console.log("CONNECT_BUTTON_DEBUG: Showing EVM wallet:", displayAddress);
    } else if (
      isUserVerified &&
      privyAuthenticated &&
      privyUser?.wallet?.address
    ) {
      const address = privyUser.wallet.address;
      displayAddress = `${address.slice(0, 10)}...${address.slice(-8)}`;
      walletType = "privy";
      console.log(
        "CONNECT_BUTTON_DEBUG: Showing Privy wallet:",
        displayAddress
      );
    }

    setWalletAddress(displayAddress);
    setActiveWalletType(walletType);
  }, [isUserVerified, evmWallet, evmAddress, privyAuthenticated, privyUser]);

  // Clear wallet address when nothing is connected
  useEffect(() => {
    if (!evmAddress && !privyAuthenticated) {
      setWalletAddress(null);
      setActiveWalletType(null);
      console.log(
        "CONNECT_BUTTON_DEBUG: All wallets disconnected - cleared wallet address"
      );
    }
  }, [evmAddress, privyAuthenticated]);

  const handleModal = () => {
    console.log(
      "CONNECT_BUTTON_DEBUG: Connect button clicked, current openModal state:",
      openModal
    );
    setOpenModal(!openModal);
  };

  const handleDisconnect = async () => {
    console.log("CONNECT_BUTTON_DEBUG: Disconnect button clicked");
    console.log("CONNECT_BUTTON_DEBUG: Active wallet type:", activeWalletType);
    console.log("CONNECT_BUTTON_DEBUG: Current wallets:", {
      evmWallet,
      privyAuthenticated,
    });

    // Clear wallet address state immediately for instant UI feedback
    setWalletAddress(null);
    setActiveWalletType(null);

    // Clear user data from global store immediately
    unsetUser();
    disconnectAllWallets();
    console.log("CONNECT_BUTTON_DEBUG: Cleared user data from global store");

    try {
      // Disconnect based on active wallet type or disconnect all
      if (activeWalletType === "evm" && evmAddress) {
        disconnectEvm();
        console.log("CONNECT_BUTTON_DEBUG: Called EVM wallet disconnect");
      } else if (activeWalletType === "privy" && privyAuthenticated) {
        await privyLogout();
        console.log("CONNECT_BUTTON_DEBUG: Called Privy logout");
      } else {
        // Disconnect all if unsure
        if (evmAddress) {
          disconnectEvm();
          console.log("CONNECT_BUTTON_DEBUG: Disconnected EVM wallet");
        }
        if (privyAuthenticated) {
          await privyLogout();
          console.log("CONNECT_BUTTON_DEBUG: Disconnected Privy wallet");
        }
        console.log("CONNECT_BUTTON_DEBUG: Disconnected all wallets");
      }
    } catch (error) {
      console.error("CONNECT_BUTTON_DEBUG: Error during disconnect:", error);
    }
  };

  // If any wallet is connected and user is verified, show address and disconnect button
  if (walletAddress && isUserVerified) {
    const walletTypeDisplay = activeWalletType === "evm" ? "EVM" : "Google";

    console.log(
      "CONNECT_BUTTON_DEBUG: Showing connected state with address:",
      walletAddress
    );
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
  console.log("CONNECT_BUTTON_DEBUG: Showing connect button");
  return (
    <button
      onClick={handleModal}
      className="flex justify-center items-center gap-x-2 sm:gap-x-3 md:gap-x-5 px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-2.5 border-b-2 text-white font-medium sm:font-semibold rounded-2xl w-max ml-4 sm:ml-6 md:ml-10 text-xs sm:text-sm md:text-base"
    >
      <span className="hidden sm:inline">Connect</span>
      <span className="sm:hidden">Connect</span>
      <Wallet className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
    </button>
  );
};

export default ConnectButton;
