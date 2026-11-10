/* Câu chữ giao diện xem chỉ tay (bước 3B.3): các bước, gợi ý chạm đường, thông báo lỗi. Câu luận nằm ở palm-content.vi.json. */
import type { MountId } from '../../core';

export const PALM_TITLE = 'Xem chỉ tay';
export const PALM_RESULT_TITLE = 'Kết quả chỉ tay';

export const PALM_INTRO = 'Chụp lòng bàn tay, chạm vài điểm trên bốn đường chính để máy bám theo, rồi trả lời vài câu hỏi ngắn. Ảnh chỉ xử lý ngay trên máy này, không gửi đi đâu và không được lưu lại: app chỉ giữ các nét bạn đã chạm.';
export const PALM_FIRST_TIME = 'Lần đầu app nạp mô hình nhận diện bàn tay có sẵn trong máy (khoảng 22 MB), mất vài giây.';
export const PALM_PHOTO_TIPS = 'Chụp lòng bàn tay trên nền thoáng, đủ sáng, thấy cả các ngón. Tháo nhẫn, đừng để bóng tay che lòng bàn tay.';
export const PALM_NOTE = 'Nội dung mang tính văn hoá, tham khảo, không phải căn cứ để quyết định việc quan trọng.';

export const PALM_NO_HAND = 'Không thấy bàn tay trong ảnh. Bạn chụp lại, thấy rõ cả lòng bàn tay và các ngón nhé.';
export const PALM_UNREADABLE = 'Không đọc được ảnh này. Bạn thử chụp hoặc chọn ảnh khác nhé.';
export const PALM_MODEL_FAILED = 'Chưa nạp được mô hình nhận diện bàn tay. Bạn thử lại; nếu vẫn lỗi thì cài lại app.';

export const PALM_LINE_STEPS = [
  { id: 'sinh', title: 'Sinh đạo', hint: 'Đường vòng quanh gò ngón cái xuống cổ tay. Chạm vào đầu đường, cuối đường, rồi chạm thêm 1–2 điểm ở chỗ cong nhất.' },
  { id: 'tri', title: 'Trí đạo', hint: 'Đường đi ngang lòng bàn tay, bắt đầu gần Sinh đạo. Chạm đầu rồi chạm cuối đường.', none: 'Không thấy đường' },
  { id: 'tam', title: 'Tâm đạo', hint: 'Đường trên cùng, từ mép dưới ngón út về phía ngón trỏ. Chạm đầu rồi chạm cuối đường.' },
  { id: 'dinh', title: 'Định mạng', hint: 'Đường dọc giữa bàn tay, từ cổ tay lên ngón giữa. Có người không có.', none: 'Không có đường này' },
] as const;

export const PALM_TRACE_NEED_POINTS = 'Chạm vào đầu đường và cuối đường trước đã. Không có đường này thì bấm nút bên cạnh.';
export const PALM_TRACE_CUT_FIRST = 'Chạm đầu và cuối đoạn đầu tiên trước, rồi mới bấm Đoạn mới.';
export const PALM_TRACE_CUT_HINT = 'Chạm đầu rồi cuối đoạn tiếp theo. Hai đoạn cách nhau thì máy tự ghi nhận chỗ đứt.';

export const PALM_LEAVE_TITLE = 'Bỏ ảnh này?';
export const PALM_LEAVE_TEXT = 'Các điểm bạn đã chạm sẽ mất. Ảnh không được lưu nên muốn làm lại thì phải chụp lại.';

export const PALM_CONFIRM_TITLE = 'Máy đo được như sau';
export const PALM_CONFIRM_HINT = 'Máy đã đo sẵn từ ảnh và các nét bạn chạm. Chỗ nào chưa đúng với tay bạn thì chọn lại; chưa chắc thì chọn "Không rõ".';
export const PALM_QUESTIONS_TITLE = 'Vài câu hỏi ngắn';
export const PALM_MORE_TITLE = 'Xem kỹ hơn (không bắt buộc)';
export const PALM_MORE_HINT = 'Trả lời thêm để bản luận chi tiết hơn. Bỏ qua cũng được.';
export const PALM_UNSURE = 'Không rõ';

export const PALM_MOUNT_LABEL: Record<MountId, string> = {
  kim: 'Kim Tinh', moc: 'Mộc Tinh', tho: 'Thổ Tinh', thaiduong: 'Thái Dương', thuy: 'Thủy Tinh', thaiam: 'Thái Âm',
  hoaduong: 'Hỏa Tinh (trên)', hoaam: 'Hỏa Tinh (dưới)', donghoa: 'Đồng hoả', kham: 'Gò Khảm',
};
export const PALM_Q30_GROUPS = [
  { level: 'noi', title: 'Gò nổi rõ nhất (chọn nhiều)', mounts: ['kim', 'moc', 'tho', 'thaiduong', 'thuy', 'thaiam', 'hoaduong', 'hoaam'] },
  { level: 'phang', title: 'Gò phẳng nhất (chọn nhiều)', mounts: ['kim', 'moc', 'tho', 'thaiam'] },
] as const;

export const PALM_LINE_NAME = { sinh: 'Sinh đạo', tri: 'Trí đạo', tam: 'Tâm đạo', dinh: 'Định mạng' } as const;

export const PALM_HAND_Q = 'Bạn chụp tay nào?';
export const PALM_HAND_HINT = 'Tay thuận là tay "hiện tại, điều đang vun đắp"; tay còn lại là "nền tảng bẩm sinh". Có thể xem một tay trước, tay kia xem sau để so sánh.';
export const PALM_SAVED_HINT = 'Đã có kết quả được lưu cho hồ sơ này.';

export const PALM_RESULT_EMPTY = 'Hồ sơ này chưa có kết quả xem chỉ tay.';
export const PALM_ROLE_LABEL = { current: 'Tay hiện tại (tay thuận)', innate: 'Tay bẩm sinh (tay còn lại)' } as const;
export const PALM_WHY = 'Vì sao?';
export const PALM_DELETE_CONFIRM = 'Xoá kết quả xem chỉ tay của hồ sơ này? Việc này không lấy lại được.';
export const PALM_TONE_LABEL = { '+': 'Điểm thuận', '=': 'Trung tính', '!': 'Cần lưu ý' } as const;

