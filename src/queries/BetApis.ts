import axios from "axios";
import { getCookie } from "@/utils/cookies";

const API_BASE_URL =
  import.meta.env.VITE_BASE_URL ?? "http://localhost:4000/api";

export type CreateBetPayload = {
  title: string;
  description: string;
  competitorAName: string;
  competitorBName: string;
  endCondition: string;
  stakeAmount: number;
  currency: string;
  endAt: string;
  startAt: string;
  status: "pending";
  side?: "A" | "B";
  walletAddress?: string;
};

export interface ApiBetStats {
  predictorCount: number;
  totalPool: string;
  totalOnA: string;
  totalOnB: string;
}

export interface ApiBet {
  id: string;
  title: string;
  description: string;
  competitorAName: string;
  competitorBName: string;
  endCondition: string;
  stakeAmount: string;
  currency: string;
  status: "pending" | "live" | "closed" | "settled";
  startAt: string;
  endAt: string;
  createdByUserId: string;
  contractAddress?: string;
  createdAt: string;
  updatedAt: string;
  stats?: ApiBetStats;
}

export interface GetBetsResponse {
  data: ApiBet[];
}

export type GetBetsParams = {
  status?: "pending" | "live" | "closed" | "settled";
  limit?: number;
  offset?: number;
  search?: string;
};

export const createBet = async (payload: CreateBetPayload) => {
  try {
    const token = getCookie("twitter_token"); // assuming you store JWT

    const { data } = await axios.post(`${API_BASE_URL}/bets`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return data;
  } catch (error) {
    console.error("Failed to create bet:", error);
    throw error;
  }
};

export const getBets = async (
  params?: GetBetsParams,
): Promise<GetBetsResponse> => {
  const { data } = await axios.get<GetBetsResponse>(`${API_BASE_URL}/bets`, {
    params: {
      limit: params?.limit ?? 20,
      offset: params?.offset ?? 0,
      status: params?.status,
      search: params?.search,
    },
  });

  return data;
};

export const getBetById = async (id: string): Promise<{ data: ApiBet }> => {
  const { data } = await axios.get<{ data: ApiBet }>(
    `${API_BASE_URL}/bets/${id}`,
  );

  return data;
};

export const makePrediction = async (
  betId: string,
  payload: { side: "A" | "B"; amount: number; walletAddress: string },
) => {
  const token = getCookie("twitter_token");

  const { data } = await axios.post(
    `${API_BASE_URL}/bets/${betId}/predictions`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return data;
};

export const acceptInvite = async (
  betId: string,
  payload: { side: "A" | "B"; walletAddress: string },
) => {
  const token = getCookie("twitter_token");

  const { data } = await axios.post(
    `${API_BASE_URL}/bets/${betId}/accept-invite`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return data;
};
