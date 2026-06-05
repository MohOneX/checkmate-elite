import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { BOARD_THEMES } from "@/lib/constants";
import { exportData, importData, resetAllData } from "@/services/persistence";
import { useSettingsStore } from "@/stores/settingsStore";
import { useProfileStore } from "@/stores/profileStore";

export function SettingsPage() {
  const { settings, loaded, load, update } = useSettingsStore();
  const { profile, updateProfile } = useProfileStore();
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    if (!loaded) load();
  }, [loaded, load]);

  const handleExport = async () => {
    const data = await exportData();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "checkmate-elite-backup.json";
    a.click();
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      await importData(await file.text());
      await load();
      window.location.reload();
    };
    input.click();
  };

  const handleReset = async () => {
    setResetting(true);
    try {
      await resetAllData();
      window.location.reload();
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-10 max-w-3xl">
      <header className="mb-10">
        <h1 className="font-display-lg text-3xl md:text-4xl text-on-surface mb-2">Settings</h1>
        <p className="font-body-lg text-on-surface-variant">Customize your experience</p>
      </header>

      <div className="flex flex-col gap-6">
        <Card className="p-6">
          <h3 className="font-headline-sm mb-4 flex items-center gap-2">
            <MaterialIcon name="grid_on" /> Board
          </h3>
          <div className="flex gap-3 flex-wrap">
            {(Object.keys(BOARD_THEMES) as (keyof typeof BOARD_THEMES)[]).map((key) => (
              <button
                key={key}
                onClick={() => update({ boardTheme: key })}
                className={`px-4 py-2 rounded-lg border font-label-mono text-sm transition-all ${
                  settings.boardTheme === key
                    ? "border-primary bg-gold-muted text-primary"
                    : "border-glass-stroke text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {BOARD_THEMES[key].name}
              </button>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-headline-sm mb-4 flex items-center gap-2">
            <MaterialIcon name="sports_esports" /> Gameplay
          </h3>
          <div className="flex flex-col gap-4">
            {[
              { key: "showLegalMoves" as const, label: "Show legal moves" },
              { key: "confirmMoves" as const, label: "Confirm moves" },
              { key: "autoQueenPromotion" as const, label: "Auto-queen promotion" },
              { key: "moveSounds" as const, label: "Move sounds" },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center justify-between cursor-pointer">
                <span className="font-body-md">{label}</span>
                <input
                  type="checkbox"
                  checked={settings[key]}
                  onChange={(e) => update({ [key]: e.target.checked })}
                  className="w-5 h-5 accent-primary"
                />
              </label>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-headline-sm mb-4 flex items-center gap-2">
            <MaterialIcon name="timer" /> Clock & Engine
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1">
              <span className="font-label-mono text-xs text-on-surface-variant">Default AI ELO</span>
              <input
                type="number"
                min={800}
                max={3200}
                value={settings.defaultAiElo}
                onChange={(e) => update({ defaultAiElo: Number(e.target.value) })}
                className="bg-surface-container border border-glass-stroke rounded-lg px-3 py-2"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-label-mono text-xs text-on-surface-variant">Analysis depth</span>
              <input
                type="number"
                min={6}
                max={18}
                value={settings.analysisDepth}
                onChange={(e) => update({ analysisDepth: Number(e.target.value) })}
                className="bg-surface-container border border-glass-stroke rounded-lg px-3 py-2"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-label-mono text-xs text-on-surface-variant">Low time warning (sec)</span>
              <input
                type="number"
                min={5}
                max={60}
                value={settings.lowTimeWarningMs / 1000}
                onChange={(e) => update({ lowTimeWarningMs: Number(e.target.value) * 1000 })}
                className="bg-surface-container border border-glass-stroke rounded-lg px-3 py-2"
              />
            </label>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-headline-sm mb-4 flex items-center gap-2">
            <MaterialIcon name="person" /> Account
          </h3>
          <label className="flex flex-col gap-1 mb-4">
            <span className="font-label-mono text-xs text-on-surface-variant">Username</span>
            <input
              type="text"
              value={profile.username}
              onChange={(e) => updateProfile({ username: e.target.value })}
              className="bg-surface-container border border-glass-stroke rounded-lg px-3 py-2"
            />
          </label>
          <p className="font-label-mono text-xs text-on-surface-variant">
            Sign in for cloud sync — coming soon
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="font-headline-sm mb-4 flex items-center gap-2">
            <MaterialIcon name="backup" /> Data
          </h3>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={handleExport}>
              Export Data
            </Button>
            <Button variant="secondary" onClick={handleImport}>
              Import Data
            </Button>
          </div>
        </Card>

        <Card className="p-6 border-error/30">
          <h3 className="font-headline-sm mb-2 flex items-center gap-2 text-error">
            <MaterialIcon name="delete_forever" /> Reset All Data
          </h3>
          <p className="font-body-md text-on-surface-variant text-sm mb-4">
            Clear your profile, game history, ratings, achievements, and settings. This cannot be
            undone — export a backup first if you want to keep your data.
          </p>
          {!confirmReset ? (
            <Button
              variant="secondary"
              className="border-error/40 text-error hover:bg-error/10"
              onClick={() => setConfirmReset(true)}
            >
              Reset All Data
            </Button>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              <p className="font-label-mono text-sm text-error">Are you sure?</p>
              <Button
                variant="secondary"
                className="border-error/40 text-error hover:bg-error/10"
                onClick={handleReset}
                disabled={resetting}
              >
                {resetting ? "Resetting…" : "Yes, reset everything"}
              </Button>
              <Button variant="ghost" onClick={() => setConfirmReset(false)} disabled={resetting}>
                Cancel
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
