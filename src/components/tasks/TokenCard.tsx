"use client";
import React from "react";
import Image from "next/image";
import { TokenErc20 } from "./tokenTypes";
import { ExternalLink } from "lucide-react";

interface TokenCardProps {
  token: TokenErc20;
  onClick?: () => void;
}

const TokenCard: React.FC<TokenCardProps> = ({ token, onClick }) => {
  const handleCardClick = () => {
    // Open BaseScan link in new tab
    window.open(`https://basescan.org/token/${token.wallet_address}`, "_blank");
  };

  return (
    <div
      className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:bg-white/10 transition-all duration-200 cursor-pointer group"
      onClick={handleCardClick}
    >
      <div className="flex items-center h-20">
        {/* Image Section - Left side, smaller */}
        <div className="w-20 h-20 flex-shrink-0">
          {token.logo_url ? (
            <Image
              src={token.logo_url}
              alt={token.symbol}
              width={80}
              height={80}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
              <span className="text-white font-bold text-2xl">
                {token.symbol.charAt(0)}
              </span>
            </div>
          )}
        </div>

        {/* Details Section - Right side, takes most space */}
        <div className="flex-1 px-4 py-3 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-blue-400 font-medium text-lg truncate">
                {token.symbol}
              </p>
            </div>

            {/* External Link Icon */}
            <div className="ml-2 flex-shrink-0">
              <ExternalLink className="w-5 h-5 text-white/40 group-hover:text-white/70 transition-colors" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenCard;
