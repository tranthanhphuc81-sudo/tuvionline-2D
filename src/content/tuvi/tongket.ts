/* "Tổng kết" của tab Tử Vi — câu chữ NGUYÊN VĂN legacy tuVi() + lifeAreas() + block(). Phép chấm ở src/core/tuvi/reading.ts;
   file này chỉ ghép câu đúng thứ tự cũ. */
import { tuViReading, type AreaReading, type HoaKey, type TuViChart, type TuViReading } from '../../core';
import { list, note, p, parseRich, type Block, type Section } from '../rich';
import {
  AREA, AREA_LIST, AREA_TIP, BRIGHT_TEXT, CUNG_PLAIN, DH_ADVICE, HOA_SHORT, KY_ADVICE, PHU, PHU_SHORT, STAR, THAN_CU, pairOf,
} from '../interp/tuvi';
import { HOA_NAME, yearLabel, yearLines } from './year';

export const VERDICT_HOW = 'Nhãn đánh giá do công cụ tự chấm theo quy tắc dân gian (cộng điểm cho yếu tố tốt, trừ cho yếu tố xấu) — không phải tỷ lệ hay xác suất thực tế.';
export const DEFAULT_NOTE = 'Đây là cách đọc theo văn hoá dân gian để tham khảo và tự suy ngẫm — không phải dự báo chắc chắn, cũng không thay cho các quyết định dựa trên thông tin thực tế.';
const HOA_SHORT_NAME: Record<HoaKey, string> = { loc: 'Lộc', quyen: 'Quyền', khoa: 'Khoa', ky: 'Kỵ' };
const AREA_LABEL = { ok: 'Thuận lợi', warn: 'Cần chú ý', mid: 'Bình thường' } as const;

/** legacy uniq(): bỏ rỗng và trùng, giữ thứ tự. */
function uniq(a: readonly string[]): string[] {
  const seen = new Set<string>();
  return a.filter((x) => { if (!x || seen.has(x)) return false; seen.add(x); return true; });
}

function areaText(ch: TuViChart, a: AreaReading): string {
  const parts: string[] = [];
  const pr = pairOf(a.stars);
  if (pr && !a.borrowed) parts.push('Bộ <b>' + pr[0].replace(' đồng cung', '') + '</b> —');
  parts.push(a.stars.map((s) => (AREA[s] ? '<b>' + s + '</b>: ' + AREA[s][a.key] : s)).join('; ')
    + (a.borrowed ? ' <i>(cung trống chính tinh, mượn sao cung đối diện — ảnh hưởng nhẹ hơn)</i>' : '') + '.');
  for (const b of a.bright) parts.push(b.star + ' ở cung ' + (b.br > 0 ? 'sáng — phát huy tốt mặt tích cực' : 'tối — mặt tích cực của sao bị giảm bớt') + '.');
  const mods = [
    ...a.hoa.map((k) => 'Hoá ' + HOA_SHORT_NAME[k] + ' — ' + HOA_SHORT[k]),
    ...a.phu.map((x) => x + ' — ' + PHU_SHORT[x]),
  ];
  if (mods.length) parts.push('Thêm: ' + mods.join('; ') + '.');
  parts.push('<b>Nên làm:</b> ' + (a.score < 0 ? AREA_TIP[a.key].bad : a.score >= 1 ? AREA_TIP[a.key].good : AREA_TIP[a.key].mid));
  void ch;
  return parts.join(' ');
}

