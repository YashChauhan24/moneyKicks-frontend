import { ReactNode, useState } from "react";
import { ArrowLeft, Eye, EyeOff, Copy } from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import AssetSelector from "@/components/operations/AssetSelector";
import QuickButtons from "@/components/operations/QuickButtons";
import { useNetwork } from "@/contexts/NetworkContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import {
  useEERC,
  type CompatiblePublicClient,
  type CompatibleWalletClient,
} from "@avalabs/eerc-sdk";
import {
  useAccount,
  usePublicClient,
  useReadContract,
  useWalletClient,
  useWriteContract,
} from "wagmi";
import { avalanche, avalancheFuji } from "wagmi/chains";
import { isAddress, parseUnits } from "viem";
import {
  CIRCUIT_URLS,
  SUPPORTED_TOKENS,
  SupportedToken,
} from "@/config/contracts";
import { DEMO_TOKEN_ABI as erc20Abi, formatTokenAmount } from "@/pkg/constants";
import { useQueryClient } from "@tanstack/react-query";

const TokenOperationsContent = ({
  selectedToken,
  setSelectedToken,
}: {
  selectedToken: SupportedToken;
  setSelectedToken: (t: SupportedToken) => void;
}) => {
  const { isConnected, address } = useAccount();
  const { network, tokenSymbol, explorerUrl } = useNetwork();
  const queryClient = useQueryClient();

  const publicClient = usePublicClient({
    chainId: network === "testnet" ? avalancheFuji.id : avalanche.id,
  });
  const { data: walletClient } = useWalletClient();
  const { writeContractAsync } = useWriteContract();
  // 🔐 Decryption Key State
  const [decryptionKey, setDecryptionKey] = useState<string | null>("");
  const [generatingKey, setGeneratingKey] = useState(false);
  const [showKey, setShowKey] = useState(false);

  const tokenConfig = SUPPORTED_TOKENS[selectedToken];
  console.log(tokenConfig, selectedToken);
  const {
    register,
    useEncryptedBalance,
    generateDecryptionKey,
    isAddressRegistered,
    isInitialized,
    isRegistered,
    isDecryptionKeySet,
  } = useEERC(
    publicClient as CompatiblePublicClient,
    walletClient as CompatibleWalletClient,
    tokenConfig.converter,
    CIRCUIT_URLS,
  );

  const {
    deposit,
    withdraw,
    privateTransfer,
    refetchBalance,
    decryptedBalance,
    decimals,
  } = useEncryptedBalance(tokenConfig.address);

  const [tab, setTab] = useState<
    "deposit" | "withdraw" | "transfer" | "decrypt"
  >("decrypt");

  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [transferType, setTransferType] = useState<"internal" | "external">(
    "internal",
  );
  const [loading, setLoading] = useState(false);

  const { data: erc20Decimals } = useReadContract({
    abi: erc20Abi,
    functionName: "decimals",
    args: [],
    query: { enabled: !!address },
    address: tokenConfig.address,
  }) as { data: number };

  const { data: erc20Balance, refetch: refetchErc20Balance } = useReadContract({
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address as `0x${string}`],
    query: { enabled: !!address, staleTime: 3000 },
    address: tokenConfig.address,
  });

  const { data: erc20Symbol } = useReadContract({
    abi: erc20Abi,
    functionName: "symbol",
    args: [],
    query: { enabled: !!address },
    address: tokenConfig.address,
  });

  const { data: approveAmount, refetch: refetchApproveAmount } =
    useReadContract({
      abi: erc20Abi,
      functionName: "allowance",
      args: [address as `0x${string}`, tokenConfig.converter],
      query: { enabled: !!address, staleTime: 3000 },
      address: tokenConfig.address,
    }) as { data: bigint; refetch: () => void };

  const {
    data: timeUntilNextRequest = 0n,
    refetch: refetchTimeUntilNextRequest,
  } = useReadContract({
    abi: erc20Abi,
    functionName: "timeUntilNextRequest",
    args: [address as `0x${string}`],
    query: { enabled: !!address, refetchInterval: 1000 },
    address: tokenConfig.address,
  }) as { data: bigint; refetch: () => void };

  const getExplorerUrl = (txHash: string) => `${explorerUrl}/tx/${txHash}`;

  const handleApprove = async () => {
    if (!address) return toast.error("Connect wallet first");
    if (!erc20Decimals) return toast.error("Token decimals not loaded");

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0)
      return toast.error("Enter valid amount");
    setLoading(true);
    try {
      const parsedAmount = parseUnits(amount, Number(erc20Decimals));
      // if (
      //   erc20Balance !== undefined &&
      //   parsedAmount > (erc20Balance as bigint)
      // ) {
      //   return toast.error("Insufficient Token Balance");
      // }

      const txHash = await writeContractAsync({
        abi: erc20Abi,
        functionName: "approve",
        args: [tokenConfig.converter, parsedAmount],
        address: tokenConfig.address,
        account: address as `0x${string}`,
        chain: network === "testnet" ? avalancheFuji : avalanche,
      });

      const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
      });

      if (!receipt || receipt.status !== "success") {
        return toast.error("Approval transaction failed");
      }
      await refetchApproveAmount();
      await refetchBalance();
      toast.success(
        <a
          href={getExplorerUrl(txHash)}
          target="_blank"
          rel="noopener noreferrer"
        >
          View Approval on Explorer →
        </a>,
      );
    } catch (error) {
      toast.error(error?.message || "Approve failed");
      console.error(error);
      await refetchBalance();
      await refetchErc20Balance();
    } finally {
      setAmount("");
      setLoading(false);
    }
  };

  const handleDeposit = async () => {
    if (!address) return toast.error("Connect wallet first");
    if (erc20Decimals === undefined)
      return toast.error("Token decimals not loaded");
    if (!isInitialized) return toast.error("ZK circuit not initialized");

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0)
      return toast.error("Enter valid amount");

    setLoading(true);
    try {
      const parsedAmount = parseUnits(amount, Number(erc20Decimals));

      // if (
      //   erc20Balance !== undefined &&
      //   parsedAmount > (erc20Balance as bigint)
      // ) {
      //   return toast.error("Insufficient Token Balance");
      // }
      console.log("approveAmount", approveAmount);

      // if (
      //   approveAmount === undefined ||
      //   parsedAmount > (approveAmount as bigint)
      // ) {
      //   return toast.error(
      //     "Insufficient allowance. Please approve tokens first.",
      //   );
      // }

      const result = await deposit(parsedAmount);

      const receipt = await publicClient.waitForTransactionReceipt({
        hash: result.transactionHash,
      });

      if (!receipt || receipt.status !== "success") {
        return toast.error("Deposit transaction failed");
      }

      await refetchBalance();
      await refetchErc20Balance();

      toast.success(
        <a
          href={getExplorerUrl(result.transactionHash)}
          target="_blank"
          rel="noopener noreferrer"
        >
          View Deposit on Explorer →
        </a>,
      );
    } catch (error) {
      toast.error(error?.message || "Deposit failed");
      console.error(error);
      await refetchBalance();
      await refetchErc20Balance();
    } finally {
      setAmount("");
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!address || !erc20Decimals) {
      toast.error("Please connect your wallet first");
      return;
    }
    if (!isInitialized) return toast.error("ZK circuit not initialized");

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setLoading(true);
    try {
      if (!isDecryptionKeySet) {
        toast.error("Generate decryption key first");
        return;
      }

      const parsedAmount = parseUnits(amount, Number(erc20Decimals));

      if (parsedAmount > decryptedBalance) {
        toast.error("Insufficient encrypted balance");
        return;
      }

      const { transactionHash } = await withdraw(parsedAmount);

      const receipt = await publicClient.waitForTransactionReceipt({
        hash: transactionHash,
      });

      if (!receipt || receipt.status !== "success") {
        return toast.error("Withdraw transaction failed");
      }

      await refetchBalance();
      await refetchErc20Balance();

      toast.success(
        <div>
          Withdraw successful!{" "}
          <a
            href={getExplorerUrl(transactionHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-primary"
          >
            View on Explorer
          </a>
        </div>,
      );
    } catch (error) {
      console.error("Withdraw error:", error);
      await refetchBalance();
      await refetchErc20Balance();
      toast.error(error?.message || "Withdraw failed. Please try again.");
      console.error(error);
    } finally {
      setAmount("");
      setLoading(false);
    }
  };

  const handleTransfer = async () => {
    if (!isConnected) return toast.error("Wallet not connected");

    if (!address || !recipient) return toast.error("Enter recipient");

    if (!isAddress(recipient)) return toast.error("Invalid address");
    if (recipient.toLowerCase() === address.toLowerCase())
      return toast.error("Cannot transfer to yourself");

    if (!isInitialized) return toast.error("ZK circuit not initialized");

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setLoading(true);
    try {
      const { isRegistered } = await isAddressRegistered(
        recipient as `0x${string}`,
      );

      if (!isRegistered)
        return toast.error("Recipient is not registered in the system");
      if (!isDecryptionKeySet) {
        toast.error("Generate decryption key first");
        return;
      }
      const parsedAmount = parseUnits(amount, Number(decimals));

      if (parsedAmount > decryptedBalance) {
        toast.error("Insufficient encrypted balance");
        return;
      }
      console.log("Mode Contract:", tokenConfig.converter);
      console.log("Encrypted balance:", decryptedBalance);
      console.log("Decimals:", decimals);
      console.log("Parsed amount:", parsedAmount);

      const { transactionHash } = await privateTransfer(
        recipient,
        parsedAmount,
      );
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: transactionHash,
      });

      if (!receipt || receipt.status !== "success") {
        return toast.error("Transfer transaction failed");
      }

      await refetchBalance();
      await refetchErc20Balance();
      toast.info(
        <div>
          Transaction submitted!{" "}
          <a
            href={getExplorerUrl(transactionHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-primary"
          >
            View on Explorer
          </a>
        </div>,
      );
    } catch (error) {
      await refetchBalance();
      await refetchErc20Balance();
      console.log("error", error);
      toast.error(error?.message || "Transfer failed");
    } finally {
      setAmount("");
      setRecipient("");
      setLoading(false);
    }
  };

  const handleGenerateKey = async () => {
    if (!isConnected || !address) return toast.error("Connect wallet first");
    if (!walletClient) return toast.error("Waiting for wallet to load...");
    if (!isInitialized)
      return toast.error("ZK circuits initializing, please wait...");

    try {
      setGeneratingKey(true);
      console.log("isRegistered", isRegistered);
      if (!isRegistered) {
        console.log("registering");
        const result = await register();
        console.log("result register", result);
        toast.success("Registered successfully");
      }

      const key = await generateDecryptionKey();
      setDecryptionKey(key);
      toast.success("Decryption key generated and saved");
    } catch (error) {
      toast.error(error?.message || "Key generation failed");
    } finally {
      setGeneratingKey(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background px-6 py-10">
        <div className="max-w-7xl mx-auto">
          {/* HEADER */}
          <div className="flex items-center justify-between mb-10">
            <Link
              to="/"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>

            <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-muted/40 border">
              <div
                className={`w-2 h-2 rounded-full ${
                  isInitialized
                    ? "bg-emerald-500"
                    : "bg-yellow-500 animate-pulse"
                }`}
              />
              <span className="text-xs font-medium">
                {isInitialized ? "ZK Circuit Ready" : "Initializing ZK Circuit"}
              </span>
            </div>
          </div>

          {/* MAIN GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {/* LEFT SIDE – OPERATIONS */}
            <div className="lg:col-span-2 flex">
              <Card className="flex-1 border bg-card/70 backdrop-blur-xl shadow-xl rounded-2xl">
                <CardContent className="p-8 flex flex-col h-full">
                  <Tabs
                    value={tab}
                    onValueChange={(v) => {
                      setTab(v as any);
                      setAmount("");
                      setRecipient("");
                    }}
                  >
                    <TabsList className="grid grid-cols-4 bg-muted/40 p-1 rounded-xl mb-8">
                      {["decrypt", "deposit", "withdraw", "transfer"].map(
                        (t) => (
                          <TabsTrigger
                            key={t}
                            value={t}
                            disabled={t !== "decrypt" && !isDecryptionKeySet}
                            className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg text-sm"
                          >
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                          </TabsTrigger>
                        ),
                      )}
                    </TabsList>

                    {/* ------------------ DECRYPT ------------------ */}
                    {tab === "decrypt" && (
                      <div className="space-y-6">
                        <div className="p-6 rounded-xl border bg-muted/20">
                          <h2 className="text-lg font-semibold mb-4">
                            Generate Decryption Key
                          </h2>
                          {!decryptionKey && (
                            <Button
                              onClick={handleGenerateKey}
                              disabled={isDecryptionKeySet || generatingKey}
                              className="w-full"
                            >
                              {generatingKey ? "Generating..." : "Generate Key"}
                            </Button>
                          )}

                          {decryptionKey && (
                            <div className="mt-6 space-y-4">
                              <div className="p-4 bg-background border rounded-lg font-mono text-xs break-all">
                                {showKey
                                  ? decryptionKey
                                  : "••••••••••••••••••••••••••••"}
                              </div>

                              <div className="flex gap-3">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setShowKey(!showKey)}
                                >
                                  {showKey ? (
                                    <EyeOff className="w-4 h-4 mr-1" />
                                  ) : (
                                    <Eye className="w-4 h-4 mr-1" />
                                  )}
                                  {showKey ? "Hide" : "Show"}
                                </Button>

                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    navigator.clipboard.writeText(
                                      decryptionKey,
                                    );
                                    toast.success("Copied");
                                  }}
                                >
                                  <Copy className="w-4 h-4 mr-1" />
                                  Copy
                                </Button>
                              </div>

                              <p className="text-xs text-yellow-500">
                                Store this key securely. Loss means permanent
                                loss of shielded access.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* ------------------ DEPOSIT ------------------ */}
                    {tab === "deposit" && (
                      <div className="space-y-6">
                        <AssetSelector
                          selectedToken={selectedToken}
                          onTokenChange={setSelectedToken}
                        />

                        <Input
                          placeholder="0.00"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="h-12 text-lg"
                        />

                        <QuickButtons setAmount={setAmount} />

                        <div className="flex gap-4">
                          <Button
                            variant="outline"
                            onClick={handleApprove}
                            disabled={loading}
                            className="w-full"
                          >
                            Approve
                          </Button>

                          <Button
                            onClick={handleDeposit}
                            disabled={loading}
                            className="w-full"
                          >
                            {loading ? "Processing..." : "Deposit"}
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* ------------------ WITHDRAW ------------------ */}
                    {tab === "withdraw" && (
                      <div className="space-y-6">
                        <AssetSelector
                          selectedToken={selectedToken}
                          onTokenChange={setSelectedToken}
                        />

                        <Input
                          placeholder="0.00"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="h-12 text-lg"
                        />

                        <QuickButtons setAmount={setAmount} />

                        <Button
                          onClick={handleWithdraw}
                          disabled={loading}
                          className="w-full"
                        >
                          {loading ? "Processing..." : "Withdraw"}
                        </Button>
                      </div>
                    )}

                    {/* ------------------ TRANSFER ------------------ */}
                    {tab === "transfer" && (
                      <div className="space-y-6">
                        <Input
                          placeholder="Recipient Address"
                          value={recipient}
                          onChange={(e) => setRecipient(e.target.value)}
                          className="h-12"
                        />

                        <Input
                          placeholder="Amount"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="h-12"
                        />

                        <div className="flex gap-3">
                          <Button
                            variant={
                              transferType === "internal"
                                ? "default"
                                : "outline"
                            }
                            onClick={() => setTransferType("internal")}
                            className="w-full"
                          >
                            Private
                          </Button>

                          <Button
                            variant={
                              transferType === "external"
                                ? "default"
                                : "outline"
                            }
                            onClick={() => setTransferType("external")}
                            className="w-full"
                          >
                            Public
                          </Button>
                        </div>

                        <Button onClick={handleTransfer} className="w-full">
                          Transfer
                        </Button>
                      </div>
                    )}
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            {/* RIGHT SIDE – PORTFOLIO CARD */}
            <div className="flex">
              <Card className="flex-1 border bg-gradient-to-br from-muted/30 to-muted/10 backdrop-blur-xl shadow-xl rounded-2xl">
                <CardContent className="p-8 flex flex-col justify-between h-full">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                      Wallet Balance
                    </p>
                    <p className="text-3xl font-semibold mt-2">
                      {erc20Balance
                        ? (
                            Number(erc20Balance) /
                            10 ** (erc20Decimals || 18)
                          ).toFixed(2)
                        : "0"}{" "}
                      {(erc20Symbol || tokenSymbol) as ReactNode}
                    </p>
                  </div>

                  <div className="border-t pt-6">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                      Approved
                    </p>
                    <p className="text-xl font-medium mt-2">
                      {approveAmount
                        ? (
                            Number(approveAmount) /
                            10 ** (erc20Decimals || 18)
                          ).toFixed(2)
                        : "0"}{" "}
                      {(erc20Symbol || tokenSymbol) as ReactNode}
                    </p>
                  </div>

                  <div className="border-t pt-6">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                      Shielded Balance
                    </p>
                    <p className="text-xl font-medium mt-2 text-primary">
                      {decryptedBalance
                        ? formatTokenAmount(decryptedBalance, 18)
                        : "0"}{" "}
                      {(erc20Symbol || tokenSymbol) as ReactNode}
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => refetchBalance()}
                    className="w-full mt-4"
                  >
                    Refresh Balance
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

const Operations = () => {
  const { isConnected } = useAccount();
  const [selectedToken, setSelectedToken] = useState<SupportedToken>("USDC");

  if (!isConnected) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Card>
            <CardContent className="p-6 text-center">
              Connect wallet to continue
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <TokenOperationsContent
      key={selectedToken}
      selectedToken={selectedToken}
      setSelectedToken={setSelectedToken}
    />
  );
};

export default Operations;
