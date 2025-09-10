"use client";
import { Work_Sans } from "next/font/google";
import CollBg from "../assets/coll_bg.png";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Gift, ArrowRight, Sparkles } from "lucide-react";

const workSans = Work_Sans({ subsets: ["latin"] });

const Collectable = () => {
  return (
    <div className="relative bg-gradient-to-b from-[#00041F] to-[#030828] py-20 overflow-hidden">
      {/* Background Image */}
    </div>
  );
};

export default Collectable;
