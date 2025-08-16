import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { GameMode } from './primitives/GameMode';

interface GameModesState {
    modes: GameMode[];
}

const initialState: GameModesState = {
    modes: [
        { id: '1', name: 'Create Quiz', icon: 'plus', color: '#FF7A3C' },
        { id: '2', name: 'Solo Mode', icon: 'account', color: '#7B61FF' },
    ],
};

const gameModesSlice = createSlice({
    name: 'gameModes',
    initialState,
    reducers: {},
});

export default gameModesSlice.reducer;
