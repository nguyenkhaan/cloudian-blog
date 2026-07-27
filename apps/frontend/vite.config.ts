import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    // Đảm bảo đường dẫn tương đối đúng khi chạy trên các môi trường hosting
    base: '/',
    server: {
      proxy: {
        '/api': {
          // Chỉ hoạt động khi chạy dev (bun run dev)
          target: env.VITE_API_TARGET || 'http://localhost:8787',
          changeOrigin: true,
        },
      },
    },
  };
});