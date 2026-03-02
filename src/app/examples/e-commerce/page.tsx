"use client";

import axiosInstance from "@/utils/axios";
import { useCart } from "@/context/ecommerce/CartContext";
import { useApp } from "@/context/ecommerce/AppContext";
import { useSearchParams, useRouter } from "next/navigation";
import React, { useEffect, useState, Suspense } from "react";

export const USER_ID = 41; //48

type Product = {
  id: number;
  name: string;
  description: string;
  image: string;
  price: string;
  owner_id: number;
};

function CartIcon() {
  const { totalItems } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <button
      onClick={() =>
        router.push(
          `/examples/e-commerce/checkout?owner_id=${searchParams.get("owner_id") ?? ""}`,
        )
      }
      className="relative p-2"
      aria-label="Cart"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-7 w-7 text-white"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6h11M10 19a1 1 0 100 2 1 1 0 000-2zm7 0a1 1 0 100 2 1 1 0 000-2z"
        />
      </svg>
      {totalItems > 0 && (
        <span className="absolute -top-1 -right-1 bg-indigo-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
          {totalItems > 99 ? "99+" : totalItems}
        </span>
      )}
    </button>
  );
}

function ProductCard({ product }: { product: Product }) {
  const { cart, addToCart, removeFromCart } = useCart();
  const cartItem = cart.find((item) => item.id === product.id);
  const quantity = cartItem?.quantity ?? 0;

  return (
    <div className="bg-[#0a0f2e] border border-[#1a2050] rounded-2xl overflow-hidden flex flex-col">
      <div className="relative w-full aspect-square bg-[#060b1e]">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://placehold.co/400x400/0a0f2e/6366f1?text=No+Image";
          }}
        />
      </div>
      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="font-semibold text-white text-lg leading-tight">
          {product.name}
        </h3>
        <p className="text-gray-400 text-sm flex-1 line-clamp-2">
          {product.description}
        </p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-indigo-400 font-bold text-lg">
            ${product.price}
          </span>
          {quantity === 0 ? (
            <button
              onClick={() => addToCart(product)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-colors"
            >
              Add to Cart
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => removeFromCart(product.id)}
                className="w-8 h-8 rounded-lg bg-[#1a2050] hover:bg-[#252d6b] text-white font-bold flex items-center justify-center transition-colors"
              >
                −
              </button>
              <span className="text-white font-semibold w-5 text-center">
                {quantity}
              </span>
              <button
                onClick={() => addToCart(product)}
                className="w-8 h-8 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center justify-center transition-colors"
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CheckoutBar() {
  const { cart, totalItems } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();

  const total = cart
    .reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0)
    .toFixed(2);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 transition-transform duration-300 ${
        totalItems > 0 ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="bg-[#0a0f2e] border-t border-[#1a2050] px-6 py-4 flex items-center justify-between max-w-5xl mx-auto">
        <div className="text-white">
          <span className="text-gray-400 text-sm">
            {totalItems} item{totalItems !== 1 ? "s" : ""}
          </span>
          <p className="font-bold text-xl">${total}</p>
        </div>
        <button
          onClick={() =>
            router.push(
              `/examples/e-commerce/checkout?owner_id=${searchParams.get("owner_id") ?? ""}`,
            )
          }
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
        >
          Checkout →
        </button>
      </div>
    </div>
  );
}

function EcommerceContent() {
  const owner_id = useSearchParams().get("owner_id");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [offChainPointsState, setOffChainPointsState] = useState(0);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const checkInResponse = await axiosInstance.get(
        "/platform/user/achievements/loyalty-points",
        {
          params: {
            user_id: USER_ID,
            owner_id: owner_id,
          },
        },
      );
      const user_achievements = checkInResponse.data.total_points;
      setOffChainPointsState(user_achievements);

      const response = await axiosInstance.get(
        "/owner/product/owner/" + owner_id,
      );
      setProducts(response.data.products ?? []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (owner_id) {
      fetchProducts();
    }
  }, [owner_id]);

  return (
    <div className="bg-[#00041F] min-h-screen text-white pb-28">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center py-5 border-b border-[#1a2050]">
          <h1 className="text-xl font-bold tracking-wide">{"Hashcase"}</h1>
          <CartIcon />
        </div>

        <div className="flex gap-2 text-3xl font-semibold mt-8">
          <p className="text-indigo-500">User Loyalty Points:</p>
          <p>{offChainPointsState}</p>
        </div>

        {/* Products Grid */}
        <div className="mt-8">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-[#0a0f2e] border border-[#1a2050] rounded-2xl overflow-hidden animate-pulse"
                >
                  <div className="aspect-square bg-[#1a2050]" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-[#1a2050] rounded w-3/4" />
                    <div className="h-3 bg-[#1a2050] rounded w-full" />
                    <div className="h-3 bg-[#1a2050] rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-gray-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mb-4 opacity-30"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <p className="text-lg">No products found</p>
            </div>
          )}
        </div>
      </div>

      <CheckoutBar />
    </div>
  );
}

export default function EcommercePage() {
  return (
    <Suspense>
      <EcommerceContent />
    </Suspense>
  );
}
