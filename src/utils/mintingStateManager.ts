// utils/mintingStateManager.ts
export interface MintingLock {
  walletAddress: string;
  metadataId: number;
  timestamp: number;
  tabId: string;
  operation: 'auto_claim' | 'manual_claim';
}

export interface MintingSuccess {
  walletAddress: string;
  metadataId: number;
  timestamp: number;
  txHash?: string;
}

export class MintingStateManager {
  private static STORAGE_KEYS = {
    MINTING_LOCK: 'nft_minting_lock',
    MINT_SUCCESS: 'nft_mint_success',
    MINT_ATTEMPTS: 'nft_mint_attempts'
  };

  private static LOCK_TIMEOUT = 5 * 60 * 1000; // 5 minutes
  private static tabId = Math.random().toString(36).substr(2, 9);

  static getTabId(): string {
    return this.tabId;
  }

  private static getLockKey(walletAddress: string, metadataId: number): string {
    return `${this.STORAGE_KEYS.MINTING_LOCK}_${walletAddress.toLowerCase()}_${metadataId}`;
  }

  private static getSuccessKey(walletAddress: string, metadataId: number): string {
    return `${this.STORAGE_KEYS.MINT_SUCCESS}_${walletAddress.toLowerCase()}_${metadataId}`;
  }

  static acquireMintingLock(
    walletAddress: string, 
    metadataId: number, 
    operation: 'auto_claim' | 'manual_claim' = 'manual_claim'
  ): boolean {
    const lockKey = this.getLockKey(walletAddress, metadataId);
    
    try {
      const existingLock = localStorage.getItem(lockKey);
      
      if (existingLock) {
        const lockData: MintingLock = JSON.parse(existingLock);
        
        // Check if lock is still valid
        if (Date.now() - lockData.timestamp < this.LOCK_TIMEOUT) {
          // If it's the same tab, allow (for retries)
          if (lockData.tabId === this.tabId) {
            return true;
          }
          console.log('Minting already in progress in another tab/window');
          return false;
        }
      }

      // Acquire new lock
      const newLock: MintingLock = {
        walletAddress: walletAddress.toLowerCase(),
        metadataId,
        timestamp: Date.now(),
        tabId: this.tabId,
        operation
      };

      localStorage.setItem(lockKey, JSON.stringify(newLock));
      
      // Broadcast lock acquisition
      this.broadcastLockChange(walletAddress, metadataId, 'acquired');
      
      return true;
    } catch (error) {
      console.error('Failed to acquire minting lock:', error);
      return false;
    }
  }

  static releaseMintingLock(walletAddress: string, metadataId: number): void {
    const lockKey = this.getLockKey(walletAddress, metadataId);
    
    try {
      const existingLock = localStorage.getItem(lockKey);
      if (existingLock) {
        const lockData: MintingLock = JSON.parse(existingLock);
        
        // Only release if it's our lock
        if (lockData.tabId === this.tabId) {
          localStorage.removeItem(lockKey);
          this.broadcastLockChange(walletAddress, metadataId, 'released');
        }
      }
    } catch (error) {
      console.error('Failed to release minting lock:', error);
    }
  }

  static isMintingLocked(walletAddress: string, metadataId: number): boolean {
    const lockKey = this.getLockKey(walletAddress, metadataId);
    
    try {
      const existingLock = localStorage.getItem(lockKey);
      if (!existingLock) return false;
      
      const lockData: MintingLock = JSON.parse(existingLock);
      
      // Check if lock is still valid
      if (Date.now() - lockData.timestamp >= this.LOCK_TIMEOUT) {
        // Clean up expired lock
        localStorage.removeItem(lockKey);
        return false;
      }
      
      // If it's our own lock, consider it not locked for us
      return lockData.tabId !== this.tabId;
    } catch (error) {
      console.error('Failed to check minting lock:', error);
      return false;
    }
  }

  static markMintSuccess(
    walletAddress: string, 
    metadataId: number, 
    txHash?: string
  ): void {
    const successKey = this.getSuccessKey(walletAddress, metadataId);
    
    try {
      const successData: MintingSuccess = {
        walletAddress: walletAddress.toLowerCase(),
        metadataId,
        timestamp: Date.now(),
        txHash
      };

      localStorage.setItem(successKey, JSON.stringify(successData));
      
      // Release the lock
      this.releaseMintingLock(walletAddress, metadataId);
      
      // Broadcast success
      this.broadcastMintSuccess(walletAddress, metadataId);
    } catch (error) {
      console.error('Failed to mark mint success:', error);
    }
  }

  static hasMintedSuccessfully(walletAddress: string, metadataId: number): boolean {
    const successKey = this.getSuccessKey(walletAddress, metadataId);
    
    try {
      const successData = localStorage.getItem(successKey);
      return !!successData;
    } catch (error) {
      console.error('Failed to check mint success:', error);
      return false;
    }
  }

  static clearMintSuccess(walletAddress: string, metadataId: number): void {
    const successKey = this.getSuccessKey(walletAddress, metadataId);
    
    try {
      localStorage.removeItem(successKey);
    } catch (error) {
      console.error('Failed to clear mint success:', error);
    }
  }

