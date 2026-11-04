/* Chuẩn bị chữ để đọc thành lời (src/content/speech.ts). */
import { describe, it, expect } from 'vitest';
import { batTrachReading } from '../src/core';
import { batTrachTongKet } from '../src/content/battrach/tongket';
import { VERDICT_HOW } from '../src/content/tuvi/tongket';
import { SPEECH_MAX_CHUNK, cellsSpeech, chunkSpeech, normalizeForSpeech, richSpeech, sectionsSpeech, speechOf } from '../src/content/speech';

describe('chuẩn hoá', () => {
  it('ngày thành "ngày… tháng… năm…", kể cả tháng nhuận', () => {
    expect(normalizeForSpeech('Sinh 15/6/1996')).toBe('Sinh ngày 15 tháng 6 năm 1996');
    expect(normalizeForSpeech('Âm lịch 1/2 (nhuận)/2023')).toBe('Âm lịch ngày 1 tháng 2 nhuận năm 2023');
  });
  it('bỏ ký hiệu ·, →, /, —, emoji, ngoặc kép', () => {
    expect(normalizeForSpeech('Kỷ Mão · Đinh Sửu')).toBe('Kỷ Mão, Đinh Sửu');
    expect(normalizeForSpeech('Sinh trước Lập Xuân → tính theo năm 1999')).toBe('Sinh trước Lập Xuân, sang tính theo năm 1999');
    expect(normalizeForSpeech('Thế / Ứng')).toBe('Thế và Ứng');
    expect(normalizeForSpeech('✅ Điểm mạnh — tốt')).toBe('Điểm mạnh, tốt');
    expect(normalizeForSpeech('sao "Sinh Khí"')).toBe('sao Sinh Khí');
  });
  it('khoảng số, độ và phần trăm', () => {
    expect(normalizeForSpeech('Đại hạn 3–12 tuổi')).toBe('Đại hạn 3 đến 12 tuổi');
    expect(normalizeForSpeech('Hướng 45°')).toBe('Hướng 45 độ');
    expect(normalizeForSpeech('Tài 30%')).toBe('Tài 30 phần trăm');
  });
  it('dọn khoảng trắng và dấu lặp', () => {
    expect(normalizeForSpeech('  a  ,  b ..  ')).toBe('a, b.');
  });
});

describe('dựng chữ đọc', () => {
  it('ô "nhãn: giá trị", bỏ thẻ định dạng', () => {
    expect(cellsSpeech([['Mệnh Quái', 'Khảm'], ['Năm', '1999 <small>(sinh trước Tết)</small>']])).toBe('Mệnh Quái: Khảm. Năm: 1999 (sinh trước Tết).');
    expect(cellsSpeech([['Ngày', '2/2/2000<br><small>Âm lịch: 27/12/1999</small>']])).toBe('Ngày: 2/2/2000. Âm lịch: 27/12/1999.');
  });
  it('lời nhận định: bỏ thẻ', () => { expect(richSpeech('<b>Hợp</b> nhau')).toBe('Hợp nhau.'); });
  it('tổng kết: đọc tiêu đề và lời lưu ý, không đọc dòng giải thích cách chấm', () => {
    const r = batTrachReading({ dd: 15, mm: 6, yy: 1988 }, 'M', 'Bắc');
    const t = speechOf(sectionsSpeech(batTrachTongKet(r)));
    expect(t).toContain('Tóm lại: hướng nào hợp với bạn?');
    expect(t).toContain('Bát Trạch là một trong nhiều trường phái phong thủy');
    expect(t).not.toContain(VERDICT_HOW);
    expect(t).not.toMatch(/[✅⚠💡🎯]/u);
  });
  it('bỏ phần rỗng khi ghép', () => { expect(speechOf('a.', '', 'b.')).toBe('a. b.'); });
});

describe('chia đoạn', () => {
  const words = (n: number) => Array.from({ length: n }, (_, i) => 'từ' + i).join(' ');
  it('văn bản ngắn giữ nguyên một đoạn', () => { expect(chunkSpeech('Một câu. Hai câu.')).toEqual(['Một câu. Hai câu.']); });
  it('rỗng thì không có đoạn nào', () => { expect(chunkSpeech('')).toEqual([]); });
  it('mọi đoạn ≤ 180 ký tự và không mất chữ', () => {
    const r = batTrachReading({ dd: 15, mm: 6, yy: 1988 }, 'M', 'Bắc');
    const t = speechOf(sectionsSpeech(batTrachTongKet(r)));
    const c = chunkSpeech(t);
    c.forEach((x) => expect(x.length).toBeLessThanOrEqual(SPEECH_MAX_CHUNK));
    expect(c.join(' ').replace(/\s+/g, '')).toBe(t.replace(/\s+/g, ''));
  });
  it('câu quá dài không có dấu chấm: cắt ở dấu phẩy hoặc khoảng trắng', () => {
    const t = words(100);
    const c = chunkSpeech(t);
    expect(c.length).toBeGreaterThan(1);
    c.forEach((x) => { expect(x.length).toBeLessThanOrEqual(SPEECH_MAX_CHUNK); expect(x).not.toMatch(/^\s|\s$/); });
    expect(c.join(' ')).toBe(t);
  });
  it('một từ dài bất thường vẫn cắt được', () => {
    chunkSpeech('a'.repeat(500)).forEach((x) => expect(x.length).toBeLessThanOrEqual(SPEECH_MAX_CHUNK));
  });
});
