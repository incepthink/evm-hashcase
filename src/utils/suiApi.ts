import axiosInstance from './axios';

// Types for API requests
export interface MintNftRequest {
  userAddress: string;
  nftForm: {
    collection_id: string;
    title: string;
    description?: string;
    image_url: string;
    attributes: string;
  };
}

export interface AddLoyaltyPointsRequest {
  userAddress: string;
  points: number;
}

export interface ContractInfo {
  packageId: string;
  adminCapId: string;
  publisherId: string;
  upgradeCapId: string;
  loyaltyTreasuryCapId: string;
  loyaltyTokenPolicyCapId: string;
}

// Sui API Service
export class SuiApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API || 'http://localhost:8001';
  }

  /**
   * Mint an NFT using the backend service
   */
  async mintNft(request: MintNftRequest) {
    try {
      const response = await axiosInstance.post('/sui/nft/mint', request);
      return response.data;
    } catch (error) {
      console.error('Error minting NFT:', error);
      throw error;
    }
  }

  /**
   * Add loyalty points to a user
   */
  async addLoyaltyPoints(request: AddLoyaltyPointsRequest) {
    try {
      const response = await axiosInstance.post('/sui/loyalty/add-points', request);
      return response.data;
    } catch (error) {
      console.error('Error adding loyalty points:', error);
      throw error;
    }
  }

  /**
   * Get user's loyalty token balance
   */
  async getLoyaltyBalance(userAddress: string) {
    try {
      const response = await axiosInstance.get(`/sui/loyalty/balance?userAddress=${userAddress}`);
      return response.data;
    } catch (error) {
      console.error('Error getting loyalty balance:', error);
      throw error;
    }
  }

  /**
   * Get contract information and capabilities
   */
  async getContractInfo(): Promise<ContractInfo> {
    try {
      const response = await axiosInstance.get('/sui/contract/info');
      return response.data.contractInfo;
    } catch (error) {
      console.error('Error getting contract info:', error);
      throw error;
    }
  }

  /**
   * Upgrade the contract (admin only)
   */
  async upgradeContract(newPackageId: string) {
    try {
      const response = await axiosInstance.post('/sui/contract/upgrade', { newPackageId });
      return response.data;
    } catch (error) {
      console.error('Error upgrading contract:', error);
      throw error;
    }
  }

  /**
   * Test backend connectivity
   */
  async testConnection() {
    try {
      const response = await axiosInstance.get('/');
      return response.data;
    } catch (error) {
      console.error('Error testing backend connection:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const suiApi = new SuiApiService(); 