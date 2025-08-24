import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Ad } from './primitives/Ad';

interface AdState {
  ads: { [id: string]: Ad };
  activeAdId: string | null;
}

const initialState: AdState = {
  ads: {},
  activeAdId: null,
};

const adSlice = createSlice({
  name: 'ad',
  initialState,
  reducers: {
    addAd: (state, action: PayloadAction<Ad>) => {
        state.ads[action.payload.id] = action.payload;
    },
    setActiveAd: (state, action: PayloadAction<string>) => {
        state.activeAdId = action.payload;
    },
  },
});

export const { addAd, setActiveAd } = adSlice.actions;
export default adSlice.reducer;
