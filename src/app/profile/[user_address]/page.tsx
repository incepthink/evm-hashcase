"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { usePrivy } from "@privy-io/react-auth";
import "./page.css";
import { MdEdit } from "react-icons/md";

import axiosInstance from "@/utils/axios";
import Link from "next/link";
import { useGlobalAppStore } from "@/store/globalAppStore";
import UpdateProfileModal from "./UpdateProfileModal";
import ConnectButton from "@/components/ConnectButton";
import Image from "next/image";
import NftCard from "@/components/NftCard";
import { toast } from "react-hot-toast";
import backgroundImageHeroSection from "@/assets/images/high_rise.jpg";

interface FetchedNFT {
  id: number;
  user_id: number;
  name: string;
  description: string;
  image_uri: string;
  collection_id: number;
  token_id: number;
  type: string;
  status: string;
  priority: number;
  attributes: string; // JSON string
  metadata_id: number | null;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

const App: React.FC = () => {
  const [userData, setUserData] = useState({
    profile_image:
      "https://i.pinimg.com/564x/49/cc/10/49cc10386c922de5e2e3c0bb66956e65.jpg",
    banner_image:
      "https://i.pinimg.com/564x/49/cc/10/49cc10386c922de5e2e3c0bb66956e65.jpg",
    description: "",
    user_id: "",
    username: "",
    nfts: 0,
  });

  const [collections, setCollections] = useState([]);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [fetchedNfts, setFetchedNfts] = useState<FetchedNFT[]>([]);

  // EVM and Privy wallet connections
  const { address: evmAddress } = useAccount();
  const { authenticated: privyAuthenticated, user: privyUser } = usePrivy();

  const router = useRouter();
  const params = useParams();
  const userAddressFromUrl = Array.isArray(params?.user_address)
    ? params?.user_address[0]
    : (params?.user_address as string | undefined);

  // needing for updating profile
  const [showModal, setShowModal] = useState(false);
  // Share profile modal
  const [showShareModal, setShowShareModal] = useState(false);

  const handleNFTClick = (nft: FetchedNFT) => {
    // Redirect to the dedicated NFT page
    router.push(`/loyalties/${nft.collection_id}`);
  };

  // Get the current user's wallet address (EVM or Privy)
  const getConnectedWalletAddress = (): string | null => {
    if (evmAddress) return evmAddress;
    if (privyAuthenticated && privyUser?.wallet?.address)
      return privyUser.wallet.address;
    return null;
  };

  // Use the URL address if present so shared profiles remain stable; fall back to connected wallet
  const userAddress = userAddressFromUrl || getConnectedWalletAddress() || "";

  // Local UI state for Owned NFTs toolbar
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<
    "recent" | "name_asc" | "name_desc"
  >("recent");
  const [density, setDensity] = useState<"comfortable" | "compact">(
    "comfortable"
  );

  console.log("PROFILE_DEBUG: Wallet states:", {
    evmAddress,
    privyAuthenticated,
    privyWalletAddress: privyUser?.wallet?.address,
    userAddressFromUrl,
    finalUserAddress: userAddress,
    connectedAddress: getConnectedWalletAddress(),
  });

  const fetchNfts = async () => {
    try {
      const { data } = await axiosInstance.get(
        "/user/nfts?userAddress=" + userAddress
      );
      console.log("PROFILE_DEBUG: Fetched NFTs:", data);
      setFetchedNfts(data.nfts || []);
    } catch (error) {
      console.error("PROFILE_DEBUG: Error fetching NFTs:", error);
      setFetchedNfts([]);
    }
  };

  useEffect(() => {
    fetchNfts();
  }, []);

  const { isUserVerified } = useGlobalAppStore();

  useEffect(() => {
    const getCollectionNames = async () => {
      try {
        // Changed from "/platform/collections-sui" to "/platform/collections"
        const axiosResponse = await axiosInstance.get("/platform/collections");
        const collections =
          axiosResponse.data.collections ||
          axiosResponse.data.suiCollections ||
          [];
        console.log("PROFILE_DEBUG: Fetched collections:", collections);
        setCollections(collections);
      } catch (error) {
        console.error("PROFILE_DEBUG: Error fetching collections:", error);
        setCollections([]);
      }
    };

    getCollectionNames();

    // Load user profile data for public viewing (no wallet required)
    if (userAddressFromUrl) {
      getDatabase()
        .catch((err) => {
          if (err?.response?.status === 401) {
            console.warn(
              "PROFILE_DEBUG: Unauthorized fetching /user; using default profile data"
            );
          } else {
            console.error("PROFILE_DEBUG: Failed to load /user:", err);
          }
        })
        .finally(() => {
          setIsProfileLoading(false);
        });
    } else {
      setIsProfileLoading(false);
    }
  }, [userAddressFromUrl]);

  const getDatabase = async () => {
    try {
      const response = await axiosInstance.get(
        "/user?userAddress=" + userAddress
      );
      console.log("PROFILE_DEBUG: User data response:", response.data);

      const user = response.data.user;

      const newUserData = {
        profile_image:
          user.profile_image ||
          "https://i.pinimg.com/564x/49/cc/10/49cc10386c922de5e2e3c0bb66956e65.jpg",
        banner_image:
          user.banner_image ||
          "https://i.pinimg.com/564x/49/cc/10/49cc10386c922de5e2e3c0bb66956e65.jpg",
        description: user.description || "Hello, I am using Hashcase",
        user_id: user.id,
        username: user.username,
        nfts: 0,
      };

      setUserData(newUserData);
    } catch (error) {
      console.error("PROFILE_DEBUG: Error fetching user data:", error);
    }
  };

  const handleUpdateProfile = () => {
    getDatabase();
    // You might want to add additional logic here like showing a success message
  };

  const handleShareProfile = async () => {
    const profileUrl = window.location.href;
    try {
      await navigator.clipboard.writeText(profileUrl);
      toast.success("Profile link copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy link:", error);
      toast.error("Failed to copy link");
    }
  };

  // Check if user is viewing their own profile
  const isOwnProfile = () => {
    const connectedAddress = getConnectedWalletAddress();
    return connectedAddress === userAddress;
  };

  // Check if user has any wallet connected
  const isWalletConnected = () => {
    return !!(evmAddress || (privyAuthenticated && privyUser?.wallet?.address));
  };

  // Get wallet type for display
  const getWalletType = (): "EVM" | "Google" | null => {
    if (evmAddress) return "EVM";
    if (privyAuthenticated && privyUser?.wallet?.address) return "Google";
    return null;
  };

  // Show loading spinner while profile data is being fetched
  if (isProfileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#00041f] to-[#030828] flex items-center justify-center text-white">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin mb-4"></div>
          <h2 className="text-xl font-semibold">Loading Profile</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-gradient-to-b from-[#00041f] to-[#030828] text-white pb-10">
      {/* Banner Image Background */}
      <div className="relative w-full h-[200px]">
        <Image
          src={
            userData.banner_image ||
            "https://i.pinimg.com/564x/49/cc/10/49cc10386c922de5e2e3c0bb66956e65.jpg"
          }
          alt="Banner"
          fill
          className="object-cover"
          priority
        />
        {/* Overlay to mute the banner */}
        <div className="absolute inset-0 bg-black/50 z-10" />
      </div>

      {/* Profile Section */}
      {isWalletConnected() ? (
        <div className="relative z-20 flex flex-col items-center -mt-16">
          {/* Profile Image */}
          <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white z-20">
            <Image
              src={
                userData.profile_image ||
                "https://i.pinimg.com/564x/49/cc/10/49cc10386c922de5e2e3c0bb66956e65.jpg"
              }
              alt="Profile"
              width={128}
              height={128}
              className="object-cover w-full h-full"
            />
          </div>

          {/* User Info */}
          <div className="text-center mt-4">
            <h2 className="text-xl font-semibold">{userData.username}</h2>
            <p className="text-blue-400 text-sm">{userData.description}</p>
            {isWalletConnected() && (
              <p className="text-white/60 text-xs mt-1">
                Connected with {getWalletType()} wallet
              </p>
            )}
          </div>

          {/* Action Buttons - Only show if viewing own profile */}
          {isOwnProfile() && (
            <div className="mt-2 flex items-center gap-3">
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center text-white text-sm font-medium hover:underline"
              >
                Edit Profile
                <MdEdit className="ml-1 text-blue-400 text-lg" />
              </button>
              <button
                onClick={() => setShowShareModal(true)}
                className="flex items-center text-white text-sm font-medium hover:underline"
              >
                Share Profile
                <svg
                  className="ml-1 w-4 h-4 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342A3 3 0 109 12c0-.482-.114-.938-.316-1.342m0 2.684l6.632 3.316m-6.632-6l6.632-3.316"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="relative z-20 flex flex-col items-center -mt-16">
          {/* Profile Image */}
          <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white z-20">
            <Image
              src={
                userData.profile_image ||
                "https://i.pinimg.com/564x/49/cc/10/49cc10386c922de5e2e3c0bb66956e65.jpg"
              }
              alt="Profile"
              width={128}
              height={128}
              className="object-cover w-full h-full"
            />
          </div>

          {/* User Info */}
          <div className="text-center mt-4">
            <h2 className="text-xl font-semibold">{userData.username}</h2>
            <p className="text-blue-400 text-sm">{userData.description}</p>
            <p className="text-white/60 text-sm mt-2">Public Profile</p>
          </div>

          {/* Connect Wallet Button for non-connected users */}
          <div className="mt-4 flex items-center gap-3">
            <ConnectButton />
            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center text-white text-sm font-medium hover:underline"
            >
              Share Profile
              <svg
                className="ml-1 w-4 h-4 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342A3 3 0 109 12c0-.482-.114-.938-.316-1.342m0 2.684l6.632 3.316m-6.632-6l6.632-3.316"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="p-8 max-w-[1600px] mx-auto">
        <>
          <h1 className="text-4xl font-bold text-center mb-3">Owned NFTs</h1>
          <div className="flex flex-col items-center gap-2 mb-6">
            <p className="flex flex-col text-white/60 text-xs sm:text-sm break-all mb-4 mt-2">
              Address:{" "}
              <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10 text-white/70">
                {userAddress || "Not connected"}
              </span>
              {getConnectedWalletAddress() &&
                userAddressFromUrl &&
                getConnectedWalletAddress() !== userAddressFromUrl && (
                  <span className="ml-2 flex justify-center mt-2 text-xs text-blue-400">
                    (Viewing shared profile; connected as{" "}
                    {getConnectedWalletAddress()?.slice(0, 6)}...
                    {getConnectedWalletAddress()?.slice(-4)})
                  </span>
                )}
            </p>
            {/* Toolbar */}
            <div className="relative w-full max-w-5xl mb-10 border-b border-white/10 rounded-xl px-4 py-4">
              {/* Centered, wide search */}
              <div className="mx-auto w-full sm:w-[520px] md:w-[680px]">
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 text-sm">
                  {fetchedNfts.length} item{fetchedNfts.length === 1 ? "" : "s"}
                </div>

                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, description or token..."
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
                />
              </div>
              {/* Item count pinned to the right */}
            </div>
          </div>

          {fetchedNfts && fetchedNfts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-8">
              {fetchedNfts
                .filter((nft) => {
                  if (!searchQuery.trim()) return true;
                  const q = searchQuery.toLowerCase();
                  return (
                    (nft.name || "").toLowerCase().includes(q) ||
                    (nft.description || "").toLowerCase().includes(q) ||
                    (nft.token_id || "").toString().includes(q)
                  );
                })
                .map((nft: FetchedNFT) => (
                  <NftCard
                    key={nft.id}
                    href={`/loyalties/${nft.collection_id}`}
                    imageUrl={
                      nft.name === "Hashcase Super Cool Collection"
                        ? backgroundImageHeroSection
                        : nft.image_uri
                    }
                    title={nft.name}
                    description={nft.description}
                    footer={
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Additional NFT info can go here */}
                        </div>
                        <button
                          onClick={() => handleNFTClick(nft)}
                          className={`inline-flex w-full items-center justify-center gap-2 rounded-lg border border-blue-400/60 ${
                            density === "compact"
                              ? "px-2 py-1.5 text-xs"
                              : "px-3 py-2 text-sm"
                          } font-medium text-white hover:bg-blue-400/10 transition-colors`}
                        >
                          View Collection <span className="text-white">→</span>
                        </button>
                      </div>
                    }
                  />
                ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400 text-lg mb-2">No NFTs found</p>
              <p className="text-gray-500 text-sm">
                {isOwnProfile()
                  ? "You don't own any NFTs yet."
                  : "This user doesn't own any NFTs yet."}
              </p>
            </div>
          )}
        </>
      </div>

      {/* Render the modal conditionally */}
      {showModal && (
        <UpdateProfileModal
          userData={userData}
          onClose={() => setShowModal(false)}
          onUpdate={handleUpdateProfile}
        />
      )}

      {/* Share Profile Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-gray-900 rounded-xl border border-white/10 w-full max-w-md mx-4 p-5 animate-in fade-in-50 zoom-in-95 duration-500">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-white">
                Share Profile
              </h2>
              <button
                className="text-white/60 hover:text-white"
                onClick={() => setShowShareModal(false)}
                aria-label="Close share modal"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <p className="text-white/70 text-sm mb-3">
              Share this link to let others view your profile:
            </p>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={
                  typeof window !== "undefined" ? window.location.href : ""
                }
                className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
              />
              <button
                onClick={handleShareProfile}
                className="px-3 py-2 rounded-lg bg-white text-black text-sm font-semibold hover:bg-white/90 transition-colors"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
