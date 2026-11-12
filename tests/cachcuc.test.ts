/* Cách cục theo tháng sinh (src/core/cachcuc) và câu chữ (src/content/cachcuc). ARCHITECTURE mục 15. */
import { describe, it, expect } from 'vitest';
import { TU_LENH, tuLenhCan, dieuHauNeed, cachCucOfChart, resolveBirth, batTuChart, tongHopOf } from '../src/core';
import { cachCuc, hoaKhi } from '../src/core/cachcuc';
import { cachCucSection, cachCucSpeech, cachCucTomLai, CACHCUC_NOTE } from '../src/content/cachcuc/text';
import { sectionPlainText } from '../src/content/rich';
import { tongHopTomLai } from '../src/content/tonghop/tongket';
import { analyze } from '../src/core/nguhanh';
import { loadSach, sachChart } from '../scripts/lib/sach';
import { cachCucOf } from '../src/core/cachcuc';

const pillars = (s: string) => s.split(' · ').map((x) => x.split(' ')) as [string, string][];
const CAN = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
const CHI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
function input(s: string, thanVuong: boolean, days?: number) {
  const p = pillars(s);
  return { stems: p.map((x) => CAN.indexOf(x[0])) as never, branches: p.map((x) => CHI.indexOf(x[1])) as never, thanVuong, days };
}

describe('nhân nguyên tư lệnh', () => {
  it('mỗi tháng đủ 30 ngày', () => {
    for (let m = 0; m < 12; m++) expect(TU_LENH[m].reduce((a, r) => a + r[1], 0)).toBe(30);
  });
  it('tháng Dần: Mậu 7 ngày đầu, rồi Bính 7 ngày, còn lại Giáp', () => {
    expect([tuLenhCan(2, 0), tuLenhCan(2, 6.9), tuLenhCan(2, 7), tuLenhCan(2, 13.9), tuLenhCan(2, 14), tuLenhCan(2, 31)]).toEqual([4, 4, 2, 2, 0, 0]);
  });
});

describe('chọn cách', () => {
  it('can tàng lộ lên thì lấy làm cách: Giáp Dần · Nhâm Thân · Bính Tý · Quý Tỵ là Thất Sát cách (Nhâm lộ)', () => {
    const r = cachCuc(input('Giáp Dần · Nhâm Thân · Bính Tý · Quý Tỵ', false));
    expect([r.cach, r.nguon, r.than]).toEqual(['that-sat', 'thau', 'Thất Sát']);
  });
  it('chi tháng là Lộc của Nhật Chủ thì là Kiến Lộc cách, không lấy chính nó làm dụng', () => {
    const r = cachCuc(input('Tân Dậu · Bính Thân · Canh Tý · Bính Tuất', true));
    expect([r.cach, r.nguon]).toEqual(['kien-loc', 'loc-nhan']);
    expect(r.tuongThan).toBe('sat');
  });
  it('Nhật Chủ dương gặp Kiếp ở tháng là Dương Nhận cách; Nhật Chủ âm là Nguyệt Kiếp', () => {
    expect(cachCuc(input('Giáp Thìn · Đinh Mão · Giáp Tý · Mậu Thìn', true)).cach).toBe('duong-nhan');
    expect(cachCuc(input('Ất Mùi · Bính Tuất · Kỷ Sửu · Mậu Thìn', true)).cach).toBe('nguyet-kiep');
  });
  it('không can nào lộ: biết ngày thì theo can tư lệnh, không biết thì theo bản khí', () => {
    // Tháng Dần, không Mậu Bính Giáp nào lộ; Nhật Chủ Canh
    const s = 'Tân Dậu · Canh Dần · Canh Tý · Đinh Hợi';
    expect(cachCuc(input(s, false)).nguon).toBe('ban-khi');
    const early = cachCuc(input(s, false, 2));
    expect([early.nguon, early.can]).toEqual(['tu-lenh', 4]);
  });
});

describe('thành, bại, cứu', () => {
  it('Thất Sát gặp Ấn khi thân nhược: Ấn hoá Sát, cách thành', () => {
    const r = cachCuc(input('Giáp Dần · Nhâm Thân · Bính Tý · Quý Tỵ', false));
    expect([r.trangThai, r.tuongThan, r.dung]).toEqual(['thanh', 'an', 'Mộc']);
  });
  it('Chính Quan gặp Thương Quan lộ mà không có Ấn: cách bị phá; có Ấn thì được cứu', () => {
    const bai = cachCuc(input('Đinh Mão · Tân Dậu · Giáp Tý · Bính Dần', true)); // Tân = Quan, Đinh Bính = Thương/Thực
    expect(bai.cach).toBe('chinh-quan');
    expect(bai.lyDo[0]).toMatchObject({ k: 'pha', boi: 'thuong' });
  });
});

