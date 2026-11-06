import { describe, it, expect } from 'vitest';
import { batTrachReading, castContext, castHexagram, napAmPersonOfDate, profileSummary, tongHopOf } from '../../core';
import { batTrachTongKet } from '../../content/battrach/tongket';
import { batTuTongKet } from '../../content/battu/tongket';
import { CULTURAL_NOTE } from '../../content/common/notes';
import { lucHaoTongKet } from '../../content/luchao/tongket';
import { napAmTongKet } from '../../content/napam/tongket';
import { list, note, p, parseRich, type Section } from '../../content/rich';
import { tongHopParts } from '../../content/tonghop/explain';
import { tuViTongKet } from '../../content/tuvi/tongket';
import { CARD_W, cardReading, layoutCard, plain, wrapText, type DrawOp, type Measure, type ShareCard } from './card';

/** Đo giả: mỗi ký tự rộng 16px. */
const measure: Measure = (t) => t.length * 16;
const card = (over: Partial<ShareCard> = {}): ShareCard => ({ slug: 'x', title: 'Lá số Tử Vi', person: 'An', personLine: 'Nam · 15/6/1996', groups: [{ cells: [['Cục', 'Thuỷ Nhị Cục']] }], ...over });
const texts = (ops: DrawOp[]) => ops.flatMap((o) => (o.kind === 'text' ? [o] : []));

describe('Ngắt dòng', () => {
  it('giữ đủ chữ và không dòng nào vượt khổ', () => {
    const s = 'Công cụ mang tính văn hoá tham khảo không phải căn cứ để đưa ra quyết định quan trọng';
    const lines = wrapText(s, 'f', 320, measure);
    expect(lines.length).toBeGreaterThan(1);
    expect(lines.join(' ')).toBe(s);
    for (const l of lines) expect(measure(l, 'f')).toBeLessThanOrEqual(320);
  });

  it('từ dài hơn cả dòng thì cắt theo ký tự, không mất chữ', () => {
    const lines = wrapText('a'.repeat(50), 'f', 160, measure);
    expect(lines.join('')).toBe('a'.repeat(50));
    for (const l of lines) expect(l.length).toBeLessThanOrEqual(10);
  });

  it('chuỗi rỗng không sinh dòng', () => {
    expect(wrapText('  ', 'f', 100, measure)).toEqual([]);
  });
});

describe('Bố cục thẻ', () => {
  it('luôn có dòng lưu ý văn hoá ở cuối, kể cả thẻ không có hồ sơ', () => {
    const { ops } = layoutCard({ slug: 'x', title: 'La Bàn', groups: [] }, measure);
    const t = texts(ops);
    const fromNote = t.slice(t.findIndex((o) => CULTURAL_NOTE.startsWith(o.text)));
    expect(fromNote.map((o) => o.text).join(' ')).toBe(CULTURAL_NOTE);
  });

  it('mọi chữ nằm trong khổ ảnh, các dòng đi từ trên xuống trong chiều cao thẻ', () => {
    const long = 'Rất dài '.repeat(40);
    const { ops, height } = layoutCard(card({ title: long, groups: [{ title: 'Nhóm', cells: [[long, long]] }], verdict: long }), measure);
    const t = texts(ops);
    for (const o of t) {
      expect(o.x + measure(o.text, o.font)).toBeLessThanOrEqual(CARD_W);
      expect(o.y).toBeLessThan(height);
    }
  });

  it('nhãn và giá trị của hàng không đè lên hàng sau', () => {
    const { ops } = layoutCard(card({ groups: [{ cells: [['Nhãn rất dài '.repeat(4), 'Ngắn'], ['Sau', 'Giá trị']] }] }), measure);
    const t = texts(ops);
    const lastLabelLine = t.filter((o) => o.text.includes('Nhãn')).at(-1)!;
    expect(t.find((o) => o.text === 'Sau')!.y).toBeGreaterThan(lastLabelLine.y);
  });

  it('thêm nhận định thì thẻ cao lên và có nền', () => {
    const a = layoutCard(card(), measure), b = layoutCard(card({ verdict: 'Hướng Bắc ứng với sao Sinh Khí.' }), measure);
    expect(b.height).toBeGreaterThan(a.height);
    expect(b.ops.filter((o) => o.kind === 'rect')).toHaveLength(2);
  });
});

