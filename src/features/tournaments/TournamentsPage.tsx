import { useEffect, useState } from "react";
import { Tabs } from "@/components/ui/Tabs";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { formatDate } from "@/lib/utils";
import { apiClient, isOnlineConnected } from "@/services/api";
import { useProfileStore } from "@/stores/profileStore";
import type { Tournament, TournamentStanding } from "@/types";

function EmptyPanel({ message }: { message: string }) {
  return (
    <p className="text-sm text-on-surface-variant text-center py-8">{message}</p>
  );
}

export function TournamentsPage() {
  const unlockAchievement = useProfileStore((s) => s.unlockAchievement);
  const online = isOnlineConnected();
  const [tab, setTab] = useState<"live" | "upcoming" | "past">("live");
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [standings, setStandings] = useState<TournamentStanding[]>([]);
  const [joinMsg, setJoinMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!online) {
      setTournaments([]);
      return;
    }
    apiClient.getTournaments(tab).then(setTournaments).catch(() => setTournaments([]));
  }, [tab, online]);

  useEffect(() => {
    if (!online) {
      setStandings([]);
      return;
    }
    const featured = tournaments.find((t) => t.featured);
    if (featured) {
      apiClient.getTournamentStandings(featured.id).then(setStandings).catch(() => setStandings([]));
    } else {
      setStandings([]);
    }
  }, [tournaments, online]);

  const featured = tournaments.find((t) => t.featured) ?? tournaments[0];
  const listTournaments = tournaments.filter((t) => !t.featured || tab !== "live");

  const handleJoin = async (id: string) => {
    if (!online) return;
    const result = await apiClient.joinTournament(id);
    setJoinMsg(result.message);
    if (result.success) await unlockAchievement("tournament-join");
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-10">
      <header className="mb-8">
        <h1 className="font-display-lg text-3xl md:text-4xl text-on-surface mb-2">Tournaments</h1>
        <p className="font-body-lg text-on-surface-variant">
          {online
            ? "Compete in live online events"
            : "Online tournaments will appear here once connected"}
        </p>
      </header>

      {!online && (
        <Card className="p-6 mb-8 text-center">
          <MaterialIcon name="cloud_off" className="text-4xl text-outline mb-3" />
          <p className="text-on-surface-variant mb-1">Tournaments are unavailable offline</p>
          <p className="text-on-surface-variant/70 text-sm">
            Brackets, standings, and events will load automatically when online mode is enabled.
          </p>
        </Card>
      )}

      <Tabs
        tabs={[
          { id: "live" as const, label: "Live" },
          { id: "upcoming" as const, label: "Upcoming" },
          { id: "past" as const, label: "Past" },
        ]}
        active={tab}
        onChange={setTab}
        className="mb-8"
      />

      {online && featured && tab === "live" && (
        <Card className="p-6 md:p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
            <Badge variant="success">LIVE</Badge>
          </div>
          <h2 className="font-headline-md text-2xl mb-2">{featured.name}</h2>
          <p className="font-body-md text-on-surface-variant mb-4">
            {featured.format} • {featured.players} players • Prize {featured.prizePool}
          </p>
          <Button onClick={() => handleJoin(featured.id)}>
            <MaterialIcon name="emoji_events" /> Join Tournament
          </Button>
          {joinMsg && <p className="mt-3 font-label-mono text-sm text-primary">{joinMsg}</p>}
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-headline-sm mb-4 flex items-center gap-2">
            <MaterialIcon name="account_tree" /> Bracket Preview
          </h3>
          {online ? (
            <EmptyPanel message="No bracket data for this tournament yet." />
          ) : (
            <EmptyPanel message="Bracket preview will appear when online mode is active." />
          )}
        </Card>

        <Card className="p-6">
          <h3 className="font-headline-sm mb-4">Standings</h3>
          {standings.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="font-label-mono text-on-surface-variant text-left border-b border-glass-stroke">
                  <th className="pb-2">#</th>
                  <th className="pb-2">Player</th>
                  <th className="pb-2">Score</th>
                  <th className="pb-2">TB</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((s) => (
                  <tr key={s.username} className="border-b border-glass-stroke/30">
                    <td className="py-2 font-label-mono">{s.rank}</td>
                    <td className="py-2">{s.username}</td>
                    <td className="py-2 font-label-mono text-primary">{s.score}</td>
                    <td className="py-2 font-label-mono text-on-surface-variant">{s.tiebreak}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <EmptyPanel
              message={
                online
                  ? "No standings available yet."
                  : "Standings will appear when online mode is active."
              }
            />
          )}
        </Card>
      </div>

      <section className="mt-8">
        <h3 className="font-headline-sm mb-4 capitalize">{tab} Events</h3>
        {listTournaments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {listTournaments.map((t) => (
              <Card key={t.id} className="p-5 flex justify-between items-center">
                <div>
                  <p className="font-headline-sm">{t.name}</p>
                  <p className="font-label-mono text-xs text-on-surface-variant mt-1">
                    {formatDate(t.startDate)} • {t.format}
                  </p>
                </div>
                {tab === "upcoming" && online && (
                  <Button size="sm" variant="secondary" onClick={() => handleJoin(t.id)}>
                    Register
                  </Button>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-6">
            <EmptyPanel
              message={
                online
                  ? `No ${tab} events right now.`
                  : `${tab.charAt(0).toUpperCase() + tab.slice(1)} events will appear when online mode is active.`
              }
            />
          </Card>
        )}
      </section>
    </div>
  );
}
