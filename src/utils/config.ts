export const envConfig = {
  walletNetwork: import.meta.env.VITE_NETWORK || "mainnet-beta",
  baseUrl: import.meta.env.VITE_BACKEND_URL || "http://localhost:4000",
};