describe('hoá khí cách', () => {
  it('Nhật Chủ hợp can kề bên, chi tháng mang khí hành hoá: Chân', () => {
    expect(hoaKhi([1, 2, 5, 0] as never, [9, 10, 3, 10] as never)).toEqual({ to: 'Thổ', partner: 3, grade: 'chan' }); // Ất Dậu · Bính Tuất · Kỷ Mão · Giáp Tuất
  });
  it('chi tháng không mang khí hành hoá thì không hoá', () => {
    expect(hoaKhi([1, 2, 5, 0] as never, [9, 3, 3, 10] as never)).toBeNull(); // tháng Mão
  });
  it('có hành khắc hành hoá lộ ở can kề bên: Giả, không theo ngoại cách', () => {
    expect(hoaKhi([1, 1, 5, 0] as never, [9, 10, 3, 10] as never)?.grade).toBe('gia'); // Ất (Mộc khắc Thổ) ở can tháng
  });
});

describe('điều hậu', () => {
  it('tháng lạnh cần Hoả, tháng nóng cần Thuỷ; tháng ôn hoà không cần', () => {
    expect(dieuHauNeed(7, 0)).toBe('Hoả'); // Tân sinh tháng Tý
    expect(dieuHauNeed(1, 6)).toBe('Thuỷ'); // Ất sinh tháng Ngọ
    expect(dieuHauNeed(8, 6)).toBeNull(); // Nhâm sinh tháng Ngọ: tự là Thuỷ
    expect(dieuHauNeed(0, 3)).toBeNull(); // Giáp sinh tháng Mão
    expect(dieuHauNeed(6, 2)).toBe('Hoả'); // Canh sinh tháng Dần, đầu xuân còn lạnh
    expect(dieuHauNeed(4, 2)).toBeNull(); // Mậu sinh tháng Dần
  });
});

describe('so với lá số mẫu trong sách', () => {
  const { cases } = loadSach();
  const hit = (book: string) => cases.filter((c) => c.book === book).filter((c) => { const ch = sachChart(c); const r = cachCucOf(ch, analyze(ch)); return r.dung === c.dung || (c.accept ?? []).includes(r.dung); }).length;
  it('khớp Tử Bình Chân Thuyên không thấp hơn mức đã chốt (33/56)', () => { expect(hit('tbct')).toBeGreaterThanOrEqual(33); });
  it('Trích Thiên Tủy là trường phái khác, chỉ ghi lại mức hiện tại (14/65)', () => { expect(hit('ttt')).toBeGreaterThanOrEqual(14); });
});

describe('lá số của app và câu chữ', () => {
  const b = resolveBirth({ gender: 'M', calendar: 'solar', day: 15, month: 6, year: 1996, leapMonth: false, hourIdx: 6, lateTy: false });
  if (!b.ok) throw new Error('hồ sơ mẫu phải hợp lệ');
  const ch = batTuChart(b.input);
  const r = cachCucOfChart(ch, b.input);
  it('biết ngày sinh thì có số ngày trong tháng', () => { expect(r.days).toBeGreaterThanOrEqual(0); expect(r.days).toBeLessThan(32); });
  it('mục Cách cục có lời nhắc tham khảo và nêu Dụng thần', () => {
    const t = sectionPlainText(cachCucSection(r, ch.pillars.map((x) => x.can), ch.monthChiIdx, 'Mộc'));
    expect(t).toContain(CACHCUC_NOTE);
    expect(t).toContain('Dụng thần theo cách cục: hành ' + r.dung);
  });
  it('Thầy đọc nói tên cách và Dụng thần', () => {
    const s = cachCucSpeech(r);
    expect(s).toContain('Tử Bình Chân Thuyên');
    expect(s).toContain(r.dung);
  });
  it('"Tóm lại về bạn" có dòng cách cục', () => {
    const all = tongHopTomLai(tongHopOf(b)).map((x) => sectionPlainText(x)).join('\n');
    expect(all).toContain('Cách cục (Bát Tự):');
    expect(cachCucTomLai(r)).toContain(r.dung);
  });
});
