import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    positive: boolean;
  };
  color?: "primary" | "success";
  className?: string;
}

const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  color = "primary",
  className,
}: StatCardProps) => {
  const colorClasses = {
    primary: {
      icon: "text-primary border-primary/35 bg-primary/10",
      glow: "from-primary/20 via-primary/5 to-transparent",
      line: "via-primary/60",
    },
    success: {
      icon: "text-success border-success/35 bg-success/10",
      glow: "from-success/20 via-success/5 to-transparent",
      line: "via-success/60",
    },
  };

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/85 bg-card/80 p-6 shadow-[0_20px_50px_-36px_hsl(var(--foreground)/0.65)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/45 hover:shadow-[0_28px_70px_-42px_hsl(var(--primary)/0.8)]",
        className,
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-70 transition-opacity duration-300 group-hover:opacity-100",
          colorClasses[color].glow,
        )}
      />
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent",
          colorClasses[color].line,
        )}
      />

      <div className="relative z-10 flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">{value}</p>
          {trend && (
            <p
              className={`mt-3 inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
                trend.positive
                  ? "border-success/35 bg-success/15 text-success"
                  : "border-destructive/35 bg-destructive/15 text-destructive"
              }`}
            >
              {trend.positive ? "+" : ""}
              {trend.value}
            </p>
          )}
        </div>

        <div
          className={cn(
            "rounded-xl border p-3.5 shadow-[inset_0_1px_0_hsl(var(--background)/0.4)]",
            colorClasses[color].icon,
          )}
        >
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
