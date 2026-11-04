/* Bảng câu chữ Lục Hào — CHÉP NGUYÊN VĂN từ legacy (docs/legacy/lyso-toolkit.html, module LySoInterp).
   Sinh bằng script cắt thẳng từ file legacy; chỉ đổi `var` thành `export const` và thêm kiểu. Đừng sửa câu chữ ở đây
   (test đối chiếu tests/parity/luchao.test.ts sẽ báo). */
import type { DungThanKey } from '../../core';

export const QUE: Record<string, string> = {
  'Càn':'trời — mạnh mẽ, chủ động, sáng tạo; việc lớn có thể làm nhưng tránh kiêu căng', 'Khôn':'đất — thuận theo, bao dung; hợp làm theo người dẫn dắt hơn là tự đứng đầu',
  'Truân':'khó khăn lúc khởi đầu; việc mới cần kiên nhẫn và tìm người giúp', 'Mông':'non nớt, chưa rõ; cần học hỏi, hỏi người hiểu biết trước khi làm',
  'Nhu':'chờ đợi; thời cơ chưa tới, nên chuẩn bị và kiên nhẫn', 'Tụng':'tranh chấp, kiện tụng; nên hoà giải, tránh đẩy mâu thuẫn đi xa',
  'Sư':'tập hợp lực lượng; việc cần tổ chức, kỷ luật và người chỉ huy giỏi', 'Tỷ':'gần gũi, liên kết; hợp tác với người cùng chí hướng là tốt',
  'Tiểu Súc':'tích luỹ nhỏ; tiến chậm, chưa nên làm việc lớn', 'Lý':'đi trên đường hiểm; cẩn trọng từng bước, giữ lễ độ thì yên',
  'Thái':'thông suốt, hanh thông; trên dưới hoà hợp, việc dễ thành', 'Bĩ':'bế tắc, không thông; nên giữ mình, chờ thời',
  'Đồng Nhân':'đồng lòng với người; hợp tác, làm việc nhóm thuận lợi', 'Đại Hữu':'sở hữu lớn, thịnh vượng; giữ khiêm tốn để giữ được lâu',
  'Khiêm':'khiêm tốn; càng nhún nhường càng được việc', 'Dự':'vui vẻ, có chuẩn bị trước; việc thuận nếu đã lên kế hoạch',
  'Tuỳ':'thuận theo thời thế; linh hoạt đi theo xu hướng đúng thì tốt', 'Cổ':'sửa chữa cái đã hư hỏng; cần chấn chỉnh lại việc cũ',
  'Lâm':'tiến đến, đến gần; cơ hội đang tới, nên nắm lấy', 'Quán':'quan sát; nên xem xét kỹ trước khi hành động',
  'Phệ Hạp':'cắn vỡ vật cản; phải giải quyết dứt khoát trở ngại (có thể liên quan pháp lý)', 'Bí':'trang sức, hình thức; việc nhỏ được, việc lớn cần thực chất',
  'Bác':'bị bào mòn, suy giảm; nên giữ gìn, không nên mở rộng', 'Phục':'trở lại, phục hồi; việc cũ có thể làm lại, sức khoẻ hồi phục',
  'Vô Vọng':'chân thật, không vọng động; làm đúng thì yên, mưu mẹo thì hỏng', 'Đại Súc':'tích luỹ lớn; đủ sức làm việc lớn nếu biết dừng đúng lúc',
  'Di':'nuôi dưỡng; chú ý ăn uống, lời nói và người mình nuôi dưỡng', 'Đại Quá':'quá mức, gánh nặng lớn; cần giảm tải, tìm chỗ dựa',
  'Khảm':'hiểm nguy lặp lại; giữ niềm tin và nguyên tắc để vượt qua', 'Ly':'sáng sủa, bám vào; dựa vào người/việc chính đáng thì tốt',
  'Hàm':'cảm ứng, tình cảm; hợp chuyện tình duyên, giao tiếp chân thành', 'Hằng':'lâu bền; kiên trì con đường đang đi là tốt',
  'Độn':'lui ẩn; nên lùi một bước, tránh đối đầu', 'Đại Tráng':'mạnh mẽ lớn; có sức nhưng đừng cậy mạnh',
  'Tấn':'tiến lên; thăng tiến, công việc phát triển', 'Minh Di':'ánh sáng bị che; nên kín đáo, giữ mình, chờ thời',
  'Gia Nhân':'việc nhà; chú trọng gia đình, nề nếp', 'Khuê':'bất đồng, chia lìa; việc nhỏ được, việc lớn cần dung hoà ý kiến',
  'Kiển':'trở ngại; nên dừng lại, tìm người giúp, không cố vượt', 'Giải':'giải toả; khó khăn sắp qua, nên hành động sớm',
  'Tổn':'bớt đi; chấp nhận bỏ ra trước để được về sau', 'Ích':'thêm vào, có lợi; thời điểm tốt để làm việc có ích',
  'Quải':'quyết đoán, dứt khoát; cần cắt bỏ điều không tốt', 'Cấu':'gặp gỡ bất ngờ; cẩn thận với người/việc mới đến',
  'Tuỵ':'tụ họp; hợp tổ chức, gặp gỡ, quy tụ người', 'Thăng':'đi lên dần; thăng tiến từng bước vững chắc',
  'Khốn':'khốn khó; giữ vững ý chí, nói ít làm nhiều', 'Tỉnh':'cái giếng — nguồn nuôi dưỡng bền; giữ gìn, bảo trì cái đang có',
  'Cách':'thay đổi, cải cách; đúng thời điểm để đổi mới', 'Đỉnh':'cái vạc — đổi mới đã thành; ổn định cái mới',
  'Chấn':'sấm động; có biến động bất ngờ, giữ bình tĩnh thì qua', 'Cấn':'dừng lại; biết dừng đúng lúc là khôn',
  'Tiệm':'tiến dần; từ từ mà chắc, không nên vội', 'Quy Muội':'việc không đúng trình tự; cẩn trọng, tránh vội vàng',
  'Phong':'thịnh lớn; lúc đỉnh cao, nên lo trước lúc xuống', 'Lữ':'đi xa, làm khách; cẩn trọng, khiêm nhường nơi lạ',
  'Tốn':'gió — mềm mỏng len lỏi; thuyết phục nhẹ nhàng hiệu quả hơn ép buộc', 'Đoài':'vui vẻ, trao đổi; giao tiếp, thương lượng thuận',
  'Hoán':'phân tán; cần gom lòng người, tập trung lại', 'Tiết':'tiết chế; chi tiêu và hành động có chừng mực',
  'Trung Phu':'thành tín; giữ chữ tín thì việc thành', 'Tiểu Quá':'hơi quá; việc nhỏ làm được, việc lớn chưa nên',
  'Ký Tế':'việc đã xong; giữ thành quả, đề phòng sơ suất về sau', 'Vị Tế':'việc chưa xong; còn phải cố thêm, đừng bỏ cuộc giữa chừng'
};

