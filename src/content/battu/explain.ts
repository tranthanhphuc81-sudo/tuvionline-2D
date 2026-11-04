/* Bát Tự: "Giải thích chỉ số", "Vượng Suy và Dụng Thần sơ bộ", lưu ý Lập Xuân/Tết, tuổi khởi vận, ghi chú —
   NGUYÊN VĂN legacy (renderExplain, renderVuongSuy, noteBanner, renderDaiVan, renderNotes của tab Bát Tự). */
import { BatTuEngine, assessThan, dungThanPattern, muaOf, type BatTuChart } from '../../core';
import { p, parseRich, type Section } from '../rich';

const { CAN, CHI } = BatTuEngine;

export function batTuExplain(ch: BatTuChart): Section[] {
  const a = assessThan(ch);
  return [
    {
      id: 'battu.explain.tutru', title: '1. Tứ Trụ và Nhật Chủ',
      blocks: [p('battu.explain.tutru.0', 'Bát Tự gồm 4 Trụ (Năm – Tháng – Ngày – Giờ), mỗi Trụ có 1 Can và 1 Chi. Trong đó, Can của <b>Trụ Ngày</b> — ở đây là <b>' + CAN[ch.nhatChu] + '</b>, hành <b>' + a.nhatChuHanh + '</b> — được gọi là <b>Nhật Chủ</b>, đại diện cho chính bản thân người xem. Toàn bộ việc luận Bát Tự đều xoay quanh việc đánh giá Nhật Chủ đang mạnh hay yếu so với "bối cảnh" 3 Trụ còn lại, để từ đó tìm Dụng Thần cân bằng. Đây là điểm khác với lối luận Bát Tự cổ (trước đời Tống) vốn lấy Nạp Âm Trụ Năm làm trung tâm — xem thêm ở Phụ lục Nạp Âm.', { pillar: 2 })],
    },
    {
      id: 'battu.explain.tangcan', title: '2. Tàng Can — Can ẩn trong Chi',
      blocks: [p('battu.explain.tangcan.0', 'Mỗi Chi (Tý, Sửu, Dần...) không chỉ mang 1 hành mà còn "chứa" bên trong 1–3 Can ẩn khác, gọi là Tàng Can, chia làm Bản khí (mạnh nhất), Trung khí, Dư khí. Đây là lý do một lá số Bát Tự đầy đủ thường phải xét cả 4 Can lộ (nổi trên bề mặt) lẫn các Can tàng — vì Can ẩn trong Chi vẫn có ảnh hưởng, chỉ là kín đáo hơn Can lộ.')],
    },
    {
      id: 'battu.explain.thapthan', title: '3. Thập Thần — 10 vai trò trong đời sống',
      blocks: [p('battu.explain.thapthan.0', 'Thập Thần là tên gọi cho quan hệ Sinh/Khắc giữa Nhật Chủ và một Can khác, chia làm 5 cặp (giống/khác Âm Dương) ứng với 10 vai trò:'
        + '<ul>'
        + '<li><b>Tỷ Kiên / Kiếp Tài</b> (đồng hành với Nhật Chủ): bản thân, anh chị em, sự cạnh tranh, tính tự chủ.</li>'
        + '<li><b>Thực Thần / Thương Quan</b> (Nhật Chủ sinh ra): con cái (với nữ), tài năng thể hiện, sáng tạo, ăn nói.</li>'
        + '<li><b>Thiên Tài / Chính Tài</b> (Nhật Chủ khắc): tiền bạc, vợ (với nam), khả năng quản lý tài sản.</li>'
        + '<li><b>Thất Sát / Chính Quan</b> (khắc lại Nhật Chủ): công danh, chồng (với nữ), kỷ luật, áp lực bên ngoài.</li>'
        + '<li><b>Thiên Ấn / Chính Ấn</b> (sinh ra Nhật Chủ): học vấn, mẹ, quý nhân, sự bảo trợ.</li>'
        + '</ul>'
        + 'Thập Thần nào xuất hiện nhiều và mạnh trong lá số thường phản ánh xu hướng nổi bật của người đó trong đời sống.')],
    },
    {
      id: 'battu.explain.vuongsuy', title: '4. Vượng Suy và Đắc Lệnh',
      blocks: [p('battu.explain.vuongsuy.0', '"Vượng Suy" trả lời câu hỏi: Nhật Chủ (bản thân) đang mạnh hay yếu? Yếu tố quan trọng nhất là <b>mùa sinh</b> (Chi Tháng) — mỗi hành đều có mùa "vượng" riêng (Mộc vượng mùa Xuân, Hoả vượng mùa Hạ, Kim vượng mùa Thu, Thuỷ vượng mùa Đông, Thổ vượng cuối mỗi mùa). Nhật Chủ sinh đúng mùa vượng/tướng của hành mình gọi là <b>"Đắc Lệnh"</b> — một lợi thế lớn. Ở lá số này: Nhật Chủ hành ' + a.nhatChuHanh + ', sinh Chi tháng ' + CHI[ch.monthChiIdx] + ', trạng thái theo mùa là <b>' + a.trangThai + '</b> → ' + (a.dacLenh ? 'CÓ Đắc Lệnh.' : 'KHÔNG Đắc Lệnh.') + ' Công cụ này cộng thêm yếu tố phụ là đếm 3 Can lộ (Năm/Tháng/Giờ) thuộc nhóm "giúp Thân" (Tỷ Kiếp, Ấn) hay "hao Thân" (Thực Thương, Tài, Quan Sát) để đưa ra kết luận sơ bộ — ở đây là ' + a.giup + ' giúp / ' + a.hao + ' hao.', { pillar: 1 })],
    },
    {
      id: 'battu.explain.dungthan', title: '5. Dụng Thần — hành cần bổ sung để cân bằng',
      blocks: [p('battu.explain.dungthan.0', 'Nguyên tắc nền tảng nhất: nếu Thân đang <b>quá vượng</b>, Dụng Thần nên chọn trong nhóm "hao Thân" (Thực Thương, Tài, Quan Sát) để tiết chế bớt; nếu Thân đang <b>quá nhược</b>, Dụng Thần nên chọn trong nhóm "giúp Thân" (Ấn, Tỷ Kiếp) để bồi bổ thêm. Đây chỉ là nguyên tắc cơ bản nhất (Chương 7, Phần 2) — thực tế còn nhiều trường hợp đặc biệt (Tòng Vượng, Tòng Nhược, cần Điều Hậu do sinh mùa quá lạnh/quá nóng, cần Thông Quan khi 2 hành xung khắc trực diện...) đòi hỏi phân tích sâu hơn, ngoài phạm vi công cụ này.')],
    },
    {
      id: 'battu.explain.daivan', title: '6. Đại Vận — vận trình 10 năm theo tiết khí',
      blocks: [p('battu.explain.daivan.0', 'Đại Vận là các chặng 10 năm nối tiếp nhau từ Trụ Tháng, đi thuận hay nghịch tuỳ Âm Dương Can năm kết hợp giới tính (' + (ch.thuanDaiVan ? 'lá số này đi <b>THUẬN</b>.' : 'lá số này đi <b>NGHỊCH</b>.') + '). Tuổi bắt đầu vận đầu tiên ("khởi vận") được tính chính xác theo số ngày từ lúc sinh đến tiết khí liền kề (quy đổi theo tỷ lệ 3 ngày = 1 tuổi) — đây là điểm nhiều công cụ đơn giản hay làm tròn/bỏ qua, nhưng công cụ này tính bằng thiên văn thực tế.')],
    },
  ];
}

