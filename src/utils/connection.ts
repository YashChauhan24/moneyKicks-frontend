// Network-specific Avalanche C-Chain connection utility
import { ethers } from "ethers";
import { useNetwork } from "@/contexts/NetworkContext";

/**
 * Get an Avalanche C-Chain provider for a specific network
 * @param network - 'mainnet' | 'testnet'
 * @returns JsonRpcProvider instance for the specified network
 */
export const getNetworkProvider = (
  network: "mainnet" | "testnet" = "mainnet"
): ethers.JsonRpcProvider => {
  const rpcUrl = network === "mainnet"
    ? "https://api.avax.network/ext/bc/C/rpc"
    : "https://api.avax-test.network/ext/bc/C/rpc";
  
  return new ethers.JsonRpcProvider(rpcUrl);
};

/**
 * Get network connection using context
 * This is a convenience function that uses the network from context
 */
export const getNetworkConnection = (
  network: "mainnet" | "testnet" = "mainnet"
): ethers.JsonRpcProvider => {
  return getNetworkProvider(network);
};
