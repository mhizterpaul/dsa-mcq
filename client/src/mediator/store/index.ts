import { configureStore } from '@reduxjs/toolkit';
import SharedReducer from './sharedState.slice';

const store = configureStore({
  reducer: {
    shared: SharedReducer,
  },
});

export type UserRootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