/** Hộp "Đánh giá Vượng Suy" (legacy #bt-vsBox). */
export function batTuVuongSuy(ch: BatTuChart): Section {
  const a = assessThan(ch);
  return {
    id: 'battu.vuongsuy', title: 'Đánh giá Vượng Suy', tone: a.thanVuong ? 'ok' : 'warn',
    blocks: [
      {
        id: 'battu.vuongsuy.rows', kind: 'kv', ref: { pillar: 1 }, rows: [
          { k: 'Mùa sinh (Chi tháng ' + CHI[ch.monthChiIdx] + ')', v: muaOf(ch.monthChiIdx) },
          { k: 'Trạng thái Nhật Chủ (' + a.nhatChuHanh + ')', v: a.trangThai },
          { k: 'Đắc lệnh?', v: a.dacLenh ? 'CÓ' : 'KHÔNG' },
          { k: '3 Can lộ: nhóm giúp / hao', v: a.giup + ' / ' + a.hao },
        ],
      },
      { id: 'battu.vuongsuy.verdict', kind: 'verdict', tone: a.thanVuong ? 'ok' : 'warn', rich: parseRich('Kết luận sơ bộ: Nhật Chủ <b>' + (a.thanVuong ? 'THIÊN VƯỢNG' : 'THIÊN NHƯỢC') + '</b> — chỉ dựa trên Đắc Lệnh và 3 Can lộ (Thiên Can), <b>chưa xét Đắc Địa/Đắc Thế đầy đủ trên Tàng Can</b>.') },
    ],
  };
}

