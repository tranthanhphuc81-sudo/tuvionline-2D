/* Mô tả 8 sao Du Niên — chép NGUYÊN VĂN từ legacy (lyso-toolkit.html, STARS[].desc của engine Bát Trạch). */
import type { StarName } from '../../core';

export const DU_NIEN_DESC: Record<StarName, string> = {
  'Phục Vị': 'Giữ nguyên bản thân — ổn định, an nhàn, ít biến động.',
  'Sinh Khí': 'Sinh sôi, thăng tiến, tài lộc, sức khoẻ — cát tinh vượng nhất.',
  'Thiên Y': 'Sức khoẻ, quý nhân, thầy thuốc — hợp người bệnh, người cao tuổi.',
  'Diên Niên': 'Trường thọ, hoà hợp gia đạo, hôn nhân bền vững.',
  'Tuyệt Mệnh': 'Tổn hại nặng — sức khoẻ, tài chính; hung tinh nặng nhất.',
  'Lục Sát': 'Thị phi, kiện tụng, tai nạn nhỏ, xung khắc.',
  'Hoạ Hại': 'Phiền toái vặt, hao tài lặt vặt, cãi vã — nhẹ nhất trong 4 hung tinh.',
  'Ngũ Quỷ': 'Hoả hoạn, trộm cắp, thị phi lớn, dễ gây tai hoạ bất ngờ.',
};

export function duNienDesc(star: StarName): string {
  return DU_NIEN_DESC[star];
}
