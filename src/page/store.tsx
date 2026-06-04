// store.ts
import { configureStore } from '@reduxjs/toolkit';
import chatReducer from './chat/chatSlice';
import themeReducer from './chat/darkModeSlice';
import assistantReducer from './chat/assistantSlice.ts';
import authReducer from './auth/authSlice.ts';

export const store = configureStore({
  reducer: {
    chat: chatReducer,
    theme: themeReducer,
    assistant: assistantReducer,
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;