import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],

  server: {
    proxy: {
      // En dev : /api/* → backend Django local (port 8000)
      // Si VITE_API_URL est défini dans .env, il prend le dessus côté fetch.
      '/api': {
        target:      'http://127.0.0.1:8000',
        changeOrigin: true,
        secure:       false,
      },
    },
  },
});
