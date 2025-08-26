import { createSlice } from '@reduxjs/toolkit';
const savedAssistants = JSON.parse(localStorage.getItem('assistants') || '[]');
interface Assistant {
  name: string;
  role: string;
  image: string;
}

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
      const exists = state.assistants.find(
        (a) => a.name === action.payload.name && a.role === action.payload.role
      );
      if (!exists) {
        state.assistants.push(action.payload);
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
