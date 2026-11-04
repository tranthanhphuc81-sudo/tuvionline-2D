/* Phần tính toán Bát Trạch, Nạp Âm (src/core/battrach/reading.ts, src/core/napam/reading.ts). Câu chữ kiểm ở tests/parity/. */
import { describe, it, expect } from 'vitest';
import { NapAmEngine, batTrachReading, napAmCompat, resolveNapAmInput, trachQuaiOf } from '../src/core';

describe('Bát Trạch', () => {
  it('ví dụ Chương 10: Nam 1988, nhà toạ Tây Nam hướng Đông Bắc', () => {
    const r = batTrachReading({ dd: 15, mm: 6, yy: 1988 }, 'M', 'Đông Bắc');
    expect(r.quai).toBe('Chấn');
    expect(r.house).toMatchObject({ toa: 'Tây Nam', trachQuai: 'Khôn', hop: false });
    expect(r.lapXuan).toBeNull();
  });
  it('sinh trước Lập Xuân: lùi năm lý số và cho biết ngày Lập Xuân', () => {
    const r = batTrachReading({ dd: 2, mm: 2, yy: 2000 }, 'M');
    expect(r.ly).toEqual({ year: 1999, beforeLapXuan: true });
    expect(r.lapXuan).toMatchObject({ mm: 2, yy: 2000 });
  });
  it('4 hướng tốt và 4 hướng xấu chia đủ 8 hướng', () => {
    const r = batTrachReading({ dd: 15, mm: 6, yy: 1990 }, 'F');
    expect(new Set([...r.goods, ...r.bads].map((x) => x.huong)).size).toBe(8);
    expect(r.goods[0].star).toBe('Sinh Khí');
    expect(r.bads[0].star).toBe('Tuyệt Mệnh');
  });
  it('chấm nhà: cùng nhóm và sao tốt là ok, thiếu một là mid, thiếu cả hai là warn', () => {
    for (const huong of ['Bắc', 'Đông Bắc', 'Đông', 'Đông Nam', 'Nam', 'Tây Nam', 'Tây', 'Tây Bắc'] as const) {
      const h = batTrachReading({ dd: 15, mm: 6, yy: 1988 }, 'M', huong).house!;
      expect(h.tone).toBe(h.hop && h.star.good ? 'ok' : h.hop || h.star.good ? 'mid' : 'warn');
    }
  });
  it('Trạch Quái lấy theo hướng toạ (đối diện cửa)', () => {
    expect(trachQuaiOf('Bắc')).toBe('Ly');
    expect(trachQuaiOf('Nam')).toBe('Khảm');
  });
});

describe('Nạp Âm', () => {
  const y = NapAmEngine.napAmOfYear;
  it('chỉ có năm: dùng đúng năm; có ngày trước Tết: lùi năm âm', () => {
    const a = resolveNapAmInput('', '', '1990');
    expect(a.ok && a.person.res.year).toBe(1990);
    const b = resolveNapAmInput('20', '1', '1990');
    expect(b.ok && [b.person.res.year, b.person.shifted]).toEqual([1989, true]);
  });
  it('ngày không tồn tại không bị "cuộn"', () => {
    expect(resolveNapAmInput('31', '2', '1990')).toEqual({ ok: false, error: { code: 'invalid-date', dd: 31, mm: 2, yy: 1990 } });
  });
  it('ngoại lệ: Đại Hải Thuỷ gặp Sa Trung Thổ vẫn là thuận', () => {
    expect(y(1982).ten).toBe('Đại Hải Thuỷ');
    expect(y(1976).ten).toBe('Sa Trung Thổ');
    expect(napAmCompat(y(1982), y(1976)).rel.kind).toBe('exc-dai-hai-sa-trung');
  });
  it('mức hợp theo tổng điểm mạng + tuổi', () => {
    for (let a = 1984; a < 2044; a++) for (let b = 1984; b < 2044; b += 7) {
      const c = napAmCompat(y(a), y(b));
      expect(c.level).toBe(c.score >= 2 ? 'rat-hop' : c.score === 1 ? 'hop' : c.score === 0 ? 'binh-thuong' : 'dung-hoa');
    }
  });
});
