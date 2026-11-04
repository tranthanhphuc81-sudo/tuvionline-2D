/* "Tổng kết" của Bát Trạch — NGUYÊN VĂN legacy LySoInterp.batTrach() + block(). Phép xét ở src/core/battrach/reading.ts. */
import type { BatTrachReading, BtTone } from '../../core';
import { tongKetSections } from '../common/tongket';
import { HANH_INFO } from '../interp/hanh';
import type { Section } from '../rich';

export const BATTRACH_NOTE = 'Bát Trạch là một trong nhiều trường phái phong thủy — dùng để tham khảo khi bố trí nhà cửa, không thay thế khảo sát thực tế (ánh sáng, thông gió, pháp lý).';

const GOOD_USE: Record<string, string> = { 'Sinh Khí': 'tài lộc, thăng tiến', 'Thiên Y': 'sức khoẻ, quý nhân', 'Diên Niên': 'tình cảm, hoà thuận gia đình', 'Phục Vị': 'ổn định, học hành, tĩnh tâm' };

export function batTrachTongKet(r: BatTrachReading): Section[] {
  const { quai, hanh, goods, bads, house } = r;
  const tomTat = ['Bạn có Mệnh Quái <b>' + quai + '</b> (hành ' + hanh + '), thuộc <b>' + r.nhom + '</b>. 4 hướng tốt của bạn là: '
    + goods.map((g) => '<b>' + g.huong + '</b> (' + g.star + ' — ' + GOOD_USE[g.star] + ')').join(', ')
    + '. 4 hướng nên tránh: ' + bads.map((b) => b.huong + ' (' + b.star + ')').join(', ') + '.'];
  const manh: string[] = [], luuY: string[] = [], viDu: string[] = [], khuyen: string[] = [];
  let verdict: { html: string; tone: BtTone } | null = null;
  if (house) {
    const s = house.star, hc = house.huongCua;
    if (house.tone === 'ok') verdict = { tone: 'ok', html: '<b>Nhà này hợp với bạn.</b> Cửa chính hướng ' + hc + ' đón sao ' + s.star + ' (tốt) và nhà cùng nhóm với mệnh của bạn.' };
    else if (house.tone === 'mid') verdict = { tone: 'mid', html: '<b>Nhà này ở mức tạm được.</b> Cửa chính hướng ' + hc + ' ứng với sao ' + s.star + ' (' + (s.good ? 'tốt' : 'xấu') + ')' + (house.hop ? '' : ' nhưng nhà khác nhóm với mệnh của bạn') + ' — bố trí nội thất đúng cách sẽ bù đắp được.' };
    else verdict = { tone: 'warn', html: '<b>Nhà này chưa hợp với bạn.</b> Cửa chính hướng ' + hc + ' rơi vào sao ' + s.star + ' (xấu) và nhà khác nhóm với mệnh của bạn. Không cần sửa nhà tốn kém — ưu tiên bố trí lại nội thất theo hướng tốt.' };
    if (!s.good) {
      khuyen.push('Nếu có cửa phụ/lối đi khác quay về hướng ' + goods[0].huong + ' hoặc ' + goods[1].huong + ', hãy dùng làm lối đi chính hằng ngày.');
      khuyen.push('Làm sáng, gọn lối vào cửa chính; tránh để đồ đạc bừa bộn chắn cửa.');
    }
  }
  manh.push('Hướng <b>' + goods[0].huong + '</b> (Sinh Khí) là hướng mạnh nhất của bạn — hợp cho cửa chính, bàn làm việc, nơi bàn chuyện tiền bạc.');
  manh.push('Hướng <b>' + goods[1].huong + '</b> (Thiên Y) hợp cho đầu giường — tốt cho giấc ngủ, sức khoẻ.');
  luuY.push('Hướng <b>' + bads[0].huong + '</b> (Tuyệt Mệnh) là hướng xấu nhất — tránh đặt cửa chính, đầu giường, bàn làm việc ở hướng này.');
  luuY.push('Hướng <b>' + bads[1].huong + '</b> (Ngũ Quỷ) dễ gây thị phi, hao tài — nhưng lại là chỗ hợp để đặt BẾP (toạ hung, hướng cát).');
  viDu.push('Phòng ngủ có thể kê giường theo nhiều hướng: hãy chọn sao cho <b>đầu giường</b> quay về hướng ' + goods[1].huong + ' (Thiên Y) hoặc ' + goods[0].huong + ' (Sinh Khí).');
  viDu.push('Khi ngồi làm việc, <b>mặt nhìn</b> về hướng ' + goods[0].huong + ' hoặc ' + goods[2].huong + ' — nếu phòng không cho phép, xoay bàn chéo một góc cũng được.');
  viDu.push('Bếp nấu nên đặt ở góc ' + bads[1].huong + ' hoặc ' + bads[0].huong + ' của nhà, còn mặt bếp (hướng người đứng nấu nhìn vào) quay về ' + goods[0].huong + ' hoặc ' + goods[2].huong + '.');
  khuyen.push('Cửa chính: ưu tiên hướng ' + goods[0].huong + ', sau đó ' + goods[2].huong + ' hoặc ' + goods[1].huong + '.');
  khuyen.push('Giường ngủ: đầu giường hướng ' + goods[1].huong + '. Bàn làm việc: mặt nhìn hướng ' + goods[0].huong + '.');
  khuyen.push('Màu sắc nên dùng nhiều: ' + HANH_INFO[hanh].mau + ' và ' + HANH_INFO[r.sinhHanh].mau + '; hạn chế ' + HANH_INFO[r.khacHanh].mau + '.');
  khuyen.push('Khi đi xem nhà: đứng ở cửa chính, quay lưng vào nhà, dùng la bàn (hoặc app la bàn) đo hướng nhìn ra — đó là "hướng nhà" để đối chiếu với danh sách ở trên.');
  return tongKetSections('battrach.tongket', { title: 'Tóm lại: hướng nào hợp với bạn?', verdict, tomTat, manh, luuY, viDu, khuyen, note: BATTRACH_NOTE });
}
