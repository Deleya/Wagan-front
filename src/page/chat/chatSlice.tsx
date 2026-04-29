import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export type Message = {
  role: 'user' | 'bot' | 'error';
  text: string;
};

/* ─────────────────────────────────────────────────────────────
   Thunk : envoie le message et récupère la réponse du bot
   L'URL est résolue via le proxy Vite en dev (/api/...)
   ou via la variable d'environnement VITE_API_URL en prod.
───────────────────────────────────────────────────────────── */
export const sendMessageToBot = createAsyncThunk<
  string,          // valeur retournée (réponse bot)
  string,          // argument (message user)
  { rejectValue: string }
>(
  'chat/sendMessageToBot',
  async (userMessage, { rejectWithValue }) => {
    const base = import.meta.env.VITE_API_URL ?? '';
    const url  = `${base}/api/bot/`;

    try {
      const res = await fetch(url, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ message: userMessage }),
      });

      // Lire le corps même si le statut est une erreur
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        // Le backend renvoie {"error": "..."} sur les 4xx/5xx
        const msg = data?.error ?? data?.detail ?? `Erreur serveur (${res.status})`;
        return rejectWithValue(msg);
      }

      // Succès : data.response contient la réponse du bot
      const botText = data?.response;
      if (!botText) {
        return rejectWithValue('Réponse vide reçue du serveur.');
      }

      return botText as string;

    } catch (err: any) {
      // Erreur réseau (pas de connexion, CORS bloqué, timeout…)
      return rejectWithValue(
        err?.message ?? 'Impossible de joindre le serveur. Vérifiez votre connexion.'
      );
    }
  }
);

/* ─────────────────────────────────────────────────────────────
   Slice
───────────────────────────────────────────────────────────── */
interface ChatState {
  messages:      Message[];
  pendingUser:   string | null;   // message en attente d'être confirmé
  status:        'idle' | 'loading' | 'succeeded' | 'failed';
  error:         string | null;
}

const initialState: ChatState = {
  messages:    [],
  pendingUser: null,
  status:      'idle',
  error:       null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    clearError(state) {
      state.error  = null;
      state.status = 'idle';
    },
    clearMessages(state) {
      state.messages    = [];
      state.pendingUser = null;
      state.status      = 'idle';
      state.error       = null;
    },
  },
  extraReducers: (builder) => {
    builder

      /* ── Envoi en cours ── */
      .addCase(sendMessageToBot.pending, (state, action) => {
        state.status      = 'loading';
        state.error       = null;
        // On affiche immédiatement le message utilisateur
        state.pendingUser = action.meta.arg;
        state.messages.push({ role: 'user', text: action.meta.arg });
      })

      /* ── Succès ── */
      .addCase(sendMessageToBot.fulfilled, (state, action) => {
        state.status      = 'succeeded';
        state.pendingUser = null;
        state.messages.push({ role: 'bot', text: action.payload });
      })

      /* ── Échec ── */
      .addCase(sendMessageToBot.rejected, (state, action) => {
        state.status      = 'failed';
        state.pendingUser = null;
        const errMsg = action.payload ?? action.error.message ?? 'Une erreur est survenue.';
        state.error  = errMsg;
        // Afficher l'erreur comme message inline dans le chat
        state.messages.push({
          role: 'error',
          text: `⚠️ ${errMsg}`,
        });
      });
  },
});

export const { clearError, clearMessages } = chatSlice.actions;
export default chatSlice.reducer;
