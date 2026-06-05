import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "gold" | "default" | "success";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "font-label-mono text-[10px] px-2 py-0.5 rounded uppercase tracking-wider",
        variant === "gold" && "bg-primary text-on-primary font-bold",
        variant === "default" && "bg-surface-variant text-on-surface border border-glass-stroke",
        variant === "success" && "bg-tertiary/20 text-tertiary border border-tertiary/30",
        className,
      )}
    >
      {children}
    </span>
  );
}
