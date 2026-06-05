import { formatClock } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/stores/settingsStore";

interface ChessClockProps {
  timeMs: number;
  isActive: boolean;
  label: string;
  elo?: number;
}

export function ChessClock({ timeMs, isActive, label, elo }: ChessClockProps) {
  const lowTime = useSettingsStore((s) => s.settings.lowTimeWarningMs);
  const isLow = timeMs > 0 && timeMs <= lowTime;

  return (
    <div
      className={cn(
        "glass-panel rounded-lg px-4 py-3 flex justify-between items-center transition-colors",
        isActive && "border-primary/40 shadow-[0_0_12px_rgba(242,202,80,0.15)]",
        isLow && isActive && "border-error/50 animate-pulse",
      )}
    >
      <div>
        <p className="font-body-md text-on-surface">{label}</p>
        {elo !== undefined && (
          <p className="font-label-mono text-[10px] text-on-surface-variant">{elo} ELO</p>
        )}
      </div>
      <span
        className={cn(
          "font-label-mono text-2xl tabular-nums",
          isActive ? "text-primary" : "text-on-surface-variant",
          isLow && "text-error",
        )}
      >
        {timeMs === 0 && !isActive ? "∞" : formatClock(timeMs)}
      </span>
    </div>
  );
}
