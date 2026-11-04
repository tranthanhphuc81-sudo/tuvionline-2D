import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import pkg from './package.json';

// base './' để file build chạy được trong WebView của Capacitor
export default defineConfig({
  base: './',
  plugins: [react()],
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
  server: { port: 5173, strictPort: true },
  test: { include: ['tests/**/*.test.ts', 'src/**/*.test.{ts,tsx}'] },
} as never);
