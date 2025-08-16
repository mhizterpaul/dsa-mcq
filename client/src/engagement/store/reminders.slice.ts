import { createSlice, createEntityAdapter, PayloadAction } from '@reduxjs/toolkit';
import { Reminder } from './primitives/Reminder';

const remindersAdapter = createEntityAdapter<Reminder>();

const remindersSlice = createSlice({
  name: 'reminders',
  initialState: remindersAdapter.getInitialState(),
  reducers: {
    addReminder: remindersAdapter.addOne,
    removeReminder: remindersAdapter.removeOne,
  },
});

export const { addReminder, removeReminder } = remindersSlice.actions;

export default remindersSlice.reducer;
