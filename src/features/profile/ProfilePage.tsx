import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { ACHIEVEMENTS } from "@/data/content";
import { getTitleForElo } from "@/lib/elo";
import { formatDate } from "@/lib/utils";
import { getActivityByDate } from "@/services/persistence";
import { useProfileStore } from "@/stores/profileStore";
import { useNavigate } from "react-router-dom";

export function ProfilePage() {
  const navigate = useNavigate();
  const profile = useProfileStore((s) => s.profile);
  const games = useProfileStore((s) => s.games);
  const [activity, setActivity] = useState<Record<string, number>>({});

  useEffect(() => {
    getActivityByDate().then(setActivity);
  }, [games]);

  const winLossData = [
    { name: "Wins", value: profile.wins, fill: "#a7de6f" },
    { name: "Losses", value: profile.losses, fill: "#ffb4ab" },
    { name: "Draws", value: profile.draws, fill: "#99907c" },
  ];

  const activityDays = Object.entries(activity).slice(-84);
  const maxActivity = Math.max(1, ...activityDays.map(([, v]) => v));

  const title = profile.title ?? getTitleForElo(profile.ratings.blitz);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-10">
      <header className="mb-10 flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="w-24 h-24 rounded-full border-2 border-primary/30 bg-surface-variant flex items-center justify-center">
          <MaterialIcon name="person" className="text-5xl text-primary" />
        </div>
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="font-display-lg text-3xl text-on-surface">{profile.username}</h1>
            {title && <Badge variant="gold">{title}</Badge>}
          </div>
          <p className="font-label-mono text-on-surface-variant">
            Member since {formatDate(profile.createdAt)} • Best streak: {profile.bestStreak}
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {(["bullet", "blitz", "rapid"] as const).map((tc) => (
          <Card key={tc} className="p-6 text-center">
            <MaterialIcon
              name={tc === "bullet" ? "electric_bolt" : tc === "blitz" ? "local_fire_department" : "timer"}
              className="text-3xl text-primary mb-2"
            />
            <p className="font-label-mono text-outline uppercase text-xs mb-1">{tc}</p>
            <p className="font-headline-md text-2xl text-primary">{profile.ratings[tc]}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <Card className="p-6">
          <h3 className="font-headline-sm mb-4">Win / Loss / Draw</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={winLossData}>
                <XAxis dataKey="name" stroke="#99907c" />
                <Tooltip
                  contentStyle={{
                    background: "#1A1A1B",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-headline-sm mb-4">Activity</h3>
          <div className="flex flex-wrap gap-1">
            {activityDays.length === 0 ? (
              <p className="text-on-surface-variant text-sm">No activity yet</p>
            ) : (
              activityDays.map(([date, count]) => (
                <div
                  key={date}
                  title={`${date}: ${count} games`}
                  className="w-3 h-3 rounded-sm"
                  style={{
                    backgroundColor: `rgba(242, 202, 80, ${0.15 + (count / maxActivity) * 0.85})`,
                  }}
                />
              ))
            )}
          </div>
        </Card>
      </div>

      <section className="mb-10">
        <h3 className="font-headline-sm mb-4">Achievements</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {ACHIEVEMENTS.map((a) => {
            const unlocked = profile.achievements.includes(a.id);
            return (
              <Card
                key={a.id}
                className={`p-4 text-center ${unlocked ? "" : "opacity-40 grayscale"}`}
              >
                <MaterialIcon name={a.icon} className="text-3xl text-primary mb-2" filled={unlocked} />
                <p className="font-headline-sm text-sm">{a.name}</p>
                <p className="font-label-mono text-[10px] text-on-surface-variant mt-1">{a.description}</p>
              </Card>
            );
          })}
        </div>
      </section>

      <section>
        <h3 className="font-headline-sm mb-4">Game History</h3>
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface-container border-b border-glass-stroke">
              <tr className="font-label-mono text-on-surface-variant text-left">
                <th className="p-3">Opponent</th>
                <th className="p-3">Result</th>
                <th className="p-3">Type</th>
                <th className="p-3">ELO Δ</th>
                <th className="p-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {games.map((g) => (
                <tr
                  key={g.id}
                  onClick={() => navigate("/analytics", { state: { pgn: g.pgn } })}
                  className="border-b border-glass-stroke/50 hover:bg-surface-variant/30 cursor-pointer"
                >
                  <td className="p-3">{g.playerColor === "w" ? g.black : g.white}</td>
                  <td className="p-3">{g.result}</td>
                  <td className="p-3 capitalize">{g.timeControl}</td>
                  <td className={`p-3 font-label-mono ${g.ratingChange >= 0 ? "text-tertiary" : "text-error"}`}>
                    {g.ratingChange > 0 ? "+" : ""}
                    {g.ratingChange}
                  </td>
                  <td className="p-3 text-on-surface-variant">{formatDate(g.playedAt)}</td>
                </tr>
              ))}
              {games.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-on-surface-variant">
                    No games played yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      </section>
    </div>
  );
}