function cucMenhText(r: TuViReading, cuc: string): string {
  const menh = r.banMenh.hanh;
  switch (r.cucMenh.kind) {
    case 'same': return 'Cục và bản mệnh cùng hành ' + cuc + ' — hoà hợp: sức lực và hoàn cảnh khá ăn khớp với nhau.';
    case 'cuc-sinh-menh': return 'Cục (' + cuc + ') sinh bản mệnh (' + menh + ') — hoàn cảnh hay hỗ trợ bạn, việc dễ thuận theo.';
    case 'menh-sinh-cuc': return 'Bản mệnh (' + menh + ') sinh Cục (' + cuc + ') — bạn thường phải bỏ công nhiều hơn, cho nhiều hơn nhận, nhưng vẫn được việc.';
    case 'menh-khac-cuc': return 'Bản mệnh (' + menh + ') khắc Cục (' + cuc + ') — giai đoạn đầu vất vả nhưng bạn đủ sức làm chủ hoàn cảnh.';
    case 'cuc-khac-menh': return 'Cục (' + cuc + ') khắc bản mệnh (' + menh + ') — dễ gặp trở ngại từ hoàn cảnh, cần kiên nhẫn và chuẩn bị kỹ.';
  }
}

const VERDICT = {
  ok: '<b>Đánh giá chung: lá số khá thuận lợi.</b> Quanh cung Mệnh (Mệnh – Tài – Quan – Di) có nhiều yếu tố nâng đỡ; khi bạn nỗ lực đúng hướng, kết quả thường đến rõ ràng.',
  mid: '<b>Đánh giá chung: lá số ở mức khá.</b> Có thuận lợi, có thử thách; thành công phụ thuộc nhiều vào sự chủ động và kiên trì của bạn.',
  warn: '<b>Đánh giá chung: lá số nhiều thử thách.</b> Thành công thường đến muộn hơn, qua va vấp — nhưng thứ gì tự gây dựng được thì bền. Chuẩn bị kỹ và đi từng bước chắc chắn là chìa khoá.',
} as const;

