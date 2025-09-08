"use client";

import axiosInstance from "@/utils/axios";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface NFTMetadata {
  id: number;
  title: string;
  description: string;
  animation_url: string;
  image_url: string;
  collection_id: number;
  token_uri: string;
  attributes: string;
  createdAt: string;
  updatedAt: string;
  is_active: boolean;
}

const NFTMetadataPage = () => {
  const [metadata, setMetadata] = useState<NFTMetadata[]>([]);
  const [loading, setLoading] = useState(true);

  const params = useParams();

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const response = await axiosInstance.get(
          "platform/metadata/by-collection",
          {
            params: {
              collection_id: params.collection_id,
            },
          }
        );

        console.log("REPOSNE", response);
        setMetadata(response.data.metadata_instances);
      } catch (error) {
        console.error("Error fetching metadata", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMetadata();
  }, [params.collection_id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#00041f] to-[#030828] flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-lg">Loading metadata...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#00041f] to-[#030828] px-4 sm:px-6 lg:px-8 py-8 text-white">
      {/* Header Section */}
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 drop-shadow-lg">
          Mintable NFTs
        </h1>
        <p className="text-gray-300 text-sm sm:text-base max-w-2xl mx-auto">
          Discover and mint unique digital assets from our curated collection
        </p>
      </div>

      {/* NFT Grid Container */}
      <div className="max-w-7xl mx-auto">
        {metadata.length === 0 ? (
          <div className="text-center text-gray-300 py-12">
            <p className="text-lg">No NFTs found in this collection.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {metadata.map((nft) => {
              return (
                <Link key={nft.id} href={`/freeMint/${nft.id}`}>
                  <div className="group bg-gradient-to-br from-[#0a0f3b] to-[#050a2e] shadow-xl rounded-xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:from-[#141a52] hover:to-[#0a0f3b] cursor-pointer border border-gray-700/30">
                    {/* Image Container */}
                    <div className="relative overflow-hidden">
                      <img
                        src={
                          nft.image_url ||
                          "https://via.placeholder.com/400x300?text=No+Image"
                        }
                        alt={nft.title}
                        className="w-full h-48 sm:h-56 lg:h-64 object-cover transition-transform duration-300 group-hover:scale-110"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src =
                            "https://via.placeholder.com/400x300?text=Image+Not+Found";
                        }}
                      />
                      {/* Overlay gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>

                    {/* Content */}
                    <div className="p-4 sm:p-5">
                      {/* Title */}
                      <h2 className="text-lg sm:text-xl font-bold mb-2 text-white group-hover:text-blue-300 transition-colors duration-300 line-clamp-1">
                        {nft.title}
                      </h2>

                      {/* Description */}
                      <p className="text-gray-300 text-sm mb-3 leading-relaxed line-clamp-2 group-hover:text-gray-200 transition-colors duration-300">
                        {nft.description}
                      </p>

                      {/* Attributes */}
                      <div className="mb-3">
                        <div className="flex flex-wrap gap-1">
                          {nft.attributes
                            .split(",")
                            .slice(0, 2)
                            .map((attr, index) => (
                              <span
                                key={index}
                                className="inline-block bg-blue-500/20 text-blue-300 text-xs px-2 py-1 rounded-full border border-blue-500/30"
                              >
                                {attr.trim().split(":")[1]?.trim() ||
                                  attr.trim()}
                              </span>
                            ))}
                          {nft.attributes.split(",").length > 2 && (
                            <span className="inline-block bg-gray-500/20 text-gray-400 text-xs px-2 py-1 rounded-full">
                              +{nft.attributes.split(",").length - 2}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Footer Info */}
                      <div className="space-y-2 pt-2 border-t border-gray-700/30">
                        <div className="flex justify-between items-center text-xs text-gray-400">
                          <span>Collection #{nft.collection_id}</span>
                          <span>
                            {new Date(nft.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400">
                          Last updated:{" "}
                          {new Date(nft.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {/* Mint Button Hint */}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                        Mint
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default NFTMetadataPage;
