/* Lời của thầy và đạo đồng (ARCHITECTURE.md mục 12.6–12.8). Mẫu câu có biến, KHÔNG sinh tự do.
   Giọng mộc, từ tốn, câu ngắn. Không hù doạ, không hứa hẹn, không phán quyết, không gợi ý lễ bái hay mua bán.
   Biến: {goi} tiếng gọi người xem · {ta}/{Ta} người đọc tự xưng (theo nhân vật đã chọn) · {cuaAi} "của con" hoặc "của Lan" · {cung} {sao} {nhatChu} {hao} {huong} {duong}. */
export const CULTURE_LINE = 'Số là tham khảo, đức năng thắng số.';

export type ReaderTool = 'tuvi' | 'battu' | 'luchao' | 'battrach' | 'laban' | 'napam' | 'tonghop' | 'chitay' | 'nguhanh';

const C = CULTURE_LINE;

export const TOOL_LINES: Record<ReaderTool, { open: readonly string[]; close: readonly string[]; cells: readonly string[]; sections: readonly string[] }> = {
  tuvi: {
    open: [
      `{Ta} chào {goi}. Mình cùng xem lá số Tử Vi {cuaAi}. ${C}`,
      `{goi} ngồi xuống đây, {ta} mở lá số Tử Vi {cuaAi}. ${C}`,
      `Lá số Tử Vi {cuaAi} đây rồi. Mình xem từ tốn thôi. ${C}`,
    ],
    close: [
      `Lá số {ta} đọc đến đây. Chỗ nào chưa rõ thì mở lại xem từng cung. ${C}`,
      `{Ta} đọc xong lá số rồi. Xem để hiểu mình hơn, không phải để lo. ${C}`,
      `Đọc đến đây là đủ cho hôm nay. Nhớ lấy một câu thôi: ${C}`,
    ],
    cells: ['Trước hết, {ta} điểm qua các chỉ số trên lá số.', 'Mình nhìn các chỉ số chính đã.'],
    sections: ['Giờ {ta} gom lại thành mấy ý chính.', 'Nhìn chung cả lá số, {ta} đọc phần tổng kết.'],
  },
  battu: {
    open: [
      `{Ta} chào {goi}. Mình xem bốn trụ Bát Tự {cuaAi}. ${C}`,
      `Bốn trụ năm, tháng, ngày, giờ {cuaAi} {ta} đã xếp xong. ${C}`,
      `{goi} xem đây, Bát Tự {cuaAi} có tám chữ. Mình đọc từng chữ một. ${C}`,
    ],
    close: [
      `Bát Tự {ta} đọc đến đây. Tám chữ chỉ là một cách nhìn. ${C}`,
      `{Ta} đọc xong bốn trụ rồi. Hành nào thiếu thì mình bồi dần trong nếp sống. ${C}`,
      `Đọc đến đây thôi. Giữ lòng cho yên là được. ${C}`,
    ],
    cells: ['Trước hết là mấy chỉ số của bốn trụ.', 'Mình nhìn tóm tắt bốn trụ đã.'],
    sections: ['Giờ {ta} nói về vượng suy và cách cân bằng.', 'Gom cả tám chữ lại, {ta} đọc phần tổng kết.'],
  },
  luchao: {
    open: [
      `{Ta} chào {goi}. Quẻ gieo xong rồi, mình cùng đọc. ${C}`,
      `Quẻ này ứng với việc {goi} đang hỏi. Mình xem từng hào. ${C}`,
      `Sáu hào đã đủ. {goi} lắng lòng, {ta} đọc quẻ. ${C}`,
    ],
    close: [
      `Quẻ {ta} đọc đến đây. Quẻ chỉ gợi ý, việc vẫn do mình quyết. ${C}`,
      `Đọc xong quẻ rồi. Cân nhắc kỹ rồi hãy làm. ${C}`,
      `{Ta} dừng ở đây. Một quẻ chỉ soi được một lúc thôi. ${C}`,
    ],
    cells: ['Trước hết là tên quẻ và ngày xem.', 'Mình nhìn thông tin của quẻ đã.'],
    sections: ['Giờ {ta} luận theo việc {goi} hỏi.', 'Xem hào Dụng Thần và sự vượng suy, {ta} đọc phần luận.'],
  },
  battrach: {
    open: [
      `{Ta} chào {goi}. Mình xem Bát Trạch {cuaAi}. ${C}`,
      `Mệnh Quái {cuaAi} {ta} đã tính xong. Mình xem hướng hợp. ${C}`,
      `{goi} ngồi đây, {ta} chỉ cho các hướng theo Bát Trạch. ${C}`,
    ],
    close: [
      `Phần Bát Trạch đến đây. Nhà cửa đổi được gì thì đổi, đừng quá bận lòng. ${C}`,
      `{Ta} đọc xong các hướng rồi. Thoáng và sáng vẫn là tốt nhất. ${C}`,
      `Đọc đến đây thôi. Ở sao cho an là được. ${C}`,
    ],
    cells: ['Trước hết là Mệnh Quái và nhóm mệnh.', 'Mình nhìn các chỉ số chính đã.'],
    sections: ['Giờ {ta} đọc về từng hướng.', '{Ta} gom lại cách dùng các hướng này.'],
  },
  laban: {
    open: [
      `{Ta} chào {goi}. Mình cùng xem hướng trên la bàn. ${C}`,
      `{goi} giữ máy cho phẳng, {ta} đọc hướng đang chỉ. ${C}`,
      `La bàn đã chỉ hướng rồi. Mình xem hướng này ra sao. ${C}`,
    ],
    close: [
      `Hướng này {ta} đọc đến đây. Muốn xem hướng khác thì xoay máy rồi gọi {ta}. ${C}`,
      `{Ta} đọc xong rồi. Thoáng và sáng vẫn là tốt nhất. ${C}`,
      `Đọc đến đây thôi. Hướng chỉ là một phần, ở sao cho an mới là chính. ${C}`,
    ],
    cells: ['Trước hết là hướng và quẻ của nó.', 'Mình nhìn hướng đang chỉ đã.'],
    // La Bàn không có phần Tổng kết nên không cần câu dẫn
    sections: [],
  },
  napam: {
    open: [
      `{Ta} chào {goi}. Mình xem Nạp Âm. ${C}`,
      `Nạp Âm là một cách gọi năm sinh qua Ngũ hành. Mình cùng xem. ${C}`,
      `{Ta} đọc phần Nạp Âm cho {goi} nghe. ${C}`,
    ],
    close: [
      `Nạp Âm {ta} đọc đến đây. Chuyện hợp nhau cốt ở lòng người. ${C}`,
      `Đọc xong rồi. Tuổi chỉ là một phần, cách sống mới là chính. ${C}`,
      `{Ta} dừng ở đây. Xem để hiểu nhau hơn thôi. ${C}`,
    ],
    cells: ['Trước hết là tên Nạp Âm và năm sinh.', 'Mình nhìn tóm tắt đã.'],
    sections: ['Giờ {ta} đọc phần giải thích.', '{Ta} gom lại mấy ý chính.'],
  },
  tonghop: {
    open: [
      `{Ta} chào {goi}. Mình gom cả bốn hệ thống lại xem {cuaAi}. ${C}`,
      `{Ta} đọc phần tổng hợp {cuaAi}. Mỗi hệ thống một góc nhìn. ${C}`,
      `{goi} ngồi đây, {ta} đọc sổ tổng hợp {cuaAi}. ${C}`,
    ],
    close: [
      `Sổ tổng hợp {ta} đọc đến đây. Chỗ nào muốn rõ hơn thì mở từng món trên án thư. ${C}`,
      `{Ta} đọc xong rồi. Giữ điều hay, bỏ điều chưa hợp. ${C}`,
      `Đọc đến đây là đủ. Ngày mai vẫn do mình làm ra. ${C}`,
    ],
    cells: ['Trước hết, {ta} điểm qua các chỉ số.', 'Mình nhìn tóm tắt đã.'],
    sections: ['Giờ {ta} đọc từng phần.', '{Ta} đọc tiếp phần tổng hợp.'],
  },
  nguhanh: {
    open: [
      `{Ta} chào {goi}. Mình xem thêm phần phân tích ngũ hành của lá số {cuaAi}. ${C}`,
      `Phần này {ta} đếm kỹ năm hành trong tám chữ {cuaAi}. Đây chỉ là một cách tính thêm. ${C}`,
      `{goi} nghe {ta} đọc phần ngũ hành nhé. Cách tính này mang tính tham khảo. ${C}`,
    ],
    close: [
      `Phần ngũ hành {ta} đọc đến đây. Chữ trên màn hình còn đủ các chi tiết. ${C}`,
      `{Ta} đọc xong rồi. Cách tính nào cũng chỉ để mình tự soi lại nếp sống. ${C}`,
      `Đọc đến đây thôi. Việc sắp xếp ngày tháng vẫn do mình quyết. ${C}`,
    ],
    cells: ['Trước hết {ta} nói qua mấy ý chính.', 'Mình nghe phần kết quả trước đã.'],
    sections: ['Giờ {ta} nói về cách sắp xếp nhịp sống.', '{Ta} gom lại thành lời khuyên ngắn.'],
  },
  chitay: {
    open: [
      `{Ta} chào {goi}. Mình cùng xem bàn tay {cuaAi}. Đường chỉ đổi theo cách mình sống. ${C}`,
      `Bàn tay là tấm gương soi lại mình. {Ta} đọc tay {cuaAi}, nhớ là đường chỉ đổi theo cách mình sống. ${C}`,
      `{Ta} thấy các đường chỉ {cuaAi} rồi. Đường chỉ đổi theo cách mình sống, mình đọc từ từ nhé. ${C}`,
    ],
    close: [
      `Tay {ta} đọc đến đây. Đường chỉ đổi theo cách mình sống, sáu tháng đến một năm xem lại cũng được. ${C}`,
      `{Ta} đọc xong rồi. Giữ điều hay, sửa điều chưa hợp, tay cũng đổi theo. Sáu tháng đến một năm sau mình xem lại. ${C}`,
      `Đọc đến đây thôi. Tay là của mình, đường chỉ đổi theo cách mình sống, sáu tháng đến một năm sau xem lại cũng hay. ${C}`,
    ],
    cells: ['Trước hết {ta} tóm lại mấy ý chính.', 'Mình nghe phần tóm tắt đã.'],
    sections: ['Giờ {ta} đọc kỹ từng phần.', '{Ta} đọc tiếp từng phần trên tay.'],
  },
};

