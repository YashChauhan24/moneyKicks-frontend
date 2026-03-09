import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, X, Trophy, Target, Shield, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useNetwork } from "@/contexts/NetworkContext";
import { useTwitterAuth } from "@/contexts/TwitterAuthContext";
import { useAccount, useSwitchChain } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import { avalanche, avalancheFuji } from "@reown/appkit/networks";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { open } = useAppKit();
  const { switchChain } = useSwitchChain();

  // Avalanche Wallet hooks
  const { isConnected, address, isConnecting } = useAccount();
  const { network, setNetwork, tokenSymbol } = useNetwork();
  const {
    user,
    isAuthenticated,
    loading: twitterLoading,
    startTwitterLogin,
    logout: twitterLogout,
  } = useTwitterAuth();

  const navLinks = [
    { path: "/", label: "Dashboard", icon: Target },
    { path: "/jackpot", label: "Jackpot", icon: Trophy },
    { path: "/betting", label: "Betting", icon: Target },
    { path: "/operations", label: "Operations", icon: Shield },
    { path: "/admin", label: "Admin", icon: Shield },
  ];

  const isActive = (path: string) => location.pathname === path;

  const truncateAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const displayAddress = address ? truncateAddress(address) : "";

  const handleTwitterLogin = () => {
    const redirectPath = `${location.pathname}${location.search}${location.hash}`;
    void startTwitterLogin(redirectPath);
  };

  const handleTwitterLogout = () => {
    void twitterLogout();
  };

  const handleConnect = async () => {
    try {
      await open();
    } catch (error) {
      console.error("Failed to connect:", error);
      alert(
        error?.message ||
          "Failed to connect wallet. Please make sure MetaMask is installed.",
      );
    }
  };

  const handleNetworkChange = async (checked: boolean) => {
    const newNetwork = checked ? "testnet" : "mainnet";
    setNetwork(newNetwork);

    // If wallet is connected, switch network
    if (isConnected) {
      try {
        switchChain({
          chainId: checked ? avalancheFuji.id : avalanche.id,
        });
      } catch (error) {
        console.error("Failed to switch network:", error);
      }
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <motion.div
              className="flex items-center gap-3"
              whileHover={{ scale: 1.02 }}
            >
              <div className="relative h-10 w-10 rounded-lg flex items-center justify-center">
                <img src="/final_logo.png" alt="Logo" className="w-20 h-10" />
              </div>
              <span className="text-xl font-bold text-foreground">
                MoneyKicks
              </span>
            </motion.div>
          </Link>

          {/* Desktop Navigation - Center */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path}>
                <motion.div
                  className={`px-5 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 ${
                    isActive(link.path)
                      ? "text-foreground font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="font-medium">{link.label}</span>
                </motion.div>
              </Link>
            ))}
          </div>

          {/* Right Side - Auth + Wallet */}
          <div className="flex items-center gap-4">
            {/* Network Switch */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary">
              <Label
                htmlFor="network-switch"
                className="text-xs text-muted-foreground cursor-pointer"
              >
                {network === "mainnet" ? "Mainnet" : "Testnet"}
              </Label>
              <Switch
                id="network-switch"
                checked={network === "testnet"}
                onCheckedChange={handleNetworkChange}
              />
              <span className="text-xs font-medium text-foreground">
                {tokenSymbol}
              </span>
            </div>

            {/* Twitter auth (desktop) */}
            <div className="hidden sm:flex items-center gap-2">
              {isAuthenticated && user ? (
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-secondary border border-border/60">
                  {user.avatarUrl && (
                    <img
                      src={user.avatarUrl}
                      alt={user.displayName || user.username}
                      className="w-6 h-6 rounded-full"
                    />
                  )}
                  <span className="text-sm font-medium text-foreground max-w-[140px] truncate">
                    {user.username ? `@${user.username}` : user.displayName}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleTwitterLogout}
                    className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTwitterLogin}
                  disabled={twitterLoading}
                  className="border-border text-muted-foreground hover:bg-secondary"
                >
                  <Twitter className="w-4 h-4 mr-2" />
                  {twitterLoading ? "Connecting..." : "Login with X"}
                </Button>
              )}
            </div>

            {isConnecting ? (
              <Button
                disabled
                className="bg-primary/50 text-primary-foreground font-semibold"
              >
                Connecting...
              </Button>
            ) : isConnected && address ? (
              <motion.div
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={handleConnect}
              >
                <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <span className="text-sm font-medium text-foreground">
                    {displayAddress}
                  </span>
                </div>
              </motion.div>
            ) : (
              <Button
                onClick={handleConnect}
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
              >
                Connect Wallet
              </Button>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg text-foreground hover:bg-secondary"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <motion.div
          className="md:hidden border-t border-border bg-background"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="px-4 py-4 space-y-2">
            {/* Mobile Network Switch */}
            <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-secondary mb-2">
              <Label
                htmlFor="mobile-network-switch"
                className="text-sm text-foreground"
              >
                {network === "mainnet" ? "Mainnet" : "Testnet"}
              </Label>
              <div className="flex items-center gap-2">
                <Switch
                  id="mobile-network-switch"
                  checked={network === "testnet"}
                  onCheckedChange={handleNetworkChange}
                />
                <span className="text-sm font-medium text-foreground">
                  {tokenSymbol}
                </span>
              </div>
            </div>

            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
              >
                <div
                  className={`px-4 py-3 rounded-lg flex items-center gap-3 ${
                    isActive(link.path)
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  <link.icon className="w-5 h-5" />
                  <span className="font-medium">{link.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </nav>
  );
};

export default Navbar;
