export class UserEngagement {
  userId: string;
  session_attendance: number;
  streak_length: number;
  response_latency: number;
  xp_progress: number;
  leaderboard_rank: number;

  constructor(userId: string) {
    this.userId = userId;
    this.session_attendance = 0;
    this.streak_length = 0;
    this.response_latency = 0;
    this.xp_progress = 0;
    this.leaderboard_rank = 0;
  }

  updateStreak(didAttend: boolean) {
    if (didAttend) {
      this.streak_length++;
    } else {
      this.streak_length = 0;
    }
  }

  addXp(points: number) {
    this.xp_progress += points;
  }
}
