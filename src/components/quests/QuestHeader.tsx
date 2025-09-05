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
    <div className="text-center mb-6">
      <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">
        Available Quests
        {requiredChainType && (
          <span className="text-sm font-normal text-gray-400 block mt-1">
            Requires {requiredChainType === "evm" ? "EVM" : "Sui"} wallet
            connection
          </span>
        )}
      </h1>

      <ProgressBar
        completedQuests={completedQuests}
        totalQuests={totalQuests}
        completionPercentage={completionPercentage}
        isVisible={showProgress}
      />
    </div>
  );
};
