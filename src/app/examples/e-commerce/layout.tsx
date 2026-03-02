"use client";

import { CartProvider } from "@/context/ecommerce/CartContext";
import { AppProvider } from "@/context/ecommerce/AppContext";

export default function EcommerceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppProvider>
      <CartProvider>{children}</CartProvider>
    </AppProvider>
  );
}
