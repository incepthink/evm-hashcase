"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import QuestsPageContent from "@/components/quests/QuestsPageContent";
import { LoadingScreen } from "@/components/quests/LoadingScreen";

export default function CollectionQuestsPage() {
  const params = useParams();
  const collectionId = params.collection_id as string;

  return (
    <Suspense fallback={<LoadingScreen message="Loading quests..." />}>
      <QuestsPageContent collectionId={collectionId} />
    </Suspense>
  );
}
