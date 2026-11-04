/* resolveBirth: quy đổi hồ sơ (dương/âm lịch, tháng nhuận, Tý muộn) → đầu vào chung của engine. */
import { describe, it, expect } from 'vitest';
import { resolveBirth, quickProfile, tuViChart, batTuChart, TuViEngine, type BirthProfile } from '../src/core';
import { birthErrorText, birthNotesText } from '../src/content/common/birth';

const base: BirthProfile = { gender: 'M', calendar: 'solar', day: 15, month: 6, year: 1996, leapMonth: false, hourIdx: 6, lateTy: false };

describe('resolveBirth', () => {
  it('dương lịch hợp lệ: đổi ra âm lịch, ngày tính = ngày sinh', () => {
    const r = resolveBirth(base);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.solar).toEqual({ dd: 15, mm: 6, yy: 1996 });
    expect(r.lunar).toEqual({ day: 30, month: 4, year: 1996, leap: false });
    expect(r.input).toEqual({ gender: 'M', dd: 15, mm: 6, yy: 1996, hourIdx: 6 });
    expect(r.notes).toEqual([]);
  });
  it('báo lỗi 31/2 thay vì cuộn sang tháng 3', () => {
    const r = resolveBirth({ ...base, day: 31, month: 2 });
    expect(r).toEqual({ ok: false, errors: [{ code: 'invalid-solar', dd: 31, mm: 2, yy: 1996 }] });
    if (!r.ok) expect(birthErrorText(r.errors[0])).toBe('Ngày 31/2/1996 không tồn tại trên lịch dương (ví dụ tháng 2 chỉ có 28 hoặc 29 ngày) — vui lòng kiểm tra lại.');
  });
  it('âm lịch: 12/7/1979 (ví dụ Chương 10) đổi sang dương lịch', () => {
    const r = resolveBirth({ ...base, calendar: 'lunar', day: 12, month: 7, year: 1979, hourIdx: 4 });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect([r.solar.dd, r.solar.mm, r.solar.yy]).toEqual(TuViEngine.convertLunar2Solar(12, 7, 1979, 0, 7));
    expect(r.lunar).toEqual({ day: 12, month: 7, year: 1979, leap: false });
    expect(birthNotesText(r.notes)).toBe(`Quy đổi sang dương lịch: ${r.solar.dd}/${r.solar.mm}/${r.solar.yy}`);
  });
  it('âm lịch tháng nhuận có thật (2/2023 nhuận) và không có thật (3/2023 nhuận)', () => {
    const ok = resolveBirth({ ...base, calendar: 'lunar', day: 1, month: 2, year: 2023, leapMonth: true });
    expect(ok.ok && ok.solar).toEqual({ dd: 22, mm: 3, yy: 2023 });
    const bad = resolveBirth({ ...base, calendar: 'lunar', day: 1, month: 3, year: 2023, leapMonth: true });
    expect(bad).toEqual({ ok: false, errors: [{ code: 'no-leap-month', month: 3, year: 2023 }] });
    if (!bad.ok) expect(birthErrorText(bad.errors[0])).toBe('Năm 2023 không có tháng 3 nhuận — kiểm tra lại ô "Tháng nhuận?".');
  });
  it('âm lịch: 30 của tháng thiếu bị loại', () => {
    const r = resolveBirth({ ...base, calendar: 'lunar', day: 30, month: 1, year: 2024 });
    expect(r).toEqual({ ok: false, errors: [{ code: 'invalid-lunar', day: 30, month: 1, year: 2024, leap: false }] });
    if (!r.ok) expect(birthErrorText(r.errors[0])).toBe('Ngày âm lịch 30/1/2024 không tồn tại (tháng âm chỉ có 29 hoặc 30 ngày) — vui lòng kiểm tra lại.');
  });
  it('giờ Tý muộn cộng 1 ngày cho ngày tính, giữ ngày sinh; chỉ có tác dụng với giờ Tý', () => {
    const r = resolveBirth({ ...base, day: 31, month: 12, year: 1999, hourIdx: 0, lateTy: true });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.solar).toEqual({ dd: 31, mm: 12, yy: 1999 });
    expect(r.calcDate).toEqual({ dd: 1, mm: 1, yy: 2000 });
    expect(birthNotesText(r.notes)).toBe('Giờ Tý muộn: tính theo ngày 1/1/2000');
    const notTy = resolveBirth({ ...base, hourIdx: 1, lateTy: true });
    expect(notTy.ok && notTy.calcDate).toEqual({ dd: 15, mm: 6, yy: 1996 });
  });
  it('sinh trước 1968 có ghi chú UTC+8', () => {
    const r = resolveBirth({ ...base, year: 1960 });
    expect(r.ok && birthNotesText(r.notes)).toBe('Sinh trước 1968: lịch âm tính theo UTC+8');
  });
});

describe('Hàm gọn dùng đầu vào chung', () => {
  it('tuViChart/batTuChart khớp quickProfile', () => {
    const r = resolveBirth({ ...base, hourIdx: 0, lateTy: true });
    if (!r.ok) throw new Error('unreachable');
    const q = quickProfile({ gender: 'M', dd: 15, mm: 6, yy: 1996, hourIdx: 0, lateTy: true });
    expect(tuViChart(r.input)).toEqual(q.tuvi.chart);
    expect(batTuChart(r.input)).toEqual(q.battu.chart);
  });
});
