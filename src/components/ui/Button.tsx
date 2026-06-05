import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-headline-sm transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none",
        variant === "primary" &&
          "bg-gradient-to-br from-primary to-primary-container text-on-primary shadow-lg hover:shadow-primary/20",
        variant === "secondary" &&
          "bg-transparent border border-glass-stroke text-on-surface hover:bg-surface-variant",
        variant === "ghost" && "text-on-surface-variant hover:text-primary hover:bg-surface-variant/50",
        size === "sm" && "px-3 py-1.5 text-sm",
        size === "md" && "px-4 py-2.5",
        size === "lg" && "px-6 py-4 text-lg",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
