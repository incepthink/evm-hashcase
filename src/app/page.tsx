"use client";
import { Hero } from "@/components/Hero";
import Features from "@/components/Features";
import Footer from "@/components/Footer";
import ExploreSection from "@/components/ExploreSection";
import "@mysten/dapp-kit/dist/index.css";
import { useState } from "react";
import { ConnectModal, useCurrentAccount } from "@mysten/dapp-kit";
import Collectable from "@/components/Collectable";
import Logo from "../assets/icons/sui-sui-logo 1.png";
import SuietLogo from "../assets/icons/suietlogo.png";
import Image from "next/image";

export default function Home() {
  const [showModal, setShowModal] = useState(false);
  const currentAccount = useCurrentAccount();
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="bg-[#00041F]">
        <Hero />
        <Features />
        <hr className="md:m-[100px] m-[20px] bg-gradient-to-r from-transparent via-white to-transparent opacity-20" />
        <ExploreSection />
        <hr className="md:m-[100px] m-[20px] bg-gradient-to-r from-transparent via-white to-transparent opacity-20" />
        <Collectable />
      </div>
    </>
  );
}
