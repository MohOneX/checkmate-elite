const K = 32;

export function expectedScore(playerElo: number, opponentElo: number): number {
  return 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));
}

export function calculateEloChange(
  playerElo: number,
  opponentElo: number,
  score: 0 | 0.5 | 1,
  k = K,
): number {
  const expected = expectedScore(playerElo, opponentElo);
  return Math.round(k * (score - expected));
}

export function getTitleForElo(elo: number): string | null {
  if (elo >= 2500) return "GM";
  if (elo >= 2400) return "IM";
  if (elo >= 2200) return "FM";
  if (elo >= 2000) return "CM";
  return null;
}

export function eloToEngineParams(elo: number): { depth: number; movetime: number; skillLevel: number } {
  const clamped = Math.max(800, Math.min(3200, elo));
  const normalized = (clamped - 800) / 2400;
  return {
    depth: Math.round(4 + normalized * 14),
    movetime: Math.round(300 + normalized * 4700),
    skillLevel: Math.round(normalized * 20),
  };
}
