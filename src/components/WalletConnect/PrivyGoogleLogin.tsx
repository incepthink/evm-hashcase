"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useState, useEffect } from "react";
import { useGlobalAppStore } from "@/store/globalAppStore";
import { notifyPromise, notifyResolve } from "@/utils/notify";
import axiosInstance from "@/utils/axios";

interface PrivyGoogleLoginProps {
  onSuccess?: () => void;
}

export default function PrivyGoogleLogin({ onSuccess }: PrivyGoogleLoginProps) {
  const { ready, authenticated, user, logout, signMessage, login } = usePrivy();
  const {
    isUserVerified,
    setUser,
    setEvmWallet,
    unsetUser,
    getWalletForChain,
    disconnectWallet,
    isAuthenticating,
    setIsAuthenticating,
    authenticationLock,
    setAuthenticationLock,
    canAuthenticate,
  } = useGlobalAppStore();

  const [isLoading, setIsLoading] = useState(false);

  // Check if EVM wallet is connected in store
  const evmWallet = getWalletForChain("evm");

  // MANUAL AUTHENTICATION FUNCTION with lock
  const handleUserCreation = async () => {
    if (!authenticated || !user?.wallet?.address) {
      setIsLoading(false);
      return;
    }

    const walletAddress = user.wallet.address;

    // Check if authentication is already in progress for this wallet
    if (!canAuthenticate(walletAddress)) {
      setIsLoading(false);
      return;
    }

    // Set authentication lock
    setIsAuthenticating(true);
    setAuthenticationLock({
      walletAddress,
      timestamp: Date.now(),
    });

    const notifyId = notifyPromise(
      "Authenticating with Google wallet...",
      "info"
    );

    try {
      setIsLoading(true);

      // Request authentication token
      const response = await axiosInstance.get("auth/wallet/request-token");
      const message = response.data.message as string;
      const authToken = response.data.token as string;

      // Sign message using Privy's signMessage function
      const signatureResult = await signMessage({ message });

      // Extract signature string from Privy's response
      const signature =
        typeof signatureResult === "string"
          ? signatureResult
          : signatureResult.signature;

      // Login with the signature
      const res = await axiosInstance.post("auth/wallet/login", {
        signature,
        address: walletAddress,
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

      // Set EVM wallet in store (Privy embedded wallet)
      setEvmWallet({
        address: walletAddress,
        type: "privy",
      });

      notifyResolve(notifyId, "Successfully connected with Google!", "success");
      onSuccess?.();
    } catch (error: any) {
      console.error("Authentication error:", error);

      // Clean up on error
      unsetUser();
      disconnectWallet("evm");

      try {
        await logout();
      } catch (logoutError) {
        console.error("Logout failed:", logoutError);
      }

      const errorMessage = error?.message || "Unknown error";
      if (error?.response?.status === 401) {
        notifyResolve(notifyId, "Authentication failed", "error");
      } else {
        notifyResolve(
          notifyId,
          `Failed to authenticate: ${errorMessage}`,
          "error"
        );
      }
    } finally {
      // Clear authentication lock
      setIsAuthenticating(false);
      setAuthenticationLock(null);
      setIsLoading(false);
    }
  };

  // AUTO-AUTHENTICATION: Trigger when user becomes authenticated
  useEffect(() => {
    if (authenticated && user?.wallet?.address && !isUserVerified && ready) {
      setTimeout(() => {
        handleUserCreation();
      }, 500);
    }
  }, [authenticated, user, isUserVerified, ready]);

  // Reset states when user logs out
  useEffect(() => {
    if (!authenticated) {
      setIsLoading(false);
      // Clear lock if this wallet was being authenticated
      if (
        authenticationLock &&
        user?.wallet?.address === authenticationLock.walletAddress
      ) {
        setAuthenticationLock(null);
        setIsAuthenticating(false);
      }
    }
  }, [
    authenticated,
    authenticationLock,
    user?.wallet?.address,
    setAuthenticationLock,
    setIsAuthenticating,
  ]);

  // Handle logout
  const handleLogout = async () => {
    try {
      setIsLoading(true);

      // Clear global store
      unsetUser();
      disconnectWallet("evm");

      // Logout from Privy
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!ready) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  // CONNECTED STATE: Show when user is authenticated via Privy and verified in our system
  if (authenticated && user && isUserVerified && evmWallet) {
    const walletAddress = user.wallet?.address;

    return (
      <div className="w-full space-y-4">
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-green-800">
              Connected via Google
            </span>
          </div>

          {user.email && (
            <p className="text-sm text-green-700 mb-2">
              Email: {user.email.address}
            </p>
          )}

          {walletAddress && (
            <p className="text-sm text-green-700 mb-3">
              Wallet: {walletAddress.slice(0, 8)}...{walletAddress.slice(-6)}
            </p>
          )}

          <button
            onClick={handleLogout}
            disabled={isLoading}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
          >
            {isLoading ? "Disconnecting..." : "Disconnect Google Wallet"}
          </button>
        </div>
      </div>
    );
  }

  // INTERMEDIATE STATE: Show authentication progress
  if (authenticated && user?.wallet?.address && !isUserVerified) {
    return (
      <div className="w-full space-y-4">
        <div className="flex items-center justify-center p-4">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-3"></div>
          <span className="text-sm text-gray-700">
            Completing authentication...
          </span>
        </div>
      </div>
    );
  }

  // LOGIN STATE: Show Google login button
  return (
    <div className="w-full">
      <button
        onClick={() => {
          setIsLoading(true);
          login();
          // Privy login will handle the authentication flow
          // The useEffect will trigger handleUserCreation once authenticated
        }}
        disabled={isLoading}
        className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            Connecting...
          </div>
        ) : (
          "Connect with Google"
        )}
      </button>
    </div>
  );
}
