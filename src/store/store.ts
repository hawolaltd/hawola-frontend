import { combineReducers, configureStore } from '@reduxjs/toolkit';
import authReducer from '@/redux/auth/authSlice';
import generalReducer from '@/redux/general/generalSlice';
import customerServiceReducer from '@/redux/product/customerServiceSlice';
import inventoryReducer from '@/redux/product/inventorySlice';
import productReducer from '@/redux/product/productSlice';
import disputeReducer from '@/redux/disputes/disputeSlice';
import uiReducer from '@/redux/ui/uiSlice';
import searchReducer from '@/redux/search/searchSlice';
import {
    FLUSH,
    PAUSE,
    PERSIST,
    persistReducer,
    persistStore,
    PURGE,
    REGISTER,
    REHYDRATE,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { createWrapper } from 'next-redux-wrapper';

const persistConfig = {
    key: 'root',
    storage,
    whitelist: [
        'auth',
        'general',
        'analytics',
        'customerService',
        'inventory',
        'products',
        'disputes',
        'search',
    ],
};

// Combine reducers
const rootReducer = combineReducers({
    auth: authReducer,
    general: generalReducer,
    customerService: customerServiceReducer,
    inventory: inventoryReducer,
    products: productReducer,
    disputes: disputeReducer,
    ui: uiReducer,
    search: searchReducer,
});

const appReducer = (state: any, action: any) => {
    if (
        action.type === 'auth/logout/fulfilled' ||
        action.type === 'auth/logout'
    ) {
        // Preserve anonymous user's cart before clearing
        let cartItems = null;
        if (typeof window !== 'undefined') {
            cartItems = localStorage.getItem('cartItems');
        }

        // Clear all persisted state
        storage.removeItem('persist:root');

        // Restore cart items for anonymous user
        if (cartItems && typeof window !== 'undefined') {
            localStorage.setItem('cartItems', cartItems);
        }

        // Return initial state for all reducers
        return rootReducer(undefined, action);
    }
    return rootReducer(state, action);
};

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, appReducer);

// Configure the store with the persisted reducer
export const store = configureStore({
    reducer: persistedReducer,
    devTools: process.env.NODE_ENV !== 'production',
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [
                    FLUSH,
                    REHYDRATE,
                    PAUSE,
                    PERSIST,
                    PURGE,
                    REGISTER,
                ],
            },
        }),
});

// Create persistor for persisted store
export const persistor = persistStore(store);

// Types for RootState and AppDispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const wrapper = createWrapper(() => store);
