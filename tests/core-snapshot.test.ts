/* Bản chụp kết quả engine — lưới an toàn cho việc gộp/chuyển src/core sang TypeScript (Phase 1.2).
   Mỗi ca được băm (SHA-1 của JSON đã sắp khoá) và so với tests/fixtures/core-snapshot.json,
   bản chụp sinh từ engine JS gốc đã kiểm chứng (commit trước Phase 1.2).

   KHÔNG sinh lại bản chụp chỉ để test xanh. Chỉ sinh lại (UPDATE_CORE_SNAPSHOT=1 npm test) khi CỐ Ý đổi công thức,
   đã đối chiếu docs/ và ghi rõ trong commit — đúng quy tắc trong CLAUDE.md. */
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';
import * as C from './snapshot/compute';
import { starDesc, relationText } from './snapshot/adapters';

const FIXTURE = join(dirname(fileURLToPath(import.meta.url)), 'fixtures', 'core-snapshot.json');
const UPDATE = process.env.UPDATE_CORE_SNAPSHOT === '1';

function canonical(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(canonical);
  if (v && typeof v === 'object') {
    const o: Record<string, unknown> = {};
    for (const k of Object.keys(v).sort()) o[k] = canonical((v as Record<string, unknown>)[k]);
    return o;
  }
  return v;
}
const digest = (v: unknown) => createHash('sha1').update(JSON.stringify(canonical(v))).digest('hex').slice(0, 16);

const groups: Record<string, (out: Map<string, unknown>) => void> = {
  calendar: C.computeCalendar,
  tuvi: C.computeTuVi,
  battu: C.computeBatTu,
  luchao: C.computeLucHao,
  battrach: (o) => C.computeBatTrach(o, starDesc),
  napam: (o) => C.computeNapAm(o, relationText),
  quickProfile: (o) => C.computeQuickProfile(o, starDesc),
};

const stored: Record<string, Record<string, string>> = UPDATE ? {} : JSON.parse(readFileSync(FIXTURE, 'utf8'));
const fresh: Record<string, Record<string, string>> = {};

describe('Bản chụp engine (không đổi kết quả khi refactor)', () => {
  for (const [name, fn] of Object.entries(groups)) {
    it(name, () => {
      const out = new Map<string, unknown>();
      fn(out);
      const got: Record<string, string> = {};
      for (const [k, v] of out) got[k] = digest(v);
      fresh[name] = got;
      if (UPDATE) return;
      const want = stored[name];
      expect(want, `thiếu nhóm ${name} trong bản chụp`).toBeDefined();
      const diff = Object.keys({ ...want, ...got }).filter((k) => want[k] !== got[k]);
      expect(diff.slice(0, 20), `${diff.length} ca khác bản chụp`).toEqual([]);
    }, 120_000);
  }
  if (UPDATE) {
    it('ghi bản chụp', () => {
      mkdirSync(dirname(FIXTURE), { recursive: true });
      writeFileSync(FIXTURE, JSON.stringify(fresh, null, 0) + '\n');
    });
  }
});
