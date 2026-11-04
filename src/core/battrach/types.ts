import type { Gender, Quai } from '../types';
import type { Hanh } from '../canchi/hanh';

export type Huong = 'Bắc' | 'Đông Bắc' | 'Đông' | 'Đông Nam' | 'Nam' | 'Tây Nam' | 'Tây' | 'Tây Bắc';
export type StarName = 'Phục Vị' | 'Sinh Khí' | 'Thiên Y' | 'Diên Niên' | 'Tuyệt Mệnh' | 'Lục Sát' | 'Hoạ Hại' | 'Ngũ Quỷ';
export type Nhom = 'Đông Tứ Mệnh' | 'Tây Tứ Mệnh';

/** Một sao Du Niên đặt lên quái. Câu mô tả sao ở src/content/battrach/stars.ts. */
export interface DuNienStar { star: StarName; good: boolean; quai: Quai; hanh: Hanh }

export interface LySoYear { year: number; beforeLapXuan: boolean }

export type { Gender, Quai };
