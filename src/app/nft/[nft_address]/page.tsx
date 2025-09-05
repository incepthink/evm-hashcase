"use client";
import { useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

import Link from "next/link";
import Image from "next/image";
import ArrowW from "@/assets/images/arrowW.svg";
import ArrowB from "@/assets/images/arrowB.svg";
import { Work_Sans } from "next/font/google";
import { Hash, Download, Edit3, ArrowLeft } from "lucide-react";

import { useNftTransactions } from "@/app/hooks/useNftTransactions";
import axiosInstance from "@/utils/axios";
import UnlockableNft from "./UnlockableNft";
import toast from "react-hot-toast";
import {
  Collection,
  Metadata,
  MetadataInstanceWithMetadataSet,
} from "@/utils/modelTypes";

const workSans = Work_Sans({ subsets: ["latin"] });

const NftPage = () => {
  const params = useParams();
  const router = useRouter();
  const currentAccount = useCurrentAccount();

  //needed for the NFT modal to function
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const { claimNFT, updateNftMetadata } = useNftTransactions();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [unlockableContent, setUnlockableContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const [upgradeData, setUpgradeData] =
    useState<MetadataInstanceWithMetadataSet | null>(null);

  const handleClaimNft = async (collection_id: string) => {
    if (!currentAccount?.address) {
      toast.error("Connect your wallet to claim");
      return;
    }
    
    setIsLoading(true);
    try {
      if (!nftData) return;
      // Build nft form from on-chain display
      const nftForm = {
        collection_id,
        title: String(nftData.name || "NFT"),
        description: String(nftData.description || ""),
        image_url: String(nftData.image_url || ""),
        attributes: JSON.stringify([]),
      };
      // Sponsor mint + transfer in backend
      await axiosInstance.post(
        "/platform/sui-nft/backend-mint",
        { nftForm },
        { params: { user_address: currentAccount.address } }
      );
      
      toast.success("NFT claimed successfully!");
    } catch (error) {
      console.error("Claim error:", error);
      toast.error("Failed to claim the NFT");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateMetadata = async (collection_id: string, nftId: string) => {
    if (!upgradeData) {
      toast.error("No upgrade data available for this NFT");
      return;
    }
    
    setIsLoading(true);
    try {
      const updateForm = {
        name: upgradeData.title!,
        description: upgradeData.description,
        imageUrl: upgradeData.image_url,
        collectionId: collection_id,
        attributes: "super, good",
        nftId: nftId,
      };

      await updateNftMetadata(updateForm);
      toast.success("NFT metadata updated successfully!");
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update NFT metadata");
    } finally {
      setIsLoading(false);
    }
  };

  const nft_address = (params.nft_address as string) || "";

  const { data: nft, isLoading: nftLoading, error: nftError } = useSuiClientQuery("getObject", {
    id: nft_address,
    options: {
      showContent: true,
      showDisplay: true,
      showType: true,
    },
  });

  // Extract NFT data from the response - handle different data structures
  let nftData: any = null;
  
  if (nft?.data?.content) {
    const content = nft.data.content as any;
    const display = nft.data.display as any;
    
    // Extract from content.fields first
    const fields = content?.fields || {};
    
    // Extract from display.data if available (this contains the actual metadata)
    const displayData = display?.data || {};
    
    nftData = {
      id: fields.id || { id: nft.data?.objectId },
      name: displayData.name || fields.name || 'Unknown NFT',
      description: displayData.description || fields.description || '',
      image_url: displayData.image_url || fields.image_url || '',
      attributes: fields.attributes || [],
      token_number: displayData.token_number || fields.token_number || '',
      mint_price: displayData.mint_price || fields.mint_price || '0',
      metadata_version: displayData.metadata_version || fields.metadata_version || '1',
      collection_id: displayData.collection_id || fields.collection_id || '',
      creator: displayData.creator || fields.creator || ''
    };
  }

  // Debug logging
  console.log("🔍 NFT Page Debug:");
  console.log("🔍 NFT Address:", nft_address);
  console.log("🔍 NFT Loading:", nftLoading);
  console.log("🔍 NFT Error:", nftError);
  console.log("🔍 NFT Query Result:", nft);
  console.log("🔍 NFT Content:", nft?.data?.content);
  console.log("🔍 NFT Content DataType:", nft?.data?.content?.dataType);
  console.log("🔍 NFT Content Fields:", (nft?.data?.content as any)?.fields);
  console.log("🔍 Final NFT Data:", nftData);

  // Set collectionAddress only when nftData changes
  useEffect(() => {
    const getUnlockableContentForCollection = async () => {
      if (nftData?.collection_id) {
        try {
          const collectionData = await axiosInstance.get(
            "/platform/collection-by-address",
            {
              params: {
                contract_address: nftData.collection_id,
              },
            }
          );
          const { collection_instance } = collectionData.data;

          setCollection(collection_instance);
          setUnlockableContent(collection_instance.contract.unlockable_content);

          // Try to get upgrade data, but don't fail if it's not available
          try {
            const upgrade = await axiosInstance.get("/platform/metadata/next", {
              params: {
                collection_id: collection_instance.id,
                token_id: nftData.token_number,
              },
            });
            setUpgradeData(upgrade.data.metadata_instance);
          } catch (upgradeError) {
            console.log("Upgrade data not available for this NFT:", upgradeError);
            // Don't set upgrade data if the endpoint fails
            setUpgradeData(null);
          }
        } catch (error: any) {
          // Swallow 404 (collection missing in DB) and continue rendering
          if (error?.response?.status !== 404) {
            console.error("Error fetching collection data:", error);
          }
          setCollection(null);
          setUnlockableContent("");
        }
      }
    };

    getUnlockableContentForCollection();
  }, [nftData]);

  if (nftLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#00041f] to-[#030828] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#4DA2FF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/80">Loading NFT...</p>
        </div>
      </div>
    );
  }

  if (!nft?.data) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#00041f] to-[#030828] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">⚠️</div>
          <p className="text-white/80">NFT not found</p>
          <p className="text-white/60 text-sm mt-2">The NFT might not exist or be accessible</p>
          <div className="mt-4 p-4 bg-white/5 rounded-lg text-left text-xs">
            <p className="text-white/60">Debug Info:</p>
            <p className="text-white/40">Address: {nft_address}</p>
            <p className="text-white/40">Loading: {nftLoading ? 'Yes' : 'No'}</p>
            <p className="text-white/40">Has Data: {nft?.data ? 'Yes' : 'No'}</p>
            <p className="text-white/40">Error: {nftError ? JSON.stringify(nftError) : 'None'}</p>
          </div>
        </div>
      </div>
    );
  }

  // If we have NFT data but no fields, show a fallback
  if (!nftData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#00041f] to-[#030828] flex items-center justify-center">
        <div className="text-center">
          <div className="text-yellow-400 text-xl mb-4">⚠️</div>
          <p className="text-white/80">NFT data structure not recognized</p>
          <p className="text-white/60 text-sm mt-2">The NFT exists but has an unexpected format</p>
          <div className="mt-4 p-4 bg-white/5 rounded-lg text-left text-xs max-w-md overflow-auto">
            <p className="text-white/60">Raw NFT Data:</p>
            <pre className="text-white/40 text-xs">{JSON.stringify(nft?.data, null, 2)}</pre>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col bg-gradient-to-b from-[#00041f] to-[#030828] ${workSans.className} min-h-screen`}>
      <div className="flex flex-col px-6 md:px-16 py-8">
        {/* Header with back button */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="text-lg">Go Back</span>
          </button>
          
          {/* Token ID Badge */}
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 border border-white/20">
            <Hash className="text-[#4DA2FF]" size={20} />
            <span className="text-white font-medium text-sm">
              {nftData.id?.id ? nftData.id.id.slice(0, 8) + '...' : nft_address.slice(0, 8) + '...'}
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
          {/* NFT Image Section */}
          <div className="w-full lg:w-1/2 flex justify-center">
            <div className="relative group">
              <img
                src={nftData.image_url}
                alt={nftData.name}
                className="w-full max-w-md h-auto rounded-2xl shadow-2xl border border-white/20"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </div>

          {/* NFT Details Section */}
          <div className="w-full lg:w-1/2 space-y-6">
            {/* NFT Title and Creator */}
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                {nftData.name}
              </h1>
              <p className="text-white/60">
                Created by{" "}
                <span className="text-[#4DA2FF] font-medium">
                  {nftData.creator || 'Unknown'}
                </span>
              </p>
            </div>

            {/* Description */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <p className="text-white/80 leading-relaxed">
                {nftData.description || "No description available"}
              </p>
            </div>

            {/* NFT Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <p className="text-white/60 text-sm">Token Number</p>
                <p className="text-white font-semibold">#{nftData.token_number}</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <p className="text-white/60 text-sm">Mint Price</p>
                <p className="text-white font-semibold">{nftData.mint_price}</p>
              </div>
            </div>

            {/* Claim is now a single click using connected wallet */}

            {/* Action Buttons */}
            <div className="flex flex-col gap-4 pt-4">
              {/* Claim NFT Button */}
              {/* <button
                onClick={() => handleClaimNft(nftData.collection_id)}
                disabled={isLoading || !currentAccount?.address}
                className="flex items-center justify-center gap-3 w-full px-6 py-4 bg-gradient-to-r from-[#4DA2FF] to-[#7ab8ff] hover:from-[#3a8fef] hover:to-[#6aa7f0] disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed rounded-xl font-semibold text-black transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Claiming...
                  </>
                ) : (
                  <>
                    <Download size={20} />
                    Claim NFT
                  </>
                )}
              </button> */}

              {/* Update Metadata Button */}
              <button
                onClick={() => handleUpdateMetadata(nftData.collection_id, nftData.id.id)}
                disabled={isLoading || !upgradeData}
                className="flex items-center justify-center gap-3 w-full px-6 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed rounded-xl font-semibold text-white transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Updating...
                  </>
                ) : !upgradeData ? (
                  <>
                    <Edit3 size={20} />
                    No Update Available
                  </>
                ) : (
                  <>
                    <Edit3 size={20} />
                    Update Metadata
                  </>
                )}
              </button>

              {/* Reveal Content Button (if available) */}
              {unlockableContent && (
                <button
                  onClick={openModal}
                  className="flex items-center justify-center gap-3 w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 rounded-xl font-semibold text-white transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                
                  Reveal Unlockable Content
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <UnlockableNft
        isOpen={isModalOpen}
        unlockableContent={unlockableContent}
        closeModal={closeModal}
      />
    </div>
  );
};

export default NftPage;
