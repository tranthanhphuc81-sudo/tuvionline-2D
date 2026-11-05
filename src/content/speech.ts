/* Chuẩn bị chữ để đọc thành lời, chuyển từ legacy (LySoTTS: readable, normalizeForSpeech, chunk). Hàm thuần, Phase 6 dùng lại
   cho phụ đề. Thêm so với legacy: đọc "độ" và "phần trăm"; bỏ dòng giải thích cách chấm; đoạn luôn ≤ 180 ký tự. */
import { hasNoSpeech } from './noSpeech';
import { parseRich, sectionPlainText, toPlainText, type Section } from './rich';

export const SPEECH_MAX_CHUNK = 180;

export const SPEECH_NO_VOICE = 'Máy chưa có giọng đọc tiếng Việt chạy ngay trên máy. Hãy cài ứng dụng "Dịch vụ giọng nói của Google" (Google Text-to-speech), rồi tải gói tiếng Việt trong Cài đặt của máy, mục Ngôn ngữ, Đầu ra chuyển văn bản thành giọng nói. App không dùng giọng đọc qua mạng để nội dung không rời khỏi máy.';
export const SPEECH_FAILED = 'Không đọc được trên máy này. Có thể gói giọng tiếng Việt chưa được tải về máy: hãy mở cài đặt giọng đọc, tải gói tiếng Việt rồi thử lại.';

export const SPEECH_WEB_UNSUPPORTED = 'Trình duyệt này không có giọng đọc nên thầy chưa đọc được ở đây. Nếu đang mở link trong Zalo hoặc Facebook, hãy chọn mở bằng Chrome. Chữ trên màn hình vẫn xem được bình thường.';
const SPEECH_WEB_FAILED = 'Trình duyệt chưa phát được giọng đọc. Hãy kiểm tra âm lượng của máy, rồi thử mở bằng Chrome. Chrome dùng giọng đọc của điện thoại nên máy cần có gói giọng tiếng Việt.';

/** Câu báo khi không đọc được. Trên trình duyệt kèm mã lỗi để biết nguyên nhân khi người dùng báo lại. */
export function speechFailedText(native: boolean, code: string | null): string {
  if (native) return SPEECH_FAILED;
  if (code === 'unsupported') return SPEECH_WEB_UNSUPPORTED;
  return code ? `${SPEECH_WEB_FAILED} (Mã lỗi: ${code})` : SPEECH_WEB_FAILED;
}

export function normalizeForSpeech(t: string): string {
  return t
    .replace(/(\d{1,2})\/(\d{1,2})\s*\(nhuận\)\/(\d{4})/g, 'ngày $1 tháng $2 nhuận năm $3')
    .replace(/\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/g, 'ngày $1 tháng $2 năm $3')
    .replace(/(\d+)\s*[–-]\s*(\d+)/g, '$1 đến $2')
    .replace(/(\d)\s*°/g, '$1 độ')
    .replace(/(\d)\s*%/g, '$1 phần trăm')
    .replace(/\s*→\s*/g, ', sang ')
    .replace(/\s*[—–]\s*/g, ', ')
    .replace(/\s*·\s*/g, ', ')
    .replace(/\s*\/\s*/g, ' và ')
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, '')
    .replace(/[•"“”]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,;:!?])/g, '$1')
    .replace(/([.,])\1+/g, '$1')
    .trim();
}

/** Xuống dòng thành câu riêng: dòng chưa có dấu câu thì thêm dấu chấm. */
function linesToSentences(t: string): string {
  return t.split(/\n+/).map((x) => x.trim()).filter(Boolean).map((x) => (/[.!?:;,]$/.test(x) ? x : x + '.')).join(' ');
}

/** Ô dạng "nhãn / giá trị" thành "nhãn: giá trị." Giá trị có thể chứa thẻ định dạng. */
export function cellsSpeech(cells: readonly (readonly [string, string])[]): string {
  return cells.map(([k, v]) => k + ': ' + toPlainText(parseRich(v)).trim().replace(/\s*\n+\s*/g, '. ') + '.').join(' ');
}

export function sectionsSpeech(sections: readonly Section[]): string {
  return sections.map((s) => linesToSentences(sectionPlainText(s, true, { how: false }))).filter(Boolean).join(' ');
}

/** Một đoạn chữ có định dạng (ví dụ lời nhận định). */
export function richSpeech(html: string): string {
  return linesToSentences(toPlainText(parseRich(html)));
}

/** Tách câu theo dấu câu, giữ nguyên chữ. */
export function splitSentences(text: string): string[] {
  return (text.match(/[^.!?;]+[.!?;]*/g) ?? []).map((s) => s.trim()).filter(Boolean);
}

/** Ghép các phần rồi chuẩn hoá, sẵn sàng để đọc. Câu dính từ cấm đọc bị bỏ (ARCHITECTURE.md mục 12.8). */
export function speechOf(...parts: readonly string[]): string {
  return normalizeForSpeech(splitSentences(parts.filter(Boolean).join(' ')).filter((s) => !hasNoSpeech(s)).join(' '));
}

/** Cắt theo dấu câu, đoạn nào cũng ≤ `max` ký tự; câu quá dài thì cắt ở dấu phẩy hoặc khoảng trắng. */
export function chunkSpeech(text: string, max = SPEECH_MAX_CHUNK): string[] {
  const sentences = splitSentences(text);
  const out: string[] = [];
  let cur = '';
  const flush = () => { if (cur) out.push(cur); cur = ''; };
  for (const raw of sentences) {
    let s = raw.trim();
    if (!s) continue;
    if ((cur + ' ' + s).trim().length <= max) { cur = (cur + ' ' + s).trim(); continue; }
    flush();
    while (s.length > max) {
      const head = s.slice(0, max);
      let cut = head.lastIndexOf(',');
      if (cut < max / 3) cut = head.lastIndexOf(' ');
      if (cut <= 0) cut = max - 1;
      out.push(s.slice(0, cut + 1).trim());
      s = s.slice(cut + 1).trim();
    }
    cur = s;
  }
  flush();
  return out;
}
