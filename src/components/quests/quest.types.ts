// types/quest.ts
export interface Quest {
  id: number;
  title: string;
  description: string;
  quest_code: string;
  points_reward: number;
  is_completed?: boolean;
  owner_id: number;
  created_at: string;
  updated_at: string;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  image_uri: string;
  attributes: string;
  owner_id: number;
}

export interface MintedNFTData {
  name: string;
  description: string;
  image_url: string;
  recipient: string;
}

export type SupportedChain = "sui" | "ethereum" | "polygon" | "solana" | "base" | "arbitrum";