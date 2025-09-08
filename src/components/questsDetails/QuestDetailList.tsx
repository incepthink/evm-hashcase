// components/quests/QuestDetailList.tsx
"use client";

import { useGlobalAppStore } from "@/store/globalAppStore";

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

interface QuestDetailListProps {
  quests: Quest[];
  isWalletConnected: boolean;
  allowClaim: boolean;
  activeQuestCode: string;
  claimingQuestId: number | null;
  onClaimQuest: (questId: number) => void;
  requiredChainType?: "sui" | "evm";
}

export const QuestDetailList: React.FC<QuestDetailListProps> = ({
  quests,
  isWalletConnected,
  allowClaim,
  activeQuestCode,
  claimingQuestId,
  onClaimQuest,
  requiredChainType = "sui",
}) => {
  const { setOpenModal } = useGlobalAppStore();

  const getClaimButtonText = () => {
    if (!isWalletConnected) {
      const chainName = requiredChainType === "evm" ? "Wallet" : "Sui Wallet";
      return `Connect ${chainName}`;
    }
    return "Claim";
  };

  const getWalletConnectMessage = () => {
    const chainName = requiredChainType === "evm" ? "EVM Wallet" : "Sui Wallet";
    return `Connect ${chainName} to Claim`;
  };

  const handleConnectWallet = () => {
    setOpenModal(true);
  };

  if (quests.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl sm:text-6xl mb-4">🎯</div>
        <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
          No Quests Available
        </h3>
        <p className="text-gray-400 text-sm sm:text-base">
          Check back later for new quests!
        </p>
      </div>
    );
  }

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
              ) : allowClaim &&
                activeQuestCode &&
                quest.quest_code === activeQuestCode ? (
                <button
                  onClick={() => {
                    if (!isWalletConnected) {
                      handleConnectWallet();
                      return;
                    }
                    onClaimQuest(quest.id);
                  }}
                  disabled={claimingQuestId === quest.id}
                  className={`text-xs sm:text-sm px-3 sm:px-4 py-1 rounded border transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed inline-block ${
                    !isWalletConnected
                      ? "text-gray-300 bg-gray-600/60 border-gray-500 hover:bg-gray-600/80"
                      : "text-black bg-white hover:bg-white/90 border-purple-500 cursor-pointer"
                  }`}
                  title={
                    !isWalletConnected
                      ? `Connect ${
                          requiredChainType === "evm" ? "EVM" : "Sui"
                        } wallet to claim this quest`
                      : ""
                  }
                >
                  {claimingQuestId === quest.id
                    ? "Claiming..."
                    : getClaimButtonText()}
                </button>
              ) : allowClaim ? (
                <span className="text-xs sm:text-sm text-gray-500 bg-gray-800/40 px-2 sm:px-3 py-1 rounded border border-gray-700 inline-block">
                  Complete other quests first
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
