"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import axiosInstance from "@/utils/axios";
import { Gift, Star, Users, ArrowRight, Sparkles } from "lucide-react";

interface Collection {
  id: number;
  name: string;
  description: string;
  image_uri: string;
  contract_address: string;
}

const LoyaltiesPage = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await axiosInstance.get("/platform/collections-sui");
        // Backend returns { collections, currentPage, totalPages, ... }
        const collectionsData = response.data?.collections || response.data?.suiCollections;
        setCollections(Array.isArray(collectionsData) ? collectionsData : []);
      } catch (error) {
        console.error("Error fetching collections:", error);
        setCollections([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#00041f] to-[#030828] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-[#4DA2FF] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-purple-500 border-b-transparent rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <p className="text-white/80 text-lg font-medium">Loading loyalty programs...</p>
          <p className="text-white/50 text-sm mt-2">Discovering amazing rewards</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#00041f] to-[#030828] text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 container mx-auto px-6 py-16">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl">
                <Gift className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                Loyalty Programs
              </h1>
            </div>
            
            <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto leading-relaxed mb-8">
              Unlock exclusive rewards, earn points, and complete quests across the most exciting NFT collections
            </p>
            
            <div className="flex items-center justify-center gap-8 text-white/60">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" />
                <span className="text-sm">Exclusive Rewards</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                <span className="text-sm">Community Benefits</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <span className="text-sm">Special Perks</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Collections Section */}
      <div className="container mx-auto px-6 pb-16">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Available Programs
            </h2>
            <p className="text-white/60">
              {collections.length} loyalty program{collections.length !== 1 ? 's' : ''} available
            </p>
          </div>
        </div>

        {/* Collections Grid */}
        {collections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {collections.map((collection) => (
              <Link
                key={collection.id}
                href={`/loyalties/${collection.id}`}
                className="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] hover:border-white/30"
              >
                {/* Card Background Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Image Section */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={collection.image_uri || "https://via.placeholder.com/400x300/1a1a2e/ffffff?text=Collection"}
                    alt={collection.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  {/* Floating Badge */}
                  <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md rounded-full px-3 py-1 border border-white/30">
                    <span className="text-xs font-medium text-white">Loyalty</span>
                  </div>
                </div>
                
                {/* Content Section */}
                <div className="relative p-6">
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-200 transition-colors">
                    {collection.name}
                  </h3>
                  
                  <p className="text-white/70 text-sm leading-relaxed mb-4 line-clamp-2">
                    {collection.description || "Join this exclusive loyalty program and unlock amazing rewards."}
                  </p>
                  
                  {/* Contract Address */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-white/50 font-mono">
                      {collection.contract_address?.slice(0, 8)}...{collection.contract_address?.slice(-6)}
                    </span>
                  </div>
                  
                  {/* Action Button */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-blue-400 group-hover:text-blue-300 transition-colors">
                      <span className="text-sm font-semibold">Explore Program</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                    
                    {/* Stats Badge */}
                    <div className="bg-white/10 backdrop-blur-md rounded-full px-3 py-1 border border-white/20">
                      <span className="text-xs font-medium text-white">Active</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-20">
            <div className="relative mb-8">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                <Star className="w-4 h-4 text-black" />
              </div>
            </div>
            
            <h3 className="text-3xl font-bold text-white mb-4">
              No Loyalty Programs Yet
            </h3>
            <p className="text-white/60 text-lg max-w-md mx-auto leading-relaxed">
              We&apos;re working on bringing you amazing loyalty programs. Check back soon for exclusive rewards and benefits!
            </p>
            
            <div className="mt-8 flex items-center justify-center gap-4 text-white/40">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                <span className="text-sm">Coming Soon</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoyaltiesPage; 