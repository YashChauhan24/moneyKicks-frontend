import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Target,
  Users,
  Clock,
  TrendingUp,
  Filter,
  Search,
  ArrowRight,
  Plus,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Layout from "@/components/layout/Layout";
import GlowCard from "@/components/ui/GlowCard";
import StatCard from "@/components/ui/StatCard";
import { getBets } from "@/queries/BetApis";

interface Bet {
  id: string;
  title: string;
  competitorA: string;
  competitorB: string;
  totalStake: number;
  predictorCount: number;
  poolA: number;
  poolB: number;
  status: "pending" | "live" | "closed" | "settled";
  endsAt: string;
}

const BettingList = () => {
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "live" | "pending" | "settled">(
    "all",
  );

  useEffect(() => {
    const fetchBets = async () => {
      try {
        setLoading(true);

        const res = await getBets({
          status: filter as "pending" | "live" | "closed" | "settled",
          search: searchQuery || undefined,
          limit: 20,
          offset: 0,
        });

        const mappedBets: Bet[] = res.data.map((item) => ({
          id: item.id,
          title: item.title,
          competitorA: item.competitorAName,
          competitorB: item.competitorBName,
          totalStake: Number(item.stakeAmount),
          predictorCount: item.stats?.predictorCount ?? 0,
          poolA: Number(item.stats?.totalOnA ?? 0),
          poolB: Number(item.stats?.totalOnB ?? 0),
          status: item.status, // API returns PENDING
          endsAt: item.endAt?.split("T")[0],
        }));

        console.log(mappedBets);
        setBets(mappedBets);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchBets();
  }, [filter, searchQuery]);

  const filteredBets = bets.filter((bet) => {
    const matchesSearch =
      bet.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bet.competitorA.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bet.competitorB.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === "all" || bet.status === filter;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: Bet["status"]) => {
    switch (status) {
      case "live":
        return "bg-success/20 text-success";
      case "pending":
        return "bg-primary/20 text-primary";
      case "closed":
        return "bg-destructive/20 text-destructive";
      case "settled":
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Layout>
      <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <Link
                to="/"
                className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
              <h1 className="text-4xl font-bold text-foreground">
                <span className="text-primary">Active</span> Bets
              </h1>
              <p className="text-muted-foreground mt-2">
                Browse and predict outcomes on competitor stakes
              </p>
            </div>
            <Link to="/betting/create">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
                <Plus className="w-5 h-5 mr-2" />
                Create New Bet
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="Total Active Bets"
              value="156"
              icon={Target}
              color="primary"
            />
            <StatCard
              title="Total Prediction Pool"
              value="$2.4M"
              icon={TrendingUp}
              color="primary"
            />
            <StatCard
              title="Active Predictors"
              value="12,456"
              icon={Users}
              color="success"
            />
          </div>

          {/* Search & Filters */}
          <GlowCard className="mb-8" hover={false}>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search bets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div className="flex gap-2">
                {(["all", "live", "pending", "settled"] as const).map(
                  (status) => (
                    <Button
                      key={status}
                      variant={filter === status ? "default" : "outline"}
                      size="sm"
                      onClick={() =>
                        setFilter(
                          status as "all" | "live" | "pending" | "settled",
                        )
                      }
                      className={
                        filter === status
                          ? "bg-primary text-primary-foreground"
                          : "border-border text-muted-foreground hover:bg-secondary"
                      }
                    >
                      <Filter className="w-4 h-4 mr-1" />
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Button>
                  ),
                )}
              </div>
            </div>
          </GlowCard>

          {/* Bet Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredBets.map((bet, index) => (
              <motion.div
                key={bet.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GlowCard className="h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span
                        className={`px-3 py-1 rounded-lg text-xs font-medium ${getStatusColor(bet.status)}`}
                      >
                        {bet.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {bet.endsAt}
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-foreground mb-4">
                    {bet.title}
                  </h3>

                  {/* Competitors */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-secondary/50 rounded-lg p-4 text-center border border-primary/20">
                      <p className="text-sm text-muted-foreground mb-1">
                        Competitor A
                      </p>
                      <p className="font-semibold text-foreground mb-2">
                        {bet.competitorA}
                      </p>
                      <p className="text-lg font-bold text-primary">
                        ${bet.poolA.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        prediction pool
                      </p>
                    </div>
                    <div className="bg-secondary/50 rounded-lg p-4 text-center border border-primary/20">
                      <p className="text-sm text-muted-foreground mb-1">
                        Competitor B
                      </p>
                      <p className="font-semibold text-foreground mb-2">
                        {bet.competitorB}
                      </p>
                      <p className="text-lg font-bold text-primary">
                        ${bet.poolB.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        prediction pool
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-6">
                    <span>Stake: ${bet.totalStake.toLocaleString()}</span>
                    <span>{bet.predictorCount} predictors</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Link to={`/betting/${bet.id}`} className="flex-1">
                      <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                        Make Prediction
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      className="border-border text-muted-foreground hover:bg-secondary"
                    >
                      Details
                    </Button>
                  </div>
                </GlowCard>
              </motion.div>
            ))}
          </div>

          {filteredBets.length === 0 && (
            <GlowCard className="text-center py-16" hover={false}>
              <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">
                No bets found
              </h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search or filters
              </p>
              <Link to="/betting/create">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Plus className="w-5 h-5 mr-2" />
                  Create the first bet
                </Button>
              </Link>
            </GlowCard>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default BettingList;
