/* Lời của thầy và đạo đồng (ARCHITECTURE.md mục 12.6–12.8). Mẫu câu có biến, KHÔNG sinh tự do.
   Giọng mộc, từ tốn, câu ngắn. Không hù doạ, không hứa hẹn, không phán quyết, không gợi ý lễ bái hay mua bán.
   Biến: {goi} tiếng gọi người xem · {cuaAi} "của con" hoặc "của Lan" · {cung} {sao} {nhatChu} {hao} {huong} {duong}. */
export const CULTURE_LINE = 'Số là tham khảo, đức năng thắng số.';

export type ReaderTool = 'tuvi' | 'battu' | 'luchao' | 'battrach' | 'laban' | 'napam' | 'tonghop' | 'chitay';

const C = CULTURE_LINE;

export const TOOL_LINES: Record<ReaderTool, { open: readonly string[]; close: readonly string[]; cells: readonly string[]; sections: readonly string[] }> = {
  tuvi: {
    open: [
      `Thầy chào {goi}. Mình cùng xem lá số Tử Vi {cuaAi}. ${C}`,
      `{goi} ngồi xuống đây, thầy mở lá số Tử Vi {cuaAi}. ${C}`,
      `Lá số Tử Vi {cuaAi} đây rồi. Mình xem từ tốn thôi. ${C}`,
    ],
    close: [
      `Lá số thầy đọc đến đây. Chỗ nào chưa rõ thì mở lại xem từng cung. ${C}`,
      `Thầy đọc xong lá số rồi. Xem để hiểu mình hơn, không phải để lo. ${C}`,
      `Đọc đến đây là đủ cho hôm nay. Nhớ lấy một câu thôi: ${C}`,
    ],
    cells: ['Trước hết, thầy điểm qua các chỉ số trên lá số.', 'Mình nhìn các chỉ số chính đã.'],
    sections: ['Giờ thầy gom lại thành mấy ý chính.', 'Nhìn chung cả lá số, thầy đọc phần tổng kết.'],
  },
  battu: {
    open: [
      `Thầy chào {goi}. Mình xem bốn trụ Bát Tự {cuaAi}. ${C}`,
      `Bốn trụ năm, tháng, ngày, giờ {cuaAi} thầy đã xếp xong. ${C}`,
      `{goi} xem đây, Bát Tự {cuaAi} có tám chữ. Mình đọc từng chữ một. ${C}`,
    ],
    close: [
      `Bát Tự thầy đọc đến đây. Tám chữ chỉ là một cách nhìn. ${C}`,
      `Thầy đọc xong bốn trụ rồi. Hành nào thiếu thì mình bồi dần trong nếp sống. ${C}`,
      `Đọc đến đây thôi. Giữ lòng cho yên là được. ${C}`,
    ],
    cells: ['Trước hết là mấy chỉ số của bốn trụ.', 'Mình nhìn tóm tắt bốn trụ đã.'],
    sections: ['Giờ thầy nói về vượng suy và cách cân bằng.', 'Gom cả tám chữ lại, thầy đọc phần tổng kết.'],
  },
  luchao: {
    open: [
      `Thầy chào {goi}. Quẻ gieo xong rồi, mình cùng đọc. ${C}`,
      `Quẻ này ứng với việc {goi} đang hỏi. Mình xem từng hào. ${C}`,
      `Sáu hào đã đủ. {goi} lắng lòng, thầy đọc quẻ. ${C}`,
    ],
    close: [
      `Quẻ thầy đọc đến đây. Quẻ chỉ gợi ý, việc vẫn do mình quyết. ${C}`,
      `Đọc xong quẻ rồi. Cân nhắc kỹ rồi hãy làm. ${C}`,
      `Thầy dừng ở đây. Một quẻ chỉ soi được một lúc thôi. ${C}`,
    ],
    cells: ['Trước hết là tên quẻ và ngày xem.', 'Mình nhìn thông tin của quẻ đã.'],
    sections: ['Giờ thầy luận theo việc {goi} hỏi.', 'Xem hào Dụng Thần và sự vượng suy, thầy đọc phần luận.'],
  },
  battrach: {
    open: [
      `Thầy chào {goi}. Mình xem Bát Trạch {cuaAi}. ${C}`,
      `Mệnh Quái {cuaAi} thầy đã tính xong. Mình xem hướng hợp. ${C}`,
      `{goi} ngồi đây, thầy chỉ cho các hướng theo Bát Trạch. ${C}`,
    ],
    close: [
      `Phần Bát Trạch đến đây. Nhà cửa đổi được gì thì đổi, đừng quá bận lòng. ${C}`,
      `Thầy đọc xong các hướng rồi. Thoáng và sáng vẫn là tốt nhất. ${C}`,
      `Đọc đến đây thôi. Ở sao cho an là được. ${C}`,
    ],
    cells: ['Trước hết là Mệnh Quái và nhóm mệnh.', 'Mình nhìn các chỉ số chính đã.'],
    sections: ['Giờ thầy đọc về từng hướng.', 'Thầy gom lại cách dùng các hướng này.'],
  },
  laban: {
    open: [
      `Thầy chào {goi}. Mình cùng xem hướng trên la bàn. ${C}`,
      `{goi} giữ máy cho phẳng, thầy đọc hướng đang chỉ. ${C}`,
      `La bàn đã chỉ hướng rồi. Mình xem hướng này ra sao. ${C}`,
    ],
    close: [
      `Hướng này thầy đọc đến đây. Muốn xem hướng khác thì xoay máy rồi gọi thầy. ${C}`,
      `Thầy đọc xong rồi. Thoáng và sáng vẫn là tốt nhất. ${C}`,
      `Đọc đến đây thôi. Hướng chỉ là một phần, ở sao cho an mới là chính. ${C}`,
    ],
    cells: ['Trước hết là hướng và quẻ của nó.', 'Mình nhìn hướng đang chỉ đã.'],
    // La Bàn không có phần Tổng kết nên không cần câu dẫn
    sections: [],
  },
  napam: {
    open: [
      `Thầy chào {goi}. Mình xem Nạp Âm. ${C}`,
      `Nạp Âm là một cách gọi năm sinh qua Ngũ hành. Mình cùng xem. ${C}`,
      `Thầy đọc phần Nạp Âm cho {goi} nghe. ${C}`,
    ],
    close: [
      `Nạp Âm thầy đọc đến đây. Chuyện hợp nhau cốt ở lòng người. ${C}`,
      `Đọc xong rồi. Tuổi chỉ là một phần, cách sống mới là chính. ${C}`,
      `Thầy dừng ở đây. Xem để hiểu nhau hơn thôi. ${C}`,
    ],
    cells: ['Trước hết là tên Nạp Âm và năm sinh.', 'Mình nhìn tóm tắt đã.'],
    sections: ['Giờ thầy đọc phần giải thích.', 'Thầy gom lại mấy ý chính.'],
  },
  tonghop: {
    open: [
      `Thầy chào {goi}. Mình gom cả bốn hệ thống lại xem {cuaAi}. ${C}`,
      `Thầy đọc phần tổng hợp {cuaAi}. Mỗi hệ thống một góc nhìn. ${C}`,
      `{goi} ngồi đây, thầy đọc sổ tổng hợp {cuaAi}. ${C}`,
    ],
    close: [
      `Sổ tổng hợp thầy đọc đến đây. Chỗ nào muốn rõ hơn thì mở từng món trên án thư. ${C}`,
      `Thầy đọc xong rồi. Giữ điều hay, bỏ điều chưa hợp. ${C}`,
      `Đọc đến đây là đủ. Ngày mai vẫn do mình làm ra. ${C}`,
    ],
    cells: ['Trước hết, thầy điểm qua các chỉ số.', 'Mình nhìn tóm tắt đã.'],
    sections: ['Giờ thầy đọc từng phần.', 'Thầy đọc tiếp phần tổng hợp.'],
  },
  chitay: {
    open: [
      `Thầy chào {goi}. Mình cùng xem bàn tay {cuaAi}. ${C}`,
      `Bàn tay là tấm gương soi lại mình. Thầy đọc tay {cuaAi}. ${C}`,
      `Thầy thấy các đường chỉ {cuaAi} rồi. Mình đọc từ từ nhé. ${C}`,
    ],
    close: [
      `Tay thầy đọc đến đây. Đường chỉ đổi theo cách mình sống, sáu tháng một năm xem lại cũng được. ${C}`,
      `Thầy đọc xong rồi. Giữ điều hay, sửa điều chưa hợp, tay cũng đổi theo. ${C}`,
      `Đọc đến đây thôi. Tay là của mình, đường đi cũng do mình. ${C}`,
    ],
    cells: ['Trước hết thầy tóm lại mấy ý chính.', 'Mình nghe phần tóm tắt đã.'],
    sections: ['Giờ thầy đọc kỹ từng phần.', 'Thầy đọc tiếp từng phần trên tay.'],
  },
};

