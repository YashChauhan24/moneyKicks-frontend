import { ChevronDown } from "lucide-react";
import { useNetwork } from "@/contexts/NetworkContext";

interface AssetSelectorProps {
  symbol?: string;
}

const AssetSelector = ({ symbol }: AssetSelectorProps) => {
  const { tokenSymbol, tokenName } = useNetwork();

  const asset = {
    symbol: symbol || tokenSymbol,
    name: tokenName,
  };

  return (
    <div>
      <label className="text-sm text-muted-foreground mb-2 block">Asset</label>
      <div className="relative">
        <div className="w-full bg-background border border-border rounded-lg px-4 py-3 text-lg text-foreground flex items-center justify-between">
          <span>
            {asset.name} ({asset.symbol})
          </span>
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
};

export default AssetSelector;
