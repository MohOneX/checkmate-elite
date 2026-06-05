export type TimeControlType = "bullet" | "blitz" | "rapid" | "unlimited";

export interface TimeControl {
  label: string;
  type: TimeControlType;
  initialMs: number;
  incrementMs: number;
}

export const TIME_CONTROLS: TimeControl[] = [
  { label: "1 min Bullet", type: "bullet", initialMs: 60_000, incrementMs: 0 },
  { label: "3 min Blitz", type: "blitz", initialMs: 180_000, incrementMs: 0 },
  { label: "3+2 Blitz", type: "blitz", initialMs: 180_000, incrementMs: 2_000 },
  { label: "5 min Blitz", type: "blitz", initialMs: 300_000, incrementMs: 0 },
  { label: "10 min Rapid", type: "rapid", initialMs: 600_000, incrementMs: 0 },
  { label: "10+5 Rapid", type: "rapid", initialMs: 600_000, incrementMs: 5_000 },
  { label: "Unlimited", type: "unlimited", initialMs: 0, incrementMs: 0 },
];

export interface AiPersonality {
  id: string;
  name: string;
  elo: number;
  description: string;
  tags: string[];
  icon: string;
  image: string;
  isGrandmaster?: boolean;
}

export const AI_PERSONALITIES: AiPersonality[] = [
  {
    id: "professor",
    name: "The Professor",
    elo: 1200,
    description:
      "A methodical, classical player. Excellent for practicing fundamentals and standard openings.",
    tags: ["Solid", "Positional"],
    icon: "psychology",
    image: "/ai/ai-professor.png",
  },
  {
    id: "blitz-bot",
    name: "Blitz Bot",
    elo: 1800,
    description:
      "Aggressive and unpredictable. Prefers sharp tactical lines and thrives in chaotic positions.",
    tags: ["Aggressive", "Tactical"],
    icon: "bolt",
    image: "/ai/ai-blitz-bot.png",
  },
  {
    id: "grandmaster-ai",
    name: "Grandmaster AI",
    elo: 2800,
    description:
      "The ultimate test. Flawless calculation, deep positional understanding, and relentless endgame technique.",
    tags: ["Universal", "Uncompromising"],
    icon: "diamond",
    image: "/ai/ai-grandmaster.png",
    isGrandmaster: true,
  },
];

export const BOARD_THEMES = {
  classic: { light: "#EBECD0", dark: "#779556", name: "Classic Green" },
  blue: { light: "#DEE3E6", dark: "#8CA2AD", name: "Blue" },
  brown: { light: "#F0D9B5", dark: "#B58863", name: "Brown" },
} as const;

export type BoardThemeKey = keyof typeof BOARD_THEMES;

export const NAV_ITEMS = [
  { path: "/", label: "Dashboard", icon: "dashboard" },
  { path: "/play", label: "Play Now", icon: "extension" },
  { path: "/analytics", label: "Analytics", icon: "analytics" },
  { path: "/tournaments", label: "Tournaments", icon: "emoji_events" },
  { path: "/leaderboard", label: "Leaderboard", icon: "leaderboard" },
] as const;

export const TITLE_THRESHOLDS = [
  { min: 2500, title: "GM" },
  { min: 2400, title: "IM" },
  { min: 2200, title: "FM" },
  { min: 2000, title: "CM" },
] as const;
