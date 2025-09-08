import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import clsx from "clsx";
import "../globals.css";
import { TanstackProvider } from "@/components/TanstackProvider";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Toaster } from "react-hot-toast";
import WalletConnectionModal from "@/components/WalletConnectionModal";

const dmSans = DM_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Quests - Hashcase",
  description: "Complete quests to earn loyalty points",
};

export default function QuestsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={clsx(dmSans.className, "antialiased")}>
      <TanstackProvider>
        <Toaster />
        {children}
        <WalletConnectionModal />
        <ToastContainer />
      </TanstackProvider>
    </div>
  );
}
