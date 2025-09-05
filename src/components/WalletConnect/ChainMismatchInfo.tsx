"use client";

import { AlertTriangle, Wallet } from "lucide-react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useZkLogin } from "@mysten/enoki/react";
import { useAccount } from "wagmi";
import { useGlobalAppStore } from "@/store/globalAppStore";

interface ChainMismatchInfoProps {
  requiredChain: "ethereum" | "sui";
  className?: string;
}

const ChainMismatchInfo = ({
  requiredChain,
  className = "",
}: ChainMismatchInfoProps) => {
  const currentAccount = useCurrentAccount(); // Sui wallet
  const { address: zkAddress } = useZkLogin(); // Sui zkLogin
  const { address: evmAddress } = useAccount(); // EVM wallet
  const { setOpenModal } = useGlobalAppStore();

  // Determine what wallets are connected
  const hasSuiWallet = !!(currentAccount?.address || zkAddress);
  const hasEvmWallet = !!evmAddress;
  const hasAnyWallet = hasSuiWallet || hasEvmWallet;

  // Determine if there's a chain mismatch
  const hasCorrectChain = requiredChain === "sui" ? hasSuiWallet : hasEvmWallet;
  const hasWrongChain =
    requiredChain === "sui"
      ? hasEvmWallet && !hasSuiWallet
      : hasSuiWallet && !hasEvmWallet;

  // Don't show if no wallet connected or if correct chain is connected
  if (!hasAnyWallet || hasCorrectChain) {
    return null;
  }

  // Only show if user has wrong chain wallet connected
  if (!hasWrongChain) {
    return null;
  }

  const getChainDisplayName = (chain: "ethereum" | "sui") => {
    return chain === "ethereum" ? "Ethereum/EVM" : "Sui";
  };

  const getConnectedChainName = () => {
    if (hasSuiWallet) return "Sui";
    if (hasEvmWallet) return "Ethereum/EVM";
    return "Unknown";
  };

  const getWalletConnectText = () => {
    return requiredChain === "ethereum"
      ? "Connect EVM Wallet (MetaMask, Phantom, Coinbase)"
      : "Connect Sui Wallet";
  };

  return (
    <div className={`w-full max-w-4xl mx-auto mb-6 ${className}`}>
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4 shadow-sm">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-amber-800">
                  Wrong Network Connected
                </h3>
                <p className="text-sm text-amber-700 mt-1">
                  You have a <strong>{getConnectedChainName()}</strong> wallet
                  connected, but this collection requires a{" "}
                  <strong>{getChainDisplayName(requiredChain)}</strong> wallet.
                </p>
              </div>
              <div className="flex-shrink-0">
                <button
                  onClick={() => setOpenModal(true)}
                  className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-md transition-colors duration-200 border border-amber-300"
                >
                  <Wallet className="w-4 h-4" />
                  {getWalletConnectText()}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChainMismatchInfo;
