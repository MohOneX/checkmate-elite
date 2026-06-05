import { eloToEngineParams } from "@/lib/elo";

type EngineListener = (line: string) => void;

const WORKER_URL = "/stockfish.js";

export class StockfishEngine {
  private worker: Worker | null = null;
  private listeners = new Set<EngineListener>();
  private ready = false;
  private readyPromise: Promise<void> | null = null;
  private searchGeneration = 0;

  async init(): Promise<void> {
    if (this.readyPromise) return this.readyPromise;

    this.readyPromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Stockfish init timeout"));
      }, 15000);

      this.worker = new Worker(WORKER_URL);

      this.worker.addEventListener("message", (e: MessageEvent<string>) => {
        const line = typeof e.data === "string" ? e.data : String(e.data);
        this.listeners.forEach((fn) => fn(line));
        if (line === "uciok") {
          clearTimeout(timeout);
          this.ready = true;
          resolve();
        }
      });

      this.worker.addEventListener("error", (err) => {
        clearTimeout(timeout);
        reject(err);
      });

      this.worker.postMessage("uci");
    });

    return this.readyPromise;
  }

  onMessage(listener: EngineListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  send(cmd: string): void {
    this.worker?.postMessage(cmd);
  }

  async waitForBestMove(fen: string, elo: number, depth = 12): Promise<string> {
    await this.init();
    const { skillLevel, movetime } = eloToEngineParams(elo);
    const generation = ++this.searchGeneration;

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        unsubscribe();
        reject(new Error("Stockfish search timeout"));
      }, movetime + 5000);

      const unsubscribe = this.onMessage((line) => {
        if (generation !== this.searchGeneration) return;
        if (line.startsWith("bestmove")) {
          clearTimeout(timeout);
          const parts = line.split(" ");
          const bestMove = parts[1] ?? "";
          unsubscribe();
          if (bestMove && bestMove !== "(none)") {
            resolve(bestMove);
          } else {
            reject(new Error("No legal move from engine"));
          }
        }
      });

      this.send("stop");
      this.send("ucinewgame");
      this.send(`setoption name Skill Level value ${skillLevel}`);
      this.send("position fen " + fen);
      this.send(`go depth ${depth} movetime ${movetime}`);
    });
  }

  async analyze(
    fen: string,
    depth: number,
    movetimeMs = 5000,
  ): Promise<{ eval: number; bestMove: string; pv: string }> {
    await this.init();
    const generation = ++this.searchGeneration;
    const cappedDepth = Math.max(6, Math.min(18, depth));

    return new Promise((resolve, reject) => {
      let evalScore = 0;
      let bestMove = "";
      let pv = "";

      const timeout = setTimeout(() => {
        unsubscribe();
        reject(new Error("Analysis timed out — try lowering depth in Settings"));
      }, movetimeMs + 10000);

      const unsubscribe = this.onMessage((line) => {
        if (generation !== this.searchGeneration) return;
        if (line.startsWith("info") && line.includes("score")) {
          const cpMatch = line.match(/score cp (-?\d+)/);
          const mateMatch = line.match(/score mate (-?\d+)/);
          const pvMatch = line.match(/ pv (.+)$/);
          if (mateMatch) {
            const mate = parseInt(mateMatch[1], 10);
            evalScore = mate > 0 ? 10000 : -10000;
          } else if (cpMatch) {
            evalScore = parseInt(cpMatch[1], 10);
          }
          if (pvMatch) pv = pvMatch[1];
        }
        if (line.startsWith("bestmove")) {
          clearTimeout(timeout);
          bestMove = line.split(" ")[1] ?? "";
          unsubscribe();
          resolve({ eval: evalScore, bestMove, pv });
        }
      });

      this.send("stop");
      this.send("ucinewgame");
      this.send("setoption name Skill Level value 20");
      this.send("position fen " + fen);
      this.send(`go depth ${cappedDepth} movetime ${movetimeMs}`);
    });
  }

  stop(): void {
    this.searchGeneration++;
    this.send("stop");
  }

  dispose(): void {
    this.worker?.terminate();
    this.worker = null;
    this.ready = false;
    this.readyPromise = null;
  }

  isReady(): boolean {
    return this.ready;
  }
}

export const stockfishEngine = new StockfishEngine();
