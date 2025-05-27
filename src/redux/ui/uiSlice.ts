// src/redux/ui/uiSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
    isDrawerOpen: boolean;
}

const initialState: UiState = {
    isDrawerOpen: false,
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        setDrawerOpen: (state, action: PayloadAction<boolean>) => {
            state.isDrawerOpen = action.payload;
        },
    },
});

export const { setDrawerOpen } = uiSlice.actions;
export default uiSlice.reducer;