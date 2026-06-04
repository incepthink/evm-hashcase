// components/ErrorScreen.tsx
import { AlertTriangle } from "lucide-react";

interface ErrorScreenProps {
  title: string;
  message: string;
  onBack: () => void;
  isNSCollection?: boolean;
}

export const ErrorScreen: React.FC<ErrorScreenProps> = ({
  title,
  message,
  onBack,
  isNSCollection = false,
}) => {
  return (
    <div
      className={`min-h-[60vh] ${
        isNSCollection ? "bg-black" : ""
      } flex items-center justify-center px-4`}
    >
      <div className="text-center">
        <div className="mb-5 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/15 text-red-400">
            <AlertTriangle className="h-7 w-7" strokeWidth={1.75} />
          </div>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">
          {title}
        </h2>
        <p className="text-gray-400 mb-6 text-sm sm:text-base">{message}</p>
        <button
          onClick={onBack}
          className="px-4 sm:px-6 py-2 sm:py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors text-sm sm:text-base"
        >
          Back to Collections
        </button>
      </div>
    </div>
  );
};
