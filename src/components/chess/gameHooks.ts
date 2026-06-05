import { Chess, type Square } from "chess.js";
import { useEffect, useRef } from "react";
import { stockfishEngine } from "@/engine/stockfishEngine";
import { calculateEloChange } from "@/lib/elo";
import { useGameStore } from "@/stores/gameStore";
import { useProfileStore } from "@/stores/profileStore";

function pickFallbackMove(fen: string): string {
  const chess = new Chess(fen);
  const moves = chess.moves({ verbose: true });
  if (moves.length === 0) return "";
  const pick = moves[Math.floor(Math.random() * moves.length)];
  return pick.promotion ? `${pick.from}${pick.to}${pick.promotion}` : `${pick.from}${pick.to}`;
}

function applyUciMove(uci: string, tryMove: (from: Square, to: Square, promotion?: "q" | "r" | "b" | "n") => boolean) {
  if (!uci || uci.length < 4) return false;
  const from = uci.slice(0, 2) as Square;
  const to = uci.slice(2, 4) as Square;
  const promo = uci.length > 4 ? (uci[4] as "q" | "r" | "b" | "n") : undefined;
  return tryMove(from, to, promo);
}

export function useGameClock() {
  const tickClock = useGameStore((s) => s.tickClock);
  const clockRunning = useGameStore((s) => s.clockRunning);
  const lastTick = useRef(performance.now());

  useEffect(() => {
    if (!clockRunning) return;
    let frame: number;
    const loop = (now: number) => {
      const delta = now - lastTick.current;
      if (delta >= 100) {
        tickClock(delta);
        lastTick.current = now;
      }
      frame = requestAnimationFrame(loop);
    };
    lastTick.current = performance.now();
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [clockRunning, tickClock]);
}

export function useAiPlayer() {
  const config = useGameStore((s) => s.config);
  const fen = useGameStore((s) => s.fen);
  const activeColor = useGameStore((s) => s.activeColor);
  const result = useGameStore((s) => s.result);
  const tryMove = useGameStore((s) => s.tryMove);
  const setAiThinking = useGameStore((s) => s.setAiThinking);
  const requestId = useRef(0);

  useEffect(() => {
    if (!config || config.mode !== "ai" || result !== "ongoing") return;
    if (activeColor === config.playerColor) return;

    const id = ++requestId.current;
    setAiThinking(true);

    stockfishEngine
      .waitForBestMove(fen, config.opponentElo)
      .catch(() => pickFallbackMove(fen))
      .then((uci) => {
        if (requestId.current !== id) return;
        applyUciMove(uci, tryMove);
      })
      .finally(() => {
        if (requestId.current === id) setAiThinking(false);
      });

    return () => {
      requestId.current++;
      stockfishEngine.stop();
      setAiThinking(false);
    };
  }, [fen, activeColor, config, result, tryMove, setAiThinking]);
}

export function useGamePersistence() {
  const config = useGameStore((s) => s.config);
  const result = useGameStore((s) => s.result);
  const chess = useGameStore((s) => s.chess);
  const recordGame = useProfileStore((s) => s.recordGame);
  const savedRef = useRef(false);

  useEffect(() => {
    if (!config || result === "ongoing" || savedRef.current) return;
    savedRef.current = true;

    const playerWon =
      (result === "white-win" && config.playerColor === "w") ||
      (result === "black-win" && config.playerColor === "b");
    const draw = result === "draw";
    const score = playerWon ? 1 : draw ? 0.5 : 0;
    const profile = useProfileStore.getState().profile;
    const ratingChange = calculateEloChange(
      profile.ratings[config.timeControl],
      config.opponentElo,
      score as 0 | 0.5 | 1,
    );

    let pgnResult: "1-0" | "0-1" | "1/2-1/2" = "1/2-1/2";
    if (result === "white-win") pgnResult = "1-0";
    else if (result === "black-win") pgnResult = "0-1";

    recordGame({
      id: config.id,
      pgn: chess.pgn(),
      white: config.playerColor === "w" ? profile.username : config.opponentName,
      black: config.playerColor === "b" ? profile.username : config.opponentName,
      result: pgnResult,
      timeControl: config.timeControl,
      playerColor: config.playerColor,
      opponentElo: config.opponentElo,
      ratingChange,
      playedAt: new Date().toISOString(),
    });
  }, [config, result, chess, recordGame]);
}
