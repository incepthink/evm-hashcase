"use client";
import { useEffect, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import { useCollectionById } from "@/hooks/useCollections";

interface CollectionLayoutProps {
  children: React.ReactNode;
}

export default function CollectionLayout({ children }: CollectionLayoutProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const params = useParams();
  const pathname = usePathname();

  // Fetch collection data
  const {
    collection,
    isLoading: isCollectionLoading,
    isError: isCollectionError,
  } = useCollectionById(params.collection_id as string);

  const tabs = [
    {
      id: "points",
      label: "Points",
      href: `/collections/${params.collection_name}/${params.collection_id}`,
    },
    {
      id: "quests",
      label: "Quests",
      href: `/collections/${params.collection_name}/${params.collection_id}/quests`,
    },
    {
      id: "nfts",
      label: "NFTs",
      href: `/collections/${params.collection_name}/${params.collection_id}/nfts`,
    },
    {
      id: "badges",
      label: "Badges",
      href: `/collections/${params.collection_name}/${params.collection_id}/badges`,
    },
  ];

  // Show loading spinner while collection is loading
  if (!mounted || isCollectionLoading) {
    return (
      <div className="w-full min-h-[90vh] flex flex-col items-center justify-center bg-gradient-to-br from-[#000212] via-[#03082a] to-[#0a0e3a] px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-blue-900/20 to-transparent -skew-x-12 -translate-x-1/3"></div>
        <div className="absolute bottom-0 right-0 w-1/3 h-full bg-gradient-to-l from-purple-900/20 to-transparent skew-x-12 translate-x-1/3"></div>

        <div className="relative z-10 text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h1 className="text-4xl sm:text-4xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-blue-400 to-purple-500 drop-shadow-lg leading-tight">
            Loading...
          </h1>
          <p className="text-xl sm:text-2xl text-white/80 mb-8 leading-relaxed max-w-2xl">
            Fetching collection data
          </p>
        </div>
      </div>
    );
  }

  // Show error if collection failed to load
  if (isCollectionError || !collection) {
    return (
      <div className="w-full min-h-[70vh] flex flex-col items-center justify-center bg-gradient-to-br from-[#000212] via-[#03082a] to-[#0a0e3a] px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="relative z-10 text-center">
          <h1 className="text-4xl sm:text-4xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-red-600 drop-shadow-lg leading-tight">
            Collection Not Found
          </h1>
          <p className="text-xl sm:text-2xl text-white/80 mb-8 leading-relaxed max-w-2xl">
            The requested collection could not be found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#00041f]">
      {/* Collection Banner */}
      <div className="w-full h-[45vh] max-w-[1920px] bg-[#00041f] relative">
        <img
          src="/banner.jpg"
          alt="banner"
          className="w-full h-full object-cover"
          style={{
            maskImage:
              "linear-gradient(to bottom, black 20%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, black 70%, transparent 100%)",
          }}
        />
        <div className="w-full max-w-7xl absolute -mb-5 bottom-0 left-0 right-0 mx-auto flex items-center gap-8">
          <div className="h-24 w-24 rounded-lg overflow-hidden">
            <img
              src={collection.image_uri}
              alt="collection"
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-white text-4xl font-bold">{collection.name}</h1>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-[#00041f] mx-auto max-w-7xl mt-16 border-b border-gray-800">
        <div className="flex gap-12 pl-1">
          {tabs.map((tab) => {
            // Check if pathname contains the tab segment for nested routes
            let isActive = false;

            if (tab.id === "points") {
              // Points tab is active only on exact match
              isActive = pathname === tab.href;
            } else {
              // Other tabs are active if pathname includes their segment
              isActive =
                pathname.includes(`/${tab.id}/`) ||
                pathname.endsWith(`/${tab.id}`);
            }

            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={`
        relative py-4 font-medium text-md transition-colors
        ${isActive ? "text-blue-600" : "text-white hover:text-blue-400"}
      `}
              >
                <span className="flex items-center gap-2">{tab.label}</span>

                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-blue-600 rounded-t" />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-[#00041f]">{children}</div>
    </div>
  );
}
