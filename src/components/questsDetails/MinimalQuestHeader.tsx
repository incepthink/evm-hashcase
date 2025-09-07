// components/quests/MinimalQuestHeader.tsx
"use client";

interface MinimalQuestHeaderProps {
  questTitle: string;
  questDescription: string;
}

export const MinimalQuestHeader: React.FC<MinimalQuestHeaderProps> = ({
  questTitle,
  questDescription,
}) => {
  return (
    <div className="text-center mb-8">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
        {questTitle}
      </h1>
      <p className="text-gray-300 text-sm sm:text-base max-w-2xl mx-auto">
        {questDescription}
      </p>
    </div>
  );
};
