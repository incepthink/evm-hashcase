"use client";

import Image from "next/image";
import ArrowW from "@/assets/images/arrowW.svg";
import ArrowB from "@/assets/images/arrowB.svg";
import Heart from "@/assets/images/heart.svg";
import HeartW from "@/assets/images/white_heart.svg";
import Send from "@/assets/images/send-Regular.svg";
import Eye from "@/assets/images/eye_Icon.png";
import Nft from "@/assets/nft-token.jpeg";
import { Work_Sans } from "next/font/google";
import notify, { notifyPromise, notifyResolve } from "@/utils/notify";
import { Bounce, toast } from "react-toastify";
import EyeW from "@/assets/eye-white.svg";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import React, { useContext } from "react";
import Link from "next/link";

import { useZkLogin } from "@mysten/enoki/react";

import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";

import Collectable from "@/components/Collectable";
import Footer from "@/components/Footer";
import WalletConnectionModal from "@/components/WalletConnectionModal";

import axiosInstance from "@/utils/axios";
import { claimNftHelper } from "@/utils/contractHelperFunctions";
import { useNftTransactions } from "@/app/hooks/useNftTransactions";
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
  DollarSign,
} from "lucide-react";

interface Metadata {
  id: number;
  title: string;
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
  const [nftData, setNftData] = useState<Metadata>({
    id: 1,
    title: "Winter Flakes",

    description: "Celebrate the winter with this NFT.",
    animation_url: "",
    image_url:
      "https://peach-obvious-locust-150.mypinata.cloud/ipfs/bafybeifcjcodwk4ly4t54erwkqswyimg52zqpu3a4ozqisexiff36uqc4i",
    collection_id: 84,
    token_uri:
      "https://peach-obvious-locust-150.mypinata.cloud/ipfs/bafybeifcjcodwk4ly4t54erwkqswyimg52zqpu3a4ozqisexiff36uqc4i",
    attributes: "super, good, very, nice",
    collection_name: "Cricket Collection",
  });

