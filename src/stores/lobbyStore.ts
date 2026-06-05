import { create } from "zustand";
import type { TimeControl } from "@/lib/constants";
import { TIME_CONTROLS, AI_PERSONALITIES } from "@/lib/constants";

export type GameMode = "ai" | "local" | "online";

interface LobbyState {
  selectedAiId: string;
  targetElo: number;
  timeControl: TimeControl;
  mode: GameMode;
  setSelectedAi: (id: string) => void;
  setTargetElo: (elo: number) => void;
  setTimeControl: (tc: TimeControl) => void;
  setMode: (mode: GameMode) => void;
  getOpponentName: () => string;
}

export const useLobbyStore = create<LobbyState>((set, get) => ({
  selectedAiId: "grandmaster-ai",
  targetElo: 2800,
  timeControl: TIME_CONTROLS[4],
  mode: "ai",
  setSelectedAi: (id) => {
    const ai = AI_PERSONALITIES.find((p) => p.id === id);
    set({ selectedAiId: id, targetElo: ai?.elo ?? 1800 });
  },
  setTargetElo: (elo) => set({ targetElo: elo }),
  setTimeControl: (tc) => set({ timeControl: tc }),
  setMode: (mode) => set({ mode }),
  getOpponentName: () => {
    const { mode, selectedAiId } = get();
    if (mode === "local") return "Local Opponent";
    if (mode === "online") return "Online Opponent";
    return AI_PERSONALITIES.find((p) => p.id === selectedAiId)?.name ?? "AI";
  },
}));
