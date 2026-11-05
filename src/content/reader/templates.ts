/* Lời dẫn của thầy (ARCHITECTURE.md mục 12.6–12.8). Bộ tối thiểu; bộ đầy đủ viết ở Phase 6.7. Mẫu câu có biến, KHÔNG sinh tự do.
   Thầy không hù doạ, không hứa hẹn, không gợi ý lễ bái hay mua bán. */
export const CULTURE_LINE = 'Số là tham khảo, đức năng thắng số.';

export type ReaderTool = 'tuvi' | 'battu' | 'luchao' | 'battrach' | 'napam' | 'tonghop';

/** `owned` = gắn với một người nên có câu "của ai"; Lục Hào và Nạp Âm thì không. */
export const TOOL_NAME: Record<ReaderTool, { name: string; owned: boolean }> = {
  tuvi: { name: 'lá số Tử Vi', owned: true },
  battu: { name: 'lá số Bát Tự', owned: true },
  luchao: { name: 'quẻ Lục Hào này', owned: false },
  battrach: { name: 'phần Bát Trạch', owned: true },
  napam: { name: 'phần Nạp Âm', owned: false },
  tonghop: { name: 'phần tổng hợp', owned: true },
};

export const T = {
  openSelf: `Thầy chào {goi}. Thầy đọc {tool} của {goi}. ${CULTURE_LINE}`,
  openOther: `Thầy chào {goi}. Thầy đọc {tool} của {ten}. ${CULTURE_LINE}`,
  openPlain: `Thầy chào {goi}. Thầy đọc {tool}. ${CULTURE_LINE}`,
  close: `Thầy đọc đến đây. ${CULTURE_LINE}`,
  leadCells: 'Trước hết là các chỉ số chính.',
  leadSections: 'Giờ thầy đọc phần tổng kết.',
  noSpeech: '(Phần này {goi} xem chữ trên màn hình)',
  tuviMenh: 'Cung Mệnh ở {cung}{sao}.',
  battuNhatChu: 'Đây là trụ ngày, Nhật Chủ là {nhatChu}.',
  luchaoThe: 'Hào Thế nằm ở hào {hao}.',
  battrachHuong: 'Hướng tốt nhất là {huong}, sao {sao}.',
} as const;

export function fill(t: string, vars: Record<string, string | number>): string {
  return t.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
}
