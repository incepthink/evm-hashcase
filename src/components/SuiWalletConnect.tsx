"use client";

import { useEffect, useRef, useState } from "react";
import { Wallet as LucideWalletIcon } from "lucide-react";
import Image from "next/image";
import {
  useConnectWallet,
  useCurrentAccount,
  useDisconnectWallet,
  useSignPersonalMessage,
  useWallets,
} from "@mysten/dapp-kit";

import { notifyPromise, notifyResolve } from "@/utils/notify";
import axiosInstance from "@/utils/axios";
import { useGlobalAppStore } from "@/store/globalAppStore";

export default function SuiWalletConnect() {
  const {
    isUserVerified,
    setUser,
    setSuiWallet,
    setOpenModal,
    unsetUser,
    getWalletForChain,
    disconnectWallet,
  } = useGlobalAppStore();

  const { mutateAsync: signPersonalMessage } = useSignPersonalMessage();
  const currentAccount = useCurrentAccount();
  const { mutateAsync: connect } = useConnectWallet();
  const { mutate: disconnect } = useDisconnectWallet();
  const wallets = useWallets();

  const [loading, setLoading] = useState(true);
  const [creatingUser, setCreatingUser] = useState(false);
  const [connectingWallet, setConnectingWallet] = useState(false);

  // Check if Sui wallet is connected in store
  const suiWallet = getWalletForChain("sui");

  useEffect(() => {
    console.log("Available wallets:", wallets);
    console.log("Current account:", currentAccount);
    console.log("Is user verified:", isUserVerified);
    console.log("Sui wallet in store:", suiWallet);
  }, [wallets, currentAccount, isUserVerified, suiWallet]);

  const handleUserCreation = async () => {
    if (isUserVerified || !currentAccount?.address) return;

    const notifyId = notifyPromise("Connecting...", "info");

    try {
      const response = await axiosInstance.get("auth/wallet/request-token");
      const message = response.data.message;
      const authToken = response.data.token;

      const signedMessageResponse = await signPersonalMessage({
        message: new TextEncoder().encode(message),
      });

      const res = await axiosInstance.post("auth/sui-wallet/login", {
        signature: signedMessageResponse.signature,
        address: currentAccount.address,
        token: authToken,
      });

      const token = res.data.token;
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

      // Set Sui wallet in store
      setSuiWallet({
        address: currentAccount.address,
        type: "sui-wallet",
      });

      notifyResolve(notifyId, "Connected", "success");
    } catch (error: unknown) {
      console.log(error);
      notifyResolve(notifyId, "Failed to login", "error");
    } finally {
      setOpenModal(false);
      setCreatingUser(false);
    }
  };

  const ranEffect = useRef(false);

  useEffect(() => {
    setLoading(false);
  }, [currentAccount]);

  const handleWalletConnect = async (wallet: any) => {
    setConnectingWallet(true);
    const notifyId = notifyPromise(`Connecting to ${wallet.name}...`, "info");

    try {
      await connect({ wallet });
      console.log("connected to", wallet.name);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const walletAddress =
        currentAccount?.address || wallet.accounts?.[0]?.address;

      if (!walletAddress) {
        throw new Error("No wallet address available");
      }

      console.log("Requesting authentication token...");

      const response = (await axiosInstance.get(
        "auth/wallet/request-token"
      )) as any;
      const message = response.data.message;
      const authToken = response.data.token;

      const signedMessageResponse = await signPersonalMessage({
        message: new TextEncoder().encode(message),
      });

      const res = (await axiosInstance.post("auth/sui-wallet/login", {
        signature: signedMessageResponse.signature,
        address: walletAddress,
        token: authToken,
      })) as any;

      const token = res.data.token;
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

      // Set Sui wallet in store
      setSuiWallet({
        address: walletAddress,
        type: "sui-wallet",
      });

      console.log("Wallet connected and authenticated");
      notifyResolve(
        notifyId,
        `Successfully connected to ${wallet.name}!`,
        "success"
      );
    } catch (error: unknown) {
      console.log("Failed to connect to the wallet");
      console.error(error);

      unsetUser();
      disconnectWallet("sui");

      if (currentAccount?.address) {
        try {
          await disconnect();
          console.log("Disconnected wallet due to authentication failure");
        } catch (disconnectError: unknown) {
          console.error("Failed to disconnect wallet:", disconnectError);
        }
      }

      setTimeout(async () => {
        if (currentAccount?.address) {
          try {
            await disconnect();
            console.log("Forced disconnect after delay");
          } catch (error: unknown) {
            console.error("Failed to force disconnect:", error);
          }
        }
      }, 500);

      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      const errorResponse = error as any;

      if (errorMessage === "No wallet address available") {
        notifyResolve(
          notifyId,
          "Wallet connected but no address found",
          "error"
        );
      } else if (errorResponse?.response?.status === 401) {
        notifyResolve(
          notifyId,
          "Authentication failed - please try again",
          "error"
        );
      } else if (errorResponse?.code === 4001) {
        notifyResolve(notifyId, "User rejected the signature request", "error");
      } else {
        notifyResolve(
          notifyId,
          `Failed to connect wallet: ${errorMessage}`,
          "error"
        );
      }
    } finally {
      setConnectingWallet(false);
    }
  };

  const handleWalletDisconnect = async () => {
    try {
      unsetUser();
      disconnectWallet("sui");
      await disconnect();
      console.log("Disconnected Sui wallet");
    } catch (error: unknown) {
      console.log("Failed to disconnect wallet");
      console.error(error);
    }
  };

  if (loading) return <div>Loading Wallets...</div>;

  // Show connected state if user is verified and has Sui wallet
  if (
    isUserVerified &&
    suiWallet &&
    currentAccount?.address &&
    !connectingWallet
  ) {
    return (
      <div className="bg-green-600 border-black/20 px-6 py-2 text-white font-semibold rounded-full w-full flex items-center gap-x-8 justify-center">
        <LucideWalletIcon className="w-4 h-4" />
        Sui Wallet Connected
      </div>
    );
  }

  if (!wallets || wallets.length === 0) {
    return <div>No wallets were found</div>;
  }

  return wallets.map((wallet) => (
    <button
      key={wallet.name}
      disabled={connectingWallet}
      className="bg-[#ffffff] border-black/20 px-6 py-2 text-black font-semibold rounded-full w-full flex items-center gap-x-8 disabled:opacity-50 disabled:cursor-not-allowed"
      onClick={() => handleWalletConnect(wallet)}
    >
      {connectingWallet ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
          Connecting...
        </>
      ) : (
        <>
          <Image src={wallet.icon} alt="Sui Logo" width={20} height={20} />
          {`Connect ${wallet.name} Wallet`}
        </>
      )}
    </button>
  ));
}
