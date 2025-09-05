"use client";
import Link from "next/link";
import React from "react";
import YT from "@/assets/images/yt.svg";
import IG from "@/assets/images/insta.svg";
import X from "@/assets/images/twitter.svg";
import { Work_Sans } from "next/font/google";
import Logo from "@/assets/images/hashcase-text.svg";
import { Heart, ArrowUp, Mail, MessageCircle, Users, Sparkles } from "lucide-react";

const workSans = Work_Sans({ subsets: ["latin"] });

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-gradient-to-b from-[#1A1D35] to-[#0f111a] border-t border-white/10 ">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 hidden md:block">
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-500 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-8">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Brand Section */}
            <div className="lg:col-span-1">
              <div className="flex items-center mb-6">
                <Logo />
              </div>
              <p className="text-white/70 text-sm leading-relaxed mb-6 max-w-xs">
                Revolutionizing loyalty programs with blockchain technology. Turn your audience into superfans with our innovative NFT-based rewards platform.
              </p>
              <div className="flex items-center gap-4">
                <Link href="#" className="group p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-300 hover:scale-110">
                  <YT className="w-5 h-5" />
                </Link>
                <Link href="#" className="group p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-300 hover:scale-110">
                  <IG className="w-5 h-5" />
                </Link>
                <Link href="#" className="group p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-300 hover:scale-110">
                  <X className="w-5 h-5" />
                </Link>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white font-semibold text-lg mb-6 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#4DA2FF]" />
                Quick Links
              </h3>
              <div className="space-y-4">
                <Link href="/" className="block text-white/70 hover:text-white transition-colors duration-300 hover:translate-x-1">
                  Home
                </Link>
                <Link href="/collections" className="block text-white/70 hover:text-white transition-colors duration-300 hover:translate-x-1">
                  Collections
                </Link>
                <Link href="/loyalties" className="block text-white/70 hover:text-white transition-colors duration-300 hover:translate-x-1">
                  Loyalties
                </Link>
                <Link href="/mint" className="block text-white/70 hover:text-white transition-colors duration-300 hover:translate-x-1">
                  Mint NFTs
                </Link>
              </div>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-white font-semibold text-lg mb-6 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-[#4DA2FF]" />
                Support
              </h3>
              <div className="space-y-4">
                <Link href="#" className="block text-white/70 hover:text-white transition-colors duration-300 hover:translate-x-1">
                  Help Center
                </Link>
                <Link href="#" className="block text-white/70 hover:text-white transition-colors duration-300 hover:translate-x-1">
                  Contact Us
                </Link>
                <Link href="#" className="block text-white/70 hover:text-white transition-colors duration-300 hover:translate-x-1">
                  Documentation
                </Link>
                <Link href="#" className="block text-white/70 hover:text-white transition-colors duration-300 hover:translate-x-1">
                  API Reference
                </Link>
              </div>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-white font-semibold text-lg mb-6 flex items-center gap-2">
                <Users className="w-5 h-5 text-[#4DA2FF]" />
                Company
              </h3>
              <div className="space-y-4">
                <Link href="#" className="block text-white/70 hover:text-white transition-colors duration-300 hover:translate-x-1">
                  About Us
                </Link>
                <Link href="#" className="block text-white/70 hover:text-white transition-colors duration-300 hover:translate-x-1">
                  Careers
                </Link>
                <Link href="#" className="block text-white/70 hover:text-white transition-colors duration-300 hover:translate-x-1">
                  Blog
                </Link>
                <Link href="#" className="block text-white/70 hover:text-white transition-colors duration-300 hover:translate-x-1">
                  Press Kit
                </Link>
              </div>
            </div>
          </div>
        </div>

      

        {/* Bottom Bar */}
        <div className="py-6 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <span>© 2024 HashCase. All rights reserved.</span>
              <span className="hidden md:inline">•</span>
              <span className="hidden md:inline">Made with</span>
              <Heart className="w-4 h-4 text-red-400 hidden md:inline" />
              <span className="hidden md:inline">for the Web3 community</span>
            </div>
            
            <div className="flex items-center gap-6 text-sm">
              <Link href="#" className="text-white/60 hover:text-white transition-colors duration-300">
                Terms of Service
              </Link>
              <Link href="#" className="text-white/60 hover:text-white transition-colors duration-300">
                Privacy Policy
              </Link>
              <Link href="#" className="text-white/60 hover:text-white transition-colors duration-300">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 p-3 bg-gradient-to-r from-[#4DA2FF] to-[#7ab8ff] hover:from-[#3a8fef] hover:to-[#6aa7f0] text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-50"
        aria-label="Scroll to top"
      >
        <ArrowUp className="w-5 h-5" />
      </button>
    </footer>
  );
};

export default Footer;
