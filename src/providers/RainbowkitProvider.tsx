// Minimal provider without styling
"use client";
import React, { ReactNode } from "react";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
// Remove this line: import '@rainbow-me/rainbowkit/styles.css';

const config = getDefaultConfig({
  appName: "Your App",
  projectId: "ecf169f1ed1534b70ed647ce6910990a",
  chains: [baseSepolia],
  ssr: true,
});

const queryClient = new QueryClient();

export default function RainbowkitProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {/* Remove RainbowKitProvider entirely if you don't need their UI */}
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
