import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_BASE_URL ?? "http://localhost:4000/api";

export interface AuthUser {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
}

interface TwitterLoginUrlResponse {
  url: string;
}

export interface TwitterCallbackResponse {
  message: string;
  token: string;
  user: AuthUser;
}

export const getTwitterLoginUrl = async (): Promise<string> => {
  const response = await axios.get<TwitterLoginUrlResponse>(
    `${API_BASE_URL}/auth/twitter`
  );

  return response.data.url;
};

export const completeTwitterLogin = async (
  oauthToken: string,
  oauthVerifier: string
): Promise<TwitterCallbackResponse> => {
  const response = await axios.get<TwitterCallbackResponse>(
    `${API_BASE_URL}/auth/twitter/callback`,
    {
      params: {
        oauth_token: oauthToken,
        oauth_verifier: oauthVerifier,
      },
    }
  );

  return response.data;
};