/** Phần "Tổng kết" của Tử Vi. `nowYear` = năm hiện tại (legacy dùng new Date()). */
export function tuViTongKet(ch: TuViChart, nowYear: number): Section[] {
  const r = tuViReading(ch, nowYear);
  const { main, borrowed } = r;
  const traits = main.map((s) => STAR[s]).filter(Boolean);
  let manh: string[] = [], luuY: string[] = [], khuyen: string[] = [];
  const viDu: string[] = [], tomTat: string[] = [];

  const who = traits.map((t, i) => '<b>' + main[i] + '</b> (' + t.net + ')').join(' kết hợp ');
  tomTat.push((borrowed ? 'Cung Mệnh không có chính tinh (Vô Chính Diệu) nên mượn sao ở cung đối diện: ' : 'Cung Mệnh có ') + who + '. '
    + (borrowed ? 'Người Vô Chính Diệu thường linh hoạt, dễ thích nghi, chịu ảnh hưởng của môi trường xung quanh nhiều hơn người khác.' : 'Đây là "nét gốc" trong tính cách của bạn.'));
  const menhPair = pairOf(main);
  if (menhPair) tomTat.push('Hai sao này tạo thành bộ <b>' + menhPair[0] + '</b> — ' + menhPair[1] + '.');
  for (const b of r.menhBright) (b.br > 0 ? manh : luuY).unshift(BRIGHT_TEXT[b.star][String(b.br) as '1' | '-1']);
  traits.forEach((t) => { manh = manh.concat(t.manh); luuY = luuY.concat(t.luuY); viDu.push(t.viDu); khuyen.push(t.khuyen[0]); });
  traits.forEach((t) => { khuyen.push(t.khuyen[1]); });
  r.phuMenh.forEach((x) => { const v = PHU[x]; if (v) (v.good ? manh : luuY).unshift(v.text); });

  const hc = r.hoaCung, th = ch.tuHoaBanMenh;
  if (hc.loc) manh.push(HOA_NAME.loc + ' (' + th.loc + ') ở cung ' + hc.loc + ': chuyện ' + CUNG_PLAIN[hc.loc] + ' thường suôn sẻ, dễ sinh lợi');
  if (hc.quyen) manh.push(HOA_NAME.quyen + ' (' + th.quyen + ') ở cung ' + hc.quyen + ': bạn dễ nắm thế chủ động, có tiếng nói trong chuyện ' + CUNG_PLAIN[hc.quyen]);
  if (hc.khoa) manh.push(HOA_NAME.khoa + ' (' + th.khoa + ') ở cung ' + hc.khoa + ': được tiếng tốt, dễ gặp người giúp về ' + CUNG_PLAIN[hc.khoa]);
  if (hc.ky) {
    luuY.unshift(HOA_NAME.ky + ' (' + th.ky + ') ở cung ' + hc.ky + ': chuyện ' + CUNG_PLAIN[hc.ky] + ' là nơi bạn hay bận lòng hoặc gặp trục trặc');
    khuyen.unshift(KY_ADVICE[hc.ky]);
    viDu.push('Hoá Kỵ ở cung ' + hc.ky + ' giống một "điểm hay vấp": chuyện ' + CUNG_PLAIN[hc.ky] + ' có thể lặp lại những trục trặc nhỏ. Biết trước để phòng thì nhẹ đi rất nhiều.');
  }
  if (hc.loc) viDu.push('Hoá Lộc ở cung ' + hc.loc + ' nghĩa là chuyện ' + CUNG_PLAIN[hc.loc] + ' "trơn tru" với bạn hơn người khác — đây là mảng đáng đầu tư công sức vì dễ thấy kết quả.');

  const thanCu = THAN_CU[r.thanCung];
  if (thanCu) tomTat.push(thanCu);
  tomTat.push(cucMenhText(r, ch.cucHanh) + ' (bản mệnh ' + r.banMenh.ten + ')');

  // Giai đoạn hiện tại
  const hienTai: Block[] = [];
  const dn = r.daiHanNow;
  if (dn) {
    const dh = dn.daiHan;
    let s = 'Bạn đang khoảng <b>' + dn.age + ' tuổi</b>, ở vận 10 năm thứ ' + (dn.index + 1) + ' (' + dh.tuoiStart + '–' + dh.tuoiEnd + ' tuổi), rơi vào <b>cung ' + dh.cungTen + '</b> — giai đoạn này cuộc sống xoay quanh chuyện ' + CUNG_PLAIN[dh.cungTen] + '.';
    if (dn.stars.length) s += ' Sao chính của vận' + (dn.borrowed ? ' (mượn cung đối diện)' : '') + ': ' + dn.stars.map((x) => '<b>' + x + '</b>' + (STAR[x] ? ' — ' + STAR[x].net : '')).join('; ') + '.';
    const dhPair = pairOf(dn.stars);
    if (dhPair && !dn.borrowed) s += ' Hai sao tạo thành bộ <b>' + dhPair[0] + '</b> — ' + dhPair[1] + '.';
    hienTai.push(p('tuvi.tongket.now.daihan', s, { palace: dh.chi }));
    const tone: string[] = [];
    if (dn.hoa.some((k) => k !== 'ky')) tone.push('có ' + dn.hoa.filter((k) => k !== 'ky').map((k) => HOA_NAME[k]).join(', ') + ' — vận có điểm sáng');
    if (dn.cat.length) tone.push('có ' + dn.cat.join(', ') + ' — dễ được giúp đỡ');
    if (dn.hoa.includes('ky')) tone.push('có Hoá Kỵ — dễ vướng bận, cần cẩn thận hơn');
    if (dn.sat.length) tone.push('có ' + dn.sat.join(', ') + ' — vận có sóng gió, tránh mạo hiểm');
    if (tone.length) hienTai.push(p('tuvi.tongket.now.tone', 'Trong vận này ' + tone.join('; ') + '.'));
    hienTai.push(p('tuvi.tongket.now.advice', '<b>Nên làm:</b> ' + DH_ADVICE[dh.cungTen]));
    const nx = dn.next;
    if (nx) hienTai.push(p('tuvi.tongket.now.next', 'Từ năm <b>' + nx.tuoiStart + ' tuổi</b> (khoảng năm ' + (ch.lunar.year + nx.tuoiStart - 1) + ') vận chuyển sang cung <b>' + nx.cungTen + '</b>, trọng tâm sẽ là chuyện ' + CUNG_PLAIN[nx.cungTen] + ' — nên chuẩn bị từ bây giờ.', { palace: nx.chi }));
  }
  const y0 = r.years[0]?.year === nowYear ? r.years[0] : null;
  if (y0) {
    const yl = yearLines(ch, y0);
    hienTai.push(p('tuvi.tongket.now.year', '<b>Riêng năm nay — ' + yearLabel(y0).toLowerCase() + ':</b> ' + yl.lines.slice(1).join(' ')));
    khuyen = yl.tips.slice(0, 2).concat(khuyen);
    hienTai.push({
      id: 'tuvi.tongket.now.chips', kind: 'chips',
      chips: r.years.map((y) => ({ text: y.year + ' (' + y.canChi + '): ' + yearLabel(y).replace('Năm ', ''), tone: y.tone })),
      after: parseRich('<small>Muốn xem chi tiết năm khác, dùng mục "Tra vận hạn theo năm" ở trên.</small>'),
    });
  }

  const titleOf = (key: AreaReading['key']) => AREA_LIST.find((x) => x.key === key)!;
  const strongA = r.areas.filter((a) => a.tone === 'ok').map((a) => titleOf(a.key).title);
  const weak = r.areas.filter((a) => a.tone === 'warn').map((a) => titleOf(a.key).title);
  if (strongA.length) viDu.push('Trong 6 mảng cuộc sống, mảng thuận nhất của bạn là: ' + strongA.join(', ') + ' — giống "sân nhà", làm ở đó dễ thấy kết quả hơn.');
  if (weak.length) khuyen.push('Mảng cần để ý nhiều hơn: ' + weak.join(', ') + ' — xem lời khuyên cụ thể ở phần "Từng mảng cuộc sống".');

  const sec = (id: string, title: string, items: string[], max: number): Section[] => {
    const xs = uniq(items).slice(0, max);
    return xs.length ? [{ id, title, blocks: [list(id + '.list', xs)] }] : [];
  };
  const out: Section[] = [
    {
      id: 'tuvi.tongket', title: 'Tóm lại: lá số này nói gì về bạn?', tone: r.tone,
      blocks: [
        { id: 'tuvi.tongket.verdict', kind: 'verdict', tone: r.tone, rich: parseRich(VERDICT[r.tone]), how: VERDICT_HOW },
        ...tomTat.map((t, i) => p('tuvi.tongket.tomtat.' + i, t, i === 0 ? { palace: ch.menhChi } : undefined)),
      ],
    },
    ...sec('tuvi.tongket.manh', '✅ Điểm mạnh', manh, 5),
    ...sec('tuvi.tongket.luuy', '⚠️ Điểm cần lưu ý', luuY, 5),
    {
      id: 'tuvi.tongket.areas', title: '🧭 Từng mảng cuộc sống',
      blocks: r.areas.map((a) => {
        const meta = titleOf(a.key);
        return {
          id: 'tuvi.tongket.area.' + a.key, kind: 'item' as const, ref: { palace: a.chi },
          title: parseRich(meta.icon + ' ' + meta.title + ' <small>(cung ' + meta.cung + ')</small>'),
          label: AREA_LABEL[a.tone], tone: a.tone, rich: parseRich(areaText(ch, a)),
        };
      }),
    },
  ];
  if (hienTai.length) out.push({ id: 'tuvi.tongket.now', title: '📅 Giai đoạn hiện tại', blocks: hienTai });
  out.push(...sec('tuvi.tongket.vidu', '💡 Ví dụ dễ hình dung', viDu, 4));
  out.push(...sec('tuvi.tongket.khuyen', '🎯 Lời khuyên thực tế', khuyen, 6));
  out.push({ id: 'tuvi.tongket.note', title: '', blocks: [note('tuvi.tongket.note.0', DEFAULT_NOTE)] });
  return out;
}
