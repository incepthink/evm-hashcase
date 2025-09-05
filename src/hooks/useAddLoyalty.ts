import { useState } from "react";
import axiosInstance from "@/utils/axios";
import toast from "react-hot-toast";
import { usePrivy } from "@privy-io/react-auth";

type Loyalty = {
  id: number;
  owner_id: number;
  code: string;
  value: number;
  type: string;
};

interface User {
  id: number;
  walletAddress?: string;
  email: string | null;
  badges?: string;
}

interface Collection {
  id: number;
  name: string;
  contract?: {
    Chain?: {
      chain_type: "ethereum" | "sui";
    };
  };
}

interface UseAddLoyaltyProps {
  user: User | null;
  isUserVerified: boolean;
  hasWalletForChain: (chain: "evm") => boolean;
  getWalletForChain: (chain: "evm") => { address: string; type: string } | null;
  setOpenModal: (open: boolean) => void;
  collection: Collection;
  onPointsUpdate?: (newPoints: number) => void;
  onSuccess?: () => void;
}

export const useAddLoyalty = ({
  user,
  isUserVerified,
  hasWalletForChain,
  getWalletForChain,
  setOpenModal,
  collection,
  onPointsUpdate,
  onSuccess,
}: UseAddLoyaltyProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { authenticated: privyAuthenticated, user: privyUser } = usePrivy();

  // Get the correct wallet address and type
  const getWalletInfo = (): {
    address: string;
    type: "evm" | "privy";
  } | null => {
    // First check for regular EVM wallet
    const evmWallet = getWalletForChain("evm");
    if (evmWallet && evmWallet.address) {
      return {
        address: evmWallet.address,
        type: "evm"
      };
    }

    // Then check for Privy wallet
    if (privyAuthenticated && privyUser?.wallet?.address) {
      return {
        address: privyUser.wallet.address,
        type: "privy"
      };
    }

    return null;
  };

  // Validate wallet connection before performing actions
  const validateWalletConnection = (): {
    isValid: boolean;
    walletAddress?: string;
    walletType?: "evm" | "privy";
  } => {
    if (!isUserVerified) {
      toast.error("Please connect your wallet to continue");
      setOpenModal(true);
      return { isValid: false };
    }

    const walletInfo = getWalletInfo();
    if (!walletInfo) {
      toast.error("Please connect an EVM wallet or sign in with Google", {
        duration: 5000,
      });
      setOpenModal(true);
      return { isValid: false };
    }

    return {
      isValid: true,
      walletAddress: walletInfo.address,
      walletType: walletInfo.type,
    };
  };

  const handleAddLoyalty = async (
    code: string,
    value: number | undefined,
    owner_id: number,
    loyaltyCodes: Loyalty[]
  ): Promise<void> => {
    console.log("LOYALTY_DEBUG: handleAddLoyalty called:", { code, value, owner_id });

    // Validate wallet connection before proceeding
    const validation = validateWalletConnection();
    if (!validation.isValid || !user?.id) {
      console.log("LOYALTY_DEBUG: Validation failed or no user ID");
      return;
    }

    console.log("LOYALTY_DEBUG: Using wallet:", {
      address: validation.walletAddress,
      type: validation.walletType,
    });

    setIsLoading(true);

    try {
      const loyaltyCode = loyaltyCodes.find((lc) => lc.code === code);
      let backendType = loyaltyCode?.type || "";
      if (backendType === "one_time_fixed") backendType = "ONE_FIXED";
      else if (backendType === "repeat_fixed") backendType = "FIXED";
      else if (backendType === "repeat_variable") backendType = "VARIABLE";
      else if (backendType === "one_time_variable") backendType = "ONE_VARIABLE";

      console.log("LOYALTY_DEBUG: Making API call with:", {
        walletAddress: validation.walletAddress,
        chainType: "evm", // Always EVM since we removed Sui
        code,
        backendType,
      });

      const loyaltyResponse = await axiosInstance.post(
        "/user/achievements/add-points",
        {
          loyalty: {
            code,
            value: value || 0,
            type: backendType,
          },
          walletAddress: validation.walletAddress,
          chainType: "evm", // Always EVM for this app
        },
        {
          params: {
            owner_id,
            user_id: user.id,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, // Add user timezone
          },
        }
      );

      console.log("LOYALTY_DEBUG: API response:", loyaltyResponse.data);

      let newPoints = 0;
      if (loyaltyResponse.data.user?.total_loyalty_points) {
        newPoints = loyaltyResponse.data.user.total_loyalty_points;
      } else if (loyaltyResponse.data.totalPoints) {
        newPoints = loyaltyResponse.data.totalPoints;
      }

      const walletTypeDisplay = validation.walletType === "privy" ? "Google" : "EVM";

      toast.success(
        `Successfully redeemed ${code} with ${walletTypeDisplay} wallet! +${value} points added. Total: ${newPoints} points`
      );

      // Call callbacks if provided
      if (onPointsUpdate && newPoints > 0) {
        onPointsUpdate(newPoints);
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error("LOYALTY_DEBUG: Error:", error);

      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error(
          "Authentication failed. Please reconnect your wallet and try again."
        );
      } else if (error.response?.data?.message?.includes("wrong wallet")) {
        toast.error(
          "Incorrect wallet type connected. Please connect an EVM wallet or sign in with Google."
        );
      } else if (error.response?.data?.message === "Loyalty code already claimed") {
        toast.error("This loyalty code has already been claimed.");
      } else if (error.response?.data?.message === "Loyalty code not found") {
        toast.error("Invalid loyalty code.");
      } else if (error.response?.data?.message?.includes("Outside availability window")) {
        toast.error(`Code not available: ${error.response.data.message}`);
      } else if (error.response?.data?.message?.includes("You can claim this code again")) {
        toast.error(`On cooldown: ${error.response.data.message}`);
      } else {
        toast.error(
          `Failed to redeem loyalty code: ${
            error.response?.data?.message || error.message
          }`
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleAddLoyalty,
    isLoading,
    getRequiredChainType: () => "evm" as const, // Always return EVM
  };
};