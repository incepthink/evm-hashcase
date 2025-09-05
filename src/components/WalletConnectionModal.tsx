"use client";
import React, { useEffect } from "react";

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
    // Modal will auto-close via useEffect when wallet is detected
    console.log("Privy login successful");
  };

  return (
    <Modal
      context="Connect Wallet"
      openModal={openModal}
      onClose={() => setOpenModal(false)}
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

        {/* Privy Connection Status (if connected via Privy) */}
        {privyAuthenticated && privyUser?.wallet?.address && !evmWallet && (
          <div className="w-full p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
            <div className="text-sm text-green-800">
              <div className="font-medium mb-1">Connected via Google:</div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>
                  {privyUser.wallet.address.slice(0, 8)}...
                  {privyUser.wallet.address.slice(-6)}
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

        {/* Google Login via Privy */}
        <div className="w-full">
          <PrivyLogin onSuccess={handlePrivySuccess} />
        </div>
      </div>
    </Modal>
  );
};

export default WalletConnectionModal;
