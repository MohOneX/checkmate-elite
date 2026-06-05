import type { SavedGame, TimeControlType } from "@/types";
import { formatDate } from "@/lib/utils";

export interface RatingHistoryPoint {
  date: string;
  shortDate: string;
  rating: number;
  change: number;
  gameLabel: string;
}

function formatShortDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function buildRatingHistory(
  games: SavedGame[],
  currentRating: number,
  timeControl: TimeControlType = "blitz",
  limit = 10,
): RatingHistoryPoint[] {
  const recent = games.filter((g) => g.timeControl === timeControl).slice(0, limit).reverse();

  if (recent.length === 0) return [];

  const totalChange = recent.reduce((sum, g) => sum + g.ratingChange, 0);
  let rating = currentRating - totalChange;

  return recent.map((g, index) => {
    rating += g.ratingChange;
    return {
      date: g.playedAt,
      shortDate: formatShortDate(g.playedAt),
      rating,
      change: g.ratingChange,
      gameLabel: `Game ${index + 1}`,
    };
  });
}

export function formatRatingChange(change: number): string {
  return `${change > 0 ? "+" : ""}${change}`;
}

export function formatRatingTooltipDate(date: string): string {
  return formatDate(date);
}
