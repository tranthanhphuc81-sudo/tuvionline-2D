/* Lớp diễn giải thực tế: hành vi > công việc > cách sắp xếp nhịp sống. Chuyển từ ELEMENT_PRACTICAL / TEN_GOD_PRACTICAL của
   docs/ngu-hanh-engine/src/advice.ts. Đã BỎ phần "môi trường" (màu, hướng, chất liệu) vì ARCHITECTURE 14.3: mục ngũ hành không nêu
   màu, hướng, vật phẩm; và bỏ ý đã có ở HANH_INFO / FAMILY của legacy (nghề theo hành, nét của Thập Thần). */
import type { Element, TenGodGroup } from '../../core/nguhanh';

export interface ElementPractical { quality: string; habits: string[]; work: string[]; excessSigns: string; excessFix: string }

export const ELEMENT_PRACTICAL: Record<Element, ElementPractical> = {
  'Mộc': {
    quality: 'tăng trưởng, học hỏi, kế hoạch dài hạn, lòng nhân',
    habits: [
      'Đặt một mục tiêu học tập dài hạn (khoá học, chứng chỉ) và theo dõi tiến độ hằng tuần',
      'Vận động ngoài trời buổi sáng, đi bộ nơi có cây xanh',
      'Viết kế hoạch 3–6 tháng, chia thành mốc nhỏ',
    ],
    work: ['giáo dục, đào tạo', 'xuất bản, nội dung', 'thiết kế, kiến trúc', 'phát triển sản phẩm giai đoạn đầu'],
    excessSigns: 'ôm nhiều việc cùng lúc, dàn trải, cố chấp với ý tưởng của mình',
    excessFix: 'chốt phạm vi trước khi mở việc mới; dùng quy trình và hạn chót (Kim) để cắt tỉa',
  },
  'Hoả': {
    quality: 'thể hiện, truyền cảm hứng, nhiệt huyết, tầm nhìn',
    habits: [
      'Chủ động trình bày ý tưởng: viết bài, thuyết trình, chia sẻ công việc công khai',
      'Duy trì một hoạt động tạo hứng khởi (thể thao đồng đội, sự kiện, cộng đồng)',
      'Ra ngoài nắng sáng, giữ nơi làm việc đủ sáng',
    ],
    work: ['truyền thông, marketing', 'đào tạo kỹ năng mềm', 'giải trí, sự kiện', 'vai trò đại diện, đối ngoại'],
    excessSigns: 'nóng vội, quyết định theo cảm xúc, hứng nhanh bỏ nhanh',
    excessFix: 'quy tắc "ngủ một đêm trước quyết định lớn"; ghi chép, đo lường kết quả (Thổ) để giữ nhịp',
  },
  'Thổ': {
    quality: 'ổn định, tin cậy, tích luỹ, trung gian kết nối',
    habits: [
      'Giữ nếp sinh hoạt cố định: giờ ngủ, giờ làm, ngân sách tháng',
      'Tích luỹ đều đặn thay vì làm theo đợt',
      'Giữ không gian sống gọn gàng, ấm áp',
    ],
    work: ['vận hành, hành chính, quản lý dự án', 'dịch vụ khách hàng, vai trò trung gian', 'kế toán quản trị'],
    excessSigns: 'trì trệ, ngại thay đổi, ôm đồm trách nhiệm, chậm ra quyết định',
    excessFix: 'đặt mốc thử điều mới mỗi quý (Mộc); chia việc thay vì gánh hết',
  },
  'Kim': {
    quality: 'kỷ luật, quyết đoán, chuẩn mực, biết cắt bỏ cái thừa',
    habits: [
      'Viết quy trình hay danh sách kiểm cho việc lặp lại',
      'Dọn dẹp, tối giản: mỗi tuần bỏ bớt một thứ không cần',
      'Đặt tiêu chuẩn chất lượng rõ ràng và tự rà lại trước khi giao',
    ],
    work: ['tài chính, kiểm soát', 'tuân thủ, kiểm toán', 'kỹ thuật, cơ khí', 'kiểm định chất lượng, bảo mật'],
    excessSigns: 'cứng nhắc, khắt khe với mình và người khác, dễ đứt gãy quan hệ',
    excessFix: 'lắng nghe trước khi kết luận; tham gia hoạt động mềm, sáng tạo (Thuỷ) để giải toả',
  },
  'Thuỷ': {
    quality: 'trí tuệ, linh hoạt, lưu thông, thích nghi',
    habits: [
      'Đọc và tổng hợp thông tin đều đặn, ghi chú kiến thức',
      'Mở rộng mạng lưới: gặp người mới, đi đây đi đó',
      'Ngủ đủ, nghỉ ngơi có chủ đích, uống đủ nước',
    ],
    work: ['công nghệ thông tin, dữ liệu, nghiên cứu', 'thương mại, vận chuyển', 'du lịch, xuất nhập khẩu', 'tư vấn, kết nối'],
    excessSigns: 'thiếu định hướng, nghĩ nhiều làm ít, dễ đổi theo hoàn cảnh',
    excessFix: 'chọn một mục tiêu chính và cam kết thời hạn; cấu trúc hoá tuần làm việc (Thổ)',
  },
};

