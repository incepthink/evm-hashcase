// components/ProgressBar.tsx
import { ShellTheme } from "@/components/collectionShell/theme";

interface ProgressBarProps {
  completedQuests: number;
  totalQuests: number;
  completionPercentage: number;
  isVisible: boolean;
  theme?: ShellTheme;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  completedQuests,
  totalQuests,
  completionPercentage,
  isVisible,
  theme,
}) => {
  if (!isVisible) return null;

  return (
    <div className="max-w-md mx-auto mb-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs sm:text-sm text-gray-400">Progress</span>
        <span className="text-xs sm:text-sm font-semibold text-white">
          {completedQuests}/{totalQuests} ({completionPercentage}%)
        </span>
      </div>
      <div className="w-full bg-gray-800 rounded-full h-2 sm:h-3 overflow-hidden">
        <div
          className={`${
            theme?.tabUnderline ?? "bg-white"
          } h-full rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${completionPercentage}%` }}
        />
      </div>
    </div>
  );
};
