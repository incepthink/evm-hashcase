"use client";
import { useAuthCallback } from "@mysten/enoki/react";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function AuthPage() {
  const { handled } = useAuthCallback();

  useEffect(() => {
    if (handled) {
      // Check if there's a stored redirect URL from ZK login
      const storedRedirectUrl = localStorage.getItem("zklogin_redirect_url");

      if (storedRedirectUrl) {
        // Clear the stored URL and redirect to the original page
        localStorage.removeItem("zklogin_redirect_url");
        window.location.href = storedRedirectUrl;
      } else {
        // Default redirect to home page
        window.location.href = "/";
      }
    }
  }, [handled]);

  return (
    <div className="flex justify-center items-center h-screen bg-[#00041F]">
      <Loader2 className="animate-spin h-16 w-16 text-white" />
    </div>
  );
}
