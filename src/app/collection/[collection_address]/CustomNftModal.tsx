import React, { useState } from "react";

import { useCurrentAccount } from "@mysten/dapp-kit";
import axiosInstance from "@/utils/axios";
import { toast } from "react-hot-toast";

import { X, HandCoins, Image as ImageIcon, FileText, Tag, Sparkles } from "lucide-react";

interface CustomNftModalProps {
  isOpen: boolean;
  nftCollectionAddress: string;
  collectionOwnerAddress: string; // Add collection owner address
  onClose: () => void;
  onMintSuccess?: () => void; // Callback to refresh the collection page
}

const CustomNftModal: React.FC<CustomNftModalProps> = ({
  isOpen,
  nftCollectionAddress,
  collectionOwnerAddress,
  onClose,
  onMintSuccess,
}) => {
  const currentAccount = useCurrentAccount();

  const [formValues, setFormValues] = useState({
    title: "",
    description: "",
    image_url: "",
    attributes: "",
    collection_id: nftCollectionAddress,
  });

  const [isLoading, setIsLoading] = useState(false);

  // Validation functions
  const validateImageUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const validateForm = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Title validation
    if (!formValues.title.trim()) {
      errors.push("Title is required");
    } else if (formValues.title.trim().length < 3) {
      errors.push("Title must be at least 3 characters long");
    } else if (formValues.title.trim().length > 100) {
      errors.push("Title must be less than 100 characters");
    }

    // Description validation
    if (!formValues.description.trim()) {
      errors.push("Description is required");
    } else if (formValues.description.trim().length < 10) {
      errors.push("Description must be at least 10 characters long");
    } else if (formValues.description.trim().length > 500) {
      errors.push("Description must be less than 500 characters");
    }

    // Image URL validation
    if (!formValues.image_url.trim()) {
      errors.push("Image URL is required");
    } else if (!validateImageUrl(formValues.image_url.trim())) {
      errors.push("Please enter a valid image URL (must start with http:// or https://)");
    }

    // Attributes validation (optional but if provided, validate format)
    if (formValues.attributes.trim()) {
      const attributes = formValues.attributes.split(',').map(attr => attr.trim());
      if (attributes.some(attr => attr.length === 0)) {
        errors.push("Attributes cannot contain empty values");
      }
      if (attributes.some(attr => attr.length > 50)) {
        errors.push("Each attribute must be less than 50 characters");
      }
    }

    return { isValid: errors.length === 0, errors };
  };

  const handleFreeMint = async () => {
    if (!currentAccount?.address) {
      toast.error("Please connect your wallet");
      return;
    }

    // Validate form
    const validation = validateForm();
    if (!validation.isValid) {
      validation.errors.forEach(error => toast.error(error));
      return;
    }

    setIsLoading(true);
    try {
      // Use the backend API for minting
      const response = await axiosInstance.post(
        "/platform/sui/mint-nft",
        {
          collection_id: "0x79e4f927919068602bae38387132f8c0dd52dc3207098355ece9e9ba61eb2290",
          name: formValues.title.trim(),
          description: formValues.description.trim(),
          image_url: formValues.image_url.trim(),
          attributes: formValues.attributes.trim() ? formValues.attributes.split(",").map(attr => attr.trim()) : [],
          recipient: "0x79e4f927919068602bae38387132f8c0dd52dc3207098355ece9e9ba61eb2290", // Mint to collection address so it appears in collection assets
        }
      );

      if (response.data.success) {
        toast.success(`Custom NFT "${formValues.title}" minted successfully!`);
        console.log("Minted NFT:", response.data);
        
        // Call the refresh callback to update the collection page
        if (onMintSuccess) {
          onMintSuccess();
        }
        
        // Reset form
        setFormValues({
          title: "",
          description: "",
          image_url: "",
          attributes: "",
          collection_id: nftCollectionAddress,
        });
        
        onClose();
      } else {
        toast.error(response.data.message || "Failed to mint NFT");
      }
    } catch (error: any) {
      console.error("Minting failed:", error);
      const errorMessage = error.response?.data?.message || error.response?.data?.missing || "Failed to mint NFT";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormValues({ ...formValues, [name]: value });
  };

  if (!isOpen || !nftCollectionAddress) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md z-[9999] p-4"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-br from-[#00041f] via-[#030828] to-[#00041f] border border-white/20 rounded-2xl shadow-2xl text-white relative w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-6 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-[#4DA2FF] to-[#7ab8ff] rounded-lg">
              <Sparkles size={20} className="text-black" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Create Custom NFT</h2>
              <p className="text-sm text-white/60">Design your unique digital asset</p>
            </div>
          </div>
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            <form className="space-y-5">
              {/* Title Field */}
              <div className="space-y-2">
                <label
                  htmlFor="title"
                  className="flex items-center gap-2 text-sm font-medium text-white/80"
                >
                  <FileText size={16} />
                  NFT Title *
                </label>
                <input
                  name="title"
                  id="title"
                  type="text"
                  placeholder="Enter a unique title for your NFT"
                  value={formValues.title}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-white/5 backdrop-blur-sm rounded-xl border focus:outline-none focus:ring-2 focus:border-[#4DA2FF]/50 placeholder:text-white/40 text-white transition-all duration-200 ${
                    formValues.title && (formValues.title.length < 3 || formValues.title.length > 100)
                      ? 'border-red-400 focus:ring-red-400/50'
                      : formValues.title
                      ? 'border-green-400/50 focus:ring-green-400/50'
                      : 'border-white/20 focus:ring-[#4DA2FF]/50'
                  }`}
                />
                {formValues.title && (
                  <p className={`text-xs ${formValues.title.length < 3 || formValues.title.length > 100 ? 'text-red-400' : 'text-green-400'}`}>
                    {formValues.title.length}/100 characters
                  </p>
                )}
              </div>

              {/* Description Field */}
              <div className="space-y-2">
                <label
                  htmlFor="description"
                  className="flex items-center gap-2 text-sm font-medium text-white/80"
                >
                  <FileText size={16} />
                  Description *
                </label>
                <textarea
                  name="description"
                  id="description"
                  placeholder="Describe your NFT in detail"
                  value={formValues.description}
                  onChange={handleInputChange}
                  rows={3}
                  className={`w-full px-4 py-3 bg-white/5 backdrop-blur-sm rounded-xl border focus:outline-none focus:ring-2 focus:border-[#4DA2FF]/50 placeholder:text-white/40 text-white transition-all duration-200 resize-none ${
                    formValues.description && (formValues.description.length < 10 || formValues.description.length > 500)
                      ? 'border-red-400 focus:ring-red-400/50'
                      : formValues.description
                      ? 'border-green-400/50 focus:ring-green-400/50'
                      : 'border-white/20 focus:ring-[#4DA2FF]/50'
                  }`}
                />
                {formValues.description && (
                  <p className={`text-xs ${formValues.description.length < 10 || formValues.description.length > 500 ? 'text-red-400' : 'text-green-400'}`}>
                    {formValues.description.length}/500 characters
                  </p>
                )}
              </div>

              {/* Image URL Field */}
              <div className="space-y-2">
                <label
                  htmlFor="image_url"
                  className="flex items-center gap-2 text-sm font-medium text-white/80"
                >
                  <ImageIcon size={16} />
                  Image URL *
                </label>
                <input
                  name="image_url"
                  id="image_url"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={formValues.image_url}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-white/5 backdrop-blur-sm rounded-xl border focus:outline-none focus:ring-2 focus:border-[#4DA2FF]/50 placeholder:text-white/40 text-white transition-all duration-200 ${
                    formValues.image_url && !validateImageUrl(formValues.image_url)
                      ? 'border-red-400 focus:ring-red-400/50'
                      : formValues.image_url && validateImageUrl(formValues.image_url)
                      ? 'border-green-400/50 focus:ring-green-400/50'
                      : 'border-white/20 focus:ring-[#4DA2FF]/50'
                  }`}
                />
                {formValues.image_url && (
                  <p className={`text-xs ${validateImageUrl(formValues.image_url) ? 'text-green-400' : 'text-red-400'}`}>
                    {validateImageUrl(formValues.image_url) ? 'Valid URL' : 'Invalid URL format'}
                  </p>
                )}
              </div>

              {/* Attributes Field */}
             
            </form>

            {/* Preview Section */}
            {formValues.image_url && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-white/80">Preview</p>
                <div className="relative aspect-square rounded-xl overflow-hidden border border-white/20 max-h-48">
                  <img
                    src={formValues.image_url}
                    alt="NFT Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "https://via.placeholder.com/300x300/1a1a2e/ffffff?text=Invalid+Image";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-white font-semibold text-sm truncate">
                      {formValues.title || "Untitled NFT"}
                    </h3>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="p-6 border-t border-white/10 flex-shrink-0">
          <div className="flex flex-col gap-3">
            <button
              onClick={handleFreeMint}
              disabled={!formValues.title || !formValues.description || !formValues.image_url || isLoading}
              className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-gradient-to-r from-[#4DA2FF] to-[#7ab8ff] hover:from-[#3a8fef] hover:to-[#6aa7f0] disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed rounded-xl font-semibold text-black transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Minting...
                </>
              ) : (
                <>
                  <HandCoins size={20} />
                  Mint NFT
                </>
              )}
            </button>
            
            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/20 rounded-xl font-medium text-white transition-all duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomNftModal;
