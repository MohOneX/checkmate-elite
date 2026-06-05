import { Chess, type Color, type Square } from "chess.js";
import { create } from "zustand";
import {
  applyMove,
  getEndReason,
  getGameResult,
  needsPromotion,
  type GameEndReason,
  type GameResult,
} from "@/lib/chess";
import { generateId } from "@/lib/utils";
import { useSettingsStore } from "@/stores/settingsStore";
import type { TimeControlType } from "@/types";

export interface ActiveGameConfig {
  id: string;
  mode: "ai" | "local" | "online";
  playerColor: Color;
  opponentName: string;
  opponentElo: number;
  timeControl: TimeControlType;
  initialMs: number;
  incrementMs: number;
}

interface GameState {
  config: ActiveGameConfig | null;
  chess: Chess;
  fen: string;
  history: string[];
  lastMove: { from: Square; to: Square } | null;
  selectedSquare: Square | null;
  legalTargets: Square[];
  promotionPending: { from: Square; to: Square } | null;
  whiteTimeMs: number;
  blackTimeMs: number;
  activeColor: Color;
  clockRunning: boolean;
  result: GameResult;
  endReason: GameEndReason;
  boardFlipped: boolean;
  isAiThinking: boolean;

  startGame: (config: Omit<ActiveGameConfig, "id">) => void;
  selectSquare: (square: Square) => void;
  tryMove: (from: Square, to: Square, promotion?: "q" | "r" | "b" | "n") => boolean;
  completePromotion: (piece: "q" | "r" | "b" | "n") => void;
  cancelPromotion: () => void;
  tickClock: (deltaMs: number) => void;
  addIncrement: (color: Color) => void;
  resign: (color: Color) => void;
  offerDraw: () => void;
  takeback: () => boolean;
  flipBoard: () => void;
  setAiThinking: (thinking: boolean) => void;
  timeout: (color: Color) => void;
  reset: () => void;
  loadFen: (fen: string) => void;
  goToMove: (moveIndex: number) => void;
}

const initialChess = () => new Chess();