/** Lời dẫn tô sáng trên lá số. */
export const LEADS = {
  tuviMenh: ['{goi} xem ở đây, cung Mệnh ở {cung}{sao}.', 'Đây là cung Mệnh, nằm ở {cung}{sao}.'],
  battuNhatChu: ['{goi} xem trụ ngày, Nhật Chủ là {nhatChu}.', 'Chữ chính là Nhật Chủ {nhatChu}, nằm ở trụ ngày.'],
  luchaoThe: ['{goi} xem hào {hao}, đó là hào Thế.', 'Hào Thế nằm ở hào {hao}.'],
  battrachHuong: ['{goi} xem hướng {huong}, sao {sao}, là hướng tốt nhất.', 'Hướng hợp nhất là {huong}, ứng với sao {sao}.'],
  labanHuong: ['Hướng {huong} thầy tô sáng trên vòng la bàn đây.', '{goi} nhìn trên vòng la bàn, hướng {huong} đang sáng lên.'],
  chitayDuong: ['{goi} xem {duong}, thầy tô sáng trên tay đây.', 'Đây là {duong}.'],
} as const;

export const NO_SPEECH_LINE = '(Phần này {goi} xem chữ trên màn hình)';

/** Lời đạo đồng. Đạo đồng xưng "con", gọi người vào là "khách". */
export const DONG_LINES = {
  gate: ['Con chào khách. Mời khách vào.', 'Khách đến rồi ạ. Mời khách đi lối này.', 'Con mở cổng rồi, mời khách vào ạ.'],
  corridor: ['Thầy đang đợi trong tĩnh thất, mời khách.', 'Qua hành lang này là tới chỗ thầy ạ.', 'Mời khách vào, thầy ở trong ạ.'],
  intro: ['Con chào khách. Thầy nhờ con hỏi vài điều để lập hồ sơ. Mọi thứ chỉ lưu trên máy này ạ.'],
  name: ['Dạ, con xin hỏi họ tên hoặc biệt danh ạ?'],
  gender: ['Dạ, hồ sơ này là của nam hay nữ ạ?'],
  date: ['Dạ, ngày tháng năm sinh là khi nào ạ?'],
  hour: ['Dạ, sinh vào giờ nào ạ? Không nhớ rõ thì chọn giờ gần nhất.'],
} as const;

