import { create } from "zustand";
import type { SavedGame, UserProfile } from "@/types";
import { getTitleForElo } from "@/lib/elo";
import { ACHIEVEMENTS } from "@/data/content";
import {
  DEFAULT_PROFILE,
  loadGames,
  loadProfile,
  saveGame,
  saveProfile,
} from "@/services/persistence";

interface ProfileState {
  profile: UserProfile;
  games: SavedGame[];
  loaded: boolean;
  puzzlesSolved: number;
  load: () => Promise<void>;
  updateProfile: (partial: Partial<UserProfile>) => Promise<void>;
  recordGame: (game: SavedGame) => Promise<void>;
  unlockAchievement: (id: string) => Promise<void>;
  incrementPuzzlesSolved: () => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: DEFAULT_PROFILE,
  games: [],
  loaded: false,
  puzzlesSolved: 0,
  load: async () => {
    const [profile, games] = await Promise.all([loadProfile(), loadGames()]);
    set({ profile, games, loaded: true });
  },
  updateProfile: async (partial) => {
    const profile = { ...get().profile, ...partial };
    await saveProfile(profile);
    set({ profile });
  },
  recordGame: async (game) => {
    await saveGame(game);
    const games = await loadGames();
    const profile = { ...get().profile };
    const tc = game.timeControl;
    profile.ratings[tc] = Math.max(800, profile.ratings[tc] + game.ratingChange);

    if (game.result === "1-0" && game.playerColor === "w") profile.wins++;
    else if (game.result === "0-1" && game.playerColor === "b") profile.wins++;
    else if (game.result === "0-1" && game.playerColor === "w") profile.losses++;
    else if (game.result === "1-0" && game.playerColor === "b") profile.losses++;
    else profile.draws++;

    if (game.result === "1-0" && game.playerColor === "w") {
      profile.streak++;
      profile.bestStreak = Math.max(profile.bestStreak, profile.streak);
    } else if (game.result === "0-1" && game.playerColor === "b") {
      profile.streak++;
      profile.bestStreak = Math.max(profile.bestStreak, profile.streak);
    } else {
      profile.streak = 0;
    }

    profile.title = getTitleForElo(profile.ratings.blitz);
    await saveProfile(profile);
    set({ profile, games });

    const totalGames = profile.wins + profile.losses + profile.draws;
    if (profile.wins === 1) await get().unlockAchievement("first-win");
    if (profile.streak >= 5) await get().unlockAchievement("streak-5");
    if (profile.streak >= 10) await get().unlockAchievement("streak-10");
    if (totalGames >= 100) await get().unlockAchievement("century");
    if (game.opponentElo >= 2800 && (game.result === "1-0" || game.result === "0-1")) {
      const won =
        (game.result === "1-0" && game.playerColor === "w") ||
        (game.result === "0-1" && game.playerColor === "b");
      if (won) await get().unlockAchievement("gm-slayer");
    }
    if (game.result === "1/2-1/2" && game.opponentElo >= 2000) {
      await get().unlockAchievement("iron-defense");
    }
  },
  unlockAchievement: async (id) => {
    const profile = { ...get().profile };
    if (profile.achievements.includes(id)) return;
    if (!ACHIEVEMENTS.find((a) => a.id === id)) return;
    profile.achievements = [...profile.achievements, id];
    await saveProfile(profile);
    set({ profile });
  },
  incrementPuzzlesSolved: async () => {
    const puzzlesSolved = get().puzzlesSolved + 1;
    set({ puzzlesSolved });
    if (puzzlesSolved >= 10) await get().unlockAchievement("puzzle-master");
  },
}));
