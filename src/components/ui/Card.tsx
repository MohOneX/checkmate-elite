import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function Card({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "glass-panel rounded-xl border-t border-white/10",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
