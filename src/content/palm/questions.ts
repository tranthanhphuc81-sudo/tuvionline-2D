/* Bộ câu hỏi xem chỉ tay, đúng bảng CHI-TAY §11. Mỗi lựa chọn trỏ tới mã đặc điểm trong palm-content.vi.json, hoặc mã trung tính
   (không có câu luận). Câu nào cũng có "Không rõ" (giá trị null), giao diện tự thêm.
   `stage` theo ARCHITECTURE mục 13.1: hỏi trước khi chụp, máy đo rồi người xác nhận, phần cơ bản, "Xem kỹ hơn", hoặc để bản sau. */

export type PalmQuestionStage = 'before' | 'measured' | 'basic' | 'more' | 'later';

export interface PalmOption {
  /** mã đặc điểm, mã trung tính, hoặc giá trị riêng của câu (Q01) */
  value: string;
  label: string;
}

export interface PalmQuestion {
  id: string;
  text: string;
  stage: PalmQuestionStage;
  multi: boolean;
  options: readonly PalmOption[];
  /** gợi ý cách quan sát, hiện dưới câu hỏi */
  hint?: string;
}

/** Mã không có câu luận: chọn chúng nghĩa là "bình thường". */
export const NEUTRAL_VALUES: ReadonlySet<string> = new Set(['vua', 'can-doi', 'ngang', 'trung-binh', 'binh-thuong', 'right', 'left', 'gan-tam', 'giua', 'gan-ut', 'khong-co']);

/** Mã hình minh hoạ của một lựa chọn: hình ở src/assets/palm/ill/<Q>-<lựa chọn>.svg (bước 3B.3, 3B.4). */
export const illustrationId = (q: string, value: string) => `ill.${q}.${value}`;

const o = (value: string, label: string): PalmOption => ({ value, label });

