// components/QuestList.tsx
interface Quest {
  id: number;
  title: string;
  description: string;
  quest_code: string;
  points_reward: number;
  is_completed?: boolean;
  owner_id: number;
  created_at: string;
  updated_at: string;
}

interface QuestListProps {
  quests: Quest[];
  isWalletConnected: boolean;
  requiredChainType?: "sui" | "evm";
}

export const QuestList: React.FC<QuestListProps> = ({
  quests,
  isWalletConnected,
  requiredChainType = "sui",
}) => {
  const getWalletConnectMessage = () => {
    const chainName = requiredChainType === "evm" ? "EVM Wallet" : "Sui Wallet";
    return `Connect ${chainName} to Claim`;
  };

  return (
    <div className="space-y-2 sm:space-y-3">
      {quests.map((quest) => (
        <div
          key={quest.id}
          className="group bg-gray-900 border border-gray-700 rounded-lg p-3 sm:p-4 relative overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            {/* Quest Info */}
            <div className="flex-1">
              <h3 className="text-sm sm:text-base font-bold text-white mb-1 sm:mb-0">
                {quest.title}
              </h3>
              <p className="text-gray-400 text-xs sm:text-sm">
                {quest.description}
              </p>
            </div>

            {/* Quest Status */}
            <div className="flex-shrink-0">
              {quest.is_completed ? (
                <span className="text-xs sm:text-sm text-green-400 bg-green-900/20 px-2 sm:px-3 py-1 rounded border border-green-700 inline-block">
                  ✓ Completed
                </span>
              ) : !isWalletConnected ? (
                <span
                  className="text-xs sm:text-sm text-gray-400 bg-gray-800/20 px-2 sm:px-3 py-1 rounded border border-gray-600 inline-block"
                  title={`Connect a ${
                    requiredChainType === "evm" ? "EVM" : "Sui"
                  } wallet to complete quests`}
                >
                  {getWalletConnectMessage()}
                </span>
              ) : (
                <span className="text-xs sm:text-sm text-gray-400 bg-gray-800/20 px-2 sm:px-3 py-1 rounded border border-gray-600 inline-block">
                  Not Completed
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
