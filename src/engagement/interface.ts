export interface UserEngagement {
  userId: string;
  session_attendance: number;
  streak_length: number;
  response_latency: number;
  xp_progress: number;
  leaderboard_rank: number;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: 'reminder' | 'nudge';
  isRead: boolean;
  createdAt: number;
  sendAt: number;
}
