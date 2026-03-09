interface QuickButtonsProps {
  setAmount: (amount: string) => void;
  token: string;
}

const QuickButtons = ({ setAmount, token }: QuickButtonsProps) => {
  // Different quick amounts for AVAX vs USDC
  const quickAmounts = [0.1, 0.5, 1.0, 5.0];

  return (
    <div>
      <label className="text-sm text-muted-foreground mb-2 block">
        Quick Amount
      </label>
      <div className="flex gap-2">
        {quickAmounts.map((amount) => (
          <button
            key={amount}
            onClick={() => setAmount(amount.toString())}
            className="flex-1 bg-secondary hover:bg-secondary/80 text-foreground py-2 px-4 rounded-lg text-sm font-medium transition-colors"
          >
            {amount} {token}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickButtons;
