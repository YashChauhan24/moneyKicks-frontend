import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { useTwitterAuth } from "@/contexts/TwitterAuthContext";

const TwitterCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { completeCallback } = useTwitterAuth();

  useEffect(() => {
    const completeLogin = async () => {
      const oauthToken = searchParams.get("oauth_token");
      const oauthVerifier = searchParams.get("oauth_verifier");

      if (!oauthToken || !oauthVerifier) {
        navigate("/", { replace: true });
        return;
      }

      await completeCallback(oauthToken, oauthVerifier);
      const redirectPath = searchParams.get("redirect") || "/";
      navigate(redirectPath, { replace: true });
    };

    void completeLogin();
  }, [navigate, completeCallback, searchParams]);

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="flex justify-center mb-6">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Completing Twitter login
          </h1>
          <p className="text-muted-foreground">
            Please wait while we finalize your authentication.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default TwitterCallback;

