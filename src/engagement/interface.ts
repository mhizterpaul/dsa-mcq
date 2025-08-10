// Data Entities
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

export class Notification {
  id: string;
  userId: string;
  message: string;
  type: 'reminder' | 'nudge';
  isRead: boolean;
  createdAt: number;
  sendAt: number;

  constructor(id: string, userId: string, message: string, type: 'reminder' | 'nudge', sendAt: number) {
    this.id = id;
    this.userId = userId;
    this.message = message;
    this.type = type;
    this.isRead = false;
    this.createdAt = Date.now();
    this.sendAt = sendAt;
  }

  markAsRead() {
    this.isRead = true;
  }
}

// Component Contract
export class EngagementComponent {
    loadGamificationState() {
        console.log("Loading gamification state...");
    }

    scheduleReminders() {
        console.log("Scheduling reminders...");
    }

    renderLeaderboard() {
        console.log("Rendering leaderboard...");
    }

    renderAchievements() {
        console.log("Rendering achievements...");
    }
}
