"use client";

import { useState, Fragment } from "react";
import { X, UploadCloud, Loader } from "lucide-react";
import { useContracts } from "../contexts/ContractsContext";
import { toast } from "react-hot-toast";

interface MintNFTModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MintNFTModal({ isOpen, onClose }: MintNFTModalProps) {
  const { mintPropertyNFT, refreshAllData } = useContracts();
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isMinting, setIsMinting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    propertyValue: "",
    location: "",
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image || !formData.name) {
      toast.error("Please fill all required fields and upload an image.");
      return;
    }

    setIsUploading(true);
    try {
      const form = new FormData();
      form.append("image", image);
      form.append("name", formData.name);
      form.append("description", formData.description);
      form.append("propertyValue", formData.propertyValue);
      form.append("location", formData.location);

      const res = await fetch("/api/upload-to-ipfs", {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        throw new Error("Failed to upload to IPFS. Please try again.");
      }
      const { metadataUrl } = await res.json();
      setIsUploading(false);

      setIsMinting(true);
      const txHash = await mintPropertyNFT(metadataUrl);

      if (txHash) {
        await refreshAllData();
        onClose();
      }
    } catch (error: any) {
      console.error("Minting process failed:", error);
      toast.error(`An unexpected error occurred: ${error.message}`);
    } finally {
      setIsUploading(false);
      setIsMinting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">
            Mint a New Property NFT
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Form fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-medium text-gray-300"
              >
                Property Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border-gray-700 rounded-lg p-3 text-white focus:ring-cyan-500 focus:border-cyan-500"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="propertyValue"
                className="text-sm font-medium text-gray-300"
              >
                Property Value (USD)
              </label>
              <input
                type="number"
                name="propertyValue"
                id="propertyValue"
                required
                value={formData.propertyValue}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border-gray-700 rounded-lg p-3 text-white focus:ring-cyan-500 focus:border-cyan-500"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label
              htmlFor="location"
              className="text-sm font-medium text-gray-300"
            >
              Location (e.g., City, State)
            </label>
            <input
              type="text"
              name="location"
              id="location"
              required
              value={formData.location}
              onChange={handleInputChange}
              className="w-full bg-gray-800 border-gray-700 rounded-lg p-3 text-white focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="description"
              className="text-sm font-medium text-gray-300"
            >
              Description
            </label>
            <textarea
              name="description"
              id="description"
              rows={4}
              required
              value={formData.description}
              onChange={handleInputChange}
              className="w-full bg-gray-800 border-gray-700 rounded-lg p-3 text-white focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              Property Image
            </label>
            <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-600 px-6 py-10">
              <div className="text-center">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="mx-auto h-48 w-auto rounded-lg object-cover"
                  />
                ) : (
                  <UploadCloud className="mx-auto h-12 w-12 text-gray-500" />
                )}
                <div className="mt-4 flex text-sm leading-6 text-gray-400">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer rounded-md font-semibold text-cyan-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-cyan-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-900 hover:text-cyan-500"
                  >
                    <span>Upload a file</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs leading-5 text-gray-400">
                  PNG, JPG, GIF up to 10MB
                </p>
              </div>
            </div>
          </div>
          <div className="pt-6 border-t border-gray-700">
            <button
              type="submit"
              disabled={isUploading || isMinting}
              className="w-full flex justify-center items-center gap-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              {(isUploading || isMinting) && (
                <Loader className="w-5 h-5 animate-spin" />
              )}
              {isUploading
                ? "Uploading to IPFS..."
                : isMinting
                ? "Minting NFT..."
                : "Mint Property NFT"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
