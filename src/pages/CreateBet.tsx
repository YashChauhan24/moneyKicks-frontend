import { ChangeEvent, useState } from "react";
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
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
  useSendTransaction,
  useWalletClient,
  usePublicClient,
} from "wagmi";
import { parseEther } from "viem";
import { useNetwork } from "@/contexts/NetworkContext";
import { toast } from "sonner";

const CreateBet = () => {
  const navigate = useNavigate();

  const { isConnected, address } = useAccount();
  const { chainId } = useNetwork();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { sendTransactionAsync } = useSendTransaction();

  const [step, setStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const [betCreated, setBetCreated] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [createdBetLink, setCreatedBetLink] = useState<string | null>(null);
  const [inviteHandle, setInviteHandle] = useState<string>("");

  const { data: hash, writeContractAsync } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  const bettingAddress = "0xC13a8bE56C8C26AEa587C20cdeFf27529C085eD8";

  const [formData, setFormData] = useState({
    competitorA: "",
    competitorB: "",
    description: "",
    endCondition: "",
    stakeAmount: "",
    currency: "AVAX",
    startAt: new Date().toISOString(),
    endAt: new Date().toISOString(),
    side: "A",
  });

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNextStep = () => {
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    setStep(step - 1);
  };

  const handlePay = async (stakeAmount: string) => {
    if (!isConnected && !address) {
      toast.error("Please connect your Avalanche wallet first.");
      return;
    }

    if (bettingAddress == address) {
      toast.error("The toWallet and fromWallet can't be same.");
      return;
    }

    setIsPaying(true);
    try {
      if (!walletClient || !publicClient) {
        throw new Error("Wallet not ready");
      }

      const amount = Number(stakeAmount);
      if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error("Invalid jackpot minimum amount.");
      }
      const valueWei = parseEther(stakeAmount);

      const hash = await sendTransactionAsync({
        to: bettingAddress as `0x${string}`,
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
    } catch (error) {
      console.error("Jackpot payment failed:", error);
      toast.error("Payment failed. Please try again.");
    } finally {
      setIsPaying(false);
    }
  };

  const handleCreateBet = async () => {
    try {
      setIsCreating(true);

      // 1. Save Bet to Backend DB (creates UUID needed for smart contract)
      const payload = {
        title: `${formData.competitorA} vs ${formData.competitorB}`,
        description: formData.description,
        competitorAName: formData.competitorA,
        competitorBName: formData.competitorB,
        endCondition: formData.endCondition,
        stakeAmount: Number(formData.stakeAmount),
        currency: "AVAX",
        status: "pending" as const,
        startAt: formData.startAt,
        endAt: formData.endAt,
        side: formData.side,
      };

      await handlePay(formData.stakeAmount);

      const res = await createBet(payload);
      const betId = res?.data?.id;
      // const contractAddress = res?.data?.contractAddress;

      // console.log("Contract Address:", contractAddress);

      if (!betId) throw new Error("Backend failed to create bet");

      // // 2. Send Smart Contract Transaction
      // const txHash = await writeContractAsync({
      //   address: contractAddress as `0x${string}`,
      //   abi: BETTING_CONTRACT_ABI.abi as any,
      //   functionName: "placeBet",
      //   args: [1], // Creator defaults to side 1 (A)
      //   value: parseEther(formData.stakeAmount),
      // });

      // console.log("Create Bet TX Hash:", txHash);

      const oppositeSide = formData.side === "A" ? "B" : "A";
      const shareLink = `${window.location.origin}/betting/${betId}/invite?side=${oppositeSide}`;

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
                  {hash && (
                    <div className="mb-4 p-3 bg-primary/10 border border-primary/30 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">
                        Transaction Hash:
                      </p>
                      <a
                        href={`https://subnets-test.avax.network/c-chain/tx/${hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-mono text-primary break-all hover:underline"
                      >
                        {hash}
                      </a>
                    </div>
                  )}

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
                          const text = encodeURIComponent(
                            `Hey @${handle}, I just created a bet on MoneyKicks: ${formData.competitorA} vs ${formData.competitorB}. Join me here 👇\n${createdBetLink}`,
                          );
                          const shareUrl = `https://twitter.com/messages/compose?text=${text}`;
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
                        currency: "AVAX",
                        startAt: new Date().toISOString(),
                        endAt: new Date().toISOString(),
                        side: "A",
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
                      className="mt-2 bg-secondary/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
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
                      className="mt-2 bg-secondary/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
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
                      className="mt-2 bg-secondary/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all resize-none"
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
                      className="mt-2 bg-secondary/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Specify when and how the winner will be determined
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6  ">
                    <div>
                      <Label>Start Date & Time</Label>
                      <div className="relative flex items-center mt-2">
                        <Input
                          type="datetime-local"
                          name="startAt"
                          value={formData.startAt}
                          onChange={handleInputChange}
                          className="w-full bg-secondary/50 border-border/50 text-foreground [color-scheme:dark] focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>End Date & Time</Label>
                      <div className="relative flex items-center mt-2">
                        <Input
                          type="datetime-local"
                          name="endAt"
                          value={formData.endAt}
                          onChange={handleInputChange}
                          className="w-full bg-secondary/50 border-border/50 text-foreground [color-scheme:dark] focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                        />
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

                <div className="mb-6">
                  <Label>Currency</Label>
                  <div className="relative">
                    <select
                      name="currency"
                      value={formData.currency}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          currency: e.target.value,
                        }))
                      }
                      className="w-full mt-2 rounded-md bg-secondary/50 border border-border/50 px-3 py-2 text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all appearance-none cursor-pointer"
                    >
                      <option value="AVAX">AVAX</option>
                      <option value="USDC">USD</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 pt-2 text-muted-foreground">
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <Label htmlFor="stakeAmount" className="text-foreground">
                      Stake Amount ({formData.currency})
                    </Label>
                    <Input
                      id="stakeAmount"
                      name="stakeAmount"
                      type="number"
                      value={formData.stakeAmount}
                      onChange={handleInputChange}
                      placeholder="e.g., 100"
                      className="mt-2 bg-secondary/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Both competitors will stake this amount
                    </p>
                  </div>

                  {/* In Favor / Against Toggle */}
                  <div className="mb-6">
                    <Label className="text-foreground mb-2 block">
                      Choose Your Position
                    </Label>

                    <div
                      className="relative w-full h-12 rounded-lg bg-secondary/50 border border-border/50 cursor-pointer flex items-center p-1"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          side: prev.side === "A" ? "B" : "A",
                        }))
                      }
                    >
                      {/* Sliding Background */}
                      <div
                        className={`absolute top-1 bottom-1 w-1/2 rounded-md bg-primary transition-all duration-300 ${
                          formData.side === "A" ? "left-1" : "left-1/2"
                        }`}
                      />

                      {/* Labels */}
                      <div className="relative z-10 w-1/2 text-center font-semibold">
                        <span
                          className={
                            formData.side === "A"
                              ? "text-primary-foreground"
                              : "text-muted-foreground"
                          }
                        >
                          In Favor
                        </span>
                      </div>

                      <div className="relative z-10 w-1/2 text-center font-semibold">
                        <span
                          className={
                            formData.side === "B"
                              ? "text-primary-foreground"
                              : "text-muted-foreground"
                          }
                        >
                          Against
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground mt-2">
                      {formData.side === "A"
                        ? `You are betting on ${formData.competitorA}`
                        : `You are betting on ${formData.competitorB}`}
                    </p>
                  </div>

                  {/* Summary */}
                  <div className="bg-secondary/50 rounded-lg p-6">
                    <h3 className="font-semibold mb-4">Bet Summary</h3>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>{formData.competitorA}</span> VS
                        <span>{formData.competitorB}</span>
                      </div>

                      <div className="flex justify-between font-bold text-primary">
                        <span>Total Stake</span>
                        <span>
                          {Number(formData.stakeAmount || 0) * 2}{" "}
                          {formData.currency}
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
                    disabled={
                      !isStep3Valid || isCreating || isConfirming || isPaying
                    }
                    className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                  >
                    {isConfirming
                      ? "Confirming tx..."
                      : isCreating || isPaying
                        ? "Creating..."
                        : "Create Bet"}
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
