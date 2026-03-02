export interface RewardLabelInput {
  type: string;
  discountType?: string | null;
  discountValue?: string | null;
  products?: Array<{ name: string }> | null;
}

export function getRewardLabel(reward: RewardLabelInput): string {
  const { type, discountType, discountValue, products } = reward;
  const value = discountValue ? parseFloat(discountValue) : 0;
  const itemLabel = products?.length ? products.map((p) => p.name).join(", ") : "item";

  if (type === "DISCOUNT_ON_TOTAL") {
    if (discountType === "PERCENTAGE") {
      return `Get ${value}% Discount on your total bill amount`;
    }
    if (discountType === "FIXED_AMOUNT") {
      return `Get ${value} INR off on your total bill amount`;
    }
  }

  if (type === "DISCOUNT_ON_ITEM") {
    if (discountType === "PERCENTAGE") {
      return `Get ${value}% Discount on ${itemLabel}`;
    }
    if (discountType === "FIXED_AMOUNT") {
      return `Get ${value} INR off on ${itemLabel}`;
    }
  }

  if (type === "GENERIC_FREE_PRODUCT") {
    return `Get Free ${itemLabel}!`;
  }

  return type
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
