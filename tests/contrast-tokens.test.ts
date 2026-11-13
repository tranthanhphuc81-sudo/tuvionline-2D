/* Độ tương phản chữ (ARCHITECTURE 4, 13/11/2026): chữ màu phải dùng token chữ, và token chữ đạt ≥ 4,5:1 trên mọi nền. */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = join(__dirname, '..', 'src');
const cssFiles = (d: string): string[] => readdirSync(d).flatMap((n) => {
  const p = join(d, n);
  return statSync(p).isDirectory() ? cssFiles(p) : n.endsWith('.css') ? [p] : [];
});

const tokens = readFileSync(join(ROOT, 'ui', 'tokens.css'), 'utf8');
/** Lấy giá trị biến trong khối :root đầu tiên (chế độ tối) và khối :root[data-theme="light"] (chế độ sáng). */
const block = (start: string) => { const i = tokens.indexOf(start); return tokens.slice(i, tokens.indexOf('}', i)); };
const varOf = (b: string, name: string) => { const m = b.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`)); if (!m) throw new Error('thiếu --' + name); return m[1]; };
const DARK = block(':root {'), LIGHT = block(':root[data-theme="light"]');
const lum = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
  .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
  .reduce((a, v, i) => a + v * [0.2126, 0.7152, 0.0722][i], 0);
const ratio = (a: string, b: string) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };

describe('độ tương phản chữ', () => {
  it('không còn chỗ nào dùng thẳng --gold hay --vermillion làm màu chữ', () => {
    const bad: string[] = [];
    for (const f of cssFiles(ROOT)) {
      if (f.endsWith('tokens.css')) continue;
      const s = readFileSync(f, 'utf8');
      for (const m of s.matchAll(/(^|[^-\w])color\s*:\s*var\(--(gold|vermillion)\)/gm)) bad.push(f.replace(ROOT, 'src') + ': ' + m[0].trim());
    }
    expect(bad, 'dùng --gold-text / --vermillion-text cho chữ').toEqual([]);
  });
  it('token chữ đạt ≥ 4,5:1 trên mọi nền, cả hai chế độ', () => {
    for (const [mode, b] of [['tối', DARK], ['sáng', LIGHT]] as const) {
      const bgs = ['bg', 'surface', 'surface2', 'surface3'].map((n) => varOf(b, n));
      for (const t of ['ink', 'ink-dim', 'muted', 'gold-text', 'vermillion-text']) {
        for (const bg of bgs) expect(ratio(varOf(t === 'gold-text' && mode === 'tối' ? DARK : b, t), bg), `${mode}: --${t} trên ${bg}`).toBeGreaterThanOrEqual(4.5);
      }
      expect(ratio(varOf(b, 'on-gold'), varOf(b, 'gold')), `${mode}: chữ trên nút vàng`).toBeGreaterThanOrEqual(4.5);
    }
    expect(ratio('#ffffff', varOf(DARK, 'vermillion-badge')), 'huy hiệu chữ trắng').toBeGreaterThanOrEqual(4.5);
  });
});
