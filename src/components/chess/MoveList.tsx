import { formatMovePairs } from "@/lib/chess";
import { cn } from "@/lib/utils";

interface MoveListProps {
  history: string[];
  currentMoveIndex?: number;
  onMoveClick?: (index: number) => void;
}

export function MoveList({ history, currentMoveIndex, onMoveClick }: MoveListProps) {
  const pairs = formatMovePairs(history);

  return (
    <div className="flex flex-col h-full">
      <div className="font-label-mono text-outline uppercase tracking-widest mb-3 px-1">Moves</div>
      <div className="flex-1 overflow-y-auto rounded-lg border border-glass-stroke bg-surface-container/30">
        {pairs.length === 0 ? (
          <p className="text-on-surface-variant text-sm p-4 text-center">No moves yet</p>
        ) : (
          pairs.map((pair, idx) => {
            const whiteIdx = idx * 2;
            const blackIdx = idx * 2 + 1;
            return (
              <div
                key={pair.num}
                className="grid grid-cols-[2rem_1fr_1fr] gap-1 px-2 py-1 border-b border-glass-stroke/50 font-label-mono text-sm"
              >
                <span className="text-on-surface-variant">{pair.num}.</span>
                <button
                  onClick={() => onMoveClick?.(whiteIdx + 1)}
                  className={cn(
                    "text-left px-2 py-0.5 rounded hover:bg-surface-variant/50",
                    currentMoveIndex === whiteIdx + 1 && "bg-surface-container-high border-l-2 border-primary",
                  )}
                >
                  {pair.white}
                </button>
                <button
                  onClick={() => pair.black && onMoveClick?.(blackIdx + 1)}
                  className={cn(
                    "text-left px-2 py-0.5 rounded hover:bg-surface-variant/50",
                    currentMoveIndex === blackIdx + 1 && "bg-surface-container-high border-l-2 border-primary",
                    !pair.black && "invisible",
                  )}
                >
                  {pair.black}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
