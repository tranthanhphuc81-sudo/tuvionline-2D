/* Lấy câu chữ đi kèm kết quả engine (mô tả sao Du Niên, câu quan hệ Nạp Âm).
   Bản JS gốc để câu chữ ngay trong engine; ARCHITECTURE.md mục 5.4 chuyển chúng sang src/content.
   Bộ chuyển đổi này giúp bản chụp so được cả câu chữ dù chúng nằm ở đâu. */
import { PhongThuyEngine, NapAmEngine } from '../../src/core';

export function starDesc(star: string): string {
  const s = PhongThuyEngine.duNien('Càn').find((x: { star: string }) => x.star === star);
  return s.desc;
}

export function relationText(a: unknown, b: unknown): { cls: string; text: string } {
  const r = NapAmEngine.relation(a, b);
  return { cls: r.cls, text: r.text };
}
