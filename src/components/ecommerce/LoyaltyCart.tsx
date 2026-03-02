"use client";

import { useContext, useEffect, useState } from "react";
import { Tag, RefreshCw } from "lucide-react";
import axiosInstance from "@/utils/axios";
import { AppContext } from "@/context/ecommerce/AppContext";

interface AvailabilityRule {
  timezone: string;
  start_date?: string | null;
  end_date?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  available_days?: string[] | null;
}

interface LoyaltyCode {
  id: number;
  code: string;
  value: number;
  type: string;
  is_active: boolean;
  availabilityRule: AvailabilityRule | null;
}

function isCodeAvailableNow(
  availabilityRule: AvailabilityRule | null,
): boolean {
  if (!availabilityRule) return true;

  const now = new Date();
  let tzNow: Date;
  try {
    tzNow = new Date(
      now.toLocaleString("en-US", { timeZone: availabilityRule.timezone }),
    );
  } catch {
    tzNow = now; // fallback if timezone string is not a valid IANA name
  }

  if (availabilityRule.start_date) {
    if (tzNow < new Date(availabilityRule.start_date)) return false;
  }
  if (availabilityRule.end_date) {
    const end = new Date(availabilityRule.end_date);
    end.setHours(23, 59, 59, 999);
    if (tzNow > end) return false;
  }

  const currentTime = tzNow.toTimeString().slice(0, 5);
  if (availabilityRule.start_time && currentTime < availabilityRule.start_time)
    return false;
  if (availabilityRule.end_time && currentTime > availabilityRule.end_time)
    return false;

  if (
    availabilityRule.available_days &&
    availabilityRule.available_days.length > 0
  ) {
    const dayNames = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    const todayName = dayNames[tzNow.getDay()];
    if (!availabilityRule.available_days.includes(todayName)) return false;
  }

  return true;
}

interface LoyaltyCartProps {
  owner_id: number | null;
  selectedLoyaltyId: number | null;
  onSelect: (id: number | null, code: string | null) => void;
}

export default function LoyaltyCart({
  owner_id,
  selectedLoyaltyId,
  onSelect,
}: LoyaltyCartProps) {
  const context = useContext(AppContext);

  const [codes, setCodes] = useState<LoyaltyCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchCodes = () => {
    setLoading(true);
    setError(false);
    axiosInstance
      .get(`/platform/get-loyalties?owner_id=${owner_id}`)
      .then((res) => {
        const all: LoyaltyCode[] = res.data.loyalties ?? [];
        const available = all.filter(
          (l) => l.is_active && isCodeAvailableNow(l.availabilityRule ?? null),
        );
        setCodes(available);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (owner_id) {
      fetchCodes();
    }
  }, [owner_id]);

  const handleSelect = (code: LoyaltyCode) => {
    const next = selectedLoyaltyId === code.id ? null : code.id;
    onSelect(next, next !== null ? code.code : null);
  };

  return (
    <div className="">
      <div className="flex items-center gap-4 mt-6 mb-6">
        <Tag size={24} className="text-[#2979FF]" />
        <h2 className="text-2xl font-semibold text-white">Apply Code</h2>
      </div>

      {loading && (
        <div className="space-y-2 animate-pulse">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-11 rounded-lg bg-[#0d1231] border border-[#1e2a4a]"
            />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-col items-center justify-center gap-2 py-6 text-center">
          <p className="text-sm text-gray-400">Failed to load loyalty codes.</p>
          <button
            onClick={fetchCodes}
            className="flex items-center gap-1.5 text-xs text-[#2979FF] hover:underline cursor-pointer"
          >
            <RefreshCw size={13} />
            Retry
          </button>
        </div>
      )}

      {!loading && !error && codes.length === 0 && (
        <div className="flex items-center justify-center py-6 min-h-[80px]">
          <p className="text-sm text-gray-500">
            No loyalty codes available right now.
          </p>
        </div>
      )}

      {!loading && !error && codes.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {codes.map((code) => {
            const isSelected = selectedLoyaltyId === code.id;
            const len = code.code.length;
            const colSpan =
              len <= 5
                ? "col-span-1"
                : len <= 9
                  ? "col-span-2"
                  : len <= 14
                    ? "col-span-3"
                    : "col-span-4";
            return (
              <button
                key={code.id}
                onClick={() => handleSelect(code)}
                className={`${colSpan} flex flex-col items-start justify-center gap-1.5 px-3 py-4 rounded-xl border text-left transition-colors duration-150 cursor-pointer min-h-20 ${
                  isSelected
                    ? "border-blue-400 bg-blue-600/30 text-white"
                    : "border-blue-800/50 bg-blue-900/40 text-gray-300 hover:border-blue-500 hover:bg-blue-800/40"
                }`}
              >
                <span className="font-mono font-semibold text-lg tracking-wide leading-tight break-all">
                  {code.code}
                </span>
                <span
                  className={`text-md ${isSelected ? "text-blue-300" : "text-blue-400/70"}`}
                >
                  {code.type === "fixed" || code.type === "FIXED"
                    ? `${code.value} Points`
                    : "Variable"}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
