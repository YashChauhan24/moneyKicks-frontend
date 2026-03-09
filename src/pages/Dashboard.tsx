import { type MouseEvent, useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  Trophy,
  Target,
  Wallet,
  TrendingUp,
  Users,
  Clock,
  ArrowRight,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import Layout from "@/components/layout/Layout";
import StatCard from "@/components/ui/StatCard";
import GlowCard from "@/components/ui/GlowCard";
import DashboardHeroVisual from "@/components/ui/DashboardHeroVisual";
import { fetchDashboard, DashboardResponse } from "@/queries/DashboardApis";

const Dashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const dashboardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetchDashboard();
        setData(response);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const recentBets = data?.recentBets ?? [];
  const mouseX = useMotionValue(50);
  const mouseY = useMotionValue(30);
  const smoothMouseX = useSpring(mouseX, {
    stiffness: 120,
    damping: 24,
    mass: 0.4,
  });
  const smoothMouseY = useSpring(mouseY, {
    stiffness: 120,
    damping: 24,
    mass: 0.4,
  });
  const spotlight = useMotionTemplate`radial-gradient(560px circle at ${smoothMouseX}% ${smoothMouseY}%, hsl(var(--primary) / 0.14), transparent 62%)`;
  const glowHalo = useMotionTemplate`radial-gradient(260px circle at ${smoothMouseX}% ${smoothMouseY}%, hsl(var(--primary) / 0.24), transparent 70%)`;
  const pulseX = useTransform(smoothMouseX, (value) => `${value}%`);
  const pulseY = useTransform(smoothMouseY, (value) => `${value}%`);

  const handleDashboardMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const bounds = dashboardRef.current?.getBoundingClientRect();
    if (!bounds) return;

    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;

    mouseX.set(x);
    mouseY.set(y);
  };

  const resetDashboardPointer = () => {
    mouseX.set(50);
    mouseY.set(30);
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <Layout>
      <div
        ref={dashboardRef}
        className="relative min-h-screen overflow-hidden px-4 py-8 sm:px-6 lg:px-8"
        onMouseMove={handleDashboardMouseMove}
        onMouseLeave={resetDashboardPointer}
      >
        <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.25)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.25)_1px,transparent_1px)] bg-[size:32px_32px] opacity-35 [mask-image:radial-gradient(ellipse_at_center,black_45%,transparent_85%)]" />
        <motion.div
          className="pointer-events-none absolute inset-0 z-0"
          style={{ background: spotlight }}
        />
        <motion.div
          className="pointer-events-none absolute inset-0 z-0 opacity-80"
          style={{ background: glowHalo }}
        />
        <motion.div
          className="pointer-events-none absolute z-0 hidden h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/25 bg-primary/10 blur-sm lg:block"
          style={{ left: pulseX, top: pulseY }}
          animate={{ scale: [1, 1.22, 1], opacity: [0.16, 0.35, 0.16] }}
          transition={{ duration: 1.9, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* <div className="pointer-events-none absolute right-8 top-8 z-20 hidden items-center gap-2 rounded-full border border-primary/25 bg-card/80 px-4 py-2 backdrop-blur lg:flex">
          <motion.span
            className="h-2.5 w-2.5 rounded-full bg-success"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          />
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Live Pulse
          </span>
        </div> */}

        <div className="relative z-10 mx-auto max-w-7xl">
          {/* Hero Section with Interactive Dashboard Visual */}
          <motion.div
            className="mb-20 pt-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="flex-1">
                <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-tight">
                  <span className="text-foreground">The </span>
                  <span className="bg-primary text-primary-foreground px-3 py-1 inline-block">
                    ultimate
                  </span>
                  <br />
                  <span className="text-foreground">betting platform for</span>
                  <br />
                  <span className="text-foreground">Web3 enthusiasts</span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-xl mb-10">
                  Win big with weekly jackpots or stake against competitors on
                  Avalanche.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-wrap gap-4 mb-10">
                  <Link to="/jackpot">
                    <Button
                      size="lg"
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      Enter Weekly Draw
                    </Button>
                  </Link>
                  <Link to="/betting">
                    <Button size="lg" variant="outline">
                      Browse Bets
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Interactive Hero Visual */}
              <div className="hidden lg:block">
                <DashboardHeroVisual
                  totalValueLocked={data?.stats.totalValueLocked}
                  activeBets={data?.stats.activeBets}
                  activeUsers={data?.stats.activeUsers}
                  currency={"AVAX"}
                  jackpotActive={Boolean(data?.jackpot)}
                />
              </div>
            </div>

            {/* Info Banner */}
            <div className="relative overflow-hidden flex items-start gap-4 rounded-2xl border border-primary/20 bg-gradient-to-br from-card/95 via-card to-primary/[0.08] p-5 shadow-[0_28px_65px_-45px_hsl(var(--primary)/0.9)] backdrop-blur-sm max-w-2xl">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.14),transparent_45%)]" />
              <div className="relative p-3 bg-primary/10 rounded-xl border border-primary/30 shadow-[inset_0_1px_0_hsl(var(--background)/0.7)]">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
              <div className="relative">
                <p className="text-foreground font-medium">
                  Weekly jackpot is now active. Enter for just{" "}
                  {formatCurrency(data?.jackpot?.minAmount ?? "2")}{" "}
                  {data?.jackpot?.currency || "USD"} and win up to 50% of the
                  pool.
                </p>
                <Link
                  to="/jackpot"
                  className="inline-flex items-center gap-1 text-primary font-medium mt-2 hover:underline"
                >
                  Learn more <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
            variants={container}
            initial="hidden"
            animate="show"
          >
            <motion.div
              variants={item}
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              <StatCard
                title="Total Value Locked"
                value={`${formatCurrency(data?.stats.totalValueLocked || 0)} AVAX`}
                icon={Wallet}
                color="primary"
                className="min-h-[152px]"
              />
            </motion.div>
            <motion.div
              variants={item}
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              <StatCard
                title="Active Bets"
                value={(data?.stats.activeBets || 0).toLocaleString()}
                icon={Target}
                color="primary"
                className="min-h-[152px]"
              />
            </motion.div>
            <motion.div
              variants={item}
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              <StatCard
                title="Weekly Jackpot"
                value={data?.jackpot ? "Active" : "Inactive"}
                icon={Trophy}
                color="success"
                className="min-h-[152px]"
              />
            </motion.div>
            <motion.div
              variants={item}
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              <StatCard
                title="Active Users"
                value={(data?.stats.activeUsers || 0).toLocaleString()}
                icon={Users}
                color="primary"
                className="min-h-[152px]"
              />
            </motion.div>
          </motion.div>

          {/* Main Action Cards */}
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {/* Jackpot Card */}
            <motion.div
              variants={item}
              whileHover={{ y: -6 }}
              transition={{ type: "spring", stiffness: 220, damping: 18 }}
            >
              <GlowCard className="h-full overflow-hidden rounded-2xl border-primary/20 bg-gradient-to-b from-card/95 via-card to-primary/[0.05] shadow-[0_35px_80px_-52px_hsl(var(--primary)/0.95)]">
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-4 rounded-xl border border-primary/30 bg-primary/10 shadow-[inset_0_1px_0_hsl(var(--background)/0.8)]">
                      <Trophy className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">
                        Weekly Jackpot
                      </h2>
                      <p className="text-muted-foreground">
                        Enter for just{" "}
                        {formatCurrency(data?.jackpot?.minAmount ?? "2")}{" "}
                        {data?.jackpot?.currency || "USD"}
                      </p>
                    </div>
                  </div>

                  <div className="flex-grow">
                    <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-secondary/70 to-secondary/30 p-6 mb-6">
                      <p className="text-sm text-muted-foreground mb-2">
                        Jackpot minimum entry
                      </p>
                      <p className="text-4xl font-bold text-primary">
                        {formatCurrency(data?.jackpot?.minAmount ?? "2")}{" "}
                        {data?.jackpot?.currency || "USD"}
                      </p>
                      <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {data?.jackpot?.totalEntries ?? 0} entries
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {data?.jackpot?.endAt
                            ? new Date(data.jackpot.endAt).toLocaleDateString()
                            : "Ongoing"}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">1st Place</span>
                        <span className="text-success font-semibold">
                          50% of pool
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">2nd Place</span>
                        <span className="text-success font-semibold">
                          30% of pool
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">3rd Place</span>
                        <span className="text-success font-semibold">
                          20% of pool
                        </span>
                      </div>
                    </div>
                  </div>

                  <Link to="/jackpot" className="block">
                    <Button className="w-full h-14 bg-primary text-primary-foreground font-semibold text-lg shadow-[0_18px_35px_-20px_hsl(var(--primary)/0.95)] hover:bg-primary/90">
                      <Zap className="w-5 h-5 mr-2" />
                      Enter Weekly Draw
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                </div>
              </GlowCard>
            </motion.div>

            {/* Betting Card */}
            <motion.div
              variants={item}
              whileHover={{ y: -6 }}
              transition={{ type: "spring", stiffness: 220, damping: 18 }}
            >
              <GlowCard className="h-full overflow-hidden rounded-2xl border-primary/20 bg-gradient-to-b from-card/95 via-card to-primary/[0.04] shadow-[0_35px_80px_-52px_hsl(var(--primary)/0.85)]">
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-4 rounded-xl border border-primary/30 bg-primary/10 shadow-[inset_0_1px_0_hsl(var(--background)/0.8)]">
                      <Target className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">
                        Competitor Betting
                      </h2>
                      <p className="text-muted-foreground">
                        Stake or predict outcomes
                      </p>
                    </div>
                  </div>

                  <div className="flex-grow">
                    <div className="space-y-4 mb-6">
                      {recentBets.slice(0, 2).map((bet) => (
                        <div
                          key={bet.id}
                          className="rounded-xl border border-border/80 bg-gradient-to-r from-secondary/60 to-secondary/30 p-4 transition-all hover:border-primary/45 hover:shadow-[0_20px_45px_-35px_hsl(var(--primary)/0.9)]"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-foreground">
                              {bet.title}
                            </h3>
                            <span
                              className={`px-3 py-1 rounded-lg text-xs font-medium ${
                                bet.status === "live"
                                  ? "bg-success/20 text-success"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {bet.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>
                              Stake: {formatCurrency(bet.stakeAmount)}{" "}
                              {bet.currency}
                            </span>
                            <span>{bet.participants} predictors</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-secondary/45 to-secondary/20 p-4 mb-6">
                      <div className="flex items-center gap-2 text-primary mb-2">
                        <TrendingUp className="w-4 h-4" />
                        <span className="font-medium">Hot Bets</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {data?.stats.activeBets || 0} active bets with over $
                        {formatCurrency(data?.stats.totalValueLocked || 0)} in
                        stakes
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Link to="/betting/create">
                      <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
                        Create Bet
                      </Button>
                    </Link>
                    <Link to="/betting">
                      <Button variant="outline" className="w-full">
                        Browse Bets
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </GlowCard>
            </motion.div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <GlowCard
              hover={false}
              className="overflow-hidden rounded-2xl border-primary/15 bg-gradient-to-b from-card/95 to-card/80 shadow-[0_30px_65px_-50px_hsl(var(--primary)/0.8)]"
            >
              <h2 className="text-xl font-bold text-foreground mb-6">
                Recent Activity
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                        Bet
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                        Stake
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                        Participants
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBets.map((bet) => (
                      <tr
                        key={bet.id}
                        className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                      >
                        <td className="py-4 px-4 font-medium text-foreground">
                          {bet.title}
                        </td>
                        <td className="py-4 px-4 text-muted-foreground">
                          {formatCurrency(bet.stakeAmount)} {bet.currency}
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`px-3 py-1 rounded-lg text-xs font-medium ${
                              bet.status === "live"
                                ? "bg-success/20 text-success"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {bet.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-muted-foreground">
                          {bet.participants}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-primary hover:text-primary/80"
                            onClick={() => navigate(`/betting/${bet.id}`)}
                          >
                            View <ArrowRight className="w-4 h-4 ml-1" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlowCard>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
