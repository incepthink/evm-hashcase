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
      <div className="absolute inset-0 z-0">
        <Image
          src={CollBg}
          alt="Collectable Background"
          fill
          className="object-cover opacity-20"
          priority
        />
      </div>

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-72 h-72 bg-purple-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-8">
        <div className="flex flex-col items-center justify-center">
          {/* Main Content Card */}
          <div className="w-full max-w-4xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-8 md:p-12">
            {/* Header */}
            <div className="text-center mb-8">
              
              
              <h1 className={`${workSans.className} text-white text-3xl md:text-5xl font-bold mb-4 leading-tight`}>
                Claim Your Free Digital Collectable
              </h1>
              
              <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                Join thousands of users who have already claimed their exclusive NFT. 
                Start your Web3 journey with a free digital collectable from HashCase.
              </p>
            </div>

           

            {/* CTA Button */}
            <div className="flex justify-center">
              <Link 
                href="/mint" 
                className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#4DA2FF] to-[#7ab8ff] hover:from-[#3a8fef] hover:to-[#6aa7f0] text-black font-bold rounded-2xl transition-all duration-300 shadow-[0_20px_40px_-10px_rgba(77,162,255,0.4)] hover:shadow-[0_25px_50px_-15px_rgba(77,162,255,0.5)]"
              >
                <Sparkles className="w-5 h-5" />
                <span>Claim Your Free NFT</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Stats */}
         
        </div>
      </div>
    </div>
  );
};

export default Collectable;