/** Lời dẫn tô sáng trên lá số. */
export const LEADS = {
  tuviMenh: ['{goi} xem ở đây, cung Mệnh ở {cung}{sao}.', 'Đây là cung Mệnh, nằm ở {cung}{sao}.'],
  battuNhatChu: ['{goi} xem trụ ngày, Nhật Chủ là {nhatChu}.', 'Chữ chính là Nhật Chủ {nhatChu}, nằm ở trụ ngày.'],
  luchaoThe: ['{goi} xem hào {hao}, đó là hào Thế.', 'Hào Thế nằm ở hào {hao}.'],
  battrachHuong: ['{goi} xem hướng {huong}, sao {sao}, là hướng tốt nhất.', 'Hướng hợp nhất là {huong}, ứng với sao {sao}.'],
  labanHuong: ['Hướng {huong} {ta} tô sáng trên vòng la bàn đây.', '{goi} nhìn trên vòng la bàn, hướng {huong} đang sáng lên.'],
  nguhanhDacLenh: ['{goi} xem trụ tháng, chi {chi} thuộc mùa {tiet}. Nhật Chủ {nhatChu} sinh đúng mùa mình, gọi là đắc lệnh, thế {the}.', 'Chi tháng là {chi}, mùa {tiet}. Nhật Chủ {nhatChu} được mùa nâng đỡ, đắc lệnh, đang ở thế {the}.'],
  nguhanhThatLenh: ['{goi} xem trụ tháng, chi {chi} thuộc mùa {tiet}. Nhật Chủ {nhatChu} không hợp mùa này, gọi là thất lệnh, thế {the}.', 'Chi tháng là {chi}, mùa {tiet}. Mùa này không nâng đỡ Nhật Chủ {nhatChu}, thất lệnh, đang ở thế {the}.'],
  nguhanhTamHop: ['Trong các chi có tam hợp cục {hanh}, làm hành {hanh} mạnh thêm.', 'Các chi trên lá số kết thành tam hợp cục {hanh}, hành {hanh} nhờ vậy mạnh lên.'],
  nguhanhBanHop: ['Có hai chi bán hợp hướng {hanh}, hành {hanh} được thêm một phần lực.', 'Hai chi trên lá số bán hợp về hướng {hanh}, nên hành {hanh} nhỉnh thêm.'],
  nguhanhLucHop: ['Có hai chi lục hợp hướng {hanh}, kéo thêm chút lực cho hành {hanh}.', 'Hai chi kề nhau lục hợp về {hanh}, hành {hanh} nhờ đó được thêm chút lực.'],
  nguhanhLucXung: ['Có hai chi xung nhau, lực của chúng giảm bớt.', 'Trong các chi có một cặp xung nhau, nên sức của hai chi đó yếu đi.'],
  nguhanhPhuUc: ['{Ta} chọn Dụng thần theo cách bù chỗ yếu, tiết chỗ mạnh. Hành cần bổ sung là {dung}, hỗ trợ là {hy}, nên tiết chế {ky}.', 'Theo cách cân bằng mạnh yếu, hành cần bổ sung là {dung}; {hy} hỗ trợ; {ky} nên tiết chế.'],
  nguhanhDieuHau: ['Lá số lệch về nóng lạnh nên {ta} lo điều hậu trước. Hành cần bổ sung là {dung}, hỗ trợ là {hy}, nên tiết chế {ky}.', 'Mùa sinh làm lá số quá {khi}, nên cần điều hậu trước. Hành cần bổ sung là {dung}; nên tiết chế {ky}.'],
  nguhanhTrungHoa: ['Nhật Chủ khá cân bằng nên {ta} không cần can thiệp mạnh. Chỉ bù hành yếu nhất là {dung}, bớt hành dư nhất là {ky}.', 'Lá số gần cân bằng. Hành yếu nhất là {dung}, mình bù thêm; hành dư là {ky}, mình bớt lại.'],
  nguhanhThuanThe: ['Với cách cục này, {ta} chọn theo thế chung của lá số. Hành nên thuận theo là {dung}, hỗ trợ là {hy}; {ky} đi ngược thế nên tránh.', 'Lá số theo thế của {cach}. Hành nên thuận theo là {dung}; {hy} hỗ trợ; nên tránh {ky}.'],
  nguhanhThongQuan: ['Hai hành {a} và {b} đang khắc nhau khá mạnh. {Ta} lấy {cau} làm cầu nối cho dịu.', 'Giữa {a} và {b} có chỗ căng, hành {cau} đứng giữa làm cầu nối là hợp.'],
  nguhanhChanTong: ['Lá số này thành {cach} khá rõ, độ tin cậy {tincay}. Các điều kiện đều đạt.', '{Ta} thấy {cach} thành cách rõ ràng, độ tin cậy {tincay}.'],
  nguhanhGiaTong: ['Lá số có dấu hiệu {cach} nhưng chưa trọn, độ tin cậy {tincay}. Nên xem cả hai cách luận.', 'Về cách cục đặc biệt, {ta} thấy {cach} nhưng chưa trọn, độ tin cậy {tincay}.'],
  nguhanhKhongThanh: ['Lá số có dấu hiệu {cach} nhưng chưa đạt điều kiện, nên {ta} luận theo cách thông thường.', 'Dấu hiệu {cach} chưa đủ để thành cách, nên mình luận theo cách thông thường.'],
  nguhanhHoiDaiVan: ['Để biết cách luận nào hợp hơn, {ta} xin hỏi {goi} về một giai đoạn mười năm đã qua.', '{goi} nhớ lại giúp {ta} một giai đoạn mười năm đã qua nhé. Không nhớ thì cứ bỏ qua.'],
  nguhanhHoiNam: ['Để biết cách luận nào hợp hơn, {ta} xin hỏi {goi} về một năm đã qua.', '{goi} nhớ lại giúp {ta} một năm đã qua nhé. Không nhớ thì cứ bỏ qua.'],
  nguhanhKetLuan: ['Các giai đoạn {goi} kể khớp hơn với một cách luận. {Ta} lấy cách đó làm chính, nhưng đây chỉ là so hai cách tính.', 'Nghe {goi} kể, {ta} thấy một cách luận khớp hơn. Mình lấy cách đó làm chính, tạm vậy thôi.'],
  nguhanhChuaDu: ['Mới có ít giai đoạn để so, {ta} chưa nói được gì. {goi} nhớ thêm được thì hay.', 'Chưa đủ giai đoạn để {ta} kết luận. Khi nào nhớ thêm, mình xem tiếp.'],
  nguhanhHaiCach: ['Với lá số này có hai cách luận. {Ta} nghiêng nhiều hơn về {cachchinh}, nhưng cách còn lại cũng đáng xem.', 'Có hai cách luận cho lá số này, hiện {ta} nghiêng về {cachchinh}.'],
  nguhanhCamOn: ['Cảm ơn {goi}, {ta} ghi lại rồi.', '{Ta} ghi nhận rồi, cảm ơn {goi}.'],
  nguhanhChuaVung: ['Một lưu ý: nếu đổi cách đặt hệ số thì hành cần bổ sung có thể khác, nên {goi} xem đây là gợi ý để tham khảo thôi.', 'Lưu ý nhỏ: đổi cách đặt hệ số thì hành cần bổ sung có thể lệch đi, nên {goi} cứ coi là gợi ý để tham khảo.'],
  nguhanhChuaChac: ['Chưa đủ để {ta} nói chắc cách luận nào hợp hơn. {goi} cứ xem cả hai như hai góc nhìn.', '{Ta} chưa dám nói chắc cách nào hợp hơn. Cứ xem cả hai cách luận như hai góc nhìn.'],
  chitayTongQuan: ['Trước hết {ta} nói về hình dáng chung của bàn tay {cuaAi}.', 'Mình nhìn tổng quan bàn tay trước, từ hình dáng đến độ dày.'],
  chitayNgon: ['Giờ {ta} xem các ngón tay: độ dài và hình dáng từng ngón.', 'Sang phần ngón tay, {ta} xem từng ngón một.'],
  chitayBaDuong: ['Bây giờ tới các đường chính trên lòng bàn tay.', '{Ta} xem các đường chính nhé, từng đường một.'],
  chitayDuongPhu: ['Ngoài ra còn mấy đường phụ, {ta} nói ngắn thôi.', 'Các đường phụ chỉ là điểm thêm, {goi} nghe để tham khảo.'],
  chitayGoDau: ['Giờ {ta} xem các gò trên lòng bàn tay và những dấu nhỏ, nếu có.', 'Phần cuối là gò và dấu hiệu. Dấu nhỏ nào cũng chỉ là gợi ý.'],
  chitayDuong: ['{goi} xem {duong}, {ta} tô sáng trên tay đây.', 'Đây là {duong}.'],
} as const;

