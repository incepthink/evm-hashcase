"use client";
import React, {
  useState,
  useRef,
  ChangeEvent,
  useCallback,
  Dispatch,
  SetStateAction,
} from "react";
import { MdDelete } from "react-icons/md";
import { useDropzone } from "react-dropzone";

interface UploadImageProps {
  label: string;
  file: File | null;
  setFile: Dispatch<SetStateAction<File | null>>;
  progress: number;
  setProgress: Dispatch<SetStateAction<number>>;
  imageUrl: string;
  setImageUrl: Dispatch<SetStateAction<string>>;
  oldImageUrl: string;
}

const UploadImage: React.FC<UploadImageProps> = ({
  label,
  file,
  setFile,
  progress,
  setProgress,
  imageUrl,
  setImageUrl,
  oldImageUrl,
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadUrl, setUploadUrl] = useState("");
  const [fileUrl, setFileUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    if (selectedFile) {
      setFile(selectedFile);
      setImageUrl("");
      setUploadUrl("");
    }
  };

  const resetForm = () => {
    setFile(null);
    setUploadUrl("");
    setImageUrl("");
    setProgress(0);
    setFileUrl("");
    setErrorMessage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const droppedFile = acceptedFiles[0];
    const maxFileSizeInBytes = 50 * 1024 * 1024; // 50MB

    if (droppedFile.size > maxFileSizeInBytes) {
      setErrorMessage("File size exceeds 50MB limit.");
      setFile(null);
      return;
    }

    setFile(droppedFile);
    setErrorMessage("");
    setFileUrl(URL.createObjectURL(droppedFile));
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpeg", ".jpg"],
      "image/png": [".png"],
    },
  });

  return (
    <div className="mb-4">
      {file && (
        <div className="mb-2">
          <p className="text-sm text-gray-600">
            Selected file: <span className="font-medium">{file.name}</span> (
            {Math.round(file.size / 1024)} KB)
          </p>
        </div>
      )}

      <label className="block text-sm font-semibold mb-1 text-white">
        {label}
      </label>
      <div
        className={`px-4 py-3 bg-[#171821] rounded-lg outline-none border-[1.5px] border-dashed w-full ${
          errorMessage ? "border-[#FB2424]" : "border-white border-opacity-20"
        }`}
        {...getRootProps()}
      >
        <input {...getInputProps()} />
        {file ? (
          <div className="space-y-1">
            <p>
              Choose another file{" "}
              <span className="text-[#00F58C] underline">Browse File</span>
            </p>
            <p className="text-white text-opacity-40 text-sm">
              {file.name.substring(0, 25)}
              {file.name.length > 25 && "..."}
            </p>
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center gap-1 py-4 lg:py-6 text-white text-sm text-opacity-60">
            <p>Choose a file or drag & drop it here</p>
            <p>JPEG, PNG, up to 50MB</p>
            <p className="text-[#00F58C] underline">Browse File</p>
          </div>
        )}
      </div>

      {uploading && (
        <div className="mb-4 mt-2">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-1">Uploading: {progress}%</p>
        </div>
      )}

      {(fileUrl || imageUrl || oldImageUrl) && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            {fileUrl || imageUrl ? `New ${label}` : `Old ${label}`}
          </h3>
          <div className="border rounded-md p-2 relative">
            <img
              src={fileUrl || imageUrl || oldImageUrl}
              alt="Preview"
              className="max-w-full h-auto max-h-64 mx-auto object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/image-placeholder.svg";
              }}
            />

            {(fileUrl || imageUrl) && (
              <button
                onClick={resetForm}
                className="p-2 rounded-full bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 absolute top-2 right-2"
              >
                <MdDelete />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadImage;
