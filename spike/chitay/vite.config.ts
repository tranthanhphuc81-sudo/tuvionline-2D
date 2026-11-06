import { defineConfig } from 'vite';

// Chỉ build trang thử trên điện thoại, đăng ở /chitay-thu/ cùng bản xem trên Cloudflare, không vào APK.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/chitay-thu/' : '/',
  build: { rollupOptions: { input: 'phone.html' } },
  publicDir: command === 'build' ? false : 'public',
}));
