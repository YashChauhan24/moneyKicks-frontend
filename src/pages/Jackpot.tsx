import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Users,
  Clock,
  Wallet,
  CheckCircle,
  XCircle,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";
import GlowCard from "@/components/ui/GlowCard";
import { useNetwork } from "@/contexts/NetworkContext";
import {
  fetchCurrentJackpot,
  submitJackpotTransfer,
  checkJackpotParticipation,
  fetchJackpotPool,
  JackpotItem,
  JackpotPoolData,
} from "@/queries/JackpotApis";
import { toast } from "sonner";
import {
  useAccount,
  usePublicClient,
  useSendTransaction,
  useWalletClient,
} from "wagmi";
import { parseEther } from "viem";
import { formatCurrency } from "@/lib/utils";

type JackpotStep = "overview" | "loading" | "confirm" | "entered" | "result";
type PaymentOption = "USD" | "AVAX";

const Jackpot = () => {
  const [step, setStep] = useState<JackpotStep>("overview");
  const [isWinner, setIsWinner] = useState<boolean | null>(null);
  const [currentJackpot, setCurrentJackpot] = useState<JackpotItem | null>(
    null,
  );
  const [isParticipated, setIsParticipated] = useState(false);
  const [isLoadingJackpot, setIsLoadingJackpot] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentOption, setPaymentOption] = useState<PaymentOption>("AVAX");
  const [poolData, setPoolData] = useState<JackpotPoolData | null>(null);

  const { address, isConnected } = useAccount();
  const { chainId } = useNetwork();

  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { sendTransactionAsync } = useSendTransaction();

  const jackpotAddress = "0xC13a8bE56C8C26AEa587C20cdeFf27529C085eD8";

  const loadJackpot = async (
    wallet?: string | null,
  ): Promise<{
    activeJackpot: JackpotItem | null;
    alreadyParticipated: boolean;
  }> => {
    try {
      setIsLoadingJackpot(true);
      const resp = await fetchCurrentJackpot(wallet || undefined, true);
      const active = resp.data.find((j) => j.isActive);
      setCurrentJackpot(active || null);

      if (active) {
        let alreadyParticipated = false;

        // Check participation using the dedicated API endpoint if wallet is provided
        if (wallet) {
          try {
            alreadyParticipated = await checkJackpotParticipation(
              active.id,
              wallet,
            );
          } catch (error) {
            console.error("Error checking participation via API:", error);
            // Fallback to local checking logic
            const lowerWallet = wallet.toLowerCase();
            alreadyParticipated =
              active.hasParticipated === true ||
              (Array.isArray(active.participants) &&
                !!lowerWallet &&
                active.participants.some(
                  (p) => p.toLowerCase() === lowerWallet,
                ));
          }
        }

        // Fetch pool data for this jackpot
        try {
          const pool = await fetchJackpotPool(active.id);
          setPoolData(pool);
        } catch (error) {
          console.error("Error fetching jackpot pool:", error);
          setPoolData(null);
        }

        setIsParticipated(alreadyParticipated);
        return { activeJackpot: active, alreadyParticipated };
      }

      setIsParticipated(false);
      setPoolData(null);
      return { activeJackpot: null, alreadyParticipated: false };
    } catch (error) {
      console.error("Failed to load jackpot:", error);
      toast.error("Failed to load jackpot details");
      setCurrentJackpot(null);
      setIsParticipated(false);
      return { activeJackpot: null, alreadyParticipated: false };
    } finally {
      setIsLoadingJackpot(false);
    }
  };

  useEffect(() => {
    // Load jackpot once on mount; if wallet is connected, include it to check participation
    loadJackpot(address);
  }, [address]);

  const handleEnterDraw = async () => {
    if (!isConnected || !address) {
      toast.error("Please connect your Avalanche wallet first.");
      return;
    }

    setStep("loading");
    const { activeJackpot, alreadyParticipated } = await loadJackpot(address);

    if (!activeJackpot) {
      toast.error("No active jackpot available right now.");
      setStep("overview");
      return;
    }

    if (alreadyParticipated) {
      toast.info("You have already participated in the current jackpot.");
      setStep("overview");
      return;
    }

    setStep("confirm");
  };

  const handleConfirmEntry = () => {
    // This is now handled by on-chain payment and transfer API
    void handlePay();
  };

  const handleSimulateResult = (won: boolean) => {
    setIsWinner(won);
    setStep("result");
  };

  const handleReset = () => {
    setStep("overview");
    setIsWinner(null);
  };

  const handlePay = async () => {
    if (!currentJackpot) {
      toast.error("Jackpot details not loaded.");
      return;
    }

    if (!isConnected || !address) {
      toast.error("Please connect your Avalanche wallet first.");
      return;
    }

    if (isParticipated) {
      toast.info("You have already participated in the current jackpot.");
      setStep("overview");
      return;
    }

    setIsPaying(true);
    try {
      if (jackpotAddress.toLowerCase() === address.toLowerCase()) {
        toast.error("The toWallet and fromWallet can't be same.");
        return;
      }

      if (paymentOption === "AVAX") {
        if (!walletClient || !publicClient) {
          throw new Error("Wallet not ready");
        }
        // Use jackpot minAmount as fixed AVAX amount
        const amountAvax = Number(currentJackpot.minAmount);
        if (!Number.isFinite(amountAvax) || amountAvax <= 0) {
          throw new Error("Invalid jackpot minimum amount.");
        }

        const valueWei = parseEther(amountAvax.toString());

        // Send transaction
        const hash = await sendTransactionAsync({
          to: jackpotAddress as `0x${string}`,
          value: valueWei,
        });

        toast.info("Transaction submitted. Waiting for confirmation...");

        // Wait for confirmation
        const receipt = await publicClient.waitForTransactionReceipt({
          hash,
        });

        if (receipt.status !== "success") {
          throw new Error("Transaction failed on chain.");
        }

        await submitJackpotTransfer({
          fromWallet: address,
          toWallet: jackpotAddress,
          amount: amountAvax,
          currency: "AVAX",
          txHash: hash,
          network: chainId,
          jackpotId: currentJackpot.id,
        });
      } else {
        const amountUsd = Number(currentJackpot.minAmount);
        if (!Number.isFinite(amountUsd) || amountUsd <= 0) {
          throw new Error("Invalid jackpot USD amount.");
        }

        // Pay in USD (off-chain) and report transfer destination wallet via API
        await submitJackpotTransfer({
          fromWallet: address,
          toWallet: jackpotAddress,
          amount: amountUsd,
          currency: "USD",
          txHash: "",
          network: chainId,
          jackpotId: currentJackpot.id,
        });
      }

      toast.success("You have successfully entered the jackpot!");
      setIsParticipated(true);
      setStep("entered");
    } catch (error) {
      console.error("Jackpot payment failed:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Payment failed. Please try again.";
      toast.error(message);
    } finally {
      setIsPaying(false);
    }
  };

  const previousWinners = [
    { address: "7xKp...3Fj2", prize: "$24,250", place: 1 },
    { address: "9mNq...8Hk4", prize: "$14,550", place: 2 },
    { address: "3wRt...1Lp7", prize: "$9,700", place: 3 },
  ];

  const getTimeLeft = (endAt: string) => {
    const diff = new Date(endAt).getTime() - new Date().getTime();

    if (diff <= 0) return "Ended";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / (1000 * 60)) % 60);

    return `${days}d ${hours}h ${mins}m`;
  };

  return (
    <Layout>
      <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link
              to="/"
              className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              <span className="text-primary">Weekly</span> Jackpot
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                {step === "overview" && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    {isParticipated ? (
                      <>
                        <GlowCard className="mb-8 border-success/50 bg-gradient-to-br from-success/5 to-transparent">
                          <div className="text-center py-8">
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.1, type: "spring" }}
                              className="inline-flex p-6 rounded-lg bg-success/20 border border-success/50 mb-6"
                            >
                              <CheckCircle className="w-16 h-16 text-success" />
                            </motion.div>
                            <h2 className="text-4xl font-bold text-success mb-2">
                              You're Already In! ✓
                            </h2>
                            <p className="text-muted-foreground mb-6 text-lg">
                              Your entry is confirmed for this week's jackpot
                              draw
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 max-w-md mx-auto">
                              <div className="bg-secondary/50 rounded-lg p-4 border border-success/30">
                                <p className="text-xs text-muted-foreground mb-2">
                                  Jackpot Amount
                                </p>
                                <p className="text-2xl font-bold text-foreground">
                                  {currentJackpot
                                    ? `${
                                        currentJackpot.currency === "USD"
                                          ? "$"
                                          : ""
                                      }${Number(
                                        currentJackpot.minAmount,
                                      ).toLocaleString()} ${
                                        currentJackpot.currency === "USD"
                                          ? ""
                                          : currentJackpot.currency
                                      }`
                                    : "$48,500"}
                                </p>
                              </div>
                              <div className="bg-secondary/50 rounded-lg p-4 border border-success/30">
                                <p className="text-xs text-muted-foreground mb-2">
                                  Draw Date
                                </p>
                                <p className="text-lg font-bold text-foreground">
                                  Friday
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  8:00 PM UTC
                                </p>
                              </div>
                            </div>

                            <div className="bg-success/10 rounded-lg p-4 mb-8 border border-success/30">
                              <p className="text-sm text-foreground mb-2">
                                📍 What's Next?
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Keep checking back on{" "}
                                <span className="font-semibold text-foreground">
                                  Friday at 8:00 PM UTC
                                </span>{" "}
                                to see if you're one of our lucky winners!
                              </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                              <Button
                                onClick={handleReset}
                                className="px-8 py-6 text-lg bg-primary text-primary-foreground hover:bg-primary/90 font-bold"
                              >
                                <Trophy className="w-5 h-5 mr-2" />
                                View Prize Distribution
                              </Button>
                              <Link to="/">
                                <Button
                                  variant="outline"
                                  className="px-8 py-6 border-border text-muted-foreground hover:bg-secondary w-full sm:w-auto"
                                >
                                  Back to Dashboard
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </GlowCard>

                        {/* Prize Distribution */}
                        <GlowCard hover={false}>
                          <h3 className="text-xl font-bold text-foreground mb-4">
                            Prize Distribution
                          </h3>
                          {poolData?.prizeDistribution ? (
                            <div className="space-y-4">
                              {/* Platform Fee Info */}
                              <div className="bg-secondary/30 rounded-lg p-3 mb-4 border border-secondary/50">
                                <p className="text-xs text-muted-foreground mb-1">
                                  Platform Fee:{" "}
                                  {
                                    poolData.prizeDistribution
                                      .platformFeePercentage
                                  }
                                  % ($
                                  {poolData.prizeDistribution.platformFee.toFixed(
                                    2,
                                  )}
                                  )
                                </p>
                                <p className="text-xs text-foreground font-medium">
                                  Pool After Fee: $
                                  {poolData.prizeDistribution.remainingAfterFee.toFixed(
                                    2,
                                  )}
                                </p>
                              </div>

                              {/* Winners with static percentages */}
                              {poolData.prizeDistribution.winners.map(
                                (winner) => {
                                  const staticPercentages = [50, 30, 20];
                                  const staticPercentage =
                                    staticPercentages[winner.place - 1];
                                  return (
                                    <div
                                      key={winner.place}
                                      className={`flex items-center justify-between p-4 rounded-lg border ${
                                        winner.place === 1
                                          ? "bg-primary/10 border-primary/30"
                                          : "bg-secondary/50 border-secondary/50"
                                      }`}
                                    >
                                      <div className="flex items-center gap-3">
                                        <span className="text-2xl">
                                          {winner.place === 1
                                            ? "🥇"
                                            : winner.place === 2
                                              ? "🥈"
                                              : "🥉"}
                                        </span>
                                        <span className="font-medium text-foreground">
                                          {winner.place === 1
                                            ? "1st"
                                            : winner.place === 2
                                              ? "2nd"
                                              : "3rd"}{" "}
                                          Place
                                        </span>
                                      </div>
                                      <div className="text-right">
                                        <p
                                          className={`text-lg font-bold ${
                                            winner.place === 1
                                              ? "text-primary"
                                              : "text-muted-foreground"
                                          }`}
                                        >
                                          {staticPercentage}%
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                          ${winner.amountUSD.toFixed(2)}
                                        </p>
                                      </div>
                                    </div>
                                  );
                                },
                              )}
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg border border-primary/30">
                                <div className="flex items-center gap-3">
                                  <span className="text-2xl">🥇</span>
                                  <span className="font-medium text-foreground">
                                    1st Place
                                  </span>
                                </div>
                                <span className="text-xl font-bold text-primary">
                                  50%
                                </span>
                              </div>
                              <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <span className="text-2xl">🥈</span>
                                  <span className="font-medium text-foreground">
                                    2nd Place
                                  </span>
                                </div>
                                <span className="text-xl font-bold text-muted-foreground">
                                  30%
                                </span>
                              </div>
                              <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <span className="text-2xl">🥉</span>
                                  <span className="font-medium text-foreground">
                                    3rd Place
                                  </span>
                                </div>
                                <span className="text-xl font-bold text-muted-foreground">
                                  20%
                                </span>
                              </div>
                            </div>
                          )}
                        </GlowCard>
                      </>
                    ) : (
                      <>
                        <GlowCard className="mb-8">
                          <div className="text-center py-8">
                            <div className="inline-flex p-6 rounded-lg bg-primary/10 border border-primary/30 mb-6">
                              <Trophy className="w-16 h-16 text-primary" />
                            </div>
                            <h2 className="text-5xl font-bold text-primary mb-4">
                              {currentJackpot
                                ? `${
                                    currentJackpot.currency === "USD" ? "$" : ""
                                  }${Number(
                                    currentJackpot.minAmount,
                                  ).toLocaleString()} ${
                                    currentJackpot.currency === "USD"
                                      ? ""
                                      : currentJackpot.currency
                                  }`
                                : "$48,500"}
                            </h2>
                            <p className="text-muted-foreground mb-4">
                              Current Jackpot (min entry amount)
                            </p>
                            {currentJackpot && (
                              <p className="text-xs text-muted-foreground mb-4">
                                Active from{" "}
                                {new Date(
                                  currentJackpot.startAt,
                                ).toLocaleString()}{" "}
                                to{" "}
                                {new Date(
                                  currentJackpot.endAt,
                                ).toLocaleString()}
                              </p>
                            )}

                            <div className="grid grid-cols-3 gap-4 mb-8">
                              <div className="bg-secondary/50 rounded-lg p-4">
                                <Users className="w-6 h-6 text-primary mx-auto mb-2" />
                                <p className="text-2xl font-bold text-foreground">
                                  {poolData ? poolData.participantCount : "—"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Entries
                                </p>
                              </div>
                              <div className="bg-secondary/50 rounded-lg p-4">
                                <Clock className="w-6 h-6 text-primary mx-auto mb-2" />
                                <p className="text-lg font-bold text-foreground">
                                  {currentJackpot
                                    ? getTimeLeft(currentJackpot.endAt)
                                    : "3d 14h 22m"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Time Left
                                </p>
                              </div>
                              <div className="bg-secondary/50 rounded-lg p-4">
                                <Wallet className="w-6 h-6 text-success mx-auto mb-2" />
                                <p className="text-2xl font-bold text-foreground">
                                  {poolData
                                    ? `$${poolData.totalPoolUSD.toFixed(2)}`
                                    : "$1"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Total Pool
                                </p>
                              </div>
                            </div>

                            <Button
                              onClick={handleEnterDraw}
                              disabled={isLoadingJackpot || isParticipated}
                              className="w-full sm:w-auto px-12 py-6 text-lg bg-primary text-primary-foreground hover:bg-primary/90 font-bold disabled:opacity-60"
                            >
                              <Sparkles className="w-5 h-5 mr-2" />
                              {isParticipated
                                ? "Already Entered"
                                : "Enter Weekly Draw"}
                            </Button>
                          </div>
                        </GlowCard>

                        {/* Prize Distribution */}
                        <GlowCard hover={false}>
                          <h3 className="text-xl font-bold text-foreground mb-4">
                            Prize Distribution
                          </h3>
                          {poolData?.prizeDistribution ? (
                            <div className="space-y-4">
                              {/* Platform Fee Info */}
                              <div className="bg-secondary/30 rounded-lg p-3 mb-4 border border-secondary/50">
                                <p className="text-xs text-muted-foreground mb-1">
                                  Platform Fee:{" "}
                                  {
                                    poolData.prizeDistribution
                                      .platformFeePercentage
                                  }
                                  % ($
                                  {poolData.prizeDistribution.platformFee.toFixed(
                                    2,
                                  )}
                                  )
                                </p>
                                <p className="text-xs text-foreground font-medium">
                                  Pool After Fee: $
                                  {poolData.prizeDistribution.remainingAfterFee.toFixed(
                                    2,
                                  )}
                                </p>
                              </div>

                              {/* Winners with static percentages */}
                              {poolData.prizeDistribution.winners.map(
                                (winner) => {
                                  const staticPercentages = [50, 30, 20];
                                  const staticPercentage =
                                    staticPercentages[winner.place - 1];
                                  return (
                                    <div
                                      key={winner.place}
                                      className={`flex items-center justify-between p-4 rounded-lg border ${
                                        winner.place === 1
                                          ? "bg-primary/10 border-primary/30"
                                          : "bg-secondary/50 border-secondary/50"
                                      }`}
                                    >
                                      <div className="flex items-center gap-3">
                                        <span className="text-2xl">
                                          {winner.place === 1
                                            ? "🥇"
                                            : winner.place === 2
                                              ? "🥈"
                                              : "🥉"}
                                        </span>
                                        <span className="font-medium text-foreground">
                                          {winner.place === 1
                                            ? "1st"
                                            : winner.place === 2
                                              ? "2nd"
                                              : "3rd"}{" "}
                                          Place
                                        </span>
                                      </div>
                                      <div className="text-right">
                                        <p
                                          className={`text-lg font-bold ${
                                            winner.place === 1
                                              ? "text-primary"
                                              : "text-muted-foreground"
                                          }`}
                                        >
                                          {staticPercentage}%
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                          ${winner.amountUSD.toFixed(2)}
                                        </p>
                                      </div>
                                    </div>
                                  );
                                },
                              )}
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg border border-primary/30">
                                <div className="flex items-center gap-3">
                                  <span className="text-2xl">🥇</span>
                                  <span className="font-medium text-foreground">
                                    1st Place
                                  </span>
                                </div>
                                <span className="text-xl font-bold text-primary">
                                  50%
                                </span>
                              </div>
                              <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <span className="text-2xl">🥈</span>
                                  <span className="font-medium text-foreground">
                                    2nd Place
                                  </span>
                                </div>
                                <span className="text-xl font-bold text-muted-foreground">
                                  30%
                                </span>
                              </div>
                              <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <span className="text-2xl">🥉</span>
                                  <span className="font-medium text-foreground">
                                    3rd Place
                                  </span>
                                </div>
                                <span className="text-xl font-bold text-muted-foreground">
                                  20%
                                </span>
                              </div>
                            </div>
                          )}
                        </GlowCard>
                      </>
                    )}
                  </motion.div>
                )}

                {step === "loading" && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <GlowCard className="text-center py-16">
                      <div className="inline-flex p-6 rounded-lg bg-primary/10 border border-primary/30 mb-6 animate-pulse">
                        <Wallet className="w-16 h-16 text-primary" />
                      </div>
                      <h2 className="text-2xl font-bold text-foreground mb-4">
                        Preparing Your Entry...
                      </h2>
                      <p className="text-muted-foreground">
                        Loading jackpot details and checking eligibility
                      </p>
                    </GlowCard>
                  </motion.div>
                )}

                {step === "confirm" && (
                  <motion.div
                    key="confirm"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <GlowCard className="text-center py-12">
                      <CheckCircle className="w-16 h-16 text-success mx-auto mb-6" />
                      <h2 className="text-2xl font-bold text-foreground mb-2">
                        Confirm Your Entry
                      </h2>
                      <p className="text-muted-foreground mb-8">
                        Choose how you want to pay the jackpot entry. Minimum
                        amount is fixed by the current jackpot.
                      </p>

                      <div className="bg-secondary/50 rounded-lg p-6 mb-8 max-w-sm mx-auto">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-muted-foreground">
                            Entry Fee
                          </span>
                          <span className="text-foreground font-bold">
                            {currentJackpot
                              ? `${formatCurrency(currentJackpot.minAmount)} ${currentJackpot.currency}`
                              : "$1"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-muted-foreground">
                            Platform Fee
                          </span>
                          <span className="text-foreground font-bold">$0</span>
                        </div>
                        <div className="border-t border-border pt-4">
                          <div className="flex justify-between items-center">
                            <span className="text-foreground font-medium">
                              Total
                            </span>
                            <span className="text-primary font-bold text-xl">
                              {currentJackpot
                                ? `${formatCurrency(currentJackpot.minAmount)} ${currentJackpot.currency}`
                                : "$1"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Payment options */}
                      <div className="max-w-sm mx-auto mb-8 space-y-3 text-left">
                        <p className="text-sm font-medium text-foreground mb-2">
                          Select payment option
                        </p>
                        {/* <button
                          type="button"
                          onClick={() => setPaymentOption("USD")}
                          className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border text-sm ${
                            paymentOption === "USD"
                              ? "border-primary bg-primary/10 text-foreground"
                              : "border-border text-muted-foreground hover:bg-secondary/50"
                          }`}
                        >
                          <span>Pay $1 USD</span>
                          {paymentOption === "USD" && (
                            <CheckCircle className="w-4 h-4 text-primary" />
                          )}
                        </button> */}
                        <button
                          type="button"
                          onClick={() =>
                            setPaymentOption(
                              currentJackpot.currency as PaymentOption,
                            )
                          }
                          className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border text-sm ${
                            paymentOption === "AVAX"
                              ? "border-primary bg-primary/10 text-foreground"
                              : "border-border text-muted-foreground hover:bg-secondary/50"
                          }`}
                        >
                          <span>
                            Pay{" "}
                            {currentJackpot
                              ? `${formatCurrency(currentJackpot.minAmount)} ${currentJackpot.currency}`
                              : "min amount in AVAX"}
                          </span>
                          {paymentOption === "AVAX" && (
                            <CheckCircle className="w-4 h-4 text-primary" />
                          )}
                        </button>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                          onClick={handleConfirmEntry}
                          disabled={isPaying}
                          className="px-12 py-6 text-lg bg-primary text-primary-foreground hover:bg-primary/90 font-bold"
                        >
                          {isPaying ? "Processing..." : "Confirm & Pay"}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleReset}
                          className="px-8 py-6 border-border text-muted-foreground hover:bg-secondary"
                        >
                          Cancel
                        </Button>
                      </div>
                    </GlowCard>
                  </motion.div>
                )}

                {step === "entered" && (
                  <motion.div
                    key="entered"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
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
                        You're Entered! 🎉
                      </h2>
                      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                        Your entry has been registered privately. Good luck in
                        this week's draw!
                      </p>

                      <div className="bg-secondary/50 rounded-lg p-6 mb-8 max-w-sm mx-auto">
                        <p className="text-sm text-muted-foreground mb-2">
                          Draw Date
                        </p>
                        <p className="text-xl font-bold text-foreground">
                          Friday, 8:00 PM UTC
                        </p>
                      </div>
                    </GlowCard>
                  </motion.div>
                )}

                {step === "result" && (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <GlowCard className="text-center py-16">
                      {isWinner ? (
                        <>
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", duration: 0.8 }}
                          >
                            <Trophy className="w-24 h-24 text-primary mx-auto mb-6" />
                          </motion.div>
                          <h2 className="text-4xl font-bold text-primary mb-4">
                            🎉 You Won! 🎉
                          </h2>
                          <p className="text-xl text-foreground mb-8">
                            Congratulations! You've won{" "}
                            <span className="text-success font-bold">
                              $24,250
                            </span>
                          </p>
                          <p className="text-muted-foreground mb-8">
                            Your winnings have been transferred privately to
                            your wallet.
                          </p>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-24 h-24 text-muted-foreground mx-auto mb-6" />
                          <h2 className="text-3xl font-bold text-foreground mb-4">
                            Better Luck Next Week
                          </h2>
                          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                            You didn't win this time, but don't give up! Enter
                            again next week for another chance at the jackpot.
                          </p>
                        </>
                      )}

                      <Button
                        onClick={handleReset}
                        className="px-12 py-6 text-lg bg-primary text-primary-foreground hover:bg-primary/90 font-bold"
                      >
                        {isWinner ? "View Details" : "Try Again Next Week"}
                      </Button>
                    </GlowCard>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <GlowCard hover={false}>
                <h3 className="text-lg font-bold text-foreground mb-4">
                  Last Week's Winners
                </h3>
                <div className="space-y-3">
                  {previousWinners.map((winner) => (
                    <div
                      key={winner.address}
                      className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">
                          {winner.place === 1
                            ? "🥇"
                            : winner.place === 2
                              ? "🥈"
                              : "🥉"}
                        </span>
                        <span className="text-sm text-muted-foreground font-mono">
                          {winner.address}
                        </span>
                      </div>
                      <span className="text-success font-bold">
                        {winner.prize}
                      </span>
                    </div>
                  ))}
                </div>
              </GlowCard>

              <GlowCard hover={false}>
                <h3 className="text-lg font-bold text-foreground mb-4">
                  How It Works
                </h3>
                <ol className="space-y-4">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-primary/20 text-primary text-sm font-bold flex items-center justify-center">
                      1
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Pay $1 entry fee
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-primary/20 text-primary text-sm font-bold flex items-center justify-center">
                      2
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Entry is registered privately
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-primary/20 text-primary text-sm font-bold flex items-center justify-center">
                      3
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Draw happens every Friday
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-primary/20 text-primary text-sm font-bold flex items-center justify-center">
                      4
                    </span>
                    <span className="text-sm text-muted-foreground">
                      3 winners are selected
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-primary/20 text-primary text-sm font-bold flex items-center justify-center">
                      5
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Payouts sent privately to wallets
                    </span>
                  </li>
                </ol>
              </GlowCard>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Jackpot;
