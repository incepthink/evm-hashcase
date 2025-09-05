"use client";

import Image from "next/image";
import ArrowW from "@/assets/images/arrowW.svg";
import ArrowB from "@/assets/images/arrowB.svg";
import Eye from "@/assets/images/eye_Icon.png";
import { Work_Sans } from "next/font/google";
import notify, { notifyPromise, notifyResolve } from "@/utils/notify";
import EyeW from "@/assets/eye-white.svg";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import React from "react";
import Link from "next/link";

import { useZkLogin } from "@mysten/enoki/react";

import { useSponsorSignAndExecute } from "../../hooks/useSponsorSignandExecute";

import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";

import axiosInstance from "@/utils/axios";
import axios from "axios";
import UnlockableNft from "./UnlockableNft";
import MintSuccessModal from "./MintSuccessModal";
import { useGlobalAppStore } from "@/store/globalAppStore";

import {
  Globe,
  MapPin,
  RefreshCw,
  ArrowLeft,
  MapPinOff,
  Compass,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface Metadata {
  id: string;
  title: string;
  name: string;
  description: string;
  animation_url: string;
  image_url: string;
  collection_id: number;
  token_uri: string;
  attributes?: string;
  collection_name?: string;
  collection_address?: string;
  latitude?: string;
  longitude?: string;
}

interface EmittedNFTInfo {
  collection_id: string;
  creator: string;
  mint_price: string;
  nft_id: string;
  recipient: string;
  token_number: string;
}

interface AvailableNFT {
  id: string;
  title: string;
  name: string;
  description: string;
  image_url: string;
  type: 'randomized' | 'geofenced';
}

type Coordinates = {
  latitude: number;
  longitude: number;
};

const workSans = Work_Sans({ subsets: ["latin"] });

const mainnet_loyalty =
  process.env.MAINNET_LOYALTY_PACKAGE_ID ||
  "0xbdfb6f8ad73a073b500f7ba1598ddaa59038e50697e2dc6e9dedb55af7ae5b49";

export default function NFTPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [nftData, setNftData] = useState<Metadata | null>(null);
  const [availableNFTs, setAvailableNFTs] = useState<AvailableNFT[]>([]);
  const [currentNFTIndex, setCurrentNFTIndex] = useState(0);
  const [preloadedImages, setPreloadedImages] = useState<Set<string>>(new Set());

  const [isLocked, setIsLocked] = useState(true);
  const [location, setLocation] = useState<Coordinates>({
    latitude: -1,
    longitude: -1,
  });
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);

  const [loading, setLoading] = useState(true);
  const [minting, setMinting] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // states for the modal for showing minting success
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  //needed for the NFT modal to function
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const { address } = useZkLogin();
  const { sponsorSignAndExecute } = useSponsorSignAndExecute();

  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecuteTransaction } =
    useSignAndExecuteTransaction();

  const { userWalletAddress } = useGlobalAppStore();



  // Preload images for faster navigation
  const preloadImage = React.useCallback((imageUrl: string) => {
    if (!preloadedImages.has(imageUrl)) {
      const img = new window.Image();
      img.src = imageUrl;
      img.onload = () => {
        setPreloadedImages(prev => new Set(prev).add(imageUrl));
      };
    }
  }, [preloadedImages]);

  // Preload all available NFT images
  React.useEffect(() => {
    availableNFTs.forEach(nft => {
      if (nft.image_url) {
        preloadImage(nft.image_url);
      }
    });
  }, [availableNFTs, preloadImage]);

  // Navigation functions for randomly selecting NFTs - ultra fast performance with enhanced security
  const navigateToRandomNFT = React.useCallback(() => {
    if (availableNFTs.length <= 1) return;
    
    // Use crypto.getRandomValues for cryptographically secure randomization
    const randomBuffer = new Uint32Array(1);
    crypto.getRandomValues(randomBuffer);
    
    // Generate a random index, but avoid the current one
    let randomIndex;
    do {
      randomIndex = randomBuffer[0] % availableNFTs.length;
      // If we need another random number, generate it
      if (randomIndex === currentNFTIndex && availableNFTs.length > 1) {
        crypto.getRandomValues(randomBuffer);
      }
    } while (randomIndex === currentNFTIndex && availableNFTs.length > 1);
    
    setCurrentNFTIndex(randomIndex);
    const randomNFT = availableNFTs[randomIndex];
    
    // Reset image loading state for new image
    setImageLoading(true);
    
    // Update the NFT data immediately without any delays
    setNftData(prevData => prevData ? {
      ...prevData,
      id: randomNFT.id,
      title: randomNFT.title,
      name: randomNFT.name,
      description: randomNFT.description || 'A unique randomized NFT from HashCase Collection',
      image_url: randomNFT.image_url,
    } : null);
  }, [availableNFTs, currentNFTIndex]);

  // Both arrows now do the same thing - randomly select an NFT
  const navigateToNextNFT = navigateToRandomNFT;
  const navigateToPreviousNFT = navigateToRandomNFT;

  // Fetch available NFTs for navigation
  const fetchAvailableNFTs = async (collectionId: number) => {
    try {
      const nftType = searchParams.get('type');
      
      if (nftType === 'randomized') {
        // Fetch randomized metadata sets (no location dependency)
        const randomizedResponse = await axiosInstance.get(
          "/platform/metadata-set/by-collection",
          { params: { collection_id: collectionId } }
        );

        const available: AvailableNFT[] = [];

        // Add randomized NFTs
        if (randomizedResponse.data.metadataSets) {
          randomizedResponse.data.metadataSets.forEach((set: any) => {
            available.push({
              id: `rand-${set.id}`,
              title: set.name,
              name: set.name,
              description: set.Collection.description || 'Randomized NFT',
              image_url: set.Collection.image_uri,
              type: 'randomized'
            });
          });
        }

        setAvailableNFTs(available);
        
        // Find current NFT index
        const currentId = Array.isArray(params.metadata_id) ? params.metadata_id[0] : params.metadata_id;
        
        // If it's a collection-level random NFT, start with the first one
        if (currentId?.startsWith('rand-collection-')) {
          setCurrentNFTIndex(0);
        } else {
          const currentIndex = available.findIndex(nft => nft.id === currentId);
          setCurrentNFTIndex(currentIndex >= 0 ? currentIndex : 0);
        }
      }
    } catch (error) {
      console.error("Error fetching available NFTs:", error);
    }
  };

  useEffect(() => {
    if (params.metadata_id) {
      fetchNFTData();
    }
  }, [params.metadata_id, location]);

  const fetchNFTData = async () => {
    try {
      // Check if the ID looks like an NFT address (starts with 0x and is 64+ characters)
      const metadataId = Array.isArray(params.metadata_id) ? params.metadata_id[0] : params.metadata_id;
      const isNFTAddress = metadataId?.startsWith('0x') && metadataId.length > 60;
      const nftType = searchParams.get('type');
      
      // For randomized NFTs, we don't need location - they're already unlocked
      if (nftType === 'randomized') {
        setIsLocked(false);
      }
      
      // For geolocation NFTs, we need to check location
      if (nftType === 'geofenced') {
        // Check if location is enabled and get current position
        if (!isLocationEnabled) {
          const locationEnabled = await getLocationData();
          if (!locationEnabled) {
            setIsLocked(true);
            return;
          }
        }
        
        // Verify the user is within the geofence for this specific NFT
        if (location.latitude !== -1 && location.longitude !== -1) {
          try {
            const geofencedResponse = await axiosInstance.get(
              "/platform/metadata/geo-fenced",
              {
                params: {
                  user_lat: location.latitude,
                  user_lon: location.longitude,
                  collection_id: 1, // Assuming collection ID 1
                },
              }
            );
            
            // Check if the current NFT is in the geofenced results
            const geofencedNFTs = geofencedResponse.data.data || [];
            const currentNFTInGeofence = geofencedNFTs.find((nft: any) => 
              nft.id.toString() === metadataId?.replace('geo-', '')
            );
            
            if (currentNFTInGeofence) {
              setIsLocked(false);
              setNftData({
                id: currentNFTInGeofence.id,
                title: currentNFTInGeofence.title,
                name: currentNFTInGeofence.title,
                description: currentNFTInGeofence.description || 'A location-specific NFT',
                image_url: currentNFTInGeofence.image_url,
                animation_url: "",
                collection_id: currentNFTInGeofence.collection_id,
                token_uri: "",
                collection_name: "HashCase Collection",
                collection_address: "0x79e4f927919068602bae38387132f8c0dd52dc3207098355ece9e9ba61eb2290",
              });
            } else {
              setIsLocked(true);
              return;
            }
          } catch (error) {
            console.error("Error checking geofence:", error);
            setIsLocked(true);
            return;
          }
        } else {
          setIsLocked(true);
          return;
        }
      }
      
      // Handle randomized NFTs using the same approach as collection page
      if (nftType === 'randomized') {
        try {
          // Handle specific random NFT ID (from collection page)
          if (metadataId && (metadataId.startsWith('0x') || metadataId.startsWith('rand-'))) {
            console.log("Fetching specific random NFT:", metadataId);
            
            // Fetch minted NFTs to get the actual random NFTs from blockchain
            const mintedResponse = await axiosInstance.get(
              "/platform/sui/nfts/by-collection",
              { params: { collection_id: "0x79e4f927919068602bae38387132f8c0dd52dc3207098355ece9e9ba61eb2290" } }
            );

            console.log("Minted NFTs response:", mintedResponse.data);

            const allRandomNFTs: any[] = [];

            // Add minted random NFTs (same filtering logic as collection page)
            if (mintedResponse.data.success && mintedResponse.data.data && mintedResponse.data.data.nfts) {
              const randomMintedNFTs = mintedResponse.data.data.nfts.filter((nft: any) => {
                const isRandom = nft.name?.toLowerCase().includes('random') || 
                               nft.name?.toLowerCase().includes('drop') ||
                               nft.description?.toLowerCase().includes('randomized');
                // Filter out Random Drop #4
                const isNotRandomDrop4 = nft.name !== "Random Drop #4";
                return isRandom && isNotRandomDrop4;
              });

              console.log("Found random NFTs:", randomMintedNFTs);

              randomMintedNFTs.forEach((nft: any) => {
                allRandomNFTs.push({
                  id: nft.id,
                  title: nft.name,
                  name: nft.name,
                  description: nft.description || 'Randomized NFT',
                  image_url: nft.image_url,
                  type: 'minted',
                  originalData: nft
                });
              });
            }

            if (allRandomNFTs.length > 0) {
              // Find the specific NFT that was clicked
              const clickedNFT = allRandomNFTs.find(nft => nft.id === metadataId);
              const currentNFT = clickedNFT || allRandomNFTs[0];
              
              const finalNftData = {
                id: currentNFT.id,
                title: currentNFT.title,
                name: currentNFT.name,
                description: currentNFT.description || 'A unique randomized NFT from HashCase Collection',
                image_url: currentNFT.image_url,
                animation_url: "",
                collection_id: 0,
                token_uri: "",
                collection_name: "HashCase Collection",
                collection_address: "0x79e4f927919068602bae38387132f8c0dd52dc3207098355ece9e9ba61eb2290",
              };

              setIsLocked(false);
              setNftData(finalNftData);
              
              // Set available NFTs for navigation
              setAvailableNFTs(allRandomNFTs);
              setCurrentNFTIndex(allRandomNFTs.findIndex(nft => nft.id === currentNFT.id));
              return;
            }
          } else {
            // Handle individual randomized NFT (same as collection page metadata sets)
            const actualMetadataId = metadataId?.replace('rand-', '') || '';
            const randomizedResponse = await axiosInstance.get(
              "/platform/metadata-set/by-id",
              { params: { metadata_set_id: actualMetadataId } }
            );

            if (randomizedResponse.data.metadataSet) {
              const set = randomizedResponse.data.metadataSet;
              const finalNftData = {
                id: `rand-${set.id}`,
                title: set.name,
                name: set.name,
                description: set.Collection.description || 'Randomized NFT',
                image_url: set.Collection.image_uri,
                animation_url: "",
                collection_id: set.Collection.id,
                token_uri: "",
                collection_name: set.Collection.name,
                collection_address: set.Collection.contract?.contract_address,
              };

              setIsLocked(false);
              setNftData(finalNftData);
              
              // Fetch available NFTs for navigation
              await fetchAvailableNFTs(set.Collection.id);
              return;
            }
          }
        } catch (randomizedError) {
          console.error("Error fetching randomized NFT:", randomizedError);
          // For randomized NFTs, even if there's an error, we should show a fallback
          // instead of locking the content
          const fallbackNftData = {
            id: metadataId || "",
            title: "Random NFT",
            name: "Random NFT",
            description: "A randomized NFT from this collection",
            image_url: "https://via.placeholder.com/300",
            animation_url: "",
            collection_id: 0,
            token_uri: "",
            collection_name: "HashCase Collection",
            collection_address: "0x79e4f927919068602bae38387132f8c0dd52dc3207098355ece9e9ba61eb2290",
          };
          setIsLocked(false);
          setNftData(fallbackNftData);
          return;
        }
      }
      
      if (isNFTAddress) {
        // If it's an NFT address, try to get the NFT data from the collection
        try {
          // Use the same approach as the collections page - fetch all NFTs from the collection
          const actualCollectionAddress = "0x79e4f927919068602bae38387132f8c0dd52dc3207098355ece9e9ba61eb2290";
          
          const response = await axiosInstance.get(
            "/platform/sui/nfts/by-collection",
            {
              params: {
                collection_id: actualCollectionAddress,
              },
            }
          );

          if (response.data.success && response.data.data && response.data.data.nfts) {
            // Find the specific NFT by ID
            const nft = response.data.data.nfts.find((nft: any) => nft.id === metadataId);
            
            if (nft) {
              const finalNftData = {
                id: nft.id,
                title: nft.name || 'Unknown NFT',
                name: nft.name || 'Unknown NFT',
                description: nft.description || 'No description',
                image_url: nft.image_url || 'https://via.placeholder.com/300',
                animation_url: "",
                collection_id: nft.collection_id || actualCollectionAddress,
                token_uri: "",
                collection_name: "HashCase Collection",
                collection_address: nft.collection_id || actualCollectionAddress,
              };

              setIsLocked(false);
              setNftData(finalNftData);
              return;
            }
          }
          
          // If NFT not found in collection, show fallback data
          setIsLocked(false);
          setNftData({
            id: metadataId || "",
            title: `NFT ${metadataId?.slice(0, 8) || "Unknown"}...`,
            name: `NFT ${metadataId?.slice(0, 8) || "Unknown"}...`,
            description: "This is an existing NFT on the blockchain",
            image_url: "https://via.placeholder.com/300",
            animation_url: "",
            collection_id: 0,
            token_uri: "",
          });
          return;
        } catch (nftError) {
          console.log("Could not fetch NFT data from collection:", nftError);
          // For NFT addresses, if we can't fetch metadata, we should still allow access
          // Don't fall back to geofenced logic for NFT addresses
          setIsLocked(false);
          setNftData({
            id: metadataId || "",
            title: `NFT ${metadataId?.slice(0, 8) || "Unknown"}...`,
            name: `NFT ${metadataId?.slice(0, 8) || "Unknown"}...`,
            description: "This is an existing NFT on the blockchain",
            image_url: "https://via.placeholder.com/300",
            animation_url: "",
            collection_id: 0,
            token_uri: "",
          });
          return;
        }
      }


      
      const locationPermission = await checkLocationPermissions();

      if (locationPermission == true) {
        console.log("🔍 Geofencing Check:");
        console.log("   User Location:", { lat: location.latitude, lon: location.longitude });
        
        const itemData = await axiosInstance.get(
          "/platform/metadata/geofenced-by-id",
          {
            params: {
              metadata_id: metadataId,
              user_lat: location.latitude,
              user_lon: location.longitude,
            },
          }
        );

        const { metadata_instance } = itemData.data;

        console.log("   NFT Location:", { 
          lat: metadata_instance?.latitude, 
          lon: metadata_instance?.longitude 
        });
        console.log("   Metadata Instance:", metadata_instance);

        if (metadata_instance == null) {
          setIsLocked(true);
        } else {
          const finalNftData = {
            ...metadata_instance,
            collection_id: metadata_instance.collection.id,
            collection_name: metadata_instance.collection.name,
            collection_address:
              metadata_instance?.collection?.contract?.contract_address,
          };

          console.log("FINAL NFT DTA");
          console.log(finalNftData);

          setIsLocked(false);
          setNftData(finalNftData);
          
          // Fetch available NFTs for navigation
          await fetchAvailableNFTs(metadata_instance.collection.id);
        }
      } else {
        const itemData = await axiosInstance.get(
          "/platform/metadata/geofenced-by-id",
          {
            params: {
              metadata_id: metadataId,
            },
          }
        );

        const { metadata_instance } = itemData.data;
        console.log(metadata_instance);

        console.log("THIS IS METADATA INSTANCE");
        console.log(metadata_instance);

        if (metadata_instance == null) {
          setIsLocked(true);
        } else {
          const finalNftData = {
            ...metadata_instance,
            collection_id: metadata_instance.collection.id,
            collection_name: metadata_instance.collection.name,
            collection_address:
              metadata_instance?.collection?.contract?.contract_address,
          };

          setIsLocked(false);
          setNftData(finalNftData);
          
          // Fetch available NFTs for navigation
          await fetchAvailableNFTs(metadata_instance.collection.id);
        }
      }
    } catch (error) {
      console.error(error);
      setIsLocked(true);
    } finally {
      setLoading(false);
    }
  };

  const checkLocationPermissions = async () => {
    try {
      if (!navigator.permissions) {
        return false;
      }

      const permissionStatus = await navigator.permissions.query({
        name: "geolocation",
      });

      return permissionStatus.state === "granted";
    } catch (error) {
      console.error("Error checking location permissions:", error);
      return false;
    }
  };

  function getCurrentPosition(): Promise<Coordinates> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position: GeolocationPosition) => {
          const { latitude, longitude } = position.coords;
          resolve({ latitude, longitude });
        },
        (error: GeolocationPositionError) => {
          reject(error);
        }
      );
    });
  }

  const getLocationData = async (): Promise<boolean> => {
    try {
      const { latitude, longitude } = await getCurrentPosition();
      setLocation({ latitude, longitude });
      setIsLocationEnabled(true);
      return true;
    } catch (err: unknown) {
      const anyErr = err as any;
      const code = typeof anyErr?.code === "number" ? anyErr.code : undefined;
      console.warn("Location error:", anyErr?.message || "Unknown error");
      if (code === 1) {
        alert("Location access denied. Please allow location access in your browser settings and try again.");
      } else if (code === 2) {
        alert("Location unavailable. Please check your device's location services and try again.");
      } else if (code === 3) {
        alert("Location request timed out. Please try again.");
      }
      setIsLocationEnabled(false);
      return false;
    }
  };

  const handleGetCurrentPositionAndPageRefresh = async () => {
    try {
      const currentLocation = await getCurrentPosition();
      setLocation(currentLocation);
      await fetchNFTData();
    } catch (error) {
      console.error(error);
      setIsLocked(true);
    }
  };

  const handleGaslessMintAndTransfer = async () => {
    if (!nftData) return;

    // Check if user is connected
    if (!currentAccount?.address) {
      notify("Please connect your wallet first", "error");
      return;
    }

    setMinting(true);
    const notifyId = notifyPromise(
      "Minting NFT... this might take some time...",
      "info"
    );

    console.log("NFT DATA", nftData);
    console.log("CURRENT ACCOUNT", currentAccount);
    console.log("USER WALLET ADDRESS", userWalletAddress);
    console.log("ADDRESS", address);
    console.log("SPONSOR SIGN AND EXECUTE", sponsorSignAndExecute);
    try {
      const nftForm = {
        collection_id: "0x79e4f927919068602bae38387132f8c0dd52dc3207098355ece9e9ba61eb2290", // Use new collection ID
        title: nftData.title,
        description: nftData.description || "",
        image_url: nftData.image_url,
        attributes: nftData.attributes || "",
      };

      console.log("Minting NFT with data:", {
        userAddress: currentAccount.address,
        nftForm
      });

      // Use the platform minting endpoint that doesn't require authentication
      const mintAndTransferResponse = await axiosInstance.post(
        "/platform/sui/mint-nft",
        {
          collection_id: nftData?.collection_address || "0x79e4f927919068602bae38387132f8c0dd52dc3207098355ece9e9ba61eb2290",
          name: nftData?.name || "HashCase NFT",
          description: nftData?.description || "A unique HashCase NFT",
          image_url: nftData?.image_url || "https://via.placeholder.com/300",
          attributes: [],
          recipient: currentAccount.address,
        }
      );

      notifyResolve(notifyId, "NFT Minted Successfully! Please Check Your Wallet", "success");

      console.log("Mint response:", mintAndTransferResponse.data);
      
      // Show success modal
      setShowSuccessModal(true);

    } catch (error: any) {
      console.error("Minting error:", error);
      
      let errorMessage = "Error minting NFT";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      notifyResolve(notifyId, errorMessage, "error");
    } finally {
      setMinting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[70vh] max-w-screen bg-[#00041F] flex justify-center items-center text-center">
        <div className="text-center">
          <svg
            className="animate-spin h-12 w-12 text-blue-500 mx-auto mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="text-white text-lg">Loading NFT data...</p>
        </div>
      </div>
    );
  }

  if (isLocked) {
    if (location.latitude == -1 && location.longitude == -1)
      return (
        <div className="h-[80vh] max-w-screen bg-[#00041F] text-white flex flex-col items-center justify-center p-6 text-center gap-5">
          <div className="relative">
            <MapPin className="w-16 h-16  text-red-500 animate-bounce" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-blue-100">
              Location Restricted
            </h2>
            <p className="text-blue-300">
              Location permissions are required to verify eligibility.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleGetCurrentPositionAndPageRefresh}
              className="px-4 py-2 bg-[#4DA2FF] hover:bg-blue-700 rounded-md flex items-center gap-2 transition-colors"
            >
              <Globe className="w-4 h-4" />
              Grant Location Permissions
            </button>
          </div>
        </div>
      );
    else
      return (
        <div className="h-[80vh] max-w-screen bg-[#00041F] text-white flex flex-col items-center justify-center p-6 text-center gap-6">
          {/* Animated icon with gradient */}
          <div className="relative">
            <Globe className="w-16 h-16 text-blue-400 animate-pulse" />
            <MapPinOff className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-red-500" />
          </div>

          {/* Main message */}
          <div className="space-y-3 max-w-md">
            <h3 className="text-2xl font-bold text-blue-100 flex items-center justify-center gap-2">
              <Compass className="w-6 h-6" />
              Location Restricted
            </h3>
            <p className="text-red-300 text-lg">
              This NFT is not accessible in your current region
            </p>
            <p className="text-blue-300 text-sm">
              You need to be within 15km of the NFT&apos;s location to access it
            </p>
            <p className="text-yellow-300 text-xs">
              Your location: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
            </p>
          </div>
        </div>
      );
  }

  if (!nftData) return <div>NFT not found.</div>;

  return (
    <div className={`flex flex-col bg-[#00041F] ${workSans.className}`}>
      <div className="flex flex-col px-6 md:px-10 max-w-6xl mx-auto w-full">
        <Link
          href={`/collection/${nftData?.collection_address || '0x79e4f927919068602bae38387132f8c0dd52dc3207098355ece9e9ba61eb2290'}`}
          className="hidden md:flex items-center justify-start gap-x-2 my-4"
        >
          <ArrowW />
          <p className="text-2xl text-white/70">back</p>
        </Link>
        <div className="my-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* NFT Image with Navigation */}
          <div className="relative flex justify-center lg:justify-start">
            <div className="relative w-full max-w-md lg:max-w-lg xl:max-w-xl">
              {/* Loading Spinner */}
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800 rounded-2xl z-10">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                </div>
              )}
              
              <img
                className="w-full h-auto rounded-2xl transition-opacity duration-300 shadow-2xl border border-white/10"
                src={nftData.image_url}
                alt="nft"
                style={{ 
                  opacity: imageLoading ? 0 : 1 
                }}
                onLoad={() => {
                  setImageLoading(false);
                  preloadImage(nftData.image_url);
                }}
                onError={() => setImageLoading(false)}
              />
            </div>
            
            {/* Navigation Arrows - Only show if there are multiple NFTs available */}
            {availableNFTs.length > 1 && (
              <>
                {/* Previous Arrow */}
                <button
                  onClick={navigateToPreviousNFT}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200 backdrop-blur-sm"
                  title="Previous NFT"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                
                {/* Next Arrow */}
                <button
                  onClick={navigateToNextNFT}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200 backdrop-blur-sm"
                  title="Next NFT"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
                
                {/* NFT Counter */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                  {currentNFTIndex + 1} / {availableNFTs.length}
                </div>
              </>
            )}
          </div>

                      <div className="flex flex-col items-start justify-center w-full">
              <div className="flex flex-col justify-start gap-y-6 my-8 w-full">
                <div className="flex items-center gap-4 flex-wrap">
                  <p className="text-white md:text-5xl text-3xl tracking-wide font-bold">
                    {nftData.name}
                  </p>
                  {searchParams.get('type') === 'randomized' && (
                    <span className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold rounded-full shadow-lg">
                      🎲 RANDOM
                    </span>
                  )}
                </div>
                <p className="text-white md:text-xl text-base">
                  By <span className="text-[#4DA2FF] font-semibold">{nftData.collection_name}</span>
                </p>
              </div>

            <div className="flex items-start my-6">
              <p className="md:text-xl text-base text-white leading-relaxed max-w-2xl">
                {nftData.description}
              </p>
            </div>

            

            <div className="flex flex-col gap-6 items-start mt-6 w-full">
              <button
                onClick={handleGaslessMintAndTransfer}
                disabled={minting}
                className="md:px-8 md:py-4 px-6 py-3 rounded-full md:text-xl text-sm bg-white text-black border-[1px] border-b-4 border-[#4DA2FF] flex items-center gap-x-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {minting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Minting...
                  </>
                ) : (
                  <>
                    Mint NFT
                    <ArrowB />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
        <hr className="my-8 bg-gradient-to-r from-transparent via-white to-transparent opacity-20" />
        <div className="flex items-center justify-center mb-6">
          <div className="bg-[#1A1D35] rounded-lg p-4 w-full text-center text-white md:text-2xl text-lg font-semibold">
            <p>
              The above NFT holds{" "}
              <span className="text-[#4DA2FF]"> 20 loyalty point(s).</span>{" "}
              You can receive additional loyalty points from this owner by
              completing the tasks below.
            </p>
          </div>
        </div>
        <p className="text-center md:text-2xl text-lg font-semibold mb-4 text-white">
          2 Task
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-12">
          <div className="bg-[#1A1D35] p-4 md:p-6 w-full flex items-center justify-between rounded-lg">
            <div>
              <p className="md:text-2xl text-lg text-left mb-2 font-semibold capitalize text-white">
                Follow On Twitter
              </p>
              <p className="text-white/50 md:text-lg text-sm mt-2">
                Get 20 Points
              </p>
            </div>
            <div className="flex items-end justify-center">
              <div className="bg-[#FAD64A1A] p-2 rounded-full flex items-center justify-center md:text-lg text-sm text-[#F8924F]">
                Pending
              </div>
            </div>
          </div>
          <div className="bg-[#1A1D35] p-4 md:p-6 w-full flex items-center justify-between rounded-lg">
            <div>
              <p className="md:text-2xl text-lg text-left mb-2 font-semibold capitalize text-white">
                Post A Tweet
              </p>
              <p className="text-white/50 md:text-lg text-sm mt-2">
                Get 20 Points
              </p>
            </div>
            <div className="flex items-end justify-end">
              <div className="bg-[#FAD64A1A] p-2 rounded-full flex items-center justify-center md:text-lg text-sm text-[#F8924F]">
                Pending
              </div>
            </div>
          </div>
        </div>
      </div>
      <UnlockableNft isOpen={isModalOpen} closeModal={closeModal} />
      {showSuccessModal && (
        <MintSuccessModal
          onClose={() => setShowSuccessModal(false)}
          nftData={nftData}
        />
      )}
    </div>
  );
}
