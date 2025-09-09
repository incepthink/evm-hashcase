"use client";

import { useEffect, useRef, useState } from "react";
import { Wallet as LucideWalletIcon } from "lucide-react";
import Image from "next/image";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useSignMessage,
  useConnectors,
} from "wagmi";
import type { Connector } from "wagmi";
import { notifyPromise, notifyResolve } from "@/utils/notify";
import axiosInstance from "@/utils/axios";
import { useGlobalAppStore } from "@/store/globalAppStore";

export default function EVMWalletConnect() {
  const {
    isUserVerified,
    setUser,
    setEvmWallet,
    setOpenModal,
    unsetUser,
    getWalletForChain,
    disconnectWallet,
    setUserHasInteracted,
  } = useGlobalAppStore();

  const { address, isConnected } = useAccount();
  const { connectAsync } = useConnect();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  const connectors = useConnectors();

  const [loading, setLoading] = useState(true);
  const [connectingWallet, setConnectingWallet] = useState(false);

  // Check if EVM wallet is connected in store
  const evmWallet = getWalletForChain("evm");

  // Filter to only show specific wallets
  const allowedWallets = ["MetaMask", "Phantom", "Coinbase Wallet"];
  const filteredConnectors = connectors.filter((connector) =>
    allowedWallets.some((allowed) => connector.name.includes(allowed))
  );

  // Safety check with improved conditions - NO AUTO AUTHENTICATION
  useEffect(() => {
    const resetConnectionState = async () => {
      // Add a small delay to let wagmi settle
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Only disconnect if we're absolutely sure there's a stale connection
      // and NO authentication process should happen
      if (
        isConnected &&
        !evmWallet &&
        !isUserVerified &&
        address &&
        !connectingWallet
      ) {
        console.log(
          "Cleaning up stale wallet connection for address:",
          address
        );
        try {
          disconnect();
        } catch (error) {
          console.warn("Failed to disconnect stale connection:", error);
        }
      }
    };

    // Only run if we detect an actual stale connection
    if (isConnected && !isUserVerified && !evmWallet && !connectingWallet) {
      resetConnectionState();
    }
  }, []); // Keep empty dependency array to run only once on mount

  useEffect(() => {
    console.log("Available EVM connectors:", filteredConnectors);
    console.log("Current EVM account:", address);
    console.log("Is user verified:", isUserVerified);
    console.log("EVM wallet in store:", evmWallet);
  }, [filteredConnectors, address, isUserVerified, evmWallet]);

  // MANUAL AUTHENTICATION FUNCTION - Only called when user clicks authenticate
  const handleUserAuthentication = async (walletAddress: string) => {
    if (isUserVerified) return { success: true };

    const notificationController = notifyPromise("Authenticating...", "info");

    try {
      // Create abort controller for this authentication
      const authController = new AbortController();

      // Connect the notification cancellation to the auth controller
      const originalCancel = notificationController.cancel;
      notificationController.cancel = () => {
        authController.abort();
        originalCancel();
      };

      const response = await axiosInstance.get("auth/wallet/request-token", {
        signal: authController.signal,
      });
      const message = response.data.message as string;
      const authToken = response.data.token as string;

      const signature = await signMessageAsync({ message });

      const res = await axiosInstance.post(
        "auth/wallet/login",
        {
          signature,
          address: walletAddress,
          token: authToken,
        },
        {
          signal: authController.signal,
        }
      );

      const token: string = res.data.token;
      const user_instance = res.data.user_instance;

      const userDataToStoreInGlobalStore = {
        id: user_instance.id,
        email: user_instance.email,
        badges: user_instance.badges,
        user_name: user_instance.username || "guest_user",
        description:
          user_instance.description || "this is a guest_user description",
        profile_image: user_instance.profile_image,
        banner_image: user_instance.banner_image,
      };

      setUser(userDataToStoreInGlobalStore, token);

      // Set EVM wallet in store
      setEvmWallet({
        address: walletAddress,
        type: "metamask",
      });

      notifyResolve(
        notificationController,
        "Connected successfully!",
        "success"
      );
      return { success: true };
    } catch (error: any) {
      console.error("Authentication error:", error);

      // Handle different error types
      if (error.name === "AbortError") {
        // User cancelled - don't show error notification
        return { success: false, cancelled: true };
      } else if (
        error?.code === 4001 ||
        error?.message?.includes("User rejected")
      ) {
        notifyResolve(
          notificationController,
          "Signature cancelled. You can try connecting again.",
          "error"
        );
      } else {
        notifyResolve(
          notificationController,
          "Failed to authenticate. Please try again.",
          "error"
        );
      }

      // Complete cleanup on any error
      unsetUser();
      disconnectWallet("evm");

      // Disconnect wallet on authentication failure
      if (isConnected) {
        try {
          disconnect();
        } catch (disconnectError) {
          console.warn(
            "Failed to disconnect after auth error:",
            disconnectError
          );
        }
      }

      return { success: false };
    }
  };

  useEffect(() => {
    setLoading(false);
  }, [address]);

  const getWalletType = (
    connectorName: string
  ): "metamask" | "phantom" | "coinbase" => {
    if (connectorName.includes("MetaMask")) return "metamask";
    if (connectorName.includes("Phantom")) return "phantom";
    if (connectorName.includes("Coinbase")) return "coinbase";
    return "metamask"; // fallback
  };

  const handleWalletConnect = async (connector: Connector) => {
    // Mark user interaction
    setUserHasInteracted(true);

    setConnectingWallet(true);
    const notificationController = notifyPromise(
      `Connecting to ${connector.name}...`,
      "info"
    );

    try {
      // Create abort controller for this connection
      const connectController = new AbortController();

      // Connect the notification cancellation to the connect controller
      const originalCancel = notificationController.cancel;
      notificationController.cancel = () => {
        connectController.abort();
        originalCancel();
      };

      // Initiate connection and wait for completion
      await connectAsync({ connector });

      // After connectAsync resolves, get the wallet address
      let walletAddress = address;
      if (!walletAddress) {
        try {
          const accounts = await connector.getAccounts?.();
          walletAddress = accounts?.[0] ?? walletAddress;
        } catch {
          // ignore, fallback to hook state
        }
      }

      // give the hook a tiny moment if still not populated
      if (!walletAddress) {
        await new Promise((r) => setTimeout(r, 300));
      }
      const finalAddress = walletAddress || address;
      if (!finalAddress) {
        throw new Error("No wallet address available");
      }

      notifyResolve(
        notificationController,
        "Wallet connected! Click authenticate to continue.",
        "success"
      );

      // DO NOT AUTO-AUTHENTICATE - Let user decide when to authenticate
      console.log("Wallet connected. User must manually authenticate.");
    } catch (error: any) {
      console.error("Failed to connect EVM wallet:", error);

      // Handle different error types
      if (error.name === "AbortError") {
        // User cancelled - don't show error notification
        return;
      }

      // Complete cleanup on any error
      unsetUser();
      disconnectWallet("evm");

      if (isConnected) {
        disconnect();
      }

      // Enhanced error handling
      if (error?.code === 4001 || error?.message?.includes("User rejected")) {
        notifyResolve(
          notificationController,
          "Connection cancelled. You can try again anytime.",
          "error"
        );
      } else if (error?.message?.includes("No wallet address available")) {
        notifyResolve(
          notificationController,
          "Wallet connected but no address found. Please try again.",
          "error"
        );
      } else {
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Connection failed";
        notifyResolve(
          notificationController,
          `Failed to connect: ${errorMessage}`,
          "error"
        );
      }
    } finally {
      setConnectingWallet(false);
    }
  };

  // MANUAL AUTHENTICATE BUTTON - Only way to trigger authentication
  const handleManualAuthenticate = async () => {
    if (!address) {
      console.log("No wallet address available for authentication");
      return;
    }

    const result = await handleUserAuthentication(address);
    if (result.success) {
      setOpenModal(false);
    }
  };

  const handleWalletDisconnect = async () => {
    try {
      unsetUser();
      disconnectWallet("evm");
      disconnect();
      console.log("Disconnected EVM wallet");
    } catch (error: unknown) {
      console.error("Failed to disconnect EVM wallet:", error);
    }
  };

  if (loading) return <div>Loading EVM Wallets...</div>;

  // Show connected state if user is verified and has EVM wallet
  if (
    isUserVerified &&
    evmWallet &&
    address &&
    isConnected &&
    !connectingWallet
  ) {
    return (
      <div className="bg-blue-600 border-black/20 px-6 py-2 text-white font-semibold rounded-full w-full flex items-center gap-x-8 justify-center">
        <LucideWalletIcon className="w-4 h-4" />
        EVM Wallet Connected & Authenticated
      </div>
    );
  }

  // Show authenticate button if wallet is connected but not authenticated
  if (isConnected && address && !isUserVerified && !connectingWallet) {
    return (
      <div className="w-full space-y-3">
        <div className="bg-yellow-100 border border-yellow-300 px-4 py-2 rounded-lg">
          <p className="text-sm text-yellow-800 mb-2">
            Wallet connected: {address.slice(0, 8)}...{address.slice(-6)}
          </p>
          <p className="text-xs text-yellow-700">
            Click authenticate to complete the connection
          </p>
        </div>
        <button
          onClick={handleManualAuthenticate}
          className="bg-green-600 border-black/20 px-6 py-2 text-white font-semibold rounded-full w-full flex items-center gap-x-4 justify-center hover:bg-green-700"
        >
          <LucideWalletIcon className="w-4 h-4" />
          Authenticate Wallet
        </button>
        <button
          onClick={handleWalletDisconnect}
          className="bg-red-600 border-black/20 px-6 py-2 text-white font-semibold rounded-full w-full flex items-center gap-x-4 justify-center hover:bg-red-700"
        >
          Disconnect
        </button>
      </div>
    );
  }

  if (!filteredConnectors || filteredConnectors.length === 0) {
    return <div>No EVM wallets were found</div>;
  }

  return (
    <>
      {filteredConnectors.map((connector) => {
        const getWalletIcon = (name: string) => {
          if (name.includes("MetaMask")) return "/icons/metamask.svg";
          if (name.includes("Phantom")) return "/icons/phantom.svg";
          if (name.includes("Coinbase")) return "/icons/coinbase.svg";
          return "/icons/wallet-default.svg";
        };

        return (
          <button
            key={connector.id}
            disabled={connectingWallet || !connector}
            className="bg-[#ffffff] border-black/20 px-6 py-2 text-black font-semibold rounded-full w-full flex items-center gap-x-8 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => handleWalletConnect(connector)}
          >
            {connectingWallet ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black" />
                Connecting...
              </>
            ) : (
              <>
                <Image
                  src={getWalletIcon(connector.name)}
                  alt={`${connector.name} Logo`}
                  width={20}
                  height={20}
                  onError={(e) => {
                    // Next/Image forwards to the underlying img element
                    (e.target as HTMLImageElement).src =
                      "/icons/wallet-default.svg";
                  }}
                />
                {`Connect ${connector.name}`}
              </>
            )}
          </button>
        );
      })}
    </>
  );
}
