import React from "react";

import { X, Lock } from "lucide-react";
import toast from "react-hot-toast";

interface UnlockableNft {
  isOpen: boolean;
  unlockableContent: string;
  closeModal: () => void;
}

const UnlockableNft: React.FC<UnlockableNft> = ({
  isOpen,
  unlockableContent,
  closeModal,
}) => {
  if (!isOpen) return null;

  const handleReveal = () => {
    toast.error("Mint the NFT to view unlockable content");
    closeModal();
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50"
      onClick={closeModal}
    >
      <div
        className="bg-gradient-to-br from-blue-400 to-purple-500 p-8 rounded-2xl shadow-2xl text-white relative w-[450px] space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors duration-300"
        >
          <X size={24} />
        </button>

        {/* Content with proper wrapping */}
        <div className="break-words whitespace-pre-wrap max-h-[200px] overflow-y-auto">
          {unlockableContent}
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-4">
          <button
            onClick={() => window.open(unlockableContent)}
            className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-300 text-white font-semibold"
          >
            <Lock size={20} />
            View Unlockable Content
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnlockableNft;
