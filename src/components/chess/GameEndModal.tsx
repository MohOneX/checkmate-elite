import { Button } from "@/components/ui/Button";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import type { GameEndReason, GameResult } from "@/lib/chess";

interface GameEndModalProps {
  result: GameResult;
  endReason: GameEndReason;
  playerColor: "w" | "b";
  opponentName: string;
  pgn: string;
  onClose: () => void;
  onRematch: () => void;
}

function getMessage(
  result: GameResult,
  endReason: GameEndReason,
  playerColor: "w" | "b",
  opponentName: string,
): { title: string; subtitle: string; won: boolean | null } {
  const playerWon =
    (result === "white-win" && playerColor === "w") ||
    (result === "black-win" && playerColor === "b");
  const playerLost =
    (result === "white-win" && playerColor === "b") ||
    (result === "black-win" && playerColor === "w");

  if (result === "draw") {
    return { title: "Draw", subtitle: endReason ?? "Game drawn", won: null };
  }
  if (playerWon) {
    const reason =
      endReason === "checkmate"
        ? "Checkmate!"
        : endReason === "timeout"
          ? "Opponent ran out of time"
          : endReason === "resignation"
            ? `${opponentName} resigned`
            : "Victory";
    return { title: "Victory", subtitle: reason, won: true };
  }
  if (playerLost) {
    const reason =
      endReason === "checkmate"
        ? "Checkmated"
        : endReason === "timeout"
          ? "Time expired"
          : endReason === "resignation"
            ? "You resigned"
            : "Defeat";
    return { title: "Defeat", subtitle: reason, won: false };
  }
  return { title: "Game Over", subtitle: "", won: null };
}

export function GameEndModal({
  result,
  endReason,
  playerColor,
  opponentName,
  pgn,
  onClose,
  onRematch,
}: GameEndModalProps) {
  const { title, subtitle, won } = getMessage(result, endReason, playerColor, opponentName);

  const copyPgn = () => navigator.clipboard.writeText(pgn);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="glass-panel rounded-xl p-8 max-w-md w-full mx-4 text-center">
        <MaterialIcon
          name={won === true ? "emoji_events" : won === false ? "sentiment_dissatisfied" : "handshake"}
          className={`text-5xl mb-4 ${won === true ? "text-primary" : won === false ? "text-error" : "text-outline"}`}
          filled
        />
        <h2 className="font-display-lg text-3xl mb-2">{title}</h2>
        <p className="font-body-lg text-on-surface-variant mb-6">{subtitle}</p>
        <div className="flex flex-col gap-3">
          <Button onClick={onRematch}>
            <MaterialIcon name="replay" /> Rematch
          </Button>
          <Button variant="secondary" onClick={copyPgn}>
            <MaterialIcon name="content_copy" /> Copy PGN
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Back to Lobby
          </Button>
        </div>
      </div>
    </div>
  );
}
