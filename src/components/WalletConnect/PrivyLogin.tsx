"use client";

import { usePrivy, useLoginWithEmail } from "@privy-io/react-auth";
import { useState, useEffect } from "react";
import { useGlobalAppStore } from "@/store/globalAppStore";
import { notifyPromise, notifyResolve } from "@/utils/notify";
import axiosInstance from "@/utils/axios";

interface PrivyLoginProps {
  email: string;
  onSuccess?: () => void;
  onBack?: () => void;
}

export default function PrivyLogin({
  email,
  onSuccess,
  onBack,
}: PrivyLoginProps) {
  const { ready, authenticated, user, logout, signMessage } = usePrivy();
  const { sendCode, loginWithCode, state } = useLoginWithEmail();

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
  const [codeTriggered, setCodeTriggered] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Check if EVM wallet is connected in store
  const evmWallet = getWalletForChain("evm");

  // Helper function to check if error is rate limiting
  const isRateLimitError = (error: any): boolean => {
    return (
      error?.message?.includes("Too many requests") ||
      error?.toString()?.includes("Too many requests") ||
      error?.code === 429
    );
  };

  // Send OTP code when component mounts (only once per email)
  useEffect(() => {
    if (ready && email && !codeTriggered && !codeSent) {
      setCodeTriggered(true);
      setIsLoading(true);
      setErrorMessage(""); // Clear any previous errors

      sendCode({ email })
        .then(() => {
          setCodeSent(true);
          setErrorMessage(""); // Clear errors on success
        })
        .catch((error) => {
          console.error("Failed to send code:", error);
          setIsLoading(false);
          setCodeTriggered(false);

          if (isRateLimitError(error)) {
            setErrorMessage(
              "Too many requests. Please wait a moment and try again."
            );
          } else {
            setErrorMessage(
              "Failed to send verification code. Please try again."
            );
          }
        });
    }
  }, [ready, email, codeTriggered, codeSent, sendCode]);

  // Update loading state based on Privy's OTP state
  useEffect(() => {
    if (state?.status === "sending-code") {
      setIsLoading(true);
    } else if (state?.status === "awaiting-code-input") {
      setIsLoading(false);
    } else if (state?.status === "submitting-code") {
      setIsLoading(true);
    }
  }, [state]);

  // Handle OTP code submission
  const handleCodeSubmit = async () => {
    if (otpCode && otpCode.length >= 4) {
      try {
        await loginWithCode({ code: otpCode });
      } catch (error) {
        console.error("Invalid code:", error);
        // Let user try again, Privy allows up to 5 attempts
      }
    }
  };

  const handleCodeKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCodeSubmit();
    }
  };

  const handleResendCode = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(""); // Clear any previous errors
      await sendCode({ email });
      setOtpCode(""); // Clear current code
      setCodeSent(true); // Mark as sent
    } catch (error) {
      console.error("Failed to resend code:", error);
      setIsLoading(false);

      if (isRateLimitError(error)) {
        setErrorMessage(
          "Too many requests. Please wait a moment and try again."
        );
      } else {
        setErrorMessage(
          "Failed to resend verification code. Please try again."
        );
      }
    }
  };

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
      setCodeTriggered(false);
      setOtpCode("");
      setCodeSent(false); // Reset code sent status
      setErrorMessage(""); // Clear error messages
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

      // Reset states
      setCodeTriggered(false);
      setOtpCode("");
      setCodeSent(false); // Reset code sent status
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

  // ERROR STATE: Show rate limiting or other errors
  if (errorMessage && !authenticated) {
    return (
      <div className="w-full space-y-4">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-center mb-3">
            <svg
              className="w-6 h-6 text-red-500 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm text-red-700">{errorMessage}</span>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => {
                setErrorMessage("");
                setCodeTriggered(false);
                setCodeSent(false);
              }}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
            >
              Try Again
            </button>
            {onBack && (
              <button
                onClick={onBack}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors text-sm"
              >
                Back
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // LOADING STATE: Code being sent
  if ((state?.status === "sending-code" || isLoading) && !authenticated) {
    return (
      <div className="w-full space-y-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-center mb-3">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-3"></div>
            <span className="text-sm text-blue-700">
              Sending verification code to {email}...
            </span>
          </div>

          {onBack && (
            <button
              onClick={onBack}
              className="w-full px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              Back to Email Entry
            </button>
          )}
        </div>
      </div>
    );
  }

  // OTP INPUT STATE: Show code input
  if (state?.status === "awaiting-code-input" && !authenticated) {
    return (
      <div className="w-full space-y-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700 mb-4 text-center">
            Enter the verification code sent to {email}
          </p>

          <div className="flex w-full mb-4">
            <input
              type="text"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              onKeyPress={handleCodeKeyPress}
              placeholder="Enter 6-digit code"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-center !text-black"
              style={{ fontSize: "16px" }}
              maxLength={6}
              autoComplete="one-time-code"
            />
            <button
              onClick={handleCodeSubmit}
              disabled={
                !otpCode ||
                otpCode.length < 4 ||
                //@ts-ignore
                state?.status === "submitting-code"
              }
              className="px-4 py-3 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {/* @ts-ignore */}
              {state?.status === "submitting-code" ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              )}
            </button>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={handleResendCode}
              //@ts-ignore
              disabled={state?.status === "sending-code"}
              className="flex-1 px-4 py-2 bg-neutral-500 text-white rounded hover:bg-gray-600 disabled:opacity-50 transition-colors text-sm"
            >
              Resend Code
            </button>
            {/* {onBack && (
              <button
                onClick={onBack}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors text-sm"
              >
                Back
              </button>
            )} */}
          </div>
        </div>
      </div>
    );
  }

  // FALLBACK STATE: Should not normally be reached
  return (
    <div className="w-full space-y-4">
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-sm text-gray-700 text-center">
          Initializing email authentication for {email}...
        </p>
        {onBack && (
          <button
            onClick={onBack}
            className="w-full mt-3 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Back
          </button>
        )}
      </div>
    </div>
  );
}
