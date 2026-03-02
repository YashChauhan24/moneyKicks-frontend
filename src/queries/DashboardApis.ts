import axios from "axios";

// Jackpot service base URL
// For local development this points to: http://localhost:4000/api
const API_BASE_URL =
  import.meta.env.VITE_BASE_URL ?? "http://localhost:4000/api";

export interface DashboardStats {
  totalValueLocked: number;
  activeBets: number;
  activeUsers: number;
}

export interface RecentBet {
  id: string;
  title: string;
  stakeAmount: string;
  currency: string;
  status: "pending" | "live" | "closed" | "settled";
  participants: number;
  endAt: string;
}

export interface JackpotData {
  id: string;
  name: string;
  totalEntries: number;
  minAmount: string;
  currency: "USD" | "AVAX" | "BOTH";
  endAt: string;
}

export interface DashboardResponse {
  stats: DashboardStats;
  recentBets: RecentBet[];
  jackpot: JackpotData | null;
}

export const fetchDashboard = async (): Promise<DashboardResponse> => {
  const { data } = await axios.get(`${API_BASE_URL}/dashboard/overview`);
  return data;
};
