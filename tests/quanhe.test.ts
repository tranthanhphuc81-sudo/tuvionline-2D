/* Hình, xung, hội, hợp trong tứ trụ (src/core/cachcuc/quanhe.ts). */
import { describe, it, expect } from 'vitest';
import { quanHe } from '../src/core';
import { quanHeSection } from '../src/content/cachcuc/quanhe';
import { sectionPlainText } from '../src/content/rich';

const CAN = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
const CHI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
const of = (s: string) => {
  const p = s.split(' · ').map((x) => x.split(' '));
  const stems = p.map((x) => CAN.indexOf(x[0])), branches = p.map((x) => CHI.indexOf(x[1]));
  return { stems, branches, list: quanHe(stems as never, branches as never) };
};
const kinds = (s: string) => of(s).list.map((r) => r.kind).sort();

describe('quan hệ trong tứ trụ', () => {
  it('can hợp kề nhau và cách xa', () => {
    const { list } = of('Giáp Tý · Kỷ Sửu · Bính Dần · Đinh Mão');
    expect(list.find((r) => r.kind === 'can-hop')).toMatchObject({ pillars: [0, 1], to: 'Thổ', ke: true });
    expect(of('Giáp Tý · Bính Dần · Đinh Mão · Kỷ Tỵ').list.find((r) => r.kind === 'can-hop')).toMatchObject({ pillars: [0, 3], ke: false });
  });
  it('tam hợp đủ ba chi thì không tính thêm bán hợp; thiếu một chi thì là bán hợp', () => {
    expect(kinds('Giáp Thân · Bính Tý · Mậu Thìn · Canh Ngọ').filter((k) => k.includes('hop'))).toEqual(['tam-hop']);
    // Thân Tý bán hợp Thuỷ; Dần Ngọ cũng là bán hợp (Hoả)
    expect(of('Giáp Thân · Bính Tý · Mậu Dần · Canh Ngọ').list.filter((r) => r.kind === 'ban-hop').map((r) => r.to).sort()).toEqual(['Hoả', 'Thuỷ']);
  });
  it('tam hội phương', () => {
    expect(of('Giáp Dần · Đinh Mão · Canh Thìn · Nhâm Ngọ').list.find((r) => r.kind === 'tam-hoi')).toMatchObject({ to: 'Mộc', pillars: [0, 1, 2] });
  });
  it('lục xung, và xung được hợp giải', () => {
    const plain = of('Giáp Tý · Bính Ngọ · Mậu Dần · Canh Thìn').list.find((r) => r.kind === 'xung');
    expect(plain).toMatchObject({ pillars: [0, 1] });
    // Tý Ngọ xung, nhưng Tý đã Sửu hợp
    const solved = of('Giáp Tý · Bính Ngọ · Mậu Dần · Ất Sửu').list.find((r) => r.kind === 'xung');
    expect(solved?.giai).toBe(true);
  });
  it('tam hình, Tý Mão hình, tự hình, lục hại', () => {
    expect(kinds('Giáp Dần · Kỷ Tỵ · Canh Thân · Bính Tuất')).toContain('hinh');
    expect(kinds('Giáp Tý · Đinh Mão · Canh Thìn · Bính Tuất')).toContain('hinh');
    expect(kinds('Giáp Ngọ · Canh Ngọ · Mậu Thìn · Bính Tý')).toContain('tu-hinh');
    expect(kinds('Giáp Tý · Kỷ Mùi · Mậu Thìn · Bính Dần')).toContain('hai');
  });
  it('can xung', () => {
    expect(kinds('Giáp Tý · Canh Ngọ · Mậu Thìn · Bính Tuất')).toContain('can-xung');
  });
  it('câu chữ: không có quan hệ thì nói rõ; luôn có lời nhắc tham khảo', () => {
    const x = of('Giáp Tý · Bính Dần · Mậu Thìn · Canh Ngọ');
    const t = sectionPlainText(quanHeSection([], x.stems, x.branches));
    expect(t).toContain('không có cặp hợp');
    expect(t).toContain('tham khảo');
  });
});
