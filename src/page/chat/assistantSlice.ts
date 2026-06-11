import { createSlice } from '@reduxjs/toolkit';
interface Assistant {
  name: string;
  role: string;
  image: string;
}

const normalizeAssistant = (assistant: Assistant): Assistant => {
  const normalizedName = assistant.name.toLowerCase().trim();

  if (normalizedName === 'ousmane') {
    return {
      ...assistant,
      name: 'Analyse de donnees',
      role: "Analyse de donnees et developpement d'application",
    };
  }

  if (normalizedName === 'kalika' || normalizedName === 'analyse de donnees') {
    return {
      ...assistant,
      name: normalizedName === 'kalika' ? 'Dev' : assistant.name,
      role: normalizedName === 'kalika'
        ? "Developpement d'application"
        : "Analyse de donnees et developpement d'application",
    };
  }

  if (normalizedName === 'dev') {
    return {
      ...assistant,
      name: 'Dev',
      role: "Developpement d'application",
    };
  }

  return assistant;
};

const savedAssistants = JSON.parse(localStorage.getItem('assistants') || '[]')
  .map(normalizeAssistant)
  .filter((assistant: Assistant, index: number, list: Assistant[]) =>
    list.findIndex((item) => item.name === assistant.name) === index
  );

localStorage.setItem('assistants', JSON.stringify(savedAssistants));

interface AssistantState {
  assistants: Assistant[];
}

const initialState: AssistantState = {
  assistants: savedAssistants,
};

const assistantSlice = createSlice({
  name: 'assistant',
  initialState,
  reducers: {
    addAssistant: (state, action) => {
      const assistant = normalizeAssistant(action.payload);
      const exists = state.assistants.find(
        (a) => a.name === assistant.name && a.role === assistant.role
      );
      if (!exists) {
        state.assistants.push(assistant);
        localStorage.setItem('assistants', JSON.stringify(state.assistants));
      }
    },
    removeAssistant: (state, action) => {
      // Ne pas supprimer s’il ne reste qu’un seul assistant
      if (state.assistants.length <= 1) {
        return; 
      }

      // Sinon, supprimer normalement
      state.assistants = state.assistants.filter(
        (a) => a.name !== action.payload.name
      );
      localStorage.setItem('assistants', JSON.stringify(state.assistants));
    },



  },
});

export const { addAssistant, removeAssistant } = assistantSlice.actions;
export default assistantSlice.reducer;
