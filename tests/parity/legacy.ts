/* Chạy trang legacy (public/legacy/lyso-toolkit.html) trong jsdom để so câu chữ với src/content (ARCHITECTURE.md mục 7.1).
   Ngày "hôm nay" của trang được cố định để phần "Giai đoạn hiện tại" và lưu niên năm nay so được. */
import { JSDOM, VirtualConsole } from 'jsdom';
import { readFileSync } from 'node:fs';

export const FIXED_NOW = new Date('2026-06-15T09:00:00+07:00');

export function loadLegacy(now = FIXED_NOW): { doc: Document; errors: string[] } {
  const html = readFileSync('public/legacy/lyso-toolkit.html', 'utf8');
  const errors: string[] = [];
  const vc = new VirtualConsole();
  vc.on('jsdomError', (e) => errors.push(String(e.message)));
  const dom = new JSDOM(html, {
    runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc, url: 'http://localhost/',
    beforeParse(win) {
      const Real = win.Date;
      const fixed = now.getTime();
      class FixedDate extends Real {
        constructor(...a: unknown[]) {
          if (a.length === 0) super(fixed);
          else super(...(a as [number]));
        }
        static now() { return fixed; }
      }
      (win as unknown as { Date: DateConstructor }).Date = FixedDate as unknown as DateConstructor;
    },
  });
  return { doc: dom.window.document, errors };
}

/** So sánh bỏ qua mọi khoảng trắng (textContent của legacy dính liền các khối). */
export const squash = (s: string) => s.replace(/[\s ]+/g, '');

/** Vị trí khác nhau đầu tiên, kèm ngữ cảnh — để thông báo lỗi dễ đọc. */
export function firstDiff(a: string, b: string): string | null {
  if (a === b) return null;
  let i = 0;
  while (i < a.length && a[i] === b[i]) i++;
  return `tại ký tự ${i}:\n  legacy : …${a.slice(Math.max(0, i - 60), i + 60)}…\n  app    : …${b.slice(Math.max(0, i - 60), i + 60)}…`;
}

export interface TvInput { gender: 'M' | 'F'; calendar: 'solar' | 'lunar'; day: number; month: number; year: number; leapMonth: boolean; hourIdx: number; lateTy: boolean }

/** Điền form Tử Vi của legacy và bấm "Lập lá số". */
export function submitTuVi(doc: Document, p: TvInput): void {
  const $ = (s: string) => doc.querySelector(s) as HTMLElement;
  ($(`#tv-genderSeg button[data-val="${p.gender}"]`)).click();
  ($(`#tv-calSeg button[data-val="${p.calendar}"]`)).click();
  if (p.calendar === 'lunar') ($(`#tv-leapSeg button[data-val="${p.leapMonth ? 1 : 0}"]`)).click();
  ($('#tv-dd') as HTMLInputElement).value = String(p.day);
  ($('#tv-mm') as HTMLInputElement).value = String(p.month);
  ($('#tv-yy') as HTMLInputElement).value = String(p.year);
  ($('#tv-gio') as HTMLSelectElement).value = String(p.hourIdx);
  ($('#tv-lateTy') as HTMLInputElement).checked = p.lateTy;
  const ev = new (doc.defaultView as unknown as typeof globalThis).Event('submit', { cancelable: true });
  $('#tv-form').dispatchEvent(ev);
}

export function lookupYear(doc: Document, year: number): void {
  (doc.querySelector('#tv-lookupYear') as HTMLInputElement).value = String(year);
  (doc.querySelector('#tv-lookupBtn') as HTMLElement).click();
}

export const text = (doc: Document, id: string) => doc.getElementById(id)?.textContent ?? '';
