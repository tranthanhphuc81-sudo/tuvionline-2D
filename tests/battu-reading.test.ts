/* Phần tính toán luận giải Bát Tự (src/core/battu/reading.ts). Câu chữ được kiểm ở tests/parity/battu.test.ts. */
import { describe, it, expect } from 'vitest';
import { BatTuEngine, assessThan, batTuReading, batTuYearLookup, dungThanPattern, muaOf, tangCanOf, thapThanProfile } from '../src/core';

// Ví dụ vàng: 6/2/2021 giờ Ngọ → Tân Sửu · Canh Dần · Ất Dậu · Nhâm Ngọ
const ch = BatTuEngine.calcChart({ gender: 'M', dd: 6, mm: 2, yy: 2021, hourChiIdx: 6 });

describe('Bát Tự — Vượng Suy và Dụng Thần', () => {
  it('Nhật Chủ Ất Mộc sinh tháng Dần (Xuân) → Vượng, Đắc Lệnh', () => {
    const a = assessThan(ch);
    expect([a.nhatChuHanh, a.trangThai, a.dacLenh, muaOf(ch.monthChiIdx)]).toEqual(['Mộc', 'Vượng', true, 'Xuân']);
    // Can lộ: Tân (Thất Sát), Canh (Chính Quan), Nhâm (Chính Ấn) → 1 giúp / 2 hao → chưa đủ để Thân vượng
    expect([a.giup, a.hao, a.thanVuong]).toEqual([1, 2, false]);
  });
  it('2 vị Sát/Quan lộ kèm Ấn → mẫu "Sát trọng dụng Ấn"', () => {
    expect(dungThanPattern(ch, assessThan(ch))).toEqual({ kind: 'sat-an', soQuanSat: 2 });
    const r = batTuReading(ch, 2026);
    expect([r.satAn, r.dung, r.ky]).toEqual([true, ['Thuỷ', 'Mộc'], ['Kim']]);
  });
});

describe('Bát Tự — đếm hành và Thập Thần', () => {
  it('8 chữ: tổng số hành bằng 8', () => {
    const r = batTuReading(ch, 2026);
    expect(Object.values(r.count).reduce((a, b) => a + b, 0)).toBe(8);
  });
  it('tỷ lệ 5 nhóm Thập Thần cộng xấp xỉ 100%, xếp giảm dần', () => {
    const tp = thapThanProfile(ch);
    const sum = Object.values(tp.pct).reduce((a, b) => a + b, 0);
    expect(Math.abs(sum - 100)).toBeLessThanOrEqual(2);
    for (let i = 1; i < tp.order.length; i++) expect(tp.pct[tp.order[i - 1]]).toBeGreaterThanOrEqual(tp.pct[tp.order[i]]);
    expect(tp.topGods).toHaveLength(2);
  });
  it('Tàng Can của Dần: Giáp (Bản khí), Bính, Mậu', () => {
    expect(tangCanOf(ch, 2).map((t) => [BatTuEngine.CAN[t.can], t.level])).toEqual([['Giáp', 'Bản khí'], ['Bính', 'Trung khí'], ['Mậu', 'Dư khí']]);
  });
});

describe('Bát Tự — tra Lưu Niên', () => {
  it('tuổi theo năm tiết; Đại Vận đang đi; ngoài phạm vi thì null', () => {
    const y = batTuYearLookup(ch, 2021);
    expect(y.tuoi).toBe(1);
    const later = batTuYearLookup(ch, 2021 + ch.khoiVanYears + 15);
    expect(later.daiVanIndex).toBe(1);
    expect(batTuYearLookup(ch, 2000).daiVan).toBeNull();
  });
});
