import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  DollarSign,
  FileText,
  CheckCircle,
  Twitter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Layout from "@/components/layout/Layout";
import GlowCard from "@/components/ui/GlowCard";
import { createBet } from "@/queries/BetApis";

const CreateBet = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const [betCreated, setBetCreated] = useState(false);
  const [createdBetLink, setCreatedBetLink] = useState<string | null>(null);
  const [inviteHandle, setInviteHandle] = useState<string>("");

  const [formData, setFormData] = useState({
    competitorA: "",
    competitorB: "",
    description: "",
    endCondition: "",
    stakeAmount: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNextStep = () => {
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    setStep(step - 1);
  };

  const handleCreateBet = async () => {
    try {
      setIsCreating(true);

      const payload = {
        title: `${formData.competitorA} vs ${formData.competitorB}`,
        description: formData.description,
        competitorAName: formData.competitorA,
        competitorBName: formData.competitorB,
        endCondition: formData.endCondition,
        stakeAmount: Number(formData.stakeAmount),
        currency: "AVAX",
        status: "pending" as const,
        startAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        endAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const res = await createBet(payload);

      const betId = res?.data?.id;

      const shareLink = `${window.location.origin}/betting/${betId}`;

      setCreatedBetLink(shareLink);
      setBetCreated(true);
    } catch (error) {
      console.error(error);
      alert("Failed to create bet");
    } finally {
      setIsCreating(false);
    }
  };

  const isStep1Valid = formData.competitorA && formData.competitorB;
  const isStep2Valid = formData.description && formData.endCondition;
  const isStep3Valid = formData.stakeAmount && Number(formData.stakeAmount) > 0;

  if (betCreated) {
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
                  Bet Created! 🎉
                </h2>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  Your bet has been published and is ready for competitors to
                  join.
                </p>

                <div className="bg-secondary/50 rounded-lg p-6 mb-8 max-w-md mx-auto text-left">
                  <p className="text-sm text-muted-foreground mb-2">
                    Share this link
                  </p>
                  <div className="flex items-center gap-2">
                    <Input
                      value={
                        createdBetLink ??
                        `${window.location.origin}/betting/abc123`
                      }
                      readOnly
                      className="bg-background border-border text-foreground"
                    />
                    <Button
                      variant="outline"
                      className="shrink-0 border-primary text-primary hover:bg-primary/10"
                      onClick={() => {
                        const link =
                          createdBetLink ??
                          `${window.location.origin}/betting/abc123`;
                        void navigator.clipboard.writeText(link);
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    className="mt-4 w-full border-sky-500 text-sky-500 hover:bg-sky-500/10"
                    onClick={() => {
                      const link =
                        createdBetLink ??
                        `${window.location.origin}/betting/abc123`;
                      const text = encodeURIComponent(
                        `Join my bet on RicheeRich: ${formData.competitorA} vs ${formData.competitorB}`,
                      );
                      const url = encodeURIComponent(link);
                      const shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
                      window.open(shareUrl, "_blank", "noopener,noreferrer");
                    }}
                  >
                    <Twitter className="w-4 h-4 mr-2" />
                    Share invite on X
                  </Button>

                  <div className="mt-6 space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Or invite a specific friend by their Twitter handle:
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                          @
                        </span>
                        <Input
                          value={inviteHandle}
                          onChange={(e) =>
                            setInviteHandle(e.target.value.replace(/^@/, ""))
                          }
                          placeholder="friend_handle"
                          className="pl-7 bg-background border-border text-foreground"
                        />
                      </div>
                      <Button
                        variant="outline"
                        disabled={!inviteHandle.trim()}
                        className="shrink-0 border-sky-500 text-sky-500 hover:bg-sky-500/10 disabled:opacity-50"
                        onClick={() => {
                          const handle = inviteHandle.trim().replace(/^@/, "");
                          if (!handle) return;
                          const link =
                            createdBetLink ??
                            `${window.location.origin}/betting/abc123`;
                          const text = encodeURIComponent(
                            `Hey @${handle}, I just created a bet on RicheeRich: ${formData.competitorA} vs ${formData.competitorB}. Join me here 👇`,
                          );
                          const url = encodeURIComponent(link);
                          const shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
                          window.open(
                            shareUrl,
                            "_blank",
                            "noopener,noreferrer",
                          );
                        }}
                      >
                        Invite friend
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={() => navigate("/betting")}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    View All Bets
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setBetCreated(false);
                      setStep(1);
                      setFormData({
                        competitorA: "",
                        competitorB: "",
                        description: "",
                        endCondition: "",
                        stakeAmount: "",
                      });
                    }}
                    className="border-border text-muted-foreground hover:bg-secondary"
                  >
                    Create Another
                  </Button>
                </div>
              </GlowCard>
            </motion.div>
          </div>
        </div>
      </Layout>
    );
  }

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
              <span className="text-primary">Create</span> New Bet
            </h1>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${
                    step >= s
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {s}
                </div>
                {s < 3 && (
                  <div
                    className={`w-24 sm:w-32 h-1 mx-2 ${
                      step > s ? "bg-primary" : "bg-secondary"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {step === 1 && (
              <GlowCard>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">
                      Competitors
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Who will compete in this bet?
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <Label htmlFor="competitorA" className="text-foreground">
                      Competitor A
                    </Label>
                    <Input
                      id="competitorA"
                      name="competitorA"
                      value={formData.competitorA}
                      onChange={handleInputChange}
                      placeholder="e.g., Bitcoin (BTC)"
                      className="mt-2 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                  <div>
                    <Label htmlFor="competitorB" className="text-foreground">
                      Competitor B
                    </Label>
                    <Input
                      id="competitorB"
                      name="competitorB"
                      value={formData.competitorB}
                      onChange={handleInputChange}
                      placeholder="e.g., Ethereum (ETH)"
                      className="mt-2 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                </div>

                <div className="flex justify-end mt-8">
                  <Button
                    onClick={handleNextStep}
                    disabled={!isStep1Valid}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                  >
                    Continue
                  </Button>
                </div>
              </GlowCard>
            )}

            {step === 2 && (
              <GlowCard>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">
                      Details
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Describe the bet and winning conditions
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <Label htmlFor="description" className="text-foreground">
                      Bet Description
                    </Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Describe what this bet is about..."
                      rows={4}
                      className="mt-2 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                  <div>
                    <Label htmlFor="endCondition" className="text-foreground">
                      End Condition
                    </Label>
                    <Input
                      id="endCondition"
                      name="endCondition"
                      value={formData.endCondition}
                      onChange={handleInputChange}
                      placeholder="e.g., March 31, 2024 at 11:59 PM UTC"
                      className="mt-2 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Specify when and how the winner will be determined
                    </p>
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <Button
                    variant="outline"
                    onClick={handlePrevStep}
                    className="border-border text-muted-foreground hover:bg-secondary"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleNextStep}
                    disabled={!isStep2Valid}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                  >
                    Continue
                  </Button>
                </div>
              </GlowCard>
            )}

            {step === 3 && (
              <GlowCard>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
                    <DollarSign className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">
                      Stake Amount
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Set the stake each competitor must put up
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <Label htmlFor="stakeAmount" className="text-foreground">
                      Stake Amount (SOL)
                    </Label>
                    <Input
                      id="stakeAmount"
                      name="stakeAmount"
                      type="number"
                      value={formData.stakeAmount}
                      onChange={handleInputChange}
                      placeholder="e.g., 100"
                      className="mt-2 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Both competitors will stake this amount
                    </p>
                  </div>

                  {/* Summary */}
                  <div className="bg-secondary/50 rounded-lg p-6 mt-8">
                    <h3 className="font-semibold text-foreground mb-4">
                      Bet Summary
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Competitor A
                        </span>
                        <span className="text-foreground">
                          {formData.competitorA}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Competitor B
                        </span>
                        <span className="text-foreground">
                          {formData.competitorB}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Total Stake
                        </span>
                        <span className="text-primary font-bold">
                          {formData.stakeAmount
                            ? Number(formData.stakeAmount) * 2
                            : 0}{" "}
                          SOL
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <Button
                    variant="outline"
                    onClick={handlePrevStep}
                    className="border-border text-muted-foreground hover:bg-secondary"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleCreateBet}
                    disabled={!isStep3Valid || isCreating}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                  >
                    {isCreating ? "Creating..." : "Create Bet"}
                  </Button>
                </div>
              </GlowCard>
            )}
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default CreateBet;
