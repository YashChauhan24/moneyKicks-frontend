import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Trophy, Target, Wallet, TrendingUp, Users, Clock, ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";
import StatCard from "@/components/ui/StatCard";
import GlowCard from "@/components/ui/GlowCard";
import BouncingMoney from "@/components/ui/BouncingMoney";

const Dashboard = () => {
  const recentBets = [
    { id: 1, title: "BTC vs ETH - Q1 Winner", stake: "500 SOL", status: "Live", participants: 234 },
    { id: 2, title: "Solana TPS Challenge", stake: "200 SOL", status: "Live", participants: 89 },
    { id: 3, title: "NFT Floor Price Battle", stake: "1000 SOL", status: "Settled", participants: 456 },
  ];

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
      <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section with Bouncing Money */}
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
                  <span className="bg-primary text-primary-foreground px-3 py-1 inline-block">ultimate</span>
                  <br />
                  <span className="text-foreground">betting platform for</span>
                  <br />
                  <span className="text-foreground">Web3 enthusiasts</span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-xl mb-10">
                  Win big with weekly jackpots or stake against competitors on Solana.
                </p>
                
                {/* CTA Buttons */}
                <div className="flex flex-wrap gap-4 mb-10">
                  <Link to="/jackpot">
                    <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
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

              {/* Bouncing Money */}
              <div className="hidden lg:block">
                <BouncingMoney />
              </div>
            </div>

            {/* Info Banner */}
            <div className="flex items-start gap-4 bg-secondary/50 rounded-lg p-5 max-w-2xl border border-border">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-foreground font-medium">
                  Weekly jackpot is now at <span className="text-primary font-bold">$48,500</span>. 
                  Enter for just $2 and win up to 50% of the pool.
                </p>
                <Link to="/jackpot" className="inline-flex items-center gap-1 text-primary font-medium mt-2 hover:underline">
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
            <motion.div variants={item}>
              <StatCard
                title="Total Value Locked"
                value="$2.4M"
                icon={Wallet}
                trend={{ value: "12.5%", positive: true }}
                color="primary"
              />
            </motion.div>
            <motion.div variants={item}>
              <StatCard
                title="Active Bets"
                value="156"
                icon={Target}
                trend={{ value: "8 new", positive: true }}
                color="primary"
              />
            </motion.div>
            <motion.div variants={item}>
              <StatCard
                title="Weekly Jackpot"
                value="$48,500"
                icon={Trophy}
                trend={{ value: "Growing", positive: true }}
                color="success"
              />
            </motion.div>
            <motion.div variants={item}>
              <StatCard
                title="Active Users"
                value="12,456"
                icon={Users}
                color="primary"
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
            <motion.div variants={item}>
              <GlowCard className="h-full">
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                      <Trophy className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">Weekly Jackpot</h2>
                      <p className="text-muted-foreground">Enter for just $2</p>
                    </div>
                  </div>

                  <div className="flex-grow">
                    <div className="bg-secondary/50 rounded-lg p-6 mb-6">
                      <p className="text-sm text-muted-foreground mb-2">Current Pool</p>
                      <p className="text-4xl font-bold text-primary">$48,500</p>
                      <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          2,456 entries
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          3d 14h left
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">1st Place</span>
                        <span className="text-success font-semibold">50% of pool</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">2nd Place</span>
                        <span className="text-success font-semibold">30% of pool</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">3rd Place</span>
                        <span className="text-success font-semibold">20% of pool</span>
                      </div>
                    </div>
                  </div>

                  <Link to="/jackpot" className="block">
                    <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-lg h-14">
                      <Zap className="w-5 h-5 mr-2" />
                      Enter Weekly Draw
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                </div>
              </GlowCard>
            </motion.div>

            {/* Betting Card */}
            <motion.div variants={item}>
              <GlowCard className="h-full">
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                      <Target className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">Competitor Betting</h2>
                      <p className="text-muted-foreground">Stake or predict outcomes</p>
                    </div>
                  </div>

                  <div className="flex-grow">
                    <div className="space-y-4 mb-6">
                      {recentBets.slice(0, 2).map((bet) => (
                        <div
                          key={bet.id}
                          className="bg-secondary/50 rounded-lg p-4 border border-border hover:border-primary/50 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-foreground">{bet.title}</h3>
                            <span
                              className={`px-3 py-1 rounded-lg text-xs font-medium ${
                                bet.status === "Live"
                                  ? "bg-success/20 text-success"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {bet.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Stake: {bet.stake}</span>
                            <span>{bet.participants} predictors</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="bg-secondary/30 rounded-lg p-4 mb-6">
                      <div className="flex items-center gap-2 text-primary mb-2">
                        <TrendingUp className="w-4 h-4" />
                        <span className="font-medium">Hot Bets</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        156 active bets with over $2.4M in stakes
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
            <GlowCard hover={false}>
              <h2 className="text-xl font-bold text-foreground mb-6">Recent Activity</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Bet</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Stake</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Participants</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBets.map((bet) => (
                      <tr key={bet.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                        <td className="py-4 px-4 font-medium text-foreground">{bet.title}</td>
                        <td className="py-4 px-4 text-muted-foreground">{bet.stake}</td>
                        <td className="py-4 px-4">
                          <span
                            className={`px-3 py-1 rounded-lg text-xs font-medium ${
                              bet.status === "Live"
                                ? "bg-success/20 text-success"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {bet.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-muted-foreground">{bet.participants}</td>
                        <td className="py-4 px-4 text-right">
                          <Button size="sm" variant="ghost" className="text-primary hover:text-primary/80">
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