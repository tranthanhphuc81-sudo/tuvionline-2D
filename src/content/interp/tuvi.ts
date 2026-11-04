/* Bảng câu chữ Tử Vi — CHÉP NGUYÊN VĂN từ legacy (public/legacy/lyso-toolkit.html, module LySoInterp).
   Sinh bằng script cắt thẳng từ file legacy; chỉ đổi `var` thành `export const` và thêm kiểu. KHÔNG sửa câu chữ ở đây
   mà không sửa legacy tương ứng (test đối chiếu tests/parity/tuvi.test.ts sẽ báo). */
import type { AreaKey, CungName } from '../../core';

export const STAR: Record<string, { net: string; manh: string[]; luuY: string[]; viDu: string; khuyen: string[] }> = {
  'Tử Vi': { net:'có tố chất làm chủ, tự trọng cao, thích mọi việc có trật tự',
    manh:['Có uy, dễ được người khác tin tưởng giao việc lớn','Biết nhìn tổng thể, giỏi sắp xếp, điều phối'],
    luuY:['Dễ cô đơn khi ở vị trí cao, ngại nhờ vả người khác','Dễ tự ái khi bị góp ý trước đông người'],
    viDu:'Trong một nhóm làm việc, bạn thường được đẩy lên dẫn dắt dù không xung phong; nhưng khi việc không như ý, bạn hay tự gánh hết thay vì chia sẻ.',
    khuyen:['Xây một "ê-kíp" 2–3 người tin cậy, giỏi bù chỗ yếu cho bạn, thay vì tự làm mọi thứ','Tập nhận góp ý riêng trước — vẫn giữ được thể diện mà vẫn tiến bộ'] },
  'Thiên Cơ': { net:'đầu óc nhanh nhạy, giỏi tính toán và lập kế hoạch',
    manh:['Học nhanh, xoay xở giỏi khi có sự cố','Hợp việc phân tích, tham mưu, kỹ thuật, lập trình'],
    luuY:['Hay lo nghĩ, suy tính quá nhiều','Dễ đổi ý, bỏ dở giữa chừng'],
    viDu:'Trước một chuyến đi, bạn có thể lên sẵn 3 phương án — nhưng cũng là người mất ngủ vì nghĩ "lỡ trễ chuyến thì sao".',
    khuyen:['Mỗi quý chỉ chọn MỘT mục tiêu chính và theo đến cùng trước khi đổi hướng','Khi lo lắng, viết ra giấy rồi tách thành việc làm được ngay — bớt nghĩ, tăng làm'] },
  'Thái Dương': { net:'nhiệt tình, hào phóng, thích giúp đỡ và được ghi nhận',
    manh:['Truyền năng lượng tốt, hợp vai trò đại diện, giao tiếp, đào tạo','Sống rõ ràng, quang minh'],
    luuY:['Hay ôm việc của người khác nên dễ kiệt sức','Trọng thể diện, khó từ chối'],
    viDu:'Đồng nghiệp nhờ một việc nhỏ, bạn nhận luôn phần việc lớn — đến cuối tuần mới thấy việc của chính mình chưa xong.',
    khuyen:['Đặt giới hạn: mỗi tuần dành một khoảng thời gian cố định để giúp người khác, ngoài ra thì từ chối khéo','Chọn công việc có "sân khấu" (đào tạo, kinh doanh, quản lý) để phát huy sự nhiệt tình'] },
  'Vũ Khúc': { net:'thực tế, quyết đoán, nhạy với tiền bạc',
    manh:['Quản lý tài chính tốt, làm việc ra kết quả cụ thể','Kiên trì theo đuổi mục tiêu'],
    luuY:['Cứng rắn, ít thể hiện tình cảm','Dễ xem nhẹ chuyện cảm xúc trong gia đình'],
    viDu:'Bạn có thể nhớ chính xác từng khoản chi trong tháng nhưng lại quên ngày kỷ niệm của người thân.',
    khuyen:['Duy trì thói quen ghi chép thu chi — dùng thế mạnh này để tích luỹ dài hạn (quỹ dự phòng, đầu tư định kỳ)','Mỗi tuần dành một buổi "không bàn chuyện tiền" cho gia đình'] },
  'Thiên Đồng': { net:'hiền hoà, dễ chịu, biết tận hưởng cuộc sống',
    manh:['Hoà đồng, ít gây thù oán, được nhiều người quý','Tâm lý thoải mái, phục hồi nhanh sau khó khăn'],
    luuY:['Thiếu quyết liệt, dễ trì hoãn','Thích an nhàn nên đôi khi bỏ lỡ cơ hội'],
    viDu:'Có cơ hội thăng chức nhưng phải học thêm buổi tối — bạn dễ nghĩ "thôi, hiện tại cũng ổn rồi".',
    khuyen:['Đặt hạn chót rõ ràng và nhờ một người bạn nhắc tiến độ','Thử biến sở thích thành nguồn thu phụ — bạn làm tốt nhất khi thấy vui'] },
  'Liêm Trinh': { net:'có nguyên tắc, sắc sảo, ý chí mạnh',
    manh:['Kỷ luật tốt, hợp môi trường có quy định rõ (pháp lý, quản lý, kỹ thuật)','Dám chịu trách nhiệm'],
    luuY:['Nóng nảy, cố chấp khi bị trái ý','Các mối quan hệ dễ trở nên phức tạp'],
    viDu:'Thấy người khác làm sai quy trình, bạn dễ nói thẳng ngay tại chỗ — đúng việc nhưng có thể mất lòng.',
    khuyen:['Áp dụng quy tắc "đợi 10 phút" trước khi phản ứng lúc bực','Góp ý riêng, khen công khai'] },
  'Thiên Phủ': { net:'điềm tĩnh, chắc chắn, biết giữ của',
    manh:['Quản lý và giữ gìn tài sản giỏi','Đáng tin cậy, bao dung'],
    luuY:['Bảo thủ, ngại thay đổi','Đôi khi thận trọng quá nên chậm chân'],
    viDu:'Bạn thích gửi tiết kiệm hơn là đầu tư mạo hiểm — an toàn, nhưng có lúc tiếc vì bỏ lỡ cơ hội tốt.',
    khuyen:['Chia tiền thành 2 phần: phần lớn để an toàn, phần nhỏ (khoảng 10–20%) để thử cơ hội mới','Mỗi năm học một kỹ năng mới để tránh "ổn định quá mức"'] },
  'Thái Âm': { net:'tinh tế, nhạy cảm, chu đáo, giỏi tích luỹ',
    manh:['Quan sát tốt, chăm lo người khác chu đáo','Tiết kiệm, tích góp đều đặn'],
    luuY:['Hay giữ cảm xúc trong lòng, dễ buồn','Nhạy cảm với lời nói của người khác'],
    viDu:'Bạn nhận ra ngay khi người thân có chuyện buồn, nhưng khi chính mình buồn lại ít khi nói ra.',
    khuyen:['Có một người tin cậy để tâm sự định kỳ — đừng ôm hết trong lòng','Phát huy ở việc cần sự tỉ mỉ: tài chính gia đình, thiết kế, chăm sóc khách hàng'] },
  'Tham Lang': { net:'đa tài, giao tiếp giỏi, nhiều mong muốn',
    manh:['Quảng giao, dễ tạo quan hệ — hợp kinh doanh, bán hàng, nghệ thuật','Học được nhiều thứ cùng lúc'],
    luuY:['Dễ sa đà vui chơi, chi tiêu theo cảm hứng','Thiếu kiên định, "cả thèm chóng chán"'],
    viDu:'Bạn có thể đăng ký 3 khoá học cùng lúc vì thấy cái gì cũng hay, nhưng cuối cùng chỉ học xong một.',
    khuyen:['Mỗi lúc chỉ theo đuổi tối đa 2 mục tiêu lớn','Đặt hạn mức chi tiêu giải trí cố định hằng tháng'] },
  'Cự Môn': { net:'ăn nói có lý lẽ, giỏi phân tích, hay hoài nghi',
    manh:['Hợp nghề dùng lời nói: luật, giảng dạy, tư vấn, bán hàng, truyền thông','Phát hiện chỗ sai nhanh'],
    luuY:['Lời nói dễ gây thị phi, hiểu lầm','Khó tin người'],
    viDu:'Trong cuộc họp, bạn thường là người chỉ ra điểm yếu của kế hoạch — rất có ích, nhưng nói thiếu khéo dễ bị cho là "bắt bẻ".',
    khuyen:['Mỗi khi chỉ ra vấn đề, đưa kèm một giải pháp','Thoả thuận quan trọng thì ghi lại bằng văn bản/tin nhắn, cẩn thận lời nói trên mạng xã hội'] },
  'Thiên Tướng': { net:'chính trực, có trách nhiệm, hay bênh vực lẽ phải',
    manh:['Được tin tưởng, hợp vai trò quản lý, nhân sự, hành chính','Biết hoà giải mâu thuẫn'],
    luuY:['Dễ nể nang, bị lợi dụng lòng tốt','Hay lo chuyện bao đồng'],
    viDu:'Bạn bè nhờ đứng ra bảo lãnh hay cho vay — bạn khó từ chối dù trong lòng không yên tâm.',
    khuyen:['Không bảo lãnh, không cho vay vượt quá số tiền bạn sẵn sàng mất','Tập nói "để mình suy nghĩ thêm" thay vì nhận lời ngay'] },
  'Thiên Lương': { net:'hiền lành, có tâm, thích che chở và chỉ dẫn người khác',
    manh:['Hợp nghề giáo dục, y tế, tư vấn, công tác xã hội','Hay gặp người giúp vào lúc khó'],
    luuY:['Dễ "dạy đời", hay can thiệp chuyện người khác','Đôi khi cô độc vì quá nguyên tắc'],
    viDu:'Người thân hay tìm bạn xin lời khuyên — nhưng nếu góp ý quá kỹ, người nghe dễ thấy bị áp đặt.',
    khuyen:['Trước khi khuyên, hỏi: "Bạn cần mình nghe hay cần mình góp ý?"','Phát triển vai trò người hướng dẫn (mentor) trong công việc'] },
  'Thất Sát': { net:'dũng cảm, dám nghĩ dám làm, độc lập',
    manh:['Chịu áp lực tốt, hợp khởi nghiệp và việc cần quyết đoán','Không ngại thử thách'],
    luuY:['Nóng vội, cuộc sống nhiều biến động','Dễ va chạm với cấp trên'],
    viDu:'Bạn có thể nghỉ việc ngay khi bất đồng với sếp để tự làm — có thể thành công lớn, nhưng thiếu chuẩn bị thì sẽ chật vật.',
    khuyen:['Trước quyết định lớn (nghỉ việc, khởi nghiệp), chuẩn bị quỹ dự phòng ít nhất 6 tháng chi tiêu','Tập thể thao đều đặn để giải toả năng lượng và sự nóng nảy'] },
  'Phá Quân': { net:'thích đổi mới, phá cách, không chịu lối mòn',
    manh:['Giỏi cải tổ, làm lại từ đầu, mở hướng đi mới','Can đảm trước thay đổi'],
    luuY:['Khó ổn định lâu một chỗ','Dễ hao tốn vì phải làm lại nhiều lần'],
    viDu:'Bạn có thể đổi việc, đổi nhà hoặc đổi hướng kinh doanh nhiều lần hơn người khác — lần nào cũng có lý do, nhưng khá tốn kém.',
    khuyen:['Thử nghiệm nhỏ trước khi "đập đi xây lại" toàn bộ','Giữ một nền tảng cố định (nghề chính, khoản tiết kiệm) trong lúc đổi mới'] }
};

