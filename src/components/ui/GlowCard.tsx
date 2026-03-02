import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

const GlowCard = ({ children, className, hover = false }: GlowCardProps) => {
  return (
    <div
      className={cn(
        "relative rounded-lg bg-card border border-border p-6 transition-colors duration-200",
        hover && "hover:border-primary/50",
        className
      )}
    >
      {children}
    </div>
  );
};

export default GlowCard;
