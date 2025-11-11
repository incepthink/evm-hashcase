import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import clsx from "clsx";
import "./globals.css";
import { TanstackProvider } from "@/components/TanstackProvider";
import LayoutChrome from "@/components/LayoutChrome";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Toaster } from "react-hot-toast";
import WalletConnectionModal from "@/components/WalletConnectionModal";
import Footer from "@/components/Footer";
import RainbowkitProvider from "@/providers/RainbowkitProvider";
import PrivyLoginProvider from "@/providers/PrivyLoginProvider";
import { GoogleAnalytics } from "@next/third-parties/google";

const dmSans = DM_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Hashcase",
  description:
    "HashCase infra uses real assets and gamification to achieve user retention.",
  metadataBase: new URL("https://www.hashcase.co/"),
  openGraph: {
    images: [
      {
        url: "/hashCase-metadata-image.jpeg",
        width: 800,
        height: 600,
        alt: "HashCase image",
      },
    ],
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={clsx(dmSans.className, "antialiased")}>
        <PrivyLoginProvider>
          <RainbowkitProvider>
            <TanstackProvider>
              <Toaster />
              <LayoutChrome>{children}</LayoutChrome>
              <WalletConnectionModal />
              <ToastContainer />
            </TanstackProvider>
          </RainbowkitProvider>
        </PrivyLoginProvider>
        <GoogleAnalytics gaId="G-N13DDCYFYT" />
      </body>
    </html>
  );
}
