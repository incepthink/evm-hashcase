// components/NFTSuccessModal.tsx
"use client";

import { memo, useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface MintedNftData {
  name: string;
  description: string;
  image_url: string;
  recipient: string;
}

interface NFTSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  mintedNftData: MintedNftData | null;
  walletAddress: string | null;
  isNSCollection: boolean;
}

const NFTSuccessModal = memo<NFTSuccessModalProps>(
  ({ isOpen, onClose, mintedNftData, walletAddress, isNSCollection }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    // Handle modal open/close animations
    useEffect(() => {
      if (isOpen) {
        setIsVisible(true);
        // Slight delay to ensure DOM is ready for animation
        const timer = setTimeout(() => {
          setIsAnimating(true);
        }, 10);
        return () => clearTimeout(timer);
      } else {
        setIsAnimating(false);
        // Keep visible until animation completes
        const timer = setTimeout(() => {
          setIsVisible(false);
        }, 300);
        return () => clearTimeout(timer);
      }
    }, [isOpen]);

    // Prevent body scroll when modal is open
    useEffect(() => {
      if (isOpen) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "unset";
      }

      return () => {
        document.body.style.overflow = "unset";
      };
    }, [isOpen]);

    const handleClose = useCallback(() => {
      if (onClose) {
        onClose();
      }
    }, [onClose]);

    const handleBackdropClick = useCallback(
      (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      },
      [handleClose]
    );

    const handleKeyDown = useCallback(
      (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          handleClose();
        }
      },
      [handleClose]
    );

    useEffect(() => {
      if (isOpen) {
        document.addEventListener("keydown", handleKeyDown);
        return () => {
          document.removeEventListener("keydown", handleKeyDown);
        };
      }
    }, [isOpen, handleKeyDown]);

    // Format wallet address for display
    const formatWalletAddress = useCallback(
      (address: string | null): string => {
        if (!address) return "Unknown";
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
      },
      []
    );

    // Don't render anything if not visible
    if (!isVisible) {
      return null;
    }

    const modalContent = (
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
          isAnimating ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleBackdropClick}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 transition-all duration-300 ${
            isNSCollection ? "bg-black/80" : "bg-[#000421]/80"
          } backdrop-blur-sm ${isAnimating ? "opacity-100" : "opacity-0"}`}
        />

        {/* Modal Content */}
        <div
          className={`relative z-10 w-full max-w-md mx-auto transform transition-all duration-300 ${
            isAnimating ? "scale-100 opacity-100" : "scale-95 opacity-0"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className={`rounded-2xl border backdrop-blur-lg shadow-2xl ${
              isNSCollection
                ? "bg-black/90 border-white/20"
                : "bg-[#000421]/90 border-blue-500/20"
            }`}
          >
            {/* Header */}
            <div className="relative p-6 text-center border-b border-white/10">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20">
                <svg
                  className="w-8 h-8 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                NFT Minted Successfully!
              </h2>
              <p className="text-white/70 text-sm">
                Your NFT has been successfully minted to your wallet
              </p>

              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close modal"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* NFT Details */}
            {mintedNftData && (
              <div className="p-6 space-y-4">
                {/* NFT Image */}
                {mintedNftData.image_url && (
                  <div className="relative overflow-hidden rounded-xl">
                    <img
                      src={mintedNftData.image_url}
                      alt={mintedNftData.name}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                )}

                {/* NFT Info */}
                <div className="space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {mintedNftData.name}
                    </h3>
                    {mintedNftData.description && (
                      <p className="text-white/70 text-sm">
                        {mintedNftData.description}
                      </p>
                    )}
                  </div>

                  {/* Recipient Info */}
                  <div className="pt-3 border-t border-white/10">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/60">Minted to:</span>
                      <span className="text-white font-mono">
                        {formatWalletAddress(walletAddress)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="p-6 pt-0">
              <button
                onClick={handleClose}
                className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                  isNSCollection
                    ? "bg-white text-black hover:bg-white/90"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                } transform hover:scale-[1.02] active:scale-[0.98]`}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    );

    // Render using portal to avoid z-index issues
    return typeof window !== "undefined"
      ? createPortal(modalContent, document.body)
      : null;
  }
);

NFTSuccessModal.displayName = "NFTSuccessModal";

export { NFTSuccessModal };
