import type { CapacitorConfig } from '@capacitor/cli';

// ĐỔI appId TRƯỚC KHI ĐƯA LÊN GOOGLE PLAY — sau khi phát hành sẽ không đổi được nữa (xem PROMPT-KIT, Phase 7)
// LYSO_LIVE_URL chỉ đặt cho APK thử trên GitHub Actions: app tải giao diện từ Cloudflare nên sửa web không phải cài lại, plugin native vẫn chạy.
// Bản phát hành KHÔNG được đặt biến này: app phải chạy offline từ file đóng gói (scripts/gradle.mjs chặn việc đó).
const liveUrl = process.env.LYSO_LIVE_URL;

const config: CapacitorConfig = {
  appId: 'vn.lyso.app',
  appName: 'Lý Số Trọn Bộ',
  webDir: 'dist',
  android: { allowMixedContent: false },
  ...(liveUrl ? { server: { url: liveUrl, errorPath: 'index.html' } } : {}),
};

export default config;
