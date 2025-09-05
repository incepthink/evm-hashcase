"use client";

import { useGlobalAppStore } from "@/store/globalAppStore";
import { useZkLogin, useEnokiFlow } from "@mysten/enoki/react";
import { Wallet } from "lucide-react";
import React, { useContext, useEffect, useState } from "react";
import axiosInstance from "@/utils/axios";
import { AppContext } from "@/context/AppContext";
import { ActionKind } from "@/context/context-types";

interface ZkLoginProps {
  setOpenModal: (open: boolean) => void;
}

const ZkLogin: React.FC<ZkLoginProps> = ({ setOpenModal }) => {
  const {
    isUserVerified,
    setUser,
    setSuiWallet,
    unsetUser,
    disconnectWallet,
    getWalletForChain,
  } = useGlobalAppStore();

  const { address } = useZkLogin();
  const enokiFlow = useEnokiFlow();
  const { state, dispatch } = useContext(AppContext);

  // Check if Sui wallet (zkLogin) is connected in store
  const suiWallet = getWalletForChain("sui");

  const handleUserCreation = async () => {
    if (isUserVerified || !address) return;

    try {
      const res = await axiosInstance.post("auth/zk-login/login", {
        address: address,
      });
      console.log("AUTH RES", res);

      const token = res.data.token;
      const user_instance = res.data.user_instance;

      // Update AppContext
      dispatch({
        type: ActionKind.SET_USER,
        payload: [user_instance, token],
      });

      // Update global app store
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

      // Set Sui wallet (zkLogin) in store
      setSuiWallet({
        address: address,
        type: "zk-login",
      });

      setOpenModal(false);
    } catch (error) {
      console.error("ZkLogin authentication failed:", error);
      // Clear any partial state on error
      unsetUser();
      disconnectWallet("sui");
    }
  };

  useEffect(() => {
    if (address && !suiWallet && !state.user) {
      console.log("call the user create server api for zklogin");
      handleUserCreation();
    }
  }, [address, suiWallet, state.user]);

  const handleZkLogin = () => {
    try {
      const protocol = window.location.protocol;
      const host = window.location.host;
      const redirectUrl = `${protocol}//${host}/login`;

      enokiFlow
        .createAuthorizationURL({
          provider: "google",
          network: "testnet",
          clientId: process.env.NEXT_PUBLIC_CLIENT_ID_GOOGLE!,
          redirectUrl: redirectUrl,
          extraParams: {
            scope: ["openid", "email", "profile"],
          },
        })
        .then((url) => {
          window.location.href = url;
        });
    } catch (error) {
      console.error("Failed to initiate zkLogin:", error);
    }
  };

  const handleZkLogout = () => {
    try {
      unsetUser();
      disconnectWallet("sui");
      enokiFlow.logout();
      console.log("ZkLogin logout completed");
    } catch (error) {
      console.error("Failed to logout from zkLogin:", error);
    }
  };

  // Show connected state if user is verified and has zkLogin wallet
  if (isUserVerified && suiWallet?.type === "zk-login" && address) {
    return (
      <div className="bg-purple-600 border-black/20 px-6 py-2 text-white font-semibold rounded-full w-full flex items-center gap-x-8 justify-center">
        <Wallet className="w-4 h-4" />
        ZkLogin Connected
      </div>
    );
  }

  // Show zkLogin connect button
  return (
    <button
      onClick={handleZkLogin}
      className="bg-[#4285f4] border-black/20 px-6 py-2 text-white font-semibold rounded-full w-full flex items-center gap-x-8 hover:bg-[#357ae8] transition-colors"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      </svg>
      Connect with Google (ZkLogin)
    </button>
  );
};

export default ZkLogin;
