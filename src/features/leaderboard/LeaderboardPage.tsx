import { useEffect, useState } from "react";
import { Tabs } from "@/components/ui/Tabs";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { apiClient, isOnlineConnected } from "@/services/api";
import { useProfileStore } from "@/stores/profileStore";
import type { LeaderboardEntry, TimeControlType } from "@/types";

export function LeaderboardPage() {
  const profile = useProfileStore((s) => s.profile);
  const online = isOnlineConnected();
  const [timeControl, setTimeControl] = useState<TimeControlType>("blitz");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    if (!online) {
      setEntries([]);
      return;
    }
    apiClient.getLeaderboard(timeControl, profile).then(setEntries).catch(() => setEntries([]));
  }, [timeControl, profile, online]);

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);
  const podiumOrder = top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3;

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-10">
      <header className="mb-10">
        <h1 className="font-display-lg text-3xl md:text-4xl text-on-surface mb-2">Leaderboard</h1>
        <p className="font-body-lg text-on-surface-variant">
          {online
            ? "Global rankings by rating"
            : "Global rankings will appear here once online mode is active"}
        </p>
      </header>

      {!online && (
        <Card className="p-6 mb-8 text-center">
          <MaterialIcon name="cloud_off" className="text-4xl text-outline mb-3" />
          <p className="text-on-surface-variant mb-1">Leaderboard is unavailable offline</p>
          <p className="text-on-surface-variant/70 text-sm">
            Player rankings will load automatically when online mode is enabled.
          </p>
        </Card>
      )}

      <Tabs
        tabs={[
          { id: "bullet" as const, label: "Bullet" },
          { id: "blitz" as const, label: "Blitz" },
          { id: "rapid" as const, label: "Rapid" },
        ]}
        active={timeControl}
        onChange={setTimeControl}
        className="mb-10"
      />

      {online && podiumOrder.length >= 3 && (
        <div className="flex items-end justify-center gap-4 mb-12 max-w-2xl mx-auto">
          {podiumOrder.map((player, idx) => {
            const rank = idx === 0 ? 2 : idx === 1 ? 1 : 3;
            const heights = ["h-28", "h-36", "h-24"];
            return (
              <Card
                key={player.id}
                className={`flex-1 p-4 text-center ${heights[idx]} flex flex-col justify-end ${player.isLocalUser ? "border-primary/50" : ""}`}
              >
                {rank === 1 && (
                  <MaterialIcon name="crown" className="text-primary text-3xl mb-1 mx-auto" filled />
                )}
                <p className="font-headline-sm text-sm truncate">{player.username}</p>
                <p className="font-label-mono text-primary">{player.elo}</p>
                <Badge variant="default" className="mt-1 mx-auto">
                  #{rank}
                </Badge>
              </Card>
            );
          })}
        </div>
      )}

      <Card className="overflow-hidden">
        {entries.length > 0 ? (
          <table className="w-full">
            <thead className="bg-surface-container border-b border-glass-stroke">
              <tr className="font-label-mono text-on-surface-variant text-left text-sm">
                <th className="p-4 w-16">Rank</th>
                <th className="p-4">Player</th>
                <th className="p-4">Country</th>
                <th className="p-4">ELO</th>
                <th className="p-4">Win Rate</th>
              </tr>
            </thead>
            <tbody>
              {(podiumOrder.length >= 3 ? rest : entries).map((e) => (
                <tr
                  key={e.id}
                  className={`border-b border-glass-stroke/50 hover:bg-surface-variant/20 ${e.isLocalUser ? "bg-gold-muted/30" : ""}`}
                >
                  <td className="p-4 font-label-mono text-on-surface-variant">{e.rank}</td>
                  <td className="p-4">
                    <span className="font-body-md">{e.username}</span>
                    {e.title && (
                      <Badge variant="gold" className="ml-2">
                        {e.title}
                      </Badge>
                    )}
                    {e.isLocalUser && (
                      <span className="ml-2 text-xs text-primary font-label-mono">(You)</span>
                    )}
                  </td>
                  <td className="p-4 font-label-mono text-sm">{e.country}</td>
                  <td className="p-4 font-label-mono text-primary">{e.elo}</td>
                  <td className="p-4 font-label-mono">{e.winRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-on-surface-variant text-center py-12">
            {online
              ? "No leaderboard data available yet."
              : "Rankings will appear when online mode is active."}
          </p>
        )}
      </Card>
    </div>
  );
}
