"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useState, useEffect } from "react";
import { useGlobalAppStore } from "@/store/globalAppStore";
import { notifyPromise, notifyResolve } from "@/utils/notify";
import axiosInstance from "@/utils/axios";

interface PrivyLoginProps {
  onSuccess?: () => void;
}

export default function PrivyLogin({ onSuccess }: PrivyLoginProps) {
  const { ready, authenticated, user, login, logout, signMessage } = usePrivy();

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
      console.log(
        "Authentication already in progress for this wallet, skipping..."
      );
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
      console.log(
        "AUTO-AUTH TRIGGERED - User authenticated but not verified, starting authentication..."
      );
      // Small delay to ensure state is stable
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

  // Handle Google login
  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      await login();
    } catch (error) {
      console.error("Google login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

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
        <span className="ml-2">Loading Privy...</span>
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

  // INTERMEDIATE STATE: Authenticated with Google but not yet authenticated with backend
  if (authenticated && user?.wallet?.address && !isUserVerified) {
    const walletAddress = user.wallet.address;
    const truncatedAddress = `${walletAddress.slice(
      0,
      4
    )}..${walletAddress.slice(-3)}`;

    // Check if authentication is blocked by the lock
    const authBlocked = !canAuthenticate(walletAddress);

    return (
      <div className="w-full space-y-4">
        {/* MANUAL AUTHENTICATE BUTTON - Single button style */}
        <button
          onClick={handleUserCreation}
          disabled={isLoading || authBlocked || isAuthenticating}
          className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading || isAuthenticating ? (
            <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          )}
          <span className="text-sm font-medium text-gray-700">
            {isLoading || isAuthenticating
              ? "Authenticating..."
              : authBlocked
              ? "Authentication in progress..."
              : `Authenticate ${truncatedAddress}`}
          </span>
        </button>

        <p className="text-xs text-gray-500 text-center">
          Complete authentication to access your wallet
        </p>
      </div>
    );
  }

  // LOGIN STATE: Show Google login button
  return (
    <div className="w-full space-y-4">
      <button
        onClick={handleGoogleLogin}
        disabled={isLoading}
        className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        ) : (
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
        )}
        <span className="text-sm font-medium text-gray-700">
          {isLoading ? "Connecting..." : "Continue with Google"}
        </span>
      </button>

      <p className="text-xs text-gray-500 text-center">
        This will create an EVM wallet linked to your Google account
      </p>
    </div>
  );
}
