import { Store } from "@tauri-apps/plugin-store";
import type { AppSettings, SavedGame, UserProfile } from "@/types";

const STORE_PATH = "checkmate-elite.json";
const LS_KEY = "checkmate-elite-data";

let store: Store | null = null;
let useLocalStorage = false;

async function getStore(): Promise<Store | null> {
  if (useLocalStorage) return null;
  try {
    if (!store) {
      store = await Store.load(STORE_PATH);
    }
    return store;
  } catch {
    useLocalStorage = true;
    return null;
  }
}

function lsGet<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as Record<string, unknown>;
    return (data[key] as T) ?? null;
  } catch {
    return null;
  }
}

function lsSet(key: string, value: unknown): void {
  const raw = localStorage.getItem(LS_KEY);
  const data = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
  data[key] = value;
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}

export const DEFAULT_PROFILE: UserProfile = {
  id: "local-user",
  username: "Grandmaster",
  avatarUrl: null,
  title: null,
  ratings: { bullet: 1200, blitz: 1450, rapid: 1500, unlimited: 1500 },
  wins: 0,
  losses: 0,
  draws: 0,
  streak: 0,
  bestStreak: 0,
  achievements: [],
  createdAt: new Date().toISOString(),
};

export const DEFAULT_SETTINGS: AppSettings = {
  boardTheme: "classic",
  showLegalMoves: true,
  confirmMoves: false,
  autoQueenPromotion: true,
  moveSounds: true,
  defaultIncrement: 0,
  lowTimeWarningMs: 10_000,
  defaultAiElo: 1800,
  analysisDepth: 10,
  language: "en",
};

export async function loadProfile(): Promise<UserProfile> {
  const s = await getStore();
  if (s) {
    const profile = await s.get<UserProfile>("profile");
    return profile ?? { ...DEFAULT_PROFILE };
  }
  return lsGet<UserProfile>("profile") ?? { ...DEFAULT_PROFILE };
}

export async function saveProfile(profile: UserProfile): Promise<void> {
  const s = await getStore();
  if (s) {
    await s.set("profile", profile);
    await s.save();
  } else {
    lsSet("profile", profile);
  }
}

export async function loadSettings(): Promise<AppSettings> {
  const s = await getStore();
  if (s) {
    const settings = await s.get<AppSettings>("settings");
    return settings ? { ...DEFAULT_SETTINGS, ...settings } : { ...DEFAULT_SETTINGS };
  }
  const settings = lsGet<AppSettings>("settings");
  return settings ? { ...DEFAULT_SETTINGS, ...settings } : { ...DEFAULT_SETTINGS };
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  const s = await getStore();
  if (s) {
    await s.set("settings", settings);
    await s.save();
  } else {
    lsSet("settings", settings);
  }
}

export async function loadGames(): Promise<SavedGame[]> {
  const s = await getStore();
  if (s) {
    const games = await s.get<SavedGame[]>("games");
    return games ?? [];
  }
  return lsGet<SavedGame[]>("games") ?? [];
}

export async function saveGame(game: SavedGame): Promise<void> {
  const games = await loadGames();
  games.unshift(game);
  const trimmed = games.slice(0, 200);
  const s = await getStore();
  if (s) {
    await s.set("games", trimmed);
    await s.save();
  } else {
    lsSet("games", trimmed);
  }
}

export async function exportData(): Promise<string> {
  const [profile, settings, games] = await Promise.all([
    loadProfile(),
    loadSettings(),
    loadGames(),
  ]);
  return JSON.stringify({ profile, settings, games }, null, 2);
}

export async function importData(json: string): Promise<void> {
  const data = JSON.parse(json) as {
    profile?: UserProfile;
    settings?: AppSettings;
    games?: SavedGame[];
  };
  const s = await getStore();
  if (s) {
    if (data.profile) await s.set("profile", data.profile);
    if (data.settings) await s.set("settings", data.settings);
    if (data.games) await s.set("games", data.games);
    await s.save();
  } else {
    if (data.profile) lsSet("profile", data.profile);
    if (data.settings) lsSet("settings", data.settings);
    if (data.games) lsSet("games", data.games);
  }
}

export function createDefaultProfile(): UserProfile {
  return {
    ...DEFAULT_PROFILE,
    createdAt: new Date().toISOString(),
  };
}

export async function resetAllData(): Promise<void> {
  const profile = createDefaultProfile();
  const settings = { ...DEFAULT_SETTINGS };
  const games: SavedGame[] = [];

  const s = await getStore();
  if (s) {
    await s.set("profile", profile);
    await s.set("settings", settings);
    await s.set("games", games);
    await s.save();
  } else {
    lsSet("profile", profile);
    lsSet("settings", settings);
    lsSet("games", games);
  }
}

export async function getActivityByDate(): Promise<Record<string, number>> {
  const games = await loadGames();
  const activity: Record<string, number> = {};
  for (const game of games) {
    const date = game.playedAt.split("T")[0];
    activity[date] = (activity[date] ?? 0) + 1;
  }
  return activity;
}

export async function getRatingHistory(
  timeControl: keyof UserProfile["ratings"],
): Promise<{ date: string; rating: number }[]> {
  const games = await loadGames().then((g) =>
    g.filter((game) => game.timeControl === timeControl).slice(0, 30).reverse(),
  );
  let rating = DEFAULT_PROFILE.ratings[timeControl];
  return games.map((game) => {
    rating += game.ratingChange;
    return { date: game.playedAt, rating };
  });
}
