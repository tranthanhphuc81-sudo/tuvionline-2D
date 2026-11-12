/* "Tóm lại về bạn" của tab Tổng Hợp — NGUYÊN VĂN legacy renderTongHop + block(). Phép tính ở src/core/tonghop/reading.ts. */
import type { TongHopReading } from '../../core';
import type { Section } from '../rich';
import { tongKetSections } from '../common/tongket';
import { CAN_TRAITS, FAMILY } from '../interp/battu';
import { HANH_INFO } from '../interp/hanh';
import { NAPAM_IMG } from '../interp/napam';
import { STAR } from '../interp/tuvi';
import { cachCucTomLai } from '../cachcuc/text';
import { DEFAULT_NOTE } from '../tuvi/tongket';

export function tongHopTomLai(r: TongHopReading): Section[] {
  const { tuvi, battu, battrach, napam } = r;
  const tomTat: string[] = [], manh: string[] = [], viDu: string[] = [], khuyen: string[] = [];

  const net = tuvi.mainStars.map((x) => (STAR[x] ? x + ' (' + STAR[x].net + ')' : x)).join(' kết hợp ');
  if (net) tomTat.push('<b>Tính cách nổi bật (Tử Vi):</b> ' + net + '.');
  const ct = CAN_TRAITS[battu.nhatChuCan];
  tomTat.push('<b>Bản chất (Bát Tự):</b> Nhật Chủ ' + battu.nhatChuCan + ' — ' + ct.hinh + ' (' + ct.net + ').');
  tomTat.push('<b>Mạng (Nạp Âm):</b> ' + napam.ten + ' — ' + (NAPAM_IMG[napam.ten] || '') + '.');
  // Thêm ngoài legacy (ARCHITECTURE 15.5): test đối chiếu tonghop bỏ dòng này khi so
  if (r.cachCuc) tomTat.push(cachCucTomLai(r.cachCuc));

  const info = HANH_INFO[battu.primary];
  manh.push('Hành nên bổ sung nhất (theo Bát Tự): <b>' + battu.primary + '</b> — màu ' + info.mau + '.');
  khuyen.push('Chọn đồ dùng hằng ngày (ví, ốp điện thoại, áo khoác, xe) có màu ' + info.mau + '.');
  khuyen.push('Nghề nghiệp/lĩnh vực nên cân nhắc: ' + FAMILY[battu.topFamily].nghe + ' (theo Thập Thần nổi bật) — ưu tiên những việc thuộc nhóm ngành hợp hành ' + battu.primary + ': ' + info.nghe + '.');

  manh.push('Hướng tốt nhất (theo Bát Trạch): <b>' + battrach.sinhKhi + '</b> (Sinh Khí) cho cửa và bàn làm việc, <b>' + battrach.thienY + '</b> (Thiên Y) cho đầu giường.');
  const gold = battrach.gold;
  if (gold.length) {
    manh.push('Hướng "vàng" — vừa tốt theo Bát Trạch, vừa hợp hành nên bổ sung theo Bát Tự: <b>' + gold.join(', ') + '</b>.');
    khuyen.unshift('Ưu tiên đặt bàn làm việc nhìn về hướng <b>' + gold[0] + '</b> — hướng hợp với bạn theo cả hai hệ thống.');
  } else {
    khuyen.unshift('Đặt bàn làm việc nhìn về hướng <b>' + battrach.sinhKhi + '</b>, đầu giường về hướng <b>' + battrach.thienY + '</b>.');
  }
  viDu.push('Ví dụ khi sắp xếp phòng làm việc: kê bàn sao cho khi ngồi, mặt bạn nhìn về hướng ' + (gold[0] ?? battrach.sinhKhi) + '; nếu phòng không cho phép, đổi màu đồ dùng trên bàn sang màu hợp mệnh cũng là cách bù đắp đơn giản.');

  const st = tuvi.mainStars.length ? STAR[tuvi.mainStars[0]] : undefined;
  if (st) { viDu.push(st.viDu); khuyen.push(st.khuyen[0]); }
  khuyen.push('Xem từng tab để biết giai đoạn hiện tại (vận 10 năm, năm nay) và lời khuyên chi tiết hơn.');

  return tongKetSections('tonghop.tomlai', { title: '', tomTat, manh, luuY: [], viDu, khuyen, note: DEFAULT_NOTE })
    .map((s) => (s.id === 'tonghop.tomlai.manh' ? { ...s, title: '📌 Điểm chính' } : s));
}
