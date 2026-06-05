import { Chess, type Color, type Move, type Square } from "chess.js";

export type GameResult =
  | "white-win"
  | "black-win"
  | "draw"
  | "ongoing"
  | "aborted";

export type GameEndReason =
  | "checkmate"
  | "stalemate"
  | "timeout"
  | "resignation"
  | "draw-agreement"
  | "repetition"
  | "insufficient-material"
  | "fifty-move"
  | null;

export function createGame(fen?: string): Chess {
  return new Chess(fen);
}

export function getLegalMoves(chess: Chess, square?: Square) {
  return square ? chess.moves({ square, verbose: true }) : chess.moves({ verbose: true });
}

export function applyMove(
  chess: Chess,
  from: Square,
  to: Square,
  promotion?: "q" | "r" | "b" | "n",
): Move | null {
  try {
    return chess.move({ from, to, promotion: promotion ?? "q" });
  } catch {
    return null;
  }
}

export function needsPromotion(chess: Chess, from: Square, to: Square): boolean {
  const piece = chess.get(from);
  if (!piece || piece.type !== "p") return false;
  const rank = to[1];
  return (piece.color === "w" && rank === "8") || (piece.color === "b" && rank === "1");
}

export function getGameResult(chess: Chess): GameResult {
  if (chess.isCheckmate()) {
    return chess.turn() === "w" ? "black-win" : "white-win";
  }
  if (chess.isDraw() || chess.isStalemate()) return "draw";
  return "ongoing";
}

export function getEndReason(chess: Chess): GameEndReason {
  if (chess.isCheckmate()) return "checkmate";
  if (chess.isStalemate()) return "stalemate";
  if (chess.isThreefoldRepetition()) return "repetition";
  if (chess.isInsufficientMaterial()) return "insufficient-material";
  if (chess.isDraw()) return "fifty-move";
  return null;
}

export function formatMovePairs(history: string[]): { num: number; white: string; black?: string }[] {
  const pairs: { num: number; white: string; black?: string }[] = [];
  for (let i = 0; i < history.length; i += 2) {
    pairs.push({
      num: Math.floor(i / 2) + 1,
      white: history[i],
      black: history[i + 1],
    });
  }
  return pairs;
}

export function opponentColor(color: Color): Color {
  return color === "w" ? "b" : "w";
}

export function uciFromMove(from: string, to: string, promotion?: string): string {
  return `${from}${to}${promotion ?? ""}`;
}