export const PHU: Record<string, { good: boolean; text: string }> = {
  'Văn Xương': { good:true, text:'Có Văn Xương ở Mệnh: học hành, chữ nghĩa, giấy tờ thuận lợi; có năng khiếu viết lách, trình bày' },
  'Văn Khúc': { good:true, text:'Có Văn Khúc ở Mệnh: ăn nói duyên, có khiếu nghệ thuật, học nhanh' },
  'Tả Phù': { good:true, text:'Có Tả Phù ở Mệnh: hay có người giúp đỡ, làm việc nhóm tốt' },
  'Hữu Bật': { good:true, text:'Có Hữu Bật ở Mệnh: được bạn bè, đồng nghiệp hỗ trợ, biết hợp tác' },
  'Thiên Khôi': { good:true, text:'Có Thiên Khôi ở Mệnh: dễ gặp quý nhân là người có vị thế nâng đỡ' },
  'Thiên Việt': { good:true, text:'Có Thiên Việt ở Mệnh: hay gặp người giúp đúng lúc cần' },
  'Lộc Tồn': { good:true, text:'Có Lộc Tồn ở Mệnh: tài lộc ổn định, biết giữ tiền (đôi khi hơi chặt chẽ chi tiêu)' },
  'Thiên Mã': { good:true, text:'Có Thiên Mã ở Mệnh: năng động, hợp việc đi lại, làm xa nhà, di chuyển nhiều' },
  'Kình Dương': { good:false, text:'Có Kình Dương ở Mệnh: tính nóng, dễ va chạm — cẩn thận tai nạn do vội vàng (xe cộ, dao kéo)' },
  'Đà La': { good:false, text:'Có Đà La ở Mệnh: việc hay dây dưa, kéo dài; dễ trì hoãn' },
  'Địa Không': { good:false, text:'Có Địa Không ở Mệnh: tiền bạc lên xuống thất thường — bù lại có ý tưởng khác người' },
  'Địa Kiếp': { good:false, text:'Có Địa Kiếp ở Mệnh: dễ hao tán vì đầu tư mạo hiểm, cần giữ quỹ dự phòng' }
};

