"use client";
import axiosInstance from "@/utils/axios";
import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";

import Image from "next/image";

import foregroundImageHeroSection from "@/assets/images/sui-bg.png";
import backgroundImageHeroSection from "@/assets/images/high_rise.jpg";

import "./page.css";
import { useRouter } from "next/navigation";
import { useCollections } from "@/hooks/useCollections";

const HeaderSection = () => {
  return (
    <div className="relative w-full pt-16 pb-6">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Discover{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4DA2FF] to-[#7ab8ff]">
              Collections
            </span>
          </h1>
        </div>
      </div>
    </div>
  );
};

const CollectionsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const router = useRouter();

  const { data, isLoading, isError, error } = useCollections();
  console.log("COLLECTIONS", data);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#00041f] to-[#030828] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#4DA2FF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/80">Loading collections...</p>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#00041f] to-[#030828] flex items-center justify-center">
        <div className="text-center max-w-2xl mx-auto px-6">
          <div className="text-red-400 text-4xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-4">API Error</h2>
          <p className="text-white/80 mb-4">
            Failed to load collections from the backend API.
          </p>

          {/* Show detailed error info for debugging */}
          {error && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6 text-left">
              <h3 className="text-red-400 font-semibold mb-2">
                Error Details:
              </h3>
              <p className="text-red-300 text-sm mb-2">
                <strong>Type:</strong> {(error as any).name || "Unknown"}
              </p>
              <p className="text-red-300 text-sm mb-2">
                <strong>Message:</strong>{" "}
                {(error as any).message || "No message available"}
              </p>
              {(error as any).response && (
                <p className="text-red-300 text-sm mb-2">
                  <strong>Status:</strong> {(error as any).response.status} -{" "}
                  {(error as any).response.statusText}
                </p>
              )}
              <p className="text-red-300 text-sm">
                <strong>Endpoint:</strong> /platform/collections-sui
              </p>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-[#4DA2FF] text-black rounded-lg hover:bg-[#3a8fef] transition-colors font-semibold"
            >
              Retry
            </button>
            <div className="text-white/60 text-sm">
              <p>
                Check if your backend server is running and the API endpoint
                exists.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle different possible data structures
  const collections = data.suiCollections || data.collections || data || [];
  const totalPages = data.totalPages || data.total_pages || 1;

  console.log("Processed collections:", collections);
  console.log("Total pages:", totalPages);

  if (!collections || collections.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#00041f] to-[#030828] text-white">
        <HeaderSection />
        <div className="max-w-7xl mx-auto px-6 pb-16">
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎨</div>
            <h3 className="text-2xl font-semibold mb-2">
              No Collections Found
            </h3>
            <p className="text-white/60">
              There are no collections available at the moment. Check back
              later!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#00041f] to-[#030828] text-white">
      <HeaderSection />

      {/* Collections Grid */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        {/* Collections Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              All Collections
            </h2>
            <p className="text-white/60">
              Showing {collections.length} collections
            </p>
          </div>
          {/* <div className="flex gap-2">
            <button className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors">
              Filter
            </button>
            <button className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors">
              Sort
            </button>
          </div> */}
        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {collections.map((collection: any) => {
            if (collection.id === 219 || collection.id === 216) return;

            // Handle different possible data structures
            let contractAddress =
              collection.contract?.contract_address ||
              collection.contract_address ||
              collection.address ||
              "";
            const oldPackage =
              "0xea46060a8a4750de4ce91e6b8a2119d35becbeaef939c09557d0773c7f7c20a0";
            const newCollection =
              "0x79e4f927919068602bae38387132f8c0dd52dc3207098355ece9e9ba61eb2290";
            if (contractAddress === oldPackage) contractAddress = newCollection;
            const chainType =
              collection.chain_name || collection.chainType || "SUI";
            const collectionName = collection.name || "Unnamed Collection";
            const dbCollection =
              "0x6c7ff54132f7693ad1334e85ff7c5cf2f967b37cc785e51019c42b42a5c38b6f";
            if (contractAddress === dbCollection)
              contractAddress = newCollection;
            const collectionDescription =
              collection.description || "No description available";
            const collectionId = collection.id || collection.collection_id;

            // Use specific image for NS Daily collection
            const isNSDaily =
              collectionName.toLowerCase().includes("ns daily") ||
              collectionName.toLowerCase().includes("network school") ||
              contractAddress === newCollection;
            const collectionImage = isNSDaily
              ? "https://client-uploads.nyc3.digitaloceanspaces.com/images/3b1daaad-c7dc-4884-a78b-739a3ce3dfaa/2025-08-28T12-25-58-895Z-38bc0eae.png"
              : backgroundImageHeroSection;

            // Determine if this is a SUI chain collection
            const isSuiChain = chainType.toLowerCase() === "sui";
            const linkUrl = isSuiChain
              ? `https://sui.hashcase.co/loyalties/${collectionId}`
              : `/loyalties/${collectionId}`;

            const LinkComponent = isSuiChain ? "a" : Link;
            const linkProps = isSuiChain
              ? {
                  href: linkUrl,
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "block group h-full",
                }
              : {
                  href: linkUrl,
                  className: "block group h-full",
                };

            return (
              <LinkComponent key={collectionId} {...linkProps}>
                <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden shadow-lg transition-all duration-300 h-full flex flex-col relative">
                  {/* Image Section */}
                  <div className="relative w-full aspect-square overflow-hidden flex-shrink-0">
                    <Image
                      src={collection.image_uri}
                      alt={collectionName}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Collection Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="px-2 py-1 bg-[#4DA2FF] text-black text-xs font-semibold rounded-full">
                        {chainType}
                      </span>
                    </div>

                    {/* External Link Icon for SUI chains - only visible on hover */}
                    {isSuiChain && (
                      <div className="absolute top-0 right-0 w-12 h-12 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {/* Enhanced gradient background with darker corner and lighter center */}
                        <div className="absolute inset-0 bg-gradient-to-bl from-white/30 via-white/15 via-white/8 to-transparent rounded-bl-2xl" />
                        {/* External link icon */}
                        <div className="absolute top-3 right-3">
                          <svg
                            className="w-4 h-4 md:w-5 md:h-5 drop-shadow-sm"
                            fill="none"
                            stroke="#77B7FF"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Content Section */}
                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="text-lg font-semibold text-white mb-2 line-clamp-1">
                      {collectionName}
                    </h3>
                    <p className="text-sm text-white/70 line-clamp-2 mb-3 flex-grow">
                      {collectionDescription}
                    </p>

                    {/* Contract Address */}
                    {contractAddress && (
                      <div className="mb-3">
                        <p className="text-xs text-white/50 mb-1">
                          Contract Address
                        </p>
                        <p className="text-xs text-[#4DA2FF] font-mono">
                          {contractAddress.length > 20
                            ? `${contractAddress.substring(0, 20)}...`
                            : contractAddress}
                        </p>
                      </div>
                    )}

                    {/* Action Buttons - This will stick to bottom */}
                    <div className="flex gap-2 mt-auto">
                      {/* Your button code here if needed */}
                    </div>
                  </div>
                </div>
              </LinkComponent>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center items-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg border border-white/20 text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    pageNum === page
                      ? "bg-[#4DA2FF] text-black font-semibold border-[#4DA2FF]"
                      : "bg-white/10 text-white border-white/20 hover:bg-white/20"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-lg border border-white/20 text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectionsPage;
