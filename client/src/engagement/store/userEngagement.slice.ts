import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { UserEngagement } from './primitives/UserEngagement';
import * as engagementService from '../services/engagementService';
import { AppDispatch, RootState } from '../../mediator/store/store';
import { addNotification } from './notification.slice';

interface UserEngagementState {
  engagements: { [userId: string]: UserEngagement };
  ui: {
    showLeaderboardChange: boolean;
    showXpMilestone: boolean;
    showStreakMilestone: boolean;
  };
}

const initialState: UserEngagementState = {
  engagements: {},
  ui: {
    showLeaderboardChange: false,
    showXpMilestone: false,
    showStreakMilestone: false,
  },
};

export const scheduleReminderForUser = createAsyncThunk(
    'userEngagement/scheduleReminder',
    async ({ userId, nextSessionTime, leadTime }: { userId: string, nextSessionTime: number, leadTime: number }, { dispatch }) => {
        engagementService.scheduleReminder(dispatch as AppDispatch, userId, nextSessionTime, leadTime);
    }
);

export const checkAndSendNudge = createAsyncThunk(
    'userEngagement/checkAndSendNudge',
    async (userId: string, { getState, dispatch }) => {
        const state = getState() as RootState;
        const userEngagement = state.engagement.userEngagement.engagements[userId];
        if (userEngagement) {
            const nudge = engagementService.generateNudgeForMissedSession(userEngagement);
            if (nudge) {
                dispatch(addNotification({ id: `nudge-${userId}-${Date.now()}`, userId, ...nudge, sendAt: Date.now() }));
            }
        }
    }
);

export const checkForMilestones = createAsyncThunk(
    'userEngagement/checkForMilestones',
    async (userId: string, { getState, dispatch }) => {
        const state = getState() as RootState;
        const userEngagement = state.engagement.userEngagement.engagements[userId];
        if (userEngagement) {
            if (engagementService.checkXpMilestone(userEngagement)) {
                dispatch(userEngagementSlice.actions.setShowXpMilestone(true));
            }
            if (engagementService.checkStreakMilestone(userEngagement)) {
                dispatch(userEngagementSlice.actions.setShowStreakMilestone(true));
            }
        }
    }
);

export const updateLeaderboardRankAndCheckForUIUpdate = createAsyncThunk(
    'userEngagement/updateLeaderboardRankAndCheckForUIUpdate',
    async ({ userId, newRank }: { userId: string, newRank: number }, { getState, dispatch }) => {
        const state = getState() as RootState;
        const currentRank = state.engagement.userEngagement.engagements[userId]?.leaderboard_rank;

        dispatch(userEngagementSlice.actions.updateLeaderboardRank({ userId, newRank }));

        if (currentRank !== undefined && currentRank !== newRank) {
            dispatch(userEngagementSlice.actions.setShowLeaderboardChange(true));
        }
    }
);

const userEngagementSlice = createSlice({
  name: 'userEngagement',
  initialState,
  reducers: {
    setUserEngagement: (state, action: PayloadAction<{ userId: string }>) => {
      const { userId } = action.payload;
      const newUserEngagement = new UserEngagement(userId);
      state.engagements[userId] = { ...newUserEngagement };
    },
    updateStreak: (state, action: PayloadAction<{ userId: string; didAttend: boolean }>) => {
      const { userId, didAttend } = action.payload;
      const existingData = state.engagements[userId];
      if (existingData) {
        const engagementInstance = Object.assign(new UserEngagement(userId), existingData);
        engagementInstance.updateStreak(didAttend);
        state.engagements[userId] = { ...engagementInstance };
      }
    },
    addXp: (state, action: PayloadAction<{ userId: string; points: number }>) => {
        const { userId, points } = action.payload;
        const existingData = state.engagements[userId];
        if (existingData) {
          const engagementInstance = Object.assign(new UserEngagement(userId), existingData);
          engagementInstance.addXp(points);
          state.engagements[userId] = { ...engagementInstance };
        }
    },
    updateSessionAttendance: (state, action: PayloadAction<{ userId: string; attended: boolean }>) => {
        const { userId, attended } = action.payload;
        const existingData = state.engagements[userId];
        if (existingData) {
          const engagementInstance = Object.assign(new UserEngagement(userId), existingData);
          engagementInstance.updateSessionAttendance(attended);
          state.engagements[userId] = { ...engagementInstance };
        }
    },
    updateResponseLatency: (state, action: PayloadAction<{ userId: string; latency: number }>) => {
        const { userId, latency } = action.payload;
        const existingData = state.engagements[userId];
        if (existingData) {
          const engagementInstance = Object.assign(new UserEngagement(userId), existingData);
          engagementInstance.updateResponseLatency(latency);
          state.engagements[userId] = { ...engagementInstance };
        }
    },
    updateLeaderboardRank: (state, action: PayloadAction<{ userId: string; newRank: number }>) => {
        const { userId, newRank } = action.payload;
        const existingData = state.engagements[userId];
        if (existingData) {
            const engagementInstance = Object.assign(new UserEngagement(userId), existingData);
            engagementInstance.updateLeaderboardRank(newRank);
            state.engagements[userId] = { ...engagementInstance };
        }
    },
    setShowLeaderboardChange: (state, action: PayloadAction<boolean>) => {
        state.ui.showLeaderboardChange = action.payload;
    },
    setShowXpMilestone: (state, action: PayloadAction<boolean>) => {
        state.ui.showXpMilestone = action.payload;
    },
    setShowStreakMilestone: (state, action: PayloadAction<boolean>) => {
        state.ui.showStreakMilestone = action.payload;
    },
  },
});

export const {
  setUserEngagement,
  updateStreak,
  addXp,
  updateSessionAttendance,
  updateResponseLatency,
  updateLeaderboardRank,
  setShowLeaderboardChange,
  setShowXpMilestone,
  setShowStreakMilestone,
} = userEngagementSlice.actions;

export default userEngagementSlice.reducer;