export const CUNG_PLAIN: Record<CungName, string> = { 'Mệnh':'bản thân bạn', 'Phụ Mẫu':'cha mẹ, cấp trên, giấy tờ', 'Phúc Đức':'đời sống tinh thần, phúc phần gia đình', 'Điền Trạch':'nhà cửa, đất đai',
  'Quan Lộc':'công việc, sự nghiệp', 'Nô Bộc':'bạn bè, đồng nghiệp, cấp dưới', 'Thiên Di':'môi trường bên ngoài, đi xa, các mối quan hệ xã hội', 'Tật Ách':'sức khoẻ',
  'Tài Bạch':'tiền bạc, thu nhập', 'Tử Tức':'con cái', 'Phu Thê':'vợ chồng, tình duyên', 'Huynh Đệ':'anh chị em, bạn thân' };

export const KY_ADVICE: Record<CungName, string> = {
  'Mệnh':'Hoá Kỵ ở Mệnh: đừng tự tạo áp lực cho mình; khi rối, chậm lại một nhịp rồi mới quyết.',
  'Phụ Mẫu':'Hoá Kỵ ở Phụ Mẫu: giữ giấy tờ, hợp đồng cẩn thận; chủ động trò chuyện với cha mẹ/cấp trên để tránh hiểu lầm.',
  'Phúc Đức':'Hoá Kỵ ở Phúc Đức: dành thời gian nghỉ ngơi, đi chơi cùng gia đình; tránh ôm lo âu một mình.',
  'Điền Trạch':'Hoá Kỵ ở Điền Trạch: mua bán nhà đất phải kiểm tra pháp lý kỹ, không vội xuống tiền.',
  'Quan Lộc':'Hoá Kỵ ở Quan Lộc: ghi lại thoả thuận công việc bằng văn bản; đừng nhảy việc khi chưa có kế hoạch rõ.',
  'Nô Bộc':'Hoá Kỵ ở Nô Bộc: chọn người cộng tác kỹ; không cho vay, góp vốn khi chưa rõ ràng.',
  'Thiên Di':'Hoá Kỵ ở Thiên Di: đi xa cẩn thận giấy tờ, phương tiện; đến môi trường mới nên quan sát trước khi hành động.',
  'Tật Ách':'Hoá Kỵ ở Tật Ách: khám sức khoẻ định kỳ mỗi năm, đừng chủ quan với dấu hiệu nhỏ.',
  'Tài Bạch':'Hoá Kỵ ở Tài Bạch: lập quỹ dự phòng, tránh đầu tư theo phong trào và vay mượn quá sức.',
  'Tử Tức':'Hoá Kỵ ở Tử Tức: dành thời gian lắng nghe con cái, kiên nhẫn trong việc dạy dỗ.',
  'Phu Thê':'Hoá Kỵ ở Phu Thê: nói chuyện thẳng thắn, đều đặn với người bạn đời; đừng để hiểu lầm tích tụ.',
  'Huynh Đệ':'Hoá Kỵ ở Huynh Đệ: rõ ràng chuyện tiền bạc với anh chị em, bạn thân.'
};

