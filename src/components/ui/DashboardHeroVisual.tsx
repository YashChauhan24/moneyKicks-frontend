import { type MouseEvent, useRef } from "react";
import {
  Activity,
  Target,
  Trophy,
  Users,
  Wallet,
} from "lucide-react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { formatCurrency } from "@/lib/utils";

interface DashboardHeroVisualProps {
  totalValueLocked?: number;
  activeBets?: number;
  activeUsers?: number;
  currency?: string;
  jackpotActive?: boolean;
}

const DashboardHeroVisual = ({
  totalValueLocked = 0,
  activeBets = 0,
  activeUsers = 0,
  currency = "USD",
  jackpotActive = false,
}: DashboardHeroVisualProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(50);
  const mouseY = useMotionValue(50);

  const rotateX = useSpring(useTransform(mouseY, [0, 100], [8, -8]), {
    stiffness: 140,
    damping: 18,
    mass: 0.45,
  });
  const rotateY = useSpring(useTransform(mouseX, [0, 100], [-8, 8]), {
    stiffness: 140,
    damping: 18,
    mass: 0.45,
  });

  const glow = useMotionTemplate`radial-gradient(240px circle at ${mouseX}% ${mouseY}%, hsl(var(--primary) / 0.24), transparent 68%)`;

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const bounds = containerRef.current?.getBoundingClientRect();
    if (!bounds) return;

    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;

    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(50);
    mouseY.set(50);
  };

  const metricCards = [
    {
      label: "Total Value Locked",
      value: `${formatCurrency(totalValueLocked)} ${currency}`,
      icon: Wallet,
    },
    {
      label: "Active Bets",
      value: activeBets.toLocaleString(),
      icon: Target,
    },
    {
      label: "Active Users",
      value: activeUsers.toLocaleString(),
      icon: Users,
    },
  ];

  const baseBars = [0.26, 0.45, 0.38, 0.6, 0.52, 0.7, 0.58, 0.8];
  const activityBoost = Math.min(activeBets / 600, 0.2);
  const userBoost = Math.min(activeUsers / 14000, 0.2);
  const pulseBars = baseBars.map((value) =>
    Math.min(0.94, value + activityBoost * 0.7 + userBoost * 0.5),
  );

  return (
    <div className="[perspective:1200px]">
      <motion.div
        ref={containerRef}
        className="relative h-[360px] w-[360px] overflow-hidden rounded-3xl border border-primary/25 bg-card/95 p-6 shadow-[0_40px_80px_-45px_hsl(var(--primary)/0.65)]"
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.35)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.35)_1px,transparent_1px)] bg-[size:24px_24px] opacity-50" />
        <motion.div className="absolute inset-0" style={{ background: glow }} />

        <div className="relative z-10 flex h-full flex-col">
          <div className="mb-4 flex items-center justify-between">
            {/* <div className="flex items-center gap-2">
              <motion.span
                className="h-2.5 w-2.5 rounded-full bg-success"
                animate={{ opacity: [0.35, 1, 0.35] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              />
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                Live Dashboard Pulse
              </span>
            </div> */}
            <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              {jackpotActive ? "Jackpot Active" : "Jackpot Loading"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="relative h-40 rounded-2xl border border-primary/25 bg-primary/5 p-4">
              <motion.div
                className="absolute inset-4 rounded-full border border-primary/30"
                animate={{ scale: [1, 1.08, 1], opacity: [0.35, 0.7, 0.35] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute inset-8 rounded-full border border-primary/40"
                animate={{ scale: [1, 1.05, 1], opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              />
              <div className="relative z-10 flex h-full flex-col items-center justify-center text-center">
                <Trophy className="mb-2 h-6 w-6 text-primary" />
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Market Mood
                </p>
                <p className="mt-1 text-lg font-bold text-foreground">
                  {jackpotActive ? "Bullish" : "Watching"}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {metricCards.slice(0, 2).map((metric, index) => {
                const Icon = metric.icon;
                return (
                  <motion.div
                    key={metric.label}
                    className="rounded-xl border border-border/90 bg-secondary/45 px-3 py-2"
                    animate={{ y: [0, -3, 0] }}
                    transition={{
                      duration: 2.6,
                      delay: index * 0.25,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <div className="mb-1 flex items-center gap-2">
                      <Icon className="h-4 w-4 text-primary" />
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        {metric.label}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-foreground">{metric.value}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-border/90 bg-secondary/30 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Activity className="h-4 w-4 text-primary" />
                <p className="text-xs font-medium uppercase tracking-wide">
                  Liquidity Momentum
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <p className="text-sm font-semibold text-foreground">
                  {metricCards[2].value}
                </p>
              </div>
            </div>

            <div className="flex h-16 items-end gap-1.5">
              {pulseBars.map((bar, index) => (
                <motion.div
                  key={`bar-${index}`}
                  className="flex-1 rounded-md bg-primary/25"
                  initial={{ height: "20%" }}
                  animate={{ height: [`${Math.max(20, bar * 100 - 12)}%`, `${bar * 100}%`, `${Math.max(20, bar * 100 - 8)}%`] }}
                  transition={{
                    duration: 1.6,
                    delay: index * 0.1,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardHeroVisual;
