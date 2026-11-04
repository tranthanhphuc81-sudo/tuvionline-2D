/* Phần TÍNH TOÁN của Bát Trạch, chuyển từ legacy (lyso-toolkit.html: tab Bát Trạch, LySoInterp.batTrach). Giữ nguyên quy tắc
   và thứ tự xét. Câu chữ ở src/content/battrach. */
import { jdToDateRounded, lapXuanJD } from '../calendar';
import type { SolarDate } from '../birth';
import type { Hanh } from '../canchi/hanh';
import { DOI_HUONG, HAU_THIEN, HANH, KHAC_NEXT, KHAC_PREV, QUAI_TO_HUONG, SINH_PREV, duNien, lySoYear, menhQuai, nhom } from './engine';
import type { DuNienStar, Gender, Huong, LySoYear, Nhom, Quai, StarName } from './types';

export type BtTone = 'ok' | 'mid' | 'warn';
export interface HuongSao { star: StarName; huong: Huong }

/** Thứ tự ưu tiên 4 sao tốt và 4 sao xấu (legacy GOOD_ORDER, BAD_ORDER). */
const GOOD_ORDER: readonly StarName[] = ['Sinh Khí', 'Thiên Y', 'Diên Niên', 'Phục Vị'];
const BAD_ORDER: readonly StarName[] = ['Tuyệt Mệnh', 'Ngũ Quỷ', 'Lục Sát', 'Hoạ Hại'];

export const HUONG_LIST: readonly Huong[] = ['Bắc', 'Đông Bắc', 'Đông', 'Đông Nam', 'Nam', 'Tây Nam', 'Tây', 'Tây Bắc'];

/** Trạch Quái: nhà toạ hướng đối diện cửa (legacy: DOI_HUONG rồi HAU_THIEN). */
export function trachQuaiOf(huongCua: Huong): Quai {
  return HAU_THIEN[DOI_HUONG[huongCua]];
}

export interface HouseReading {
  huongCua: Huong;
  toa: Huong;
  trachQuai: Quai;
  nhom: Nhom;
  /** nhà cùng nhóm Đông/Tây với Mệnh Quái */
  hop: boolean;
  /** sao Du Niên ứng với hướng CỬA nhìn ra */
  star: DuNienStar;
  tone: BtTone;
}

export interface BatTrachReading {
  ly: LySoYear;
  /** ngày Lập Xuân của năm sinh, chỉ có khi sinh trước Lập Xuân */
  lapXuan: SolarDate | null;
  quai: Quai;
  hanh: Hanh;
  nhom: Nhom;
  dn: DuNienStar[];
  goods: HuongSao[];
  bads: HuongSao[];
  house: HouseReading | null;
  /** hành sinh ra bản mệnh · hành khắc bản mệnh · hành bị bản mệnh khắc */
  sinhHanh: Hanh;
  khacHanh: Hanh;
  biKhacHanh: Hanh;
}

/** Luận Bát Trạch từ ngày sinh DƯƠNG (chưa cộng Tý muộn), giới tính và hướng cửa nếu có. */
export function batTrachReading(solar: SolarDate, gender: Gender, huongCua?: Huong): BatTrachReading {
  const ly = lySoYear(solar.dd, solar.mm, solar.yy, 7);
  const quai = menhQuai(ly.year, gender);
  const dn = duNien(quai);
  const huong = (star: StarName): HuongSao => ({ star, huong: QUAI_TO_HUONG[dn.find((x) => x.star === star)!.quai] });
  const hanh = HANH[quai];
  let house: HouseReading | null = null;
  if (huongCua) {
    const trachQuai = trachQuaiOf(huongCua);
    const hop = nhom(quai) === nhom(trachQuai);
    const star = dn.find((x) => x.quai === HAU_THIEN[huongCua])!;
    house = { huongCua, toa: DOI_HUONG[huongCua], trachQuai, nhom: nhom(trachQuai), hop, star, tone: hop && star.good ? 'ok' : star.good || hop ? 'mid' : 'warn' };
  }
  return {
    ly, lapXuan: ly.beforeLapXuan ? jdToDateRounded(lapXuanJD(solar.yy, 7)) : null,
    quai, hanh, nhom: nhom(quai), dn, goods: GOOD_ORDER.map(huong), bads: BAD_ORDER.map(huong), house,
    sinhHanh: SINH_PREV[hanh], khacHanh: KHAC_PREV[hanh], biKhacHanh: KHAC_NEXT[hanh],
  };
}