export const THAN_CU: Partial<Record<CungName, string>> = {
  'Mệnh':'Cung Thân trùng cung Mệnh: bạn sống đúng với con người thật của mình, ít thay đổi theo hoàn cảnh — những nét tính cách ở trên thể hiện rõ suốt đời.',
  'Phúc Đức':'Cung Thân ở Phúc Đức: càng lớn tuổi bạn càng coi trọng đời sống tinh thần, gia đình và sự bình an hơn danh lợi.',
  'Quan Lộc':'Cung Thân ở Quan Lộc: công việc là trung tâm cuộc sống; bạn được đánh giá qua thành tích nghề nghiệp — và cũng dễ "nghiện việc".',
  'Thiên Di':'Cung Thân ở Thiên Di: bạn hợp môi trường bên ngoài, đi xa, làm việc với nhiều người; cơ hội thường đến khi bước ra khỏi vùng quen thuộc.',
  'Tài Bạch':'Cung Thân ở Tài Bạch: chuyện tiền bạc, tích luỹ chiếm nhiều tâm sức; bạn có động lực kiếm tiền rất rõ ràng.',
  'Phu Thê':'Cung Thân ở Phu Thê: người bạn đời ảnh hưởng lớn đến hướng đi của bạn — chọn đúng người đồng hành là chuyện rất quan trọng.'
};

export const DH_ADVICE: Record<CungName, string> = {
  'Mệnh':'Vận đi qua chính cung Mệnh: tính cách gốc bộc lộ mạnh, đây là giai đoạn định hình bản thân — đầu tư cho học tập, sức khoẻ và thói quen tốt.',
  'Phụ Mẫu':'Trọng tâm là cha mẹ, cấp trên, giấy tờ: dành thời gian cho cha mẹ, làm việc tốt với cấp trên, hoàn thiện giấy tờ pháp lý.',
  'Phúc Đức':'Trọng tâm là đời sống tinh thần và gia đình, họ hàng: hợp để tu dưỡng, học hỏi, chăm lo nhà cửa tinh thần hơn là chạy theo tiền.',
  'Điền Trạch':'Trọng tâm là nhà cửa: thời điểm hợp lý để tính chuyện mua/sửa nhà, ổn định chỗ ở (nhớ kiểm tra pháp lý kỹ).',
  'Quan Lộc':'Trọng tâm là sự nghiệp: thời điểm tốt để học thêm chứng chỉ, nhận dự án lớn, tính chuyện thăng tiến hoặc mở rộng công việc.',
  'Nô Bộc':'Trọng tâm là bạn bè, đồng nghiệp, đội nhóm: chọn người cộng tác kỹ, đầu tư xây dựng đội ngũ và các mối quan hệ chất lượng.',
  'Thiên Di':'Trọng tâm là môi trường bên ngoài: cơ hội đến từ đi xa, đổi môi trường, mở rộng quan hệ — đừng ngại bước ra khỏi chỗ quen.',
  'Tật Ách':'Trọng tâm là sức khoẻ: khám định kỳ, tập luyện đều, điều chỉnh nhịp sống; tránh làm việc quá sức kéo dài.',
  'Tài Bạch':'Trọng tâm là tiền bạc: lập kế hoạch tài chính dài hạn, mở thêm nguồn thu, tích luỹ đều đặn.',
  'Tử Tức':'Trọng tâm là con cái và thế hệ sau: dành thời gian cho con; cũng hợp để dìu dắt người trẻ hoặc tạo ra "đứa con tinh thần" (sản phẩm, dự án riêng).',
  'Phu Thê':'Trọng tâm là tình cảm, hôn nhân: đầu tư thời gian cho người bạn đời, hoặc tìm hiểu thật kỹ nếu đang tính chuyện cưới.',
  'Huynh Đệ':'Trọng tâm là anh chị em, bạn thân: có thể hợp tác cùng nhau, nhưng phải rõ ràng tiền bạc ngay từ đầu.'
};

