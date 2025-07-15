import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

type Message = {
    role: 'user' | 'bot';
    text: string;
};

// Appel API Wagan
export const sendMessageToBot = createAsyncThunk(
    'chat/sendMessageToBot',
    async (userMessage: string) => {
        const response = await fetch('https://api-wagan.bakeli.tech/api/bot/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: userMessage }),
        });

        const data = await response.json();
        return { userMessage, botResponse: data.response };
    }
);

const chatSlice = createSlice({
    name: 'chat',
    initialState: {
        messages: [] as Message[],
        status: 'idle',
        error: null as string | null | undefined,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(sendMessageToBot.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(sendMessageToBot.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.messages.push({ role: 'user', text: action.payload.userMessage });
                state.messages.push({ role: 'bot', text: action.payload.botResponse });
            })
            .addCase(sendMessageToBot.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            });
    },
});

export default chatSlice.reducer;