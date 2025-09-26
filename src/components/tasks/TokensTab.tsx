"use client";
import React, { useState, useEffect } from "react";
import axiosInstance from "@/utils/axios";
import TokenCard from "@/components/tasks/TokenCard";
import { TokenErc20, TokensApiResponse } from "./tokenTypes";

interface TokensTabProps {
  searchQuery: string;
  userAddress: string;
}

const TokensTab: React.FC<TokensTabProps> = ({ searchQuery, userAddress }) => {
  const [tokens, setTokens] = useState<TokenErc20[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTokens = async () => {
    if (!userAddress) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await axiosInstance.get<TokensApiResponse>(
        `/user/profile/erc20/${userAddress}`
      );

      if (response.data.success) {
        setTokens(response.data.data.tokens || []);
      } else {
        setError(response.data.message || "Failed to fetch tokens");
      }
    } catch (error: any) {
      console.error("Error fetching tokens:", error);

      if (error.response?.status === 404) {
        setError("No tokens found for this user");
        setTokens([]);
      } else {
        setError("Failed to load tokens. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTokens();
  }, [userAddress]);

  // Filter tokens based on search query
  const filteredTokens = tokens.filter((token) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      token.name.toLowerCase().includes(q) ||
      token.symbol.toLowerCase().includes(q) ||
      (token.description && token.description.toLowerCase().includes(q)) ||
      token.wallet_address.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white/60">Loading tokens...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <p className="text-red-400 text-lg mb-2">Error Loading Tokens</p>
        <p className="text-gray-500 text-sm mb-4">{error}</p>
        <button
          onClick={fetchTokens}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (tokens.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-white/40"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
            />
          </svg>
        </div>
        <p className="text-gray-400 text-lg mb-2">No Tokens Found</p>
        <p className="text-gray-500 text-sm">
          This user hasn&apos;t received any tokens yet.
        </p>
      </div>
    );
  }

  return (
    <>
      {filteredTokens.length > 0 ? (
        /* Responsive Grid Layout */
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {filteredTokens.map((token) => (
            <TokenCard key={token.id} token={token} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-400 text-lg mb-2">
            No tokens match your search
          </p>
          <p className="text-gray-500 text-sm">
            Try adjusting your search terms.
          </p>
        </div>
      )}
    </>
  );
};

export default TokensTab;
