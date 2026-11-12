/* Câu chữ cho chia sẻ, sao lưu, xoá dữ liệu và trang giới thiệu ở Cài đặt (Phase 7.1). */
import type { RestoreError } from '../../state/backup';

export const SHARE_FAILED = 'Chưa tạo hoặc chia sẻ được ảnh. Bạn thử lại nhé; nếu dùng bản thử cũ thì cần cài lại APK mới.';
export const SHARE_SAVED = 'Trình duyệt này không mở được bảng chia sẻ nên ảnh đã được tải về máy.';

export const BACKUP_HINT = 'File sao lưu chứa tên và ngày giờ sinh của mọi hồ sơ. Chỉ lưu vào nơi bạn tin tưởng; app không tự gửi file này đi đâu.';
export const BACKUP_FAILED = 'Chưa tạo được file sao lưu. Bạn thử lại nhé; nếu dùng bản thử cũ thì cần cài lại APK mới.';
export const BACKUP_SAVED = 'Trình duyệt này không mở được bảng chia sẻ nên file sao lưu đã được tải về máy.';

export const RESTORE_ERROR: Record<RestoreError | 'too-large' | 'unreadable', string> = {
  'not-json': 'File này không phải file sao lưu của app.',
  invalid: 'File sao lưu không đúng định dạng hoặc đã bị hỏng. Dữ liệu trên máy chưa thay đổi.',
  newer: 'File này được tạo từ phiên bản app mới hơn. Bạn cập nhật app rồi khôi phục lại nhé.',
  'bad-date': 'File sao lưu có hồ sơ mang ngày sinh không tồn tại. Dữ liệu trên máy chưa thay đổi.',
  'too-large': 'File này quá lớn, không phải file sao lưu của app.',
  unreadable: 'Không đọc được file này. Bạn thử chọn lại nhé.',
};

export function restoreConfirmText(incoming: number, current: number): string {
  return `File có ${incoming} hồ sơ. Khôi phục sẽ thay toàn bộ dữ liệu đang có trên máy (${current} hồ sơ và các cài đặt), không gộp lại với nhau.`;
}

export const WIPE_CONFIRM = 'Mọi hồ sơ, cài đặt, quẻ đã gieo, kết quả xem chỉ tay, ảnh người đọc tự chọn và file tạm trên máy này sẽ bị xoá và không lấy lại được, trừ khi bạn đã có file sao lưu.';

/** Ghi công mô hình nhận diện bàn tay (Apache 2.0 yêu cầu giữ ghi công). */
export const THIRD_PARTY_CREDIT = 'Nhận diện bàn tay: MediaPipe Hand Landmarker của Google, giấy phép Apache 2.0, chạy hoàn toàn trên máy.';

export const PRIVACY_POINTS: readonly string[] = [
  'App không có máy chủ, không cần tài khoản, không có quảng cáo và không thu thập số liệu sử dụng.',
  'Tên, giới tính và ngày giờ sinh bạn nhập chỉ lưu trên máy này, chỉ dùng để tính kết quả ngay trên máy.',
  'Cảm biến la bàn chỉ dùng khi bạn mở La Bàn. Số đo không được lưu, trừ độ hiệu chỉnh bạn tự đặt.',
  'Xem chỉ tay: ảnh lòng bàn tay chỉ xử lý ngay trên máy, không gửi đi đâu và không được lưu lại. App chỉ giữ các nét bạn đã chạm cùng 21 điểm khớp bàn tay, và xoá chúng khi bạn xoá kết quả hoặc hồ sơ.',
  'Phân tích ngũ hành: nếu bạn trả lời các câu hỏi về những giai đoạn đã qua, câu trả lời chỉ lưu trên máy này, nằm trong file sao lưu, và bị xoá khi bạn xoá hồ sơ, sửa ngày giờ sinh hoặc bấm "Làm lại".',
  'Ảnh người đọc bạn tự chọn trong Cài đặt chỉ lưu trên máy này, không gửi đi đâu và không nằm trong file sao lưu.',
  'Giọng đọc dùng bộ đọc tiếng Việt có sẵn trên máy, nội dung đọc không gửi ra ngoài.',
  'Ảnh chia sẻ và file sao lưu chỉ rời khỏi app khi bạn bấm chia sẻ và tự chọn nơi nhận. Ảnh có tên và ngày sinh của hồ sơ, bạn xem kỹ trước khi gửi cho người khác.',
  'Bạn có thể xoá toàn bộ dữ liệu bất cứ lúc nào ngay trong Cài đặt.',
];
