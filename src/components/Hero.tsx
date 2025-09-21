"use client";
import Image from "next/image";
import { Work_Sans } from "next/font/google";
import ArrowB from "../assets/images/arrowB.svg";
import suiBg from "../assets/images/sui-bg.png";
import Link from "next/link";
import { Sparkles, Star, Users, Zap, ArrowRight, Wallet } from "lucide-react";
import { useGlobalAppStore } from "@/store/globalAppStore";
import { useState, useEffect } from "react";

const workSans = Work_Sans({ subsets: ["latin"] });

export const Hero = () => {
  const { isUserVerified, getWalletForChain } = useGlobalAppStore();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  // Get EVM wallet from the store
  const evmWallet = getWalletForChain("evm");
  const user_address = evmWallet?.address;
  const isWalletConnected = !!(user_address && isUserVerified);

  useEffect(() => {
    if (isUserVerified && evmWallet?.address) {
      setWalletAddress(
        evmWallet.address.slice(0, 10) + "..." + evmWallet.address.slice(-8)
      );
    } else {
      setWalletAddress(null);
    }
  }, [evmWallet, isUserVerified]);

  return (
    <>
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0 -z-20">
          <Image
            src={suiBg}
            alt="Sui background"
            fill
            priority
            className="absolute top-0 left-0 w-full h-full object-cover object-center"
          />
        </div>

        {/* Enhanced decorative background layers */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/80 via-[#030b2a]/70 to-[#00041F]/90" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(77,162,255,0.25),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(77,162,255,0.15),transparent_55%)]" />
          <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(to_right,rgba(255,255,255,0.35)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.35)_1px,transparent_1px)] bg-[size:40px_40px]" />

          {/* Animated floating elements */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute top-1/2 left-1/4 w-48 h-48 bg-cyan-500/15 rounded-full blur-2xl animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 relative z-10">
          <div className="text-center max-w-6xl mx-auto">
            {/* Main heading - Improved responsive sizing */}
            <h1
              className={`text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold tracking-tight text-white leading-tight mb-6 sm:mb-8 md:mb-10 drop-shadow-lg ${workSans.className}`}
            >
              Turn your audience into{" "}
              <span className="relative">
                <span className="text-transparent bg-clip-text bg-blue-500">
                  Superfans!
                </span>
              </span>
            </h1>

            {/* Enhanced Description - Better responsive sizing */}
            <div className="space-y-4 sm:space-y-6 mb-8 sm:mb-10 md:mb-12">
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 leading-relaxed max-w-4xl mx-auto font-medium px-2 sm:px-4">
                Engage your audience with better, smarter loyalty and reward
                campaigns.
                <span className="text-[#4DA2FF] font-semibold">
                  {" "}
                  Integrate the power of Web 2.5
                </span>{" "}
                into your application with near-zero effort.
              </p>

              {/* Feature highlights - Hidden on mobile, responsive on larger screens */}
              <div className="hidden sm:flex flex-wrap items-center justify-center gap-4 md:gap-6 text-white/70">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">
                    Zero Setup Required
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"
                    style={{ animationDelay: "0.5s" }}
                  ></div>
                  <span className="text-sm font-medium">Instant Rewards</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"
                    style={{ animationDelay: "1s" }}
                  ></div>
                  <span className="text-sm font-medium">
                    Blockchain Powered
                  </span>
                </div>
              </div>
            </div>

            {/* Enhanced CTA Section - Connected State */}
            {isWalletConnected && walletAddress ? (
              <div className="mb-12 sm:mb-14 md:mb-16">
                {/* Connected State - Responsive design */}
                <div className="flex flex-col items-center justify-center gap-4 sm:gap-6">
                  <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl bg-green-500/20 border border-green-500/30 text-green-400 max-w-full">
                    <Wallet className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span className="font-semibold text-xs sm:text-sm md:text-base truncate">
                      Connected:{" "}
                      <span className="hidden xs:inline">{walletAddress}</span>
                      <span className="xs:hidden">
                        {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                      </span>{" "}
                      {/* ({evmWallet?.type}) */}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full">
                    {/* <Link
                      href="/quests?collection_id=218"
                      className="group inline-flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base text-black bg-gradient-to-r from-[#4DA2FF] to-[#7ab8ff] hover:from-[#3a8fef] hover:to-[#6aa7f0] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#4DA2FF]/30 transition-all duration-300 shadow-[0_20px_40px_-10px_rgba(77,162,255,0.4)] hover:shadow-[0_25px_50px_-15px_rgba(77,162,255,0.5)] min-w-fit whitespace-nowrap"
                    >
                      <Zap className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                      <span>Start Quests</span>
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                    </Link> */}

                    <Link
                      href="/collections"
                      className="group inline-flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base text-white bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/30 transition-all duration-300 min-w-fit whitespace-nowrap"
                    >
                      <Users className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                      <span>Explore Collections</span>
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              /* Default State - Not Connected */
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-12 sm:mb-14 md:mb-16 w-full">
                {/* <Link
                  href="/quests?collection_id=218"
                  className="group inline-flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base text-black bg-gradient-to-r from-[#4DA2FF] to-[#7ab8ff] hover:from-[#3a8fef] hover:to-[#6aa7f0] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#4DA2FF]/30 transition-all duration-300 shadow-[0_20px_40px_-10px_rgba(77,162,255,0.4)] hover:shadow-[0_25px_50px_-15px_rgba(77,162,255,0.5)] min-w-fit whitespace-nowrap"
                >
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span>Claim Free NFT Now</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                </Link> */}

                <Link
                  href="/collections"
                  className="group inline-flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base text-white bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/30 transition-all duration-300 min-w-fit whitespace-nowrap"
                >
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span>Explore Collections</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                </Link>
              </div>
            )}

            {/* Stats Section */}
          </div>
        </div>

        {/* Scroll indicator */}
        {/* <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div> */}
      </div>
    </>
  );
};