export const NO_SPEECH_LINE = '(Phần này {goi} xem chữ trên màn hình)';

/** Lời đạo đồng. Đạo đồng xưng "con", gọi người vào là "khách". */
export const DONG_LINES = {
  gate: ['Con chào khách. Mời khách vào.', 'Khách đến rồi ạ. Mời khách đi lối này.', 'Con mở cổng rồi, mời khách vào ạ.'],
  corridor: ['{Ta} đang đợi trong tĩnh thất, mời khách.', 'Qua hành lang này là tới chỗ {ta} ạ.', 'Mời khách vào, {ta} ở trong ạ.'],
  intro: ['Con chào khách. {Ta} nhờ con hỏi vài điều để lập hồ sơ. Mọi thứ chỉ lưu trên máy này ạ.'],
  name: ['Dạ, con xin hỏi họ tên hoặc biệt danh ạ?'],
  gender: ['Dạ, hồ sơ này là của nam hay nữ ạ?'],
  date: ['Dạ, ngày tháng năm sinh là khi nào ạ?'],
  hour: ['Dạ, sinh vào giờ nào ạ? Không nhớ rõ thì chọn giờ gần nhất.'],
} as const;

/** Lời chào ở Tĩnh thất khi chưa đọc gì. */
export const STUDY_LINES = {
  self: [
    '{Ta} chào {goi}. Mời {goi} chọn một món trên án thư, hoặc bấm "{Ta} đọc" để nghe phần tổng hợp.',
    '{goi} đến rồi đấy à. Muốn xem gì thì chạm vào món đó, hoặc bấm "{Ta} đọc".',
  ],
  other: [
    '{Ta} chào {goi}. Hồ sơ của {ten} đây. Chọn một món trên án thư, hoặc bấm "{Ta} đọc".',
    'Mình đang xem hồ sơ của {ten}. Chạm vào món muốn xem, hoặc bấm "{Ta} đọc".',
  ],
} as const;

export const pick = <T,>(list: readonly T[], seed: number): T => list[Math.abs(seed) % list.length];

/** Thay biến. Viết hoa chữ đầu câu vì {goi} có thể đứng đầu câu ("Con xem…"). */
export function fill(t: string, vars: Record<string, string | number>): string {
  // {ta}: tiếng người đọc tự xưng (thầy, cô, bà…), {Ta} viết hoa; không truyền thì là "thầy"
  const ta = String(vars.ta ?? 'thầy'), all: Record<string, string | number> = { ...vars, ta, Ta: ta.charAt(0).toLocaleUpperCase('vi') + ta.slice(1) };
  return t.replace(/\{(\w+)\}/g, (_, k: string) => String(all[k] ?? '')).replace(/(^|[.!?]\s+)(\p{Ll})/gu, (_, a: string, b: string) => a + b.toUpperCase());
}

/** Mọi mẫu câu, để test quét. */
export function allLines(): string[] {
  return [...Object.values(TOOL_LINES).flatMap((t) => [...t.open, ...t.close, ...t.cells, ...t.sections]), ...Object.values(LEADS).flat(), NO_SPEECH_LINE, ...Object.values(DONG_LINES).flat(), ...Object.values(STUDY_LINES).flat()];
}
