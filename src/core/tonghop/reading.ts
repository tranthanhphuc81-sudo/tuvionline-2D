/* Phần TÍNH TOÁN của tab Tổng Hợp, chuyển từ legacy (lyso-toolkit.html: renderTongHop, relHanhPair). Giữ nguyên quy tắc và
   thứ tự xét. App luôn gộp 4 hệ thống của CÙNG một hồ sơ nên không còn trạng thái "chưa đồng bộ" của legacy.
   Chỉ trả số liệu/mã; câu chữ ở src/content/tonghop. */
import { HUONG_LIST, type BatTrachReading } from '../battrach/reading';
import { HANH, HAU_THIEN } from '../battrach/engine';
import type { Huong, Nhom, Quai } from '../battrach/types';
import { CAN, CHI } from '../canchi';
import { khacOf, sinhOf, type Hanh } from '../canchi/hanh';
import { batTuReading, type ThapThanFamily, type VuongSuyState } from '../battu/reading';
import type { BatTuChart } from '../battu/types';
import type { NapAmBirth } from '../napam/reading';
import { mainStarsOf } from '../tuvi/reading';
import type { TuViChart } from '../tuvi/types';

export type HanhRelKind = 'same' | 'a-sinh-b' | 'b-sinh-a' | 'a-khac-b' | 'b-khac-a';
export interface HanhRel { a: Hanh; b: Hanh; kind: HanhRelKind }

/** Quan hệ Ngũ hành giữa hai hành (legacy relHanhPair): xét sinh trước, khắc sau. */
export function hanhRel(a: Hanh, b: Hanh): HanhRel {
  const kind: HanhRelKind = a === b ? 'same'
    : sinhOf(a) === b ? 'a-sinh-b'
    : sinhOf(b) === a ? 'b-sinh-a'
    : khacOf(a) === b ? 'a-khac-b' : 'b-khac-a';
  return { a, b, kind };
}

/** Các hướng thuộc một hành (theo Hậu Thiên Bát Quái), khớp HANH_INFO[h].huong của legacy. */
export function huongOfHanh(h: Hanh): Huong[] {
  return HUONG_LIST.filter((x) => HANH[HAU_THIEN[x]] === h);
}

export interface TongHopReading {
  tuvi: {
    /** chính tinh cung Mệnh; cung trống thì mượn cung xung chiếu */
    mainStars: string[];
    cucHanh: Hanh;
    cucTen: string;
    napAmCucTen: string;
    menhChi: string;
    /** chính tinh ngay tại cung Mệnh (rỗng = Vô Chính Diệu) */
    menhStars: string[];
  };
  battu: {
    nhatChuCan: string;
    nhatChuHanh: Hanh;
    trangThai: VuongSuyState;
    thanVuong: boolean;
    primary: Hanh;
    topFamily: ThapThanFamily;
  };
  battrach: {
    quai: Quai;
    hanh: Hanh;
    nhom: Nhom;
    /** hướng Sinh Khí · hướng Thiên Y */
    sinhKhi: Huong;
    thienY: Huong;
    /** hướng "vàng": tốt theo Bát Trạch và thuộc hành hợp theo Bát Tự, giữ thứ tự sao tốt */
    gold: Huong[];
  };
  napam: { canChiTen: string; hanh: Hanh; ten: string };
  /** ba cặp đối chiếu chéo (mỗi hệ vốn độc lập, đây chỉ là cách nhìn tham khảo) */
  rel: { tuViBatTu: HanhRel; batTuNapAm: HanhRel; batTrachNapAm: HanhRel };
}

/** Gộp kết quả 4 hệ thống của một người. */
export function tongHopReading(tv: TuViChart, bt: BatTuChart, pt: BatTrachReading, na: NapAmBirth): TongHopReading {
  // Dụng Thần và Thập Thần không phụ thuộc năm xem; năm truyền vào chỉ dùng cho Đại Vận, ở đây không đọc tới.
  const br = batTuReading(bt, bt.tietYear);
  const nhatChuHanh = br.assessment.nhatChuHanh;
  const dungDirs = br.dung.flatMap(huongOfHanh);
  return {
    tuvi: {
      mainStars: mainStarsOf(tv, tv.menhChi).stars, cucHanh: tv.cucHanh, cucTen: tv.cucTen, napAmCucTen: tv.napAmTen,
      menhChi: CHI[tv.menhChi], menhStars: tv.stars[tv.menhChi] || [],
    },
    battu: {
      nhatChuCan: CAN[bt.nhatChu], nhatChuHanh, trangThai: br.assessment.trangThai, thanVuong: br.assessment.thanVuong,
      primary: br.primary, topFamily: br.profile.order[0],
    },
    battrach: {
      quai: pt.quai, hanh: pt.hanh, nhom: pt.nhom, sinhKhi: pt.goods[0].huong, thienY: pt.goods[1].huong,
      gold: pt.goods.map((g) => g.huong).filter((h) => dungDirs.includes(h)),
    },
    napam: { canChiTen: na.canChiTen, hanh: na.hanh, ten: na.ten },
    rel: { tuViBatTu: hanhRel(tv.cucHanh, nhatChuHanh), batTuNapAm: hanhRel(nhatChuHanh, na.hanh), batTrachNapAm: hanhRel(pt.hanh, na.hanh) },
  };
}
