"use client";
import Link from "next/link";
import React from "react";
import { Telegram, X } from "@mui/icons-material";
import { Work_Sans } from "next/font/google";

const workSans = Work_Sans({ subsets: ["latin"] });

const Footer = () => {
  return (
    <footer className="bg-[#1A1D35] border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Social Media Links */}
          <div className="flex items-center gap-4 order-2 sm:order-1">
            <Link
              href="https://t.me/taahanizam"
              target="_blank"
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-300"
              aria-label="Telegram"
            >
              <Telegram className="w-5 h-5 text-white" />
            </Link>
            <Link
              href="https://x.com/hash_case"
              target="_blank"
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-300"
              aria-label="Twitter"
            >
              <X className="w-5 h-5 text-white" />
            </Link>
          </div>

          {/* Copyright */}
          <div className="order-1 sm:order-2">
            <p
              className={`${workSans.className} text-white/60 text-sm text-center sm:text-right`}
            >
              © 2024 HashCase. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
