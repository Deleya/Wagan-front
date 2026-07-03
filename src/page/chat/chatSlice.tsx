import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiUrl } from '../../config/api';

export type Message = {
  role: 'user' | 'bot' | 'error';
  text: string;
};

export interface SavedSession {
  id: string;
  assistantName: string;
  date: string;
  preview: string;
  messages: Message[];
}

export interface SendMessageArgs {
  message: string;
  assistantName: string;
  files?: File[];
}

export const sendMessageToBot = createAsyncThunk<
  string,
  SendMessageArgs,
  { rejectValue: string }
>(
  'chat/sendMessageToBot',
  async (args, { rejectWithValue }) => {
    const url = apiUrl('/api/bot/');

    try {
      const formData = new FormData();
      formData.append('message', args.message);
      // On peut ajouter le nom de l'assistant pour le backend si besoin
      formData.append('assistant', args.assistantName);
      
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

    } catch (err: unknown) {
      return rejectWithValue(
        err instanceof TypeError || !(err instanceof Error)
          ? 'Impossible de joindre le serveur. Vérifiez votre connexion.'
          : err.message
      );
    }
  }
);

interface ChatState {
  messagesByAssistant: Record<string, Message[]>;
  savedHistory:        SavedSession[];
  pendingUser:         string | null;
  status:              'idle' | 'loading' | 'succeeded' | 'failed';
  error:               string | null;
}

const loadHistory = (): SavedSession[] => {
  try {
    const s = localStorage.getItem('wagan_history');
    return s ? JSON.parse(s) : [];
  } catch { return []; }
};

const initialState: ChatState = {
  messagesByAssistant: {},
  savedHistory:        loadHistory(),
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
      const assistantName = action.payload;
      const msgs = state.messagesByAssistant[assistantName] || [];
      
      if (msgs.length > 0) {
        // Sauvegarder dans l'historique avant d'effacer
        const session: SavedSession = {
          id: Date.now().toString(),
          assistantName,
          date: new Date().toLocaleString(),
          preview: msgs[0].text.substring(0, 50) + '...',
          messages: [...msgs]
        };
        state.savedHistory.unshift(session);
        localStorage.setItem('wagan_history', JSON.stringify(state.savedHistory));
      }

      state.messagesByAssistant[assistantName] = [];
      state.pendingUser = null;
      state.status      = 'idle';
      state.error       = null;
    },
    clearHistory(state) {
      state.savedHistory = [];
      localStorage.removeItem('wagan_history');
    },
    restoreHistory(state, action: { payload: string }) {
      const sessionId = action.payload;
      const sessionIndex = state.savedHistory.findIndex(s => s.id === sessionId);
      if (sessionIndex !== -1) {
        const session = state.savedHistory[sessionIndex];
        
        // Optionnel: on sauvegarde le chat actuel avant d'écraser si non vide
        const currentMsgs = state.messagesByAssistant[session.assistantName] || [];
        if (currentMsgs.length > 0) {
          state.savedHistory.unshift({
            id: Date.now().toString(),
            assistantName: session.assistantName,
            date: new Date().toLocaleString(),
            preview: currentMsgs[0].text.substring(0, 50) + '...',
            messages: [...currentMsgs]
          });
        }

        state.messagesByAssistant[session.assistantName] = [...session.messages];
        state.savedHistory.splice(sessionIndex, 1); // on le retire de l'historique puisqu'il redevient actif
        localStorage.setItem('wagan_history', JSON.stringify(state.savedHistory));
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendMessageToBot.pending, (state, action) => {
        state.status      = 'loading';
        state.error       = null;
        const { assistantName, message, files } = action.meta.arg;
        
        let textToShow = message;
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

export const { clearError, clearMessages, clearHistory, restoreHistory } = chatSlice.actions;
export default chatSlice.reducer;
