import { create } from "zustand";
import type { AppSettings } from "@/types";
import { DEFAULT_SETTINGS, loadSettings, saveSettings } from "@/services/persistence";

interface SettingsState {
  settings: AppSettings;
  loaded: boolean;
  load: () => Promise<void>;
  update: (partial: Partial<AppSettings>) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  loaded: false,
  load: async () => {
    const settings = await loadSettings();
    set({ settings, loaded: true });
  },
  update: async (partial) => {
    const settings = { ...get().settings, ...partial };
    await saveSettings(settings);
    set({ settings });
  },
}));
