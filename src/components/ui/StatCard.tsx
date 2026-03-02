import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    positive: boolean;
  };
  color?: "primary" | "success";
}

const StatCard = ({ title, value, icon: Icon, trend, color = "primary" }: StatCardProps) => {
  const colorClasses = {
    primary: "text-primary border-primary/30 bg-primary/5",
    success: "text-success border-success/30 bg-success/5",
  };

  return (
    <div className="rounded-lg bg-card border border-border p-6 hover:border-primary/50 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-3xl font-bold text-foreground mt-2">{value}</p>
          {trend && (
            <p className={`text-sm mt-2 ${trend.positive ? "text-success" : "text-destructive"}`}>
              {trend.positive ? "+" : ""}{trend.value}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg border ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
