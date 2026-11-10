/* Chép phần chạy mô hình nhận diện bàn tay (WASM của MediaPipe) từ node_modules vào public/palm/ để app chạy offline.
   Mô hình hand_landmarker.task (Apache 2.0) đã nằm sẵn trong public/palm/. Chạy tự động trước dev và build. */
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';

const from = 'node_modules/@mediapipe/tasks-vision/wasm';
if (!existsSync(from)) { console.error('Thiếu @mediapipe/tasks-vision: chạy npm install'); process.exit(1); }
mkdirSync('public/palm', { recursive: true });
for (const f of ['vision_wasm_internal.js', 'vision_wasm_internal.wasm']) copyFileSync(`${from}/${f}`, `public/palm/${f}`);
console.log('Đã chép WASM của MediaPipe vào public/palm/');
