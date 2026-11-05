/* Nội dung không đọc thành lời (ARCHITECTURE.md mục 12.8). Lọc theo từng câu, bằng từ điển, không sửa câu chữ nguyên văn.
   KHÔNG thêm "sức khoẻ" (phần lớn mang nghĩa tốt) và "tang", "tù", "tử" (là tên Tang Đố Mộc, Tù, Tử, Tử Tôn). */
export const NO_SPEECH_TERMS: readonly string[] = [
  'tai nạn', 'bệnh', 'ốm', 'tuổi thọ', 'trường thọ', 'chết', 'tử vong', 'qua đời', 'kiện tụng', 'kiện cáo',
  'ly hôn', 'ly dị', 'ly thân', 'tai hoạ', 'tai họa', 'tai ương', 'hoả hoạn', 'hỏa hoạn', 'tổn hại', 'mổ', 'phẫu thuật', 'tang lễ',
];

/* Khớp nguyên từ: "ốm" không được bắt nhầm trong một chữ dài hơn. */
const PATTERN = new RegExp(`(?<![\\p{L}\\p{N}])(?:${NO_SPEECH_TERMS.join('|')})(?![\\p{L}\\p{N}])`, 'iu');

export const hasNoSpeech = (sentence: string): boolean => PATTERN.test(sentence.normalize('NFC'));
