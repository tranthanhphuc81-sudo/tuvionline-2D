/* Người đọc ở Tĩnh thất: người dùng chọn nhân vật và màu áo (Cài đặt). Hình ở src/assets/journey/character/, sinh bằng
   scripts/build-characters.mjs; `ta` là tiếng người đọc tự xưng, thay vào biến {ta} trong mẫu câu (content/reader/templates.ts). */

export type PersonaId = 'thay' | 'thay-trung' | 'thay-tre' | 'ong-do' | 'dao-si' | 'su' | 'co-do' | 'ba-cu' | 'su-co' | 'co-tre';

export interface Persona {
  id: PersonaId;
  /** tên hiện ở Cài đặt */
  name: string;
  /** tả ngắn cho trình đọc màn hình và dưới tên */
  note: string;
  /** tự xưng */
  ta: string;
  /** cao tuổi hơn người xem: tự động gọi người trẻ là "con"; không thì gọi "bạn" */
  elder: boolean;
  /** nhân với cao độ giọng của người dùng: nam trầm hơn, nữ cao hơn */
  pitch: number;
  /** màu áo mặc định */
  robe: RobeId;
}

export const PERSONAS: readonly Persona[] = [
  { id: 'thay', name: 'Thầy', note: 'Cụ ông râu tóc bạc', ta: 'thầy', elder: true, pitch: 0.85, robe: 'cham' },
  { id: 'thay-trung', name: 'Thầy trung niên', note: 'Tóc hoa râm, râu ngắn', ta: 'thầy', elder: true, pitch: 0.88, robe: 'nau' },
  { id: 'thay-tre', name: 'Thầy trẻ', note: 'Tóc đen búi gọn', ta: 'thầy', elder: false, pitch: 0.92, robe: 'ngoc' },
  { id: 'ong-do', name: 'Ông đồ', note: 'Khăn đóng, râu bạc', ta: 'ông', elder: true, pitch: 0.84, robe: 'tim' },
  { id: 'dao-si', name: 'Đạo sĩ', note: 'Mũ đạo, râu dài', ta: 'thầy', elder: true, pitch: 0.86, robe: 'cham' },
  { id: 'su', name: 'Sư thầy', note: 'Nhà sư, chuỗi hạt', ta: 'thầy', elder: true, pitch: 0.88, robe: 'nghe' },
  { id: 'co-do', name: 'Cô đồ', note: 'Tóc búi, trâm cài', ta: 'cô', elder: true, pitch: 1.08, robe: 'son' },
  { id: 'ba-cu', name: 'Bà cụ', note: 'Tóc bạc búi tó', ta: 'bà', elder: true, pitch: 1.02, robe: 'nau' },
  { id: 'su-co', name: 'Sư cô', note: 'Ni cô, áo lam', ta: 'cô', elder: true, pitch: 1.06, robe: 'lam' },
  { id: 'co-tre', name: 'Cô gái trẻ', note: 'Tóc dài thả', ta: 'chị', elder: false, pitch: 1.12, robe: 'ngoc' },
];

export type RobeId = 'cham' | 'nau' | 'son' | 'ngoc' | 'tim' | 'nghe' | 'lam' | 'den';

/** Màu áo: [màu chính, màu sáng của tay áo, màu nếp gấp]. */
export const ROBES: Record<RobeId, { name: string; colors: [string, string, string] }> = {
  cham: { name: 'Chàm', colors: ['#2f3556', '#454c78', '#232845'] },
  nau: { name: 'Nâu', colors: ['#5a3d2b', '#7a5640', '#422c1f'] },
  son: { name: 'Đỏ son', colors: ['#8c2f24', '#ad4536', '#6a2219'] },
  ngoc: { name: 'Xanh ngọc', colors: ['#2f6b5e', '#448878', '#22504a'] },
  tim: { name: 'Tím than', colors: ['#3d2f52', '#56456f', '#2c213d'] },
  nghe: { name: 'Vàng nghệ', colors: ['#b5722a', '#cf8d3e', '#8d561c'] },
  lam: { name: 'Lam', colors: ['#56657a', '#717f94', '#3f4b5c'] },
  den: { name: 'Đen tuyền', colors: ['#24262b', '#3a3d45', '#17181c'] },
};
export const ROBE_IDS = Object.keys(ROBES) as RobeId[];

export const DEFAULT_PERSONA: PersonaId = 'thay';
export const personaOf = (id: string | undefined): Persona => PERSONAS.find((p) => p.id === id) ?? PERSONAS[0];
export const robeOf = (persona: Persona, id: string | undefined): RobeId => (id && id in ROBES ? (id as RobeId) : persona.robe);

/** "Thầy", "Cô"… viết hoa chữ đầu, cho nhãn nút như "Thầy đọc". */
export const taTitle = (p: Persona) => p.ta.charAt(0).toLocaleUpperCase('vi') + p.ta.slice(1);

/** Người đọc tự tạo từ ảnh của người dùng. */
export const CUSTOM_READER = 'custom';
export const CUSTOM_TA: readonly string[] = ['thầy', 'cô', 'ông', 'bà', 'anh', 'chị', 'tôi'];
export interface CustomReaderInfo { name: string; ta: string; voice: 'nam' | 'nu'; look?: 'stand' | 'frame' | 'face'; frame?: boolean }
export const DEFAULT_CUSTOM: CustomReaderInfo = { name: 'Người đọc của tôi', ta: 'thầy', voice: 'nam' };

/** Người đọc đang chọn trong Cài đặt. `custom` mà chưa có thông tin thì dùng mặc định; mã lạ thì là Thầy. */
export function readerPersona(reader: string | undefined, custom: CustomReaderInfo | undefined): Persona & { custom: boolean } {
  if (reader === CUSTOM_READER) {
    const c = custom ?? DEFAULT_CUSTOM;
    return { id: 'thay', name: c.name || DEFAULT_CUSTOM.name, note: 'Ảnh của bạn', ta: c.ta || 'thầy', elder: !['anh', 'chị', 'tôi'].includes(c.ta), pitch: c.voice === 'nu' ? 1.08 : 0.86, robe: 'cham', custom: true };
  }
  return { ...personaOf(reader), custom: false };
}
