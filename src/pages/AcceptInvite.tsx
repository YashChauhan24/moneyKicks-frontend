import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Link,
  useParams,
  useSearchParams,
  useNavigate,
} from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle,
  DollarSign,
  Shield,
  Swords,
  Users,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";
import GlowCard from "@/components/ui/GlowCard";

import { getBetById, ApiBet, makePrediction } from "@/queries/BetApis";
import {
  useAccount,
  useWalletClient,
  usePublicClient,
  useSendTransaction,
} from "wagmi";
import { parseEther } from "viem";
import { toast } from "sonner";

type InviteStep = "review" | "accepted";

const AcceptInvite = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const sideParam = searchParams.get("side") as "A" | "B" | null;

  const [bet, setBet] = useState<ApiBet | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<InviteStep>("review");
  const [isPaying, setIsPaying] = useState(false);

  const { isConnected, address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { sendTransactionAsync } = useSendTransaction();

  const bettingAddress = "0xC13a8bE56C8C26AEa587C20cdeFf27529C085eD8";

  // The side pre-assigned to the invited user (opposite of creator's side)
  const assignedSide: "A" | "B" = sideParam === "A" ? "A" : "B";
  const creatorSide: "A" | "B" = assignedSide === "A" ? "B" : "A";

  useEffect(() => {
    if (!id) return;

    const fetchBet = async () => {
      try {
        setLoading(true);
        const res = await getBetById(id);
        setBet(res.data);
      } catch (err) {
        console.error("Failed to fetch bet:", err);
        toast.error("Failed to load bet details.");
      } finally {
        setLoading(false);
      }
    };

    fetchBet();
  }, [id]);

  const handleAcceptAndPay = async () => {
    if (!bet || !id) return;

    if (!isConnected || !address) {
      toast.error("Please connect your Avalanche wallet first.");
      return;
    }

    if (bettingAddress.toLowerCase() === address.toLowerCase()) {
      toast.error("The toWallet and fromWallet can't be the same.");
      return;
    }

    setIsPaying(true);
    try {
      if (!walletClient || !publicClient) {
        throw new Error("Wallet not ready");
      }

      const stakeAmount = Number(bet.stakeAmount);
      if (!Number.isFinite(stakeAmount) || stakeAmount <= 0) {
        throw new Error("Invalid stake amount.");
      }

      const valueWei = parseEther(bet.stakeAmount.toString());

      // 1. Send payment transaction
      const hash = await sendTransactionAsync({
        to: bettingAddress as `0x${string}`,
        value: valueWei,
      });

      toast.info("Transaction submitted. Waiting for confirmation...");

      // 2. Wait for confirmation
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      if (receipt.status !== "success") {
        throw new Error("Transaction failed on chain.");
      }

      // 3. Record the prediction on the backend
      await makePrediction(id, {
        side: assignedSide,
        amount: Number(stakeAmount),
      });

      setStep("accepted");
      toast.success("Invite accepted successfully!");
    } catch (error) {
      console.error("Accept invite payment failed:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Payment failed. Please try again.";
      toast.error(message);
    } finally {
      setIsPaying(false);
    }
  };

  // ── Loading ──
  if (loading || !bet) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          Loading invite details...
        </div>
      </Layout>
    );
  }

  // ── Invalid side param ──
  if (!sideParam || (sideParam !== "A" && sideParam !== "B")) {
    return (
      <Layout>
        <div className="min-h-screen flex flex-col items-center justify-center text-muted-foreground gap-4">
          <p>Invalid invite link. Missing or invalid side parameter.</p>
          <Link to="/betting">
            <Button>Browse Bets</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const assignedCompetitorName =
    assignedSide === "A" ? bet.competitorAName : bet.competitorBName;
  const creatorCompetitorName =
    creatorSide === "A" ? bet.competitorAName : bet.competitorBName;

  // ── Accepted State ──
  if (step === "accepted") {
    return (
      <Layout>
        <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <GlowCard className="text-center py-16">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                >
                  <CheckCircle className="w-24 h-24 text-success mx-auto mb-6" />
                </motion.div>
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  Invite Accepted! 🎉
                </h2>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  You've joined the bet on{" "}
                  <span className="font-semibold text-primary">
                    {assignedCompetitorName}
                  </span>
                  . Good luck!
                </p>

                <div className="bg-secondary/50 rounded-lg p-6 mb-8 max-w-sm mx-auto">
                  <div className="space-y-3 text-left">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Bet</span>
                      <span className="text-foreground font-bold">
                        {bet.competitorAName} vs {bet.competitorBName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Your Side</span>
                      <span className="text-foreground font-bold">
                        {assignedCompetitorName}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-border pt-3">
                      <span className="text-muted-foreground">Stake Paid</span>
                      <span className="text-success font-bold">
                        {parseFloat(bet.stakeAmount).toLocaleString()}{" "}
                        {bet.currency}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={() => navigate(`/betting/${id}`)}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    View Bet Details
                  </Button>
                  <Link to="/betting">
                    <Button
                      variant="outline"
                      className="border-border text-muted-foreground hover:bg-secondary"
                    >
                      Browse More Bets
                    </Button>
                  </Link>
                </div>
              </GlowCard>
            </motion.div>
          </div>
        </div>
      </Layout>
    );
  }

  // ── Review & Accept State ──
  return (
    <Layout>
      <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link
              to="/betting"
              className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Bets
            </Link>
            <h1 className="text-4xl font-bold text-foreground">
              <span className="text-primary">You've Been</span> Invited!
            </h1>
            <p className="text-muted-foreground mt-2">
              A friend has challenged you to a 1v1 bet. Review the details and
              accept to join.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Bet Details Card */}
            <GlowCard>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
                  <Swords className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    {bet.title}
                  </h2>
                  <p className="text-sm text-muted-foreground">1v1 Bet</p>
                </div>
              </div>

              <div className="bg-secondary/50 rounded-lg p-4 mb-6">
                <p className="text-muted-foreground text-sm">
                  {bet.description}
                </p>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between p-3 bg-secondary/30 rounded-lg">
                  <span className="text-muted-foreground">End Condition</span>
                  <span className="text-foreground font-medium">
                    {bet.endCondition}
                  </span>
                </div>
                <div className="flex justify-between p-3 bg-secondary/30 rounded-lg">
                  <span className="text-muted-foreground">Currency</span>
                  <span className="text-foreground font-medium">
                    {bet.currency}
                  </span>
                </div>
              </div>
            </GlowCard>

            {/* Sides Card */}
            <GlowCard>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Matchup</h2>
                  <p className="text-sm text-muted-foreground">
                    Your position has been pre-selected
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Creator's Side */}
                <div className="p-5 rounded-lg border-2 border-border bg-secondary/30 text-center opacity-60">
                  <Shield className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">
                    Creator's Pick
                  </p>
                  <p className="font-bold text-foreground text-lg">
                    {creatorCompetitorName}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {creatorSide === "A" ? "In Favor" : "Against"}
                  </p>
                </div>

                {/* Invited User's Side (highlighted) */}
                <div className="p-5 rounded-lg border-2 border-primary bg-primary/10 text-center shadow-lg shadow-primary/10">
                  <Swords className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <p className="text-xs text-primary mb-1 uppercase tracking-wider font-semibold">
                    Your Side
                  </p>
                  <p className="font-bold text-foreground text-lg">
                    {assignedCompetitorName}
                  </p>
                  <p className="text-xs text-primary mt-1">
                    {assignedSide === "A" ? "In Favor" : "Against"}
                  </p>
                </div>
              </div>
            </GlowCard>

            {/* Stake & Payment Card */}
            <GlowCard>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
                  <DollarSign className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    Stake Required
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Match the creator's stake to join
                  </p>
                </div>
              </div>

              <div className="bg-secondary/50 rounded-lg p-6 mb-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Stake Amount</span>
                    <span className="text-foreground font-bold text-lg">
                      {parseFloat(bet.stakeAmount).toLocaleString()}{" "}
                      {bet.currency}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm border-t border-border pt-3">
                    <span className="text-muted-foreground font-bold">
                      Total Pot
                    </span>
                    <span className="text-primary font-bold text-lg">
                      {(parseFloat(bet.stakeAmount) * 2).toLocaleString()}{" "}
                      {bet.currency}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground mb-6">
                By accepting, you agree to stake{" "}
                <span className="font-semibold text-foreground">
                  {parseFloat(bet.stakeAmount).toLocaleString()} {bet.currency}
                </span>{" "}
                on{" "}
                <span className="font-semibold text-primary">
                  {assignedCompetitorName}
                </span>
                . The winner takes the entire pot.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={handleAcceptAndPay}
                  disabled={isPaying}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 py-6 text-lg font-bold"
                >
                  {isPaying ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Accept & Pay{" "}
                      {parseFloat(bet.stakeAmount).toLocaleString()}{" "}
                      {bet.currency}
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/betting")}
                  className="border-border text-muted-foreground hover:bg-secondary"
                >
                  Decline
                </Button>
              </div>
            </GlowCard>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default AcceptInvite;
