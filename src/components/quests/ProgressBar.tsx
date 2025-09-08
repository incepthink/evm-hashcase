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
    <div>
      <div className="flex justify-between text-sm text-gray-400 mb-2">
        <span>Progress</span>
        <span>
          {completedQuests}/{totalQuests} ({completionPercentage}%)
        </span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div
          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
          style={{ width: `${completionPercentage}%` }}
        />
      </div>
    </div>
  );
};
