/* Câu chữ "Dòng chảy của khí" và "Tính tình theo ngũ hành" (ARCHITECTURE 15.7). Nội dung mới, viết bằng lời của app.
   Tính tình viết theo hướng gợi ý, không gán nhãn xấu; ngũ thường (nhân, lễ, tín, nghĩa, trí) là cách ghép phổ biến trong sách lý số. */
import type { DongKhi, Hanh } from '../../core';
import { note, p, type Block, type Section } from '../rich';

export function dongKhiSection(d: DongKhi, nhatChu: Hanh): Section {
  const path = d.duong.join(' → ');
  const blocks: Block[] = [
    p('dongkhi.duong', 'Khí trong lá số mạnh nhất ở hành <b>' + d.nguon + '</b>, rồi chảy theo vòng tương sinh: <b>' + path + '</b>.'),
    p('dongkhi.dung', d.tac
      ? 'Khí dừng ở hành ' + d.dung + ', vì hành kế tiếp là ' + d.tac + ' gần như vắng: dòng chảy bị nghẽn ở đó.'
      : 'Khí đi trọn vòng năm hành, không bị nghẽn ở đâu: sách xem đây là dòng chảy thông.'),
    p('dongkhi.nhatchu', d.quaNhatChu
      ? 'Đường chảy đi qua hành ' + nhatChu + ' của Nhật Chủ, tức bản thân nhận được dòng khí đó.'
      : 'Đường chảy chưa đi qua hành ' + nhatChu + ' của Nhật Chủ: khí mạnh nhưng chưa về tới bản thân, nên sách hay tìm hành nối (thông quan) để dẫn khí về.'),
    note('dongkhi.note', 'Theo ý "nguyên lưu" của sách Trích Thiên Tủy: xem khí bắt đầu từ đâu và chảy về đâu. Đây là cách nhìn để hiểu lá số, không phải lời đoán.'),
  ];
  return { id: 'dongkhi', title: '', blocks };
}

const TINH: Record<Hanh, { duc: string; net: string; qua: string; thieu: string }> = {
  'Mộc': { duc: 'nhân', net: 'hiền hoà, thích giúp người, muốn vươn lên', qua: 'dễ mềm lòng, ôm đồm việc của người khác', thieu: 'tập kiên nhẫn nuôi một việc cho lớn dần' },
  'Hoả': { duc: 'lễ', net: 'nhiệt tình, sáng sủa, dễ truyền cảm hứng', qua: 'nóng vội, hăng lúc đầu rồi nhanh nguội', thieu: 'cho mình thêm niềm vui và sự cởi mở' },
  'Thổ': { duc: 'tín', net: 'điềm đạm, giữ lời, đáng tin cậy', qua: 'chậm đổi, ngại cái mới', thieu: 'giữ nếp sống đều đặn, nói được làm được' },
  'Kim': { duc: 'nghĩa', net: 'quyết đoán, phân minh, trọng lẽ phải', qua: 'cứng rắn, khó nhân nhượng', thieu: 'tập dứt khoát và đặt ranh giới rõ ràng' },
  'Thuỷ': { duc: 'trí', net: 'linh hoạt, sâu sắc, giỏi xoay xở', qua: 'hay lo nghĩ, dễ đổi ý', thieu: 'dành thời gian học hỏi và suy ngẫm' },
};

export function tinhTinhSection(noi: Hanh, vang: readonly Hanh[]): Section {
  const t = TINH[noi];
  const blocks: Block[] = [
    p('tinhtinh.noi', 'Hành nổi nhất là <b>' + noi + '</b>, ứng với chữ "' + t.duc + '": thường ' + t.net + '. Khi hành này quá mạnh, dễ ' + t.qua + '.'),
    ...vang.map((e, i) => p('tinhtinh.vang.' + i, 'Hành ' + e + ' gần như vắng (chữ "' + TINH[e].duc + '"): có thể bù bằng cách ' + TINH[e].thieu + '.')),
    note('tinhtinh.note', 'Tính tình theo ngũ hành chỉ là gợi ý để tự soi, mỗi người còn do cách sống và môi trường. Đây là góc nhìn văn hoá để tham khảo.'),
  ];
  return { id: 'tinhtinh', title: '', blocks };
}
