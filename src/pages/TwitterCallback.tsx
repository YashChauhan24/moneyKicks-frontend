import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useTwitterAuth } from "@/contexts/TwitterAuthContext";
import { getCookie, removeCookie } from "@/utils/cookies";

const TwitterCallback = () => {
  const TWITTER_AUTH_REDIRECT_KEY = "twitter_auth_redirect";
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const hasAttemptedRef = useRef(false);
  const { completeCallback } = useTwitterAuth();

  useEffect(() => {
    if (hasAttemptedRef.current) return;

    hasAttemptedRef.current = true;

    const completeLogin = async () => {
      const oauthToken = searchParams.get("oauth_token");
      const oauthVerifier = searchParams.get("oauth_verifier");

      if (!oauthToken || !oauthVerifier) {
        navigate("/", { replace: true });
        return;
      }

      try {
        await completeCallback(oauthToken, oauthVerifier);

        const storedRedirect = getCookie(TWITTER_AUTH_REDIRECT_KEY);

        const redirectPath =
          searchParams.get("redirect") ?? storedRedirect ?? "/";

        removeCookie(TWITTER_AUTH_REDIRECT_KEY);

        navigate(redirectPath, { replace: true });
      } catch (callbackError) {
        console.error("Twitter callback failed:", callbackError);
        setError("Twitter login failed. Please try again.");
      }
    };

    void completeLogin();
  }, [navigate, completeCallback, searchParams]);

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          {error ? (
            <>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Twitter Login Failed
              </h1>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Button onClick={() => navigate("/", { replace: true })}>
                Back to Dashboard
              </Button>
            </>
          ) : (
            <>
              <div className="flex justify-center mb-6">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Completing Twitter login
              </h1>
              <p className="text-muted-foreground">
                Please wait while we finalize your authentication.
              </p>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default TwitterCallback;
