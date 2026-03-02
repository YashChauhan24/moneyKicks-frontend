import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  Users,
  TrendingUp,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Twitter,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Layout from "@/components/layout/Layout";
import GlowCard from "@/components/ui/GlowCard";

import { getBetById, ApiBet, makePrediction } from "@/queries/BetApis";

type BetViewStep = "view" | "predict" | "confirmed";

const BetDetail = () => {
  const { id } = useParams();

  const [bet, setBet] = useState<ApiBet | null>(null);
  const [loading, setLoading] = useState(true);

  const [step, setStep] = useState<BetViewStep>("view");
  const [selectedCompetitor, setSelectedCompetitor] = useState<
    "A" | "B" | null
  >(null);
  const [betAmount, setBetAmount] = useState("");

  // ✅ Fetch bet from API layer
  useEffect(() => {
    if (!id) return;

    const fetchBet = async () => {
      try {
        setLoading(true);
        const res = await getBetById(id);
        setBet(res.data);
      } catch (err) {
        console.error("Failed to fetch bet:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBet();
  }, [id]);

  // ✅ Loading state
  if (loading || !bet) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center text-muted-foreground">
          Loading bet details...
        </div>
      </Layout>
    );
  }

  // ✅ Safe stats handling
  const totalOnA = Number(bet.stats?.totalOnA ?? 0);
  const totalOnB = Number(bet.stats?.totalOnB ?? 0);
  const totalPool = Number(bet.stats?.totalPool ?? 0);
  const totalPredictors = bet.stats?.predictorCount ?? 0;

  // ✅ Odds calculation
  const oddsA = totalOnA === 0 ? "1.00" : (totalOnB / totalOnA).toFixed(2);
  const oddsB = totalOnB === 0 ? "1.00" : (totalOnA / totalOnB).toFixed(2);

  const calculatePayout = () => {
    if (!betAmount || !selectedCompetitor) return 0;

    const amount = Number(betAmount);

    return selectedCompetitor === "A"
      ? (amount * (1 + Number(oddsA))).toFixed(2)
      : (amount * (1 + Number(oddsB))).toFixed(2);
  };

  const handleMakePrediction = () => setStep("predict");

  const handleConfirmPrediction = async () => {
    if (!id || !selectedCompetitor || !betAmount) return;

    try {
      setLoading(true);

      await makePrediction(id, {
        side: selectedCompetitor,
        amount: Number(betAmount),
      });

      setStep("confirmed");
    } catch (err) {
      console.error("Prediction failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep("view");
    setSelectedCompetitor(null);
    setBetAmount("");
  };

  return (
    <Layout>
      <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          {/* HEADER */}
          <div className="mb-8">
            <Link
              to="/betting"
              className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Bets
            </Link>

            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 rounded-lg text-xs font-medium bg-success/20 text-success">
                {bet.status.toUpperCase()}
              </span>

              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {bet.endCondition}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              {bet.title}
            </h1>
          </div>

          <AnimatePresence mode="wait">
            {/* ================= VIEW STEP ================= */}
            {step === "view" && (
              <motion.div
                key="view"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {/* DESCRIPTION */}
                <GlowCard className="mb-8" hover={false}>
                  <h2 className="text-lg font-semibold mb-3">About this bet</h2>
                  <p className="text-muted-foreground">{bet.description}</p>
                </GlowCard>

                {/* COMPETITORS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <GlowCard>
                    <h3 className="text-2xl font-bold text-center mb-4">
                      {bet.competitorAName}
                    </h3>

                    <div className="space-y-4">
                      <div className="flex justify-between p-3 bg-secondary/50 rounded-lg">
                        <span>Prediction Pool</span>
                        <span>${totalOnA.toLocaleString()}</span>
                      </div>

                      <div className="flex justify-between p-3 bg-primary/10 rounded-lg">
                        <span>Odds</span>
                        <span>1:{oddsA}</span>
                      </div>
                    </div>
                  </GlowCard>

                  <GlowCard>
                    <h3 className="text-2xl font-bold text-center mb-4">
                      {bet.competitorBName}
                    </h3>

                    <div className="space-y-4">
                      <div className="flex justify-between p-3 bg-secondary/50 rounded-lg">
                        <span>Prediction Pool</span>
                        <span>${totalOnB.toLocaleString()}</span>
                      </div>

                      <div className="flex justify-between p-3 bg-primary/10 rounded-lg">
                        <span>Odds</span>
                        <span>1:{oddsB}</span>
                      </div>
                    </div>
                  </GlowCard>
                </div>

                {/* STATS */}
                <GlowCard className="mb-8" hover={false}>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                    <div>
                      <TrendingUp className="w-6 h-6 mx-auto mb-2 text-primary" />
                      <p className="text-2xl font-bold">
                        ${totalPool.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Total Pool
                      </p>
                    </div>

                    <div>
                      <Users className="w-6 h-6 mx-auto mb-2 text-primary" />
                      <p className="text-2xl font-bold">{totalPredictors}</p>
                      <p className="text-sm text-muted-foreground">
                        Predictors
                      </p>
                    </div>

                    <div>
                      <DollarSign className="w-6 h-6 mx-auto mb-2 text-success" />
                      <p className="text-2xl font-bold">
                        {parseFloat(bet.stakeAmount).toLocaleString()}{" "}
                        {bet.currency}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Stake Amount
                      </p>
                    </div>

                    <div>
                      <AlertCircle className="w-6 h-6 mx-auto mb-2" />
                      <p className="text-2xl font-bold">5%</p>
                      <p className="text-sm text-muted-foreground">
                        Platform Fee
                      </p>
                    </div>
                  </div>
                </GlowCard>

                {/* CTA */}
                <div className="flex flex-col items-center gap-4">
                  <Button
                    onClick={handleMakePrediction}
                    className="px-12 py-6 text-lg font-bold"
                  >
                    Make Your Prediction
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => {
                      const text = encodeURIComponent(
                        `Join this bet: ${bet.title}`,
                      );
                      const url = encodeURIComponent(window.location.href);
                      window.open(
                        `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
                        "_blank",
                      );
                    }}
                  >
                    <Twitter className="w-4 h-4 mr-2" />
                    Invite friends on X
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ================= PREDICT STEP ================= */}
            {step === "predict" && (
              <motion.div key="predict">
                {/* DESCRIPTION */}
                <GlowCard className="mb-8" hover={false}>
                  <h2 className="text-lg font-semibold mb-3">About this bet</h2>
                  <p className="text-muted-foreground">{bet.description}</p>
                </GlowCard>
                <GlowCard>
                  <h2 className="text-2xl font-bold mb-6">
                    Make Your Prediction
                  </h2>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    {/* Competitor A */}
                    <button
                      onClick={() => setSelectedCompetitor("A")}
                      className={`p-6 rounded-lg border-2 transition-all text-center ${
                        selectedCompetitor === "A"
                          ? "border-primary bg-primary/10 shadow-lg scale-[1.02]"
                          : "border-border bg-secondary/50 hover:border-primary/50"
                      }
                      `}
                    >
                      <p className="font-bold text-foreground mb-2">
                        {bet.competitorAName}
                      </p>
                      <p className="text-sm text-primary">Odds: 1:{oddsA}</p>
                    </button>

                    {/* Competitor B */}
                    <button
                      onClick={() => setSelectedCompetitor("B")}
                      className={`p-6 rounded-lg border-2 transition-all text-center ${
                        selectedCompetitor === "B"
                          ? "border-primary bg-primary/10 shadow-lg scale-[1.02]"
                          : "border-border bg-secondary/50 hover:border-primary/50"
                      }
                      `}
                    >
                      <p className="font-bold text-foreground mb-2">
                        {bet.competitorBName}
                      </p>
                      <p className="text-sm text-primary">Odds: 1:{oddsB}</p>
                    </button>
                  </div>

                  <Input
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(e.target.value)}
                    placeholder="Enter amount..."
                  />

                  {selectedCompetitor && betAmount && (
                    <div className="mt-6 text-success font-bold">
                      Potential Payout: ${calculatePayout()}
                    </div>
                  )}

                  <div className="flex gap-4 mt-6">
                    <Button
                      onClick={handleConfirmPrediction}
                      disabled={!selectedCompetitor || !betAmount || loading}
                    >
                      {loading ? "Placing..." : "Confirm Prediction"}
                    </Button>

                    <Button variant="outline" onClick={handleReset}>
                      Cancel
                    </Button>
                  </div>
                </GlowCard>
              </motion.div>
            )}

            {/* ================= CONFIRMED STEP ================= */}
            {step === "confirmed" && (
              <motion.div key="confirmed">
                <GlowCard className="text-center py-16">
                  <CheckCircle className="w-24 h-24 mx-auto mb-6 text-success" />
                  <h2 className="text-3xl font-bold mb-4">
                    Prediction Placed!
                  </h2>

                  <Link to="/betting">
                    <Button>Browse More Bets</Button>
                  </Link>
                </GlowCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
};

export default BetDetail;
