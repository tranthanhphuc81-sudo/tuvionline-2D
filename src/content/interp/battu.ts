/* Bảng câu chữ Bát Tự — CHÉP NGUYÊN VĂN từ legacy (docs/legacy/lyso-toolkit.html, module LySoInterp).
   Sinh bằng script cắt thẳng từ file legacy; chỉ đổi `var` thành `export const` và thêm kiểu. Đừng sửa câu chữ ở đây
   (test đối chiếu tests/parity/* sẽ báo). */
import type { ThapThanFamily } from '../../core';

export const FAMILY: Record<ThapThanFamily, { gods: string[]; net: string; nghe: string; luuY: string; viDu: string; thieu: string }> = {
  'Tỷ Kiếp': { gods:['Tỷ Kiên','Kiếp Tài'], net:'tự lập, có chính kiến, coi trọng bạn bè và sự công bằng',
    nghe:'tự kinh doanh, làm việc độc lập, thể thao, nghề cần cạnh tranh, hợp tác nhóm ngang hàng',
    luuY:'dễ cố chấp, cạnh tranh ngay cả với người thân; tiền bạc dễ hao vì bạn bè',
    viDu:'Bạn thích "tự tay làm lấy" hơn là nhờ người khác; trong nhóm bạn bè, bạn hay là người đứng ra rủ rê, tổ chức.',
    thieu:'ít khi tranh giành, nhưng cũng dễ thiếu người cùng chí hướng — nên chủ động xây dựng mạng lưới bạn bè, đồng nghiệp.' },
  'Thực Thương': { gods:['Thực Thần','Thương Quan'], net:'sáng tạo, thích thể hiện, ăn nói, có tài năng riêng',
    nghe:'sáng tạo nội dung, nghệ thuật, thiết kế, giảng dạy, ẩm thực, tư vấn, marketing, làm sản phẩm',
    luuY:'không thích bị gò bó, dễ nói thẳng làm phật lòng cấp trên',
    viDu:'Bạn làm tốt nhất khi được tự do đưa ra ý tưởng; bị bắt làm theo khuôn mẫu cứng nhắc sẽ nhanh chán.',
    thieu:'ít bộc lộ bản thân — nên rèn kỹ năng trình bày, viết, nói để người khác thấy năng lực của bạn.' },
  'Tài': { gods:['Chính Tài','Thiên Tài'], net:'thực tế, nhạy với tiền bạc và cơ hội, giỏi quản lý nguồn lực',
    nghe:'kinh doanh, buôn bán, tài chính, kế toán, đầu tư, quản lý dự án, bán hàng',
    luuY:'dễ đặt tiền bạc lên trên hết; Thiên Tài nhiều thì thích mạo hiểm, kiếm nhanh tiêu nhanh',
    viDu:'Bạn dễ nhận ra cơ hội kiếm tiền mà người khác bỏ qua — ví dụ thấy ngay món hàng nào đang được ưa chuộng để nhập về bán.',
    thieu:'tiền bạc không phải động lực chính — nên học thêm quản lý tài chính cá nhân để không bị thiệt.' },
  'Quan Sát': { gods:['Chính Quan','Thất Sát'], net:'có kỷ luật, trách nhiệm, coi trọng danh dự và vị trí',
    nghe:'công chức, quản lý, pháp luật, quân đội – công an, tổ chức lớn, vị trí cần sự nghiêm túc',
    luuY:'hay tự tạo áp lực, sợ sai; Thất Sát nhiều thì dễ gặp áp lực, cạnh tranh gay gắt',
    viDu:'Bạn thấy yên tâm khi có quy trình rõ ràng, mục tiêu cụ thể; được giao trách nhiệm là bạn làm đến nơi đến chốn.',
    thieu:'ít chịu gò bó, hợp làm tự do — nhưng cần tự đặt kỷ luật cho mình vì không ai đốc thúc.' },
  'Ấn': { gods:['Chính Ấn','Thiên Ấn'], net:'ham học, suy nghĩ sâu, coi trọng tri thức và đời sống tinh thần',
    nghe:'giáo dục, nghiên cứu, y tế, tâm lý, văn hoá, công nghệ, chuyên gia tư vấn',
    luuY:'dễ ỷ lại, nghĩ nhiều hơn làm; Thiên Ấn nhiều thì hay suy nghĩ khác người, khó gần',
    viDu:'Trước khi làm gì bạn thường muốn tìm hiểu kỹ, đọc thật nhiều — đôi khi tìm hiểu xong thì cơ hội đã qua.',
    thieu:'phải tự học, ít được nâng đỡ — nên chủ động tìm thầy, tìm người hướng dẫn.' }
};

export const GOD_SHORT: Record<string, string> = { 'Tỷ Kiên':'tự tin, độc lập, giữ chính kiến', 'Kiếp Tài':'năng động, thích cạnh tranh, hào phóng với bạn bè',
  'Thực Thần':'hiền hoà, biết hưởng thụ, sáng tạo nhẹ nhàng', 'Thương Quan':'tài hoa, sắc sảo, thích phá cách',
  'Chính Tài':'chăm chỉ, tiết kiệm, kiếm tiền ổn định', 'Thiên Tài':'nhạy cơ hội, hào phóng, thích kinh doanh',
  'Chính Quan':'đứng đắn, trọng nguyên tắc, hợp tổ chức', 'Thất Sát':'quyết đoán, chịu áp lực, dám đương đầu',
  'Chính Ấn':'nhân hậu, ham học, được người lớn giúp', 'Thiên Ấn':'độc đáo, trực giác tốt, thích nghiên cứu sâu' };

