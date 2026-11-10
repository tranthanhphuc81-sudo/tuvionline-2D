/* Kiểu dữ liệu xem chỉ tay (CHI-TAY §14.1, ARCHITECTURE mục 13.1). Engine chỉ trả mã đặc điểm, câu chữ nằm ở src/content/palm. */

export type PalmTopic = 'tc' | 'tt' | 'tcm' | 'sn' | 'tl' | 'ss' | 'gt' | 'st' | 'dx';
export const PALM_TOPICS: readonly PalmTopic[] = ['tc', 'tt', 'tcm', 'sn', 'tl', 'ss', 'gt', 'st', 'dx'];
export type PalmTone = '+' | '=' | '!';
export type PalmGroup = 'hand' | 'finger' | 'tip' | 'print' | 'combo-print' | 'nail' | 'mount' | 'line' | 'extra' | 'combo' | 'mark';
export type PalmLineId = 'sinh' | 'tri' | 'tam' | 'dinhmang' | 'thaiduong' | 'thuytinh' | 'tinhduyen'
  | 'vongkim' | 'vongmoc' | 'vienDu' | 'thuongthang' | 'trucgiac' | 'cantro' | 'anhhuong';
export type MountId = 'kim' | 'moc' | 'tho' | 'thaiduong' | 'thuy' | 'thaiam' | 'hoaduong' | 'hoaam' | 'donghoa' | 'kham';
export type MarkType = 'star' | 'cross' | 'triangle' | 'square' | 'rect' | 'circle' | 'island' | 'grille' | 'chain' | 'fork' | 'bar' | 'redDot' | 'mole';
export type FingerPrint = 'loop' | 'whorl' | 'arch';

/** Phần không phải câu chữ của một đặc điểm: engine cần để xếp và tổng kết. Lấy từ src/content/palm. */
export interface PalmMeta {
  id: string;
  group: PalmGroup;
  topics: readonly PalmTopic[];
  tone: PalmTone;
  weight: 1 | 2 | 3;
  line?: PalmLineId;
  mount?: MountId;
  /** chưa đối chiếu xong với sách (V19, V26, N04): không đưa vào kết quả */
  hidden?: boolean;
}

/** Câu trả lời của một tay. Giá trị là mã đặc điểm (`SD02`) hoặc mã trung tính (`vua`, `can-doi`); `null` là "Không rõ". */
export interface PalmHandInput {
  answers: Record<string, string | readonly string[] | null>;
  /** vân tay 5 ngón, cái → út (bản đầu chưa hỏi) */
  prints?: readonly (FingerPrint | null)[];
  /** dấu đặc biệt trên gò (bản đầu chưa hỏi) */
  marks?: readonly { mount: MountId; type: MarkType }[];
}

export interface PalmInput {
  dominant: 'left' | 'right';
  /** tay "hiện tại & điều đang vun đắp" */
  current: PalmHandInput;
  /** tay "nền tảng bẩm sinh", tuỳ chọn */
  innate?: PalmHandInput;
  method: 'dominant' | 'namTaNuHuu' | 'clasp';
}

export type PalmSectionKey = 'tong-quan' | 'ngon' | 'duong-chinh' | 'duong-phu' | 'go-dau';
export const PALM_SECTIONS: readonly PalmSectionKey[] = ['tong-quan', 'ngon', 'duong-chinh', 'duong-phu', 'go-dau'];

export type PalmConfidence = 'xu-huong' | 'ro';

export interface PalmTopicSummary { ids: string[]; confidence: PalmConfidence }

export interface PalmCompare {
  /** cùng đặc điểm ở cả hai tay */
  steady: string[];
  /** chỉ tay hiện tại có, và là điểm thuận */
  growing: string[];
  /** chỉ tay bẩm sinh có, và là điểm thuận */
  latent: string[];
}

export interface PalmResult {
  /** mã đặc điểm của tay hiện tại theo từng mục, đã xếp thứ tự */
  sections: { key: PalmSectionKey; ids: string[] }[];
  byTopic: Partial<Record<PalmTopic, PalmTopicSummary>>;
  compare?: PalmCompare;
}

/** Điểm trên ảnh hoặc sơ đồ, đơn vị tuỳ ý, mọi phép đo đều tính theo tỉ lệ bàn tay. */
export interface PalmPt { x: number; y: number }

/** Đầu vào của phép đo: 21 điểm khớp MediaPipe và các nét người dùng đã xác nhận, cùng một hệ toạ độ có ngón cái bên trái. */
export interface PalmTrace {
  landmarks: readonly PalmPt[];
  lines: Partial<Record<'sinh' | 'tri' | 'tam' | 'dinh', readonly PalmPt[]>>;
  /** số chỗ đứt của mỗi đường (các đoạn người dùng vẽ rời nhau). Có chỗ đứt thì Q18, Q22, Q26 được điền sẵn là "Đứt". */
  breaks?: Partial<Record<'sinh' | 'tri' | 'tam' | 'dinh', number>>;
}

/** Kết quả một phép đo: mã đặc điểm (hoặc mã trung tính) và số đo gốc để kiểm tra. `null` là không đo được. */
export interface PalmMeasure { q: string; id: string | null; value?: number }
