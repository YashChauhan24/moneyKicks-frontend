import { SUPPORTED_TOKENS, SupportedToken } from "@/config/contracts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AssetSelectorProps {
  selectedToken: SupportedToken;
  onTokenChange: (token: SupportedToken) => void;
}

const AssetSelector = ({
  selectedToken,
  onTokenChange,
}: AssetSelectorProps) => {
  return (
    <div>
      <label className="text-sm text-muted-foreground mb-2 block">Asset</label>
      <Select value={selectedToken} onValueChange={onTokenChange}>
        <SelectTrigger className="w-full bg-background border border-border rounded-lg px-4 py-6 text-lg text-foreground flex items-center justify-between">
          <SelectValue placeholder="Select an asset" />
        </SelectTrigger>
        <SelectContent>
          {Object.keys(SUPPORTED_TOKENS).map((tokenKey) => (
            <SelectItem key={tokenKey} value={tokenKey}>
              {tokenKey}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default AssetSelector;
