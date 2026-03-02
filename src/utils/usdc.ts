// USDC utility functions
import { PublicKey, Connection } from "@solana/web3.js";

// USDC mint addresses
export const USDC_DEVNET_MINT = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"; // Official Circle USDC on Devnet
export const USDC_MAINNET_MINT = "EPjFWdd5AufqSSqeM2q1xzybapC8G4wEGGkZwyTDt1v"; // Official Circle USDC on Mainnet

/**
 * Get USDC mint address based on network
 */
export const getUSDCMint = (network: "mainnet" | "devnet" | "testnet"): string => {
  if (network === "mainnet") {
    return USDC_MAINNET_MINT;
  }
  // For devnet and testnet, use devnet mint
  return USDC_DEVNET_MINT;
};

// Common USDC mint addresses that might be used
const USDC_MINT_ADDRESSES = [
  USDC_DEVNET_MINT,
  USDC_MAINNET_MINT,
];

/**
 * Get USDC balance for a wallet
 * Tries multiple methods to find USDC token accounts
 * Returns 0 if token account doesn't exist or if there's an error
 * @param connection - Solana Connection (should be for the correct network)
 * @param walletAddress - Wallet public key address
 * @param network - Network type to determine which USDC mint to look for
 */
export const getUSDCBalance = async (
  connection: Connection,
  walletAddress: string,
  network: "mainnet" | "devnet" | "testnet" = "devnet"
): Promise<number> => {
  try {
    const publicKey = new PublicKey(walletAddress);
    
    // Determine which USDC mint to look for based on network
    const targetUSDCmint = network === "mainnet" ? USDC_MAINNET_MINT : USDC_DEVNET_MINT;
    
    console.log("🔍 Fetching USDC balance for:", walletAddress);
    console.log("🌐 Network:", network);
    console.log("🔗 Connection endpoint:", connection.rpcEndpoint);
    console.log("🎯 Looking for USDC mint:", targetUSDCmint);
    
    // Method 1: Get ALL token accounts for the wallet (most reliable)
    try {
      const allTokenAccounts = await connection.getParsedTokenAccountsByOwner(
        publicKey,
        {
          programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"), // SPL Token Program
        },
        "confirmed"
      );

      console.log(`📊 Found ${allTokenAccounts.value.length} token account(s)`);

      // Log all token accounts for debugging
      allTokenAccounts.value.forEach((account, index) => {
        const mint = account.account.data.parsed?.info?.mint;
        const balance = account.account.data.parsed?.info?.tokenAmount?.uiAmount || 0;
        const decimals = account.account.data.parsed?.info?.tokenAmount?.decimals || 0;
        console.log(`  Token ${index + 1}: Mint=${mint}, Balance=${balance}, Decimals=${decimals}`);
      });

      // First, try to find the target network's USDC mint
      const targetAccount = allTokenAccounts.value.find(
        (account) => {
          const mint = account.account.data.parsed?.info?.mint;
          return mint === targetUSDCmint;
        }
      );

      if (targetAccount) {
        const balance = targetAccount.account.data.parsed.info.tokenAmount.uiAmount;
        console.log(`✅ Found ${network} USDC! Mint: ${targetUSDCmint}, Balance: ${balance}`);
        return balance || 0;
      }

      // Fallback: Try to find any USDC mint (in case of network mismatch)
      for (const usdcMint of USDC_MINT_ADDRESSES) {
        const usdcAccount = allTokenAccounts.value.find(
          (account) => {
            const mint = account.account.data.parsed?.info?.mint;
            return mint === usdcMint;
          }
        );

        if (usdcAccount) {
          const balance = usdcAccount.account.data.parsed.info.tokenAmount.uiAmount;
          console.log(`⚠️ Found USDC but wrong network! Mint: ${usdcMint}, Balance: ${balance}`);
          // Still return it, but log a warning
          return balance || 0;
        }
      }

      // If no exact match, try to find any token with "USDC" in the name or common USDC patterns
      // This is a fallback in case there's a different USDC mint
      const potentialUSDC = allTokenAccounts.value.find((account) => {
        const mint = account.account.data.parsed?.info?.mint;
        // Check if it's a 6-decimal token (USDC standard) with significant balance
        const decimals = account.account.data.parsed?.info?.tokenAmount?.decimals;
        const balance = account.account.data.parsed?.info?.tokenAmount?.uiAmount || 0;
        return decimals === 6 && balance > 0;
      });

      if (potentialUSDC) {
        const balance = potentialUSDC.account.data.parsed.info.tokenAmount.uiAmount;
        const mint = potentialUSDC.account.data.parsed?.info?.mint;
        console.log(`⚠️ Found potential USDC (6 decimals): Mint=${mint}, Balance=${balance}`);
        return balance || 0;
      }

      console.log("❌ No USDC token account found");
      return 0;
    } catch (error: any) {
      console.error("❌ Error fetching token accounts:", error);
      
      // If the error is about invalid mint or account not found, return 0
      if (
        error?.message?.includes("Invalid param") ||
        error?.message?.includes("could not unpack") ||
        error?.message?.includes("could not find account")
      ) {
        return 0;
      }
      
      // Re-throw other errors
      throw error;
    }
  } catch (error: any) {
    // Handle all errors gracefully - return 0 instead of crashing
    if (
      error?.message?.includes("Invalid param") ||
      error?.message?.includes("could not unpack") ||
      error?.message?.includes("could not find account")
    ) {
      console.warn("⚠️ Token account doesn't exist or mint is invalid");
      return 0;
    }
    
    console.error("❌ Error fetching USDC balance:", error);
    return 0;
  }
};

/**
 * Convert USDC amount to smallest unit (micro-USDC, 6 decimals)
 */
export const toUSDCUnits = (usdc: number): number => {
  return Math.round(usdc * 1e6);
};

/**
 * Convert USDC units to USDC amount
 */
export const fromUSDCUnits = (units: number): number => {
  return units / 1e6;
};