export const PAIRS: Record<string, [string, string]> = {
  'Thiên Phủ + Tử Vi':['Tử Phủ đồng cung','hai "vua" ngồi chung: vừa có tố chất lãnh đạo vừa biết giữ của — vững vàng, có tầm, hợp làm chủ hoặc quản lý lớn; điểm yếu là khó nhường nhịn, dễ cô độc ở vị trí cao'],
  'Tham Lang + Tử Vi':['Tử Tham đồng cung','có sức hút, tài giao tiếp và tham vọng lớn; dễ thành công trong kinh doanh, giải trí, quan hệ — nhưng cần giữ mình trước cám dỗ (tiền, tình, ăn chơi)'],
  'Thiên Tướng + Tử Vi':['Tử Tướng đồng cung','có uy lại có trách nhiệm, hợp điều hành tập thể; dễ làm quá sức vì muốn chu toàn cho mọi người'],
  'Thất Sát + Tử Vi':['Tử Sát đồng cung','quyền uy cộng quyết đoán: dám làm việc lớn, chịu áp lực tốt, hợp khởi nghiệp, lãnh đạo; dễ độc đoán, cần người dám góp ý thẳng'],
  'Phá Quân + Tử Vi':['Tử Phá đồng cung','muốn làm chủ và thích đổi mới, có tầm nhìn cải tổ; đời nhiều thay đổi, cần kiên nhẫn để giữ thành quả'],
  'Thiên Cơ + Thái Âm':['Cơ Nguyệt đồng cung','thông minh, tinh tế, giỏi lập kế hoạch và tích luỹ; hợp tài chính, kế hoạch, nghiên cứu, công chức; hay lo nghĩ, cần thư giãn'],
  'Cự Môn + Thiên Cơ':['Cơ Cự đồng cung','đầu óc sắc, ăn nói giỏi, phân tích nhạy; hợp tư vấn, luật, giảng dạy, kinh doanh dịch vụ; dễ đổi việc và dễ vướng thị phi lời nói'],
  'Thiên Cơ + Thiên Lương':['Cơ Lương đồng cung','hiểu biết rộng, thích tư vấn, chỉ dẫn; hợp giáo dục, tham mưu, nghề chuyên môn; đôi khi "nói hay hơn làm"'],
  'Thái Dương + Thái Âm':['Nhật Nguyệt đồng cung','vừa sôi nổi vừa tinh tế, làm được cả việc ngoài lẫn việc trong; tâm trạng dễ thay đổi, lúc hướng ngoại lúc hướng nội — cần tìm sự cân bằng'],
  'Cự Môn + Thái Dương':['Cự Nhật đồng cung','ăn nói có sức thuyết phục, nổi tiếng nhờ lời nói và chuyên môn; hợp truyền thông, giảng dạy, luật, ngoại giao'],
  'Thiên Lương + Thái Dương':['Dương Lương đồng cung','ngay thẳng, có lòng tốt, thích giúp đời; hợp giáo dục, y tế, khu vực nhà nước, thi cử thuận; dễ ôm việc thiện quá sức'],
  'Thiên Phủ + Vũ Khúc':['Vũ Phủ đồng cung','rất giỏi tiền bạc — vừa kiếm vừa giữ; hợp tài chính, ngân hàng, kinh doanh; thực tế, có phần khô khan trong tình cảm'],
  'Tham Lang + Vũ Khúc':['Vũ Tham đồng cung','ham làm giàu, giỏi kinh doanh, thường phát muộn (dân gian nói "trước 30 chưa phát") nhưng phát mạnh; cẩn thận chi tiêu hưởng thụ'],
  'Thiên Tướng + Vũ Khúc':['Vũ Tướng đồng cung','thực tế, có trách nhiệm, giỏi quản lý tiền và người; hợp tài chính, hành chính, kỹ thuật'],
  'Thất Sát + Vũ Khúc':['Vũ Sát đồng cung','quyết liệt, dám mạo hiểm vì tiền và sự nghiệp; thành bại nhanh — nên giữ quỹ dự phòng và chú ý an toàn lao động'],
  'Phá Quân + Vũ Khúc':['Vũ Phá đồng cung','dám phá cách để kiếm tiền, hợp kinh doanh, kỹ thuật, nghề có tính đột phá; tiền bạc lên xuống mạnh, cần kỷ luật tài chính'],
  'Thiên Đồng + Thái Âm':['Đồng Âm đồng cung','hiền hoà, tình cảm, sống nội tâm, yêu cái đẹp; hợp nghệ thuật, dịch vụ, chăm sóc; cần chủ động hơn để nắm cơ hội'],
  'Cự Môn + Thiên Đồng':['Đồng Cự đồng cung','bề ngoài dễ chịu nhưng trong lòng hay suy nghĩ, dễ buồn vì lời người khác; thành công đến muộn, nên tránh thị phi'],
  'Thiên Lương + Thiên Đồng':['Đồng Lương đồng cung','hiền, có tâm, được người quý và giúp; hợp giáo dục, y tế, công chức, dịch vụ xã hội; đời sống tương đối an nhàn'],
  'Liêm Trinh + Thiên Phủ':['Liêm Phủ đồng cung','nguyên tắc mà biết giữ của, làm việc chắc chắn; hợp quản lý, tài chính, pháp lý; tính hơi cứng nhưng đáng tin'],
  'Liêm Trinh + Tham Lang':['Liêm Tham đồng cung','đa tài, nhiều ham muốn, giao tiếp khéo; cần tránh xa cám dỗ (rượu chè, cờ bạc, quan hệ phức tạp) và việc mờ ám'],
  'Liêm Trinh + Thiên Tướng':['Liêm Tướng đồng cung','có nguyên tắc và trách nhiệm, làm việc công tâm; hợp pháp lý, quản lý, hành chính; cẩn thận chuyện giấy tờ, kiện tụng'],
  'Liêm Trinh + Thất Sát':['Liêm Sát đồng cung','ý chí mạnh, chịu khó, dám làm việc nặng; hợp kỹ thuật, quân đội, kinh doanh; đời nhiều thử thách nhưng kiên cường'],
  'Liêm Trinh + Phá Quân':['Liêm Phá đồng cung','mạnh mẽ, dám thay đổi, thích tự lập; đời nhiều sóng gió, nhưng đi đúng hướng có thể tạo dựng sự nghiệp riêng']
};

