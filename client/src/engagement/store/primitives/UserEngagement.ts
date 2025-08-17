export interface Achievement {
    id: string;
    name: string;
    description: string;
    achieved: boolean;
    unlockCriteria: string;
    imagePath: string;
    createdAt: number;
    updatedAt: number;
}

export interface Reminder {
    id: string;
    text: string;
    time: string;
    createdAt: number;
    updatedAt: number;
}

export class UserEngagement {
  userId: string;
  createdAt: number;
  updatedAt: number;
  session_attendance: number;
  streak_length: number;
  response_latency: number;
  xp_progress: number;
  leaderboard_rank: number;
  last_session_timestamp: number | null;
  achievements: Achievement[];
  motivation: string;
  reminders: Reminder[];
  preferredPlayTime: string; // "HH:mm"
  xp_milestone: string;
  streak_milestone: string;

  constructor(userId: string) {
    this.userId = userId;
    this.createdAt = Date.now();
    this.updatedAt = Date.now();
    this.session_attendance = 0;
    this.streak_length = 0;
    this.response_latency = 0;
    this.xp_progress = 0;

    this.leaderboard_rank = 0;
    this.last_session_timestamp = null;
    this.achievements = [];
    this.motivation = '';
    this.reminders = [];
    this.preferredPlayTime = ''; // Default to noon
    this.xp_milestone = '';
    this.streak_milestone = '';
  }

  updateStreak(didAttend: boolean) {
    if (didAttend) {
      this.streak_length++;
    } else {
      this.streak_length = 0;
    }
    this.last_session_timestamp = Date.now();
    this.updatedAt = Date.now();
  }

  addXp(points: number) {
    this.xp_progress += points;
    this.updatedAt = Date.now();
  }

  updateSessionAttendance(attended: boolean) {
    // This is a simplified implementation. A real one would use a rolling window.
    if (attended) {
        this.session_attendance = Math.min(1, this.session_attendance + 0.1);
    } else {
        this.session_attendance = Math.max(0, this.session_attendance - 0.1);
    }
    this.updatedAt = Date.now();
  }

  updateResponseLatency(latency: number) {
    // Simple average for now.
    this.response_latency = (this.response_latency + latency) / 2;
    this.updatedAt = Date.now();
  }

  updateLeaderboardRank(newRank: number) {
    this.leaderboard_rank = newRank;
    this.updatedAt = Date.now();
  }
}
