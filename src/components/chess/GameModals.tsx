import { Button } from "@/components/ui/Button";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

interface PromotionModalProps {
  color: "w" | "b";
  onSelect: (piece: "q" | "r" | "b" | "n") => void;
  onCancel: () => void;
}

const PIECES = [
  { piece: "q" as const, label: "Queen", symbol: "♕" },
  { piece: "r" as const, label: "Rook", symbol: "♖" },
  { piece: "b" as const, label: "Bishop", symbol: "♗" },
  { piece: "n" as const, label: "Knight", symbol: "♘" },
];

export function PromotionModal({ color, onSelect, onCancel }: PromotionModalProps) {
  const symbols = color === "w" ? PIECES : PIECES.map((p) => ({
    ...p,
    symbol: p.symbol.replace("♕", "♛").replace("♖", "♜").replace("♗", "♝").replace("♘", "♞"),
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="glass-panel rounded-xl p-6 max-w-sm w-full mx-4">
        <h3 className="font-headline-sm text-headline-sm mb-4 text-center">Promote Pawn</h3>
        <div className="grid grid-cols-4 gap-3 mb-4">
          {symbols.map(({ piece, label, symbol }) => (
            <button
              key={piece}
              onClick={() => onSelect(piece)}
              className="flex flex-col items-center gap-1 p-3 rounded-lg border border-glass-stroke hover:border-primary hover:bg-gold-muted transition-all"
            >
              <span className="text-3xl">{symbol}</span>
              <span className="font-label-mono text-[10px] text-on-surface-variant">{label}</span>
            </button>
          ))}
        </div>
        <Button variant="ghost" className="w-full" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

interface GameControlsProps {
  onResign: () => void;
  onDraw: () => void;
  onTakeback: () => void;
  onFlip: () => void;
  canTakeback: boolean;
  disabled?: boolean;
}

export function GameControls({
  onResign,
  onDraw,
  onTakeback,
  onFlip,
  canTakeback,
  disabled,
}: GameControlsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="secondary" size="sm" onClick={onFlip} disabled={disabled}>
        <MaterialIcon name="flip" className="text-base" /> Flip
      </Button>
      <Button variant="secondary" size="sm" onClick={onTakeback} disabled={disabled || !canTakeback}>
        <MaterialIcon name="undo" className="text-base" /> Takeback
      </Button>
      <Button variant="secondary" size="sm" onClick={onDraw} disabled={disabled}>
        <MaterialIcon name="handshake" className="text-base" /> Draw
      </Button>
      <Button variant="secondary" size="sm" onClick={onResign} disabled={disabled}>
        <MaterialIcon name="flag" className="text-base" /> Resign
      </Button>
    </div>
  );
}
