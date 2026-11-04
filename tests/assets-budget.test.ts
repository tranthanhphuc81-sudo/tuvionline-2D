/* Ngân sách tài nguyên hành trình (ARCHITECTURE.md mục 12.4): ảnh + âm thanh tối đa 3 MB, kể cả khi thay tranh thật. */
import { describe, it, expect } from 'vitest';
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

function totalBytes(dir: string): number {
  return readdirSync(dir).reduce((sum, f) => {
    const p = join(dir, f), st = statSync(p);
    return sum + (st.isDirectory() ? totalBytes(p) : st.size);
  }, 0);
}

describe('ngân sách tài nguyên', () => {
  it('src/assets/journey không vượt 3 MB', () => {
    expect(totalBytes('src/assets/journey')).toBeLessThanOrEqual(3 * 1024 * 1024);
  });
});
