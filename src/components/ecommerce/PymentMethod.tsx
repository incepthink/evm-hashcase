"use client";

import { useEffect, useState } from "react";
import { CreditCard } from "lucide-react";

type PaymentType = "card" | "upi";

interface CardPayment {
  type: "card";
  card_number: string;
  card_type: "debit" | "credit";
  network: string;
  expiry: string;
}

interface UPIPayment {
  type: "upi";
  upi_id: string;
  linked_bank: string;
}

export type PaymentMethodData =
  | (CardPayment & { bill_amount: number })
  | (UPIPayment & { bill_amount: number })
  | null;

interface PaymentMethodProps {
  billAmount: number;
  onChange: (data: PaymentMethodData) => void;
}

const inputClass =
  "w-full border border-[#1e2a4a] bg-[#0d1231] text-white px-4 py-2 rounded-lg text-sm outline-none focus:border-[#2979FF] transition-colors placeholder-gray-600";

export default function PaymentMethod({ billAmount, onChange }: PaymentMethodProps) {
  const [paymentType, setPaymentType] = useState<PaymentType>("upi");

  // Card fields
  const [cardNumber, setCardNumber] = useState("");
  const [cardType, setCardType] = useState<"debit" | "credit">("debit");
  const [network, setNetwork] = useState("");
  const [expiry, setExpiry] = useState("");

  // UPI fields
  const [upiId, setUpiId] = useState("");
  const [linkedBank, setLinkedBank] = useState("");

  useEffect(() => {
    if (paymentType === "card") {
      if (!cardNumber || !network || !expiry) {
        onChange(null);
        return;
      }
      onChange({
        bill_amount: billAmount,
        type: "card",
        card_number: cardNumber,
        card_type: cardType,
        network,
        expiry,
      });
    } else {
      if (!upiId) {
        onChange(null);
        return;
      }
      onChange({
        bill_amount: billAmount,
        type: "upi",
        upi_id: upiId,
        linked_bank: linkedBank,
      });
    }
  }, [
    billAmount,
    paymentType,
    cardNumber,
    cardType,
    network,
    expiry,
    upiId,
    linkedBank,
    onChange,
  ]);

  return (
    <div>
      <div className="flex items-center gap-2 mt-8 mb-6">
        <CreditCard size={24} className="text-[#2979FF]" />
        <h2 className="text-2xl font-semibold text-white">Payment</h2>
      </div>

      <div className="flex flex-col gap-4">
        {/* Payment type toggle */}
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-gray-400 uppercase tracking-wide">
            Payment Method
          </p>
          <div className="flex gap-2">
            {(["upi", "card"] as PaymentType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setPaymentType(type)}
                className={`px-5 cursor-pointer py-2 rounded-lg text-sm font-medium transition-opacity bg-[#2979FF] text-white ${
                  paymentType === type ? "opacity-100" : "opacity-40"
                }`}
              >
                {type.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Card fields */}
        {paymentType === "card" && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-white">
                Card Number <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={cardNumber}
                onChange={(e) =>
                  setCardNumber(e.target.value.replace(/\D/g, ""))
                }
                placeholder="12–19 digit card number"
                maxLength={19}
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-white">
                Card Type
              </label>
              <select
                value={cardType}
                onChange={(e) =>
                  setCardType(e.target.value as "debit" | "credit")
                }
                className={inputClass}
              >
                <option value="debit">Debit</option>
                <option value="credit">Credit</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-white">
                Network <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={network}
                onChange={(e) => setNetwork(e.target.value)}
                placeholder="e.g. Visa, Mastercard, RuPay"
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-white">
                Expiry <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                placeholder="MM/YY"
                maxLength={5}
                className={inputClass}
              />
            </div>
          </div>
        )}

        {/* UPI fields */}
        {paymentType === "upi" && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-white">
                UPI ID <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="user@okaxis"
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-white">
                Linked Bank{" "}
                <span className="text-gray-500 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={linkedBank}
                onChange={(e) => setLinkedBank(e.target.value)}
                placeholder="e.g. HDFC, ICICI"
                className={inputClass}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
