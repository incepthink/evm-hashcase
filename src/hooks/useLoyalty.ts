import { useState } from "react";
import axiosInstance from "@/utils/axios";

type Loyalty = {
  id: number;
  owner_id: number;
  code: string;
  value: number;
  type: string;
};

type LoyaltyTransaction = {
  id: number;
  user_id: number;
  owner_id: number;
  code: string;
  points: number;
  type: string;
  status: string;
  created_at: string;
};

type TimeRule = {
  id: number;
  name: string;
  rule_type: "recurring_reset" | "availability_window";
  timezone: string;
  reset_value?: number;
  reset_unit?: "minutes" | "hours" | "days" | "weeks" | "months";
  reset_time?: string;
  reset_day?: string;
  start_date?: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  available_days?: string[];
};

type TransactionSummary = {
  code: string;
  type: string;
  usage_count: number;
  last_used: string;
  can_use_again: boolean;
  eligibility_message: string;
  next_eligible_at: string | null;
  loyalty_type: string;
  has_time_rules: boolean;
  time_rules: {
    availability_rule: TimeRule | null;
    reset_rule: TimeRule | null;
  };
};

export const useLoyalty = () => {
  const [loyaltyCodes, setLoyaltyCodes] = useState<Loyalty[]>([]);
  const [usedCodes, setUsedCodes] = useState<string[]>([]);
  const [transactionSummary, setTransactionSummary] = useState<TransactionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasTransactionError, setHasTransactionError] = useState(false);

  const getLoyaltyCodesAndPoints = async (owner_id: number): Promise<void> => {
    setIsLoading(true);
    try {
      const loyaltyResponse = await axiosInstance.get("/platform/get-loyalties", {
        params: {
          owner_id: owner_id,
        },
      });

      setLoyaltyCodes(loyaltyResponse.data.loyalties || []);
      setHasTransactionError(false); // Reset error state on successful loyalty fetch
    } catch (error) {
      console.error("Error fetching loyalty codes:", error);
      setLoyaltyCodes([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getUsedLoyaltyCodes = async (user_id: number, owner_id: number): Promise<void> => {
    if (!user_id) return;
    
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    try {
      const response = await axiosInstance.get("/user/loyalty/transactions", {
        params: {
          user_id: user_id,
          owner_id: owner_id,
          timezone: userTimezone,
        },
      });

      // Store the summary data for eligibility checks
      const summaryData: TransactionSummary[] = response.data.summary || [];
      setTransactionSummary(summaryData);

      // Keep the old usedCodes for backward compatibility
      const usedCodesList: string[] = response.data.data.map(
        (transaction: LoyaltyTransaction) => transaction.code
      );
      setUsedCodes(usedCodesList);
      setHasTransactionError(false); // Clear error state on success
    } catch (error) {
      console.error("Error fetching used loyalty codes:", error);
      setUsedCodes([]);
      setTransactionSummary([]);
      setHasTransactionError(true); // Set error state to disable codes
    }
  };

  const getLoyaltyCodeStatus = (
    loyalty: Loyalty,
    hasWalletForChain: (chain: "sui" | "evm") => boolean,
    getRequiredChainType: () => "sui" | "evm"
  ): {
    canUse: boolean;
    isUsed: boolean;
    eligibilityMessage: string;
    usageCount: number;
    canRedeem: boolean;
    statusText: string;
    timeRules: {
      availability_rule: TimeRule | null;
      reset_rule: TimeRule | null;
    };
  } => {
    // If there's a transaction error, disable all codes
    if (hasTransactionError) {
      return {
        canUse: false,
        isUsed: false,
        eligibilityMessage: "Unable to verify code status. Please try again.",
        usageCount: 0,
        canRedeem: false,
        statusText: "Error",
        timeRules: {
          availability_rule: null,
          reset_rule: null,
        },
      };
    }

    // Convert frontend type to backend type for matching
    let backendType = loyalty.type;
    if (loyalty.type === "one_time_fixed") backendType = "ONE_FIXED";
    else if (loyalty.type === "repeat_fixed") backendType = "FIXED";
    else if (loyalty.type === "repeat_variable") backendType = "VARIABLE";
    else if (loyalty.type === "one_time_variable") backendType = "ONE_VARIABLE";

    // Find the summary entry for this specific code+type combination using backend type
    const summaryEntry = transactionSummary.find(
      (summary) => summary.code === loyalty.code && summary.type === backendType
    );

    const canUse = summaryEntry ? summaryEntry.can_use_again : true;
    const isUsed = summaryEntry ? summaryEntry.usage_count > 0 : false;
    const eligibilityMessage = summaryEntry?.eligibility_message || "";
    const usageCount = summaryEntry?.usage_count || 0;
    const timeRules = summaryEntry?.time_rules || {
      availability_rule: null,
      reset_rule: null,
    };

    const canRedeem = hasWalletForChain(getRequiredChainType()) && canUse;

    let statusText = "";
    if (!canUse && isUsed) {
      if (usageCount === 1 && backendType.includes("ONE_")) {
        statusText = "✓ Used";
      } else {
        statusText = "On Cooldown";
      }
    }

    return {
      canUse,
      isUsed,
      eligibilityMessage,
      usageCount,
      canRedeem,
      statusText,
      timeRules,
    };
  };

  const formatTimeRule = (rule: TimeRule | null): string => {
    if (!rule) return "None";

    if (rule.rule_type === "recurring_reset") {
      let resetText = `Every ${rule.reset_value} ${rule.reset_unit}`;
      if (
        rule.reset_time &&
        (rule.reset_unit === "days" || rule.reset_unit === "weeks")
      ) {
        resetText += ` at ${rule.reset_time}`;
      }
      resetText += ` (GMT${rule.timezone})`;
      return resetText;
    }

    if (rule.rule_type === "availability_window") {
      const parts: string[] = [];

      if (rule.start_date || rule.end_date) {
        if (rule.start_date && rule.end_date) {
          parts.push(`${rule.start_date} to ${rule.end_date}`);
        } else if (rule.start_date) {
          parts.push(`From ${rule.start_date}`);
        } else if (rule.end_date) {
          parts.push(`Until ${rule.end_date}`);
        }
      }

      if (rule.start_time || rule.end_time) {
        if (rule.start_time && rule.end_time) {
          parts.push(`${rule.start_time}-${rule.end_time} daily`);
        } else if (rule.start_time) {
          parts.push(`From ${rule.start_time} daily`);
        } else if (rule.end_time) {
          parts.push(`Until ${rule.end_time} daily`);
        }
      }

      if (rule.available_days && rule.available_days.length > 0) {
        const days = rule.available_days
          .map((day) => day.charAt(0).toUpperCase() + day.slice(1))
          .join(", ");
        parts.push(`On ${days}`);
      }

      if (parts.length > 0) {
        return `${parts.join(", ")} (GMT${rule.timezone})`;
      }

      return `GMT${rule.timezone}`;
    }

    return "Unknown";
  };

  return {
    loyaltyCodes,
    usedCodes,
    transactionSummary,
    isLoading,
    hasTransactionError,
    getLoyaltyCodesAndPoints,
    getUsedLoyaltyCodes,
    getLoyaltyCodeStatus,
    formatTimeRule,
    setUsedCodes, // Export for external updates
  };
};