"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import Link from "next/link";
import NftCard from "@/components/NftCard";
import React, { useContext } from "react";

import axiosInstance from "@/utils/axios";
import { SuiClient } from "@mysten/sui.js/client";
import { Frown, MapPin, MapPinOff } from "lucide-react";
import CustomNftModal from "./CustomNftModal";
import {
  Metadata,
  MetadataSetWithAllMetadataInstances,
} from "@/utils/modelTypes";
import toast from "react-hot-toast";

let notused = true;

interface Collection {
  id: number;
  name: string;
  description?: string;
  image_uri?: string;
  chain_name: string;
  owner_id: number;
  priority?: number;
  attributes?: string;
  contract_id?: number;
  createdAt: string;
  updatedAt: string;
  contract: {
    id: number;
    chain_name: string;
    contract_address: string;
    standard: string;
    paymaster_id?: number | null;
    Chain: {
      chain_name: string;
      chain_id: number;
      chain_type: string;
    };
  };
}

interface BlockchainNFT {
  id: string;
  name: string;
  description: string;
  image_url: string;
  token_id: string;
  owner: string;
}

interface MixedNFT {
  id: string;
  name: string;
  description: string;
  image_url: string;
  token_id?: string;
  owner?: string;
  type: "minted" | "randomized" | "geofenced";
  originalData?: any;
}

type Coordinates = {
  latitude: number;
  longitude: number;
};

