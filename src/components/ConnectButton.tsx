"use client";

import { useGlobalAppStore } from "@/store/globalAppStore";
import { Wallet, User, LogOut, ChevronDown } from "lucide-react";
import React, { useEffect, useState, useRef } from "react";
import { useDisconnect, useAccount } from "wagmi";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";

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
    setIsLoggingOut,
  } = useGlobalAppStore();

  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [activeWalletType, setActiveWalletType] = useState<
    "evm" | "privy" | null
  >(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  // Refs for dropdown
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Wallet hooks
  const { disconnect: disconnectWagmi } = useDisconnect();
  const {
    logout: logoutPrivy,
    authenticated: privyAuthenticated,
    user: privyUser,
  } = usePrivy();
  const { address: wagmiAddress, isConnected: wagmiConnected } = useAccount();

  const router = useRouter();

  // Get wallet info from store only
  const evmWallet = getWalletForChain("evm");

  // Handle clicks outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  // Handle initialization state
  useEffect(() => {
    // Simple initialization - just set to false after a short delay
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Check for pending state
  useEffect(() => {
    let pending = false;

    // Check if Privy is connected but user not verified
    if (privyAuthenticated && privyUser?.wallet?.address && !isUserVerified) {
      pending = true;
    }

    // Check if Wagmi is connected but user not verified
    if (wagmiConnected && wagmiAddress && !isUserVerified) {
      pending = true;
    }

    setIsPending(pending);
  }, [
    privyAuthenticated,
    privyUser,
    wagmiConnected,
    wagmiAddress,
    isUserVerified,
  ]);

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
      setDropdownOpen(false);
    }
  }, [isUserVerified]);

  const handleModal = () => {
    // Allow opening modal if not initializing and (no wallet connected OR pending state)
    if (!isInitializing && (!walletAddress || isPending)) {
      // Mark user interaction when opening modal
      setUserHasInteracted(true);
      setOpenModal(!openModal);
    }
  };

  const handleAddressClick = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleProfile = () => {
    setDropdownOpen(false);

    // Get the wallet address from the global store
    const connectedWallet = evmWallet?.address;

    if (connectedWallet) {
      router.push(`/profile/${connectedWallet}`);
    }
  };

  const handleCompleteDisconnect = async () => {
    setDropdownOpen(false);
    setIsLoggingOut(true);

    // Clear wallet address state immediately for instant UI feedback
    setWalletAddress(null);
    setActiveWalletType(null);
    setIsPending(false);

    // Clear user data from global store immediately
    unsetUser();
    disconnectAllWallets();

    try {
      // Complete disconnect from all wallet providers
      if (activeWalletType === "privy" || privyAuthenticated) {
        // Disconnect from Privy (Google login)
        await logoutPrivy();
        console.log("Disconnected from Privy");
      }

      if (activeWalletType === "evm" || wagmiConnected) {
        // Disconnect from Wagmi (MetaMask, etc.)
        disconnectWagmi();
        console.log("Disconnected from Wagmi");
      }

      // Additional cleanup - clear any localStorage tokens or session data
      if (typeof window !== "undefined") {
        // Clear any auth tokens stored in localStorage
        localStorage.removeItem("authToken");
        localStorage.removeItem("userToken");
        localStorage.removeItem("walletConnect");

        // Clear any session storage
        sessionStorage.clear();

        // You might have other storage keys to clear based on your app
      }

      console.log("Complete disconnect successful");
    } catch (error) {
      console.error("Error during complete disconnect:", error);
    } finally {
      setIsLoggingOut(false);
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

  // If user is verified and has wallet in store, show address with dropdown
  if (walletAddress && isUserVerified && evmWallet) {
    const walletTypeDisplay = activeWalletType === "evm" ? "EVM" : "Google";

    return (
      <div className="ml-4 sm:ml-6 md:ml-10 relative">
        <button
          ref={buttonRef}
          onClick={handleAddressClick}
          className="flex items-center gap-x-2 sm:gap-x-3 px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 md:py-2.5 border-b-2 text-white border-gray-300 w-max font-medium sm:font-semibold rounded-2xl text-xs sm:text-sm md:text-base hover:bg-white/10 transition-colors"
        >
          <Wallet className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">
            {walletAddress.slice(0, 5)}...{walletAddress.slice(-3)}
          </span>
          <span className="sm:hidden">
            {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </span>
          <ChevronDown
            className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform ${
              dropdownOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Dropdown Menu */}
        {dropdownOpen && (
          <div
            ref={dropdownRef}
            className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[160px] overflow-hidden"
          >
            <button
              onClick={handleProfile}
              className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-3 text-sm font-medium transition-colors"
            >
              <User className="w-4 h-4" />
              Profile
            </button>
            <div className="border-t border-gray-100"></div>
            <button
              onClick={handleCompleteDisconnect}
              className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 flex items-center gap-3 text-sm font-medium transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Disconnect
            </button>
          </div>
        )}
      </div>
    );
  }

  // If wallet is connected but not authenticated, show pending state - CLICKABLE
  if (isPending) {
    return (
      <button
        onClick={handleModal}
        disabled={isInitializing}
        className="ml-4 sm:ml-6 md:ml-10 flex items-center gap-x-2 sm:gap-x-3 px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 md:py-2.5 border-b-2 text-yellow-200 border-yellow-300 w-max font-medium sm:font-semibold rounded-2xl text-xs sm:text-sm md:text-base hover:bg-yellow-400/10 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-yellow-200 border-t-transparent rounded-full animate-spin"></div>
        <span>Pending...</span>
      </button>
    );
  }

  // If no wallet connected or not authenticated, show connect button
  return (
    <button
      onClick={handleModal}
      disabled={isInitializing}
      className="flex justify-center items-center gap-x-2 sm:gap-x-3 md:gap-x-5 px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-2.5 border-b-2 text-white font-medium sm:font-semibold rounded-2xl w-max ml-4 sm:ml-6 md:ml-10 text-xs sm:text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
    >
      <span className="hidden sm:inline">Connect</span>
      <span className="sm:hidden">Connect</span>
      <Wallet className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
    </button>
  );
};

export default ConnectButton;
