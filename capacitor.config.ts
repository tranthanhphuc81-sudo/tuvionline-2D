import type { CapacitorConfig } from '@capacitor/cli';

// ĐỔI appId TRƯỚC KHI ĐƯA LÊN GOOGLE PLAY — sau khi phát hành sẽ không đổi được nữa (xem PROMPT-KIT, Phase 7)
const config: CapacitorConfig = {
  appId: 'vn.lyso.app',
  appName: 'Lý Số Trọn Bộ',
  webDir: 'dist',
  android: { allowMixedContent: false },
};

export default config;
