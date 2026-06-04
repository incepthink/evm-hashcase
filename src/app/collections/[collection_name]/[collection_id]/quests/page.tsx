"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import QuestsPageContent from "@/components/quests/QuestsPageContent";
import ContentSkeleton from "@/components/collectionShell/ContentSkeleton";
import { collectionTheme } from "@/components/collectionShell/theme";

export default function CollectionQuestsPage() {
  const params = useParams();
  const collectionId = params.collection_id as string;

  return (
    <Suspense fallback={<ContentSkeleton theme={collectionTheme} variant="quests" />}>
      <QuestsPageContent collectionId={collectionId} />
    </Suspense>
  );
}