/** Hộp "Gợi ý Dụng Thần" (legacy #bt-dtBox). */
export function batTuDungThan(ch: BatTuChart): Section {
  const dt = dungThanPattern(ch, assessThan(ch));
  const text = dt.kind === 'sat-an'
    ? 'Phát hiện mẫu hình <b>"Sát Quan hỗn tạp"</b> (' + dt.soQuanSat + ' vị Thất Sát/Chính Quan lộ ra) kèm theo một Ấn — đúng mẫu <b>"Sát trọng dụng Ấn"</b>: Ấn đứng giữa hoá Sát sinh Thân. Dụng Thần sơ bộ nghiêng về nhóm <b>ẤN</b> (và Tỷ Kiếp hỗ trợ thêm).'
    : dt.kind === 'vuong'
      ? 'Thân đang thiên vượng → theo nguyên tắc Vượng Suy cơ bản, Dụng Thần nên chọn trong nhóm <b>hao Thân</b>: Thực Thương, Tài, hoặc Quan Sát — tuỳ hành nào lá số cần thêm để cân bằng.'
      : 'Thân đang thiên nhược → theo nguyên tắc Vượng Suy cơ bản, Dụng Thần nên chọn trong nhóm <b>giúp Thân</b>: Ấn hoặc Tỷ Kiếp.';
  return {
    id: 'battu.dungthan', title: 'Gợi ý Dụng Thần',
    blocks: [
      p('battu.dungthan.0', text),
      { id: 'battu.dungthan.note', kind: 'note', rich: parseRich('Đây chỉ là gợi ý theo nguyên tắc nền tảng nhất (Chương 7), chưa xét Điều Hậu, Thông Quan hay các Cách Cục đặc biệt.') },
    ],
  };
}

/** Lưu ý khi Trụ Năm (theo Lập Xuân) khác năm âm lịch (theo Tết). Null nếu trùng. */
export function batTuLapXuanNote(ch: BatTuChart): string | null {
  if (ch.tietYear === ch.lunar[2]) return null;
  return '<b>Lưu ý:</b> ngày sinh này rơi vào giai đoạn giao giữa tiết Lập Xuân và Tết Nguyên Đán, nên Trụ Năm Bát Tự ('
    + CAN[ch.yearCC.can] + ' ' + CHI[ch.yearCC.chi] + ') KHÁC với năm ghi trên lịch Âm (' + ch.lunar[2] + ') — xem Chương 1–2 tài liệu Phần 2 để hiểu vì sao.';
}

export function batTuKhoiVanNote(ch: BatTuChart): string {
  return 'Tuổi khởi vận: khoảng ' + ch.khoiVanYears + ' tuổi' + (ch.khoiVanMonths ? ' ' + ch.khoiVanMonths + ' tháng' : '') + ' (' + (ch.thuanDaiVan ? 'đếm tới tiết kế tiếp' : 'đếm lùi về tiết liền trước') + ', chia theo quy tắc 3 ngày = 1 tuổi).';
}

export function batTuNotes(): Section {
  return {
    id: 'battu.notes', title: '',
    blocks: [p('battu.notes.0', '<b>Phạm vi công cụ:</b> tính đầy đủ 4 Trụ (theo đúng mốc tiết Lập Xuân cho Trụ Năm, 12 Tiết khí thực tính bằng thiên văn cho Trụ Tháng — không dùng bảng ngày xấp xỉ), Tàng Can 3 lớp, Thập Thần cho toàn bộ Can lộ và Can tàng, đánh giá Vượng Suy theo Đắc Lệnh, gợi ý Dụng Thần theo nguyên tắc Vượng Suy cơ bản, và Đại Vận với tuổi khởi vận tính chính xác theo tiết khí. '
      + 'Công cụ <b>chưa xét</b>: Đắc Địa/Đắc Thế đầy đủ trên Tàng Can, Hình–Xung–Hội–Hợp giữa các Chi, Thần Sát, Điều Hậu/Thông Quan dụng thần, và các Cách Cục đặc biệt (Tòng Vượng, Tòng Nhược...) — đúng như phạm vi đã nêu trong tài liệu Phần 2. Đây là công cụ tính toán theo hệ lý số cổ truyền, mang tính văn hoá và tham khảo, không phải khoa học thực nghiệm.')],
  };
}
