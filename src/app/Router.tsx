import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { stockfishEngine } from "@/engine/stockfishEngine";
import { useProfileStore } from "@/stores/profileStore";
import { useSettingsStore } from "@/stores/settingsStore";

const DashboardPage = lazy(() =>
  import("@/features/dashboard/DashboardPage").then((m) => ({ default: m.DashboardPage })),
);
const PlayLobbyPage = lazy(() =>
  import("@/features/play/PlayLobbyPage").then((m) => ({ default: m.PlayLobbyPage })),
);
const LiveGamePage = lazy(() =>
  import("@/features/play/LiveGamePage").then((m) => ({ default: m.LiveGamePage })),
);
const AnalyticsPage = lazy(() =>
  import("@/features/analytics/AnalyticsPage").then((m) => ({ default: m.AnalyticsPage })),
);
const TournamentsPage = lazy(() =>
  import("@/features/tournaments/TournamentsPage").then((m) => ({ default: m.TournamentsPage })),
);
const LeaderboardPage = lazy(() =>
  import("@/features/leaderboard/LeaderboardPage").then((m) => ({ default: m.LeaderboardPage })),
);
const ProfilePage = lazy(() =>
  import("@/features/profile/ProfilePage").then((m) => ({ default: m.ProfilePage })),
);
const SettingsPage = lazy(() =>
  import("@/features/settings/SettingsPage").then((m) => ({ default: m.SettingsPage })),
);

function Loading() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="font-label-mono text-primary animate-pulse">Loading...</div>
    </div>
  );
}

function AppRoutes() {
  const loadProfile = useProfileStore((s) => s.load);
  const loadSettings = useSettingsStore((s) => s.load);

  useEffect(() => {
    loadProfile();
    loadSettings();
    stockfishEngine.init().catch(console.error);
  }, [loadProfile, loadSettings]);

  return (
    <BrowserRouter>
      <AppShell>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/play" element={<PlayLobbyPage />} />
            <Route path="/play/game" element={<LiveGamePage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/tournaments" element={<TournamentsPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AppShell>
    </BrowserRouter>
  );
}

export default AppRoutes;
