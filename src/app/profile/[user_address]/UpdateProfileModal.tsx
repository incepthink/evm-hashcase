import { useCallback, useState } from "react";
import axios from "axios";
import axiosInstance from "@/utils/axios";
import UploadImage from "@/components/UploadImage";

interface UserData {
  username: string;
  description: string;
  profile_image: string;
  banner_image: string;
}

interface ProfileModalProps {
  userData: UserData;
  onClose: () => void;
  onUpdate: () => void;
}

const UpdateProfileModal = ({
  userData,
  onClose,
  onUpdate,
}: ProfileModalProps) => {
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [profileProgress, setProfileProgress] = useState(0);
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [bannerImageUrl, setBannerImageUrl] = useState("");
  const [bannerProgress, setBannerProgress] = useState(0);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<UserData>({
    username: userData.username || "",
    description: userData.description || "",
    profile_image: userData.profile_image || "",
    banner_image: userData.banner_image || "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getUploadUrl = async (): Promise<string> => {
    try {
      const response = await axiosInstance.get("/platform/sui/profile/upload");
      const url = response.data.uploadURL; // Make sure this is the correct key
      if (!url) {
        throw new Error("uploadURL not found in response");
      }
      console.log("Received pre-signed URL:", url);
      return url;
    } catch (error) {
      console.error("Error getting upload URL:", error);
      alert("Failed to get upload URL");
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Defaults to current formData values
      let profileUrl = profileImageUrl || formData.profile_image;
      let bannerUrl = bannerImageUrl || formData.banner_image;

      // Upload profile image if file selected
      if (profileFile) {
        const url = await getUploadUrl();

        if (!url) throw new Error("Upload URL is undefined or empty");

        const response = await axios.put(url, profileFile, {
          headers: {
            "Content-Type": profileFile.type,
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setProfileProgress(percentCompleted);
            }
          },
        });

        if (response.status === 200) {
          const newUrl = url.split("?")[0];

          // ✅ delete old profile image if it exists and is different from the new one
          if (
            formData.profile_image &&
            formData.profile_image !== newUrl &&
            formData.profile_image !==
              "https://i.pinimg.com/564x/49/cc/10/49cc10386c922de5e2e3c0bb66956e65.jpg"
          ) {
            await axiosInstance.post("/platform/sui/profile/delete", {
              imageUrl: formData.profile_image,
            });
          }

          profileUrl = newUrl;
          setProfileImageUrl(profileUrl);
        } else {
          throw new Error("Profile image upload failed");
        }
      }

      // Upload banner image if file selected
      if (bannerFile) {
        const url = await getUploadUrl();

        if (!url) throw new Error("Upload URL is undefined or empty");

        const response = await axios.put(url, bannerFile, {
          headers: {
            "Content-Type": bannerFile.type,
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setBannerProgress(percentCompleted);
            }
          },
        });

        if (response.status === 200) {
          const newUrl = url.split("?")[0];

          // ✅ delete old banner image if it exists and is different from the new one
          if (
            formData.banner_image &&
            formData.banner_image !== newUrl &&
            formData.banner_image !==
              "https://i.pinimg.com/564x/49/cc/10/49cc10386c922de5e2e3c0bb66956e65.jpg"
          ) {
            await axiosInstance.post("/platform/sui/profile/delete", {
              imageUrl: formData.banner_image,
            });
          }

          bannerUrl = newUrl;
          setBannerImageUrl(bannerUrl);
        } else {
          throw new Error("Banner image upload failed");
        }
      }

      // Construct final form data with fallbacks
      const updatedFormData: UserData = {
        ...formData,
        profile_image: profileUrl, // fallback handled
        banner_image: bannerUrl, // fallback handled
      };

      const res = await axiosInstance.post("/user", updatedFormData);
      console.log(res);

      onUpdate();
      onClose();
    } catch (err) {
      setError("Failed to update profile. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gradient-to-b from-[#00041f] to-[#030828] rounded-lg shadow-xl w-full max-w-xl max-h-[calc(100vh-2rem)] my-auto overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-b from-[#00041f] to-[#030828] z-10 px-6 border-b py-4 border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Edit Profile</h2>
            <button
              onClick={onClose}
              className="text-gray-300 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto">
          {error && (
            <div className="mb-4 p-2 bg-red-500 text-white rounded text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                  minLength={3}
                  maxLength={30}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  rows={3}
                  maxLength={200}
                />
              </div>

              <div className="flex gap-4">
                <div className="w-1/2">
                  <UploadImage
                    label="Profile Image"
                    file={profileFile}
                    setFile={setProfileFile}
                    progress={profileProgress}
                    setProgress={setProfileProgress}
                    imageUrl={profileImageUrl}
                    setImageUrl={setProfileImageUrl}
                    oldImageUrl={formData.profile_image}
                  />
                </div>

                <div className="w-1/2">
                  <UploadImage
                    label="Banner Image"
                    file={bannerFile}
                    setFile={setBannerFile}
                    progress={bannerProgress}
                    setProgress={setBannerProgress}
                    imageUrl={bannerImageUrl}
                    setImageUrl={setBannerImageUrl}
                    oldImageUrl={formData.banner_image}
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-700 transition-colors"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 transition-colors flex items-center"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateProfileModal;
