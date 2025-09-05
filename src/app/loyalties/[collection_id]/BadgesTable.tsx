"use client";
import { useEffect, useState } from "react";
import axiosInstance from "@/utils/axios";
import { Flame, Award, Trophy } from "lucide-react";
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
      <div className="bg-gradient-to-b from-[#00041f] to-[#030828] text-center py-8">
        Loading badges...
      </div>
    );
  }

  if (!badges || badges.length === 0) {
    return (
      <div className="bg-gradient-to-b from-[#00041f] to-[#030828] text-center py-8">
        No badges found
      </div>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-gradient-to-b from-[#00041f] to-[#030828] p-6 shadow-2xl">
      <div className="xl:max-w-[80%] mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            BADGES COLLECTION
          </h1>
          <div className="flex items-center space-x-4 text-white">
            <div className="bg-[#3f54b4]/50 px-4 py-2 rounded-full">
              <span className="text-base font-medium">
                Total: {totalBadges}
              </span>
            </div>
            <div className="bg-[#3f54b4]/50 px-4 py-2 rounded-full flex items-center">
              <Award className="w-4 h-4 mr-2 text-yellow-400" />
              <span className="text-base font-medium">
                Active: {activeBadges}
              </span>
            </div>
            <div className="bg-[#3f54b4]/50 px-4 py-2 rounded-full flex items-center">
              <Trophy className="w-4 h-4 mr-2 text-purple-400" />
              <span className="text-base font-medium">
                Seasonal: {seasonalBadges}
              </span>
            </div>
          </div>
        </div>

        {/* Badges Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-white border-collapse">
            <thead>
              <tr className="border-b border-[#3f54b4]/50">
                <th className="py-4 px-4 text-left font-medium">Name</th>
                <th className="py-4 px-4 text-left font-medium">Description</th>
                <th className="py-4 px-4 text-left font-medium">Status</th>
                <th className="py-4 px-4 text-left font-medium">Active From</th>
                <th className="py-4 px-4 text-left font-medium">Active Till</th>
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
                  <td className="py-4 px-4">{formatDate(badge.active_from)}</td>
                  <td className="py-4 px-4">{formatDate(badge.active_till)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 text-center text-white mt-6">
          <div className="bg-[#3f54b4]/20 p-3 rounded-lg">
            <p className="text-xs text-white/60">TOTAL BADGES</p>
            <p className="text-xl font-bold">{totalBadges}</p>
          </div>
          <div className="bg-[#3f54b4]/20 p-3 rounded-lg">
            <p className="text-xs text-white/60">ACTIVE</p>
            <p className="text-xl font-bold">{activeBadges}</p>
          </div>
          <div className="bg-[#3f54b4]/20 p-3 rounded-lg">
            <p className="text-xs text-white/60">SEASONAL</p>
            <p className="text-xl font-bold">{seasonalBadges}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BadgesTable;
