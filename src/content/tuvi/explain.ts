/* "Giải thích chỉ số" và "Phạm vi công cụ" của tab Tử Vi — NGUYÊN VĂN legacy (renderExplain, renderNotes). */
import { TuViEngine, cungNameFor, type TuViChart } from '../../core';
import { p, type Section } from '../rich';

const { CHI } = TuViEngine;

export function tuViExplain(ch: TuViChart): Section[] {
  const tuHoaMeaning = {
    loc: 'tài lộc, sự thuận lợi, dòng tiền vào — sao được Hoá Lộc thường mang lại may mắn về vật chất, cơ hội.',
    quyen: 'quyền lực, khả năng chi phối, tham vọng — sao được Hoá Quyền cho sức mạnh hành động, dễ nắm vai trò dẫn dắt.',
    khoa: 'danh tiếng, học vấn, quý nhân — sao được Hoá Khoa cho tiếng tăm tốt, dễ được giúp đỡ, thi cử thuận lợi.',
    ky: 'trắc trở, vướng mắc, điều cần lưu tâm — sao được Hoá Kỵ không hẳn là xấu tuyệt đối mà là điểm cần chú ý, dễ sinh do dự/thị phi ở lĩnh vực sao đó cai quản.',
  };
  const thanTrungMenh = ch.thanChi === ch.menhChi;
  const menhStars = ch.stars[ch.menhChi] || [];
  return [
    {
      id: 'tuvi.explain.cuc', title: '1. Cục — ' + ch.cucTen + ' (' + ch.napAmTen + '), hành ' + ch.cucHanh,
      blocks: [p('tuvi.explain.cuc.0', 'Cục được tính từ Can Chi của <b>Cung Mệnh</b> (phụ thuộc tháng và giờ sinh), dùng để xác định vị trí an sao Tử Vi trên vòng 12 cung (qua phép "mượn ngày sinh âm lịch chia cho số Cục") và làm mốc tuổi bắt đầu Đại Hạn đầu tiên (Cục số mấy thì Đại Hạn đầu bắt đầu từ tuổi đó). <b>Lưu ý quan trọng:</b> hành "' + ch.cucHanh + '" ở đây là Ngũ hành Nạp Âm tính theo Can Chi của <i>Cung Mệnh</i> — khác với Nạp Âm tính theo <i>năm sinh</i> ở tab "🌙 Nạp Âm", và cũng khác Ngũ hành <i>Nhật Chủ</i> dùng trong tab "📜 Bát Tự". Ba khái niệm nghe tương tự nhưng là ba hệ thống tính toán độc lập, dựa trên ba mốc dữ liệu khác nhau (Cung Mệnh / năm sinh / ngày sinh) — không nên gộp chung làm một.')],
    },
    {
      id: 'tuvi.explain.menh', title: '2. Cung Mệnh (' + CHI[ch.menhChi] + ') và Cung Thân (' + CHI[ch.thanChi] + ')',
      blocks: [p('tuvi.explain.menh.0', 'Cung Mệnh thể hiện bản chất, tính cách cốt lõi, cách nhìn nhận cuộc đời — được xem là "gốc" của lá số. Cung Thân thể hiện hoàn cảnh sống, môi trường vận động, thường bộc lộ rõ hơn từ tuổi trung niên trở đi. ' + (thanTrungMenh
        ? 'Ở lá số này, Thân <b>trùng</b> với Mệnh (cùng an tại cung ' + CHI[ch.menhChi] + ') — bản chất và hoàn cảnh sống có xu hướng thống nhất, ít giằng co giữa "muốn" và "phải".'
        : 'Ở lá số này, Thân an tại cung khác với Mệnh — nên xem thêm ý nghĩa của cung Thân (cung ' + cungNameFor(ch.menhChi, ch.thanChi) + ') để hiểu hoàn cảnh sống có thể khác với bản chất gốc thế nào.'), { palace: ch.menhChi })],
    },
    {
      id: 'tuvi.explain.chinhtinh', title: '3. Chính tinh tại Mệnh và cung "Vô Chính Diệu"',
      blocks: [p('tuvi.explain.chinhtinh.0', 'Mỗi cung có thể có 0, 1 hoặc nhiều Chính Tinh (trong 14 sao chính) toạ thủ. ' + (menhStars.length
        ? 'Cung Mệnh của bạn có Chính Tinh: <b>' + menhStars.join(', ') + '</b> — đây là (các) sao chủ đạo định hình tính cách, năng lực nổi bật.'
        : 'Cung Mệnh của bạn <b>không có Chính Tinh</b> nào toạ thủ (gọi là "Vô Chính Diệu") — trường hợp này KHÔNG có nghĩa là xấu, mà cần xem thêm sao ở cung đối diện (cung xung chiếu, cách 6 cung) để luận tính cách; người Vô Chính Diệu thường có tính cách linh hoạt, ít bị đóng khung theo một mẫu hình cố định, dễ chịu ảnh hưởng từ hoàn cảnh và môi trường xung quanh.'), { palace: ch.menhChi })],
    },
    {
      id: 'tuvi.explain.tuhoa', title: '4. Tứ Hoá bản mệnh',
      blocks: [p('tuvi.explain.tuhoa.0', 'Tứ Hoá (Lộc – Quyền – Khoa – Kỵ) là 4 phép biến hoá gán vào 4 sao cụ thể tuỳ theo Can của năm sinh, làm tăng thêm một lớp ý nghĩa cho sao đó:'
        + '<ul>'
        + '<li><b>Hoá Lộc → ' + ch.tuHoaBanMenh.loc + ':</b> ' + tuHoaMeaning.loc + '</li>'
        + '<li><b>Hoá Quyền → ' + ch.tuHoaBanMenh.quyen + ':</b> ' + tuHoaMeaning.quyen + '</li>'
        + '<li><b>Hoá Khoa → ' + ch.tuHoaBanMenh.khoa + ':</b> ' + tuHoaMeaning.khoa + '</li>'
        + '<li><b>Hoá Kỵ → ' + ch.tuHoaBanMenh.ky + ':</b> ' + tuHoaMeaning.ky + '</li>'
        + '</ul>'
        + 'Sao nào trong 4 sao trên rơi ngay tại cung Mệnh hoặc cung Thân thường được xem là ảnh hưởng rõ rệt nhất.')],
    },
    {
      id: 'tuvi.explain.daihan', title: '5. Đại Hạn — vận trình 10 năm',
      blocks: [p('tuvi.explain.daihan.0', 'Đại Hạn chia đời người thành các chặng 10 năm, mỗi chặng "đi qua" một cung trong 12 cung, bắt đầu từ chính cung Mệnh ở tuổi bằng số Cục (ở đây là ' + ch.cucSo + ' tuổi). Chiều đi (thuận hay nghịch theo chiều kim đồng hồ của 12 cung) phụ thuộc Âm Dương của Can năm sinh kết hợp giới tính: ' + (ch.thuanDaiHan ? 'lá số này đi <b>THUẬN</b> (Dương Nam hoặc Âm Nữ).' : 'lá số này đi <b>NGHỊCH</b> (Âm Nam hoặc Dương Nữ).') + ' Khi Đại Hạn "đi qua" một cung, các đặc điểm và sao của cung đó tạm thời trở thành trọng tâm vận trình trong suốt 10 năm ấy — không phải cung Mệnh gốc bị thay đổi, mà là "ống kính" xem xét được dịch chuyển sang cung khác.')],
    },
    {
      id: 'tuvi.explain.vong', title: '6. Vòng Trường Sinh và vòng Thái Tuế',
      blocks: [p('tuvi.explain.vong.0', 'Vòng Trường Sinh gồm 12 trạng thái (Trường Sinh → Mộc Dục → ... → Tuyệt → Thai → Dưỡng) ví von một cung đang ở giai đoạn nào trong "vòng đời" sinh trưởng — Trường Sinh/Đế Vượng là giai đoạn sung mãn, Tử/Tuyệt là giai đoạn suy yếu cần thận trọng hơn. Vòng Thái Tuế (Thái Tuế, Tang Môn, Bạch Hổ, Phúc Đức...) dùng để tra cứu vận hạn theo TỪNG NĂM (xem ở mục "Tra vận hạn theo năm" bên trên) — mỗi năm dương lịch ứng với một vị trí trong vòng 12 sao này.')],
    },
  ];
}

