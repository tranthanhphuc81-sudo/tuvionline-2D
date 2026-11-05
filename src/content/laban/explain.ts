/* La Bàn: ô kết quả, lời nhận định, "Cách đọc la bàn này", ghi chú — NGUYÊN VĂN legacy (la-ban-phong-thuy.html).
   Riêng mục 3 và các thông báo cảm biến viết lại cho đúng cách app đọc cảm biến (không có trình duyệt, không hỏi quyền). */
import type { LaBanSector, Quai } from '../../core';
import { duNienDesc } from '../battrach/stars';
import { p, type Section } from '../rich';

export const LABAN_INTRO = 'Dùng cảm biến la bàn của điện thoại (hoặc xoay bằng tay) để xem hướng hiện tại ứng với sao Du Niên nào theo Mệnh Quái của bạn — dựa trên hệ Bát Trạch, Hậu Thiên Bát Quái.';
export const LABAN_FOOT = 'Công cụ tính toán theo hệ Bát Trạch — mang tính văn hoá, tham khảo và rèn tư duy hệ thống, không phải khoa học thực nghiệm hay thiết bị đo đạc chính xác; không nên dùng thay cho khảo sát thực địa hay quyết định xây dựng quan trọng.';
export const LABAN_NO_PROFILE = 'Chọn hoặc thêm hồ sơ để biết hướng này là sao Du Niên tốt hay xấu đối với bạn.';
export const LABAN_MANUAL_HINT = 'Có thể kéo trực tiếp vòng la bàn ở trên để xoay.';

export const LABAN_STATUS = {
  manual: 'Chế độ thủ công — kéo la bàn hoặc dùng ô nhập độ bên dưới',
  waiting: 'Đang chờ dữ liệu cảm biến…',
  on: 'Cảm biến đang hoạt động',
} as const;

export type LaBanFailure = 'no-sensor' | 'no-data';
export const LABAN_FAILURE: Record<LaBanFailure, string> = {
  'no-sensor': 'Máy này không có cảm biến từ trường nên không đọc được hướng — dùng chế độ xoay tay.',
  'no-data': 'Không nhận được dữ liệu cảm biến ổn định — chuyển về chế độ xoay tay.',
};

export function laBanCalibrateText(headingErrorDeg: number | null): string {
  return 'Độ tin cậy của cảm biến đang thấp' + (headingErrorDeg !== null ? ' (sai số khoảng ±' + Math.round(headingErrorDeg) + '°)' : '')
    + ' — số đo có thể sai. Hãy vẽ hình số 8 trong không khí vài lần và tránh xa kim loại, loa, sạc.';
}
export function laBanInterferenceText(fieldUT: number): string {
  return 'Từ trường quanh máy đang bất thường (' + Math.round(fieldUT) + ' µT, bình thường khoảng 25–65 µT) — số đo có thể sai. Hãy đưa máy ra xa kim loại, loa, sạc rồi đo lại.';
}
export const laBanFieldText = (fieldUT: number): string => 'Từ trường đo được: ' + Math.round(fieldUT) + ' µT';
export const LABAN_TILTED = 'Hãy đặt máy nằm ngang để đọc hướng chính xác hơn.';

/** Ô "Hướng hiện tại" (legacy #resultGrid). */
export function laBanCells(s: LaBanSector, quai: Quai | null): [string, string][] {
  const cells: [string, string][] = [['Hướng gần nhất', s.huong], ['Quẻ Hậu Thiên', s.quai], ['Ngũ hành hướng', s.hanh]];
  if (quai) cells.push(['Mệnh Quái của bạn', quai]);
  return cells;
}

/** Nhận định hướng đang nhìn (legacy #verdictBanner); chỉ gọi khi đã có sao. */
export function laBanVerdict(s: LaBanSector): string {
  const st = s.star!;
  return 'Hướng <b>' + s.huong + '</b> ứng với sao <b>' + st.star + '</b> (' + (st.good ? 'cát tinh — tốt' : 'hung tinh — cần cân nhắc') + '): ' + duNienDesc(st.star);
}

export function laBanLessons(): Section[] {
  const item = (id: string, title: string, body: string): Section => ({ id: 'laban.lesson.' + id, title, blocks: [p('laban.lesson.' + id + '.0', body)] });
  return [
    item('vong', '1. Vòng la bàn hoạt động thế nào', 'Vòng ngoài xoay giống một chiếc la bàn/la kinh thật: khi bạn xoay người (hoặc xoay vòng bằng tay), các hướng trên vòng dịch chuyển quanh mũi kim cố định ở trên cùng — mũi kim luôn đại diện cho hướng bạn đang nhìn/đứng. 8 cung màu trên vòng ứng với 8 quẻ Hậu Thiên Bát Quái (Khảm, Cấn, Chấn, Tốn, Ly, Khôn, Đoài, Càn).'),
    item('mau', '2. Vì sao có cung xanh (tốt), cung đỏ (cần cân nhắc)', 'Sau khi nhập ngày sinh và giới tính, công cụ tính ra Mệnh Quái của bạn, rồi tra bảng Du Niên (8 sao ứng với 8 hướng riêng cho Mệnh Quái đó — xem lại nguyên lý ở Chương 2, 4 tài liệu Phần 4 Lý Số). Cung xanh lá là 1 trong 4 sao tốt (Sinh Khí, Thiên Y, Diên Niên, Phục Vị); cung đỏ cam là 1 trong 4 sao xấu (Tuyệt Mệnh, Ngũ Quỷ, Lục Sát, Hoạ Hại).'),
    item('cambien', '3. Bật cảm biến la bàn thật', 'Bấm "🧭 Dùng cảm biến" — kim la bàn sẽ tự xoay theo hướng thật của máy, không cần cấp thêm quyền nào. Nếu máy không có cảm biến từ trường, công cụ tự động quay lại chế độ xoay tay.'),
    item('saiso', '4. Sai số cần lưu ý', 'Cảm biến từ trường điện thoại rất dễ bị nhiễu bởi kim loại, loa, sạc, thiết bị điện tử ở gần — nếu số đo có vẻ sai lệch, hãy thử vẽ hình số 8 trong không khí (thao tác hiệu chỉnh quen thuộc của la bàn điện thoại) hoặc dùng ô "Hiệu chỉnh" để bù trừ độ lệch cố định. Công cụ cũng CHƯA hiệu chỉnh độ lệch từ (declination) giữa Bắc từ và Bắc địa lý thực — với việc quan trọng (đặt hướng nhà, ban thờ...), nên đối chiếu thêm bằng la bàn địa lý chuyên dụng hoặc chuyên gia.'),
  ];
}