  static cleanupExpiredLocks(): void {
    try {
      const keys = Object.keys(localStorage);
      const now = Date.now();
      
      keys.forEach(key => {
        if (key.startsWith(this.STORAGE_KEYS.MINTING_LOCK)) {
          try {
            const lockData: MintingLock = JSON.parse(localStorage.getItem(key) || '{}');
            if (now - lockData.timestamp >= this.LOCK_TIMEOUT) {
              localStorage.removeItem(key);
            }
          } catch {
            // Remove invalid lock data
            localStorage.removeItem(key);
          }
        }
      });
    } catch (error) {
      console.error('Failed to cleanup expired locks:', error);
    }
  }

  static cleanupForWalletChange(oldWalletAddress: string | null): void {
    if (!oldWalletAddress) return;
    
    try {
      const keys = Object.keys(localStorage);
      const oldAddressLower = oldWalletAddress.toLowerCase();
      
      keys.forEach(key => {
        if (
          (key.startsWith(this.STORAGE_KEYS.MINTING_LOCK) || 
           key.startsWith(this.STORAGE_KEYS.MINT_SUCCESS)) &&
          key.includes(oldAddressLower)
        ) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Failed to cleanup for wallet change:', error);
    }
  }

  private static broadcastLockChange(
    walletAddress: string, 
    metadataId: number, 
    action: 'acquired' | 'released'
  ): void {
    try {
      const event = {
        type: 'minting_lock_change',
        walletAddress: walletAddress.toLowerCase(),
        metadataId,
        action,
        timestamp: Date.now(),
        tabId: this.tabId
      };
      
      localStorage.setItem('minting_broadcast', JSON.stringify(event));
      // Immediately remove to trigger storage event
      setTimeout(() => {
        localStorage.removeItem('minting_broadcast');
      }, 100);
    } catch (error) {
      console.error('Failed to broadcast lock change:', error);
    }
  }

  private static broadcastMintSuccess(walletAddress: string, metadataId: number): void {
    try {
      const event = {
        type: 'mint_success',
        walletAddress: walletAddress.toLowerCase(),
        metadataId,
        timestamp: Date.now(),
        tabId: this.tabId
      };
      
      localStorage.setItem('mint_success_broadcast', JSON.stringify(event));
      // Immediately remove to trigger storage event
      setTimeout(() => {
        localStorage.removeItem('mint_success_broadcast');
      }, 100);
    } catch (error) {
      console.error('Failed to broadcast mint success:', error);
    }
  }
}

// NFT Minting Service with cross-tab sync
export class NFTMintingService {
  static async mintNFT(params: {
    walletAddress: string;
    metadataId: number;
    nftData: any;
    onSuccess?: (data: any) => void;
    onError?: (error: any) => void;
  }): Promise<boolean> {
    const { walletAddress, metadataId, nftData, onSuccess, onError } = params;
    
    // Dynamic import to avoid circular dependencies
    const { useGlobalAppStore } = await import('@/store/globalAppStore');
    const store = useGlobalAppStore.getState();
    
    // Check if we can start minting
    if (!store.canStartMinting(walletAddress, metadataId)) {
      onError?.({ message: 'Minting not allowed at this time' });
      return false;
    }
    
    // Try to set minting state (this will acquire the lock)
    const mintingStarted = store.setIsMinting(true, metadataId, walletAddress);
    if (mintingStarted === false) {
      onError?.({ message: 'Could not start minting - another process in progress' });
      return false;
    }
    
    try {
      console.log('Starting NFT mint process...');
      
      // Make the API call
      const axiosInstance = (await import('@/utils/axios')).default;
      const response = await axiosInstance.post("/platform/mint-nft", nftData);
      
      if (response.data.success) {
        console.log('NFT minted successfully');
        
        // Mark as successfully minted
        MintingStateManager.markMintSuccess(walletAddress, metadataId, response.data.txHash);
        
        // Update global state
        store.setCanMintAgain(false);
        
        onSuccess?.(response.data);
        return true;
      } else {
        throw new Error(response.data.message || 'Minting failed');
      }
      
    } catch (error: any) {
      console.error('NFT minting failed:', error);
      
      const errorMessage = error.response?.data?.message || error.message || 'Minting failed';
      
      // Check for specific error types
      if (
        errorMessage.includes('already claimed') ||
        errorMessage.includes('already minted') ||
        errorMessage.includes('already exists')
      ) {
        // Mark as successfully minted even on "already claimed" errors
        MintingStateManager.markMintSuccess(walletAddress, metadataId);
        store.setCanMintAgain(false);
        
        onSuccess?.({ 
          message: 'NFT already claimed',
          name: nftData.name,
          description: nftData.description,
          image_url: nftData.image_url,
          recipient: walletAddress
        });
        return true;
      }
      
      onError?.(error);
      return false;
      
    } finally {
      // Always clean up minting state
      store.setIsMinting(false, metadataId, walletAddress);
      store.setAutoClaimInProgress(false);
    }
  }
}

// Auto-cleanup on page load
if (typeof window !== 'undefined') {
  MintingStateManager.cleanupExpiredLocks();
}