import {
  createSlice,
  createEntityAdapter,
  PayloadAction,
  createAsyncThunk,
  Update,
} from '@reduxjs/toolkit';
import { Notification } from './primitives/Notification';
import { sqliteService } from '../../common/services/sqliteService';

// --- ENTITY ADAPTER ---
const notificationsAdapter = createEntityAdapter<Notification>({
  selectId: (notification) => notification.id,
});

// --- ASYNC THUNKS ---

export const hydrateNotifications = createAsyncThunk<Notification[]>(
  'notifications/hydrate',
  async () => {
    const notifications = await sqliteService.getAll('notifications');
    // The data from DB is plain object, we can cast it if structure matches
    return notifications as Notification[];
  },
);

export const addNotificationDb = createAsyncThunk<
  Notification,
  { id: string; userId: string; message: string; type: 'reminder' | 'nudge'; sendAt: number }
>('notifications/add', async (notificationData) => {
  const newNotification = new Notification(
    notificationData.id,
    notificationData.userId,
    notificationData.message,
    notificationData.type,
    notificationData.sendAt,
  );
  const notifToSave = { ...newNotification, is_dirty: 1 };
  await sqliteService.create('notifications', notifToSave);
  return newNotification;
});

export const markAsReadDb = createAsyncThunk<Update<Notification>, string>(
  'notifications/markAsRead',
  async (notificationId) => {
    const update = { id: notificationId, changes: { isRead: 1, is_dirty: 1 } };
    await sqliteService.update('notifications', notificationId, update.changes);
    return update;
  },
);

export const removeNotificationDb = createAsyncThunk<string, string>(
  'notifications/remove',
  async (notificationId) => {
    await sqliteService.delete('notifications', notificationId);
    return notificationId;
  },
);


// --- SLICE DEFINITION ---
const notificationSlice = createSlice({
  name: 'notifications',
  initialState: notificationsAdapter.getInitialState({
    hasNewNotifications: false,
  }),
  reducers: {
    setHasNewNotifications: (state, action: PayloadAction<boolean>) => {
      state.hasNewNotifications = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(hydrateNotifications.fulfilled, (state, action: PayloadAction<Notification[]>) => {
        notificationsAdapter.setAll(state, action.payload);
        state.hasNewNotifications = action.payload.some(n => !n.isRead);
      })
      .addCase(addNotificationDb.fulfilled, (state, action: PayloadAction<Notification>) => {
        notificationsAdapter.addOne(state, action.payload);
        state.hasNewNotifications = true;
      })
      .addCase(markAsReadDb.fulfilled, (state, action: PayloadAction<Update<Notification>>) => {
        notificationsAdapter.updateOne(state, action.payload);
        const notifications = Object.values(state.entities);
        state.hasNewNotifications = notifications.some(n => !n.isRead);
      })
      .addCase(removeNotificationDb.fulfilled, (state, action: PayloadAction<string>) => {
        notificationsAdapter.removeOne(state, action.payload);
        const notifications = Object.values(state.entities);
        state.hasNewNotifications = notifications.some(n => !n.isRead);
      });
  },
});

export const { setHasNewNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;
