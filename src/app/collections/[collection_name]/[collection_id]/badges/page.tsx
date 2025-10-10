"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useCollectionById } from "@/hooks/useCollections";
import BadgesTable from "../BadgesTable";

export default function CollectionBadgesPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const params = useParams();

  // Fetch collection data to get owner_id
  const { collection, isLoading } = useCollectionById(
    params.collection_id as string
  );
  const ownerId = collection?.owner_id;

  if (!mounted) return null;

  // Show loading state while fetching collection
  if (isLoading) {
    return (
      <div className="bg-gradient-to-b from-[#00041f] to-[#030828] min-h-[70vh] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // Show error if no owner_id
  if (!ownerId) {
    return (
      <div className="bg-gradient-to-b from-[#00041f] to-[#030828] min-h-[70vh] flex items-center justify-center">
        <div className="text-white">Unable to load badges</div>
      </div>
    );
  }

  return <BadgesTable owner_id={ownerId} />;
}
