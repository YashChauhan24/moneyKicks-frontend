import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  AuthUser,
  getTwitterLoginUrl,
  completeTwitterLogin,
} from "@/queries/AuthApis";

interface TwitterAuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  startTwitterLogin: (redirectPath?: string) => Promise<void>;
  completeCallback: (
    oauthToken: string,
    oauthVerifier: string,
  ) => Promise<void>;
  logout: () => void;
}

const TwitterAuthContext = createContext<TwitterAuthContextType | undefined>(
  undefined,
);

interface TwitterAuthProviderProps {
  children: ReactNode;
}

export const TwitterAuthProvider = ({ children }: TwitterAuthProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [initialized, setInitialized] = useState<boolean>(false);

  useEffect(() => {
    const storedToken = window.localStorage.getItem("twitter_token");
    const storedUser = window.localStorage.getItem("twitter_user");

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as AuthUser;
        setToken(storedToken);
        setUser(parsedUser);
      } catch (error) {
        console.error("Failed to parse stored Twitter user:", error);
        window.localStorage.removeItem("twitter_token");
        window.localStorage.removeItem("twitter_user");
      }
    }

    setInitialized(true);
  }, []);

  const startTwitterLogin = async (_redirectPath?: string) => {
    try {
      setLoading(true);
      const authUrl = await getTwitterLoginUrl();
      window.location.href = authUrl;
    } catch (error) {
      console.error("Failed to start Twitter login:", error);
      setLoading(false);
    }
  };

  const completeCallback = async (
    oauthToken: string,
    oauthVerifier: string,
  ) => {
    setLoading(true);
    try {
      const result = await completeTwitterLogin(oauthToken, oauthVerifier);
      setToken(result.token);
      setUser(result.user);

      window.localStorage.setItem("twitter_token", result.token);
      window.localStorage.setItem("twitter_user", JSON.stringify(result.user));
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    window.localStorage.removeItem("twitter_token");
    window.localStorage.removeItem("twitter_user");
  };

  const value: TwitterAuthContextType = {
    user,
    token,
    isAuthenticated: !!user,
    loading: loading && !initialized,
    startTwitterLogin,
    completeCallback,
    logout,
  };

  return (
    <TwitterAuthContext.Provider value={value}>
      {children}
    </TwitterAuthContext.Provider>
  );
};

export const useTwitterAuth = (): TwitterAuthContextType => {
  const context = useContext(TwitterAuthContext);
  if (!context) {
    throw new Error(
      "useTwitterAuth must be used within a TwitterAuthProvider",
    );
  }
  return context;
};

