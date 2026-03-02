"use client";

import { useCallback, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axiosInstance from "@/utils/axios";
import { notify } from "@/utils/notify";
import LoyaltyCart from "@/components/ecommerce/LoyaltyCart";
import RewardsCart, {
  RewardDiscount,
} from "@/components/ecommerce/RewardsCart";
import OrderSummary from "@/components/ecommerce/OrderSummary";
import { useCart } from "@/context/ecommerce/CartContext";
import { USER_ID } from "../page";

function computeDiscountedAmount(
  subtotal: number,
  discount: RewardDiscount,
  cart: ReturnType<typeof useCart>["cart"],
): number | null {
  if (!discount.discountValue) return null;
  const val = parseFloat(discount.discountValue);
  if (isNaN(val)) return null;

  if (discount.type === "DISCOUNT_ON_TOTAL") {
    if (discount.discountType === "PERCENTAGE")
      return Math.max(0, subtotal * (1 - val / 100));
    if (discount.discountType === "FIXED_AMOUNT")
      return Math.max(0, subtotal - val);
  }

  if (discount.type === "DISCOUNT_ON_ITEM" && discount.product_ids?.length) {
    const matchedItems = cart.filter((item) =>
      discount.product_ids!.includes(item.id),
    );
    if (matchedItems.length === 0) return null;
    const matchedSubtotal = matchedItems.reduce(
      (sum, item) => sum + parseFloat(item.price) * item.quantity,
      0,
    );
    const unmatchedSubtotal = subtotal - matchedSubtotal;
    if (discount.discountType === "PERCENTAGE") {
      return unmatchedSubtotal + matchedSubtotal * (1 - val / 100);
    }
    if (discount.discountType === "FIXED_AMOUNT") {
      return unmatchedSubtotal + Math.max(0, matchedSubtotal - val);
    }
  }

  return null;
}

function CheckoutContent() {
  const { cart, addToCart, removeFromCart } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  const ownerId = searchParams.get("owner_id")
    ? Number(searchParams.get("owner_id"))
    : null;

  const [selectedLoyaltyId, setSelectedLoyaltyId] = useState<number | null>(
    null,
  );
  const [selectedLoyaltyCode, setSelectedLoyaltyCode] = useState<string | null>(
    null,
  );
  const [selectedRewardId, setSelectedRewardId] = useState<number | null>(null);
  const [selectedRewardLabel, setSelectedRewardLabel] = useState<string | null>(
    null,
  );
  const [selectedRewardDiscount, setSelectedRewardDiscount] =
    useState<RewardDiscount | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleLoyaltySelect = useCallback(
    (id: number | null, code: string | null) => {
      setSelectedLoyaltyId(id);
      setSelectedLoyaltyCode(code);
    },
    [],
  );

  const handleRewardSelect = useCallback(
    (
      id: number | null,
      label: string | null,
      discount: RewardDiscount | null,
    ) => {
      setSelectedRewardId(id);
      setSelectedRewardLabel(label);
      setSelectedRewardDiscount(discount);
    },
    [],
  );

  const subtotal = cart.reduce(
    (sum, item) => sum + parseFloat(item.price) * item.quantity,
    0,
  );
  const effectiveBillAmount = selectedRewardDiscount
    ? (computeDiscountedAmount(subtotal, selectedRewardDiscount, cart) ??
      subtotal)
    : subtotal;

  const handleSubmit = async () => {
    if (!ownerId) return;
    setSubmitting(true);
    try {
      await axiosInstance.post(
        "/platform/owner/order/create/demo",
        {
          user_id: USER_ID,
          bill_amount: effectiveBillAmount,
          selected_loyalty_id: selectedLoyaltyId,
          selected_reward_id: selectedRewardId,
          product_ids: cart.map((item) => item.id),
          status: "pending",
        },
        { params: { owner_id: ownerId } },
      );
      notify("Order created successfully!", "success");
    } catch {
      notify("Failed to create order. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#00041F] min-h-screen text-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() =>
              router.push(
                `/examples/e-commerce${ownerId ? `?owner_id=${ownerId}` : ""}`,
              )
            }
            className="p-2 rounded-lg hover:bg-[#0a0f2e] transition-colors"
            aria-label="Back"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h1 className="text-2xl font-bold">Checkout</h1>
        </div>

        {cart.length === 0 ? (
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
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6h11M10 19a1 1 0 100 2 1 1 0 000-2zm7 0a1 1 0 100 2 1 1 0 000-2z"
              />
            </svg>
            <p className="text-lg mb-4">Your cart is empty</p>
            <button
              onClick={() =>
                router.push(
                  `/examples/e-commerce${ownerId ? `?owner_id=${ownerId}` : ""}`,
                )
              }
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="space-y-4 mb-8">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#0a0f2e] border border-[#1a2050] rounded-2xl p-4 flex gap-4 items-center"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 rounded-xl object-cover bg-[#060b1e] flex-shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://placehold.co/80x80/0a0f2e/6366f1?text=?";
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate">
                      {item.name}
                    </h3>
                    <p className="text-indigo-400 font-bold mt-0.5">
                      ${item.price}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="w-8 h-8 rounded-lg bg-[#1a2050] hover:bg-[#252d6b] text-white font-bold flex items-center justify-center transition-colors"
                    >
                      −
                    </button>
                    <span className="text-white font-semibold w-6 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => addToCart(item)}
                      className="w-8 h-8 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center justify-center transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <p className="text-gray-300 font-semibold w-20 text-right flex-shrink-0">
                    ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <LoyaltyCart
              owner_id={ownerId}
              selectedLoyaltyId={selectedLoyaltyId}
              onSelect={handleLoyaltySelect}
            />
            <RewardsCart
              owner_id={ownerId}
              userId={USER_ID}
              selectedRewardId={selectedRewardId}
              onSelect={handleRewardSelect}
            />
            <OrderSummary
              userId={USER_ID}
              merchantId={ownerId}
              billAmount={subtotal}
              selectedLoyaltyId={selectedLoyaltyId}
              selectedRewardId={selectedRewardId}
              selectedLoyaltyCode={selectedLoyaltyCode}
              selectedRewardLabel={selectedRewardLabel}
              discountedBillAmount={
                selectedRewardDiscount
                  ? computeDiscountedAmount(
                      subtotal,
                      selectedRewardDiscount,
                      cart,
                    )
                  : null
              }
              onSubmit={handleSubmit}
              submitting={submitting}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense>
      <CheckoutContent />
    </Suspense>
  );
}
