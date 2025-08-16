import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AdState {
  title: string;
  buttonText: string;
  icon: string;
}

const initialState: AdState = {
  title: 'SPIN AND GET\nMORE REWARDS',
  buttonText: 'Spin Now',
  icon: 'cash-multiple',
};

const adSlice = createSlice({
  name: 'ad',
  initialState,
  reducers: {
    setAd: (state, action: PayloadAction<AdState>) => {
        state.title = action.payload.title;
        state.buttonText = action.payload.buttonText;
        state.icon = action.payload.icon;
    },
  },
});

export const { setAd } = adSlice.actions;
export default adSlice.reducer;
