// components/LoadingScreen.tsx
interface LoadingScreenProps {
  message: string;
  collectionName?: string;
  isNSCollection?: boolean;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message,
  collectionName,
  isNSCollection = false,
}) => {
  return (
    <div
      className={`min-h-screen ${
        isNSCollection ? "bg-black" : "bg-[#000421]"
      } flex items-center justify-center px-4`}
    >
      <div className="text-center">
        <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4 sm:mb-6"></div>
        <h2 className="text-xl sm:text-2xl font-bold text-white">{message}</h2>
        {collectionName && (
          <p className="text-gray-400 mt-2 text-sm sm:text-base">
            Collection: {collectionName}
          </p>
        )}
      </div>
    </div>
  );
};
