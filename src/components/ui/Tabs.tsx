import { cn } from "@/lib/utils";

interface TabsProps<T extends string> {
  tabs: { id: T; label: string }[];
  active: T;
  onChange: (id: T) => void;
  className?: string;
}

export function Tabs<T extends string>({ tabs, active, onChange, className }: TabsProps<T>) {
  return (
    <div className={cn("flex gap-2 border-b border-glass-stroke", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "font-label-mono text-label-mono px-4 py-3 transition-colors border-b-2 -mb-px",
            active === tab.id
              ? "text-primary border-primary"
              : "text-on-surface-variant border-transparent hover:text-on-surface",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
