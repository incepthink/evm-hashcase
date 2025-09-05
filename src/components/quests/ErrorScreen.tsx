// components/ErrorScreen.tsx
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
      className={`min-h-screen ${
        isNSCollection ? "bg-black" : "bg-[#000421]"
      } flex items-center justify-center px-4`}
    >
      <div className="text-center">
        <div className="text-red-400 text-3xl sm:text-4xl mb-4">⚠️</div>
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
