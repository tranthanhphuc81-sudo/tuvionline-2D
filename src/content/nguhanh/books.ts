/* Mục "Lá số cổ giống bạn": tìm trong 121 lá số ví dụ của Tử Bình Chân Thuyên và Trích Thiên Tủy (sach.json, cũng là bộ
   đối chiếu của ARCHITECTURE 14.12–14.14) những lá cùng Nhật chủ và gần tháng sinh nhất, kèm điều sách nói và số trang.
   Câu sách trong sach.json là câu tóm tắt tự viết, không chép nguyên văn. Mục để học thêm, không thay cho kết luận của engine. */
import { BatTuEngine } from '../../core';
import type { Element, NguHanhChart, Reading } from '../../core/nguhanh';
import { list, note, type Block } from '../rich';
import data from './sach.json';

const { CAN, CHI } = BatTuEngine;

export type BookId = 'tbct' | 'ttt';
export interface BookChart {
  id: string; book: BookId; page: string; ref?: string; who?: string | null;
  pillars: string[]; dung: Element; accept?: Element[]; note: string;
}
export const BOOK_CHARTS: readonly BookChart[] = (data as { cases: BookChart[] }).cases;
export const BOOK_NAME: Record<BookId, string> = { tbct: 'Tử Bình Chân Thuyên', ttt: 'Trích Thiên Tủy' };

/** Mức giống: 1 cùng Nhật chủ và cùng tháng sinh; 2 cùng Nhật chủ và cùng mùa; 3 chỉ cùng Nhật chủ. */
export type SimilarTier = 1 | 2 | 3;
export interface SimilarChart { c: BookChart; tier: SimilarTier; samePillars: number; sharedBranches: number; monthGap: number }

const SEASON_VI = ['xuân', 'hạ', 'thu', 'đông'];
/** Dần Mão Thìn xuân, Tỵ Ngọ Mùi hạ, Thân Dậu Tuất thu, Hợi Tý Sửu đông. */
export const seasonOf = (branch: number) => Math.floor(((branch - 2 + 12) % 12) / 3);
const parse = (s: string) => { const [a, b] = s.split(' '); return { stem: CAN.indexOf(a), branch: CHI.indexOf(b) }; };
const POS = ['year', 'month', 'day', 'hour'] as const;

/** Tối đa `max` lá: ưu tiên cùng tháng, rồi cùng mùa (lấp cho đủ); chỉ khi không có hai mức đó mới lấy lá cùng Nhật chủ gần tháng nhất (tối đa 2). */
export function similarBookCharts(ch: NguHanhChart, max = 3): SimilarChart[] {
  const mine = POS.map((k) => ch[k]);
  const cands: SimilarChart[] = [];
  for (const c of BOOK_CHARTS) {
    const ps = c.pillars.map(parse);
    if (ps[2].stem !== ch.day.stem) continue;
    const m = ps[1].branch;
    const tier: SimilarTier = m === ch.month.branch ? 1 : seasonOf(m) === seasonOf(ch.month.branch) ? 2 : 3;
    const samePillars = ps.filter((p, i) => p.stem === mine[i].stem && p.branch === mine[i].branch).length;
    const pool = mine.map((p) => p.branch);
    let sharedBranches = 0;
    for (const p of ps) { const i = pool.indexOf(p.branch); if (i >= 0) { sharedBranches++; pool.splice(i, 1); } }
    const d = Math.abs(m - ch.month.branch);
    cands.push({ c, tier, samePillars, sharedBranches, monthGap: Math.min(d, 12 - d) });
  }
  cands.sort((x, y) => x.tier - y.tier || y.samePillars - x.samePillars || y.sharedBranches - x.sharedBranches || x.monthGap - y.monthGap || x.c.id.localeCompare(y.c.id));
  const near = cands.filter((x) => x.tier < 3);
  return near.length ? near.slice(0, max) : cands.slice(0, Math.min(2, max));
}

/** Nguồn: sách, (số thứ tự lá trong sách), trang; kèm tên người nếu sách có ghi. */
export function bookSource(c: BookChart): string {
  const where = c.book === 'ttt' && c.ref ? `${BOOK_NAME.ttt}, lá số số ${c.ref}, trang ${c.page}` : `${BOOK_NAME[c.book]}, trang ${c.page}`;
  return c.who ? `mệnh ${c.who}, ${where}` : where;
}

function whySimilar(s: SimilarChart, ch: NguHanhChart): string {
  const dm = CAN[ch.day.stem];
  const m = parse(s.c.pillars[1]).branch;
  const head = s.tier === 1 ? `cùng Nhật chủ ${dm}, cùng sinh tháng ${CHI[m]}`
    : s.tier === 2 ? `cùng Nhật chủ ${dm}, cùng sinh mùa ${SEASON_VI[seasonOf(m)]} (lá này tháng ${CHI[m]}, bạn tháng ${CHI[ch.month.branch]})`
    : `cùng Nhật chủ ${dm}, sinh tháng ${CHI[m]} (bạn tháng ${CHI[ch.month.branch]}, khác mùa)`;
  const extra = s.samePillars >= 2 ? `, trùng ${s.samePillars} trụ` : parse(s.c.pillars[2]).branch === ch.day.branch ? `, trùng cả trụ ngày ${s.c.pillars[2]}` : '';
  return head + extra;
}

export interface BooksResult { blocks: Block[]; matches: SimilarChart[] }

/** Các khối của mục "Lá số cổ giống bạn" cho cách luận đang xem. */
export function bookBlocks(ch: NguHanhChart, reading: Reading): BooksResult {
  const matches = similarBookCharts(ch);
  const mine = reading.usefulGod.dung;
  const items = matches.map((s) => {
    const accept = s.c.accept?.length ? ` (sách cũng cho ${s.c.accept.join(', ')} là tốt)` : '';
    const cmp = s.c.dung === mine ? `Lá của bạn cũng nghiêng về ${mine}.` : `Lá của bạn nghiêng về ${mine}: hai lá chỉ giống một phần nên khác nhau là thường.`;
    return `<b>${s.c.pillars.join(' · ')}</b> (${bookSource(s.c)}): ${whySimilar(s, ch)}. Sách luận: ${s.c.note}; dùng <b>${s.c.dung}</b>${accept}. ${cmp}`;
  });
  const fallback = matches.length && matches[0].tier === 3;
  const intro = fallback
    ? `Trong 121 lá số ví dụ của ${BOOK_NAME.tbct} và ${BOOK_NAME.ttt}, chưa có lá cùng Nhật chủ mà cùng mùa sinh với bạn; dưới đây là lá cùng Nhật chủ, tháng sinh gần nhất.`
    : `Trong 121 lá số ví dụ của ${BOOK_NAME.tbct} và ${BOOK_NAME.ttt}, đây là những lá gần với lá của bạn nhất (cùng Nhật chủ, cùng tháng hay cùng mùa sinh).`;
  return {
    matches,
    blocks: [
      note('nguhanh.books.intro', `${intro} Hai lá số chỉ giống nhau một phần, nên đây là ví dụ để học cách người xưa luận, không phải kết luận cho lá của bạn. Câu "sách luận" là tóm tắt, xem nguyên văn theo số trang.`),
      list('nguhanh.books.list', items),
    ],
  };
}