export const CAN_TRAITS: Record<string, { hinh: string; net: string; manh: string[]; luuY: string[]; viDu: string }> = {
  'Giáp': { hinh:'cây đại thụ', net:'thẳng thắn, có chí tiến thủ, thích dẫn dắt', manh:['Có chính kiến, dám đứng ra nhận trách nhiệm','Bền bỉ theo đuổi mục tiêu dài hạn'], luuY:['Cứng, khó uốn mình theo người khác','Đôi khi tự tin quá mức'], viDu:'Như cây đại thụ, bạn lớn chậm nhưng chắc; trong công việc bạn hợp con đường thăng tiến từng bậc hơn là "ăn xổi".' },
  'Ất': { hinh:'cây cỏ, dây leo', net:'mềm dẻo, khéo léo, thích nghi giỏi', manh:['Khéo giao tiếp, biết "nương" theo hoàn cảnh','Linh hoạt khi môi trường thay đổi'], luuY:['Dễ phụ thuộc vào người khác','Hay lo, thiếu quyết đoán khi đứng một mình'], viDu:'Như dây leo, bạn phát triển nhanh nhất khi có một "giàn" tốt để bám — một người sếp giỏi, một tổ chức vững, một người bạn đời hiểu mình.' },
  'Bính': { hinh:'mặt trời', net:'nhiệt tình, hào phóng, sôi nổi', manh:['Lan toả năng lượng tích cực','Thẳng thắn, rộng lượng'], luuY:['Nóng vội, thích phô trương','Nhiệt tình nhanh, nguội cũng nhanh'], viDu:'Như mặt trời, bạn đi đến đâu là không khí sôi nổi đến đó — rất hợp làm người khởi động dự án, truyền cảm hứng.' },
  'Đinh': { hinh:'ngọn đèn, ngọn nến', net:'tinh tế, chu đáo, sâu sắc', manh:['Quan sát tinh, suy nghĩ sâu','Tận tuỵ, soi đường cho người khác'], luuY:['Nhạy cảm, dễ tổn thương','Hay suy nghĩ nhiều về một chuyện'], viDu:'Như ngọn đèn, bạn không chói chang nhưng ấm và bền — rất hợp vai trò cố vấn, giảng dạy, nghiên cứu.' },
  'Mậu': { hinh:'núi lớn', net:'vững vàng, đáng tin, bao dung', manh:['Điềm tĩnh trước sóng gió','Giữ chữ tín, được người khác dựa vào'], luuY:['Chậm thay đổi, có lúc cố chấp','Ít thể hiện cảm xúc'], viDu:'Như ngọn núi, mọi người tìm đến bạn khi cần chỗ dựa — nhưng muốn "dời núi" (thuyết phục bạn đổi ý) thì rất khó.' },
  'Kỷ': { hinh:'đất ruộng vườn', net:'chịu khó, thực tế, biết vun đắp', manh:['Kiên nhẫn, chăm chút từng việc nhỏ','Giỏi nuôi dưỡng con người và các mối quan hệ'], luuY:['Hay lo xa','Thiếu quyết đoán, ngại va chạm'], viDu:'Như mảnh vườn, bạn làm ra kết quả nhờ chăm bón đều đặn — hợp những việc cần tích luỹ lâu: giáo dục, chăm sóc khách hàng, nông nghiệp, quản lý.' },
  'Canh': { hinh:'kim loại thô, đao kiếm', net:'quyết đoán, nghĩa khí, thẳng thắn', manh:['Dứt khoát, làm việc hiệu quả','Trọng nghĩa, bảo vệ người mình quý'], luuY:['Cứng rắn, dễ va chạm','Nói thẳng quá mức có thể làm mất lòng'], viDu:'Như thanh kiếm cần được rèn, bạn càng qua thử thách càng sắc bén — môi trường áp lực cao lại giúp bạn trưởng thành nhanh.' },
  'Tân': { hinh:'vàng bạc, trang sức', net:'tinh tế, có gu, coi trọng chất lượng', manh:['Thẩm mỹ tốt, chỉn chu','Trọng danh dự, làm việc kỹ'], luuY:['Dễ tự ái','Quan tâm hình thức, sợ mất mặt'], viDu:'Như món trang sức, bạn toả sáng nhất khi được đặt đúng chỗ — chọn môi trường tôn trọng sự chỉn chu và chất lượng.' },
  'Nhâm': { hinh:'sông lớn, biển cả', net:'thông minh, phóng khoáng, năng động', manh:['Tư duy rộng, nhiều ý tưởng','Thích nghi nhanh, giỏi kết nối'], luuY:['Khó nắm bắt, thiếu kiên trì','Dễ "chảy" theo nhiều hướng một lúc'], viDu:'Như dòng sông, bạn cần "bờ" (kế hoạch, kỷ luật) để năng lượng chảy đúng hướng — không có bờ thì dễ tràn lan.' },
  'Quý': { hinh:'mưa, sương', net:'mềm mại, trực giác tốt, kín đáo', manh:['Nhạy bén, hiểu người','Âm thầm nuôi dưỡng, hỗ trợ người khác'], luuY:['Hay ưu tư','Thiếu tự tin thể hiện bản thân'], viDu:'Như cơn mưa nhỏ thấm đất, ảnh hưởng của bạn không ồn ào nhưng rất sâu — hợp nghề tư vấn, nghiên cứu, chăm sóc, sáng tạo.' }
};
