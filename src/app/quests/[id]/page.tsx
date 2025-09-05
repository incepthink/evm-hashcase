// quests/[id]/page.tsx
"use client";

import { Suspense } from "react";
import QuestDetailPageContent from "@/components/questsDetails/QuestDetailPageContent";
import { LoadingScreen } from "@/components/quests/LoadingScreen";

const QuestDetailPage = () => {
  return (
    <Suspense fallback={<LoadingScreen message="Loading Quest..." />}>
      <QuestDetailPageContent />
    </Suspense>
  );
};

export default QuestDetailPage;
