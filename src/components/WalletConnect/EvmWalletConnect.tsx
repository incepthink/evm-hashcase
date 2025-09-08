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
    userHasInteracted,
    setUserHasInteracted,
  } = useGlobalAppStore();

  const { address, isConnected } = useAccount();
  const { connectAsync } = useConnect();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  const connectors = useConnectors();

  const [loading, setLoading] = useState(true);
  const [creatingUser, setCreatingUser] = useState(false);
  const [connectingWallet, setConnectingWallet] = useState(false);

  // Check if EVM wallet is connected in store
  const evmWallet = getWalletForChain("evm");

  // Filter to only show specific wallets
  const allowedWallets = ["MetaMask", "Phantom", "Coinbase Wallet"];
  const filteredConnectors = connectors.filter((connector) =>
    allowedWallets.some((allowed) => connector.name.includes(allowed))
  );

  // Safety check with improved conditions
  useEffect(() => {
    const resetConnectionState = async () => {
      // Add a small delay to let wagmi settle
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Only disconnect if we're absolutely sure there's a stale connection
      // and the user hasn't initiated any connection process
      if (
        isConnected &&
        !evmWallet &&
        !isUserVerified &&
        address &&
        !connectingWallet &&
        !creatingUser
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
    // and ensure we're not in the middle of any authentication process
    if (
      isConnected &&
      !isUserVerified &&
      !evmWallet &&
      !connectingWallet &&
      !creatingUser
    ) {
      resetConnectionState();
    }
  }, []); // Keep empty dependency array to run only once on mount

  useEffect(() => {
    console.log("Available EVM connectors:", filteredConnectors);
    console.log("Current EVM account:", address);
    console.log("Is user verified:", isUserVerified);
    console.log("EVM wallet in store:", evmWallet);
  }, [filteredConnectors, address, isUserVerified, evmWallet]);

  const handleUserCreation = async () => {
    if (isUserVerified || !address) return;

    setCreatingUser(true);
    const notifyId = notifyPromise("Authenticating...", "info");

    try {
      const response = await axiosInstance.get("auth/wallet/request-token");
      const message = response.data.message as string;
      const authToken = response.data.token as string;

      const signature = await signMessageAsync({ message });

      const res = await axiosInstance.post("auth/evm-wallet/login", {
        signature,
        address,
        token: authToken,
      });

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

      // Set EVM wallet in store (best-effort wallet type guess)
      setEvmWallet({
        address,
        type: "metamask",
      });

      notifyResolve(notifyId, "Connected successfully!", "success");
    } catch (error: any) {
      console.error("Authentication error:", error);

      // Handle signature rejection (error code 4001)
      if (error?.code === 4001 || error?.message?.includes("User rejected")) {
        notifyResolve(
          notifyId,
          "Signature cancelled. You can try connecting again.",
          "error"
        );
      } else {
        notifyResolve(
          notifyId,
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
    } finally {
      setOpenModal(false);
      setCreatingUser(false);
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
    const notifyId = notifyPromise(
      `Connecting to ${connector.name}...`,
      "info"
    );

    try {
      // Initiate connection and wait for completion
      await connectAsync({ connector });

      // After connectAsync resolves, either read from connector or from the hook
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

      // Request authentication with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await axiosInstance.get("auth/wallet/request-token", {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const message = response.data.message as string;
      const authToken = response.data.token as string;

      const signature = await signMessageAsync({ message });

      const loginController = new AbortController();
      const loginTimeoutId = setTimeout(() => loginController.abort(), 15000);

      const res = await axiosInstance.post(
        "auth/wallet/login",
        {
          signature,
          address: finalAddress,
          token: authToken,
        },
        {
          signal: loginController.signal,
        }
      );
      clearTimeout(loginTimeoutId);

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
        address: finalAddress,
        type: getWalletType(connector.name),
      });

      notifyResolve(
        notifyId,
        `Successfully connected to ${connector.name}!`,
        "success"
      );
    } catch (error: any) {
      console.error("Failed to connect EVM wallet:", error);

      // Complete cleanup on any error
      unsetUser();
      disconnectWallet("evm");

      if (isConnected) {
        disconnect();
      }

      // Enhanced error handling
      if (error?.code === 4001 || error?.message?.includes("User rejected")) {
        notifyResolve(
          notifyId,
          "Connection cancelled. You can try again anytime.",
          "error"
        );
      } else if (error.name === "AbortError") {
        notifyResolve(
          notifyId,
          "Connection timed out. Please try again.",
          "error"
        );
      } else if (error?.message?.includes("No wallet address available")) {
        notifyResolve(
          notifyId,
          "Wallet connected but no address found. Please try again.",
          "error"
        );
      } else {
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Connection failed";
        notifyResolve(notifyId, `Failed to connect: ${errorMessage}`, "error");
      }
    } finally {
      setConnectingWallet(false);
    }
  };

  // FIXED: Only auto-authenticate if user has explicitly interacted
  useEffect(() => {
    if (
      isConnected &&
      address &&
      !isUserVerified &&
      !connectingWallet &&
      !evmWallet &&
      !creatingUser &&
      userHasInteracted // ADDED: Only authenticate if user has interacted
    ) {
      console.log("Auto-authenticating EVM wallet after user interaction");
      handleUserCreation();
    }
  }, [
    isConnected,
    address,
    isUserVerified,
    connectingWallet,
    evmWallet,
    creatingUser,
    userHasInteracted, // ADDED: Include in dependencies
  ]);

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
        EVM Wallet Connected
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
            disabled={connectingWallet || creatingUser || !connector}
            className="bg-[#ffffff] border-black/20 px-6 py-2 text-black font-semibold rounded-full w-full flex items-center gap-x-8 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => handleWalletConnect(connector)}
          >
            {connectingWallet || creatingUser ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black" />
                {creatingUser ? "Authenticating..." : "Connecting..."}
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
