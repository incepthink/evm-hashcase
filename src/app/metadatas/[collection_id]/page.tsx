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
}

const NFTMetadataPage = () => {
  const [metadata, setMetadata] = useState<NFTMetadata[]>([]);

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
        ); // Update with actual API endpoint

        console.log(response);

        setMetadata(response.data.metadata_instances);
      } catch (error) {
        console.error("Error fetching metadata", error);
      }
    };
    fetchMetadata();
  }, []);

  if (!metadata)
    return <div className="text-white text-center">Loading metadata...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#00041f] to-[#030828] p-8 text-white">
      <h1 className="text-5xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 drop-shadow-lg text-center">
        Collection Assets{" "}
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metadata.map((metadata) => (
          <Link key={metadata.id} href={`/freeMint/${metadata.id}`}>
            <div className="bg-[#0a0f3b] shadow-lg rounded-lg p-4 transform transition-transform duration-300 hover:scale-105 hover:bg-[#141a52] cursor-pointer">
              <img
                src={metadata.image_url || "https://via.placeholder.com/300"}
                alt={metadata.title}
                className="w-full h-48 object-cover rounded-md"
              />
              <h2 className="text-2xl font-semibold mt-4">{metadata.title}</h2>
              <p className="text-sm text-gray-300 mt-2">
                {metadata.description.length > 100
                  ? `${metadata.description.substring(0, 100)}...`
                  : metadata.description}
              </p>

              <div className="hidden hover:block text-gray-400 mt-2 text-sm">
                <p>
                  Created: {new Date(metadata.createdAt).toLocaleDateString()}
                </p>
                <p>
                  Updated: {new Date(metadata.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* <div className="bg-blue-800 shadow-lg rounded-lg p-4 cursor-pointer transform transition-transform hover:scale-105">
              <h2 className="text-2xl font-semibold">{nft.title}</h2>
              <p className="text-sm text-gray-300 mt-2 truncate">
                {nft.description}
              </p>
              <div className="mt-4">
                <p className="text-blue-200">
                  Collection ID: {nft.collection_id}
                </p>
                <p className="text-blue-300 truncate">
                  Token URI: {nft.token_uri}
                </p>
                <p className="text-blue-400">
                  Attributes: {nft.attributes.replace(/\|/g, ", ")}
                </p>
              </div>
            </div> */}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default NFTMetadataPage;
