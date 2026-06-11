import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export type Message = {
  role: 'user' | 'bot' | 'error';
  text: string;
};

export interface SendMessageArgs {
  message: string;
  assistantName: string;
  githubLink?: string;
  files?: File[];
}

export const sendMessageToBot = createAsyncThunk<
  string,
  SendMessageArgs,
  { rejectValue: string }
>(
  'chat/sendMessageToBot',
  async (args, { rejectWithValue }) => {
    const base = import.meta.env.VITE_API_URL ?? '';
    const url  = `${base}/api/bot/`;

    try {
      const formData = new FormData();
      formData.append('message', args.message);
      // On peut ajouter le nom de l'assistant pour le backend si besoin
      formData.append('assistant', args.assistantName);
      
      if (args.githubLink) {
        formData.append('github', args.githubLink);
      }
      
      if (args.files && args.files.length > 0) {
        args.files.forEach(f => {
          formData.append('images', f);
        });
      }

      const res = await fetch(url, {
        method:  'POST',
        body:    formData, // fetch mettra automatiquement le bon Content-Type multipart/form-data
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg = data?.error ?? data?.detail ?? `Erreur serveur (${res.status})`;
        return rejectWithValue(msg);
      }

      const botText = data?.response;
      if (!botText) {
        return rejectWithValue('Réponse vide reçue du serveur.');
      }

      return botText as string;

    } catch (err: any) {
      return rejectWithValue(
        err?.message ?? 'Impossible de joindre le serveur. Vérifiez votre connexion.'
      );
    }
  }
);

interface ChatState {
  messagesByAssistant: Record<string, Message[]>;
  pendingUser:         string | null;
  status:              'idle' | 'loading' | 'succeeded' | 'failed';
  error:               string | null;
}

const initialState: ChatState = {
  messagesByAssistant: {},
  pendingUser:         null,
  status:              'idle',
  error:               null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    clearError(state) {
      state.error  = null;
      state.status = 'idle';
    },
    clearMessages(state, action: { payload: string }) {
      // payload = assistantName
      state.messagesByAssistant[action.payload] = [];
      state.pendingUser = null;
      state.status      = 'idle';
      state.error       = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendMessageToBot.pending, (state, action) => {
        state.status      = 'loading';
        state.error       = null;
        const { assistantName, message, githubLink, files } = action.meta.arg;
        
        let textToShow = message;
        if (githubLink) textToShow += `\n\n🔗 ${githubLink}`;
        if (files && files.length > 0) textToShow += `\n\n📎 ${files.length} fichier(s) joint(s)`;

        state.pendingUser = textToShow;
        
        if (!state.messagesByAssistant[assistantName]) {
          state.messagesByAssistant[assistantName] = [];
        }
        state.messagesByAssistant[assistantName].push({ role: 'user', text: textToShow });
      })
      .addCase(sendMessageToBot.fulfilled, (state, action) => {
        state.status      = 'succeeded';
        state.pendingUser = null;
        const { assistantName } = action.meta.arg;
        if (!state.messagesByAssistant[assistantName]) {
          state.messagesByAssistant[assistantName] = [];
        }
        state.messagesByAssistant[assistantName].push({ role: 'bot', text: action.payload });
      })
      .addCase(sendMessageToBot.rejected, (state, action) => {
        state.status      = 'failed';
        state.pendingUser = null;
        const { assistantName } = action.meta.arg;
        const errMsg = action.payload ?? action.error.message ?? 'Une erreur est survenue.';
        state.error  = errMsg;
        
        if (!state.messagesByAssistant[assistantName]) {
          state.messagesByAssistant[assistantName] = [];
        }
        state.messagesByAssistant[assistantName].push({
          role: 'error',
          text: `⚠️ ${errMsg}`,
        });
      });
  },
});

export const { clearError, clearMessages } = chatSlice.actions;
export default chatSlice.reducer;
