export const envConfig = {
  walletNetwork: import.meta.env.VITE_NETWORK || "mainnet-beta",
  baseUrl: import.meta.env.VITE_BASE_URL || "http://localhost:4000/api",
};
