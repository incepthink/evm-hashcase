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

/** Mapping of chain -> wallet (no nulls; use absence of key) */
type Chain = "sui" | "evm";
type WalletMap = Partial<Record<Chain, WalletInfo>>;

interface AuthenticationLock {
  walletAddress: string;
  timestamp: number;
}

interface AppState {
  user: User | null;
  isUserVerified: boolean;
  openModal: boolean;

  // Multi-wallet support (no nulls inside; use absence of key)
  connectedWallets: WalletMap;

  // Deprecated but kept for backward compatibility
  userWalletAddress: string | null;

  // Authentication lock state
  isAuthenticating: boolean;
  authenticationLock: AuthenticationLock | null;

  // Actions
  setUser: (user: User, jwt: string) => void;
  unsetUser: () => void;
  inferUser: () => void;
  setOpenModal: (open: boolean) => void;
  setUserWalletAddress: (address: string) => void; // Deprecated

  // New wallet management actions
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
}

/* ========= Helpers ========= */

const COOKIE_EXPIRY_DATE = () => new Date(Date.now() + 60 * 60 * 1000); // 60 mins

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

  // Set user and JWT in cookies and state
  setUser: (user, jwt) => {
    Cookies.set("user", JSON.stringify(user), { expires: COOKIE_EXPIRY_DATE() });
    Cookies.set("jwt", jwt, { expires: COOKIE_EXPIRY_DATE() });
    set({ user, isUserVerified: true });
  },

  // Unset user and remove cookies
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
    });
  },

  // Infer user from cookies
  inferUser: () => {
    const userStr = Cookies.get("user");
    const jwtStr = Cookies.get("jwt");

    if (safeString(userStr) && safeString(jwtStr)) {
      const user = readJSONCookie<User>("user", null as unknown as User);
      const parsedWallets = readJSONCookie<WalletMap>("connectedWallets", {});
      // Back-compat address selection: prefer Sui, then EVM
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

  // Set modal state
  setOpenModal: (open) => set({ openModal: open }),

  // Deprecated - kept for backward compatibility
  setUserWalletAddress: (address) => set({ userWalletAddress: address }),

  // New wallet management actions
  setSuiWallet: (wallet) => {
    const current = get().connectedWallets;
    const newWallets: WalletMap = { ...current };

    if (wallet) newWallets.sui = wallet;
    else delete newWallets.sui;

    Cookies.set("connectedWallets", JSON.stringify(newWallets), {
      expires: COOKIE_EXPIRY_DATE(),
    });

    set({
      connectedWallets: newWallets,
      // Back-compat: prefer Sui, else EVM
      userWalletAddress: newWallets.sui?.address ?? newWallets.evm?.address ?? null,
    });
  },

  setEvmWallet: (wallet) => {
    const current = get().connectedWallets;
    const newWallets: WalletMap = { ...current };

    if (wallet) newWallets.evm = wallet;
    else delete newWallets.evm;

    Cookies.set("connectedWallets", JSON.stringify(newWallets), {
      expires: COOKIE_EXPIRY_DATE(),
    });

    set({
      connectedWallets: newWallets,
      // Back-compat: prefer Sui, else EVM
      userWalletAddress: newWallets.sui?.address ?? newWallets.evm?.address ?? null,
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

    Cookies.set("connectedWallets", JSON.stringify(newWallets), {
      expires: COOKIE_EXPIRY_DATE(),
    });

    set({
      connectedWallets: newWallets,
      userWalletAddress: newWallets.sui?.address ?? newWallets.evm?.address ?? null,
    });
  },

  disconnectAllWallets: () => {
    Cookies.remove("connectedWallets");
    set({
      connectedWallets: {},
      userWalletAddress: null,
      isAuthenticating: false,
      authenticationLock: null,
    });
  },

  // Authentication lock actions
  setIsAuthenticating: (authenticating: boolean) => {
    set({ isAuthenticating: authenticating });
  },

  setAuthenticationLock: (lock: AuthenticationLock | null) => {
    set({ authenticationLock: lock });
  },

  canAuthenticate: (walletAddress: string): boolean => {
    const state = get();
    const now = Date.now();
    
    // If no lock exists, allow authentication
    if (!state.authenticationLock) {
      return true;
    }
    
    // If lock is expired (10 seconds timeout), allow authentication
    if (now - state.authenticationLock.timestamp > 10000) {
      // Clear expired lock
      set({ authenticationLock: null, isAuthenticating: false });
      return true;
    }
    
    // If same wallet address is already being authenticated, block
    if (state.authenticationLock.walletAddress === walletAddress) {
      return false;
    }
    
    // Different wallet address, allow (this will override the lock)
    return true;
  },
}));

// Infer user on store initialization
useGlobalAppStore.getState().inferUser();