/* Câu chữ xem chỉ tay. Đây là nội dung MỚI (CLAUDE.md), nguồn ở docs/CHI-TAY.md, không chép nguyên văn sách.
   Không sửa tay palm-content.vi.json: đổi câu chữ ở CHI-TAY rồi sinh lại (bước 3B.5). */
import data from './palm-content.vi.json';
import type { PalmGroup, PalmLineId, PalmMeta, PalmResult, PalmTone, PalmTopic, MarkType, MountId } from '../../core';

export type PalmSource = 'DVT' | 'HCM' | 'TCT' | 'JDJ';

export interface PalmReading {
  id: string;
  group: PalmGroup;
  /** mô tả đặc điểm, hiện ở nút "Vì sao?" */
  feature: string;
  /** câu luận, tối đa 180 ký tự */
  text: string;
  topics: PalmTopic[];
  tone: PalmTone;
  weight: 1 | 2 | 3;
  /** false: Thầy không đọc, chỉ hiện chữ */
  tts: boolean;
  sources: PalmSource[];
  line?: PalmLineId;
  mount?: MountId;
  mark?: MarkType;
  /** chưa đối chiếu xong với sách: ẩn khỏi kết quả */
  needsReview?: boolean;
}

export const PALM_READINGS = data.readings as PalmReading[];
export const PALM_SOURCES = data.sources as Record<PalmSource, string>;
export const PALM_TTS_FORBIDDEN: readonly string[] = data.ttsForbidden;

const byId = new Map(PALM_READINGS.map((r) => [r.id, r]));
export const getReading = (id: string): PalmReading | undefined => byId.get(id);

/** Phần engine cần của mỗi đặc điểm, theo đúng thứ tự trong dữ liệu. */
export const palmMetas = (): PalmMeta[] => PALM_READINGS.map((r) => ({
  id: r.id, group: r.group, topics: r.topics, tone: r.tone, weight: r.weight,
  ...(r.line ? { line: r.line } : {}), ...(r.mount ? { mount: r.mount } : {}), ...(r.needsReview ? { hidden: true } : {}),
}));

export const PALM_TOPIC_LABEL: Record<PalmTopic, string> = {
  tc: 'Tính cách', tt: 'Trí tuệ, cách nghĩ', tcm: 'Tình cảm, các mối quan hệ', sn: 'Sự nghiệp, công danh', tl: 'Tài lộc, tiền bạc',
  ss: 'Sức sống, nhịp sống', gt: 'Giao tiếp, xã hội', st: 'Sáng tạo, nghệ thuật', dx: 'Đi xa, môi trường mới',
};

export const PALM_SECTION_TITLE: Record<PalmResult['sections'][number]['key'], string> = {
  'tong-quan': 'Tổng quan bàn tay', ngon: 'Ngón tay', 'duong-chinh': 'Các đường chính', 'duong-phu': 'Đường phụ', 'go-dau': 'Gò và dấu hiệu',
};

/** Lời nhắc cố định ở đầu và cuối kết quả (CHI-TAY §1, §13). */
export const PALM_OPENING = 'Xem tay là để soi lại mình. Đường chỉ thay đổi theo cách mình sống, nên đây chỉ là tham khảo mang tính văn hoá.';
export const PALM_CLOSING = 'Tướng tay đổi theo thời gian, bạn có thể xem lại sau 6–12 tháng. Số là tham khảo, đức năng thắng số.';

/** Các cách nói giọng chưa chắc, xoay vòng cho đỡ lặp "Có xu hướng" ở mọi dòng. */
const HEDGES = ['Có xu hướng', 'Thường', 'Nhiều khả năng', 'Phần nhiều', 'Dễ'];

/** Chỉ một dấu hiệu thì nói giọng chưa chắc (CHI-TAY §1 điểm 5). `n` chọn cách nói, đổi theo dòng để đỡ lặp.
    Câu đã mở đầu bằng "Có …" thì không thêm "Có xu hướng" mà dùng "Thường" để khỏi thành "có xu hướng có". */
export function topicLine(text: string, confidence: 'xu-huong' | 'ro', n = 0): string {
  if (confidence === 'ro') return text;
  let hedge = HEDGES[Math.abs(n) % HEDGES.length];
  if (/^Có\s/u.test(text) && hedge === 'Có xu hướng') hedge = 'Thường';
  return hedge + ' ' + text.charAt(0).toLocaleLowerCase('vi') + text.slice(1);
}

export const PALM_COMPARE_LABEL = {
  steady: 'Nền tảng vững: có ở cả hai tay',
  growing: 'Điểm đang phát triển: chỉ thấy ở tay hiện tại',
  latent: 'Tiềm năng nên khơi lại: chỉ thấy ở tay bẩm sinh',
} as const;

export interface PalmView {
  opening: string;
  sections: { key: string; title: string; items: PalmReading[] }[];
  topics: { topic: PalmTopic; title: string; lines: string[]; confidence: 'xu-huong' | 'ro' }[];
  compare?: { key: keyof typeof PALM_COMPARE_LABEL; title: string; items: PalmReading[] }[];
  closing: string;
}

/** Ghép câu chữ cho kết quả của engine. */
export function palmView(result: PalmResult): PalmView {
  const read = (ids: readonly string[]) => ids.map((id) => byId.get(id)!).filter(Boolean);
  const view: PalmView = {
    opening: PALM_OPENING,
    sections: result.sections.map((s) => ({ key: s.key, title: PALM_SECTION_TITLE[s.key], items: read(s.ids) })),
    topics: [],
    closing: PALM_CLOSING,
  };
  // Một câu luận chỉ xuất hiện ở chủ đề đầu tiên có nó: câu nói về hai chủ đề không bị lặp lại ở phần tổng kết
  const used = new Set<string>();
  let n = 0;
  for (const [topic, t] of Object.entries(result.byTopic) as [PalmTopic, { ids: string[]; confidence: 'xu-huong' | 'ro' }][]) {
    const fresh = read(t.ids).filter((r) => !used.has(r.id));
    if (!fresh.length) continue;
    fresh.forEach((r) => used.add(r.id));
    view.topics.push({ topic, title: PALM_TOPIC_LABEL[topic], confidence: t.confidence, lines: fresh.map((r) => topicLine(r.text, t.confidence, n++)) });
  }
  if (result.compare) {
    view.compare = (['steady', 'growing', 'latent'] as const)
      .map((key) => ({ key, title: PALM_COMPARE_LABEL[key], items: read(result.compare![key]) }))
      .filter((c) => c.items.length > 0);
  }
  return view;
}
