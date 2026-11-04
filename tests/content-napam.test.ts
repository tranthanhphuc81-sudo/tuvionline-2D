/* Nạp Âm: engine trả mã, src/content dựng lại câu văn nguyên văn của legacy. */
import { describe, it, expect } from 'vitest';
import { NapAmEngine } from '../src/core';
import { napAmRelationText } from '../src/content/napam/relation';

const y = (n: number) => NapAmEngine.napAmOfYear(n);

describe('Nạp Âm — mã quan hệ và câu văn', () => {
  it('Kim khắc Mộc (1985 → 1981): Người 2 khắc Người 1', () => {
    const a = y(1981), b = y(1985);
    const r = NapAmEngine.relation(a, b);
    expect(r).toEqual({ cls: 'warn', kind: 'khac', from: 2, to: 1 });
    expect(napAmRelationText(r, a, b)).toBe('Kim khắc Mộc — theo Ngũ hành gốc, mạng Người 2 (Hải Trung Kim) khắc mạng Người 1 (Thạch Lựu Mộc). Đây là MỘT lớp tham khảo khi xem tuổi hợp hôn, cần cân nhắc thêm cùng các yếu tố khác (tuổi xung theo Chi, Cung phi Bát Trạch...), không phải căn cứ duy nhất hay mang tính quyết định.');
  });
  it('Kiếm Phong Kim gặp Hoả là ngoại lệ có lợi', () => {
    const a = y(1992), b = y(1978);
    const r = NapAmEngine.relation(a, b);
    expect(r).toEqual({ cls: 'ok', kind: 'exc-needs', from: 1, to: 2, needs: 'kim-tho' });
    expect(napAmRelationText(r, a, b)).toBe('Kiếm Phong Kim (là kim loại thô, cần Hoả để nung/luyện mới thành khí cụ hoàn chỉnh) — nên mạng Hoả (Thiên Thượng Hoả) của người kia KHÔNG bị xem là khắc mà ngược lại còn được xem là có lợi, dù theo Ngũ hành gốc Hoả khắc Kim. Đây là 1 trong 4 ngoại lệ sinh khắc đặc biệt của Nạp Âm (mục 5, Phụ lục Nạp Âm).');
  });
  it('cùng hành và tương sinh', () => {
    expect(napAmRelationText(NapAmEngine.relation(y(1984), y(1985)), y(1984), y(1985))).toBe('Hai mạng cùng hành Kim — dân gian xem là hoà hợp, ngang bằng, không xung khắc.');
    const a = y(1984), b = y(1996); // Hải Trung Kim, Giản Hạ Thuỷ
    expect(napAmRelationText(NapAmEngine.relation(a, b), a, b)).toBe('Kim sinh Thuỷ — mạng Người 1 (Hải Trung Kim) tương sinh, trợ lực cho mạng Người 2 (Giản Hạ Thuỷ).');
  });
  it('Đại Hải Thuỷ dung nạp Sa Trung Thổ, theo cả hai chiều', () => {
    const dh = y(1982), st = y(1977); // Nhâm Tuất, Đinh Tỵ
    expect([dh.ten, st.ten]).toEqual(['Đại Hải Thuỷ', 'Sa Trung Thổ']);
    expect(NapAmEngine.relation(st, dh).kind).toBe('exc-dai-hai-sa-trung');
    expect(NapAmEngine.relation(dh, st).cls).toBe('ok');
  });
});
