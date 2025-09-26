export interface TokenErc20 {
  id: number;
  name: string;
  symbol: string;
  description?: string;
  logo_url?: string;
  owner_id: number;
  wallet_address: string;
  total_supply: string;
  contract_id?: number;
  createdAt: string;
  updatedAt: string;
}

export interface TokensApiResponse {
  success: boolean;
  message: string;
  data: {
    user_address: string;
    user_id?: number;
    tokens: TokenErc20[];
    count: number;
  };
}