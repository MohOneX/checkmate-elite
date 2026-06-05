import type {
  LeaderboardEntry,
  MatchmakingStatus,
  SavedGame,
  TimeControlType,
  Tournament,
  TournamentStanding,
  UserProfile,
} from "@/types";

export interface ApiClient {
  getLeaderboard(timeControl: TimeControlType, localUser?: UserProfile): Promise<LeaderboardEntry[]>;
  getTournaments(status?: Tournament["status"]): Promise<Tournament[]>;
  getTournamentStandings(tournamentId: string): Promise<TournamentStanding[]>;
  joinTournament(tournamentId: string): Promise<{ success: boolean; message: string }>;
  matchmake(timeControl: TimeControlType): Promise<MatchmakingStatus>;
  getOnlineFriends(): Promise<{ username: string; status: string }[]>;
}

export class MockApiClient implements ApiClient {
  async getLeaderboard(
    _timeControl: TimeControlType,
    _localUser?: UserProfile,
  ): Promise<LeaderboardEntry[]> {
    return [];
  }

  async getTournaments(_status?: Tournament["status"]): Promise<Tournament[]> {
    return [];
  }

  async getTournamentStandings(_tournamentId: string): Promise<TournamentStanding[]> {
    return [];
  }

  async joinTournament(_tournamentId: string): Promise<{ success: boolean; message: string }> {
    return {
      success: false,
      message: "Online tournaments are not available yet.",
    };
  }

  async matchmake(_timeControl: TimeControlType): Promise<MatchmakingStatus> {
    return {
      status: "offline_only",
      message: "Online matchmaking coming soon. Play vs AI or local 2-player for now.",
    };
  }

  async getOnlineFriends(): Promise<{ username: string; status: string }[]> {
    return [];
  }
}

export class HttpApiClient implements ApiClient {
  async getLeaderboard(_timeControl: TimeControlType, _localUser?: UserProfile): Promise<LeaderboardEntry[]> {
    throw new Error("Online API not configured");
  }
  async getTournaments(_status?: Tournament["status"]): Promise<Tournament[]> {
    throw new Error("Online API not configured");
  }
  async getTournamentStandings(_tournamentId: string): Promise<TournamentStanding[]> {
    throw new Error("Online API not configured");
  }
  async joinTournament(_tournamentId: string): Promise<{ success: boolean; message: string }> {
    throw new Error("Online API not configured");
  }
  async matchmake(_timeControl: TimeControlType): Promise<MatchmakingStatus> {
    throw new Error("Online API not configured");
  }
  async getOnlineFriends(): Promise<{ username: string; status: string }[]> {
    throw new Error("Online API not configured");
  }
}

export const isOnlineConnected = () => Boolean(import.meta.env.VITE_API_URL);

export const apiClient: ApiClient = isOnlineConnected()
  ? new HttpApiClient()
  : new MockApiClient();

export type { SavedGame };