export const BRIGHT_TEXT: Record<string, Record<'1' | '-1', string>> = {
  'Thái Dương':{ '1':'Thái Dương ở cung sáng (mặt trời ban ngày): nhiệt huyết được ghi nhận, danh tiếng thuận lợi', '-1':'Thái Dương ở cung tối (mặt trời đã lặn): nhiệt tình nhưng hay vất vả, công sức bỏ ra nhiều hơn được ghi nhận — nên chọn việc ít phô trương mà bền' },
  'Thái Âm':{ '1':'Thái Âm ở cung sáng (trăng đêm rằm): tinh tế, tích luỹ tốt, dễ được hưởng phúc', '-1':'Thái Âm ở cung tối (trăng ban ngày): dễ đa sầu, tiền bạc và tình cảm cần cẩn trọng hơn' }
};

export const AREA: Record<string, Record<AreaKey, string>> = {
  'Tử Vi':{ tai:'tiền đến từ vị trí, uy tín; hợp kiếm tiền bằng quản lý hoặc kinh doanh có quy mô, ít khi thiếu thốn lâu', quan:'hợp vai trò quản lý, lãnh đạo, làm chủ; có cơ hội thăng tiến lên vị trí cao', phu:'người bạn đời có cá tính, tự trọng cao; hôn nhân cần tôn trọng nhau, tránh tranh quyền', tat:'dân gian lưu ý tì vị, dạ dày; nhìn chung sức khoẻ khá ổn', dien:'có khả năng sở hữu nhà cửa khang trang, ở vị trí tốt', di:'ra ngoài được nể trọng, dễ gặp người có địa vị giúp đỡ' },
  'Thiên Cơ':{ tai:'kiếm tiền bằng đầu óc, tính toán, kỹ thuật; thu nhập linh hoạt, có lúc lên xuống', quan:'hợp phân tích, kỹ thuật, công nghệ, lập kế hoạch, tham mưu; hay thay đổi công việc', phu:'người bạn đời thông minh, nhanh nhẹn, hay lo; nên tìm hiểu kỹ trước khi cưới', tat:'dân gian lưu ý gan, thần kinh, căng thẳng; cần ngủ đủ', dien:'nhà cửa hay dời chuyển, sửa sang', di:'ra ngoài xoay xở tốt, đi lại nhiều' },
  'Thái Dương':{ tai:'tiền đến từ danh tiếng, giao tiếp, công việc công khai; kiếm được nhưng chi cũng rộng tay', quan:'hợp việc có tiếng nói, xuất hiện trước đông người: giáo dục, truyền thông, quản lý, nhà nước', phu:'người bạn đời sôi nổi, rộng rãi; cần tránh sĩ diện với nhau', tat:'dân gian lưu ý mắt, đầu, huyết áp; tránh thức khuya kéo dài', dien:'nhà cửa sáng sủa, có thể được hưởng từ cha', di:'ra ngoài được nhiều người biết đến, hợp làm xa nhà' },
  'Vũ Khúc':{ tai:'rất nhạy tiền, giỏi tích luỹ; hợp tài chính, kinh doanh, ngành máy móc; cẩn thận đầu tư mạo hiểm', quan:'hợp tài chính, ngân hàng, kỹ thuật, cơ khí; làm việc ra kết quả cụ thể', phu:'người bạn đời cứng rắn, thực tế; kết hôn muộn một chút thường bền hơn', tat:'dân gian lưu ý phổi, hô hấp, xương răng', dien:'tự mua được nhà bằng sức mình sau thời gian tích góp', di:'hợp đi xa kiếm tiền' },
  'Thiên Đồng':{ tai:'tiền đến từ từ, thường tự gây dựng từ hai bàn tay trắng, về sau ổn định', quan:'hợp dịch vụ, chăm sóc, giáo dục, công việc ít áp lực', phu:'người bạn đời hiền, dễ chịu; hôn nhân êm ấm nếu cả hai chủ động hơn', tat:'dân gian lưu ý thận, đường tiết niệu; nên uống đủ nước', dien:'nhà cửa bình ổn, lúc trẻ hay đổi chỗ ở', di:'ra ngoài được quý mến, dễ hoà nhập' },
  'Liêm Trinh':{ tai:'kiếm tiền bằng kỷ luật, nguyên tắc; tránh các khoản tiền mập mờ', quan:'hợp pháp lý, quản lý, kỹ thuật, kiểm soát; sự nghiệp nhiều cạnh tranh', phu:'hôn nhân nhiều cảm xúc mạnh, cần nhẫn nại; tránh cưới vội', tat:'dân gian lưu ý tim mạch, máu (với nữ: phụ khoa)', dien:'nhà đất cần chú ý pháp lý, giấy tờ', di:'ra ngoài dễ gặp cạnh tranh, cần mềm mỏng' },
  'Thiên Phủ':{ tai:'giỏi giữ tiền, tích luỹ chắc; hợp đầu tư an toàn, bất động sản', quan:'hợp quản lý tài sản, hành chính, ngân hàng, vị trí cần sự tin cậy', phu:'người bạn đời chín chắn, biết lo; hôn nhân ổn định', tat:'dân gian lưu ý dạ dày, tiêu hoá; nhìn chung khá khoẻ', dien:'dễ có nhà đất, tài sản cố định', di:'ra ngoài được tin tưởng, quan hệ bền' },
  'Thái Âm':{ tai:'giỏi tích góp từng chút; hợp bất động sản, tài chính, dịch vụ', quan:'hợp việc tỉ mỉ, sau hậu trường: kế toán, thiết kế, nghiên cứu, chăm sóc', phu:'người bạn đời dịu dàng, tình cảm, đảm đang', tat:'dân gian lưu ý thận, mắt, nội tiết, giấc ngủ', dien:'có duyên với nhà đất, dễ tích luỹ bất động sản', di:'ra ngoài kín đáo, quan hệ chọn lọc mà bền' },
  'Tham Lang':{ tai:'kiếm tiền nhờ giao tiếp, quan hệ, kinh doanh, giải trí; tiền đến nhanh, đi cũng nhanh', quan:'hợp kinh doanh, bán hàng, ẩm thực, giải trí, nghệ thuật, quan hệ công chúng', phu:'tình duyên nhiều màu sắc, thường có vài mối trước khi ổn định; cần chung thuỷ, rõ ràng', tat:'dân gian lưu ý gan, thận; tránh rượu bia quá đà', dien:'nhà cửa trước khó sau dễ, có thể mua bán nhiều lần', di:'ra ngoài rất được lòng người, quan hệ rộng' },
  'Cự Môn':{ tai:'kiếm tiền bằng lời nói: tư vấn, bán hàng, giảng dạy, luật; cẩn thận tranh chấp tiền bạc', quan:'hợp nghề dùng lời nói: luật, giáo viên, MC, bán hàng, tư vấn', phu:'vợ chồng dễ khắc khẩu, hay tranh luận — nên học cách nói nhẹ', tat:'dân gian lưu ý tiêu hoá, miệng, răng, họng', dien:'mua bán nhà đất cần giấy tờ rõ ràng, tránh tranh chấp ranh giới', di:'ra ngoài dễ gặp thị phi, thận trọng lời nói' },
  'Thiên Tướng':{ tai:'tiền bạc đủ dùng, hay có người giúp; tránh đứng ra bảo lãnh', quan:'hợp hành chính, nhân sự, quản lý, chăm sóc khách hàng', phu:'người bạn đời đứng đắn, có trách nhiệm; hai người hỗ trợ nhau nhiều', tat:'dân gian lưu ý da, đường tiết niệu', dien:'nhà cửa ổn định, có thể được người thân giúp', di:'ra ngoài được tin cậy, dễ gặp quý nhân' },
  'Thiên Lương':{ tai:'tiền đến từ chuyên môn, uy tín; hay được hưởng lộc từ người lớn', quan:'hợp giáo dục, y tế, tư vấn, bảo hiểm, công tác xã hội', phu:'người bạn đời chín chắn, thường lớn tuổi hơn hoặc như người che chở', tat:'dân gian lưu ý dạ dày, gan mật; ốm đau hay gặp may', dien:'có thể được thừa hưởng nhà đất từ bề trên', di:'ra ngoài hay gặp người giúp, được kính trọng' },
  'Thất Sát':{ tai:'tiền đến từ dám làm, dám mạo hiểm; thu nhập lúc nhiều lúc ít, cần quỹ dự phòng', quan:'hợp khởi nghiệp, kinh doanh, kỹ thuật, nghề cần quyết đoán; sự nghiệp nhiều biến động nhưng có thể lên cao', phu:'hôn nhân dễ sóng gió vì cả hai đều mạnh mẽ; kết hôn muộn tốt hơn', tat:'dân gian lưu ý phổi, hô hấp và chấn thương do va chạm', dien:'nhà cửa hay thay đổi, phải tự gây dựng', di:'hợp xông pha, làm xa, nhưng cẩn thận an toàn đi lại' },
  'Phá Quân':{ tai:'tiền vào ra mạnh, hay chi cho việc đổi mới; nên có quỹ tiết kiệm riêng không đụng tới', quan:'hợp công việc đổi mới, cải tổ, khởi nghiệp, xây dựng; hay đổi nghề', phu:'hôn nhân dễ thay đổi, cần nhiều kiên nhẫn và cam kết', tat:'dân gian lưu ý thận, khí huyết và chấn thương', dien:'nhà cửa hay sửa sang, xây lại, dời chỗ ở', di:'dám thay đổi môi trường, hợp đi xa lập nghiệp' }
};