export const PALM_QUESTIONS: readonly PalmQuestion[] = [
  { id: 'Q01', text: 'Bạn thuận tay nào?', stage: 'before', multi: false, options: [o('right', 'Tay phải'), o('left', 'Tay trái')] },
  { id: 'Q02', text: 'Hình dáng bàn tay giống hình nào nhất?', stage: 'basic', multi: false, options: [o('H01', 'Vuông'), o('H02', 'Chữ nhật'), o('H03', 'Thon nhọn'), o('H04', 'Bè'), o('H05', 'Tròn đầy'), o('H06', 'Xương khớp'), o('H07', 'Lẫn lộn')] },
  { id: 'Q03', text: 'So với vóc người, bàn tay…', stage: 'more', multi: false, options: [o('H08', 'To'), o('vua', 'Vừa'), o('H09', 'Nhỏ')] },
  { id: 'Q04', text: 'Bàn tay dài hay rộng?', stage: 'measured', multi: false, options: [o('H10', 'Dài'), o('can-doi', 'Cân đối'), o('H11', 'Rộng')] },
  { id: 'Q05', text: 'Khi nắm thử, tay bạn…', stage: 'more', multi: false, options: [o('H12', 'Cứng'), o('vua', 'Vừa'), o('H13', 'Mềm')] },
  { id: 'Q06', text: 'Tay bạn thường…', stage: 'more', multi: false, options: [o('H14', 'Ấm'), o('binh-thuong', 'Bình thường'), o('H15', 'Mát')] },
  { id: 'Q07', text: 'Lòng bàn tay', stage: 'more', multi: false, options: [o('H16', 'Đầy đặn'), o('H17', 'Trũng giữa'), o('H18', 'Mỏng, phẳng')] },
  { id: 'Q08', text: 'Áp ngón cái vào cạnh ngón trỏ, đầu ngón cái tới đâu?', stage: 'measured', multi: false, hint: 'Tới khớp giữa đốt giữa và đốt gốc ngón trỏ là dài, khoảng 1/3 đốt gốc là trung bình.', options: [o('F01', 'Dài'), o('trung-binh', 'Trung bình'), o('F02', 'Ngắn')] },
  { id: 'Q09', text: 'Xoè tay tự nhiên, ngón cái…', stage: 'measured', multi: false, options: [o('F03', 'Dang xa'), o('vua', 'Bình thường'), o('F04', 'Khép sát')] },
  { id: 'Q10', text: 'Ngón trỏ so với ngón áp út', stage: 'measured', multi: false, options: [o('F08', 'Dài hơn'), o('F09', 'Ngắn hơn'), o('F10', 'Gần bằng')] },
  { id: 'Q11', text: 'Ngón út so với ngấn đốt trên ngón áp út', stage: 'measured', multi: false, options: [o('F14', 'Vượt'), o('ngang', 'Ngang'), o('F15', 'Thấp hơn')] },
  { id: 'Q12', text: 'Ngón tay so với lòng bàn tay', stage: 'measured', multi: false, options: [o('F16', 'Dài'), o('can-doi', 'Cân đối'), o('F17', 'Ngắn')] },
  { id: 'Q13', text: 'Khớp ngón', stage: 'more', multi: false, options: [o('F18', 'Nổi rõ'), o('F19', 'Nhẵn')] },
  { id: 'Q14', text: 'Đầu ngón tay đa số', stage: 'basic', multi: false, options: [o('T01', 'Vuông'), o('T02', 'Nhọn'), o('T03', 'Tròn'), o('T04', 'Bè')] },
  // Q15 vân tay hỏi theo từng ngón (`prints` của PalmHandInput), để bản sau
  { id: 'Q15', text: 'Vân tay từng ngón: móng thú, xoáy hay cung', stage: 'later', multi: false, options: [] },
  { id: 'Q16', text: 'Dáng móng tay', stage: 'later', multi: false, options: [o('N01', 'Vuông'), o('N02', 'Tròn, bầu'), o('N03', 'Chữ nhật dài'), o('N04', 'Hạnh nhân'), o('N05', 'Nhọn'), o('N06', 'Rộng bản'), o('N07', 'Rất ngắn'), o('N08', 'Tam giác')] },
  { id: 'Q17', text: 'Sinh đạo cong thế nào so với đường từ giữa cổ tay lên ngón giữa?', stage: 'measured', multi: false, options: [o('SD02', 'Cong rộng, vượt ra'), o('vua', 'Cong vừa'), o('SD03', 'Ôm sát gốc ngón cái')] },
  { id: 'Q18', text: 'Nét Sinh đạo', stage: 'more', multi: false, options: [o('SD01', 'Rõ, sâu'), o('SD04', 'Mờ'), o('SD05', 'Dây xích'), o('SD06', 'Đứt'), o('SD07', 'Đứt có đoạn che chắn'), o('SD08', 'Đôi')] },
  { id: 'Q19', text: 'Nhánh của Sinh đạo (chọn nhiều)', stage: 'more', multi: true, options: [o('SD09', 'Lên ngón trỏ'), o('SD10', 'Lên ngón giữa'), o('SD11', 'Về ngón út'), o('SD12', 'Ra gò Thái Âm')] },
  { id: 'Q20', text: 'Đầu Sinh đạo và Trí đạo', stage: 'measured', multi: false, options: [o('TD15', 'Dính một đoạn'), o('TD16', 'Tách hở'), o('C02', 'Ba đường chung một điểm'), o('C03', 'Ba đường tách rời')] },
  // Q21 trong CHI-TAY gộp hướng và độ dài, tách làm hai để đo và hỏi riêng
  { id: 'Q21-huong', text: 'Trí đạo, hướng đi', stage: 'measured', multi: false, options: [o('TD02', 'Thẳng ngang'), o('TD03', 'Cong nhẹ'), o('TD04', 'Cong sâu xuống gò Thái Âm')] },
  { id: 'Q21-dai', text: 'Trí đạo, độ dài', stage: 'measured', multi: false, options: [o('TD05', 'Dài tới mép tay'), o('TD06', 'Tới dưới ngón áp út'), o('TD07', 'Ngắn')] },
  { id: 'Q22', text: 'Hình dạng Trí đạo (chọn nhiều)', stage: 'more', multi: true, options: [o('TD08', 'Chẻ đôi ở cuối'), o('TD09', 'Ba nhánh ở đầu'), o('TD10', 'Hai đường'), o('TD11', 'Uốn lượn'), o('TD12', 'Dây xích'), o('TD13', 'Cù lao'), o('TD19', 'Đứt')] },
  { id: 'Q23', text: 'Tâm đạo, đầu phía ngón trỏ dừng ở đâu?', stage: 'measured', multi: false, options: [o('TAM01', 'Giữa ngón trỏ và ngón giữa'), o('TAM02', 'Gốc ngón trỏ'), o('TAM03', 'Chạy suốt ngang tay'), o('TAM04', 'Dưới ngón giữa'), o('TAM05', 'Cong vút lên ngón giữa'), o('TAM13', 'Nhập vào Trí đạo'), o('C05', 'Tâm đạo và Trí đạo là một đường')] },
  { id: 'Q24', text: 'Hình dạng Tâm đạo (chọn nhiều)', stage: 'more', multi: true, options: [o('TAM06', 'Thẳng'), o('TAM07', 'Chẻ ở cuối'), o('TAM08', 'Nhánh hướng lên'), o('TAM09', 'Nhánh hướng xuống'), o('TAM10', 'Dây xích'), o('TAM11', 'Cù lao'), o('TAM14', 'Hai đường')] },
  { id: 'Q25', text: 'Định mạng bắt đầu từ đâu?', stage: 'measured', multi: false, options: [o('DM15', 'Không có'), o('DM02', 'Cổ tay'), o('DM03', 'Sinh đạo'), o('DM04', 'Gò Thái Âm'), o('DM05', 'Gò Kim Tinh'), o('DM06', 'Giữa lòng bàn tay'), o('DM07', 'Chỉ rõ đoạn trên')] },
  { id: 'Q26', text: 'Hình dạng Định mạng', stage: 'more', multi: false, options: [o('DM01', 'Thẳng, dài'), o('DM09', 'Đứt'), o('DM10', 'Đứt có đoạn chồng'), o('DM11', 'Hơi cong'), o('DM12', 'Lên tới gò Thổ Tinh'), o('DM14', 'Chẻ ba ở cuối')] },
  { id: 'Q27', text: 'Đường Thái Dương (dọc dưới ngón áp út)', stage: 'more', multi: false, options: [o('khong-co', 'Không có'), o('TDU01', 'Dài, rõ'), o('TDU02', 'Đoạn ngắn trên Tâm đạo'), o('TDU10', 'Nhiều đoạn ngắn'), o('TDU11', 'Hai đường')] },
  { id: 'Q28', text: 'Đường Tình duyên rõ nhất', stage: 'more', multi: false, options: [o('HN04', 'Không có'), o('HN01', 'Một đường dài'), o('HN03', 'Ngắn và nhiều'), o('HN05', 'Cong lên chạm Thái Dương'), o('HN06', 'Cong xuống'), o('HN08', 'Chẻ ở đầu'), o('HN09', 'Chẻ ở cuối')] },
  { id: 'Q29', text: 'Vị trí đường Tình duyên rõ nhất', stage: 'more', multi: false, options: [o('gan-tam', 'Gần Tâm đạo'), o('giua', 'Ở giữa'), o('gan-ut', 'Gần gốc ngón út')] },
  // Q30 chọn trên sơ đồ gò, đổi sang mã M bằng `mountAnswer`
  { id: 'Q30', text: 'Gò nổi rõ nhất và gò phẳng nhất (chạm trên sơ đồ)', stage: 'more', multi: true, options: [] },
  { id: 'Q31', text: 'Dấu đặc biệt: chạm vị trí trên sơ đồ rồi chọn hình dấu', stage: 'later', multi: true, options: [] },
  { id: 'Q32', text: 'Tổng thể số chỉ trên bàn tay', stage: 'more', multi: false, options: [o('C06', 'Ít chỉ'), o('vua', 'Vừa'), o('C07', 'Nhiều chỉ nhỏ')] },
];

/** Gò nổi rõ hoặc phẳng (Q30) → mã M. Gò không có câu luận ở mức đó thì trả null. */
export function mountAnswer(mount: string, level: 'noi' | 'phang'): string | null {
  const noi: Record<string, string> = { kim: 'M01', moc: 'M04', tho: 'M08', thaiduong: 'M10', thuy: 'M12', thaiam: 'M14', hoaduong: 'M17', hoaam: 'M18' };
  const phang: Record<string, string> = { kim: 'M02', moc: 'M06', tho: 'M09', thaiam: 'M16' };
  return (level === 'noi' ? noi : phang)[mount] ?? null;
}

export const questionsAt = (stage: PalmQuestionStage) => PALM_QUESTIONS.filter((q) => q.stage === stage);