/** Ghi chú "Phạm vi công cụ" cuối tab (legacy renderNotes). */
export function tuViNotes(): Section {
  return {
    id: 'tuvi.notes', title: '',
    blocks: [
      p('tuvi.notes.0', '<b>Phạm vi công cụ:</b> tính đầy đủ 14 Chính Tinh, vòng Trường Sinh, vòng Thái Tuế, Lộc Tồn – Kình Dương – Đà La, Thiên Mã, Thiên Khôi – Thiên Việt, Tả Phù – Hữu Bật, Văn Xương – Văn Khúc, Địa Không – Địa Kiếp, Tứ Hoá bản mệnh, Đại Hạn và Tiểu Hạn, dựa trên các công thức truyền thống đã được đối chiếu nhiều nguồn. Một số sao phụ có nhiều trường phái an sao khác nhau (Hoả Tinh, Linh Tinh, Thai Phụ, Phong Cáo, Đào Hoa…) được cố tình lược bỏ để tránh trình bày dữ liệu còn tranh cãi như một sự thật chắc chắn — riêng Thiên Khôi/Thiên Việt của tuổi Canh, Tân cũng có 2 trường phái, công cụ dùng trường phái phổ biến hơn.'),
      p('tuvi.notes.1', '<b>Lịch âm:</b> từ năm 1968 tính theo múi giờ Việt Nam (UTC+7); ngày sinh trước 1968 tính theo UTC+8 như lịch Việt Nam thời đó (theo cách tính của Hồ Ngọc Đức) — nên một số ngày đầu tháng âm/Tết trước 1968 có thể lệch 1 ngày so với lịch tính theo UTC+7. Người sinh 23:00–23:59 có thể tick ô "giờ Tý muộn" để tính sang ngày hôm sau (tuỳ trường phái).'),
      p('tuvi.notes.2', 'Đây là công cụ tính toán theo hệ thống lý số cổ truyền — mang tính văn hoá, tham khảo và rèn tư duy hệ thống, không phải khoa học thực nghiệm; không nên dùng để thay thế các quyết định thực tế quan trọng.'),
    ],
  };
}
