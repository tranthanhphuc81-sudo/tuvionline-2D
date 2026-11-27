/* File video thật của lối vào phải khớp mốc trong video.tsx (mốc tính theo giây của file; app tự phát chậm VIDEO_SLOW lần).
   Test giao diện dùng video giả nên không bắt được trường hợp thay file mà quên đổi mốc (ARCHITECTURE 12.12). */
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { VIDEO_SEGMENTS, VIDEO_STOPS } from './video';

/** Độ dài (giây) đọc từ hộp `mvhd` của file mp4. */
function mp4Duration(buf: Buffer): number {
  const i = buf.indexOf('mvhd');
  if (i < 0) throw new Error('Không thấy hộp mvhd');
  const version = buf[i + 4];
  if (version === 1) return Number(buf.readBigUInt64BE(i + 28)) / buf.readUInt32BE(i + 24);
  return buf.readUInt32BE(i + 20) / buf.readUInt32BE(i + 16);
}

describe('File video lối vào', () => {
  const file = readFileSync(fileURLToPath(new URL('../../assets/journey/video/loi-vao.mp4', import.meta.url)));
  const duration = mp4Duration(file);

  it('dài đúng bằng mốc cuối của VIDEO_SEGMENTS (lệch dưới 0,2 giây)', () => {
    const end = VIDEO_SEGMENTS[VIDEO_SEGMENTS.length - 1][1];
    expect(Math.abs(duration - end)).toBeLessThan(0.2);
  });

  it('mọi chỗ dừng nằm trong video', () => {
    for (const s of VIDEO_STOPS) expect(s.at).toBeLessThan(duration);
  });
});
