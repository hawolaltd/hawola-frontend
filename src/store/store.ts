import { combineReducers, configureStore } from '@reduxjs/toolkit';
import authReducer from '@/redux/auth/authSlice';
import productsReducer from '@/redux/product/productSlice';
import generalReducer from '@/redux/general/generalSlice';
import {FLUSH, PAUSE, PERSIST, persistReducer, persistStore, PURGE, REGISTER, REHYDRATE} from 'redux-persist';
import storage from 'redux-persist/lib/storage';

const persistConfig = {
    key: 'root',
    storage,
};

// Combine reducers
const rootReducer = combineReducers({
    auth: authReducer,
    products: productsReducer,
    general: generalReducer,
});


const appReducer = (state: any, action: any) => {
    if (action.type === 'auth/logout') {
        // Clear all persisted state
        storage.removeItem('persist:root');
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
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
});

// Create persistor for persisted store
export const persistor = persistStore(store);

// Types for RootState and AppDispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