  const [loading, setLoading] = useState(true);

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

  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecuteTransaction } =
    useSignAndExecuteTransaction();

  const { userWalletAddress } = useGlobalAppStore();

  const { freeMintNft, fixedPriceMintNFT } = useNftTransactions();

  const createFixedPriceMintNft = async () => {
    if (!nftData) return;

    const notifyId = notifyPromise("Minting NFT...", "info");

    try {
      const nftForm = {
        collection_id:
          nftData.collection_address ||
          "0xf5781a9473653703338da4a8ab7de5225110f8da0ae43bf5221c25da628ac5c7", // Replace with the actual Collection object ID
        title: nftData.title,
        description: nftData.description,
        image_url: nftData.image_url,
        attributes: nftData.attributes || "",
      };

      const txDetails = await fixedPriceMintNFT(
        nftForm,
        currentAccount?.address!
      );

      console.log(txDetails);

      // Show success modal
      setShowSuccessModal(true);

      notifyResolve(notifyId, "NFT Minted", "success");
    } catch (error) {
      notifyResolve(notifyId, "Error minting NFT", "error");
      console.error("Error minting NFT:", error);
    }

    // console.log(itemResponse);
  };

  return (
    <div className={`flex flex-col bg-[#00041F] ${workSans.className}`}>
      <div className="flex flex-col px-8 md:px-16">
        <Link
          href={`/collections`}
          className="hidden md:flex items-center justify-start gap-x-2 my-4 px-20"
        >
          <ArrowW />
          <p className="text-2xl text-white/70">back</p>
        </Link>
        <div className="my-4 flex flex-col md:flex-row items-center justify-around md:gap-y-0 gap-y-8">
          <img
            className="h-96 w-auto"
            src={nftData.image_url}
            alt="nft"
            // className="rounded-lg"
          />

          <div className="flex flex-col items-center justify-center">
            <div className="flex items-center justify-between w-full">
              <div>
                <p className="text-white md:text-2xl text-lg">
                  By{" "}
                  <span className="text-[#4DA2FF]">
                    {nftData.collection_name}
                  </span>
                </p>
              </div>
              <div className="flex items-center justify-center">
                <div className="md:w-8 md:h-8 w-6 h-6 rounded-full bg-[#1E1E1ECC] backdrop-blur-md flex items-center justify-center mr-2">
                  <HeartW />
                </div>
                <div className="w-8 h-8 rounded-full bg-[#1E1E1ECC] backdrop-blur-md flex items-center justify-center ml-2">
                  <Send />
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-start gap-y-2 my-4 w-full">
              <p className="text-white md:text-4xl text-2xl tracking-wide font-bold">
                {nftData.title}
              </p>
              <div className="flex justify-start gap-x-2 text-[#4DA2FF]">
                <div className="flex items-center gap-x-1">
                  <DollarSign className="w-5 h-5  text-[#4DA2FF]" />
                  <p className="text-white md:text-xl text-lg">100 Mist</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center my-4">
              <p className="md:text-xl text-sm text-white">
                {nftData.description}
              </p>
            </div>

            <div className="flex items-center justify-start w-full"></div>
            <div className="flex items-center justify-start w-full">
              <div className="flex items-center md:w-auto w-full justify-between my-4 bg-[#4DA2FF] backdrop-blur-md rounded-lg px-3 py-3 gap-x-2">
                <button
                  onClick={openModal}
                  className="flex items-center gap-x-2"
                >
                  <EyeW />
                  <p className="text-white md:text-lg text-sm">
                    Reveal the Content
                  </p>
                </button>
                <ArrowW className="rotate-180 ml-4" />
              </div>
            </div>

            <div className="flex flex-col gap-4 items-start mt-2 w-full">
              <button
                onClick={createFixedPriceMintNft}
                className="md:px-6 md:py-3 px-4 py-2 rounded-full md:text-xl text-sm bg-white text-black border-[1px] border-b-4 border-[#4DA2FF] flex items-center gap-x-2"
              >
                Mint the NFT
                <ArrowB />
              </button>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-start my-4 w-full"></div>

        <hr className="md:m-[100px] m-[20px] bg-gradient-to-r from-transparent via-white to-transparent opacity-20" />
        <div className="flex items-center justify-center mt-4 mb-8">
          <div className="bg-[#1A1D35] rounded-lg md:rounded-full p-4 w-full md:text-center text-left text-white md:text-2xl text-lg font-semibold">
            <p>
              The above NFT holds{" "}
              <span className="text-[#4DA2FF]"> 20 loyalty point(s).</span>{" "}
              <br className="hidden md:block" />
              You can receive additional loyalty points from this owner by
              completing the tasks below.
            </p>
          </div>
        </div>
        <p className="text-center md:text-2xl text-lg font-semibold mt-6 mb-4 text-white">
          2 Task
        </p>
        <div className="flex flex-col md:flex-row items-center justify-center w-full md:gap-x-6 gap-x-0 gap-y-4 md:gap-y-0 mt-4 mb-12">
          <div className="bg-[#1A1D35] md:p-6 p-4 w-full flex items-center justify-between">
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
          <div className="bg-[#1A1D35] md:p-6 p-4 w-full flex items-center justify-between">
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
      {/* <Modal
        context="Unlockable Content"
        openModal={isUnlocked}
        onClose={() => setIsUnlocked(false)}
      >
        <div className="flex flex-col justify-center items-center gap-y-4 my-4 mx-4">
          <Link
            href={`https://suiscan.xyz/testnet/object/${loyaltyId}`}
            target="_blank"
            className="bg-white border-black/20 px-3 py-2 text-black hover:text-blue-500 font-semibold rounded-full w-full overflow-hidden text-ellipsis whitespace-nowrap"
          >
            https://suiscan.xyz/mainnet/object/...
          </Link>
        </div>
      </Modal> */}
    </div>
  );
}
