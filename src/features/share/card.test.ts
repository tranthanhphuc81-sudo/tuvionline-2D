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
import { CARD_W, PAGE_H, cardReading, layoutPages, plain, wrapText, type CardSection, type DrawOp, type Measure, type ShareCard } from './card';

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

const one = (c: ShareCard) => layoutPages(c, measure)[0];
const longLine = (n: number): CardSection => ({ title: 'Mục', lines: Array.from({ length: n }, (_, i) => ({ kind: 'p' as const, text: 'Đoạn số ' + i })) });

describe('Bố cục thẻ', () => {
  it('thẻ ngắn chỉ có một ảnh, không in số ảnh', () => {
    const pages = layoutPages(card(), measure);
    expect(pages).toHaveLength(1);
    expect(texts(pages[0].ops).some((o) => o.text.startsWith('Ảnh '))).toBe(false);
  });

  it('mọi chữ nằm trong khổ ảnh, kể cả chữ rất dài', () => {
    const long = 'Rất dài '.repeat(40);
    for (const pg of layoutPages(card({ title: long, groups: [{ title: 'Nhóm', cells: [[long, long]] }], verdict: long }), measure)) {
      for (const o of texts(pg.ops)) {
        expect(o.x + measure(o.text, o.font)).toBeLessThanOrEqual(CARD_W);
        expect(o.y).toBeLessThan(pg.height);
      }
    }
  });

  it('nhãn và giá trị của hàng không đè lên hàng sau', () => {
    const t = texts(one(card({ groups: [{ cells: [['Nhãn rất dài '.repeat(4), 'Ngắn'], ['Sau', 'Giá trị']] }] })).ops);
    const lastLabelLine = t.filter((o) => o.text.includes('Nhãn')).at(-1)!;
    expect(t.find((o) => o.text === 'Sau')!.y).toBeGreaterThan(lastLabelLine.y);
  });

  it('thêm nhận định thì thẻ cao lên và có nền', () => {
    const a = one(card()), b = one(card({ verdict: 'Hướng Bắc ứng với sao Sinh Khí.' }));
    expect(b.height).toBeGreaterThan(a.height);
    expect(b.ops.filter((o) => o.kind === 'rect')).toHaveLength(2);
  });
});

describe('Chia nhiều ảnh', () => {
  const pages = layoutPages(card({ reading: [longLine(150)] }), measure);

  it('nội dung dài tách thành nhiều ảnh, không ảnh nào cao quá khung', () => {
    expect(pages.length).toBeGreaterThan(1);
    for (const pg of pages) expect(pg.height).toBeLessThanOrEqual(PAGE_H);
  });

  it('không mất đoạn nào, đúng thứ tự', () => {
    const got = pages.flatMap((pg) => texts(pg.ops).map((o) => o.text).filter((t) => t.startsWith('Đoạn số')));
    expect(got).toEqual(Array.from({ length: 150 }, (_, i) => 'Đoạn số ' + i));
  });

  it('ảnh nào cũng có dòng lưu ý văn hoá và số thứ tự', () => {
    pages.forEach((pg, i) => {
      const t = texts(pg.ops).map((o) => o.text);
      expect(t.join(' ')).toContain(CULTURAL_NOTE);
      expect(t).toContain(`Ảnh ${i + 1}/${pages.length}`);
    });
  });

  it('ảnh sau vẫn ghi công cụ và tên người, để ảnh gửi lẻ vẫn rõ là của ai', () => {
    expect(texts(pages[1].ops).map((o) => o.text)).toContain('Lá số Tử Vi · An');
  });

  it('tiêu đề mục không nằm trơ ở cuối ảnh', () => {
    const many: CardSection[] = Array.from({ length: 40 }, (_, i) => ({ title: 'Tiêu đề ' + i, lines: [{ kind: 'p', text: 'Nội dung ' + i }] }));
    for (const pg of layoutPages(card({ reading: many }), measure)) {
      const t = texts(pg.ops).filter((o) => /^(Tiêu đề|Nội dung)/.test(o.text));
      expect(t.at(-1)!.text.startsWith('Nội dung')).toBe(true);
    }
  });

  it('khối cao hơn cả một ảnh vẫn được in, không lặp vô tận', () => {
    const r = layoutPages(card({ reading: [{ title: 'M', lines: [{ kind: 'p', text: 'chữ '.repeat(3000) }] }] }), measure);
    expect(r.length).toBeGreaterThanOrEqual(1);
  });
});

