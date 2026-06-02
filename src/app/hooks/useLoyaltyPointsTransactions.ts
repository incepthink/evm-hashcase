import { useState } from "react";
import { Transaction } from "@mysten/sui/transactions";
import { useSuiClient, useSignAndExecuteTransaction, useCurrentAccount } from "@mysten/dapp-kit";
import { notify } from "@/utils/notify";
import axiosInstance from "@/utils/axios";

export const useLoyaltyPointsTransactions = () => {
  const [isLoading, setIsLoading] = useState(false);

  //needed to execute transactions
  const suiClient = useSuiClient();
  const { mutateAsync: signAndExecuteTransaction } =
    useSignAndExecuteTransaction();
  const currentAccount = useCurrentAccount();

  const packageId =
    process.env.MAINNET_LOYALTY_PACKAGE_ID ||
    "0xbdfb6f8ad73a073b500f7ba1598ddaa59038e50697e2dc6e9dedb55af7ae5b49";

  // Quest-based earning - backend calls contract to give points
  const completeQuest = async (questType: string) => {
    console.log("🔧 Completing quest:", { questType, currentAccount: currentAccount?.address });
    
    if (!currentAccount?.address) {
      notify("Please connect your wallet first.", "error");
      return;
    }

    setIsLoading(true);

    try {
      // Call backend to complete quest and get on-chain points
      const response = await axiosInstance.post("/platform/quest/complete", {
        quest_type: questType,
        user_address: currentAccount.address
      });

      console.log("Quest completion response:", response.data);
      notify(`Quest completed! You earned ${response.data.points_earned} points!`, "success");
      return response.data;
    } catch (error: any) {
      console.error("Error completing quest:", error);
      
      if (error.response?.status === 400) {
        notify("Quest already completed or not available.", "error");
      } else if (error.response?.status === 500) {
        notify("Backend error. Please try again.", "error");
      } else {
        notify("Failed to complete quest. Please try again.", "error");
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Spend on-chain points
  const spendLoyaltyPoints = async (userTokenId: string, amount: string) => {
    console.log("🔧 Spending loyalty points:", { userTokenId, amount });
    
    if (!userTokenId || !amount) {
      notify("Please fill in all fields.", "error");
      return;
    }

    setIsLoading(true);
    let txResult;

    try {
      // Create transaction to spend points
      const tx = new Transaction();
      tx.moveCall({
        target: `${packageId}::loyalty::spend_points`,
        arguments: [
          tx.object("0x0000000000000000000000000000000000000000000000000000000000000006"), // Shared policy
          tx.object(userTokenId),
        ],
      });
      
      // Execute transaction
      txResult = await signAndExecuteTransaction({
        transaction: tx as any,
        chain: "sui:mainnet",
      });

      // Wait before fetching transaction details
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Fetch transaction details
      const digest = txResult?.digest || "";
      await suiClient.waitForTransaction({ digest, timeout: 5_000 });

      const txDetails = await suiClient.getTransactionBlock({
        digest,
        options: { showObjectChanges: true },
      });

      console.log("Transaction Details:", txDetails);
      notify("Points spent successfully!", "success");
      return txDetails;
    } catch (error: any) {
      console.error("Error executing transaction:", error);
      notify("Failed to spend points. Check if you have enough tokens.", "error");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    completeQuest,
    spendLoyaltyPoints,
  };
};
