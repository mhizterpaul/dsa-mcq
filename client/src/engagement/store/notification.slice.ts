import { createSlice, createEntityAdapter, PayloadAction } from '@reduxjs/toolkit';
import { Notification } from '../interface';

const notificationsAdapter = createEntityAdapter<Notification>({
  selectId: (notification) => notification.id,
});

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: notificationsAdapter.getInitialState(),
  reducers: {
    addNotification: (state, action: PayloadAction<{ id: string; userId: string; message: string; type: 'reminder' | 'nudge'; sendAt: number }>) => {
      const { id, userId, message, type, sendAt } = action.payload;
      const newNotification = new Notification(id, userId, message, type, sendAt);
      notificationsAdapter.addOne(state, { ...newNotification });
    },
    markAsRead: (state, action: PayloadAction<{ id: string }>) => {
      const { id } = action.payload;
      const existingNotification = state.entities[id];
      if (existingNotification) {
        const notificationInstance = Object.assign(new Notification(existingNotification.id, existingNotification.userId, existingNotification.message, existingNotification.type, existingNotification.sendAt), existingNotification);
        notificationInstance.markAsRead();
        notificationsAdapter.updateOne(state, { id, changes: { ...notificationInstance } });
      }
    },
    removeNotification: notificationsAdapter.removeOne,
  },
});

export const {
  addNotification,
  markAsRead,
  removeNotification,
} = notificationSlice.actions;

export default notificationSlice.reducer;
