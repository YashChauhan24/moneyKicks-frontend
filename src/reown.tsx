import { createAppKit } from "@reown/appkit/react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import {
  AppKitNetwork,
  avalanche,
  avalancheFuji,
} from "@reown/appkit/networks";
import { FC, ReactNode } from "react";

// 1. Maintain a single QueryClient instance
const queryClient = new QueryClient();

const projectId = import.meta.env.VITE_REOWN_PROJECT_ID;
if (!projectId) {
  throw new Error("VITE_REOWN_PROJECT_ID is not set");
}

const metadata = {
  name: "moneyKicks",
  description: "moneyKicks dApp",
  url: window.location.origin,
  icons: ["https://avatars.githubusercontent.com/u/179229932"],
};

const networks = [avalancheFuji, avalanche] as [
  AppKitNetwork,
  ...AppKitNetwork[],
];

const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true,
});

createAppKit({
  adapters: [wagmiAdapter],
  networks,
  metadata,
  projectId,
  features: {
    analytics: true,
  },
});

export const AppKitProvider: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  ); // 3. Ensure this semicolon is here
};
