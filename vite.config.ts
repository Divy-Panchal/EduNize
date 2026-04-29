import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/messaging'],
          charts: ['recharts'],
          ai: ['@google/generative-ai', 'react-markdown', 'dompurify'],
          motion: ['framer-motion'],
        },
      },
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