export const AREA_LIST: readonly { key: AreaKey; cung: CungName; icon: string; title: string }[] = [
  { key:'tai', cung:'Tài Bạch', icon:'💰', title:'Tiền bạc' },
  { key:'quan', cung:'Quan Lộc', icon:'💼', title:'Công việc, sự nghiệp' },
  { key:'phu', cung:'Phu Thê', icon:'❤️', title:'Tình duyên, hôn nhân' },
  { key:'tat', cung:'Tật Ách', icon:'🩺', title:'Sức khoẻ' },
  { key:'dien', cung:'Điền Trạch', icon:'🏠', title:'Nhà cửa' },
  { key:'di', cung:'Thiên Di', icon:'✈️', title:'Ra ngoài, xã hội' }
];

export const PHU_SHORT: Record<string, string> = { 'Tả Phù':'có người giúp', 'Hữu Bật':'có người giúp', 'Thiên Khôi':'gặp quý nhân', 'Thiên Việt':'gặp quý nhân', 'Văn Xương':'thuận giấy tờ, học hành', 'Văn Khúc':'thuận giấy tờ, học hành', 'Lộc Tồn':'có lộc, biết giữ',
  'Kình Dương':'dễ va chạm, nóng vội', 'Đà La':'dễ dây dưa, chậm trễ', 'Địa Không':'dễ hao hụt bất ngờ', 'Địa Kiếp':'dễ hao hụt bất ngờ' };

