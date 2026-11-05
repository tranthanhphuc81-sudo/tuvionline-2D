/* Chạy Gradle trong android/ trên cả Windows lẫn Linux/macOS (npm trên Windows dùng cmd nên `./gradlew` không chạy được).
   Cách dùng: node scripts/gradle.mjs <tác vụ Gradle> <đường dẫn file kết quả, tính từ android/> */
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const [task, output] = process.argv.slice(2);
if (task === 'bundleRelease' && process.env.LYSO_LIVE_URL) {
  console.error('Bản phát hành không được đặt LYSO_LIVE_URL: app phải chạy offline từ file đóng gói.');
  process.exit(1);
}
const android = join(dirname(fileURLToPath(import.meta.url)), '..', 'android');
const gradlew = join(android, process.platform === 'win32' ? 'gradlew.bat' : 'gradlew');

// Node chỉ chạy được file .bat qua shell. Đường dẫn đầy đủ, có ngoặc kép vì thư mục có thể chứa dấu cách.
const { status, error } = spawnSync(`"${gradlew}"`, [task], { cwd: android, stdio: 'inherit', shell: true });
if (error) console.error(error.message);
if (status !== 0) process.exit(status ?? 1);
console.log(`\n✓ ${join('android', output)}`);
