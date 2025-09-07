// components/quests/ConnectWalletMessage.tsx
"use client";

import { useGlobalAppStore } from "@/store/globalAppStore";

export const ConnectWalletMessage: React.FC = () => {
  const { setOpenModal } = useGlobalAppStore();

  return (
    <div className="text-center py-12">
      <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700 max-w-md mx-auto">
        <div className="mb-6">
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Wallet Required
          </h3>
          <p className="text-gray-300 text-sm">
            Connect your wallet to view and claim quest rewards
          </p>
        </div>

        <button
          onClick={() => setOpenModal(true)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
        >
          Connect Wallet
        </button>
      </div>
    </div>
  );
};
