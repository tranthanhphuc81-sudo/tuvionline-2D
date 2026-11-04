/* Dựng các mục "Tổng kết" đúng thứ tự và giới hạn của hàm block() trong legacy (dùng cho Bát Trạch, Nạp Âm). */
import { list, note, p, parseRich, type Section, type Tone } from '../rich';
import { VERDICT_HOW } from '../tuvi/tongket';

function uniq(a: readonly string[]): string[] {
  const seen = new Set<string>();
  return a.filter((x) => { if (!x || seen.has(x)) return false; seen.add(x); return true; });
}

export interface TongKetInput {
  title: string;
  verdict?: { html: string; tone: Tone } | null;
  tomTat: string[];
  manh: string[];
  luuY: string[];
  viDu: string[];
  khuyen: string[];
  note: string;
}

export function tongKetSections(id: string, o: TongKetInput): Section[] {
  const sec = (key: string, title: string, items: string[], max: number): Section[] => {
    const xs = uniq(items).slice(0, max);
    return xs.length ? [{ id: `${id}.${key}`, title, blocks: [list(`${id}.${key}.list`, xs)] }] : [];
  };
  return [
    {
      id, title: o.title, tone: o.verdict?.tone,
      blocks: [
        ...(o.verdict ? [{ id: `${id}.verdict`, kind: 'verdict' as const, tone: o.verdict.tone, rich: parseRich(o.verdict.html), how: VERDICT_HOW }] : []),
        ...o.tomTat.map((t, i) => p(`${id}.tomtat.${i}`, t)),
      ],
    },
    ...sec('manh', '✅ Điểm mạnh', o.manh, 5),
    ...sec('luuy', '⚠️ Điểm cần lưu ý', o.luuY, 5),
    ...sec('vidu', '💡 Ví dụ dễ hình dung', o.viDu, 4),
    ...sec('khuyen', '🎯 Lời khuyên thực tế', o.khuyen, 6),
    { id: `${id}.note`, title: '', blocks: [note(`${id}.note.0`, o.note)] },
  ];
}
