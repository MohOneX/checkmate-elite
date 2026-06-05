export type TimeControlType = "bullet" | "blitz" | "rapid" | "unlimited";

export interface UserProfile {
  id: string;
  username: string;
  avatarUrl: string | null;
  title: string | null;
  ratings: Record<TimeControlType, number>;
  wins: number;
  losses: number;
  draws: number;
  streak: number;
  bestStreak: number;
  achievements: string[];
  createdAt: string;
}

export interface SavedGame {
  id: string;
  pgn: string;
  white: string;
  black: string;
  result: "1-0" | "0-1" | "1/2-1/2" | "*";
  timeControl: TimeControlType;
  playerColor: "w" | "b";
  opponentElo: number;
  ratingChange: number;
  playedAt: string;
  opening?: string;
}

export interface LeaderboardEntry {
  rank: number;
  id: string;
  username: string;
  country: string;
  elo: number;
  winRate: number;
  title: string | null;
  isLocalUser?: boolean;
}

export interface Tournament {
  id: string;
  name: string;
  status: "live" | "upcoming" | "past";
  format: string;
  players: number;
  prizePool: string;
  startDate: string;
  timeControl: TimeControlType;
  featured?: boolean;
}

export interface TournamentStanding {
  rank: number;
  username: string;
  score: number;
  tiebreak: number;
}

export interface MatchmakingStatus {
  status: "offline_only" | "searching" | "matched" | "error";
  message: string;
  opponent?: { username: string; elo: number };
}

export interface Puzzle {
  id: string;
  fen: string;
  solution: string[];
  description: string;
  rating: number;
}

export interface AppSettings {
  boardTheme: "classic" | "blue" | "brown";
  showLegalMoves: boolean;
  confirmMoves: boolean;
  autoQueenPromotion: boolean;
  moveSounds: boolean;
  defaultIncrement: number;
  lowTimeWarningMs: number;
  defaultAiElo: number;
  analysisDepth: number;
  language: string;
}

export interface EvalPoint {
  move: number;
  eval: number;
  san: string;
}
