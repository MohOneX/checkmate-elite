import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { ChessBoardView } from "@/components/chess/ChessBoardView";
import { Card } from "@/components/ui/Card";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { getDailyPuzzle, getRandomPuzzle } from "@/data/content";
import { buildRatingHistory, formatRatingChange, formatRatingTooltipDate } from "@/lib/ratingHistory";
import { TIME_CONTROLS } from "@/lib/constants";
import { apiClient, isOnlineConnected } from "@/services/api";
import { useProfileStore } from "@/stores/profileStore";
import { useLobbyStore } from "@/stores/lobbyStore";
import { useEffect, useState } from "react";

const QUICK_PLAY = [
  { icon: "electric_bolt", label: "1 min", type: "Bullet", tc: TIME_CONTROLS[0] },
  { icon: "local_fire_department", label: "3 min", type: "Blitz", tc: TIME_CONTROLS[2] },
  { icon: "timer", label: "10 min", type: "Rapid", tc: TIME_CONTROLS[4] },
];

export function DashboardPage() {
  const navigate = useNavigate();
  const profile = useProfileStore((s) => s.profile);
  const games = useProfileStore((s) => s.games);
  const setTimeControl = useLobbyStore((s) => s.setTimeControl);
  const puzzle = getDailyPuzzle();
  const sideToMove = puzzle.fen.split(" ")[1] === "b" ? "Black" : "White";
  const [friends, setFriends] = useState<{ username: string; status: string }[]>([]);

  useEffect(() => {
    if (!isOnlineConnected()) {
      setFriends([]);
      return;
    }
    apiClient.getOnlineFriends().then(setFriends).catch(() => setFriends([]));
  }, []);

  const ratingData = buildRatingHistory(games, profile.ratings.blitz, "blitz", 10);
  const blitzGamesPlayed = games.filter((g) => g.timeControl === "blitz").length;
  const periodChange = ratingData.reduce((sum, point) => sum + point.change, 0);
  const ratingDomain =
    ratingData.length > 0
      ? (() => {
          const ratings = ratingData.map((point) => point.rating);
          const min = Math.min(...ratings);
          const max = Math.max(...ratings);
          const padding = Math.max(25, Math.round((max - min) * 0.15) || 25);
          return [min - padding, max + padding] as [number, number];
        })()
      : undefined;

  const startQuickPlay = (tc: (typeof TIME_CONTROLS)[number]) => {
    setTimeControl(tc);
    navigate("/play");
  };

  const solveRandomPuzzle = () => {
    const randomPuzzle = getRandomPuzzle(puzzle.id);
    navigate("/analytics", {
      state: {
        puzzleFen: randomPuzzle.fen,
        puzzleDescription: randomPuzzle.description,
      },
    });
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 md:p-10 flex flex-col gap-10">
        <header>
          <h1 className="font-display-lg text-4xl md:text-display-lg text-on-surface mb-2">Welcome back.</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Ready to improve your rating today?
          </p>
        </header>

        <section>
          <h3 className="font-label-mono text-label-mono text-outline uppercase tracking-widest mb-4">
            Quick Play
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {QUICK_PLAY.map((item) => (
              <motion.button
                key={item.type}
                whileHover={{ y: -4 }}
                onClick={() => startQuickPlay(item.tc)}
                className="group glass-panel rounded-xl p-6 flex flex-col items-center cursor-pointer hover:border-primary/50 transition-all relative overflow-hidden"
              >
                <MaterialIcon name={item.icon} className="text-4xl text-primary mb-3" />
                <h4 className="font-headline-md text-headline-md text-on-surface">{item.label}</h4>
                <p className="font-label-mono text-label-mono text-on-surface-variant mt-1">{item.type}</p>
              </motion.button>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
          <Card className="overflow-hidden flex flex-col">
            <div className="relative w-full bg-surface-variant">
              <ChessBoardView fen={puzzle.fen} orientation="white" allowMoves={false} />
              <div className="absolute bottom-4 left-6 z-10">
                <span className="bg-primary text-on-primary font-label-mono text-label-mono px-2 py-1 rounded-sm uppercase font-bold">
                  {sideToMove} to Move
                </span>
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between gap-4">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">Daily Tactics</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">{puzzle.description}</p>
              </div>
              <button
                onClick={solveRandomPuzzle}
                className="w-full bg-transparent border border-glass-stroke text-on-surface font-headline-sm py-2 rounded hover:bg-surface-variant transition-colors flex items-center justify-center gap-2"
              >
                Solve Puzzle <MaterialIcon name="arrow_forward" className="text-sm" />
              </button>
            </div>
          </Card>

          <Card className="p-6 flex flex-col">
            <div className="flex justify-between items-start mb-2 gap-4">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Your Progress</h3>
                <p className="font-label-mono text-label-mono text-primary mt-1">
                  {profile.ratings.blitz} Blitz ELO
                </p>
              </div>
              {ratingData.length > 0 && (
                <div className="text-right">
                  <p
                    className={`font-label-mono text-sm ${periodChange >= 0 ? "text-tertiary" : "text-error"}`}
                  >
                    {formatRatingChange(periodChange)} ELO
                  </p>
                  <p className="font-label-mono text-[10px] text-on-surface-variant uppercase tracking-wide">
                    Last {ratingData.length} blitz {ratingData.length === 1 ? "game" : "games"}
                  </p>
                </div>
              )}
            </div>
            <div className="flex-1 h-[220px]">
              {ratingData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={ratingData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                    <XAxis
                      dataKey="shortDate"
                      stroke="#99907c"
                      tick={{ fill: "#99907c", fontSize: 11 }}
                      tickLine={false}
                      axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      domain={ratingDomain}
                      stroke="#99907c"
                      tick={{ fill: "#99907c", fontSize: 11 }}
                      tickLine={false}
                      axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                      width={42}
                      tickFormatter={(value) => `${value}`}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#1A1A1B",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "8px",
                      }}
                      labelFormatter={(_, payload) => {
                        const point = payload?.[0]?.payload as (typeof ratingData)[number] | undefined;
                        return point ? formatRatingTooltipDate(point.date) : "";
                      }}
                      formatter={(value, _name, item) => {
                        const point = item.payload as (typeof ratingData)[number];
                        return [
                          `${value} ELO (${formatRatingChange(point.change)})`,
                          point.gameLabel,
                        ];
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="rating"
                      stroke="#f2ca50"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: "#f2ca50", stroke: "#1A1A1B", strokeWidth: 2 }}
                      activeDot={{ r: 6, fill: "#f2ca50", stroke: "#1A1A1B", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center gap-2 py-8">
                  <MaterialIcon name="trending_up" className="text-3xl text-outline" />
                  <p className="text-on-surface-variant text-sm">Play blitz games to track your rating</p>
                  <p className="text-on-surface-variant/70 text-xs">
                    {blitzGamesPlayed > 0
                      ? "Your recent games used other time controls."
                      : "Each finished game updates this chart automatically."}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      <aside className="hidden lg:flex flex-col w-80 border-l border-glass-stroke bg-surface-elevated/30 overflow-y-auto">
        <div className="p-6 border-b border-glass-stroke/50">
          <h3 className="font-label-mono text-outline uppercase tracking-widest">Activity</h3>
        </div>
        <div className="p-6 flex flex-col gap-8">
          <section>
            <h4 className="font-headline-sm text-headline-sm mb-4 flex justify-between">
              Friends Online
              <span className="bg-surface-variant text-on-surface-variant font-label-mono px-2 py-0.5 rounded-full text-[10px]">
                {friends.length}
              </span>
            </h4>
            <div className="flex flex-col gap-4">
              {friends.map((f) => (
                <div key={f.username} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center font-bold text-on-surface-variant">
                    {f.username.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-body-md text-on-surface">{f.username}</p>
                    <p className="font-label-mono text-[10px] text-on-surface-variant">{f.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h4 className="font-headline-sm text-headline-sm mb-4">Recent Games</h4>
            <div className="flex flex-col border border-glass-stroke rounded-lg overflow-hidden">
              {games.slice(0, 5).map((g) => {
                const won =
                  (g.result === "1-0" && g.playerColor === "w") ||
                  (g.result === "0-1" && g.playerColor === "b");
                const lost =
                  (g.result === "0-1" && g.playerColor === "w") ||
                  (g.result === "1-0" && g.playerColor === "b");
                return (
                  <button
                    key={g.id}
                    onClick={() => navigate("/analytics", { state: { pgn: g.pgn } })}
                    className="flex items-center justify-between p-3 border-b border-glass-stroke hover:bg-surface-variant/30 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-1 h-8 rounded-full ${won ? "bg-tertiary" : lost ? "bg-error" : "bg-outline"}`}
                      />
                      <div>
                        <p className="font-body-md text-on-surface">
                          vs {g.playerColor === "w" ? g.black : g.white}
                        </p>
                        <p className="font-label-mono text-[10px] text-on-surface-variant capitalize">
                          {g.timeControl} • {won ? "Won" : lost ? "Lost" : "Draw"}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`font-label-mono ${won ? "text-tertiary" : lost ? "text-error" : "text-on-surface-variant"}`}
                    >
                      {g.ratingChange > 0 ? "+" : ""}
                      {g.ratingChange}
                    </span>
                  </button>
                );
              })}
              {games.length === 0 && (
                <p className="p-4 text-sm text-on-surface-variant text-center">No games yet</p>
              )}
            </div>
            <button
              onClick={() => navigate("/profile")}
              className="w-full mt-4 font-label-mono text-primary hover:text-primary-fixed py-2"
            >
              View All History
            </button>
          </section>
        </div>
      </aside>
    </div>
  );
}
