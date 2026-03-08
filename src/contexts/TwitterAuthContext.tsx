import {
  useCallback,
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  AuthUser,
  getTwitterLoginUrl,
  completeTwitterLogin,
} from "@/queries/AuthApis";
import { setCookie, getCookie, removeCookie } from "@/utils/cookies";

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
  const TWITTER_AUTH_REDIRECT_KEY = "twitter_auth_redirect";
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [initialized, setInitialized] = useState<boolean>(false);

  useEffect(() => {
    const storedToken = getCookie("twitter_token");
    const storedUser = getCookie("twitter_user");

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as AuthUser;
        setToken(storedToken);
        setUser(parsedUser);
      } catch (error) {
        console.error("Failed to parse stored Twitter user:", error);
        removeCookie("twitter_token");
        removeCookie("twitter_user");
      }
    }

    setInitialized(true);
  }, []);

  const startTwitterLogin = useCallback(async (redirectPath?: string) => {
    try {
      setLoading(true);

      // Normalize origin: Twitter's callback is configured for "localhost",
      // so if the user is on "127.0.0.1" the cookie would be set on a
      // different origin and lost after the OAuth redirect.  Redirect to
      // the equivalent "localhost" URL first so everything stays on one origin.
      if (window.location.hostname === "127.0.0.1") {
        const localhostUrl = window.location.href.replace(
          "127.0.0.1",
          "localhost",
        );
        window.location.href = localhostUrl;
        return;
      }

      if (redirectPath) {
        setCookie(TWITTER_AUTH_REDIRECT_KEY, redirectPath, 600);
      }
      const authUrl = await getTwitterLoginUrl();
      window.location.href = authUrl;
    } catch (error) {
      console.error("Failed to start Twitter login:", error);
      setLoading(false);
    }
  }, []);

  const completeCallback = useCallback(
    async (oauthToken: string, oauthVerifier: string) => {
      setLoading(true);
      try {
        const result = await completeTwitterLogin(oauthToken, oauthVerifier);
        setToken(result.token);
        setUser(result.user);

        setCookie("twitter_token", result.token);
        setCookie("twitter_user", JSON.stringify(result.user));
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    removeCookie("twitter_token");
    removeCookie("twitter_user");
  }, []);

  const value: TwitterAuthContextType = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: !!user,
      loading: loading && !initialized,
      startTwitterLogin,
      completeCallback,
      logout,
    }),
    [
      user,
      token,
      loading,
      initialized,
      startTwitterLogin,
      completeCallback,
      logout,
    ],
  );

  return (
    <TwitterAuthContext.Provider value={value}>
      {children}
    </TwitterAuthContext.Provider>
  );
};

export const useTwitterAuth = (): TwitterAuthContextType => {
  const context = useContext(TwitterAuthContext);
  if (!context) {
    throw new Error("useTwitterAuth must be used within a TwitterAuthProvider");
  }
  return context;
};
