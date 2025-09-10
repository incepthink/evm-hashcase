"use client";
import { useEffect, useState } from "react";
import axiosInstance from "@/utils/axios";
import { Flame, Award, Trophy, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";

type Badge = {
  id: number;
  owner_id: number;
  name: string;
  description?: string;
  is_active: boolean;
  is_seasoned: boolean;
  image_url?: string;
  active_from?: string;
  active_till?: string;
  createdAt: string;
  updatedAt: string;
};

const BadgesTable = ({ owner_id }: { owner_id: number }) => {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalBadges, setTotalBadges] = useState<number>(0);
  const [activeBadges, setActiveBadges] = useState<number>(0);
  const [seasonalBadges, setSeasonalBadges] = useState<number>(0);

  const fetchBadges = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/platform/badge/by-owner", {
        params: { owner_id },
      });

      console.log("badges we're getting");
      console.log(response);

      setBadges(response.data.badges);
      setTotalBadges(response.data.badges.length);
      setActiveBadges(
        response.data.badges.filter((b: Badge) => b.is_active).length
      );
      setSeasonalBadges(
        response.data.badges.filter((b: Badge) => b.is_seasoned).length
      );
    } catch (error) {
      console.error("Error fetching badges:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBadge = async (badge_id: number) => {
    try {
      const response = await axiosInstance.post(
        "/user/achievements/add-badge",
        {
          badge_id,
        },
        {
          params: {
            owner_id,
          },
        }
      );

      console.log(response);
      toast.success("Badge Successfully Added");
    } catch (error) {}
  };

  useEffect(() => {
    fetchBadges();
  }, []);

  if (loading) {
    return (
      <div className="bg-gradient-to-b from-[#00041f] to-[#030828] text-center py-8 px-4 min-h-[70vh]">
        <div className="text-white">Loading badges...</div>
      </div>
    );
  }

  if (!badges || badges.length === 0) {
    return (
      <div className="bg-gradient-to-b from-[#00041f] to-[#030828] text-center py-8 px-4 min-h-[70vh]">
        <div className="text-white">No badges in this Collection</div>
      </div>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="bg-gradient-to-b from-[#00041f] to-[#030828] min-h-[70vh]">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-4 text-center sm:text-left">
            BADGES COLLECTION
          </h1>

          {/* Stats Cards - Mobile First */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4">
            <div className="bg-[#3f54b4]/50 px-2 sm:px-4 py-2 rounded-full text-center">
              <span className="text-xs sm:text-sm lg:text-base font-medium text-white block">
                <span className="hidden sm:inline">Total: </span>
                {totalBadges}
              </span>
              <span className="text-xs text-white/60 sm:hidden">Total</span>
            </div>
            <div className="bg-[#3f54b4]/50 px-2 sm:px-4 py-2 rounded-full flex flex-col sm:flex-row items-center justify-center">
              <div className="flex gap-1 items-center mb-1">
                <Award className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 sm:mr-2" />
                <span className="text-xs sm:text-sm lg:text-base font-medium text-white">
                  <span className="hidden sm:inline">Active: </span>
                  {activeBadges}
                </span>
              </div>
              <span className="text-xs text-white/60 sm:hidden">Active</span>
            </div>
            <div className="bg-[#3f54b4]/50 px-2 sm:px-4 py-2 rounded-full flex flex-col sm:flex-row items-center justify-center">
              <div className="flex gap-1 items-center mb-1">
                <Trophy className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400 sm:mr-2" />
                <span className="text-xs sm:text-sm lg:text-base font-medium text-white">
                  <span className="hidden sm:inline">Seasonal: </span>
                  {seasonalBadges}
                </span>
              </div>
              <span className="text-xs text-white/60 sm:hidden">Seasonal</span>
            </div>
          </div>
        </div>

        {/* Mobile Card Layout */}
        <div className="block lg:hidden space-y-3">
          {badges.map((badge) => (
            <div
              key={badge.id}
              onClick={() => handleAddBadge(badge.id)}
              className="bg-[#1a1f3d]/50 border border-[#3f54b4]/30 rounded-lg p-4 cursor-pointer hover:bg-[#1a1f3d]/70 transition-all duration-200 active:scale-[0.98]"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center flex-1 min-w-0">
                  {badge.image_url ? (
                    <img
                      src={badge.image_url}
                      alt={badge.name}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full mr-3 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#3f54b4]/50 mr-3 flex items-center justify-center flex-shrink-0">
                      <Award className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-white text-sm sm:text-base truncate">
                      {badge.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-400 mt-1 line-clamp-2">
                      {badge.description || "No description available"}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 ml-2 flex-shrink-0" />
              </div>

              <div className="flex items-center justify-between">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    badge.is_active
                      ? "bg-green-900/30 text-green-400"
                      : "bg-red-900/30 text-red-400"
                  }`}
                >
                  {badge.is_active ? "Active" : "Inactive"}
                  {badge.is_seasoned && " • Seasonal"}
                </span>

                <div className="text-right">
                  <div className="text-xs text-gray-400">
                    {formatDate(badge.active_from)} -{" "}
                    {formatDate(badge.active_till)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table Layout */}
        <div className="hidden lg:block">
          <div className="overflow-x-auto rounded-lg border border-[#3f54b4]/30">
            <table className="w-full text-white border-collapse bg-[#1a1f3d]/30">
              <thead>
                <tr className="border-b border-[#3f54b4]/50 bg-[#1a1f3d]/50">
                  <th className="py-4 px-4 text-left font-medium">Name</th>
                  <th className="py-4 px-4 text-left font-medium">
                    Description
                  </th>
                  <th className="py-4 px-4 text-left font-medium">Status</th>
                  <th className="py-4 px-4 text-left font-medium">
                    Active From
                  </th>
                  <th className="py-4 px-4 text-left font-medium">
                    Active Till
                  </th>
                </tr>
              </thead>
              <tbody>
                {badges.map((badge) => (
                  <tr
                    key={badge.id}
                    onClick={() => handleAddBadge(badge.id)}
                    className="border-b border-[#3f54b4]/20 cursor-pointer hover:bg-[#1a1f3d]/50 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        {badge.image_url ? (
                          <img
                            src={badge.image_url}
                            alt={badge.name}
                            className="w-8 h-8 rounded-full mr-3"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-[#3f54b4]/50 mr-3 flex items-center justify-center">
                            <Award className="w-4 h-4 text-white" />
                          </div>
                        )}
                        <span className="font-medium">{badge.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-400">
                      {badge.description || "-"}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs ${
                          badge.is_active
                            ? "bg-green-900/30 text-green-400"
                            : "bg-red-900/30 text-red-400"
                        }`}
                      >
                        {badge.is_active ? "Active" : "Inactive"}
                        {badge.is_seasoned && " • Seasonal"}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {formatDate(badge.active_from)}
                    </td>
                    <td className="py-4 px-4">
                      {formatDate(badge.active_till)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Stats - Desktop Only */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-4 text-center text-white mt-6">
          <div className="bg-[#3f54b4]/20 p-4 rounded-lg">
            <p className="text-xs text-white/60 mb-1">TOTAL BADGES</p>
            <p className="text-2xl font-bold">{totalBadges}</p>
          </div>
          <div className="bg-[#3f54b4]/20 p-4 rounded-lg">
            <p className="text-xs text-white/60 mb-1">ACTIVE</p>
            <p className="text-2xl font-bold">{activeBadges}</p>
          </div>
          <div className="bg-[#3f54b4]/20 p-4 rounded-lg">
            <p className="text-xs text-white/60 mb-1">SEASONAL</p>
            <p className="text-2xl font-bold">{seasonalBadges}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BadgesTable;
