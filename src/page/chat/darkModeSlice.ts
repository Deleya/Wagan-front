import { createSlice } from '@reduxjs/toolkit';

const storedDarkMode = localStorage.getItem('darkMode') === 'true';

const initialState = {
  darkMode: storedDarkMode, // charge la valeur enregistrée
};

const darkModeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
      localStorage.setItem('darkMode', state.darkMode.toString()); // sauvegarde
    },
    setDarkMode: (state, action) => {
      state.darkMode = action.payload;
      localStorage.setItem('darkMode', state.darkMode.toString()); // sauvegarde
    },
  },
});

export const { toggleDarkMode, setDarkMode } = darkModeSlice.actions;
export default darkModeSlice.reducer;
