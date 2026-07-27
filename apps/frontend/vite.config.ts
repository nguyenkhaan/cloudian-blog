import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Tải các biến môi trường từ .env dựa theo mode (development/production)
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      proxy: {
        '/api': {
          // Lấy URL từ file .env, nếu không có sẽ fallback về localhost:8787
          target: env.VITE_API_TARGET || 'http://localhost:8787',
          changeOrigin: true,
        },
      },
    },
  };
});