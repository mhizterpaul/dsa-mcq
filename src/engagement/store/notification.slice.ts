import { createSlice, createEntityAdapter, PayloadAction } from '@reduxjs/toolkit';
import { Notification } from '../interface';

const notificationsAdapter = createEntityAdapter<Notification>({
  selectId: (notification) => notification.id,
});

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: notificationsAdapter.getInitialState(),
  reducers: {
    addNotification: notificationsAdapter.addOne,
    addNotifications: notificationsAdapter.addMany,
    updateNotification: notificationsAdapter.updateOne,
    removeNotification: notificationsAdapter.removeOne,
    setNotifications: notificationsAdapter.setAll,
  },
});

export const {
  addNotification,
  addNotifications,
  updateNotification,
  removeNotification,
  setNotifications,
} = notificationSlice.actions;

export default notificationSlice.reducer;
