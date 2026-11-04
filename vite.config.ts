import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' để file build chạy được trong WebView của Capacitor
export default defineConfig({
  base: './',
  plugins: [react()],
  server: { port: 5173, strictPort: true },
  test: { include: ['tests/**/*.test.ts'] },
} as never);
