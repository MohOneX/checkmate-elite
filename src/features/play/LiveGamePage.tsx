import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { Square } from "chess.js";
import { ChessBoardView } from "@/components/chess/ChessBoardView";
import { ChessClock } from "@/components/chess/ChessClock";
import { MoveList } from "@/components/chess/MoveList";
import { GameControls } from "@/components/chess/GameModals";
import { PromotionModal } from "@/components/chess/GameModals";
import { GameEndModal } from "@/components/chess/GameEndModal";
import { useAiPlayer, useGameClock, useGamePersistence } from "@/components/chess/gameHooks";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { useGameStore } from "@/stores/gameStore";
import { useProfileStore } from "@/stores/profileStore";

export function LiveGamePage() {
  const navigate = useNavigate();
  const config = useGameStore((s) => s.config);
  const fen = useGameStore((s) => s.fen);
  const history = useGameStore((s) => s.history);
  const lastMove = useGameStore((s) => s.lastMove);
  const selectedSquare = useGameStore((s) => s.selectedSquare);
  const legalTargets = useGameStore((s) => s.legalTargets);
  const promotionPending = useGameStore((s) => s.promotionPending);
  const whiteTimeMs = useGameStore((s) => s.whiteTimeMs);
  const blackTimeMs = useGameStore((s) => s.blackTimeMs);
  const activeColor = useGameStore((s) => s.activeColor);
  const result = useGameStore((s) => s.result);
  const endReason = useGameStore((s) => s.endReason);
  const boardFlipped = useGameStore((s) => s.boardFlipped);
  const isAiThinking = useGameStore((s) => s.isAiThinking);
  const chess = useGameStore((s) => s.chess);
  const selectSquare = useGameStore((s) => s.selectSquare);
  const tryMove = useGameStore((s) => s.tryMove);
  const completePromotion = useGameStore((s) => s.completePromotion);
  const cancelPromotion = useGameStore((s) => s.cancelPromotion);
  const resign = useGameStore((s) => s.resign);
  const offerDraw = useGameStore((s) => s.offerDraw);
  const takeback = useGameStore((s) => s.takeback);
  const flipBoard = useGameStore((s) => s.flipBoard);
  const reset = useGameStore((s) => s.reset);
  const startGame = useGameStore((s) => s.startGame);

  const profile = useProfileStore((s) => s.profile);

  useGameClock();
  useAiPlayer();
  useGamePersistence();

  useEffect(() => {
    if (!config) navigate("/play", { replace: true });
  }, [config, navigate]);

  const orientation = boardFlipped ? "black" : "white";

  const handleDrop = useCallback(
    (from: Square, to: Square) => {
      if (!config || result !== "ongoing") return false;
      if (config.mode === "ai" && chess.turn() !== config.playerColor) return false;
      const moved = tryMove(from, to);
      return moved;
    },
    [config, result, chess, tryMove],
  );

  const handleRematch = () => {
    if (!config) return;
    startGame({
      mode: config.mode,
      playerColor: config.playerColor,
      opponentName: config.opponentName,
      opponentElo: config.opponentElo,
      timeControl: config.timeControl,
      initialMs: config.initialMs,
      incrementMs: config.incrementMs,
    });
  };

  if (!config) return null;

  const playerIsWhite = config.playerColor === "w";

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden p-4 md:p-6 gap-6">
      <div className="flex-1 flex flex-col items-center justify-center gap-4 min-w-0">
        <ChessClock
          timeMs={playerIsWhite ? blackTimeMs : whiteTimeMs}
          isActive={activeColor === (playerIsWhite ? "b" : "w") && result === "ongoing"}
          label={config.opponentName}
          elo={config.opponentElo}
        />

        <div className="relative w-full max-w-[520px] aspect-square">
          <ChessBoardView
            fen={fen}
            orientation={orientation}
            lastMove={lastMove}
            legalTargets={legalTargets}
            selectedSquare={selectedSquare}
            onSquareClick={selectSquare}
            onPieceDrop={handleDrop}
            allowMoves={result === "ongoing" && !isAiThinking}
          />
          {isAiThinking && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-xl">
              <MaterialIcon name="psychology" className="text-4xl text-primary animate-pulse" />
            </div>
          )}
        </div>

        <ChessClock
          timeMs={playerIsWhite ? whiteTimeMs : blackTimeMs}
          isActive={activeColor === config.playerColor && result === "ongoing"}
          label={profile.username}
          elo={profile.ratings[config.timeControl]}
        />
      </div>

      <aside className="w-full lg:w-80 flex flex-col gap-4 shrink-0">
        <GameControls
          onResign={() => resign(config.playerColor)}
          onDraw={offerDraw}
          onTakeback={() => takeback()}
          onFlip={flipBoard}
          canTakeback={config.mode !== "online" && history.length >= 2}
          disabled={result !== "ongoing"}
        />
        <div className="flex-1 min-h-[200px]">
          <MoveList history={history} />
        </div>
      </aside>

      {promotionPending && (
        <PromotionModal
          color={config.playerColor}
          onSelect={completePromotion}
          onCancel={cancelPromotion}
        />
      )}

      {result !== "ongoing" && (
        <GameEndModal
          result={result}
          endReason={endReason}
          playerColor={config.playerColor}
          opponentName={config.opponentName}
          pgn={chess.pgn()}
          onClose={() => {
            reset();
            navigate("/play");
          }}
          onRematch={handleRematch}
        />
      )}
    </div>
  );
}
