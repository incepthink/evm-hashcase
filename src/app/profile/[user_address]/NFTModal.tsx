import React from "react";
import { X, Diamond, Square } from "lucide-react";

type NFT = {
  attributes?: string[];
  collection_id: string;
  creator: string;
  description?: string;
  id: { id: string };
  image_url: string;
  metadata_version: string;
  mint_price: string;
  name: string;
  token_number: string;
};

interface NFTModalProps {
  nft: NFT | null;
  isOpen: boolean;
  onClose: () => void;
  onClaimNFT: (nft: NFT) => void;
  onUpdateMetadata: (nft: NFT) => void;
}

const NFTModal: React.FC<NFTModalProps> = ({
  nft,
  isOpen,
  onClose,
  onClaimNFT,
  onUpdateMetadata,
}) => {
  if (!isOpen || !nft) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl border border-white/20 w-full max-w-sm overflow-hidden shadow-2xl">
        {/* Header with close button */}
        <div className="flex justify-between items-center p-3 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">NFT Details</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* NFT Image */}
        <div className="relative aspect-square">
          <img
            src={nft.image_url || "https://via.placeholder.com/300"}
            alt={nft.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* NFT Information */}
        <div className="p-4 space-y-3">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">{nft.name}</h3>
            <p className="text-gray-300 text-xs">{nft.description}</p>
          </div>

          {/* NFT Properties */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Collection ID:</span>
              <span className="text-white">
                {nft.collection_id && nft.collection_id.length > 8
                  ? `${nft.collection_id.substring(0, 8)}...`
                  : nft.collection_id || "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Creator:</span>
              <span className="text-white">
                {nft.creator && nft.creator.length > 8
                  ? `${nft.creator.substring(0, 8)}...`
                  : nft.creator || "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Token Number:</span>
              <span className="text-white">{nft.token_number || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Mint Price:</span>
              <span className="text-white">{nft.mint_price || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Metadata Version:</span>
              <span className="text-white">{nft.metadata_version || "N/A"}</span>
            </div>
          </div>

          {/* Attributes */}
          {nft.attributes && nft.attributes.length > 0 && (
            <div>
              <h4 className="text-cyan-400 font-semibold mb-1 text-xs">Attributes:</h4>
              <div className="space-y-1">
                {nft.attributes.map((attr, index) => (
                  <div key={index} className="text-xs text-gray-300">
                    {attr}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-3">
            <button
              onClick={() => onClaimNFT(nft)}
              className="flex-1 bg-transparent border border-white text-white py-2 px-3 rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center gap-1 text-xs"
            >
              <Diamond size={12} />
              Claim NFT
            </button>
            <button
              onClick={() => onUpdateMetadata(nft)}
              className="flex-1 bg-transparent border border-white text-white py-2 px-3 rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center gap-1 text-xs"
            >
              <Square size={12} />
              Update NFT Metadata
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFTModal; 