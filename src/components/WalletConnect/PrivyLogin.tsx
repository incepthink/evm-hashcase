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
  } = useGlobalAppStore();

  const [isLoading, setIsLoading] = useState(false);
  const [hasTriedAuth, setHasTriedAuth] = useState(false);

  // Check if EVM wallet is connected in store
  const evmWallet = getWalletForChain("evm");

  // DEBUG LOGS with PRIVY_DEBUG prefix
  useEffect(() => {
    console.log("PRIVY_DEBUG: === STATE UPDATE ===");
    console.log("PRIVY_DEBUG: ready:", ready);
    console.log("PRIVY_DEBUG: authenticated:", authenticated);
    console.log("PRIVY_DEBUG: user:", user);
    console.log("PRIVY_DEBUG: user.wallet:", user?.wallet);
    console.log("PRIVY_DEBUG: user.wallet.address:", user?.wallet?.address);
    console.log("PRIVY_DEBUG: user.email:", user?.email);
    console.log("PRIVY_DEBUG: isUserVerified:", isUserVerified);
    console.log("PRIVY_DEBUG: evmWallet from store:", evmWallet);
    console.log("PRIVY_DEBUG: isLoading:", isLoading);
    console.log("PRIVY_DEBUG: hasTriedAuth:", hasTriedAuth);
    console.log("PRIVY_DEBUG: ====================");
  }, [
    ready,
    authenticated,
    user,
    isUserVerified,
    evmWallet,
    isLoading,
    hasTriedAuth,
  ]);

  // Handle authentication - called manually or automatically
  const handleUserCreation = async () => {
    console.log("PRIVY_DEBUG: handleUserCreation STARTED");

    if (!authenticated) {
      console.log("PRIVY_DEBUG: ERROR - Not authenticated, aborting");
      setIsLoading(false);
      return;
    }

    if (!user?.wallet?.address) {
      console.log("PRIVY_DEBUG: ERROR - No wallet address, aborting");
      setIsLoading(false);
      return;
    }

    if (hasTriedAuth) {
      console.log("PRIVY_DEBUG: Already tried auth, skipping");
      return;
    }

    const walletAddress = user.wallet.address;
    console.log("PRIVY_DEBUG: Starting auth for wallet:", walletAddress);
    setHasTriedAuth(true);

    const notifyId = notifyPromise(
      "Authenticating with Google wallet...",
      "info"
    );

    try {
      setIsLoading(true);
      console.log("PRIVY_DEBUG: Loading state set to true");

      // Request authentication token
      console.log("PRIVY_DEBUG: STEP 1 - Requesting auth token...");
      const response = await axiosInstance.get("auth/wallet/request-token");
      console.log(
        "PRIVY_DEBUG: STEP 1 SUCCESS - Token response:",
        response.data
      );

      const message = response.data.message as string;
      const authToken = response.data.token as string;
      console.log("PRIVY_DEBUG: Message to sign:", message);
      console.log("PRIVY_DEBUG: Auth token:", authToken);

      // Sign message using Privy's signMessage function
      console.log("PRIVY_DEBUG: STEP 2 - Requesting signature...");
      const signatureResult = await signMessage({ message });
      console.log(
        "PRIVY_DEBUG: STEP 2 RAW - Signature result:",
        signatureResult
      );
      console.log(
        "PRIVY_DEBUG: STEP 2 TYPE - Signature type:",
        typeof signatureResult
      );

      // Extract signature string from Privy's response
      const signature =
        typeof signatureResult === "string"
          ? signatureResult
          : signatureResult.signature;
      console.log("PRIVY_DEBUG: STEP 2 SUCCESS - Final signature:", signature);
      console.log(
        "PRIVY_DEBUG: STEP 2 FINAL TYPE - Final signature type:",
        typeof signature
      );

      // Login with the signature
      console.log("PRIVY_DEBUG: STEP 3 - Authenticating with backend...");
      const res = await axiosInstance.post("auth/wallet/login", {
        signature,
        address: walletAddress,
        token: authToken,
      });
      console.log("PRIVY_DEBUG: STEP 3 SUCCESS - Backend response:", res.data);

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

      console.log(
        "PRIVY_DEBUG: STEP 4 - Storing user data:",
        userDataToStoreInGlobalStore
      );
      setUser(userDataToStoreInGlobalStore, token);

      // Set EVM wallet in store (Privy embedded wallet)
      console.log("PRIVY_DEBUG: STEP 5 - Storing wallet data");
      setEvmWallet({
        address: walletAddress,
        type: "privy",
      });

      console.log("PRIVY_DEBUG: SUCCESS - Authentication completed");
      notifyResolve(notifyId, "Successfully connected with Google!", "success");
      onSuccess?.();
    } catch (error: any) {
      console.error("PRIVY_DEBUG: ERROR in handleUserCreation:", error);
      console.error("PRIVY_DEBUG: ERROR details:", {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
        stack: error?.stack,
      });

      // Clean up on error
      console.log("PRIVY_DEBUG: Cleaning up after error...");
      unsetUser();
      disconnectWallet("evm");
      setHasTriedAuth(false); // Reset to allow retry

      try {
        await logout();
        console.log("PRIVY_DEBUG: Logout completed");
      } catch (logoutError) {
        console.error("PRIVY_DEBUG: Logout failed:", logoutError);
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
      console.log("PRIVY_DEBUG: Setting loading to false");
      setIsLoading(false);
    }
  };

  // AUTO-AUTHENTICATION: Trigger when user becomes authenticated
  useEffect(() => {
    if (
      authenticated &&
      user?.wallet?.address &&
      !isUserVerified &&
      !hasTriedAuth &&
      ready
    ) {
      console.log(
        "PRIVY_DEBUG: AUTO-AUTH TRIGGERED - User authenticated but not verified, starting authentication..."
      );
      // Small delay to ensure state is stable
      setTimeout(() => {
        handleUserCreation();
      }, 500);
    }
  }, [authenticated, user, isUserVerified, hasTriedAuth, ready]);

  // Reset hasTriedAuth when user logs out
  useEffect(() => {
    if (!authenticated) {
      setHasTriedAuth(false);
      setIsLoading(false);
    }
  }, [authenticated]);

  // Handle Google login
  const handleGoogleLogin = async () => {
    console.log("PRIVY_DEBUG: Google login button clicked");

    try {
      setIsLoading(true);
      setHasTriedAuth(false); // Reset before new login attempt
      console.log("PRIVY_DEBUG: Starting Privy login...");

      // Start the login process
      await login();
      console.log("PRIVY_DEBUG: Privy login completed successfully");

      // Note: Auto-authentication will be triggered by useEffect
    } catch (error) {
      console.error("PRIVY_DEBUG: Google login failed:", error);
      setIsLoading(false);
      setHasTriedAuth(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    console.log("PRIVY_DEBUG: Logout button clicked");

    try {
      setIsLoading(true);

      // Clear global store
      console.log("PRIVY_DEBUG: Clearing global store...");
      unsetUser();
      disconnectWallet("evm");

      // Logout from Privy
      console.log("PRIVY_DEBUG: Logging out from Privy...");
      await logout();
      console.log("PRIVY_DEBUG: Logout completed successfully");

      setHasTriedAuth(false);
    } catch (error) {
      console.error("PRIVY_DEBUG: Logout failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!ready) {
    console.log("PRIVY_DEBUG: Privy not ready yet...");
    return (
      <div className="flex items-center justify-center p-4">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-2">Loading Privy...</span>
      </div>
    );
  }

  // CONDITION CHECK: Show connected state
  const shouldShowConnectedState =
    authenticated && user && isUserVerified && evmWallet;
  console.log(
    "PRIVY_DEBUG: Should show connected state?",
    shouldShowConnectedState
  );
  console.log("PRIVY_DEBUG:   - authenticated:", authenticated);
  console.log("PRIVY_DEBUG:   - user exists:", !!user);
  console.log("PRIVY_DEBUG:   - isUserVerified:", isUserVerified);
  console.log("PRIVY_DEBUG:   - evmWallet exists:", !!evmWallet);

  // If user is authenticated via Privy and verified in our system, show connected state
  if (shouldShowConnectedState) {
    const walletAddress = user.wallet?.address;
    console.log("PRIVY_DEBUG: Rendering connected state for:", walletAddress);

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

  // FALLBACK: If authenticated but authentication is in progress, show loading
  if (
    authenticated &&
    user?.wallet?.address &&
    !isUserVerified &&
    (isLoading || hasTriedAuth)
  ) {
    console.log(
      "PRIVY_DEBUG: Rendering loading state - Auto-authentication in progress"
    );

    return (
      <div className="w-full space-y-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-medium text-blue-800">
              Completing Authentication...
            </span>
          </div>

          <p className="text-sm text-blue-700 mb-3">
            Wallet: {user.wallet.address.slice(0, 8)}...
            {user.wallet.address.slice(-6)}
          </p>

          <button
            onClick={handleLogout}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // Show login button
  console.log("PRIVY_DEBUG: Rendering login button state");
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
