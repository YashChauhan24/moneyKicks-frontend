import axios from "axios";

// Jackpot service base URL
// For local development this points to: http://localhost:4000/api
const API_BASE_URL =
  import.meta.env.VITE_BASE_URL ?? "http://localhost:4000/api";

export interface JackpotItem {
  id: string;
  name: string;
  startAt: string;
  endAt: string;
  minAmount: string;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  walletAddress?: string;
  avaxWalletAddress?: string;
  usdWalletAddress?: string;
  // Optional fields we may get from backend
  participants?: string[];
  hasParticipated?: boolean;
}

interface JackpotListResponse {
  data: JackpotItem[];
}

export const fetchCurrentJackpot = async (
  walletAddress?: string,
  isActive?: boolean,
) => {
  const response = await axios.get<JackpotListResponse>(
    `${API_BASE_URL}/jackpots`,
    {
      params: {
        walletAddress: walletAddress ? { wallet: walletAddress } : undefined,
        isActive: isActive !== undefined ? { isActive } : undefined,
      },
    },
  );
  return response.data;
};

export interface JackpotTransferPayload {
  fromWallet: string;
  toWallet: string;
  amount: number;
  currency: string;
  txHash: string;
  network: string;
  jackpotId: string;
}

export const submitJackpotTransfer = async (
  payload: JackpotTransferPayload,
) => {
  const response = await axios.post(`${API_BASE_URL}/transfers`, payload);
  return response.data;
};

interface ParticipationResponse {
  data?: {
    id: string;
    jackpotId: string;
    walletAddress: string;
    transferId: string;
    createdAt: string;
    updatedAt: string;
  };
}

export const checkJackpotParticipation = async (
  jackpotId: string,
  walletAddress: string,
): Promise<boolean> => {
  try {
    const response = await axios.get<ParticipationResponse>(
      `${API_BASE_URL}/jackpots/${jackpotId}/participants/${walletAddress}`,
    );
    // If response is successful (200), user has participated
    return !!response.data?.data;
  } catch (error) {
    // Check if error is due to no participation found
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      // 404 means no participation found - user hasn't participated
      return false;
    }
    console.error("Failed to check jackpot participation:", error);
    // Return false for any other errors as a safe fallback
    return false;
  }
};

export interface JackpotPoolBreakdown {
  usdEntries: number;
  avaxEntries: number;
  avaxToUSD: number;
  avaxRate: number;
}

export interface PrizeWinner {
  place: number;
  percentage: number;
  amountUSD: number;
}

export interface PrizeDistribution {
  totalPool: number;
  platformFee: number;
  platformFeePercentage: number;
  remainingAfterFee: number;
  winners: PrizeWinner[];
}

export interface JackpotPoolData {
  jackpotId: string;
  jackpotName: string;
  participantCount: number;
  totalPoolUSD: number;
  breakdown: JackpotPoolBreakdown;
  prizeDistribution?: PrizeDistribution;
}

interface JackpotPoolResponse {
  data: JackpotPoolData;
}

export const fetchJackpotPool = async (
  jackpotId: string,
): Promise<JackpotPoolData | null> => {
  try {
    const response = await axios.get<JackpotPoolResponse>(
      `${API_BASE_URL}/jackpots/${jackpotId}/pool`,
    );
    return response.data.data;
  } catch (error) {
    console.error("Failed to fetch jackpot pool:", error);
    return null;
  }
};
