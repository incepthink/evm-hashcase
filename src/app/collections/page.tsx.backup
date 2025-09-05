"use client";
import axiosInstance from "@/utils/axios";
import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";

import Image from "next/image";

import foregroundImageHeroSection from "@/assets/images/sui-bg.png";
import backgroundImageHeroSection from "@/assets/images/high_rise.jpg";

import "./page.css";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

interface Collection {
  id: number;
  name: string;
  description: string;
  image_uri: string;
  chain_type: string;
  chain_id: number;
  contract_address: string;
  standard: string;
  owner_id: number;
  paymaster_id: number | null;
  priority: number;
  attributes: string;
  createdAt: string;
  updatedAt: string;
}

const HeaderSection = () => {
  return (
    <div className="relative w-full py-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Discover <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4DA2FF] to-[#7ab8ff]">Collections</span>
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Explore unique digital collections and discover amazing NFTs on the Sui blockchain
          </p>
        </div>
      </div>
    </div>
  );
};

const CollectionsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const router = useRouter();

  const fetchCollections = async (page: number) => {
    try {
      const res = await axiosInstance.get(`/platform/collections-sui`);
      console.log("Collections API response:", res.data);
      return res.data;
    } catch (error) {
      console.error("Error fetching collections:", error);
      throw error; // Re-throw the error to show it properly
    }
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["collections", page],
    queryFn: () => fetchCollections(page),
    placeholderData: keepPreviousData,
    retry: 1, // Only retry once
    retryOnMount: true,
  });

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
          <p className="text-white/80 mb-4">Failed to load collections from the backend API.</p>
          
          {/* Show detailed error info for debugging */}
          {error && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6 text-left">
              <h3 className="text-red-400 font-semibold mb-2">Error Details:</h3>
              <p className="text-red-300 text-sm mb-2">
                <strong>Type:</strong> {(error as any).name || 'Unknown'}
              </p>
              <p className="text-red-300 text-sm mb-2">
                <strong>Message:</strong> {(error as any).message || 'No message available'}
              </p>
              {(error as any).response && (
                <p className="text-red-300 text-sm mb-2">
                  <strong>Status:</strong> {(error as any).response.status} - {(error as any).response.statusText}
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
              <p>Check if your backend server is running and the API endpoint exists.</p>
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
            <h3 className="text-2xl font-semibold mb-2">No Collections Found</h3>
            <p className="text-white/60">
              There are no collections available at the moment. Check back later!
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
            <h2 className="text-2xl font-bold text-white mb-2">All Collections</h2>
            <p className="text-white/60">Showing {collections.length} collections</p>
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
            // Handle different possible data structures
            let contractAddress = collection.contract?.contract_address || collection.contract_address || collection.address || '';
            const oldPackage = "0xea46060a8a4750de4ce91e6b8a2119d35becbeaef939c09557d0773c7f7c20a0";
            const newCollection = "0x79e4f927919068602bae38387132f8c0dd52dc3207098355ece9e9ba61eb2290";
            if (contractAddress === oldPackage) contractAddress = newCollection;
            const chainType = collection.chain_type || collection.chainType || 'SUI';
            const collectionName = collection.name || 'Unnamed Collection';
            const collectionDescription = collection.description || 'No description available';
            const collectionId = collection.id || collection.collection_id;
            
            return (
              <Link
                key={collectionId}
                href={`/collection/${contractAddress}`}
                className="block group"
              >
                <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden shadow-lg transition-all duration-300">
                  {/* Image Section */}
                  <div className="relative w-full aspect-square overflow-hidden">
                    <Image
                      src={backgroundImageHeroSection}
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
                  </div>

                  {/* Content Section */}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-white mb-2 line-clamp-1">
                      {collectionName}
                    </h3>
                    <p className="text-sm text-white/70 line-clamp-2 mb-3">
                      {collectionDescription}
                    </p>
                    
                    {/* Contract Address */}
                    {contractAddress && (
                      <div className="mb-3">
                        <p className="text-xs text-white/50 mb-1">Contract Address</p>
                        <p className="text-xs text-[#4DA2FF] font-mono">
                          {contractAddress.length > 20
                            ? `${contractAddress.substring(0, 20)}...`
                            : contractAddress}
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          router.push(`/loyalties/${collectionId}`);
                        }}
                        className="flex-1 text-center rounded-lg px-3 py-2 text-sm font-medium text-white bg-[#4DA2FF]/20 border border-[#4DA2FF]/50 hover:bg-[#4DA2FF] hover:text-black transition-all duration-200"
                        aria-label={`View loyalties for ${collectionName}`}
                      >
                        Loyalties
                      </button>
                      <button className="flex-1 text-center rounded-lg px-3 py-2 text-sm font-medium text-white bg-white/10 border border-white/20 hover:bg-white/20 transition-all duration-200">
                        View
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
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
