import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ScreenVisit {
  screen: string;
  startTime: number;
  duration: number;
}

export interface UsageAnalyticsState {
  currentScreen: string | null;
  currentScreenStartTime: number;
  visitedScreens: ScreenVisit[];
  interactionHeatMap: Record<string, number>;
}

const initialState: UsageAnalyticsState = {
  currentScreen: null,
  currentScreenStartTime: 0,
  visitedScreens: [],
  interactionHeatMap: {},
};

const usageAnalyticsSlice = createSlice({
  name: 'usageAnalytics',
  initialState,
  reducers: {
    recordScreenVisit: (state, action: PayloadAction<string>) => {
      const now = Date.now();
      if (state.currentScreen) {
        const duration = now - state.currentScreenStartTime;
        state.visitedScreens.push({
          screen: state.currentScreen,
          startTime: state.currentScreenStartTime,
          duration,
        });
      }
      state.currentScreen = action.payload;
      state.currentScreenStartTime = now;
    },
    recordInteraction: (state, action: PayloadAction<string>) => {
      const componentId = action.payload;
      state.interactionHeatMap[componentId] = (state.interactionHeatMap[componentId] || 0) + 1;
    },
    resetUsageAnalytics: (state) => {
      state.currentScreen = null;
      state.currentScreenStartTime = 0;
      state.visitedScreens = [];
      state.interactionHeatMap = {};
    },
  },
});

export const { recordScreenVisit, recordInteraction, resetUsageAnalytics } = usageAnalyticsSlice.actions;
export default usageAnalyticsSlice.reducer;
