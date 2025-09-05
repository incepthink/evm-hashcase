"use client";

import { PrivyProvider } from "@privy-io/react-auth";

export default function PrivyLoginProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      clientId={process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID!}
      config={{
        // Create embedded wallets for users who don't have a wallet
        embeddedWallets: {
          ethereum: {
            createOnLogin: "users-without-wallets",
          },
        },
        appearance: {
          theme: "dark", // Change from "light" to "dark"
          accentColor: "#676FFF", // Optional: customize accent color
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
