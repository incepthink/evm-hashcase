// components/ProgressBar.tsx
interface ProgressBarProps {
  completedQuests: number;
  totalQuests: number;
  completionPercentage: number;
  isVisible: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  completedQuests,
  totalQuests,
  completionPercentage,
  isVisible,
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
          className="bg-white h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${completionPercentage}%` }}
        />
      </div>
    </div>
  );
};
