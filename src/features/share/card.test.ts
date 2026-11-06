import { describe, it, expect } from 'vitest';
import { CULTURAL_NOTE } from '../../content/common/notes';
import { CARD_W, layoutCard, plain, wrapText, type DrawOp, type Measure, type ShareCard } from './card';

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

it('plain bỏ thẻ định dạng', () => {
  expect(plain('Hướng <b>Bắc</b> tốt')).toBe('Hướng Bắc tốt');
});
