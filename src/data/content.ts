import type { Puzzle } from "@/types";

export const DAILY_PUZZLES: Puzzle[] = [
  {
    id: "p1",
    fen: "r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4",
    solution: ["Qxf7"],
    description: "Mate in 1. Scholar's Mate pattern.",
    rating: 800,
  },
  {
    id: "p2",
    fen: "rnbqkbnr/pppp1ppp/8/4p3/6P1/5P2/PPPPP2P/RNBQKBNR b KQkq g3 0 2",
    solution: ["Qh4"],
    description: "Mate in 1. Fool's Mate pattern.",
    rating: 600,
  },
  {
    id: "p3",
    fen: "6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1",
    solution: ["Re8"],
    description: "Mate in 1. Back rank mate.",
    rating: 900,
  },
  {
    id: "p4",
    fen: "6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1",
    solution: ["Ra8"],
    description: "Mate in 1. Rook slides to a8.",
    rating: 850,
  },
  {
    id: "p5",
    fen: "6k1/5ppp/8/8/8/8/8/1R5K w - - 0 1",
    solution: ["Rb8"],
    description: "Mate in 1. Rook mates on b8.",
    rating: 860,
  },
  {
    id: "p6",
    fen: "6k1/5ppp/8/8/8/8/8/2R4K w - - 0 1",
    solution: ["Rc8"],
    description: "Mate in 1. Rook mates on c8.",
    rating: 870,
  },
  {
    id: "p7",
    fen: "6k1/5ppp/8/8/8/8/8/3R3K w - - 0 1",
    solution: ["Rd8"],
    description: "Mate in 1. Rook mates on d8.",
    rating: 880,
  },
  {
    id: "p8",
    fen: "6k1/5ppp/8/8/8/8/8/4R2K w - - 0 1",
    solution: ["Re8"],
    description: "Mate in 1. Rook seals the back rank.",
    rating: 890,
  },
  {
    id: "p9",
    fen: "7k/5Q2/6K1/8/8/8/8/8 w - - 0 1",
    solution: ["Qf8"],
    description: "Mate in 1. Queen finishes on f8.",
    rating: 750,
  },
  {
    id: "p10",
    fen: "7k/6Q1/6K1/8/8/8/8/8 w - - 0 1",
    solution: ["Qf8"],
    description: "Mate in 1. Queen and king teamwork.",
    rating: 780,
  },
  {
    id: "p11",
    fen: "7k/4Q3/6K1/8/8/8/8/8 w - - 0 1",
    solution: ["Qd8"],
    description: "Mate in 1. Queen claims d8.",
    rating: 800,
  },
  {
    id: "p12",
    fen: "7k/3Q4/6K1/8/8/8/8/8 w - - 0 1",
    solution: ["Qc8"],
    description: "Mate in 1. Queen mates on c8.",
    rating: 820,
  },
  {
    id: "p13",
    fen: "7k/2Q5/6K1/8/8/8/8/8 w - - 0 1",
    solution: ["Qb8"],
    description: "Mate in 1. Queen mates on b8.",
    rating: 840,
  },
  {
    id: "p14",
    fen: "7k/1Q6/6K1/8/8/8/8/8 w - - 0 1",
    solution: ["Qa8"],
    description: "Mate in 1. Queen mates on a8.",
    rating: 860,
  },
  {
    id: "p15",
    fen: "rnbqkb1r/pppp1ppp/4p3/8/6P1/5P2/PPPPP2P/RNBQKBNR b KQkq g3 0 2",
    solution: ["Qh4"],
    description: "Mate in 1. Punish weakened kingside.",
    rating: 550,
  },
];

export function getDailyPuzzle(): Puzzle {
  const dayIndex = Math.floor(Date.now() / 86400000) % DAILY_PUZZLES.length;
  return DAILY_PUZZLES[dayIndex]!;
}

export function getRandomPuzzle(excludeId?: string): Puzzle {
  const pool = excludeId ? DAILY_PUZZLES.filter((p) => p.id !== excludeId) : DAILY_PUZZLES;
  return pool[Math.floor(Math.random() * pool.length)]!;
}

export const ACHIEVEMENTS = [
  { id: "first-win", name: "First Victory", description: "Win your first game", icon: "emoji_events" },
  { id: "streak-5", name: "Hot Streak", description: "Win 5 games in a row", icon: "local_fire_department" },
  { id: "streak-10", name: "Unstoppable", description: "Win 10 games in a row", icon: "whatshot" },
  { id: "puzzle-master", name: "Puzzle Master", description: "Solve 10 daily puzzles", icon: "extension" },
  { id: "tournament-join", name: "Competitor", description: "Join a tournament", icon: "emoji_events" },
  { id: "gm-slayer", name: "Giant Slayer", description: "Beat the Grandmaster AI", icon: "diamond" },
  { id: "century", name: "Centurion", description: "Play 100 games", icon: "military_tech" },
  { id: "iron-defense", name: "Iron Defense", description: "Draw against 2000+ ELO", icon: "shield" },
];
