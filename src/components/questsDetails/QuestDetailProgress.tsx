// components/quests/QuestDetailProgress.tsx
"use client";

interface QuestDetailProgressProps {
  isWalletConnected: boolean;
  mounted: boolean;
  loading: boolean;
  completedQuests: number;
  totalQuests: number;
  completionPercentage: number;
  requiredChainType?: "sui" | "evm";
}

export const QuestDetailProgress: React.FC<QuestDetailProgressProps> = ({
  isWalletConnected,
  mounted,
  loading,
  completedQuests,
  totalQuests,
  completionPercentage,
  requiredChainType = "sui",
}) => {
  const getProgressMessage = () => {
    if (!isWalletConnected) {
      const chainName = requiredChainType === "evm" ? "EVM" : "Sui";
      return `Connect ${chainName} wallet to track progress`;
    }
    return `${completedQuests}/${totalQuests} quests completed`;
  };

  const getWalletStatusMessage = () => {
    if (!isWalletConnected) {
      const chainName =
        requiredChainType === "evm" ? "EVM wallet" : "Sui wallet";
      return `* ${
        chainName.charAt(0).toUpperCase() + chainName.slice(1)
      } not connected`;
    }
    return null;
  };

  return (
    <div className="text-center mb-6">
      {/* Wallet connection message */}
      {/* {!isWalletConnected && (
        <div className="mb-6">
          <p className="text-lg sm:text-xl text-white mb-4">
            {getWalletStatusMessage()}
          </p>
        </div>
      )} */}

      <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">
        Available Quests
        <span className="text-sm font-normal text-gray-400 block mt-1">
          Requires {requiredChainType === "evm" ? "EVM" : "Sui"} wallet
          connection
        </span>
      </h1>

      {/* Progress Bar */}
      {mounted && isWalletConnected && !loading && (
        <div className="max-w-md mx-auto mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs sm:text-sm text-gray-400">Progress</span>
            <span className="text-xs sm:text-sm font-semibold text-white">
              {completedQuests}/{totalQuests} ({completionPercentage}%)
            </span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2 sm:h-3 overflow-hidden">
            <div
              className="bg-white h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Progress message for non-connected state */}
      {!isWalletConnected && (
        <p className="text-sm text-gray-400 mt-2">{getProgressMessage()}</p>
      )}
    </div>
  );
};