/**
 * meaning: nhóm này ứng với điều gì trong đời sống (nói thường, không thuật ngữ).
 * example: một việc cụ thể khi nhóm này là hành cần thêm; harmExample: một tình huống cụ thể khi nhóm này là hành nên tiết chế.
 * Dùng ở mục "Nói dễ hiểu" (plain.ts). Không nêu màu, hướng, vật phẩm (14.3), không dùng từ cấm (vocab.ts).
 */
export interface TenGodPractical { asUseful: string; asHarmful: string; actions: string[]; meaning: string; example: string; harmExample: string }

/** Vai trò của hành so với bản thân khi là hành có lợi (asUseful) hay cần cân nhắc (asHarmful): lớp chạm vào đời sống nhiều nhất. */
export const TEN_GOD_PRACTICAL: Record<TenGodGroup, TenGodPractical> = {
  TyKiep: {
    asUseful: 'Sức mạnh đến từ bản thân và đồng đội. Nên xây đội nhóm, cộng sự, mạng lưới ngang hàng; tự tin đứng tên việc của mình.',
    asHarmful: 'Dễ cạnh tranh, bị chia phần; khi hợp tác về tiền bạc nên thoả thuận rõ ràng ngay từ đầu.',
    actions: ['Tìm cộng sự bù trừ năng lực', 'Tham gia cộng đồng nghề nghiệp', 'Rèn sức bền thể chất'],
    meaning: 'chính bạn và những người ngang hàng: anh chị em, bạn bè, đồng nghiệp cùng cấp, sức khoẻ và sự tự lập',
    example: 'thay vì một mình gánh một việc lớn, rủ một người quen cùng nghề làm chung và chia rõ phần ai nấy làm; hoặc giữ lịch tập thể dục ba buổi một tuần để có sức bền',
    harmExample: 'góp tiền làm ăn chung với bạn bè mà không ghi rõ ai góp bao nhiêu, ai hưởng bao nhiêu; hoặc ganh đua với đồng nghiệp đến mức mệt mỏi',
  },
  An: {
    asUseful: 'Được nâng đỡ qua học vấn, người thầy, tổ chức che chở. Nên dành thời gian học thêm, lấy chứng chỉ, tìm người hướng dẫn.',
    asHarmful: 'Dễ ỷ lại, học mãi không làm, chần chừ hành động. Cần chuyển kiến thức thành sản phẩm cụ thể.',
    actions: ['Học một chứng chỉ chuyên môn', 'Tìm một hai người hướng dẫn', 'Làm việc trong tổ chức có hệ thống đào tạo'],
    meaning: 'việc học, bằng cấp, người thầy, người đi trước nâng đỡ, và những lúc nghỉ để nạp lại sức',
    example: 'đăng ký một khoá học có chứng chỉ trong ba đến sáu tháng tới, hoặc nhờ một người đi trước trong nghề góp ý cho mình mỗi tháng một buổi',
    harmExample: 'học hết khoá này sang khoá khác mà chưa làm ra sản phẩm nào; hoặc chờ có người sắp xếp sẵn rồi mới bắt tay vào việc',
  },
  ThucThuong: {
    asUseful: 'Thành công đến từ thể hiện và sáng tạo: làm sản phẩm, viết, dạy, nói. Nên có "đầu ra" công khai đều đặn.',
    asHarmful: 'Dễ tiêu hao sức, nói nhiều thì mệt, dễ va chạm với cấp trên, chi tiêu theo hứng.',
    actions: ['Xây sản phẩm hay hồ sơ cá nhân', 'Chia sẻ chuyên môn công khai', 'Biến kỹ năng thành dịch vụ'],
    meaning: 'khả năng thể hiện và làm ra cái mới: nói, viết, dạy, sáng tạo, tay nghề',
    example: 'mỗi tuần viết một bài chia sẻ điều mình làm tốt, hoặc nhận dạy kèm một kỹ năng mình có cho vài người quen',
    harmExample: 'nói thẳng trong cuộc họp làm mất lòng cấp trên, hoặc chi tiêu theo hứng rồi cuối tháng thấy hụt',
  },
  Tai: {
    asUseful: 'Hợp với hành động hướng kết quả, kinh doanh, quản lý nguồn lực. Nên đặt mục tiêu thu nhập cụ thể và theo dõi dòng tiền.',
    asHarmful: 'Dễ bị tiền bạc, công việc vật chất kéo quá sức. Nên giữ gìn sức khoẻ và không mở rộng quá năng lực.',
    actions: ['Lập ngân sách và theo dõi dòng tiền', 'Thử một nguồn thu nhập phụ quy mô nhỏ', 'Học kỹ năng thương lượng, bán hàng'],
    meaning: 'tiền bạc, tài sản, kết quả cụ thể đo đếm được và cách quản lý nguồn lực',
    example: 'đặt một mục tiêu thu nhập cho sáu tháng tới rồi ghi chép thu chi mỗi tuần; hoặc thử bán một món hàng nhỏ, làm một việc dịch vụ nhỏ để quen với chuyện làm ra tiền',
    harmExample: 'nhận thêm việc làm thêm đến mức thiếu ngủ, hoặc mở rộng buôn bán khi vốn còn mỏng',
  },
  QuanSat: {
    asUseful: 'Hợp với môi trường có cấu trúc, trách nhiệm, chức danh. Áp lực vừa phải giúp phát triển; nên nhận vai trò quản lý, tuân thủ quy chuẩn.',
    asHarmful: 'Áp lực, kiểm soát, cấp trên khắt khe dễ gây căng thẳng. Cần ranh giới rõ, tránh nhận quá nhiều trách nhiệm cùng lúc.',
    actions: ['Nhận một vai trò có trách nhiệm rõ ràng', 'Xây kỷ luật cá nhân bằng lịch cố định', 'Làm việc trong tổ chức có quy chế minh bạch'],
    meaning: 'khuôn khổ và trách nhiệm: cấp trên, chức danh, nội quy, kỷ luật, danh tiếng',
    example: 'nhận làm trưởng nhóm một dự án có thời hạn rõ, hoặc tự đặt giờ làm, giờ ngủ cố định và giữ đúng trong ba tháng',
    harmExample: 'nhận cùng lúc nhiều chức danh, hoặc làm dưới quyền người quá khắt khe mà không nói ra cho đến lúc kiệt sức',
  },
};
