// store/globalAppStore.ts
import { create } from "zustand";
import Cookies from "js-cookie";

/* ========= Types ========= */

interface User {
  id: number;
  email: string | null;
  badges: string;
  user_name?: string;
  description?: string;
  profile_image?: string;
  banner_image?: string;
}

type WalletType = "sui-wallet" | "zk-login" | "metamask" | "phantom" | "coinbase" | "privy";

interface WalletInfo {
  address: string;
  type: WalletType;
}

type Chain = "sui" | "evm";
type WalletMap = Partial<Record<Chain, WalletInfo>>;

interface AuthenticationLock {
  walletAddress: string;
  timestamp: number;
}

interface NFTClaimingState {
  isMinting: boolean;
  canMintAgain: boolean;
}

interface AppState {
  user: User | null;
  isUserVerified: boolean;
  openModal: boolean;
  connectedWallets: WalletMap;
  userWalletAddress: string | null;
  isAuthenticating: boolean;
  authenticationLock: AuthenticationLock | null;
  userHasInteracted: boolean;
  nftClaiming: NFTClaimingState;

  // Actions
  setUser: (user: User, jwt: string) => void;
  unsetUser: () => void;
  inferUser: () => void;
  setOpenModal: (open: boolean) => void;
  setUserWalletAddress: (address: string) => void;

  // Wallet management actions
  setSuiWallet: (wallet: WalletInfo | null) => void;
  setEvmWallet: (wallet: WalletInfo | null) => void;
  getWalletForChain: (chain: Chain) => WalletInfo | null;
  hasWalletForChain: (chain: Chain) => boolean;
  disconnectWallet: (chain: Chain) => void;
  disconnectAllWallets: () => void;

  // Authentication lock actions
  setIsAuthenticating: (authenticating: boolean) => void;
  setAuthenticationLock: (lock: AuthenticationLock | null) => void;
  canAuthenticate: (walletAddress: string) => boolean;

  // User interaction actions
  setUserHasInteracted: (interacted: boolean) => void;
  resetUserInteraction: () => void;

  // Simplified NFT Claiming actions
  setIsMinting: (minting: boolean) => void;
  setCanMintAgain: (canMint: boolean) => void;
  resetNFTClaimingState: () => void;
}

/* ========= Helpers ========= */

const COOKIE_EXPIRY_DATE = () => new Date(Date.now() + 60 * 60 * 1000);

