import axios from "axios";
import { envConfig } from "../utils/config";

// ShadowPay API endpoints
const SHADOWPAY_BASE_URL = "https://shadow.radr.fun/shadowpay/api/escrow";

/**
 * Request deposit transaction from ShadowPay
 * @param wallet - Wallet address
 * @param amount - Amount in AVAX (not lamports)
 */
export const requestDepositTx = async (wallet: string, amount: number) => {
  try {
    const response = await axios.post(`${SHADOWPAY_BASE_URL}/deposit`, {
      wallet,
      amount, // Amount in AVAX as per ShadowPay docs
    });
    return response.data;
  } catch (error) {
    console.error("Error requesting deposit transaction:", error);
    throw error;
  }
};

/**
 * Request withdraw transaction from ShadowPay
 * @param wallet - Wallet address
 * @param amount - Amount in AVAX (not lamports)
 */
export const requestWithdrawTx = async (wallet: string, amount: number) => {
  try {
    const response = await axios.post(`${SHADOWPAY_BASE_URL}/withdraw`, {
      wallet,
      amount, // Amount in AVAX as per ShadowPay docs
    });
    return response.data;
  } catch (error) {
    console.error("Error requesting withdraw transaction:", error);
    throw error;
  }
};

/**
 * Get escrow balance from ShadowPay
 * @param wallet - Wallet address
 */
export const getBalance = async (wallet: string) => {
  try {
    const response = await axios.get(`${SHADOWPAY_BASE_URL}/balance/${wallet}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching balance:", error);
    throw error;
  }
};
