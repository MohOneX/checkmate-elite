import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Chess } from "chess.js";
import type { Square } from "chess.js";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine } from "recharts";
import { ChessBoardView } from "@/components/chess/ChessBoardView";
import { MoveList } from "@/components/chess/MoveList";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { cn } from "@/lib/utils";
import { stockfishEngine } from "@/engine/stockfishEngine";
import { useSettingsStore } from "@/stores/settingsStore";
import { useProfileStore } from "@/stores/profileStore";
import type { EvalPoint } from "@/types";

type AnalysisMode = "idle" | "position" | "game";

function formatEval(cp: number): string {
  if (Math.abs(cp) >= 9000) return cp > 0 ? "M+" : "M-";
  return (cp / 100).toFixed(1);
}

function applyAnalysisResult(
  ev: number,
  bestMove: string,
  pv: string,
  setCurrentEval: (n: number) => void,
  setEngineLines: (lines: string[]) => void,
) {
  setCurrentEval(ev);
  const lines = [`Best: ${bestMove || "—"}`];
  if (pv) lines.push(`Line: ${pv.split(" ").slice(0, 8).join(" ")}`);
  setEngineLines(lines);
}

export function AnalyticsPage() {
  const location = useLocation();
  const settings = useSettingsStore((s) => s.settings);
  const games = useProfileStore((s) => s.games);
  const [chess] = useState(() => new Chess());
  const [fen, setFen] = useState(chess.fen());
  const [history, setHistory] = useState<string[]>([]);
  const [moveIndex, setMoveIndex] = useState(0);
  const [evalPoints, setEvalPoints] = useState<EvalPoint[]>([]);
  const [currentEval, setCurrentEval] = useState(0);
  const [engineLines, setEngineLines] = useState<string[]>([]);
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>("idle");
  const [gameProgress, setGameProgress] = useState({ current: 0, total: 0 });
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [puzzleHint, setPuzzleHint] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fullHistory, setFullHistory] = useState<string[]>([]);
  const abortRef = useRef(false);

  const analyzing = analysisMode !== "idle";
  const positionDepth = Math.min(settings.analysisDepth, 12);

  const resetAnalysisUi = useCallback(() => {
    setEvalPoints([]);
    setCurrentEval(0);
    setEngineLines([]);
    setStatusMessage(null);
    setErrorMessage(null);
    setGameProgress({ current: 0, total: 0 });
  }, []);

  const loadFromPgn = useCallback(
    (pgn: string) => {
      const c = new Chess();
      c.loadPgn(pgn);
      const hist = c.history();
      setFullHistory(hist);
      setHistory(hist);
      setMoveIndex(hist.length);
      setFen(c.fen());
      chess.loadPgn(pgn);
      resetAnalysisUi();
      stockfishEngine.stop();
    },
    [chess, resetAnalysisUi],
  );

  useEffect(() => {
    const state = location.state as { pgn?: string; puzzleFen?: string; puzzleDescription?: string } | null;
    if (state?.pgn) {
      setPuzzleHint(null);
      loadFromPgn(state.pgn);
    } else if (state?.puzzleFen) {
      chess.load(state.puzzleFen);
      setFen(chess.fen());
      setHistory([]);
      setFullHistory([]);
      setMoveIndex(0);
      setPuzzleHint(state.puzzleDescription ?? "Find the best move.");
      resetAnalysisUi();
    } else if (games[0]) {
      setPuzzleHint(null);
      loadFromPgn(games[0].pgn);
    }
  }, [location.state, games, loadFromPgn, chess, resetAnalysisUi]);

  useEffect(() => {
    return () => {
      abortRef.current = true;
      stockfishEngine.stop();
    };
  }, []);

  const goToMove = (index: number) => {
    const c = new Chess();
    for (let i = 0; i < index; i++) c.move(fullHistory[i]);
    setMoveIndex(index);
    setFen(c.fen());
    setHistory(fullHistory.slice(0, index));
    setErrorMessage(null);
  };

  const analyzePosition = async () => {
    if (analyzing) return;
    abortRef.current = false;
    setAnalysisMode("position");
    setErrorMessage(null);
    setStatusMessage("Analyzing current position…");

    try {
      const { eval: ev, pv, bestMove } = await stockfishEngine.analyze(
        fen,
        positionDepth,
        4000,
      );
      if (abortRef.current) return;
      applyAnalysisResult(ev, bestMove, pv, setCurrentEval, setEngineLines);
      setStatusMessage(`Position analyzed (depth ≤ ${positionDepth})`);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Analysis failed");
      setStatusMessage(null);
    } finally {
      setAnalysisMode("idle");
    }
  };

  const analyzeFullGame = async () => {
    if (fullHistory.length === 0 || analyzing) return;
    abortRef.current = false;
    setAnalysisMode("game");
    setErrorMessage(null);
    setEvalPoints([]);
    setGameProgress({ current: 0, total: fullHistory.length });

    const gameDepth = Math.min(8, settings.analysisDepth);
    const points: EvalPoint[] = [];

    try {
      const c = new Chess();
      for (let i = 0; i < fullHistory.length; i++) {
        if (abortRef.current) break;
        c.move(fullHistory[i]);
        setGameProgress({ current: i + 1, total: fullHistory.length });
        setStatusMessage(`Analyzing move ${i + 1} of ${fullHistory.length}…`);

        const { eval: ev, bestMove, pv } = await stockfishEngine.analyze(
          c.fen(),
          gameDepth,
          2500,
        );
        points.push({ move: i + 1, eval: ev / 100, san: fullHistory[i] });

        if (i === fullHistory.length - 1) {
          applyAnalysisResult(ev, bestMove, pv, setCurrentEval, setEngineLines);
        }
      }

      if (abortRef.current) return;

      setEvalPoints(points);
      if (points.length > 0) {
        const last = points[points.length - 1];
        setCurrentEval(last.eval * 100);
        setStatusMessage(`Game analyzed — ${points.length} moves (depth ≤ ${gameDepth})`);
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Game analysis failed");
      if (points.length > 0) setEvalPoints(points);
      setStatusMessage(points.length > 0 ? `Partial analysis — ${points.length} moves completed` : null);
    } finally {
      setAnalysisMode("idle");
      setGameProgress({ current: 0, total: 0 });
    }
  };

  const cancelAnalysis = () => {
    abortRef.current = true;
    stockfishEngine.stop();
    setAnalysisMode("idle");
    setGameProgress({ current: 0, total: 0 });
    setStatusMessage("Analysis cancelled");
  };

  const importPgn = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pgn,.txt";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const text = await file.text();
      loadFromPgn(text);
    };
    input.click();
  };

  const tryMove = (from: Square, to: Square) => {
    try {
      const c = new Chess(fen);
      c.move({ from, to, promotion: "q" });
      setFen(c.fen());
      setHistory([...history, c.history()[c.history().length - 1]!]);
      setErrorMessage(null);
      return true;
    } catch {
      return false;
    }
  };

  const evalBarWidth = Math.min(50, Math.abs(currentEval / 100) * 25);
  const evalBarLeft = currentEval >= 0 ? 50 : 50 + (currentEval / 100) * 25;

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-10">
      <header className="mb-8 flex flex-wrap justify-between items-start gap-4">
        <div>
          <h1 className="font-display-lg text-3xl md:text-4xl text-on-surface mb-2">Analytics</h1>
          <p className="font-body-lg text-on-surface-variant">Engine analysis and game review</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="secondary" onClick={importPgn} disabled={analyzing}>
            <MaterialIcon name="upload_file" /> Import PGN
          </Button>
          {analyzing && analysisMode === "game" ? (
            <Button variant="secondary" onClick={cancelAnalysis}>
              <MaterialIcon name="close" /> Cancel
            </Button>
          ) : (
            <Button onClick={analyzeFullGame} disabled={analyzing || fullHistory.length === 0}>
              <MaterialIcon name="analytics" /> Analyze Game
            </Button>
          )}
        </div>
      </header>

      {(statusMessage || errorMessage || puzzleHint) && (
        <div
          className={cn(
            "mb-6 px-4 py-3 rounded-lg border font-body-md text-sm",
            errorMessage
              ? "border-error/40 bg-error/10 text-error"
              : "border-primary/30 bg-gold-muted text-primary",
          )}
        >
          <div className="flex items-center gap-2">
            <MaterialIcon name={errorMessage ? "error" : puzzleHint ? "extension" : "info"} className="text-base" />
            {errorMessage ?? statusMessage ?? puzzleHint}
          </div>
          {analysisMode === "game" && gameProgress.total > 0 && (
            <div className="mt-3 h-1.5 bg-surface-container rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${(gameProgress.current / gameProgress.total) * 100}%` }}
              />
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 flex flex-col items-center gap-4">
          <div className="w-full max-w-[480px]">
            <ChessBoardView
              fen={fen}
              orientation="white"
              onPieceDrop={tryMove}
              onSquareClick={() => {}}
              allowMoves={!analyzing}
            />
          </div>

          <Card className="w-full p-4">
            <div className="flex items-center gap-4 mb-3">
              <span className="font-label-mono text-sm text-on-surface-variant">Eval</span>
              <div className="flex-1 h-3 bg-surface-container rounded-full overflow-hidden relative">
                <div
                  className="absolute top-0 h-full bg-primary transition-all duration-300"
                  style={{
                    left: `${evalBarLeft}%`,
                    width: `${evalBarWidth}%`,
                  }}
                />
                <div className="absolute left-1/2 top-0 w-0.5 h-full bg-glass-stroke" />
              </div>
              <span className="font-label-mono text-primary tabular-nums min-w-[3rem] text-right">
                {formatEval(currentEval)}
              </span>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button
                size="sm"
                variant="secondary"
                onClick={analyzePosition}
                disabled={analyzing}
              >
                <MaterialIcon name="psychology" className="text-base" />
                {analysisMode === "position" ? "Analyzing…" : "Analyze Position"}
              </Button>
              {analyzing && analysisMode === "position" && (
                <Button size="sm" variant="ghost" onClick={cancelAnalysis}>
                  Cancel
                </Button>
              )}
            </div>

            {engineLines.length > 0 && (
              <div className="mt-3 pt-3 border-t border-glass-stroke space-y-1">
                {engineLines.map((line) => (
                  <p key={line} className="font-label-mono text-xs text-on-surface-variant">
                    {line}
                  </p>
                ))}
              </div>
            )}
          </Card>

          {evalPoints.length > 0 && (
            <Card className="w-full p-4">
              <h3 className="font-headline-sm text-sm mb-3 text-on-surface">
                Evaluation Graph
              </h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={evalPoints}>
                    <XAxis dataKey="move" stroke="#99907c" fontSize={10} label={{ value: "Move", position: "insideBottom", offset: -2 }} />
                    <YAxis stroke="#99907c" fontSize={10} />
                    <ReferenceLine y={0} stroke="#99907c" strokeDasharray="3 3" />
                    <Tooltip
                      contentStyle={{
                        background: "#1A1A1B",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                      formatter={(value, _name, props) => [
                        `${value} (${props.payload?.san ?? ""})`,
                        "Eval",
                      ]}
                    />
                    <Line type="monotone" dataKey="eval" stroke="#f2ca50" dot={false} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}
        </div>

        <div className="flex flex-col gap-4 min-h-[400px]">
          <Card className="p-4 flex-1">
            <MoveList history={history} currentMoveIndex={moveIndex} onMoveClick={goToMove} />
          </Card>
          {games.length > 0 && (
            <Card className="p-4">
              <h3 className="font-label-mono text-outline uppercase mb-3">Recent Games</h3>
              <div className="flex flex-col gap-2 max-h-40 overflow-y-auto">
                {games.slice(0, 8).map((g) => (
                  <button
                    key={g.id}
                    onClick={() => loadFromPgn(g.pgn)}
                    className="text-left text-sm hover:text-primary transition-colors font-body-md"
                  >
                    vs {g.playerColor === "w" ? g.black : g.white} ({g.result})
                  </button>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
