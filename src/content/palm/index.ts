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

/** Chỉ một dấu hiệu thì nói giọng "có xu hướng" (CHI-TAY §1 điểm 5). */
export function topicLine(text: string, confidence: 'xu-huong' | 'ro'): string {
  if (confidence === 'ro') return text;
  return 'Có xu hướng ' + text.charAt(0).toLocaleLowerCase('vi') + text.slice(1);
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
    topics: (Object.entries(result.byTopic) as [PalmTopic, { ids: string[]; confidence: 'xu-huong' | 'ro' }][]).map(([topic, t]) => ({
      topic, title: PALM_TOPIC_LABEL[topic], confidence: t.confidence, lines: read(t.ids).map((r) => topicLine(r.text, t.confidence)),
    })),
    closing: PALM_CLOSING,
  };
  if (result.compare) {
    view.compare = (['steady', 'growing', 'latent'] as const)
      .map((key) => ({ key, title: PALM_COMPARE_LABEL[key], items: read(result.compare![key]) }))
      .filter((c) => c.items.length > 0);
  }
  return view;
}
