"use client";

import { useEffect, useRef, useState, useCallback } from "react";
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

// ===== TYPE DEFINITIONS =====

interface AuthenticationResult {
  success: boolean;
  cancelled?: boolean;
}

// ===== MAIN COMPONENT =====

export default function EVMWalletConnect() {
  // ===== HOOKS & GLOBAL STATE =====
  const {
    isUserVerified,
    setUser,
    setEvmWallet,
    setOpenModal,
    unsetUser,
    getWalletForChain,
    disconnectWallet,
    setUserHasInteracted,
    isAuthenticating,
    setIsAuthenticating,
    authenticationLock,
    setAuthenticationLock,
    isLoggingOut,
  } = useGlobalAppStore();

  const { address, isConnected } = useAccount();
  const { connectAsync } = useConnect();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  const connectors = useConnectors();

  // ===== LOCAL STATE =====
  const [loading, setLoading] = useState(true);
  const [connectingWallet, setConnectingWallet] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  // ===== COMPUTED VALUES =====
  // Check if EVM wallet is connected in store
  const evmWallet = getWalletForChain("evm");

  // Filter to only show specific wallets
  const allowedWallets = ["MetaMask", "Phantom", "Coinbase Wallet"];
  const filteredConnectors = connectors
    .filter((connector) =>
      allowedWallets.some((allowed) => connector.name.includes(allowed))
    )
    .sort((a, b) => {
      const order = ["MetaMask", "Phantom", "Coinbase Wallet"];
      const aIndex = order.findIndex((name) => a.name.includes(name));
      const bIndex = order.findIndex((name) => b.name.includes(name));
      return aIndex - bIndex;
    });

  // ===== UTILITY FUNCTIONS =====

  /**
   * Check if authentication can proceed with timeout handling
   */
  const canAuthenticateWithTimeout = useCallback(
    (walletAddress: string): boolean => {
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

  /**
   * Complete cleanup of all authentication states
   */
  const completeCleanup = useCallback(() => {
    setIsAuthenticating(false);
    setAuthenticationLock(null);
    setConnectingWallet(false);
    setLastError(null);
    unsetUser();
    disconnectWallet("evm");
  }, [setIsAuthenticating, setAuthenticationLock, unsetUser, disconnectWallet]);

  /**
   * Get wallet type from connector name
   */
  const getWalletType = (
    connectorName: string
  ): "metamask" | "phantom" | "coinbase" => {
    if (connectorName.includes("MetaMask")) return "metamask";
    if (connectorName.includes("Phantom")) return "phantom";
    if (connectorName.includes("Coinbase")) return "coinbase";
    return "metamask"; // fallback
  };

  /**
   * Get wallet icon from connector name
   */
  const getWalletIcon = (name: string): string => {
    if (name.includes("MetaMask")) return "/icons/metamask.svg";
    if (name.includes("Phantom")) return "/icons/phantom.svg";
    if (name.includes("Coinbase")) return "/icons/coinbase.svg";
    return "/icons/wallet-default.svg";
  };

  // ===== MAIN AUTHENTICATION LOGIC =====

  /**
   * Handle user authentication process
   * Called automatically after wallet connection or manually
   */
  const handleUserAuthentication = useCallback(
    async (walletAddress: string): Promise<AuthenticationResult> => {
      console.log("Starting EVM authentication for wallet:", walletAddress);

      if (isUserVerified) return { success: true };

      // Check if authentication is already in progress for this wallet
      if (!canAuthenticateWithTimeout(walletAddress)) {
        console.log("Authentication already in progress for this wallet");
        setConnectingWallet(false);
        return { success: false };
      }

      // Set authentication lock
      setIsAuthenticating(true);
      setAuthenticationLock({
        walletAddress,
        timestamp: Date.now(),
      });

      const notificationController = notifyPromise("Authenticating...", "info");

      try {
        setLastError(null);

        // Create abort controller for this authentication
        const authController = new AbortController();

        // Connect the notification cancellation to the auth controller
        const originalCancel = notificationController.cancel;
        notificationController.cancel = () => {
          authController.abort();
          originalCancel();
        };

        // Step 1: Request authentication token with wallet address
        console.log("Requesting authentication token...");

        let response;
        try {
          response = await axiosInstance.get(
            `auth/wallet/request-token/${walletAddress}`,
            {
              signal: authController.signal,
            }
          );
          console.log("Auth token response:", response.data);
        } catch (axiosError: any) {
          // Handle 400 status specifically (user already signed)
          if (axiosError.response && axiosError.response.status === 400) {
            console.log(
              "User has already signed message, setting user data directly"
            );

            const responseData = axiosError.response.data;
            if (responseData.userInstance) {
              const userInstance = responseData.userInstance;
              const userDataToStoreInGlobalStore = {
                id: userInstance.id,
                email: userInstance.email,
                badges: userInstance.badges || [],
                user_name: userInstance.username || "guest_user",
                description:
                  userInstance.description ||
                  "this is a guest_user description",
                profile_image: userInstance.profile_image,
                banner_image: userInstance.banner_image,
              };

              console.log(
                "Setting existing user data in store:",
                userDataToStoreInGlobalStore
              );

              // Set user with empty token as specified
              setUser(userDataToStoreInGlobalStore, "");

              // Set EVM wallet in store
              setEvmWallet({
                address: walletAddress,
                type: getWalletType(
                  connectors.find((c) => c.id)?.name || "MetaMask"
                ),
              });

              console.log("Authentication successful for existing user!");
              notifyResolve(
                notificationController,
                "Welcome back! Already authenticated.",
                "success"
              );
              return { success: true };
            }
          }

          // Re-throw if it's not a 400 or doesn't have userInstance
          throw axiosError;
        }

        // Normal flow for new users or users who haven't signed
        if (!response.data.message || !response.data.token) {
          throw new Error(
            "Invalid response from auth server - missing message or token"
          );
        }

        const message = response.data.message as string;
        const authToken = response.data.token as string;

        // Step 2: Sign message using Wagmi
        console.log("Message to sign:", message);
        console.log("Signing message with wallet...");

        let signature;
        try {
          signature = await signMessageAsync({ message });
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

        console.log("Valid signature obtained, logging in...");

        // Step 3: Login with the signature
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

        // Step 4: Store user data
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

        // Set EVM wallet in store
        setEvmWallet({
          address: walletAddress,
          type: getWalletType(connectors.find((c) => c.id)?.name || "MetaMask"),
        });

        console.log("Authentication successful!");
        notifyResolve(
          notificationController,
          "Connected successfully!",
          "success"
        );
        return { success: true };
      } catch (error: any) {
        console.error("Authentication error:", error);
        return handleAuthenticationError(error, notificationController);
      } finally {
        // Always clear authentication states
        setIsAuthenticating(false);
        setAuthenticationLock(null);
        setConnectingWallet(false);
      }
    },
    [
      isUserVerified,
      canAuthenticateWithTimeout,
      setIsAuthenticating,
      setAuthenticationLock,
      setUser,
      setEvmWallet,
      completeCleanup,
      signMessageAsync,
      connectors,
      getWalletType,
    ]
  );

  // ===== ERROR HANDLING =====

  /**
   * Handle authentication errors with appropriate user feedback
   */
  const handleAuthenticationError = async (
    error: any,
    notificationController: any
  ): Promise<AuthenticationResult> => {
    const errorMessage = error?.message || "Unknown error";
    setLastError(errorMessage);

    // Enhanced error handling with specific cases
    if (error.name === "AbortError") {
      // User cancelled - don't show error notification
      return { success: false, cancelled: true };
    }

    if (errorMessage === "USER_REJECTED_SIGNATURE") {
      notifyResolve(
        notificationController,
        "Signature cancelled. You can try connecting again.",
        "error"
      );
      completeCleanup();

      // Disconnect wallet on user rejection
      if (isConnected) {
        try {
          disconnect();
        } catch (disconnectError) {
          console.warn(
            "Failed to disconnect after user rejection:",
            disconnectError
          );
        }
      }
      return { success: false };
    }

    // Handle different HTTP error codes
    if (error?.response?.status === 401) {
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
        `Failed to authenticate: ${errorMessage}`,
        "error"
      );
    }

    // Complete cleanup on error
    completeCleanup();

    // Disconnect wallet on authentication failure
    if (isConnected) {
      try {
        disconnect();
      } catch (disconnectError) {
        console.warn("Failed to disconnect after auth error:", disconnectError);
      }
    }

    return { success: false };
  };

  // ===== EVENT HANDLERS =====

  /**
   * Handle wallet connection and auto-authentication
   */
  const handleWalletConnect = async (connector: Connector) => {
    // Mark user interaction
    setUserHasInteracted(true);

    // If already connected to this wallet, authenticate directly
    if (isConnected && address) {
      await handleUserAuthentication(address);
      return;
    }

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

      // Give the hook a tiny moment if still not populated
      if (!walletAddress) {
        await new Promise((r) => setTimeout(r, 300));
      }
      const finalAddress = walletAddress || address;
      if (!finalAddress) {
        throw new Error("No wallet address available");
      }

      notifyResolve(
        notificationController,
        "Wallet connected! Authenticating...",
        "success"
      );

      // Automatically authenticate after successful connection
      const authResult = await handleUserAuthentication(finalAddress);

      if (authResult.success) {
        console.log("Wallet connected and authenticated successfully");
        setOpenModal(false);
      } else {
        console.log("Wallet connected but authentication failed");
      }
    } catch (error: any) {
      console.error("Failed to connect EVM wallet:", error);

      // Handle different error types
      if (error.name === "AbortError") {
        // User cancelled - don't show error notification
        return;
      }

      // Complete cleanup on any error
      completeCleanup();

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

  /**
   * Handle wallet disconnection
   */
  const handleWalletDisconnect = async () => {
    try {
      completeCleanup();
      disconnect();
      console.log("Disconnected EVM wallet");
    } catch (error: unknown) {
      console.error("Failed to disconnect EVM wallet:", error);
    }
  };

  // ===== EFFECTS =====

  /**
   * Clear any stuck locks on component mount
   */
  useEffect(() => {
    const now = Date.now();
    if (authenticationLock && now - authenticationLock.timestamp > 30000) {
      console.log("Clearing stuck authentication lock on mount");
      setAuthenticationLock(null);
      setIsAuthenticating(false);
    }
  }, []);

  /**
   * Safety check with improved conditions - NO AUTO AUTHENTICATION
   */
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

  /**
   * AUTO-AUTHENTICATION: Trigger authentication after successful wallet connection
   */
  useEffect(() => {
    // Auto-authenticate when wallet successfully connects
    if (
      isConnected &&
      address &&
      !isUserVerified &&
      !isAuthenticating &&
      !isLoggingOut &&
      !connectingWallet &&
      evmWallet?.address === address // Only if this address is in our store
    ) {
      console.log("Auto-triggering authentication after wallet connection");
      handleUserAuthentication(address);
    }
  }, [
    isConnected,
    address,
    isUserVerified,
    isAuthenticating,
    isLoggingOut,
    connectingWallet,
    evmWallet,
    handleUserAuthentication,
  ]);

  /**
   * Debug logging
   */
  useEffect(() => {
    console.log("Available EVM connectors:", filteredConnectors);
    console.log("Current EVM account:", address);
    console.log("Is user verified:", isUserVerified);
    console.log("EVM wallet in store:", evmWallet);
  }, [filteredConnectors, address, isUserVerified, evmWallet]);

  /**
   * Initialize loading state
   */
  useEffect(() => {
    setLoading(false);
  }, [address]);

  // ===== RENDER CONDITIONS =====

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

  if (!filteredConnectors || filteredConnectors.length === 0) {
    return <div>No EVM wallets were found</div>;
  }

  // ===== MAIN RENDER =====

  return (
    <>
      {filteredConnectors.map((connector) => {
        return (
          <button
            key={connector.id}
            disabled={connectingWallet || isAuthenticating || !connector}
            className="bg-[#ffffff] border-black/20 px-6 py-2 text-black font-semibold rounded-full w-full flex items-center gap-x-8 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => handleWalletConnect(connector)}
          >
            {connectingWallet || isAuthenticating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black" />
                {isAuthenticating ? "Authenticating..." : "Connecting..."}
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

      {lastError && !connectingWallet && !isAuthenticating && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg mt-2">
          <p className="text-sm text-red-700">Error: {lastError}</p>
        </div>
      )}
    </>
  );
}