export const HOA_SHORT: Record<'loc' | 'quyen' | 'khoa' | 'ky', string> = { loc:'thuận lợi, có lộc', quyen:'nắm được thế chủ động', khoa:'được tiếng tốt, có người giúp', ky:'dễ vướng mắc, cần thận trọng' };

export const AREA_TIP: Record<AreaKey, { mid: string; good: string; bad: string }> = {
  tai:{ mid:'Giữ thói quen ghi chép thu chi, để dành đều một phần thu nhập mỗi tháng trước khi tiêu.', good:'Đây là mảng đáng đầu tư: mở thêm nguồn thu, tích luỹ đều mỗi tháng.', bad:'Lập quỹ dự phòng 3–6 tháng chi tiêu, không vay mượn hay đầu tư theo phong trào.' },
  quan:{ mid:'Đi đều từng bước: hoàn thành tốt việc hiện tại, mỗi năm học thêm một kỹ năng mới.', good:'Mạnh dạn nhận trách nhiệm lớn hơn, học thêm để lên vị trí cao hơn.', bad:'Ghi rõ thoả thuận công việc bằng văn bản; cân nhắc kỹ trước khi nghỉ việc, đổi nghề.' },
  phu:{ mid:'Duy trì những thói quen nhỏ: một bữa cơm, một buổi đi chơi riêng mỗi tuần.', good:'Dành thời gian cho người bạn đời — đây là chỗ dựa lớn của bạn.', bad:'Nói chuyện thẳng thắn, đều đặn; tìm hiểu kỹ trước khi cưới, tránh để hiểu lầm tích tụ.' },
  tat:{ mid:'Ngủ đủ, vận động 30 phút mỗi ngày và khám tổng quát mỗi năm một lần.', good:'Giữ thói quen tốt hiện có: ngủ đủ, vận động đều.', bad:'Khám sức khoẻ định kỳ mỗi năm, chú ý những bộ phận nêu ở trên (không thay cho chẩn đoán của bác sĩ).' },
  dien:{ mid:'Tích luỹ dần cho chuyện nhà cửa, chọn nơi ở hợp túi tiền trước rồi nâng cấp sau.', good:'Có duyên với nhà đất — có thể tính chuyện an cư khi đủ điều kiện.', bad:'Mua bán nhà đất phải kiểm tra pháp lý kỹ, không vội xuống tiền.' },
  di:{ mid:'Giữ quan hệ với bạn bè, đồng nghiệp cũ — cơ hội thường đến từ những người quen.', good:'Mở rộng quan hệ, đi xa, đổi môi trường thường mang lại cơ hội.', bad:'Đi xa cẩn thận giấy tờ, phương tiện; ở môi trường mới nên quan sát trước khi hành động.' }
};

export const HANH_INFO: Record<string, { mau: string; huong: string[]; nghe: string; vat: string; mua: string }> = {
  'Mộc': { mau:'xanh lá, xanh rêu', huong:['Đông','Đông Nam'], nghe:'giáo dục, xuất bản, thiết kế, thời trang, nông – lâm nghiệp, chăm sóc sức khoẻ', vat:'cây xanh, đồ gỗ, tranh cây cỏ', mua:'mùa Xuân (tháng Giêng, tháng Hai âm lịch)' },
  'Hoả': { mau:'đỏ, cam, hồng, tím', huong:['Nam'], nghe:'truyền thông, quảng cáo, điện – điện tử, công nghệ, ẩm thực, làm đẹp, biểu diễn', vat:'đèn sáng, đồ màu đỏ/cam', mua:'mùa Hạ (tháng Tư, tháng Năm âm lịch)' },
  'Thổ': { mau:'vàng, nâu đất, be', huong:['Đông Bắc','Tây Nam'], nghe:'bất động sản, xây dựng, nông nghiệp, kho vận, bảo hiểm, tư vấn, quản trị', vat:'gốm sứ, đá, pha lê', mua:'các tháng cuối mùa (tháng Ba, Sáu, Chín, Chạp âm lịch)' },
  'Kim': { mau:'trắng, xám, bạc, ánh kim', huong:['Tây','Tây Bắc'], nghe:'tài chính – ngân hàng, kế toán, cơ khí, kỹ thuật, pháp luật, trang sức', vat:'đồ kim loại, chuông gió kim loại', mua:'mùa Thu (tháng Bảy, tháng Tám âm lịch)' },
  'Thuỷ': { mau:'đen, xanh dương, xanh navy', huong:['Bắc'], nghe:'thương mại, xuất nhập khẩu, vận tải, logistics, du lịch, các nghề cần đi lại nhiều', vat:'bể cá, tiểu cảnh nước, tranh sông nước', mua:'mùa Đông (tháng Mười, tháng Mười Một âm lịch)' }
};

export function pairOf(stars: readonly string[]): [string, string] | null {
  return stars.length === 2 ? PAIRS[stars.slice().sort().join(' + ')] ?? null : null;
}
