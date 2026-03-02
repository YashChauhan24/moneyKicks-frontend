import { useState } from "react";
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
import { CIRCUIT_CONFIG, CIRCUIT_URLS, CONTRACTS } from "@/config/contracts";
import {
  DEMO_TOKEN_ABI as erc20Abi,
  formatDisplayAmount,
} from "@/pkg/constants";
import { useQueryClient } from "@tanstack/react-query";

const Operations = () => {
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
    CONTRACTS.EERC_CONVERTER,
    CIRCUIT_CONFIG,
  );

  const {
    deposit,
    withdraw,
    privateTransfer,
    refetchBalance,
    decryptedBalance,
    decimals,
  } = useEncryptedBalance(CONTRACTS.ERC20);

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
    address: CONTRACTS.ERC20,
  }) as { data: number };

  const { data: erc20Balance, refetch: refetchErc20Balance } = useReadContract({
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address as `0x${string}`],
    query: { enabled: !!address, staleTime: 3000 },
    address: CONTRACTS.ERC20,
  });

  const { data: erc20Symbol } = useReadContract({
    abi: erc20Abi,
    functionName: "symbol",
    args: [],
    query: { enabled: !!address },
    address: CONTRACTS.ERC20,
  });

  const { data: approveAmount, refetch: refetchApproveAmount } =
    useReadContract({
      abi: erc20Abi,
      functionName: "allowance",
      args: [address as `0x${string}`, CONTRACTS.EERC_CONVERTER],
      query: { enabled: !!address, staleTime: 3000 },
      address: CONTRACTS.ERC20,
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
      if (
        erc20Balance !== undefined &&
        parsedAmount > (erc20Balance as bigint)
      ) {
        return toast.error("Insufficient Token Balance");
      }

      const txHash = await writeContractAsync({
        abi: erc20Abi,
        functionName: "approve",
        args: [CONTRACTS.EERC_CONVERTER, parsedAmount],
        address: CONTRACTS.ERC20,
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

      if (
        erc20Balance !== undefined &&
        parsedAmount > (erc20Balance as bigint)
      ) {
        return toast.error("Insufficient Token Balance");
      }

      if (
        approveAmount === undefined ||
        parsedAmount > (approveAmount as bigint)
      ) {
        return toast.error(
          "Insufficient allowance. Please approve tokens first.",
        );
      }

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
      console.log("Mode Contract:", CONTRACTS.EERC_CONVERTER);
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
    <Layout>
      <div className="min-h-screen px-6 py-12 max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Link to="/" className="flex items-center">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Link>

          <div className="flex items-center space-x-2">
            <div
              className={`w-3 h-3 rounded-full ${isInitialized ? "bg-green-500" : "bg-yellow-500 animate-pulse"}`}
            ></div>
            <span className="text-sm font-medium text-muted-foreground mr-2">
              {isInitialized
                ? "ZK Circuit Ready"
                : "Initializing ZK Circuit..."}
            </span>
          </div>
        </div>

        <Card className="p-6">
          <Tabs
            value={tab}
            onValueChange={(v) => {
              setTab(v as "deposit" | "withdraw" | "transfer" | "decrypt");
              setAmount("");
              setRecipient("");
            }}
          >
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="decrypt">Decrypt</TabsTrigger>
              <TabsTrigger value="deposit" disabled={!isDecryptionKeySet}>
                Deposit
              </TabsTrigger>
              <TabsTrigger value="withdraw" disabled={!isDecryptionKeySet}>
                Withdraw
              </TabsTrigger>
              <TabsTrigger value="transfer" disabled={!isDecryptionKeySet}>
                Transfer
              </TabsTrigger>
            </TabsList>

            {/* ------------------ DECRYPT ------------------ */}
            {tab === "decrypt" && (
              <div className="space-y-6">
                <Card className="p-6 space-y-4">
                  <h2 className="text-xl font-semibold">
                    Generate Decryption Key
                  </h2>
                  {isRegistered && (
                    <Button
                      onClick={handleGenerateKey}
                      disabled={isDecryptionKeySet || generatingKey}
                    >
                      {generatingKey ? "Generating..." : "Generate Key"}
                    </Button>
                  )}

                  {decryptionKey && (
                    <div className="space-y-3">
                      <div className="p-3 bg-muted rounded break-all font-mono text-xs">
                        {showKey ? decryptionKey : "••••••••••••••••••••••••"}
                      </div>

                      <div className="flex gap-2">
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
                            navigator.clipboard.writeText(decryptionKey);
                            toast.success("Copied to clipboard");
                          }}
                        >
                          <Copy className="w-4 h-4 mr-1" />
                          Copy
                        </Button>
                      </div>

                      <div className="text-yellow-500 text-sm">
                        ⚠️ Store this key securely. If lost, you cannot decrypt
                        your shielded balance.
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            )}

            {/* ------------------ DEPOSIT ------------------ */}
            {tab === "deposit" && (
              <div className="space-y-6">
                <AssetSelector symbol={erc20Symbol as string} />
                <Input
                  placeholder="0.0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <QuickButtons setAmount={setAmount} />
                <div className=" space-x-4 flex text-nowrap text-center align-middle">
                  <Button onClick={handleApprove} disabled={loading}>
                    {loading ? "Processing..." : "Approve"}
                  </Button>
                  <Button onClick={handleDeposit} disabled={loading}>
                    {loading ? "Processing..." : "Deposit"}
                  </Button>
                </div>
              </div>
            )}

            {/* ------------------ WITHDRAW ------------------ */}
            {tab === "withdraw" && (
              <div className="space-y-6">
                <AssetSelector symbol={erc20Symbol as string} />
                <Input
                  placeholder="0.0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <QuickButtons setAmount={setAmount} />
                <Button onClick={handleWithdraw} disabled={loading}>
                  {loading ? "Processing..." : "Withdraw"}
                </Button>
              </div>
            )}

            {/* ------------------ TRANSFER ------------------ */}
            {tab === "transfer" && (
              <div className="space-y-6">
                <Input
                  placeholder="Recipient"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                />
                <Input
                  placeholder="Amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button
                    variant={
                      transferType === "internal" ? "default" : "outline"
                    }
                    onClick={() => setTransferType("internal")}
                  >
                    Private
                  </Button>
                  <Button
                    variant={
                      transferType === "external" ? "default" : "outline"
                    }
                    onClick={() => setTransferType("external")}
                  >
                    Public
                  </Button>
                </div>
                <Button onClick={handleTransfer}>Transfer</Button>
              </div>
            )}
          </Tabs>
        </Card>

        {/* Sidebar Balance */}
        <div className="mt-8 space-y-4">
          <Button variant="outline" onClick={() => refetchBalance()}>
            Refresh
          </Button>

          <Card className="p-4 text-center">
            <p>Wallet Balance</p>
            <p className="text-xl font-bold">
              {erc20Balance
                ? (Number(erc20Balance) / 10 ** (erc20Decimals || 18)).toFixed(
                    2,
                  )
                : "0"}{" "}
              {(erc20Symbol as string) || tokenSymbol}
            </p>
            <p>
              {formatDisplayAmount(decryptedBalance)}{" "}
              {(erc20Symbol as string) || tokenSymbol}
            </p>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Operations;
