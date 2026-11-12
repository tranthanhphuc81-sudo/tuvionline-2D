/* Bản chụp RIÊNG của engine ngũ hành (ARCHITECTURE 14.9), không đụng tests/fixtures/core-snapshot.json.
   500 lá số sinh từ batTuChart (seed 20261113); mỗi ca băm toàn bộ kết quả: điểm, vượng/nhược, tòng cách (cả mã lý do),
   các cách luận, câu hỏi kiểm chứng theo tham số của app, và đối chiếu với legacy.
   KHÔNG sinh lại chỉ để test xanh. Chỉ sinh lại (UPDATE_NGUHANH_SNAPSHOT=1 npm test) khi CỐ Ý đổi hệ số hay thuật toán,
   sau khi chạy lại npm run compare:dungthan, và ghi lý do trong commit. */
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { batTuChart, batTuReading } from '../src/core';
import { analyze, compareWithLegacy, toNguHanhChart, verificationQuestions } from '../src/core/nguhanh';

const FIXTURE = join(dirname(fileURLToPath(import.meta.url)), 'fixtures', 'nguhanh-snapshot.json');
const UPDATE = process.env.UPDATE_NGUHANH_SNAPSHOT === '1';
const digest = (v: unknown) => createHash('sha1').update(JSON.stringify(v)).digest('hex').slice(0, 16);

function compute(): Record<string, string> {
  let seed = 20261113; const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
  const out: Record<string, string> = {};
  for (let i = 0; i < 500; i++) {
    const yy = 1950 + Math.floor(rnd() * 60), mm = 1 + Math.floor(rnd() * 12), dd = 1 + Math.floor(rnd() * 28), h = Math.floor(rnd() * 12), g = rnd() < 0.5 ? 'M' : 'F';
    const ch = batTuChart({ gender: g, dd, mm, yy, hourIdx: h } as never);
    const a = analyze(toNguHanhChart(ch));
    const cmp = compareWithLegacy(batTuReading(ch, 2026), a.usefulGod, a.dayMaster.strength);
    const qs = verificationQuestions(a, { nowYear: 2026, minAge: 18, maxYears: 3, maxDaiVan: 2 });
    out[`${g}:${dd}/${mm}/${yy}:${h}`] = digest({ a, cmp, qs });
  }
  return out;
}

describe('Bản chụp engine ngũ hành', () => {
  it('500 lá số khớp bản chụp đã lưu', () => {
    const fresh = compute();
    if (UPDATE) {
      mkdirSync(dirname(FIXTURE), { recursive: true });
      writeFileSync(FIXTURE, JSON.stringify(fresh, null, 0));
      return;
    }
    const stored = JSON.parse(readFileSync(FIXTURE, 'utf8')) as Record<string, string>;
    expect(Object.keys(fresh).length).toBeGreaterThanOrEqual(490);
    expect(Object.keys(fresh)).toEqual(Object.keys(stored));
    const bad = Object.keys(stored).filter((k) => stored[k] !== fresh[k]);
    expect(bad, `${bad.length} ca lệch, ví dụ ${bad.slice(0, 3).join(', ')}`).toEqual([]);
  });
});
