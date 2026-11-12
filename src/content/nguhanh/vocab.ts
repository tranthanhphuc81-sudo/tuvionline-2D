/* Từ vựng cố định của mục ngũ hành: tên cách, nhãn, câu nhắc, danh sách từ cấm (ARCHITECTURE 14.8). */
import type { FollowGrade, FollowType, Favor, Method, Outcome, Strength, TenGodGroup } from '../../core/nguhanh';

export const TYPE_VI: Record<FollowType, string> = {
  'tong-sat': 'Tòng Sát', 'tong-tai': 'Tòng Tài', 'tong-nhi': 'Tòng Nhi', 'tong-the': 'Tòng Thế',
  'khuc-truc': 'Khúc Trực', 'viem-thuong': 'Viêm Thượng', 'gia-sac': 'Giá Sắc',
  'tong-cach-kim': 'Tòng Cách (Kim chuyên vượng)', 'nhuan-ha': 'Nhuận Hạ', 'tong-cuong': 'Tòng Cường',
};
export const GRADE_VI: Record<FollowGrade, string> = { chan: 'Chân (thành cách rõ)', gia: 'Giả (thành cách nhưng dễ bị phá)', 'khong-thanh': 'Không thành cách' };
export const STRENGTH_VI: Record<Strength, string> = { 'tong-nhuoc': 'Cực nhược', nhuoc: 'Thân nhược', 'trung-hoa': 'Trung hoà', vuong: 'Thân vượng', 'chuyen-vuong': 'Cực vượng' };
export const METHOD_VI: Record<Method, string> = {
  'phu-uc': 'Phù ức (bổ chỗ yếu, tiết chỗ mạnh)', 'dieu-hau': 'Điều hậu (cân bằng nóng lạnh)', 'thong-quan': 'Thông quan (nối hai hành đang xung khắc)',
  'tong-cach': 'Thuận thế (tòng cách, chuyên vượng)', 'trung-hoa': 'Giữ trung hoà',
};
export const TEN_GOD_VI: Record<TenGodGroup, string> = { TyKiep: 'Tỷ Kiếp', An: 'Ấn', ThucThuong: 'Thực Thương', Tai: 'Tài', QuanSat: 'Quan Sát' };
export const CHECK_QUESTION: Record<'root' | 'exposed' | 'dominant' | 'direction', { ask: string; term: string }> = {
  root: { ask: 'Nhật Chủ có chỗ dựa trong các Chi không?', term: 'Gốc ở địa chi (điều kiện bắt buộc)' },
  exposed: { ask: 'Có Can nào lộ ra giúp hay chế Nhật Chủ không?', term: 'Can lộ (điều kiện bắt buộc)' },
  dominant: { ask: 'Phe mạnh có đủ áp đảo không?', term: 'Thế của phe được theo' },
  direction: { ask: 'Phe mạnh là một hành hay nhiều hành?', term: 'Hướng theo' },
};
export const CHECK_STATUS = (score: number) => (score === 1 ? '✓ Đạt' : score > 0 ? '◐ Một phần' : '✗ Không đạt');

/** Nhãn năm theo cách nói mềm (14.8), luôn đi kèm gợi ý nên làm gì. */
export const FAVOR_LABEL: Record<Favor, string> = {
  'rat-tot': 'Rất thuận', tot: 'Thuận', binh: 'Bình thường', xau: 'Nên chậm lại, củng cố', 'rat-xau': 'Nên giữ chắc, chuẩn bị kỹ',
};
export const FAVOR_HINT: Record<Favor, string> = {
  'rat-tot': 'hợp để bắt đầu việc đã chuẩn bị kỹ và mở rộng có kế hoạch',
  tot: 'hợp để tiến hành kế hoạch đã chuẩn bị',
  binh: 'giữ nhịp, củng cố nền tảng',
  xau: 'nên ưu tiên học hỏi, chuẩn bị, tránh mở thêm việc lớn',
  'rat-xau': 'nên giữ nhịp an toàn, bớt cam kết lớn, chú ý nghỉ ngơi và giữ gìn quan hệ',
};
export const FAVOR_TONE: Record<Favor, 'ok' | 'mid' | 'warn'> = { 'rat-tot': 'ok', tot: 'ok', binh: 'mid', xau: 'warn', 'rat-xau': 'warn' };

export const OUTCOME_LABEL: Record<Outcome | 'khong-nho', string> = { tot: 'Thuận lợi', binh: 'Bình thường', xau: 'Khó khăn', 'khong-nho': 'Không nhớ' };

/** Lời nhắc văn hoá ở đầu và cuối mục (14.8), và giải thích ba nguồn màu hướng (14.3). */
export const INTRO_NOTE = 'Đây là một cách tính định lượng theo lý số cổ truyền, mang tính văn hoá và tham khảo, không phải phép đo khoa học.';
export const CLOSING_NOTE = 'Số là tham khảo, đức năng thắng số.';
export const COLOR_SOURCE_NOTE = 'Màu và hướng gợi ý trong app đến từ ba cách tính khác nhau: theo Dụng thần Bát Tự (tab Bát Tự và Tổng hợp), theo Mệnh Quái (Bát Trạch, La Bàn) và theo Nạp Âm năm sinh. Mỗi cách trả lời một câu hỏi riêng nên có thể không trùng nhau, và mỗi màn hình đã ghi rõ đang theo cách nào. Đây là gợi ý mang tính văn hoá, tham khảo; không cần thay đổi hay sắm sửa gì để "hợp mệnh".';
/** Độ nhạy theo trường phái (ARCHITECTURE 14.11): chạy lại với bộ hệ số coi trọng nguyệt lệnh hơn. */
export const SENSITIVITY_STABLE = 'Kết luận này ổn định: đổi sang cách đặt hệ số khác (coi trọng nguyệt lệnh hơn) vẫn cho cùng Dụng thần.';
export const sensitivityUnstable = (other: string, main: string) => `Kết luận này chưa vững: nếu coi trọng nguyệt lệnh hơn thì Dụng thần là ${other} thay vì ${main}. Nên xem như một gợi ý, chưa phải kết quả chắc.`;

export const DISCLAIMER = 'Kết quả dựa trên hệ trọng số quy ước của một trường phái Tử Bình. Nên xem như gợi ý để tự soi xét và định hướng thói quen; các quyết định về sức khoẻ, tài chính, pháp lý cần ý kiến chuyên môn.';

/** (i) KHÔNG HIỆN (ARCHITECTURE 14.8): từ, cụm không được xuất hiện trong bất kỳ câu mới nào, kể cả chữ chỉ để xem.
    Khớp nguyên cụm, không phân biệt hoa thường. Danh sách (ii) KHÔNG ĐỌC là NO_SPEECH_TERMS ở ../noSpeech.ts. */
export const BANNED_TERMS: readonly string[] = [
  'cúng', 'giải hạn', 'hoá giải', 'hóa giải', 'trấn yểm', 'bùa', 'vật phẩm', 'kích tài', 'chiêu tài', 'mua', 'đeo để',
  'chính xác', 'chắc chắn', 'tuyệt đối', 'dự đoán đúng', 'linh nghiệm', 'cổ phiếu', 'chứng khoán', 'tiền ảo', 'vay', 'thuốc',
];
const BANNED_RE = new RegExp(`(?<![\p{L}\p{N}])(?:${BANNED_TERMS.join('|')})(?![\p{L}\p{N}])`, 'iu');
export const hasBannedTerm = (text: string): boolean => BANNED_RE.test(text.normalize('NFC'));