const readJSONCookie = <T>(key: string, fallback: T): T => {
  const raw = Cookies.get(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const safeString = (val: unknown): string | undefined =>
  typeof val === "string" ? val : undefined;

/* ========= Store ========= */

export const useGlobalAppStore = create<AppState>((set, get) => ({
  user: null,
  isUserVerified: false,
  openModal: false,
  connectedWallets: {} as WalletMap,
  userWalletAddress: null,
  isAuthenticating: false,
  authenticationLock: null,
  userHasInteracted: false,

  nftClaiming: {
    isMinting: false,
    canMintAgain: true,
  },

  setUser: (user, jwt) => {
    Cookies.set("user", JSON.stringify(user), { expires: COOKIE_EXPIRY_DATE() });
    Cookies.set("jwt", jwt, { expires: COOKIE_EXPIRY_DATE() });
    set({ user, isUserVerified: true });
  },

  unsetUser: () => {
    Cookies.remove("user");
    Cookies.remove("jwt");
    Cookies.remove("connectedWallets");
    
    set({
      user: null,
      isUserVerified: false,
      connectedWallets: {},
      userWalletAddress: null,
      isAuthenticating: false,
      authenticationLock: null,
      nftClaiming: {
        isMinting: false,
        canMintAgain: true,
      },
    });
  },

  inferUser: () => {
    const userStr = Cookies.get("user");
    const jwtStr = Cookies.get("jwt");

    if (safeString(userStr) && safeString(jwtStr)) {
      const user = readJSONCookie<User>("user", null as unknown as User);
      const parsedWallets = readJSONCookie<WalletMap>("connectedWallets", {});
      const compatAddress =
        parsedWallets.sui?.address ?? parsedWallets.evm?.address ?? null;

      set({
        user,
        isUserVerified: true,
        connectedWallets: parsedWallets,
        userWalletAddress: compatAddress,
      });
    } else {
      set({ isUserVerified: false });
    }
  },

  setOpenModal: (open) => {
    if (open) {
      set({ openModal: open, userHasInteracted: true });
    } else {
      set({ openModal: open });
    }
  },

  setUserWalletAddress: (address) => set({ userWalletAddress: address }),

  setSuiWallet: (wallet) => {
    const current = get().connectedWallets;
    const newWallets: WalletMap = { ...current };

    if (wallet) newWallets.sui = wallet;
    else delete newWallets.sui;

    const newAddress = newWallets.sui?.address ?? newWallets.evm?.address ?? null;

    Cookies.set("connectedWallets", JSON.stringify(newWallets), {
      expires: COOKIE_EXPIRY_DATE(),
    });

    set({
      connectedWallets: newWallets,
      userWalletAddress: newAddress,
      nftClaiming: {
        isMinting: false,
        canMintAgain: true,
      },
    });
  },

  setEvmWallet: (wallet) => {
    const current = get().connectedWallets;
    const newWallets: WalletMap = { ...current };

    if (wallet) newWallets.evm = wallet;
    else delete newWallets.evm;

    const newAddress = newWallets.sui?.address ?? newWallets.evm?.address ?? null;

    Cookies.set("connectedWallets", JSON.stringify(newWallets), {
      expires: COOKIE_EXPIRY_DATE(),
    });

    set({
      connectedWallets: newWallets,
      userWalletAddress: newAddress,
      nftClaiming: {
        isMinting: false,
        canMintAgain: true,
      },
    });
  },

  getWalletForChain: (chain) => {
    return get().connectedWallets[chain] ?? null;
  },

  hasWalletForChain: (chain) => {
    return Boolean(get().connectedWallets[chain]);
  },

  disconnectWallet: (chain) => {
    const newWallets: WalletMap = { ...get().connectedWallets };
    delete newWallets[chain];

    const newAddress = newWallets.sui?.address ?? newWallets.evm?.address ?? null;

    Cookies.set("connectedWallets", JSON.stringify(newWallets), {
      expires: COOKIE_EXPIRY_DATE(),
    });

    set({
      connectedWallets: newWallets,
      userWalletAddress: newAddress,
      nftClaiming: {
        isMinting: false,
        canMintAgain: true,
      },
    });
  },

  disconnectAllWallets: () => {
    Cookies.remove("connectedWallets");
    set({
      connectedWallets: {},
      userWalletAddress: null,
      isAuthenticating: false,
      authenticationLock: null,
      nftClaiming: {
        isMinting: false,
        canMintAgain: true,
      },
      userHasInteracted: false,
    });
  },

  setIsAuthenticating: (authenticating: boolean) => {
    set({ isAuthenticating: authenticating });
  },

  setAuthenticationLock: (lock: AuthenticationLock | null) => {
    set({ authenticationLock: lock });
  },

  canAuthenticate: (walletAddress: string): boolean => {
    const state = get();
    const now = Date.now();
    
    if (!state.authenticationLock) {
      return true;
    }
    
    if (now - state.authenticationLock.timestamp > 30000) {
      set({ authenticationLock: null, isAuthenticating: false });
      return true;
    }
    
    if (state.authenticationLock.walletAddress === walletAddress) {
      return false;
    }
    
    return true;
  },

  setUserHasInteracted: (interacted: boolean) => {
    set({ userHasInteracted: interacted });
  },

  resetUserInteraction: () => {
    set({ userHasInteracted: false });
  },

  // Simplified NFT Claiming actions - only depends on can_mint_again
  setIsMinting: (minting: boolean) => {
    const currentState = get().nftClaiming;
    set({
      nftClaiming: {
        ...currentState,
        isMinting: minting,
      },
    });
  },

  setCanMintAgain: (canMint: boolean) => {
    const currentState = get().nftClaiming;
    set({
      nftClaiming: {
        ...currentState,
        canMintAgain: canMint,
      },
    });
  },

  resetNFTClaimingState: () => {
    set({
      nftClaiming: {
        isMinting: false,
        canMintAgain: true,
      },
    });
  },
}));

// Initialize the store
useGlobalAppStore.getState().inferUser();