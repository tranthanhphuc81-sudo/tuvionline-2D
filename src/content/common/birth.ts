/* Câu báo lỗi / ghi chú khi quy đổi ngày sinh — chép NGUYÊN VĂN từ legacy (form Tử Vi của lyso-toolkit.html). */
import type { BirthError, BirthNote } from '../../core';

export function birthErrorText(e: BirthError): string {
  switch (e.code) {
    case 'no-leap-month':
      return 'Năm ' + e.year + ' không có tháng ' + e.month + ' nhuận — kiểm tra lại ô "Tháng nhuận?".';
    case 'invalid-lunar':
      return 'Ngày âm lịch ' + e.day + '/' + e.month + (e.leap ? ' (nhuận)' : '') + '/' + e.year + ' không tồn tại (tháng âm chỉ có 29 hoặc 30 ngày) — vui lòng kiểm tra lại.';
    case 'invalid-solar':
      return 'Ngày ' + e.dd + '/' + e.mm + '/' + e.yy + ' không tồn tại trên lịch dương (ví dụ tháng 2 chỉ có 28 hoặc 29 ngày) — vui lòng kiểm tra lại.';
  }
}

/** Ghi chú quy đổi, nối bằng " · " như legacy. */
export function birthNotesText(notes: readonly BirthNote[]): string {
  return notes.map((n) => {
    switch (n.code) {
      case 'from-lunar': return 'Quy đổi sang dương lịch: ' + n.solar.dd + '/' + n.solar.mm + '/' + n.solar.yy;
      case 'late-ty': return 'Giờ Tý muộn: tính theo ngày ' + n.calcDate.dd + '/' + n.calcDate.mm + '/' + n.calcDate.yy;
      case 'before-1968': return 'Sinh trước 1968: lịch âm tính theo UTC+8';
    }
  }).join(' · ');
}
