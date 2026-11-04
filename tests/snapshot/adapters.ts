/* Lấy câu chữ đi kèm kết quả engine (mô tả sao Du Niên, câu quan hệ Nạp Âm).
   Bản JS gốc để câu chữ ngay trong engine; ARCHITECTURE.md mục 5.4 chuyển chúng sang src/content.
   Bộ chuyển đổi này giúp bản chụp so được cả câu chữ dù chúng nằm ở đâu. */
import { PhongThuyEngine, NapAmEngine, type NapAmYear } from '../../src/core';
import { napAmRelationText } from '../../src/content/napam/relation';

export function starDesc(star: string): string {
  const s = PhongThuyEngine.duNien('Càn').find((x: { star: string }) => x.star === star);
  return s.desc;
}

export function relationText(a: unknown, b: unknown): { cls: string; text: string } {
  const pa = a as NapAmYear, pb = b as NapAmYear;
  const r = NapAmEngine.relation(pa, pb);
  return { cls: r.cls, text: napAmRelationText(r, pa, pb) };
}
