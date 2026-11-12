/* Dòng chảy của khí và tính tình theo ngũ hành (src/core/cachcuc/dongkhi.ts). */
import { describe, it, expect } from 'vitest';
import { dongKhi, noiVang } from '../src/core';
import { dongKhiSection, tinhTinhSection } from '../src/content/cachcuc/dongkhi';
import { sectionPlainText } from '../src/content/rich';

const S = (mo: number, hoa: number, tho: number, kim: number, thuy: number) => ({ 'Mộc': mo, 'Hoả': hoa, 'Thổ': tho, 'Kim': kim, 'Thuỷ': thuy });

describe('dòng chảy của khí', () => {
  it('bắt đầu ở hành mạnh nhất, đi theo vòng sinh tới khi gặp hành vắng', () => {
    const d = dongKhi(S(0.1, 0.04, 0.06, 0.45, 0.35), 'Mộc');
    expect([d.nguon, d.duong, d.dung, d.tac, d.quaNhatChu]).toEqual(['Kim', ['Kim', 'Thuỷ', 'Mộc'], 'Mộc', 'Hoả', true]);
  });
  it('đủ năm hành thì đi trọn vòng, không nghẽn', () => {
    const d = dongKhi(S(0.2, 0.2, 0.2, 0.2, 0.2), 'Thổ');
    expect(d.duong).toHaveLength(5);
    expect(d.tac).toBeNull();
  });
  it('dừng ngay ở nguồn khi hành kế tiếp vắng; báo chưa về tới Nhật Chủ', () => {
    const d = dongKhi(S(0.05, 0.6, 0.02, 0.2, 0.13), 'Kim');
    expect([d.duong, d.tac, d.quaNhatChu]).toEqual([['Hoả'], 'Thổ', false]);
    expect(sectionPlainText(dongKhiSection(d, 'Kim'))).toContain('chưa về tới bản thân');
  });
});

describe('tính tình', () => {
  it('hành nổi và hành vắng', () => {
    expect(noiVang(S(0.05, 0.6, 0.02, 0.2, 0.13))).toEqual({ noi: 'Hoả', vang: ['Mộc', 'Thổ'] });
  });
  it('câu chữ có lời nhắc tham khảo, gợi cách bù cho hành vắng', () => {
    const t = sectionPlainText(tinhTinhSection('Hoả', ['Thổ']));
    expect(t).toContain('chữ "lễ"');
    expect(t).toContain('có thể bù bằng cách');
    expect(t).toContain('tham khảo');
  });
});
