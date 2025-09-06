"use client";
import React, { useEffect, useState } from "react";

import Modal from "@/components/Modal";
import EVMWalletConnect from "@/components/WalletConnect/EvmWalletConnect";
import PrivyLogin from "@/components/WalletConnect/PrivyLogin";
import { useGlobalAppStore } from "@/store/globalAppStore";
import { useAccount } from "wagmi";
import { usePrivy } from "@privy-io/react-auth";

const WalletConnectionModal = () => {
  const {
    openModal,
    setOpenModal,
    isUserVerified,
    getWalletForChain,
    hasWalletForChain,
  } = useGlobalAppStore();

  // EVM wallet connection
  const { address: evmAddress } = useAccount();

  // Privy connection
  const { authenticated: privyAuthenticated, user: privyUser } = usePrivy();

  // State for email-based connection
  const [email, setEmail] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);

  // Get EVM wallet state from store
  const evmWallet = getWalletForChain("evm");

  // Auto-close modal when user is verified and has EVM wallet (from either source)
  useEffect(() => {
    const hasWallet =
      hasWalletForChain("evm") ||
      (privyAuthenticated && privyUser?.wallet?.address);
    if (hasWallet && isUserVerified && openModal) {
      setOpenModal(false);
    }
  }, [
    isUserVerified,
    evmWallet,
    privyAuthenticated,
    privyUser,
    openModal,
    setOpenModal,
    hasWalletForChain,
  ]);

  const handlePrivySuccess = () => {
    console.log("Privy login successful");
    setEmailSubmitted(false);
    setEmail("");
  };

  const handleEmailSubmit = () => {
    if (email && email.includes("@")) {
      setEmailSubmitted(true);
    }
  };

  // const handleEmailKeyPress = (e: React.KeyboardEvent) => {
  //   if (e.key === "Enter") {
  //     handleEmailSubmit();
  //   }
  // };

  const resetEmailFlow = () => {
    setEmailSubmitted(false);
    setEmail("");
  };

  return (
    <Modal
      context="Connect Wallet"
      openModal={openModal}
      onClose={() => {
        setOpenModal(false);
        resetEmailFlow();
      }}
    >
      <div className="flex flex-col z-[9999] justify-center items-center gap-y-4 my-4 mx-4">
        {/* Connection Status (if already connected) */}
        {evmWallet && (
          <div className="w-full p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
            <div className="text-sm text-green-800">
              <div className="font-medium mb-1">Connected Wallet:</div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>
                  EVM: {evmWallet.address.slice(0, 8)}...
                  {evmWallet.address.slice(-6)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* EVM Wallet Connection */}
        <EVMWalletConnect />

        {/* Divider */}
        <div className="flex items-center w-full">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="flex-shrink mx-4 text-gray-500 text-sm">or</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        {/* Email Input or Privy Authentication */}
        {!emailSubmitted ? (
          /* Custom Email Input Field */
          <div className="w-full space-y-3">
            <div className="flex w-full">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                // onKeyPress={handleEmailKeyPress}
                placeholder="Enter your email"
                className=" flex-1 px-4 py-3 border border-gray-300 rounded-l-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white !text-black"
                style={{
                  fontSize: "16px",
                  WebkitAppearance: "none",
                  position: "relative",
                  zIndex: 99999,
                  borderRadius: "8px 0 0 8px",
                  cursor: "pointer",
                }}
                autoComplete="email"
                inputMode="email"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck="false"
              />
              <button
                onClick={handleEmailSubmit}
                disabled={!email || !email.includes("@")}
                className="px-4 py-3 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
            <p className="text-xs text-gray-500 text-center">
              This will create an EVM wallet linked to your email
            </p>
          </div>
        ) : (
          /* Privy Login Component */
          <div className="w-full">
            <PrivyLogin
              email={email}
              onSuccess={handlePrivySuccess}
              onBack={resetEmailFlow}
            />
          </div>
        )}
      </div>
    </Modal>
  );
};

export default WalletConnectionModal;
