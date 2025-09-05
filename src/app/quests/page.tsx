"use client";

import { Suspense } from "react";
import QuestsPageContent from "@/components/quests/QuestsPageContent";
import { LoadingScreen } from "@/components/quests/LoadingScreen";

const QuestsPage = () => {
  return (
    <Suspense fallback={<LoadingScreen message="Loading..." />}>
      <QuestsPageContent />
    </Suspense>
  );
};

export default QuestsPage;