export const useGameStore = create<GameState>((set, get) => ({
  config: null,
  chess: initialChess(),
  fen: initialChess().fen(),
  history: [],
  lastMove: null,
  selectedSquare: null,
  legalTargets: [],
  promotionPending: null,
  whiteTimeMs: 0,
  blackTimeMs: 0,
  activeColor: "w",
  clockRunning: false,
  result: "ongoing",
  endReason: null,
  boardFlipped: false,
  isAiThinking: false,

  startGame: (config) => {
    const chess = initialChess();
    set({
      config: { ...config, id: generateId() },
      chess,
      fen: chess.fen(),
      history: [],
      lastMove: null,
      selectedSquare: null,
      legalTargets: [],
      promotionPending: null,
      whiteTimeMs: config.initialMs,
      blackTimeMs: config.initialMs,
      activeColor: "w",
      clockRunning: config.initialMs > 0,
      result: "ongoing",
      endReason: null,
      boardFlipped: config.playerColor === "b",
      isAiThinking: false,
    });
  },

  selectSquare: (square) => {
    const state = get();
    if (state.result !== "ongoing" || state.promotionPending) return;

    const { chess, config, selectedSquare } = state;
    const turn = chess.turn();

    if (config?.mode === "ai" && turn !== config.playerColor) return;

    if (selectedSquare === square) {
      set({ selectedSquare: null, legalTargets: [] });
      return;
    }

    if (selectedSquare) {
      const moved = get().tryMove(selectedSquare, square);
      if (moved) return;
    }

    const piece = chess.get(square);
    if (piece && piece.color === turn) {
      const moves = chess.moves({ square, verbose: true });
      set({
        selectedSquare: square,
        legalTargets: moves.map((m) => m.to as Square),
      });
    } else {
      set({ selectedSquare: null, legalTargets: [] });
    }
  },

  tryMove: (from, to, promotion) => {
    const state = get();
    if (state.result !== "ongoing") return false;

    const chess = new Chess(state.chess.fen());
    const mover = chess.turn();

    if (!promotion && needsPromotion(chess, from, to)) {
      set({ promotionPending: { from, to }, selectedSquare: null, legalTargets: [] });
      return false;
    }

    const move = applyMove(chess, from, to, promotion);
    if (!move) return false;

    if (useSettingsStore.getState().settings.moveSounds) {
      if (move.captured) {
        import("@/lib/sounds").then((s) => s.playCaptureSound());
      } else {
        import("@/lib/sounds").then((s) => s.playMoveSound());
      }
      if (chess.inCheck()) {
        import("@/lib/sounds").then((s) => s.playCheckSound());
      }
    }

    const inc = get().config?.incrementMs ?? 0;
    if (inc > 0) {
      if (mover === "w") set({ whiteTimeMs: get().whiteTimeMs + inc });
      else set({ blackTimeMs: get().blackTimeMs + inc });
    }

    const result = getGameResult(chess);
    const endReason = result !== "ongoing" ? getEndReason(chess) : null;

    set({
      chess,
      fen: chess.fen(),
      history: chess.history(),
      lastMove: { from, to },
      selectedSquare: null,
      legalTargets: [],
      promotionPending: null,
      activeColor: chess.turn(),
      result,
      endReason,
      clockRunning: result === "ongoing" && state.config!.initialMs > 0,
    });

    return true;
  },

  completePromotion: (piece) => {
    const pending = get().promotionPending;
    if (!pending) return;
    get().tryMove(pending.from, pending.to, piece);
  },

  cancelPromotion: () => set({ promotionPending: null }),

  tickClock: (deltaMs) => {
    const state = get();
    if (!state.clockRunning || state.result !== "ongoing") return;
    if (state.config?.initialMs === 0) return;

    if (state.activeColor === "w") {
      const whiteTimeMs = Math.max(0, state.whiteTimeMs - deltaMs);
      set({ whiteTimeMs });
      if (whiteTimeMs === 0) get().timeout("w");
    } else {
      const blackTimeMs = Math.max(0, state.blackTimeMs - deltaMs);
      set({ blackTimeMs });
      if (blackTimeMs === 0) get().timeout("b");
    }
  },

  addIncrement: (color) => {
    const state = get();
    const inc = state.config?.incrementMs ?? 0;
    if (inc <= 0) return;
    if (color === "w") set({ whiteTimeMs: state.whiteTimeMs + inc });
    else set({ blackTimeMs: state.blackTimeMs + inc });
  },

  resign: (color) => {
    set({
      result: color === "w" ? "black-win" : "white-win",
      endReason: "resignation",
      clockRunning: false,
    });
  },

  offerDraw: () => {
    if (get().config?.mode === "ai") {
      set({ result: "draw", endReason: "draw-agreement", clockRunning: false });
    }
  },

  takeback: () => {
    const state = get();
    if (state.config?.mode === "online") return false;
    const chess = new Chess(state.chess.fen());
    if (state.history.length < 2) return false;
    chess.undo();
    chess.undo();
    set({
      chess,
      fen: chess.fen(),
      history: chess.history(),
      lastMove: null,
      activeColor: chess.turn(),
      result: "ongoing",
      endReason: null,
      clockRunning: state.config!.initialMs > 0,
    });
    return true;
  },

  flipBoard: () => set((s) => ({ boardFlipped: !s.boardFlipped })),

  setAiThinking: (thinking) => set({ isAiThinking: thinking }),

  timeout: (color) => {
    set({
      result: color === "w" ? "black-win" : "white-win",
      endReason: "timeout",
      clockRunning: false,
    });
  },

  reset: () =>
    set({
      config: null,
      chess: initialChess(),
      fen: initialChess().fen(),
      history: [],
      lastMove: null,
      selectedSquare: null,
      legalTargets: [],
      promotionPending: null,
      whiteTimeMs: 0,
      blackTimeMs: 0,
      activeColor: "w",
      clockRunning: false,
      result: "ongoing",
      endReason: null,
      boardFlipped: false,
      isAiThinking: false,
    }),

  loadFen: (fen) => {
    const chess = new Chess(fen);
    set({
      chess,
      fen: chess.fen(),
      history: chess.history(),
      lastMove: null,
      selectedSquare: null,
      legalTargets: [],
      result: getGameResult(chess),
      endReason: getEndReason(chess),
      activeColor: chess.turn(),
      clockRunning: false,
    });
  },

  goToMove: (moveIndex) => {
    const state = get();
    const chess = initialChess();
    for (let i = 0; i < moveIndex && i < state.history.length; i++) {
      chess.move(state.history[i]);
    }
    set({
      chess,
      fen: chess.fen(),
      selectedSquare: null,
      legalTargets: [],
      activeColor: chess.turn(),
    });
  },
}));