/** Tên ngắn của quẻ để tra QUE: "Càn vi Thiên" → "Càn", "Địa Thiên Thái" → "Thái" (legacy queShort). */
export function queShort(name: string): string {
  if (name.indexOf(' vi ') > 0) return name.split(' ')[0];
  return name.split(' ').slice(2).join(' ');
}

export const DT_PLAIN: Record<DungThanKey, string> = {
  'the':'việc của chính bạn (bản thân, việc chung)', 'ung':'đối phương / kết quả của việc',
  'Phụ Mẫu':'cha mẹ, nhà cửa, giấy tờ, thi cử', 'Huynh Đệ':'anh chị em, bạn bè, đối thủ cạnh tranh',
  'Tử Tôn':'con cái, sự bình an, sức khoẻ', 'Thê Tài':'tiền bạc, làm ăn (với nam giới còn là chuyện vợ)',
  'Quan Quỷ':'công danh, chức vụ (với nữ giới còn là chuyện chồng)'
};

export const DT_EX: Record<DungThanKey, string> = {
  'the':'"Tháng tới mình có nên nhận lời chuyển sang công ty mới?"', 'ung':'"Đối tác có giữ đúng cam kết không?"',
  'Phụ Mẫu':'"Hồ sơ xin giấy phép có được duyệt không?"', 'Huynh Đệ':'"Hợp tác với người bạn này có ổn không?"',
  'Tử Tôn':'"Con mình đợt thi này có ổn không?"', 'Thê Tài':'"Lô hàng này bán ra có lời không?"',
  'Quan Quỷ':'"Đợt xét thăng chức này mình có cơ hội không?"'
};
