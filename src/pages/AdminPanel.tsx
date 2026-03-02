import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Shield, Users, Trophy, Target, DollarSign, TrendingUp, 
  Settings, Eye, Ban, CheckCircle, Clock, Search, Filter,
  ChevronDown, ChevronRight, AlertTriangle, LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Layout from "@/components/layout/Layout";
import GlowCard from "@/components/ui/GlowCard";
import StatCard from "@/components/ui/StatCard";
import AdminLogin from "@/components/admin/AdminLogin";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

type AdminTab = "overview" | "jackpot" | "bets" | "users" | "payouts" | "settings";

const AdminPanel = () => {
  const { isAdminAuthenticated, logoutAdmin } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [searchQuery, setSearchQuery] = useState("");

  // If not authenticated, show login
  if (!isAdminAuthenticated) {
    return <AdminLogin />;
  }

  // Mock data
  const stats = {
    totalUsers: 12456,
    totalBets: 156,
    totalVolume: 2400000,
    pendingPayouts: 34500,
    platformRevenue: 120000,
    activeJackpot: 48500,
  };

  const recentBets = [
    { id: "1", title: "BTC vs ETH Q1", status: "live", stake: 5000, predictors: 234, pool: 83000 },
    { id: "2", title: "Solana TPS Challenge", status: "live", stake: 2000, predictors: 89, pool: 27000 },
    { id: "3", title: "NFT Floor Battle", status: "pending", stake: 10000, predictors: 0, pool: 0 },
    { id: "4", title: "DeFi TVL Race", status: "settled", stake: 3500, predictors: 167, pool: 47000 },
  ];

  const users = [
    { id: "1", address: "7xKp...3Fj2", joined: "Jan 15, 2024", bets: 23, volume: 15000, status: "active" },
    { id: "2", address: "9mNq...8Hk4", joined: "Jan 12, 2024", bets: 45, volume: 32000, status: "active" },
    { id: "3", address: "3wRt...1Lp7", joined: "Jan 10, 2024", bets: 12, volume: 8000, status: "flagged" },
    { id: "4", address: "5kPm...9Qz3", joined: "Jan 8, 2024", bets: 67, volume: 54000, status: "active" },
  ];

  const jackpotHistory = [
    { week: "Week 3", pool: 48500, entries: 2456, winners: 3, distributed: 46075 },
    { week: "Week 2", pool: 42000, entries: 2100, winners: 3, distributed: 39900 },
    { week: "Week 1", pool: 38000, entries: 1900, winners: 3, distributed: 36100 },
  ];

  const pendingPayouts = [
    { id: "1", user: "7xKp...3Fj2", amount: 12500, type: "Bet Win", bet: "BTC vs ETH", status: "pending" },
    { id: "2", user: "9mNq...8Hk4", amount: 8200, type: "Prediction", bet: "DeFi TVL", status: "pending" },
    { id: "3", user: "3wRt...1Lp7", amount: 5600, type: "Jackpot", bet: "Week 2", status: "processing" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "live":
      case "active":
        return "bg-success/20 text-success";
      case "pending":
      case "processing":
        return "bg-primary/20 text-primary";
      case "settled":
        return "bg-muted text-muted-foreground";
      case "flagged":
        return "bg-destructive/20 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Layout>
      <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Admin Panel</h1>
                <p className="text-muted-foreground">Manage RicheeRich platform</p>
              </div>
            </div>
            <Button variant="outline" onClick={logoutAdmin} className="text-muted-foreground">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>

          {/* Tabs Navigation */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as AdminTab)} className="space-y-8">
            <TabsList className="bg-secondary/50 border border-border p-1 flex-wrap h-auto">
              <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Overview
              </TabsTrigger>
              <TabsTrigger value="jackpot" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Jackpot
              </TabsTrigger>
              <TabsTrigger value="bets" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Bets
              </TabsTrigger>
              <TabsTrigger value="users" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Users
              </TabsTrigger>
              <TabsTrigger value="payouts" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Payouts
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  <StatCard title="Total Users" value={stats.totalUsers.toLocaleString()} icon={Users} color="primary" />
                  <StatCard title="Active Bets" value={stats.totalBets.toString()} icon={Target} color="primary" />
                  <StatCard title="Total Volume" value={`$${(stats.totalVolume / 1000000).toFixed(1)}M`} icon={TrendingUp} color="success" />
                  <StatCard title="Current Jackpot" value={`$${stats.activeJackpot.toLocaleString()}`} icon={Trophy} color="primary" />
                  <StatCard title="Pending Payouts" value={`$${stats.pendingPayouts.toLocaleString()}`} icon={Clock} color="primary" />
                  <StatCard title="Platform Revenue" value={`$${stats.platformRevenue.toLocaleString()}`} icon={DollarSign} color="success" />
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <GlowCard hover={false}>
                    <h3 className="text-lg font-bold text-foreground mb-4">Recent Bets</h3>
                    <div className="space-y-3">
                      {recentBets.slice(0, 4).map((bet) => (
                        <div key={bet.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                          <div>
                            <p className="font-medium text-foreground">{bet.title}</p>
                            <p className="text-sm text-muted-foreground">{bet.predictors} predictors</p>
                          </div>
                          <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(bet.status)}`}>
                            {bet.status.toUpperCase()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </GlowCard>

                  <GlowCard hover={false}>
                    <h3 className="text-lg font-bold text-foreground mb-4">Pending Actions</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border border-primary/30">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="w-5 h-5 text-primary" />
                          <span className="text-foreground">3 bets awaiting verification</span>
                        </div>
                        <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                          Review
                        </Button>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border border-primary/30">
                        <div className="flex items-center gap-3">
                          <Clock className="w-5 h-5 text-primary" />
                          <span className="text-foreground">5 payouts pending approval</span>
                        </div>
                        <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                          Process
                        </Button>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg border border-destructive/30">
                        <div className="flex items-center gap-3">
                          <Ban className="w-5 h-5 text-destructive" />
                          <span className="text-foreground">1 user flagged for review</span>
                        </div>
                        <Button size="sm" variant="destructive">
                          Investigate
                        </Button>
                      </div>
                    </div>
                  </GlowCard>
                </div>
              </motion.div>
            </TabsContent>

            {/* Jackpot Tab */}
            <TabsContent value="jackpot">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                {/* Current Jackpot */}
                <GlowCard>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-muted-foreground mb-2">Current Week's Jackpot</h3>
                      <p className="text-5xl font-bold text-primary">$48,500</p>
                      <div className="flex gap-6 mt-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" /> 2,456 entries
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" /> Draw in 3d 14h
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3">
                      <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                        <Eye className="w-4 h-4 mr-2" /> View Entries
                      </Button>
                      <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                        Run Manual Draw
                      </Button>
                    </div>
                  </div>
                </GlowCard>

                {/* Prize Distribution */}
                <GlowCard hover={false}>
                  <h3 className="text-lg font-bold text-foreground mb-4">Prize Distribution</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-primary/10 rounded-lg p-6 text-center border border-primary/30">
                      <span className="text-3xl mb-2 block">🥇</span>
                      <p className="text-2xl font-bold text-primary">50%</p>
                      <p className="text-sm text-muted-foreground">1st Place</p>
                      <p className="text-lg font-semibold text-foreground mt-2">$24,250</p>
                    </div>
                    <div className="bg-secondary/50 rounded-lg p-6 text-center">
                      <span className="text-3xl mb-2 block">🥈</span>
                      <p className="text-2xl font-bold text-muted-foreground">30%</p>
                      <p className="text-sm text-muted-foreground">2nd Place</p>
                      <p className="text-lg font-semibold text-foreground mt-2">$14,550</p>
                    </div>
                    <div className="bg-secondary/50 rounded-lg p-6 text-center">
                      <span className="text-3xl mb-2 block">🥉</span>
                      <p className="text-2xl font-bold text-muted-foreground">20%</p>
                      <p className="text-sm text-muted-foreground">3rd Place</p>
                      <p className="text-lg font-semibold text-foreground mt-2">$9,700</p>
                    </div>
                  </div>
                </GlowCard>

                {/* Jackpot History */}
                <GlowCard hover={false}>
                  <h3 className="text-lg font-bold text-foreground mb-4">Jackpot History</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Week</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Pool Size</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Entries</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Winners</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Distributed</th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {jackpotHistory.map((week) => (
                          <tr key={week.week} className="border-b border-border/50 hover:bg-secondary/30">
                            <td className="py-4 px-4 font-medium text-foreground">{week.week}</td>
                            <td className="py-4 px-4 text-foreground">${week.pool.toLocaleString()}</td>
                            <td className="py-4 px-4 text-muted-foreground">{week.entries.toLocaleString()}</td>
                            <td className="py-4 px-4 text-success">{week.winners}</td>
                            <td className="py-4 px-4 text-foreground">${week.distributed.toLocaleString()}</td>
                            <td className="py-4 px-4 text-right">
                              <Button size="sm" variant="ghost" className="text-primary hover:text-primary/80">
                                View Details <ChevronRight className="w-4 h-4 ml-1" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </GlowCard>
              </motion.div>
            </TabsContent>

            {/* Bets Tab */}
            <TabsContent value="bets">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                {/* Search & Filters */}
                <GlowCard hover={false}>
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-grow">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        placeholder="Search bets..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-secondary border-border text-foreground"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="border-border text-muted-foreground hover:bg-secondary">
                        <Filter className="w-4 h-4 mr-2" /> All Status
                        <ChevronDown className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </GlowCard>

                {/* Bets Table */}
                <GlowCard hover={false}>
                  <h3 className="text-lg font-bold text-foreground mb-4">All Bets</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Bet</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Stake</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Predictors</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Pool</th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentBets.map((bet) => (
                          <tr key={bet.id} className="border-b border-border/50 hover:bg-secondary/30">
                            <td className="py-4 px-4 font-medium text-foreground">{bet.title}</td>
                            <td className="py-4 px-4">
                              <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(bet.status)}`}>
                                {bet.status.toUpperCase()}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-foreground">${bet.stake.toLocaleString()}</td>
                            <td className="py-4 px-4 text-muted-foreground">{bet.predictors}</td>
                            <td className="py-4 px-4 text-foreground">${bet.pool.toLocaleString()}</td>
                            <td className="py-4 px-4 text-right">
                              <div className="flex gap-2 justify-end">
                                <Button size="sm" variant="ghost" className="text-primary hover:text-primary/80">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="ghost" className="text-primary hover:text-primary/80">
                                  <Settings className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </GlowCard>
              </motion.div>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                {/* Search */}
                <GlowCard hover={false}>
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-grow">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        placeholder="Search users by address..."
                        className="pl-10 bg-secondary border-border text-foreground"
                      />
                    </div>
                  </div>
                </GlowCard>

                {/* Users Table */}
                <GlowCard hover={false}>
                  <h3 className="text-lg font-bold text-foreground mb-4">All Users</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Address</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Joined</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Bets</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Volume</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr key={user.id} className="border-b border-border/50 hover:bg-secondary/30">
                            <td className="py-4 px-4 font-medium text-foreground font-mono">{user.address}</td>
                            <td className="py-4 px-4 text-muted-foreground">{user.joined}</td>
                            <td className="py-4 px-4 text-foreground">{user.bets}</td>
                            <td className="py-4 px-4 text-foreground">${user.volume.toLocaleString()}</td>
                            <td className="py-4 px-4">
                              <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(user.status)}`}>
                                {user.status.toUpperCase()}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <div className="flex gap-2 justify-end">
                                <Button size="sm" variant="ghost" className="text-primary hover:text-primary/80">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                {user.status === "flagged" && (
                                  <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive/80">
                                    <Ban className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </GlowCard>
              </motion.div>
            </TabsContent>

            {/* Payouts Tab */}
            <TabsContent value="payouts">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <StatCard title="Pending Payouts" value="$34,500" icon={Clock} color="primary" />
                  <StatCard title="Processing" value="$5,600" icon={TrendingUp} color="primary" />
                  <StatCard title="Completed Today" value="$156,000" icon={CheckCircle} color="success" />
                </div>

                {/* Payouts Table */}
                <GlowCard hover={false}>
                  <h3 className="text-lg font-bold text-foreground mb-4">Pending Payouts</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">User</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Type</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Bet</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingPayouts.map((payout) => (
                          <tr key={payout.id} className="border-b border-border/50 hover:bg-secondary/30">
                            <td className="py-4 px-4 font-medium text-foreground font-mono">{payout.user}</td>
                            <td className="py-4 px-4 text-success font-bold">${payout.amount.toLocaleString()}</td>
                            <td className="py-4 px-4 text-muted-foreground">{payout.type}</td>
                            <td className="py-4 px-4 text-foreground">{payout.bet}</td>
                            <td className="py-4 px-4">
                              <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(payout.status)}`}>
                                {payout.status.toUpperCase()}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <div className="flex gap-2 justify-end">
                                <Button size="sm" className="bg-success text-success-foreground hover:bg-success/90">
                                  <CheckCircle className="w-4 h-4 mr-1" /> Approve
                                </Button>
                                <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive/80">
                                  Reject
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </GlowCard>
              </motion.div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <GlowCard hover={false}>
                  <h3 className="text-lg font-bold text-foreground mb-4">Platform Settings</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Platform Fee (%)</label>
                      <Input
                        type="number"
                        defaultValue="5"
                        className="bg-secondary border-border text-foreground max-w-xs"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Jackpot Entry Fee ($)</label>
                      <Input
                        type="number"
                        defaultValue="2"
                        className="bg-secondary border-border text-foreground max-w-xs"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Minimum Bet Stake (SOL)</label>
                      <Input
                        type="number"
                        defaultValue="100"
                        className="bg-secondary border-border text-foreground max-w-xs"
                      />
                    </div>
                    <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                      Save Settings
                    </Button>
                  </div>
                </GlowCard>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default AdminPanel;