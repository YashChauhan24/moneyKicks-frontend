# moneyKicks Frontend

React frontend for the `moneyKicks` Web3 betting product. The app combines a landing/dashboard experience, bet creation and participation flows, jackpot participation, Twitter-based authentication, wallet connectivity, and Avalanche-based token operations.

## Tech Stack

- React 18 + TypeScript
- Vite 5
- React Router 6
- Tailwind CSS
- shadcn/ui + Radix UI
- TanStack Query
- Wagmi + Reown AppKit
- Vitest + Testing Library

## Core Features

- Dashboard and landing experience
- Betting list, detail, creation, and invite acceptance flows
- Jackpot participation flow
- Twitter/X OAuth callback handling
- Avalanche mainnet and Fuji testnet support
- Wallet connection with Reown AppKit
- Encrypted token operations backed by `@avalabs/eerc-sdk`

## Project Structure

```text
src/
  components/    Reusable UI and feature components
  config/        Contract addresses and circuit configuration
  contexts/      Network, admin auth, and Twitter auth state
  pages/         Route-level screens
  providers/     Wallet-related providers
  queries/       API client modules
  utils/         Shared helpers and environment access
  test/          Vitest setup and tests
docs/
  technical-documentation.md
public/
  zk circuits, logos, static assets
```

## Routes

- `/` dashboard
- `/jackpot` jackpot flow
- `/betting` bet list
- `/betting/create` create bet
- `/betting/:id` bet detail
- `/betting/:id/invite` invite acceptance
- `/operations` encrypted token operations
- `/admin` admin panel
- `/auth/twitter/callback` Twitter OAuth callback

## Prerequisites

- Node.js 18+ recommended
- npm
- A valid `VITE_REOWN_PROJECT_ID`
- Backend API running locally or remotely

## Environment Variables

Create a `.env` file in the project root:

```env
VITE_REOWN_PROJECT_ID=your_reown_project_id
VITE_BASE_URL=http://localhost:4000/api
VITE_NETWORK=mainnet-beta
```

### Notes

- `VITE_REOWN_PROJECT_ID` is required. The app throws on startup if it is missing.
- `VITE_BASE_URL` is used by the API modules under `src/queries`.
- `VITE_NETWORK` is read by utility config; the in-app network switcher persists the active mode in `localStorage`.

## Getting Started

```bash
npm install
npm run dev
```

The Vite dev server runs on `http://localhost:8080`.

## Available Scripts

```bash
npm run dev         # Start local dev server
npm run build       # Create production build
npm run build:dev   # Build in development mode
npm run preview     # Preview production build locally
npm run lint        # Run ESLint
npm run test        # Run Vitest once
npm run test:watch  # Run Vitest in watch mode
```

## Configuration Overview

### Wallet and networks

- Reown AppKit is initialized in `src/reown.tsx`
- Supported EVM networks: Avalanche mainnet and Fuji
- The selected network is managed in `src/contexts/NetworkContext.tsx`

### API integration

Backend requests are grouped under `src/queries`:

- `AuthApis.ts`
- `DashboardApis.ts`
- `BetApis.ts`
- `OperationApis.ts`
- `JackpotApis.ts`

### Contracts and circuits

- Contract and token configuration lives in `src/config/contracts.ts`
- Local ZK circuit artifacts are served from `public/`

## Testing

Vitest is configured with `jsdom` and Testing Library. Test setup lives in `src/test/setup.ts`.

Run:

```bash
npm run test
```

## Implementation Notes

- The app is a client-rendered SPA using `BrowserRouter`
- Twitter auth state is persisted with cookies
- Admin auth is currently frontend-managed and should be treated as non-production unless backed by a real server flow
- Some operations depend on external services and Avalanche-compatible wallets being available in the browser
