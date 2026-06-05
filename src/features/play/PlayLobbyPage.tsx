import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { AI_PERSONALITIES, TIME_CONTROLS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { apiClient } from "@/services/api";
import { useLobbyStore } from "@/stores/lobbyStore";
import { useGameStore } from "@/stores/gameStore";

export function PlayLobbyPage() {
  const navigate = useNavigate();
  const {
    selectedAiId,
    targetElo,
    timeControl,
    mode,
    setSelectedAi,
    setTargetElo,
    setTimeControl,
    setMode,
    getOpponentName,
  } = useLobbyStore();
  const startGame = useGameStore((s) => s.startGame);
  const [matchMsg, setMatchMsg] = useState<string | null>(null);

  const sliderPercent = ((targetElo - 800) / 2400) * 100;

  const initiateChallenge = () => {
    startGame({
      mode: mode === "online" ? "ai" : mode,
      playerColor: "w",
      opponentName: getOpponentName(),
      opponentElo: targetElo,
      timeControl: timeControl.type,
      initialMs: timeControl.initialMs,
      incrementMs: timeControl.incrementMs,
    });
    navigate("/play/game");
  };

  const findOpponent = async () => {
    const status = await apiClient.matchmake(timeControl.type);
    setMatchMsg(status.message);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-10 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-96 bg-primary-container/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="max-w-[1440px] mx-auto">
        <div className="mb-12">
          <h1 className="font-display-lg text-3xl md:text-5xl text-on-surface mb-2">Challenge the Core</h1>
          <p className="font-body-lg text-on-surface-variant max-w-2xl">
            Select an AI personality, tune difficulty, and start your match.
          </p>
        </div>

        <div className="flex gap-3 mb-8">
          {(["ai", "local", "online"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                "font-label-mono px-4 py-2 rounded-lg border transition-all capitalize",
                mode === m
                  ? "bg-gold-muted text-primary border-primary"
                  : "border-glass-stroke text-on-surface-variant hover:text-on-surface",
              )}
            >
              {m === "ai" ? "vs AI" : m === "local" ? "Local 2P" : "Online"}
            </button>
          ))}
        </div>

        {mode === "ai" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {AI_PERSONALITIES.map((ai) => (
              <motion.div
                key={ai.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedAi(ai.id)}
                className={cn(
                  "glass-panel rounded-xl p-6 cursor-pointer relative overflow-hidden",
                  selectedAiId === ai.id && "ai-card-active border-primary/40",
                )}
              >
                <MaterialIcon
                  name={ai.icon}
                  className="absolute top-4 right-4 text-4xl text-primary opacity-30"
                />
                <div className="relative h-32 mb-4 rounded-lg overflow-hidden bg-surface-variant">
                  <img
                    src={ai.image}
                    alt={`${ai.name} — ${ai.elo} ELO`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface/90 via-surface/20 to-transparent" />
                  <MaterialIcon
                    name={ai.icon}
                    className="absolute bottom-2 right-2 text-2xl text-primary/80"
                  />
                </div>
                <div className="flex justify-between items-end mb-2">
                  <h3
                    className={cn(
                      "font-headline-md",
                      ai.isGrandmaster && "text-primary",
                    )}
                  >
                    {ai.name}
                  </h3>
                  <Badge variant={ai.isGrandmaster ? "gold" : "default"}>ELO {ai.elo}</Badge>
                </div>
                <p className="font-body-md text-on-surface-variant text-sm mb-4">{ai.description}</p>
                <div className="flex gap-2 flex-wrap">
                  {ai.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs font-label-mono bg-surface-container px-2 py-1 rounded border border-glass-stroke"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                {ai.isGrandmaster && (
                  <Badge variant="gold" className="absolute top-4 left-4">
                    GM Title
                  </Badge>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {mode === "online" && (
          <Card className="p-6 mb-8 text-center">
            <MaterialIcon name="cloud_off" className="text-4xl text-outline mb-3" />
            <p className="text-on-surface-variant mb-4">
              Online matchmaking is coming soon. Play vs AI or local 2-player for now.
            </p>
            <Button variant="secondary" onClick={findOpponent}>
              Check Status
            </Button>
            {matchMsg && <p className="mt-3 font-label-mono text-sm text-primary">{matchMsg}</p>}
          </Card>
        )}

        <Card className="p-6 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h4 className="font-headline-sm">Fine-Tune Difficulty</h4>
                <span className="font-label-mono text-primary bg-surface-container px-3 py-1 rounded border border-glass-stroke flex items-center gap-2">
                  <MaterialIcon name="tune" className="text-sm" />
                  {targetElo} ELO
                </span>
              </div>
              <div className="relative py-4">
                <div
                  className="absolute top-1/2 -translate-y-1/2 left-0 h-2 bg-primary/30 rounded-full pointer-events-none"
                  style={{ width: `${sliderPercent}%` }}
                />
                <input
                  type="range"
                  min={800}
                  max={3200}
                  step={50}
                  value={targetElo}
                  onChange={(e) => setTargetElo(Number(e.target.value))}
                  className="elo-slider relative z-10"
                />
              </div>
              <div className="flex justify-between text-xs font-label-mono text-on-surface-variant/60 uppercase tracking-widest">
                <span>Beginner</span>
                <span>Club</span>
                <span>Master</span>
                <span className="text-primary/70">Grandmaster</span>
              </div>
            </div>
            <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-glass-stroke pt-6 lg:pt-0 lg:pl-8">
              <label className="font-label-mono text-on-surface-variant block mb-2">Time Control</label>
              <select
                value={TIME_CONTROLS.indexOf(timeControl)}
                onChange={(e) => setTimeControl(TIME_CONTROLS[Number(e.target.value)])}
                className="w-full bg-surface-container border border-glass-stroke text-on-surface rounded-lg px-4 py-2 mb-6 focus:outline-none focus:border-primary/50"
              >
                {TIME_CONTROLS.map((tc, i) => (
                  <option key={tc.label} value={i}>
                    {tc.label}
                  </option>
                ))}
              </select>
              <Button size="lg" className="w-full" onClick={initiateChallenge}>
                <MaterialIcon name="swords" filled />
                INITIATE CHALLENGE
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
