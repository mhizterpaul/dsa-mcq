import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { UserEngagement } from './primitives/UserEngagement';
import { sqliteService } from '../../common/services/sqliteService';

// --- STATE AND INITIAL STATE ---
interface UserEngagementState {
  engagements: { [userId: string]: UserEngagement };
  // UI state can remain as it is, not persisted.
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

// --- ASYNC THUNKS FOR DB OPERATIONS ---

export const hydrateUserEngagements = createAsyncThunk<UserEngagement[]>(
  'userEngagement/hydrate',
  async () => {
    const engagements = await sqliteService.getAll('user_engagement');
    return engagements as UserEngagement[];
  },
);

export const setUserEngagementDb = createAsyncThunk<UserEngagement, string>(
  'userEngagement/set',
  async (userId) => {
    let engagement = await sqliteService.getById('user_engagement', userId);
    if (!engagement) {
      engagement = new UserEngagement(userId);
      const engagementToSave = { ...engagement, is_dirty: 1 };
      await sqliteService.create('user_engagement', engagementToSave);
    }
    return engagement as UserEngagement;
  },
);

export const updateStreakDb = createAsyncThunk<
  UserEngagement,
  { userId: string; didAttend: boolean }
>('userEngagement/updateStreak', async ({ userId, didAttend }) => {
  const existingData = await sqliteService.getById('user_engagement', userId);
  const engagement = existingData
    ? Object.assign(new UserEngagement(userId), existingData)
    : new UserEngagement(userId);
  engagement.updateStreak(didAttend);
  await sqliteService.update('user_engagement', userId, { ...engagement, is_dirty: 1 });
  return engagement;
});

export const addXpDb = createAsyncThunk<UserEngagement, { userId: string; points: number }>(
  'userEngagement/addXp',
  async ({ userId, points }) => {
    const existingData = await sqliteService.getById('user_engagement', userId);
    const engagement = existingData
      ? Object.assign(new UserEngagement(userId), existingData)
      : new UserEngagement(userId);
    engagement.addXp(points);
    await sqliteService.update('user_engagement', userId, { ...engagement, is_dirty: 1 });
    return engagement;
  },
);

// ... other DB thunks for updateSessionAttendance, etc. can be added here following the same pattern ...


import { Achievement, Reminder } from './primitives/UserEngagement';

// --- SLICE DEFINITION ---
const userEngagementSlice = createSlice({
  name: 'userEngagement',
  initialState,
  reducers: {
    // UI-related reducers can stay here
    setShowLeaderboardChange: (state, action: PayloadAction<boolean>) => {
      state.ui.showLeaderboardChange = action.payload;
    },
    setShowXpMilestone: (state, action: PayloadAction<boolean>) => {
      state.ui.showXpMilestone = action.payload;
    },
    setShowStreakMilestone: (state, action: PayloadAction<boolean>) => {
      state.ui.showStreakMilestone = action.payload;
    },
    addAchievement: (state, action: PayloadAction<{ userId: string, achievement: Achievement }>) => {
        const { userId, achievement } = action.payload;
        if (state.engagements[userId]) {
            state.engagements[userId].achievements.push(achievement);
        }
    },
    setMotivation: (state, action: PayloadAction<{ userId: string, motivation: string }>) => {
        const { userId, motivation } = action.payload;
        if (state.engagements[userId]) {
            state.engagements[userId].motivation = motivation;
        }
    },
    addReminder: (state, action: PayloadAction<{ userId: string, reminder: Reminder }>) => {
        const { userId, reminder } = action.payload;
        if (state.engagements[userId]) {
            state.engagements[userId].reminders.push(reminder);
        }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(hydrateUserEngagements.fulfilled, (state, action) => {
        action.payload.forEach((engagement) => {
          state.engagements[engagement.userId] = engagement;
        });
      })
      .addCase(setUserEngagementDb.fulfilled, (state, action) => {
        const engagement = action.payload;
        state.engagements[engagement.userId] = engagement;
      })
      .addCase(updateStreakDb.fulfilled, (state, action) => {
        const engagement = action.payload;
        state.engagements[engagement.userId] = engagement;
      })
      .addCase(addXpDb.fulfilled, (state, action) => {
        const engagement = action.payload;
        state.engagements[engagement.userId] = engagement;
      });
      // Note: The other thunks like scheduleReminderForUser are not part of this slice's state,
      // so they don't need to be handled in extraReducers here. They dispatch actions to other slices.
  },
});

export const {
  setShowLeaderboardChange,
  setShowXpMilestone,
  setShowStreakMilestone,
  addAchievement,
  setMotivation,
  addReminder,
} = userEngagementSlice.actions;

export default userEngagementSlice.reducer;