export default function NFTPage() {
  const params = useParams();
  const collectionAddress = decodeURIComponent(
    String(params.collection_address || "")
  ).trim();
  const [collectionData, setCollectionData] = useState<Collection | null>(null);
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [mintedNFTs, setMintedNFTs] = useState<BlockchainNFT[]>([]);
  const [isLoadingMinted, setIsLoadingMinted] = useState(false);
  const [mixedNFTs, setMixedNFTs] = useState<MixedNFT[]>([]);
  const [location, setLocation] = useState<Coordinates>({
    latitude: -1,
    longitude: -1,
  });
  const [userCoordinates, setUserCoordinates] = useState<string>("");

  //needed for the NFT modal to function
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Fetch location NFT directly from blockchain
  const fetchLocationNFTFromBlockchain = async (collectionId: string) => {
    try {
      // Initialize Sui client for mainnet
      const client = new SuiClient({
        url: "https://fullnode.mainnet.sui.io:443",
      });

      // Admin wallet address
      const adminWallet =
        "0xeff17a6af10d476f387eb6d00889606c5ee89718d523c309a2c6d2aaaa57512e";

      // Get all objects owned by the admin wallet
      const objects = await client.getOwnedObjects({
        owner: adminWallet,
        options: {
          showContent: true,
          showDisplay: true,
          showType: true,
        },
      });

      // Filter for NFT objects and check for location NFTs
      const packageId =
        "0xea46060a8a4750de4ce91e6b8a2119d35becbeaef939c09557d0773c7f7c20a0";
      const locationNFTs = objects.data.filter((obj) => {
        if (!obj.data?.type) return false;
        if (!obj.data.type.includes(`${packageId}::hashcase_module::NFT`))
          return false;

        // Check if the NFT belongs to the specific collection
        const content = obj.data?.content as any;
        const nftCollectionId =
          content?.fields?.collection_id?.id || content?.fields?.collection_id;
        if (nftCollectionId !== collectionId) return false;

        // Check if it has location attributes
        const attributes = content?.fields?.attributes || [];
        return attributes.some(
          (attr: string) =>
            attr.includes("Location:") ||
            attr.includes("Latitude:") ||
            attr.includes("Longitude:")
        );
      });

      // Transform location NFTs
      const transformedLocationNFTs = locationNFTs.map((obj) => {
        const content = obj.data?.content as any;
        const display = obj.data?.display as any;

        return {
          id: obj.data?.objectId,
          name:
            display?.data?.name ||
            display?.name ||
            content?.fields?.name ||
            content?.name ||
            "Unknown",
          description:
            display?.data?.description ||
            display?.description ||
            content?.fields?.description ||
            content?.description ||
            "",
          image_url:
            display?.data?.image_url ||
            display?.image_url ||
            content?.fields?.image_url ||
            content?.image_url ||
            "",
          attributes: content?.fields?.attributes || [],
          token_id:
            content?.fields?.token_number?.toString() ||
            content?.token_number?.toString() ||
            obj.data?.objectId,
          owner: (obj.data?.owner as any)?.AddressOwner || "Unknown",
          collection_id:
            content?.fields?.collection_id?.id ||
            content?.fields?.collection_id ||
            collectionId,
        };
      });

      return transformedLocationNFTs;
    } catch (error) {
      console.error("❌ Error fetching location NFT from blockchain:", error);
      return [];
    }
  };

  // Fetch NFTs from Sui blockchain
  const fetchCollectionNFTs = async (collectionAddress: string) => {
    if (!collectionAddress) {
      setMintedNFTs([]);
      return;
    }
    console.log("🚀 Fetching NFTs for collection:", collectionAddress);
    setIsLoadingMinted(true);
    try {
      const response = await axiosInstance.get(
        "/platform/sui/nfts/by-collection",
        { params: { collection_id: collectionAddress } }
      );
      console.log("📡 Backend response:", response.data);
      if (
        response.data.success &&
        response.data.data &&
        response.data.data.nfts
      ) {
        const rawNfts: any[] = response.data.data.nfts || [];
        console.log("🔍 First NFT from backend:", rawNfts[0]);
        console.log("📊 Total NFTs received:", rawNfts.length);
        // Show all NFTs from this collection address (skip filtering since we're already fetching by collection)
        const filtered = rawNfts;
        const nfts: BlockchainNFT[] = filtered.map((nft: any) => ({
          id: nft.id,
          name: nft.name || "Unnamed NFT",
          description: nft.description || "No description",
          image_url: nft.image_url || "https://via.placeholder.com/300",
          token_id: nft.token_number?.toString() || nft.id,
          owner: nft.owner || "Unknown",
        }));

        // Filter out location-specific NFTs when location is not enabled
        const filteredNfts = nfts.filter((nft) => {
          // const name = nft.name?.toLowerCase() || '';
          // const description = nft.description?.toLowerCase() || '';

          // If location is not enabled, hide ALL location-specific NFTs
          // if (!isLocationEnabled) {
          //   return !(name.includes('delhi') ||
          //           name.includes('mumbai') ||
          //           name.includes('bangalore') ||
          //           name.includes('secret location') ||
          //           name.includes('location nft') ||
          //           description.includes('delhi') ||
          //           description.includes('mumbai') ||
          //           description.includes('bangalore') ||
          //           description.includes('location-locked') ||
          //           description.includes('location specific') ||
          //           name.includes('local') ||
          //           name.includes('special') ||
          //           name.includes('tech'));
          // }

          // If location is enabled, show all NFTs (they will be filtered by geolocation later)
          return true;
        });

        setMintedNFTs(filteredNfts);
      } else {
        setMintedNFTs([]);
      }
    } catch (error: any) {
      console.error("❌ Error fetching collection NFTs:", error);
      console.error("❌ Error details:", error.response?.data || error.message);

      // Handle specific error cases
      if (error.response?.status === 502) {
        console.log(
          "Backend service temporarily unavailable (502 Bad Gateway)"
        );
        toast.error(
          "Backend service temporarily unavailable. Please try again later.",
          {
            duration: 5000,
            position: "top-center",
          }
        );
      } else if (error.response?.status === 500) {
        console.log("Internal server error (500)");
        toast.error("Server error occurred. Please try again later.", {
          duration: 5000,
          position: "top-center",
        });
      } else {
        console.log("Network or other error:", error.message);
        toast.error(
          "Failed to fetch NFTs. Please check your connection and try again.",
          {
            duration: 5000,
            position: "top-center",
          }
        );
      }

      setMintedNFTs([]);
    } finally {
      setIsLoadingMinted(false);
    }
  };

  // Function to check if an NFT is within location range
  const isNFTInLocationRange = (
    nft: any,
    userLat: number,
    userLon: number
  ): boolean => {
    try {
      // Debug logging removed for cleaner output

      // Check if NFT has location attributes - try different possible structures
      const attributes = nft.attributes || nft.originalData?.attributes || [];
      console.log("🔍 NFT attributes found:", attributes);

      let nftLat: number | null = null;
      let nftLon: number | null = null;
      let nftRadius: number = 15000; // Default 15km radius

      // Parse location attributes
      attributes.forEach((attr: string) => {
        if (attr.includes("Latitude:")) {
          nftLat = parseFloat(attr.split("Latitude:")[1].trim());
        }
        if (attr.includes("Longitude:")) {
          nftLon = parseFloat(attr.split("Longitude:")[1].trim());
        }
        if (attr.includes("Radius:")) {
          const radiusStr = attr.split("Radius:")[1].trim();
          nftRadius =
            parseInt(radiusStr.replace("km", "").replace("m", "")) * 1000; // Convert to meters
        }
      });

      // If no location data, it's not a location NFT
      if (nftLat === null || nftLon === null) {
        return false;
      }

      // Calculate distance using Haversine formula
      const R = 6371000; // Earth's radius in meters
      const lat1Rad = (userLat * Math.PI) / 180;
      const lat2Rad = (nftLat * Math.PI) / 180;
      const deltaLat = ((nftLat - userLat) * Math.PI) / 180;
      const deltaLon = ((nftLon - userLon) * Math.PI) / 180;

      const a =
        Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
        Math.cos(lat1Rad) *
          Math.cos(lat2Rad) *
          Math.sin(deltaLon / 2) *
          Math.sin(deltaLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;

      // Distance calculation completed silently
      return distance <= nftRadius;
    } catch (error) {
      console.error("Error calculating distance for NFT:", nft.name, error);
      return false;
    }
  };

  // Check if location permission is already granted
  const checkLocationPermission = async () => {
    if (!navigator.permissions) {
      console.log("❌ Permissions API not supported");
      return false;
    }

    try {
      const permission = await navigator.permissions.query({
        name: "geolocation",
      });
      console.log("📍 Location permission state:", permission.state);
      return permission.state === "granted";
    } catch (error) {
      console.log(
        "Permission API not supported, will check on location request"
      );
      return false;
    }
  };

  // Initialize location state on component mount
  useEffect(() => {
    const initLocationState = async () => {
      console.log("🔄 Initializing location state...");
      const hasPermission = await checkLocationPermission();
      console.log("📍 Has location permission:", hasPermission);
      setIsLocationEnabled(hasPermission);

      // If we have permission, automatically fetch location data
      if (hasPermission && collectionData) {
        console.log("📍 Permission granted, fetching location data...");
        getLocationData();
      }
    };

    initLocationState();
  }, [collectionData]);

  function getCurrentPosition(): Promise<Coordinates> {
    return new Promise((resolve, reject) => {
      const options = {
        enableHighAccuracy: true,
        timeout: 10000, // 10 seconds timeout
        maximumAge: 300000, // 5 minutes cache
      };

      navigator.geolocation.getCurrentPosition(
        (position: GeolocationPosition) => {
          const { latitude, longitude } = position.coords;
          resolve({ latitude, longitude });
        },
        (error: GeolocationPositionError) => {
          reject(error);
        },
        options
      );
    });
  }

  const [allMetadata, setMetadata] = useState<Metadata[]>([]);
  const [geofencedMetadata, setGeofencedMetadata] = useState<Metadata[]>([]);
  const [randomizedTokenMetadata, setRandomizedTokenMetadata] = useState<
    MetadataSetWithAllMetadataInstances[]
  >([]);

  // Separate function to get location data (without changing permission state)
  const getLocationData = async (): Promise<boolean> => {
    try {
      // Always request geolocation first; success means we can enable the toggle
      const { latitude, longitude } = await getCurrentPosition();
      console.log("📍 Browser location:", latitude, longitude);

      // Store coordinates for display
      setUserCoordinates(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
      setLocation({ latitude, longitude });

      // Location coordinates obtained successfully (toast removed)

      // Try to fetch geofenced metadata using collection ID 1 (which we know exists)
      const collectionId = collectionData?.id || 1; // Fallback to collection ID 1
      console.log(
        "🏢 Using collection ID for geofenced metadata:",
        collectionId
      );

      try {
        console.log("🔍 Fetching geofenced metadata...");
        const geofenced = await axiosInstance.get(
          "/platform/metadata/geo-fenced",
          {
            params: {
              user_lat: latitude,
              user_lon: longitude,
              collection_id: collectionId,
            },
          }
        );
        console.log("✅ Geofenced metadata received:", geofenced.data.data);
        console.log(
          "📊 Number of geofenced NFTs found:",
          geofenced.data.data.length
        );
        setGeofencedMetadata(geofenced.data.data);

        if (geofenced.data.data.length > 0) {
          console.log(
            `📍 Found ${geofenced.data.data.length} location-specific NFT(s) near you!`
          );
        } else {
          console.log(
            "📍 No location-specific NFTs found within 10km of your area!"
          );
        }
      } catch (geoErr) {
        console.log("❌ Geofenced metadata not available:", geoErr);
        setGeofencedMetadata([]);
      }

      return true;
    } catch (err: unknown) {
      const anyErr = err as any;
      const code = typeof anyErr?.code === "number" ? anyErr.code : undefined;
      const message = anyErr?.message || "Unknown error";
      console.warn("Location error:", message);
      if (code === 1) {
        alert(
          "Location access denied. Please allow location access in your browser settings and try again."
        );
      } else if (code === 2) {
        alert(
          "Location unavailable. Please check your device's location services and try again."
        );
      } else if (code === 3) {
        alert("Location request timed out. Please try again.");
      }
      setGeofencedMetadata([]);
      return false;
    }
  };

  const getLocation = async () => {
    console.log("🔘 Location button clicked");
    setIsLoading(true);
    try {
      // Attempt to fetch geofenced data; enable only on success
      const ok = await getLocationData();
      console.log("📍 Location data fetch result:", ok);
      setIsLocationEnabled(!!ok);
    } catch (err: unknown) {
      const anyErr = err as any;
      const code = typeof anyErr?.code === "number" ? anyErr.code : undefined;
      console.warn("Location error:", anyErr?.message || "Unknown error");
      if (code === 1) {
        alert(
          "Location access denied. Please allow location access in your browser settings and try again."
        );
      } else if (code === 2) {
        alert(
          "Location unavailable. Please check your device's location services and try again."
        );
      } else if (code === 3) {
        alert("Location request timed out. Please try again.");
      } else {
        alert(
          "Failed to get location. Please check your browser settings and try again."
        );
      }
      setIsLocationEnabled(false);
      // Keep location enabled; user can disable manually using the toggle
    } finally {
      setIsLoading(false);
    }
  };

  // Function to mix NFTs from different sources
  const mixNFTs = async () => {
    console.log("🔄 Starting mixNFTs function...");
    console.log("📍 Location enabled:", isLocationEnabled);
    console.log("📍 Geofenced metadata count:", geofencedMetadata.length);
    console.log("📍 Minted NFTs count:", mintedNFTs.length);

    const mixed: MixedNFT[] = [];

    // Separate random and non-random minted NFTs
    const randomMintedNFTs: any[] = [];
    const nonRandomMintedNFTs: any[] = [];

    mintedNFTs.forEach((nft) => {
      // Check if this is a random NFT based on name patterns
      const isRandomNFT =
        nft.name?.toLowerCase().includes("random") ||
        nft.name?.toLowerCase().includes("drop") ||
        nft.description?.toLowerCase().includes("randomized");

      // Filter out Random Drop #4
      const isNotRandomDrop4 = nft.name !== "Random Drop #4";

      if (isRandomNFT && isNotRandomDrop4) {
        randomMintedNFTs.push(nft);
      } else if (!isRandomNFT) {
        nonRandomMintedNFTs.push(nft);
      }
      // Random Drop #4 is completely excluded
    });

    console.log("🎲 Random NFTs found:", randomMintedNFTs.length);
    console.log("📦 Non-random NFTs found:", nonRandomMintedNFTs.length);

    // Add non-random minted NFTs (EXCLUDE location-specific NFTs from regular metadata)
    nonRandomMintedNFTs.forEach((nft) => {
      // Check if this is a location NFT
      const isLocationNFT =
        nft.name?.toLowerCase().includes("location") ||
        nft.name?.toLowerCase().includes("🌍") ||
        nft.description?.toLowerCase().includes("location") ||
        nft.description?.toLowerCase().includes("area") ||
        nft.description?.toLowerCase().includes("coordinates") ||
        nft.description?.toLowerCase().includes("residents only") ||
        nft.description?.toLowerCase().includes("only available in") ||
        (nft.attributes &&
          nft.attributes.some(
            (attr: string) =>
              attr.includes("Latitude:") || attr.includes("Longitude:")
          ));

      if (!isLocationNFT) {
        // Add non-location NFTs
        mixed.push({
          id: nft.id,
          name: nft.name,
          description: nft.description,
          image_url: nft.image_url,
          token_id: nft.token_id,
          owner: nft.owner,
          type: "minted",
          originalData: nft,
        });
      } else if (isLocationEnabled) {
        // For location NFTs, check if they're within range
        if (isNFTInLocationRange(nft, location.latitude, location.longitude)) {
          console.log(
            "📍 Adding location NFT from regular metadata (in range):",
            nft.name
          );
          mixed.push({
            id: nft.id,
            name: nft.name,
            description: nft.description,
            image_url: nft.image_url,
            token_id: nft.token_id,
            owner: nft.owner,
            type: "geofenced",
            originalData: nft,
          });
        } else {
          console.log("📍 Location NFT not in range:", nft.name);
        }
      } else {
        // Location not enabled, hide location NFTs
        console.log("📍 Location NFT hidden (location disabled):", nft.name);
      }
    });

    // Show geolocation NFTs when location is enabled
    if (isLocationEnabled) {
      if (geofencedMetadata.length > 0) {
        // Use geofenced metadata from backend API (distance-filtered)
        console.log(
          "✅ Adding geolocation NFTs from geofenced metadata:",
          geofencedMetadata.length,
          "NFTs"
        );
        geofencedMetadata.forEach((metadata) => {
          console.log("📍 Adding location NFT:", metadata.title);
          mixed.push({
            id: `geo-${metadata.id}`,
            name: metadata.title || "Location NFT",
            description: metadata.description || "Location-specific NFT",
            image_url: metadata.image_url,
            type: "geofenced",
            originalData: metadata,
          });
        });
      } else {
        // Fallback: Fetch location NFTs directly from blockchain when geofenced API fails
        try {
          const locationNFTsFromBlockchain =
            await fetchLocationNFTFromBlockchain(collectionAddress || "");

          locationNFTsFromBlockchain.forEach((nft) => {
            // Filter out Jaipur NFTs
            if (
              nft.name?.toLowerCase().includes("jaipur") ||
              nft.description?.toLowerCase().includes("jaipur") ||
              nft.attributes?.some((attr: string) =>
                attr.toLowerCase().includes("jaipur")
              )
            ) {
              return; // Skip this NFT
            }

            // Check if NFT is within range
            if (
              isNFTInLocationRange(nft, location.latitude, location.longitude)
            ) {
              mixed.push({
                id: nft.id || "unknown",
                name: nft.name || "Unknown",
                description: nft.description || "",
                image_url: nft.image_url || "",
                token_id: nft.token_id || "unknown",
                owner: nft.owner || "Unknown",
                type: "geofenced",
                originalData: nft,
              });
            }
          });
        } catch (error) {
          console.error(
            "❌ Error fetching location NFTs from blockchain:",
            error
          );
        }
      }
    } else {
      console.log("📍 Location not enabled - geolocation NFTs hidden");
    }

    // Add ONE representative random NFT card (combining both minted random NFTs and metadata sets)
    const totalRandomNFTs =
      randomMintedNFTs.length + randomizedTokenMetadata.length;
    if (totalRandomNFTs > 0) {
      // Combine all random NFTs into one array
      const allRandomNFTs = [...randomMintedNFTs];

      // Add metadata set NFTs if available
      if (randomizedTokenMetadata.length > 0) {
        randomizedTokenMetadata.forEach((metadata) => {
          allRandomNFTs.push({
            id: `rand-${metadata.id}`,
            name: metadata.name,
            description: metadata.Collection.description || "Randomized NFT",
            image_url: metadata.Collection.image_uri,
          });
        });
      }

      // Use stored random NFT or select a new one
      let representativeNFT = selectedRandomNFT;
      if (!representativeNFT && allRandomNFTs.length > 0) {
        const randomIndex = Math.floor(Math.random() * allRandomNFTs.length);
        representativeNFT = allRandomNFTs[randomIndex];
        setSelectedRandomNFT(representativeNFT);
      }

      if (representativeNFT) {
        mixed.push({
          id: representativeNFT.id,
          name: representativeNFT.name,
          description: representativeNFT.description,
          image_url: representativeNFT.image_url,
          type: "randomized",
          originalData: {
            totalRandomNFTs,
            randomMintedNFTs,
            randomizedTokenMetadata,
            collectionId: collectionData?.id,
          },
        });
      }
    }

    console.log("🎯 Final mixed NFTs count:", mixed.length);
    console.log(
      "🎯 Mixed NFTs types:",
      mixed.map((nft) => ({ name: nft.name, type: nft.type }))
    );

    // Don't shuffle - keep original order
    setMixedNFTs(mixed);
  };

  // Update mixed NFTs whenever the source data changes
  useEffect(() => {
    console.log("🔄 mixNFTs useEffect triggered");
    console.log("📍 Current location state:", {
      isLocationEnabled,
      geofencedMetadata: geofencedMetadata.length,
    });
    mixNFTs().catch(console.error);
  }, [
    mintedNFTs,
    geofencedMetadata,
    randomizedTokenMetadata,
    isLocationEnabled,
  ]);

  // Fetch location data when location is enabled
  useEffect(() => {
    if (isLocationEnabled) {
      console.log("🔄 Location enabled, fetching location data...");
      getLocationData();
    }
  }, [isLocationEnabled]);

  // Store the random NFT selection to keep it consistent during the session
  const [selectedRandomNFT, setSelectedRandomNFT] = useState<any>(null);

  // Fetch collection data on component mount
  useEffect(() => {
    const fetchNFTData = async () => {
      try {
        // Try to load collection details from DB (non-fatal)
        try {
          const collectionRes = await axiosInstance.get(
            "/platform/collection-by-address",
            { params: { contract_address: collectionAddress } }
          );
          const { collection_instance } = collectionRes.data;
          setCollectionData(collection_instance);
        } catch (err: any) {
          if (err?.response?.status === 404) {
            console.warn(
              "Collection not found in DB, continuing with chain-only data"
            );
          } else {
            throw err;
          }
        }

        // Fetch NFTs from backend API using the route param address
        await fetchCollectionNFTs(collectionAddress);

        // Only fetch DB metadata if we have a DB collection
        if (collectionData?.id) {
          try {
            const response = await axiosInstance.get(
              "platform/metadata/by-collection",
              { params: { collection_id: collectionData.id } }
            );
            setMetadata(response.data.metadata_instances);
          } catch (metadataError) {
            console.log(
              "Metadata not available for this collection:",
              metadataError
            );
            setMetadata([]);
          }

          try {
            const randomizedToken = await axiosInstance.get(
              "/platform/metadata-set/by-collection",
              { params: { collection_id: collectionData.id } }
            );
            setRandomizedTokenMetadata(randomizedToken.data.metadataSets);
          } catch (randomizedError) {
            console.log(
              "Randomized token metadata not available:",
              randomizedError
            );
            setRandomizedTokenMetadata([]);
          }
        }
      } catch (error) {
        console.error("Error fetching collection data:", error);
        setError(error as Error);
      }
    };

    if (collectionAddress) {
      fetchNFTData();
    }
  }, [collectionAddress]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#00041f] to-[#030828] flex items-center justify-center">
        <div className="text-center max-w-2xl mx-auto px-6">
          <div className="text-red-400 text-4xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-4">
            Collection API Error
          </h2>
          <p className="text-white/80 mb-4">
            Failed to load collection data from the backend API.
          </p>

          {/* Show detailed error info for debugging */}
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6 text-left">
            <h3 className="text-red-400 font-semibold mb-2">Error Details:</h3>
            <p className="text-red-300 text-sm mb-2">
              <strong>Type:</strong> {error.name || "Unknown"}
            </p>
            <p className="text-red-300 text-sm mb-2">
              <strong>Message:</strong>{" "}
              {error.message || "No message available"}
            </p>
            <p className="text-red-300 text-sm mb-2">
              <strong>Collection Address:</strong> {params.collection_address}
            </p>
            <p className="text-red-300 text-sm">
              <strong>Endpoint:</strong> /platform/collection-by-address
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-[#4DA2FF] text-black rounded-lg hover:bg-[#3a8fef] transition-colors font-semibold"
            >
              Retry
            </button>
            <div className="text-white/60 text-sm">
              <p>
                Check if your backend server is running and the collection
                exists.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Do not block render if DB collection is missing; render with fallbacks
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#00041f] to-[#030828] text-white">
      {/* Banner Section */}
      {/* <div className="w-full h-[200px] overflow-hidden">
          <img
            src={
              collectionData.image_uri ||
              "https://i.pinimg.com/564x/49/cc/10/49cc10386c922de5e2e3c0bb66956e65.jpg"
            }
            alt="Banner"
            className="w-full h-auto"
          />
        </div> */}

      {/* Profile Section */}
      <div className="w-full flex justify-center py-12">
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
          <div className="flex items-center gap-8 mb-6">
            <div className="flex-shrink-0">
              <img
                src={
                  // collectionData.image_uri ||
                  "https://i.pinimg.com/564x/49/cc/10/49cc10386c922de5e2e3c0bb66956e65.jpg"
                }
                alt="Logo"
                className="w-32 h-32 rounded-full border-4 border-white/20 shadow-2xl"
              />
            </div>
            <div className="text-left">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 drop-shadow-lg">
                {collectionData?.name || "Sui Collection"}
              </h2>
              <p className="text-gray-300 text-lg">
                {collectionData?.description ||
                  "A curated collection of unique digital assets"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 pb-8 max-w-[1400px] mx-auto">
        {/* Header toolbar */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-semibold text-white drop-shadow-lg">
              Collection Assets
            </h1>
            {/* {userCoordinates && (
                <p className="text-sm text-gray-400 mt-2">
                  📍 Your location: {userCoordinates}
                </p>
              )} */}
          </div>
          <div className="flex items-center gap-3 justify-center md:justify-end">
            <button
              onClick={() => openModal()}
              className="px-5 py-2.5 rounded-lg font-medium bg-blue-600 hover:bg-blue-700 text-white border-0 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Mint Custom NFT
            </button>
            <button
              onClick={isLocationEnabled ? getLocationData : getLocation}
              className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 border ${
                isLocationEnabled
                  ? "bg-green-600 text-white border-transparent hover:bg-green-700"
                  : "bg-white/5 text-white border-white/20 hover:bg-white/10 backdrop-blur-sm"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title={
                isLocationEnabled
                  ? "Location enabled - Click to refresh nearby NFTs"
                  : "Click to enable location access for location-specific NFTs"
              }
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Loading...
                </div>
              ) : isLocationEnabled ? (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Location Enabled
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <MapPinOff className="w-4 h-4" /> Enable Location
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Location-Specific NFTs Section */}

        {/* Mixed NFTs Section */}
        {isLoadingMinted ? (
          <div className="mb-20 py-5">
            <div className="flex items-center justify-center min-h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-white">
                Loading collection assets...
              </span>
            </div>
          </div>
        ) : mixedNFTs.length > 0 ? (
          <div className="py-20 mb-40">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ">
              {mixedNFTs
                .slice()
                .filter((nft) => {
                  // SIMPLE: Only show geolocation NFTs when location is enabled
                  if (nft.type === "geofenced") {
                    return isLocationEnabled;
                  }
                  return true;
                })
                .sort((a, b) => {
                  // Sort non-random NFTs first, then random NFTs
                  if (a.type === "randomized" && b.type !== "randomized")
                    return 1;
                  if (a.type !== "randomized" && b.type === "randomized")
                    return -1;

                  // For non-random NFTs, prioritize HTTPS images
                  if (a.type !== "randomized" && b.type !== "randomized") {
                    const aHasHttps =
                      typeof a.image_url === "string" &&
                      a.image_url.startsWith("https://");
                    const bHasHttps =
                      typeof b.image_url === "string" &&
                      b.image_url.startsWith("https://");
                    return Number(bHasHttps) - Number(aHasHttps);
                  }

                  // For random NFTs, sort by name
                  if (a.type === "randomized" && b.type === "randomized") {
                    return a.name.localeCompare(b.name);
                  }

                  return 0;
                })
                .map((nft: MixedNFT) => (
                  <div key={nft.id} className="relative">
                    <NftCard
                      href={
                        nft.type === "randomized"
                          ? `/freeMint/${nft.id}?type=randomized`
                          : nft.type === "geofenced"
                          ? `/freeMint/${nft.originalData.id}?type=geofenced`
                          : `/freeMint/${nft.id}?type=${nft.type}`
                      }
                      imageUrl={nft.image_url}
                      title={nft.name}
                      description={nft.description}
                      footer={
                        <div className="flex justify-center py-4">
                          <button className="border-2 border-gray-700 rounded-xl py-2 px-10 hover:text-white transition-all duration-200 shadow-lg shadow-gray-800">
                            {nft.type === "minted" ? "View NFT" : "Mint NFT"}
                          </button>
                        </div>
                      }
                    />

                    {/* NFT Type Badge */}
                    <div className="absolute top-2 right-2 z-10">
                      {nft.type === "randomized" && (
                        <span className="px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold rounded-full shadow-lg">
                          🎲 RANDOM
                        </span>
                      )}
                      {nft.type === "geofenced" && (
                        <span className="px-2 py-1 bg-gradient-to-r from-green-500 to-blue-500 text-white text-xs font-semibold rounded-full shadow-lg">
                          📍 LOCATION
                        </span>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ) : null}

        {/* No Assets Message - Only show if no mixed NFTs */}
        {!isLoadingMinted && mixedNFTs.length === 0 && (
          <div className="mt-12">
            <div className="flex flex-col items-center justify-center min-h-52 space-y-4">
              <Frown className="w-24 h-24 text-blue-600 animate-bounce" />
              <p className="text-xl text-gray-400 font-semibold">
                This Collection does not have any assets yet.
              </p>
              <p className="text-sm text-gray-500">
                Check back later or explore other collections.
              </p>
            </div>
          </div>
        )}
      </div>

      <CustomNftModal
        isOpen={isModalOpen}
        nftCollectionAddress={collectionAddress || ""}
        collectionOwnerAddress={collectionAddress || ""}
        onClose={closeModal}
        onMintSuccess={() => {
          // Refresh the collection NFTs after successful mint
          fetchCollectionNFTs(collectionAddress);
          // Also refresh the page data to ensure everything updates
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }}
      />
    </div>
  );
}
