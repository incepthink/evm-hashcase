# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server (Turbopack)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint
```

No test suite is configured in this project.

## Architecture

This is a **Next.js App Router** frontend for Hashcase, an NFT claiming/minting platform. The name `evm-hashcase` is misleading — Sui blockchain is the primary chain, with EVM chains (Polygon, Mantle, Filecoin) as secondary targets.

### Path Alias

`@/*` maps to `./src/*`.

### State Management

Two coexisting patterns:

- **Zustand** (`src/store/globalAppStore.ts`) — primary global state. Handles user, multi-wallet state (`setSuiWallet`, `setEvmWallet`, `getWalletForChain`), auth lock with 30s timeout, minting flags, and cookie persistence.
- **React Context** (`src/context/AppContext.tsx`) — secondary; handles e-commerce and some app-level state via a reducer pattern.

### Provider Stack

Defined in `src/app/layout.tsx`, from outermost to innermost:
1. `PrivyLoginProvider` — Privy web3 auth
2. `RainbowkitProvider` — EVM multi-chain wallets (MetaMask, Coinbase, Phantom, etc.)
3. `TanstackProvider` — React Query
4. `ToastContainer` / `Toaster` — notifications
5. `LayoutChrome` → `WalletConnectionModal`

### Blockchain Integration

| Chain | Libraries |
|-------|-----------|
| Sui (primary) | `@mysten/sui`, `@mysten/dapp-kit`, `@mysten/enoki`, `@suiet/wallet-kit` |
| EVM (secondary) | `viem`, `wagmi`, `@rainbow-me/rainbowkit` |

Authentication methods: Privy, Enoki (Sui passwordless), ZkLogin (`src/components/ZkLogin.tsx`).

NFT claiming logic lives in `src/hooks/useNFTClaiming.ts`. Contract helpers are in `src/utils/contractHelperFunctions.ts`. Sui API calls go through `src/utils/suiApi.ts`.

### API Routes

`src/app/api/` contains server-side Next.js routes:
- `execute/` — transaction execution
- `sponsor/` — gasless/sponsored transactions
- `EnokiClient.ts` — shared Enoki client singleton

### URL Rewrites

`next.config.mjs` proxies `/minter/filecoin` to `localhost:3002` (local filecoin minter) and rewrites `/examples/*` paths to separate Vercel-deployed demo projects (ip-royalties, digital-twins, governance-dao, tokenized-real-estate, medical-records, luxury-passport, edu-cred, fan-tokens, ecommerce, safty).

### Key Utilities

- `src/utils/axios.ts` — Axios instance configured with `NEXT_PUBLIC_API` base URL
- `src/utils/mintingStateManager.ts` — minting state machine logic
- `src/utils/pinata.ts` — IPFS uploads
- `src/utils/networkConfig.ts` — per-chain RPC/contract config

### Custom Hooks

All data fetching uses React Query via custom hooks in `src/hooks/`: `useCollections`, `useQuests`, `useQuestById`, `useNFTClaiming`, `useLoyalty`, `useTasksByCode`.

### Styling

Tailwind CSS + MUI (`@mui/material` with Emotion). Custom Tailwind animations: `infinite-scroll` (horizontal marquee) and `gradient` (8s background cycle). Global styles in `src/app/globals.css`.

### Environment

Key env vars expected:
- `NEXT_PUBLIC_API` — backend API base URL
- `ENOKI_SECRET_KEY` — Sui Enoki auth
- `SUI_PACKAGE_ID`, `SUI_PRIVATE_KEY` — Sui contracts
- Privy, Pinata, AWS S3, Twitter API credentials (see `.env` for full list)
