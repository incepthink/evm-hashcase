"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useState, useEffect, useCallback } from "react";
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
    setUserHasInteracted,
  } = useGlobalAppStore();

  const [isLoading, setIsLoading] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  // Check if EVM wallet is connected in store
  const evmWallet = getWalletForChain("evm");

  // Enhanced canAuthenticate with timeout
  const canAuthenticateWithTimeout = useCallback(
    (walletAddress: string) => {
      if (!authenticationLock) return true;

      // If lock is for different wallet, allow
      if (authenticationLock.walletAddress !== walletAddress) return true;

      // If lock is older than 30 seconds, clear it and allow
      const now = Date.now();
      if (now - authenticationLock.timestamp > 30000) {
        console.log("Clearing expired authentication lock");
        setAuthenticationLock(null);
        setIsAuthenticating(false);
        return true;
      }

      return false;
    },
    [authenticationLock, setAuthenticationLock, setIsAuthenticating]
  );

  // Clear any stuck locks on component mount
  useEffect(() => {
    const now = Date.now();
    if (authenticationLock && now - authenticationLock.timestamp > 30000) {
      console.log("Clearing stuck authentication lock on mount");
      setAuthenticationLock(null);
      setIsAuthenticating(false);
    }
  }, []);

  // Complete cleanup function
  const completeCleanup = useCallback(() => {
    setIsAuthenticating(false);
    setAuthenticationLock(null);
    setIsLoading(false);
    setLastError(null);
    unsetUser();
    disconnectWallet("evm");
  }, [setIsAuthenticating, setAuthenticationLock, unsetUser, disconnectWallet]);

  // MANUAL AUTHENTICATION FUNCTION - Only called when user clicks authenticate
  const handleUserAuthentication = useCallback(
    async (walletAddress: string) => {
      console.log("Starting manual authentication for wallet:", walletAddress);

      // Check if authentication is already in progress for this wallet
      if (!canAuthenticateWithTimeout(walletAddress)) {
        console.log("Authentication already in progress for this wallet");
        setIsLoading(false);
        return { success: false };
      }

      // Set authentication lock
      setIsAuthenticating(true);
      setAuthenticationLock({
        walletAddress,
        timestamp: Date.now(),
      });

      const notificationController = notifyPromise(
        "Authenticating with Google wallet...",
        "info"
      );

      try {
        setIsLoading(true);
        setLastError(null);

        // Create abort controller for this authentication
        const authController = new AbortController();

        // Connect the notification cancellation to the auth controller
        const originalCancel = notificationController.cancel;
        notificationController.cancel = () => {
          authController.abort();
          originalCancel();
        };

        console.log("Requesting authentication token...");
        const response = await axiosInstance.get("auth/wallet/request-token", {
          signal: authController.signal,
        });

        console.log("Auth token response:", response.data);

        if (!response.data.message || !response.data.token) {
          throw new Error(
            "Invalid response from auth server - missing message or token"
          );
        }

        const message = response.data.message as string;
        const authToken = response.data.token as string;

        console.log("Message to sign:", message);
        console.log("Signing message with Privy...");

        // Sign message using Privy's signMessage function with better error handling
        let signatureResult;
        try {
          signatureResult = await signMessage({ message });
        } catch (signError: any) {
          console.error("Signing failed:", signError);

          // Handle user rejection specifically
          if (
            signError?.code === 4001 ||
            signError?.message?.includes("User rejected") ||
            signError?.message?.includes("denied")
          ) {
            throw new Error("USER_REJECTED_SIGNATURE");
          }
          throw new Error("Failed to sign message. Please try again.");
        }

        console.log(
          "Signature result:",
          typeof signatureResult,
          signatureResult
        );

        // Enhanced signature extraction with proper typing
        let signature: string;
        if (typeof signatureResult === "string") {
          signature = signatureResult;
        } else if (signatureResult && typeof signatureResult === "object") {
          // Cast to any to safely check properties
          const sigResult = signatureResult as any;

          // Handle different possible signature formats
          if (sigResult.signature && typeof sigResult.signature === "string") {
            signature = sigResult.signature;
          } else if (sigResult.data && typeof sigResult.data === "string") {
            signature = sigResult.data;
          } else {
            // Try to find any string property that looks like a signature
            const possibleSig = Object.values(sigResult).find(
              (val): val is string =>
                typeof val === "string" &&
                val.startsWith("0x") &&
                val.length > 100
            );
            if (possibleSig) {
              signature = possibleSig;
            } else {
              console.error("Unexpected signature format:", signatureResult);
              throw new Error("Invalid signature format received");
            }
          }
        } else {
          console.error("Unexpected signature result:", signatureResult);
          throw new Error("No signature received from wallet");
        }

        if (!signature || signature.length < 132) {
          // Basic signature validation
          throw new Error("Invalid signature received");
        }

        console.log("Valid signature obtained, logging in...");

        // Login with the signature
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

        console.log("Login response:", res.data);

        if (!res.data.token || !res.data.user_instance) {
          throw new Error(
            "Invalid login response - missing token or user data"
          );
        }

        const token: string = res.data.token;
        const user_instance = res.data.user_instance;

        const userDataToStoreInGlobalStore = {
          id: user_instance.id,
          email: user_instance.email,
          badges: user_instance.badges || [],
          user_name: user_instance.username || "guest_user",
          description:
            user_instance.description || "this is a guest_user description",
          profile_image: user_instance.profile_image,
          banner_image: user_instance.banner_image,
        };

        console.log(
          "Setting user data in store:",
          userDataToStoreInGlobalStore
        );

        setUser(userDataToStoreInGlobalStore, token);

        // Set EVM wallet in store (Privy embedded wallet)
        setEvmWallet({
          address: walletAddress,
          type: "privy",
        });

        console.log("Authentication successful!");
        notifyResolve(
          notificationController,
          "Successfully connected with Google!",
          "success"
        );
        onSuccess?.();
        return { success: true };
      } catch (error: any) {
        console.error("Authentication error:", error);

        const errorMessage = error?.message || "Unknown error";
        setLastError(errorMessage);

        // Enhanced error handling with specific cases
        if (error.name === "AbortError") {
          // User cancelled - don't show error notification
          return { success: false, cancelled: true };
        } else if (errorMessage === "USER_REJECTED_SIGNATURE") {
          notifyResolve(
            notificationController,
            "Signature cancelled. You can try connecting again.",
            "error"
          );

          // Complete cleanup for user rejection
          completeCleanup();

          // Don't logout on user rejection, just clean up states
          return { success: false };
        } else if (error?.response?.status === 401) {
          notifyResolve(
            notificationController,
            "Authentication failed - invalid credentials",
            "error"
          );
        } else if (error?.response?.status === 429) {
          notifyResolve(
            notificationController,
            "Too many attempts. Please wait before trying again.",
            "error"
          );
        } else if (error?.response?.data?.message) {
          notifyResolve(
            notificationController,
            `Authentication failed: ${error.response.data.message}`,
            "error"
          );
        } else {
          notifyResolve(
            notificationController,
            `Authentication failed: ${errorMessage}`,
            "error"
          );
        }

        // Complete cleanup on error
        completeCleanup();

        // Only logout on certain types of errors to avoid infinite loops
        if (
          !errorMessage.includes("User rejected") &&
          !errorMessage.includes("cancelled") &&
          errorMessage !== "USER_REJECTED_SIGNATURE"
        ) {
          try {
            await logout();
          } catch (logoutError) {
            console.error("Logout failed:", logoutError);
          }
        }

        return { success: false };
      } finally {
        // Always clear authentication states
        setIsAuthenticating(false);
        setAuthenticationLock(null);
        setIsLoading(false);
      }
    },
    [
      canAuthenticateWithTimeout,
      setIsAuthenticating,
      setAuthenticationLock,
      setUser,
      setEvmWallet,
      completeCleanup,
      logout,
      signMessage,
      onSuccess,
    ]
  );

  // MANUAL AUTHENTICATE FUNCTION - Wrapper for external calls
  const handleManualAuthenticate = async () => {
    if (!authenticated || !user?.wallet?.address) {
      console.log("Not authenticated or no wallet address");
      return;
    }

    const result = await handleUserAuthentication(user.wallet.address);
    if (result.success) {
      // Success handled in the authentication function
    }
  };

  // Reset states when user logs out
  useEffect(() => {
    if (!authenticated) {
      setIsLoading(false);
      setLastError(null);
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
      console.log("Logging out...");

      // Complete cleanup
      completeCleanup();

      // Logout from Privy
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Force clear locks (debug function)
  const clearLocks = () => {
    console.log("Force clearing all locks...");
    completeCleanup();
  };

  useEffect(() => {
    // Reset loading state when authentication fails or is cancelled
    if (!authenticated && isLoading) {
      setIsLoading(false);
    }
  }, [authenticated, isLoading]);

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
              Connected via Google & Authenticated
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

  // LOGIN STATE: Show Google login button that handles both login and authentication
  return (
    <div className="w-full space-y-3">
      <button
        onClick={() => {
          // Mark user interaction
          setUserHasInteracted(true);

          if (authenticated && user?.wallet?.address) {
            // If already logged in with Privy, authenticate directly
            handleManualAuthenticate();
          } else {
            // If not logged in, start Privy login first
            setIsLoading(true);
            setLastError(null);
            console.log("Initiating Privy login...");
            login();
          }
        }}
        disabled={isLoading || isAuthenticating}
        className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading || isAuthenticating ? (
          <div className="flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            Connecting...
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="white"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="white"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="white"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="white"
              />
            </svg>
            Connect with Google
          </div>
        )}
      </button>

      {lastError && !isLoading && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">Error: {lastError}</p>
        </div>
      )}
    </div>
  );
}
