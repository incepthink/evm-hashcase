// hooks/useAutoOpenModal.ts
import { useEffect, useRef } from 'react';
import { useGlobalAppStore } from '@/store/globalAppStore';
import { useAccount } from 'wagmi';
import { usePrivy } from '@privy-io/react-auth';

interface UseAutoOpenModalProps {
  enabled?: boolean; // Allow disabling the auto-open feature
}

export const useAutoOpenModal = ({ enabled = true }: UseAutoOpenModalProps = {}) => {
  const {
    setOpenModal,
    openModal,
    isUserVerified,
    getWalletForChain,
  } = useGlobalAppStore();

  // Track if we've already auto-opened the modal
  const hasAutoOpenedRef = useRef(false);

  // EVM wallet state
  const { address: evmAddress, isConnected: isEvmConnected } = useAccount();
  
  // Privy state
  const { authenticated: privyAuthenticated, user: privyUser, ready: privyReady } = usePrivy();

  // Get wallet from store
  const evmWallet = getWalletForChain("evm");

  useEffect(() => {
    // Don't auto-open if:
    // - Feature is disabled
    // - Already auto-opened once
    // - Modal is already open
    // - User is already verified
    // - Privy is not ready yet
    if (!enabled || hasAutoOpenedRef.current || openModal || isUserVerified || !privyReady) {
      return;
    }

    // Check if either wallet is in "authenticate" state
    const isEvmWalletNeedsAuth = (isEvmConnected && evmAddress && !evmWallet && !isUserVerified);
    const isPrivyWalletNeedsAuth = (privyAuthenticated && privyUser?.wallet?.address && !evmWallet && !isUserVerified);

    // If either wallet needs authentication, auto-open modal once
    if (isEvmWalletNeedsAuth || isPrivyWalletNeedsAuth) {
      console.log('Auto-opening wallet modal for authentication');
      hasAutoOpenedRef.current = true; // Mark as auto-opened
      
      // Small delay to ensure UI is stable
      setTimeout(() => {
        setOpenModal(true);
      }, 500);
    }
  }, [
    enabled,
    openModal,
    isUserVerified,
    privyReady,
    isEvmConnected,
    evmAddress,
    evmWallet,
    privyAuthenticated,
    privyUser?.wallet?.address,
    setOpenModal
  ]);

  // Reset the auto-open flag when user becomes verified (successful auth)
  useEffect(() => {
    if (isUserVerified && hasAutoOpenedRef.current) {
      console.log('User verified - resetting auto-open flag for future use');
      hasAutoOpenedRef.current = false;
    }
  }, [isUserVerified]);

  // Reset auto-open flag when all wallets are disconnected
  useEffect(() => {
    const hasAnyWallet = evmWallet || isEvmConnected || privyAuthenticated;
    if (!hasAnyWallet && hasAutoOpenedRef.current) {
      console.log('All wallets disconnected - resetting auto-open flag');
      hasAutoOpenedRef.current = false;
    }
  }, [evmWallet, isEvmConnected, privyAuthenticated]);

  return {
    hasAutoOpened: hasAutoOpenedRef.current,
    resetAutoOpen: () => {
      hasAutoOpenedRef.current = false;
    }
  };
};