import { Chessboard } from "react-chessboard";
import type { Square } from "chess.js";
import { BOARD_THEMES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/stores/settingsStore";

interface ChessBoardViewProps {
  fen: string;
  orientation: "white" | "black";
  lastMove?: { from: Square; to: Square } | null;
  legalTargets?: Square[];
  selectedSquare?: Square | null;
  onSquareClick?: (square: Square) => void;
  onPieceDrop?: (source: Square, target: Square) => boolean;
  allowMoves?: boolean;
}

export function ChessBoardView({
  fen,
  orientation,
  lastMove,
  legalTargets = [],
  selectedSquare,
  onSquareClick,
  onPieceDrop,
  allowMoves = true,
}: ChessBoardViewProps) {
  const theme = useSettingsStore((s) => s.settings.boardTheme);
  const showLegal = useSettingsStore((s) => s.settings.showLegalMoves);
  const colors = BOARD_THEMES[theme];

  const squareStyles: Record<string, React.CSSProperties> = {};

  if (lastMove) {
    squareStyles[lastMove.from] = { backgroundColor: "rgba(242, 202, 80, 0.2)" };
    squareStyles[lastMove.to] = { backgroundColor: "rgba(242, 202, 80, 0.35)" };
  }

  if (selectedSquare) {
    squareStyles[selectedSquare] = {
      backgroundColor: "rgba(242, 202, 80, 0.25)",
      boxShadow: "inset 0 0 0 2px rgba(242, 202, 80, 0.6)",
    };
  }

  if (showLegal) {
    for (const sq of legalTargets) {
      squareStyles[sq] = {
        ...squareStyles[sq],
        backgroundImage:
          "radial-gradient(circle, rgba(129, 182, 76, 0.8) 18%, transparent 20%)",
        backgroundSize: "100% 100%",
      };
    }
  }

  return (
    <div className={cn("rounded-xl overflow-hidden border border-glass-stroke shadow-2xl")}>
      <Chessboard
        options={{
          position: fen,
          boardOrientation: orientation,
          allowDragging: allowMoves,
          showAnimations: true,
          animationDurationInMs: 150,
          lightSquareStyle: { backgroundColor: colors.light },
          darkSquareStyle: { backgroundColor: colors.dark },
          squareStyles,
          onSquareClick: ({ square }) => onSquareClick?.(square as Square),
          onPieceDrop: ({ sourceSquare, targetSquare }) =>
            onPieceDrop?.(sourceSquare as Square, targetSquare as Square) ?? false,
          boardStyle: { borderRadius: "0.75rem" },
        }}
      />
    </div>
  );
}