/** Lời chào ở Tĩnh thất khi chưa đọc gì. */
export const STUDY_LINES = {
  self: [
    'Thầy chào {goi}. Mời {goi} chọn một món trên án thư, hoặc bấm "Thầy đọc" để nghe phần tổng hợp.',
    '{goi} đến rồi đấy à. Muốn xem gì thì chạm vào món đó, hoặc bấm "Thầy đọc".',
  ],
  other: [
    'Thầy chào {goi}. Hồ sơ của {ten} đây. Chọn một món trên án thư, hoặc bấm "Thầy đọc".',
    'Mình đang xem hồ sơ của {ten}. Chạm vào món muốn xem, hoặc bấm "Thầy đọc".',
  ],
} as const;

export const pick = <T,>(list: readonly T[], seed: number): T => list[Math.abs(seed) % list.length];

/** Thay biến. Viết hoa chữ đầu câu vì {goi} có thể đứng đầu câu ("Con xem…"). */
export function fill(t: string, vars: Record<string, string | number>): string {
  return t.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? '')).replace(/(^|[.!?]\s+)(\p{Ll})/gu, (_, a: string, b: string) => a + b.toUpperCase());
}

/** Mọi mẫu câu, để test quét. */
export function allLines(): string[] {
  return [...Object.values(TOOL_LINES).flatMap((t) => [...t.open, ...t.close, ...t.cells, ...t.sections]), ...Object.values(LEADS).flat(), NO_SPEECH_LINE, ...Object.values(DONG_LINES).flat(), ...Object.values(STUDY_LINES).flat()];
}
