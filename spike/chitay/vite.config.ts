import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { defineConfig, type Plugin } from 'vite';

/* Lưu điểm chấm ra file trên máy khi chạy bản thử ở máy mình, vì bộ nhớ của khung trình duyệt từng bị xoá khi app khởi động lại.
   File nằm trong truth/ (đã loại khỏi git), không có ảnh. Bản đăng trên Cloudflare không có phần này. */
const GRADES_FILE = 'truth/grades-live.json';
function saveGrades(): Plugin {
  return {
    name: 'save-grades',
    configureServer(server) {
      server.middlewares.use('/__grades', (req, res) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', (c) => { body += c; });
          req.on('end', () => {
            try { JSON.parse(body); mkdirSync('truth', { recursive: true }); writeFileSync(GRADES_FILE, body); res.end('ok'); } catch { res.statusCode = 400; res.end('bad'); }
          });
          return;
        }
        res.setHeader('content-type', 'application/json');
        try { res.end(readFileSync(GRADES_FILE, 'utf-8')); } catch { res.end('{}'); }
      });
    },
  };
}

// Chỉ build trang thử trên điện thoại, đăng ở /chitay-thu/ cùng bản xem trên Cloudflare, không vào APK.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/chitay-thu/' : '/',
  build: { rollupOptions: { input: 'phone.html' } },
  publicDir: command === 'build' ? false : 'public',
  plugins: [saveGrades()],
}));