describe('Phần tổng kết trên thẻ', () => {
  const secs: Section[] = [
    { id: 'x.tongket', title: 'Tóm lại: bạn', blocks: [
      { id: 'v', kind: 'verdict', tone: 'mid', rich: parseRich('<b>Mức khá.</b>'), how: 'Do công cụ tự chấm.' },
      p('p1', 'Dòng một<br>Dòng hai'),
    ] },
    { id: 'x.tongket.manh', title: '✅ Điểm mạnh', blocks: [list('l', ['Có <b>uy</b>'])] },
    { id: 'x.tongket.areas', title: '🧭 Từng mảng cuộc sống', blocks: [{ id: 'a', kind: 'item', title: parseRich('Công việc'), label: 'Thuận lợi', tone: 'ok', rich: parseRich('Tốt') }] },
    { id: 'x.tongket.now', title: '📅 Giai đoạn hiện tại', blocks: [{ id: 'c', kind: 'chips', chips: [{ text: '2026: tốt', tone: 'ok' }] }] },
    { id: 'x.tongket.tt', title: '🧩 Thập Thần', blocks: [{ id: 'b', kind: 'bars', rows: [{ label: 'Tài', pct: 40 }] }, note('h', 'Cách đếm')] },
    { id: 'x.tongket.note', title: '', blocks: [note('n', 'Ghi chú')] },
  ];

  it('giữ đủ các mục, bỏ biểu tượng ở tiêu đề và thẻ định dạng; bỏ section ghi chú không tiêu đề', () => {
    expect(cardReading(secs)).toEqual([
      { title: 'Tóm lại: bạn', lines: [{ kind: 'p', text: 'Mức khá.' }, { kind: 'small', text: 'Do công cụ tự chấm.' }, { kind: 'p', text: 'Dòng một' }, { kind: 'p', text: 'Dòng hai' }] },
      { title: 'Điểm mạnh', lines: [{ kind: 'bullet', text: 'Có uy' }] },
      { title: 'Từng mảng cuộc sống', lines: [{ kind: 'sub', text: 'Công việc — Thuận lợi' }, { kind: 'p', text: 'Tốt' }] },
      { title: 'Giai đoạn hiện tại', lines: [{ kind: 'bullet', text: '2026: tốt' }] },
      { title: 'Thập Thần', lines: [{ kind: 'bullet', text: 'Tài: 40%' }, { kind: 'small', text: 'Cách đếm' }] },
    ]);
  });

  it('phần tóm lại không có tiêu đề (Tổng hợp) thì dùng "Tóm lại"', () => {
    expect(cardReading([{ id: 'tonghop.tomlai', title: '', blocks: [p('a', 'Nội dung')] }])[0].title).toBe('Tóm lại');
  });

  it('gạch đầu dòng lùi vào, mục tổng kết nằm trước dòng lưu ý', () => {
    const long = 'Lời khuyên rất dài '.repeat(20);
    const t = texts(one(card({ reading: [{ title: 'Điểm mạnh', lines: [{ kind: 'bullet', text: long }] }] })).ops);
    const body = t.filter((o) => o.text.startsWith('Lời khuyên'));
    expect(new Set(body.map((o) => o.x)).size).toBe(1);
    expect(body[0].x).toBeGreaterThan(t.find((o) => o.text === '•')!.x);
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
