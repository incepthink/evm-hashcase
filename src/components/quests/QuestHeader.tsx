// components/QuestHeader.tsx
import { ProgressBar } from "./ProgressBar";

interface QuestHeaderProps {
  completedQuests: number;
  totalQuests: number;
  completionPercentage: number;
  showProgress: boolean;
  requiredChainType?: "sui" | "evm";
}

export const QuestHeader: React.FC<QuestHeaderProps> = ({
  completedQuests,
  totalQuests,
  completionPercentage,
  showProgress,
  requiredChainType = "sui",
}) => {
  return (
    <div className="text-center mb-8">
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-medium text-white mb-4">
          Available Quests
        </h3>
        <p className="text-gray-300 mb-4">
          Requires {requiredChainType === "evm" ? "EVM" : "Sui"} wallet
          connection
        </p>
        <div className="mb-4">
          <ProgressBar
            completedQuests={completedQuests}
            totalQuests={totalQuests}
            completionPercentage={completionPercentage}
            isVisible={showProgress}
          />
        </div>
      </div>
    </div>
  );
};