describe('Phần tổng kết trên thẻ', () => {
  const secs: Section[] = [
    { id: 'x.tongket', title: 'Tóm lại: bạn', blocks: [
      { id: 'v', kind: 'verdict', tone: 'mid', rich: parseRich('<b>Mức khá.</b>'), how: 'Do công cụ tự chấm.' },
      p('p1', 'Dòng một<br>Dòng hai'),
    ] },
    { id: 'x.tongket.manh', title: '✅ Điểm mạnh', blocks: [list('l', ['Có <b>uy</b>'])] },
    { id: 'x.tongket.areas', title: '🧭 Từng mảng cuộc sống', blocks: [p('a', 'Dài')] },
    { id: 'x.tongket.khuyen', title: '🎯 Lời khuyên thực tế', blocks: [list('k', ['Nên nghỉ'])] },
    { id: 'x.tongket.note', title: '', blocks: [note('n', 'Ghi chú')] },
  ];

  it('giữ phần tóm lại và 3 mục chính, bỏ biểu tượng ở tiêu đề, không dùng thẻ định dạng', () => {
    expect(cardReading(secs)).toEqual([
      { title: 'Tóm lại: bạn', lines: [{ kind: 'p', text: 'Mức khá.' }, { kind: 'small', text: 'Do công cụ tự chấm.' }, { kind: 'p', text: 'Dòng một' }, { kind: 'p', text: 'Dòng hai' }] },
      { title: 'Điểm mạnh', lines: [{ kind: 'bullet', text: 'Có uy' }] },
      { title: 'Lời khuyên thực tế', lines: [{ kind: 'bullet', text: 'Nên nghỉ' }] },
    ]);
  });

  it('phần tóm lại không có tiêu đề (Tổng hợp) thì dùng "Tóm lại"', () => {
    expect(cardReading([{ id: 'tonghop.tomlai', title: '', blocks: [p('a', 'Nội dung')] }])[0].title).toBe('Tóm lại');
  });

  it('mục tổng kết nằm trước dòng lưu ý, chữ gạch đầu dòng lùi vào và không tràn ảnh', () => {
    const long = 'Lời khuyên rất dài '.repeat(20);
    const { ops } = layoutCard(card({ reading: [{ title: 'Điểm mạnh', lines: [{ kind: 'bullet', text: long }] }] }), measure);
    const t = texts(ops);
    const body = t.filter((o) => o.text.startsWith('Lời khuyên'));
    expect(new Set(body.map((o) => o.x)).size).toBe(1);
    expect(body[0].x).toBeGreaterThan(t.find((o) => o.text === '•')!.x);
    for (const o of t) expect(o.x + measure(o.text, o.font)).toBeLessThanOrEqual(CARD_W);
    expect(body.at(-1)!.y).toBeLessThan(t.find((o) => CULTURAL_NOTE.startsWith(o.text))!.y);
  });
});

describe('Mọi công cụ có đủ phần tổng kết trên thẻ', () => {
  const res = profileSummary({ gender: 'M', calendar: 'solar', day: 15, month: 6, year: 1996, leapMonth: false, hourIdx: 6, lateTy: false });
  if (!res.ok) throw new Error('hồ sơ mẫu lỗi');
  const cast = castHexagram([7, 8, 9, 6, 7, 8]);
    it.each([
    ['Tử Vi', () => tuViTongKet(res.summary.tuvi.chart, 2026)],
    ['Bát Tự', () => batTuTongKet(res.summary.battu.chart, 2026)],
    ['Lục Hào', () => lucHaoTongKet(cast, castContext(6, 11, 2026), 'the')],
    ['Bát Trạch', () => batTrachTongKet(batTrachReading({ dd: 15, mm: 6, yy: 1996 }, 'M'))],
    ['Nạp Âm', () => napAmTongKet(napAmPersonOfDate(15, 6, 1996).res, null)],
    ['Tổng hợp', () => tongHopParts(tongHopOf(res.birth))[0].sections],
  ] as const)('%s', (_n, get) => {
    const r = cardReading(get());
    expect(r.length).toBeGreaterThanOrEqual(2);
    expect(r[0].lines.length).toBeGreaterThan(0);
  });
});

it('plain bỏ thẻ định dạng', () => {
  expect(plain('Hướng <b>Bắc</b> tốt')).toBe('Hướng Bắc tốt');
});
