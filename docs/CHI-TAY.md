# CHI-TAY.md — Kiến thức chỉ tay cho tính năng "Xem chỉ tay" (tuvionline-2D)

> Tài liệu tham chiếu cho module nội dung `chỉ tay` của app Lý Số Trọn Bộ (bản 2D, một người, offline).
> Chép vào repo ở `docs/CHI-TAY.md`. Các prompt trong `PROMPT-KIT-CHI-TAY.md` đọc tài liệu này.
> Mọi câu luận giải trong tài liệu đã được **biên tập lại** (diễn đạt mới, tông trung tính), **không chép nguyên văn** sách.

---

## 0. Nguồn và cách dùng từng nguồn

| Mã | Sách | Trường phái | Phần dùng | Phần **không** dùng |
|---|---|---|---|---|
| **DVT** | Đoàn Văn Thông, *Những kinh nghiệm về khoa Xem Chỉ Tay*, NXB Đại Nam (316 tr.) | Tây phương tổng hợp (Ranald, Henry Rem, Cheiro…) | Ngón tay, gò, 9 đường chỉ, dấu hiệu theo vị trí, tổ hợp đặc biệt, cách tính tuổi trên đường | Toàn bộ "móng tay & bệnh lý", "bệnh lý trên bàn tay", "dấu hiệu tình dục", bàn tay danh nhân, các câu về tù tội/chết/sinh nở |
| **HCM** | Hiến Chi Mai biên dịch, Nguyễn Khắc Minh hiệu đính, *Bàn Tay Mã Số Cuộc Đời*, NXB VH-TT 2004 (314 tr., dịch từ tiếng Trung) | Tướng tay hiện đại Trung–Nhật | Phần I: 4 đường cơ bản, đường bộ phận (dấu hiệu), dạng tay, độ dài ngón, **30 tổ hợp vân tay**, dạng móng, tính tuổi trên đường Công danh & Hôn nhân, nguyên tắc "tướng tay thay đổi" | Phần II (y học, bấm huyệt) · "đoán sức khoẻ" theo đường · hợp đôi tình dục · **vận cờ bạc, xổ số** · tay Hitler · bắt tay đoán nhân phẩm · ăn uống "cải vận" |
| **TCT** | Trang Chấn Tây chủ biên, Nguyễn An dịch, *Bàn Tay Với Sức Khỏe Con Người*, NXB Hà Nội 2001 (638 tr.) | Y học chẩn đoán tay (Trung y) | **Chỉ** lấy: vị trí **Cửu cung bát quái** trên bàn tay + ngũ hành + cổ thuyết Tốn–Ly–Khôn; tên gọi Thiên/Nhân/Địa vân; cách quan sát (ánh sáng, tư thế) | Mọi nội dung chẩn đoán/dự báo bệnh, tỷ lệ "chính xác 89%", bấm huyệt chữa bệnh |
| **JDJ** | Jeanne Dujarric, Ngũ Văn Bằng dịch, *Có Gì Bí Mật Trong Bàn Tay?* (*Les mystères dans les mains*, 143 tr.) | Chirologie Pháp (Arpentigny, Desbarolles) | Khung phân loại hình bàn tay (kích thước, hình thức, độ cứng/mềm, nhiệt độ), đo độ dài ngón cái, lóng ngón cái, cách in tay ra giấy, cảnh báo về "nghệ thuật nói đóc" | Các phán xét đạo đức gay gắt, "phương pháp tìm tuổi thọ", móng tay & bệnh chứng, đường "dâm ý" |

Ghi chú về bản OCR: HCM, TCT, JDJ là bản quét, đã OCR; DVT là PDF font VNI, đã chuyển sang Unicode. Vài số hình/tiêu đề trong OCR bị nhiễu, các chỗ chưa chắc chắn được đánh dấu **(cần đối chiếu)**.

---

## 1. Nguyên tắc biên tập (bắt buộc cho mọi câu chữ chỉ tay)

1. **Định vị:** nội dung văn hoá – giải trí – tự soi chiếu bản thân. Không cam kết dự đoán.
2. **Không chép nguyên văn sách** (các sách còn trong thời hạn bảo hộ). Chỉ dùng ý, diễn đạt lại. Khác với 5 công cụ cũ (câu chữ legacy giữ nguyên văn), câu chữ chỉ tay là **nội dung mới** của app.
3. **Tướng tay thay đổi** (HCM, Phần I-E/G): đường chỉ đổi theo tuổi, lối sống, tinh thần → mọi kết quả kết thúc bằng lời nhắc "xem lại sau 6–12 tháng", và câu "lưu ý" luôn đi kèm một gợi ý hành động.
4. **Mỗi câu ≤ 180 ký tự** (một cue TTS), một ý, không hù doạ, không tuyệt đối hoá ("chắc chắn", "nhất định").
5. **Một dấu hiệu không đủ để kết luận** (DVT, TCT đều nhấn mạnh đánh giá tổng hợp): chủ đề có ≥ 2 dấu hiệu cùng chiều mới dùng câu khẳng định; chỉ 1 dấu hiệu thì dùng giọng "có xu hướng…".
6. **Cân bằng:** mỗi chủ đề có ít nhất một điểm mạnh; câu "lưu ý" không đứng một mình.
7. **Loại bỏ hoàn toàn** (không có trong dữ liệu, kể cả dạng chữ không đọc) — xem §12:
   chẩn đoán/dự báo bệnh · tuổi thọ, chết, tai nạn cụ thể · tù tội, pháp luật · tình dục, xu hướng tính dục · phán xét đạo đức theo giới · số con, giới tính con, hiếm muộn, sẩy thai, khó sinh · ly hôn/goá/ngoại tình như dự đoán · cờ bạc, xổ số, chứng khoán · bàn tay người thật (Hitler, Napoleon…) · đoán nhân phẩm qua cái bắt tay.
8. **Đổi tên cho an toàn:** "đường Sức khoẻ" → **đường Thủy tinh (giao tế)**; "đường Hôn nhân" → **đường Tình duyên**; "Sinh đạo" giữ tên nhưng định nghĩa là **sinh lực & nhịp sống**, không phải tuổi thọ.

---

## 2. Quy ước quan sát

### 2.1 Xem tay nào
Ba cách trong sách:
- **Nam tả nữ hữu** (truyền thống, DVT nêu và phản biện).
- **Tay thuận = bản thân, ý chí, hiện tại; tay kia = phần bẩm sinh** (DVT, "khoa học hơn nam tả nữ hữu vì có người thuận tay trái").
- **Đan hai tay tự nhiên, tay có ngón cái nằm dưới là tay xem chính** — tay dưới = vận hiện tại & tương lai, tay trên = tố chất trời sinh (HCM, Chương II; ~60% người có ngón cái trái nằm dưới).

**Đề xuất cho app:** mặc định hỏi *tay thuận* → tay thuận = "Hiện tại & điều đang vun đắp", tay kia = "Nền tảng bẩm sinh". Trong Cài đặt cho đổi sang "Nam tả nữ hữu" hoặc "Phép đan tay". Khi người dùng chỉ khai 1 tay → luận giải bình thường, không so sánh.

### 2.2 Cách nhìn
- Ánh sáng tự nhiên tốt hoặc đèn sáng, xoè tay tự nhiên, không gồng (TCT, JDJ).
- Muốn thấy rõ Trí đạo: xoè ngón trỏ & ngón giữa (HCM). Muốn thấy rõ Sinh đạo: cử động ngón cái (HCM).
- **Đường tham chiếu:** kẻ một đường thẳng tưởng tượng từ giữa cổ tay lên ngón giữa (HCM) — dùng để hỏi "Sinh đạo cong vượt ra ngoài đường này hay nằm trong?".
- **In tay ra giấy** (JDJ, chương "Vào giấy"): cách lưu lại để so sánh theo thời gian → app làm tương đương bằng ảnh chụp lưu trên máy (§11).
- Thứ tự quan sát gợi ý (DVT + HCM): hình bàn tay → ngón (phần "chủ động", trọng số cao hơn) → lòng bàn tay & gò → 3 đường chính → đường phụ → dấu hiệu → tổng hợp.

### 2.3 Đo ngón cái (JDJ, HCM)
Áp ngón cái sát cạnh ngón trỏ:
- Đầu ngón cái chạm **khớp giữa đốt giữa và đốt gốc** ngón trỏ → **dài**; vượt quá → rất dài.
- Chạm khoảng **1/3 đốt gốc** ngón trỏ → **trung bình**.
- Thấp hơn → **ngắn**; chưa tới gốc ngón trỏ → rất ngắn.

### 2.4 Đo ngón út
Đầu ngón út ngang **ngấn đốt trên cùng của ngón áp út** là trung bình (HCM); vượt quá → dài; thấp hơn rõ → ngắn.

---

## 3. Bảng tên gọi (alias) — dùng làm ID thống nhất

### 3.1 Các đường

| ID | Tên trong app | Tên khác trong 4 sách | Tiếng Anh | Vị trí |
|---|---|---|---|---|
| `sinh` | Sinh đạo | Sanh đạo, đường Sinh Mệnh, Địa vân | Life line | Vòng cung từ giữa ngón cái–ngón trỏ ôm gò Kim tinh xuống cổ tay |
| `tri` | Trí đạo | Đường Trí Tuệ, Nhân vân, đường ngang dưới | Head line | Từ cùng điểm với Sinh đạo (hoặc ngay trên) chạy ngang lòng bàn tay |
| `tam` | Tâm đạo | Đường Tình Cảm, Thiên vân, đường ngang trên | Heart line | Từ mép bàn tay dưới ngón út chạy về phía ngón trỏ/ngón giữa |
| `dinhmang` | Định mạng | Đường May mắn, Mạng vận, Công Danh, (Ngọc trụ) | Fate line | Đường dọc giữa lòng bàn tay, từ cổ tay hướng lên ngón giữa |
| `thaiduong` | Thái dương | Đường tài năng, tài vận | Sun / Apollo line | Đường dọc dưới ngón áp út |
| `thuytinh` | Thủy tinh (giao tế) | Đường Sức khoẻ (DVT, HCM) | Mercury line | Từ lòng bàn tay chạy chéo lên phía ngón út |
| `tinhduyen` | Tình duyên | Đường Hôn nhân | Marriage / relationship lines | Vạch ngang ngắn ở mép bàn tay, giữa gốc ngón út và Tâm đạo |
| `vongkim` | Vòng Kim tinh | Vòng đào hoa, vòng đai Vệ nữ | Girdle of Venus | Bán nguyệt trên Tâm đạo, dưới ngón giữa–áp út |
| `vongmoc` | Vòng Mộc tinh | Đường vòng cung dưới ngón trỏ | Ring of Solomon | Vòng cong trên gò Mộc tinh |
| `vienDu` | Đường Viễn du | Đường du lịch, lữ hành, xuất ngoại, đi xa | Travel lines | Vạch từ mép ngoài (gò Thái âm) vào trong, hoặc nhánh tách từ Sinh đạo |
| `thuongthang` | Đường Thượng thăng | Đường hy vọng | Effort / ascending line | Nhánh từ Sinh đạo đi lên phía ngón trỏ |
| `trucgiac` | Đường Trực giác | — | Intuition line | Cung từ gò Thái âm lên gò Thủy tinh |
| `cantro` | Đường cản trở | Đường chắn | Worry / interference lines | Vạch từ gò Kim tinh cắt qua Sinh đạo (đôi khi tới Định mạng) |
| `anhhuong` | Đường ảnh hưởng | Đường nhân duyên | Influence line | Vạch từ gò Thái âm nhập vào Định mạng |
| `camtay` | Vòng cườm tay | Ngấn cổ tay | Rascettes | Các ngấn ngang ở cổ tay (chỉ dùng để định vị, **không luận giải**) |

### 3.2 Các gò và Cửu cung bát quái

Vị trí Cửu cung lấy theo TCT (Phần hai, Chương Một, mục "Phân khu cửu cung bát quái của bàn tay", thuộc **Hậu thiên bát quái**). Ngũ hành theo TCT.

| ID gò | Gò (Tây) | Vị trí | Cung bát quái (Đông) | Ngũ hành | Chủ đề chính |
|---|---|---|---|---|---|
| `kim` | Kim tinh (Venus) | Gốc ngón cái, trong vòng Sinh đạo | **Cấn** | Thổ | Sức sống, tình cảm, sự ấm áp |
| `moc` | Mộc tinh (Jupiter) | Dưới ngón trỏ | **Tốn** | Mộc | Chí hướng, tự tin, khả năng dẫn dắt |
| `tho` | Thổ tinh (Saturn) | Dưới ngón giữa | **Ly** (Ly = gốc ngón giữa + ½ gốc áp út) | Hỏa | Nhẫn nại, trách nhiệm, chiều sâu |
| `thaiduong` | Thái dương (Apollo) | Dưới ngón áp út | Ly (½) – **Khôn** (½) | Hỏa/Thổ | Cái đẹp, tài năng, sự công nhận |
| `thuy` | Thủy tinh (Mercury) | Dưới ngón út | **Khôn** (Khôn = ½ gốc áp út + toàn bộ gốc ngón út) | Thổ | Giao tiếp, buôn bán, ứng biến |
| `thaiam` | Thái âm / Nguyệt tinh (Moon) | Mép ngoài lòng bàn tay, sát cổ tay | **Càn** (+ ½ Khảm) | Kim | Tưởng tượng, sáng tạo, đi xa |
| `hoaduong` | Hỏa tinh dương / thứ nhất (Mars +) | Giữa gò Kim và gò Mộc, phía trong ngón cái (hổ khẩu) | **Chấn** | Mộc | Dũng khí, xông xáo |
| `hoaam` | Hỏa tinh âm / thứ hai (Mars −) | Mép ngoài, giữa gò Thủy và gò Thái âm | **Đoài** | Kim | Bền bỉ, giữ vững lập trường |
| `donghoa` | Đồng Hỏa tinh (Plain of Mars) | Giữa lòng bàn tay | **Minh Đường** | Hỏa (theo TCT) | Điều tiết, giữ thăng bằng |
| `kham` | — (TCT: "cung Địa") | Chính giữa phần gốc bàn tay, sát cổ tay | **Khảm** | Thủy | Căn cơ, nền tảng |

Ghi chú:
- DVT: hai gò Hỏa âm–dương giữ thăng bằng ý chí; cả hai trũng → chí hướng giảm, cả hai quá nảy → dễ quá đà; Đồng Hỏa tinh là "cái khoá" kiểm soát và thường trũng khi hai gò kia nảy nở.
- DVT: mỗi gò "chiếu" một vùng xuống tới Sinh đạo; dấu hiệu nằm trong vùng chiếu chịu ảnh hưởng của gò đó.
- TCT nêu cổ thuyết: **Tốn – Ly – Khôn lần lượt chủ niên thiếu – trung niên – lão niên, mỗi cung ~25 năm**; Khôn là "phúc đức, Mẹ"; Khảm là "căn cứ, cửa biển"; cung đầy đặn, sáng, không vân loạn là tốt; Minh Đường có vân dạng góc/vuông được xem là quý. Chính TCT nhận xét phân khu cửu cung "còn thô" và khác nhau giữa các nhà → app chỉ dùng **làm lớp hiển thị văn hoá** (§13), luận giải gò vẫn dùng bảng §6.

---

## 4. Mã chủ đề, mức, TTS

| Mã | Chủ đề | | Mã | Chủ đề |
|---|---|---|---|---|
| `tc` | Tính cách | | `tl` | Tài lộc, tiền bạc |
| `tt` | Trí tuệ, cách nghĩ | | `ss` | Sức sống, nhịp sống (không phải sức khoẻ y học) |
| `tcm` | Tình cảm, các mối quan hệ | | `gt` | Giao tiếp, xã hội |
| `sn` | Sự nghiệp, công danh | | `st` | Sáng tạo, nghệ thuật |
| `dx` | Đi xa, môi trường mới | | | |

- **Mức:** `+` thuận lợi · `=` trung tính · `!` lưu ý (luôn kèm gợi ý hành động).
- **TTS:** `✓` thầy đọc thành lời · `✗` chỉ hiện chữ, caption "(Phần này con xem chữ trên màn hình)".
- **Trọng số** (cột không ghi = 2): 3 = đường chính/đặc điểm rõ; 1 = dấu nhỏ.

Các bảng §5–§9 có cùng 7 cột `ID | Đặc điểm | Luận giải | Chủ đề | Mức | TTS | Nguồn` để script sinh JSON (§14).

---

## 5. Bàn tay, ngón tay, vân tay, móng

### 5.1 Hình dáng và khuôn khổ bàn tay

| ID | Đặc điểm | Luận giải | Chủ đề | Mức | TTS | Nguồn |
|---|---|---|---|---|---|---|
| H01 | Bàn tay vuông: lòng bàn tay và đầu ngón đều vuông | Thực tế, ngăn nắp, làm đâu chắc đó. Hợp với việc cần quy trình rõ ràng. | tc,sn | + | ✓ | JDJ, HCM, DVT |
| H02 | Bàn tay chữ nhật: dài hơn rộng, đầu ngón vuông | Có nghị lực và óc khoa học kỹ thuật, thích hiểu tận gốc vấn đề trước khi làm. | tc,tt | + | ✓ | JDJ |
| H03 | Bàn tay thon nhọn (tam giác): ngón thon, đầu ngón nhọn | Nhạy cảm, trực giác tốt, thiên về văn hoá nghệ thuật. Nên biến ý tưởng thành kế hoạch cụ thể. | tc,st | + | ✓ | JDJ, HCM, DVT |
| H04 | Bàn tay bè: đầu ngón loe rộng như cái bay | Năng động, nhiều sáng kiến, làm nhanh. Học thêm sự kiên nhẫn sẽ đi được xa hơn. | tc,sn | = | ✓ | DVT, JDJ |
| H05 | Bàn tay tròn đầy: ngón tròn, lòng tròn, phần gần cổ tay đầy | Ưa ổn định, thực tế, chậm mà chắc, hiếu khách và dễ gần. | tc,gt | = | ✓ | JDJ, HCM |
| H06 | Bàn tay xương khớp: ít thịt, ngón dài, khớp nổi | Suy nghĩ chín chắn, thích lý lẽ và nguyên tắc; đôi khi hơi giữ ý kiến. | tc,tt | = | ✓ | HCM, DVT |
| H07 | Bàn tay phối hợp: lòng một dạng, ngón một dạng khác | Đa năng, linh hoạt, làm được nhiều việc. Chọn một hướng chính sẽ phát huy tốt nhất. | tc,sn | + | ✓ | JDJ |
| H08 | Bàn tay to so với vóc người | Bền bỉ, kỹ lưỡng, chậm mà chắc; ít bộc lộ cảm xúc ra ngoài. | tc | = | ✓ | DVT, JDJ, HCM |
| H09 | Bàn tay nhỏ so với vóc người | Nhanh nhẹn, khéo léo, nhận thức nhanh; đôi lúc hành động theo hứng. | tc | = | ✓ | DVT, JDJ |
| H10 | Bàn tay dài | Kín đáo, cân nhắc kỹ, sống nhiều về nội tâm; có lúc do dự. | tc | = | ✓ | DVT, JDJ |
| H11 | Bàn tay rộng | Hướng ngoại, nhiều hoài bão, thích mở rộng phạm vi hoạt động. | tc,sn | + | ✓ | JDJ |
| H12 | Tay cứng, chắc khi nắm | Quyết đoán, chuộng hành động, không ngại va chạm. Lắng nghe thêm sẽ thuận lợi hơn. | tc | = | ✓ | JDJ |
| H13 | Tay mềm, dẻo | Giàu tưởng tượng, uyển chuyển, sống bằng cảm xúc; dễ phân vân khi phải chọn. | tc,st | = | ✓ | JDJ, DVT |
| H14 | Tay thường ấm | Nhiệt tình, dễ đồng cảm, để trái tim dẫn đường. | tc,tcm | + | ✓ | JDJ, HCM |
| H15 | Tay thường mát | Điềm tĩnh, để lý trí điều tiết cảm xúc, ít khi nóng vội. | tc | = | ✓ | JDJ, HCM |
| H16 | Lòng bàn tay đầy đặn, đàn hồi | Hoạt bát, rõ ràng, sinh lực tốt. | ss,tc | + | ✓ | DVT, JDJ |
| H17 | Lòng bàn tay trũng sâu ở giữa | Dễ sốt ruột khi việc chậm. Giữ nhịp đều và quản lý chi tiêu cẩn thận sẽ vững hơn. | tc,tl | ! | ✓ | DVT |
| H18 | Lòng bàn tay mỏng, phẳng | Kín đáo, ít phô bày. Nên chủ động nạp lại năng lượng bằng nghỉ ngơi và vận động. | tc,ss | ! | ✓ | DVT, JDJ |

### 5.2 Ngón tay

| ID | Đặc điểm | Luận giải | Chủ đề | Mức | TTS | Nguồn |
|---|---|---|---|---|---|---|
| F01 | Ngón cái dài (xem §2.3) | Ý chí mạnh, tự trọng, theo đuổi mục tiêu bền bỉ, có tố chất dẫn dắt. | tc,sn | + | ✓ | HCM, JDJ, DVT |
| F02 | Ngón cái ngắn | Giàu cảm hứng, linh hoạt, nắm cơ hội nhanh. Rèn thêm sự bền bỉ sẽ đi đến cùng. | tc | = | ✓ | HCM, DVT |
| F03 | Ngón cái dang xa ngón trỏ khi xoè tự nhiên | Phóng khoáng, cởi mở, dễ đón nhận cái mới. | tc,gt | + | ✓ | DVT |
| F04 | Ngón cái khép sát ngón trỏ | Thận trọng, dè dặt, thích giữ mình trước khi tin người. | tc | = | ✓ | DVT |
| F05 | Đốt trên ngón cái (ý chí) to, dài hơn đốt giữa (lý lẽ) | Hành động mạnh hơn suy xét. Dừng lại cân nhắc một nhịp trước việc lớn. | tc | ! | ✓ | DVT, JDJ |
| F06 | Đốt giữa ngón cái dài hơn đốt trên | Nhiều kế hoạch, suy xét kỹ. Biến kế hoạch thành bước làm cụ thể là chìa khoá. | tc,tt | = | ✓ | DVT, JDJ |
| F07 | Ngón cái dẻo, uốn được ra sau | Hào hiệp, dễ thích nghi, hay bênh người yếu; đôi khi thiếu kiên nhẫn. | tc | = | ✓ | DVT |
| F08 | Ngón trỏ dài hơn ngón áp út | Tự tin, tự chủ, không dễ bỏ cuộc, được người khác tin tưởng. | tc,sn | + | ✓ | HCM, DVT |
| F09 | Ngón trỏ ngắn hơn ngón áp út (phổ biến nhất) | Hoà nhã, dĩ hoà vi quý, thích nghi tốt với nhiều hoàn cảnh. | tc,gt | + | ✓ | HCM |
| F10 | Ngón trỏ gần bằng ngón áp út | Độc lập, có chính kiến, nội tâm sâu nên người khác cần thời gian để hiểu. | tc | = | ✓ | HCM |
| F11 | Ngón áp út dài trội | Óc thẩm mỹ, yêu nghệ thuật, hay quyết theo cảm nhận. | st,tc | + | ✓ | HCM, DVT |
| F12 | Ngón giữa dài, thẳng, cứng cáp | Nghiêm túc, chín chắn, có trách nhiệm từ sớm. | tc | + | ✓ | HCM, DVT |
| F13 | Ngón giữa ngắn | Thích tự do, ứng biến nhanh; nên đặt mục tiêu rõ để không bị phân tán. | tc | = | ✓ | DVT |
| F14 | Ngón út dài (vượt ngấn đốt trên ngón áp út) | Diễn đạt tốt, giỏi giao tiếp và quan sát, có sức hút trong đám đông. | gt | + | ✓ | DVT, HCM |
| F15 | Ngón út ngắn | Giao tiếp chọn lọc, thích hành động hơn lời nói. | gt | = | ✓ | DVT |
| F16 | Các ngón dài so với lòng bàn tay | Tỉ mỉ, ngăn nắp, bền chí nên thường thành công chắc chắn. | tc | + | ✓ | DVT, JDJ |
| F17 | Các ngón ngắn so với lòng bàn tay | Nắm tổng thể nhanh, quyết nhanh; chú ý chi tiết để tránh vội vàng. | tc | = | ✓ | DVT |
| F18 | Khớp ngón nổi rõ (mấu gút) | Thích phân tích, lý luận, cân nhắc kỹ trước khi làm. | tt | + | ✓ | DVT, HCM, JDJ |
| F19 | Ngón nhẵn, khó thấy khớp | Trực giác và cảm hứng dẫn đường, có khiếu nghệ thuật. | st | + | ✓ | DVT, HCM |
| F20 | Xoè tự nhiên, ngón giữa và ngón út nghiêng về ngón áp út | Có năng khiếu nghệ thuật. | st | + | ✓ | DVT |
| F21 | Xoè tự nhiên, ngón áp út nghiêng về ngón trỏ | Chăm chỉ, cần mẫn, làm việc đến nơi đến chốn. | sn | + | ✓ | DVT |

### 5.3 Đầu ngón tay

| ID | Đặc điểm | Luận giải | Chủ đề | Mức | TTS | Nguồn |
|---|---|---|---|---|---|---|
| T01 | Đa số đầu ngón vuông | Thực tế, chọn việc thiết thực, dễ thành công trong công việc cụ thể. | tc,sn | + | ✓ | DVT, JDJ |
| T02 | Đa số đầu ngón nhọn | Nhiều mơ ước, giỏi tạo thiện cảm. Cần một người bạn thực tế đồng hành. | tc,gt | = | ✓ | DVT, JDJ |
| T03 | Đa số đầu ngón tròn | Ôn hoà, nhân hậu, điềm đạm; đôi khi phân vân lâu. | tc | = | ✓ | DVT, JDJ |
| T04 | Đa số đầu ngón bè | Năng động, nhiều sáng kiến, làm nhanh; giữ bình tĩnh khi bị cản trở. | tc,sn | = | ✓ | DVT, JDJ |

### 5.4 Vân tay đầu ngón

Bốn loại (HCM, Chương IV-C): **móng thú** (loop, phổ biến nhất), **xoáy nước** (whorl, xoáy trôn ốc), **cung** (arch, hình núi, hiếm), **hỗn hợp**.

| ID | Đặc điểm | Luận giải | Chủ đề | Mức | TTS | Nguồn |
|---|---|---|---|---|---|---|
| P01 | Đa số (≥ 4 ngón) vân móng thú | Ôn hoà, hoà hợp với mọi người; nhớ dành thời gian cho chính mình vì hay cố chiều lòng người khác. | tc,gt | + | ✓ | HCM |
| P02 | Đa số (≥ 4 ngón) vân xoáy | Cá tính, độc lập, linh cảm mạnh, có sức hút với những điều huyền bí. | tc | + | ✓ | HCM |
| P03 | Có vân cung | Nghiêm chỉnh, hăng hái, đáng tin cậy. | tc | + | ✓ | HCM |
| P04 | Rất ít vân xoáy | Người thực tế, mạnh ở việc làm từng bước chắc chắn. | tc | = | ✓ | DVT |
| P05 | Vân xoáy tụ giữa ngón cái | Tự tin, khéo léo, có tài đứng ra điều phối công việc. | sn | + | ✓ | DVT |
| P06 | Vân xoáy tụ giữa ngón trỏ | Nhiều may mắn trong công việc, cơ hội đến từ chỗ không ngờ. | sn,tl | + | ✓ | DVT |
| P07 | Vân xoáy tụ giữa ngón áp út | Có khả năng mỹ thuật, thành quả đến về sau. | st | + | ✓ | DVT |
| P08 | Vân xoáy tụ giữa ngón út | Sự nghiệp dễ phát triển khi làm việc ở môi trường xa hoặc với nước ngoài. | sn,dx | + | ✓ | DVT |

**Tổ hợp vân tay (HCM, 30 trường hợp)** — chỉ áp dụng khi 5 ngón của một tay chỉ gồm *móng thú* và *xoáy*. Trường hợp khác dùng P01–P03.

| ID | Ngón mang vân **móng thú** (còn lại xoáy) | Luận giải | Chủ đề | Mức | TTS | Nguồn |
|---|---|---|---|---|---|---|
| V01 | Chỉ ngón cái | Năng lực cao hơn mặt bằng nhưng dễ nóng vội, căng thẳng. Làm chậm lại sẽ ít sai hơn. | tc | = | ✓ | HCM |
| V02 | Chỉ ngón trỏ | Yêu ai là hết lòng, rất tôn trọng người mình thương. Nên tách bạch chuyện tình và chuyện việc. | tcm | + | ✓ | HCM |
| V03 | Chỉ ngón giữa | Thành thật, tự tin, sẵn lòng giúp người. Giữ chừng mực để không bị lợi dụng. | tc,gt | + | ✓ | HCM |
| V04 | Chỉ ngón áp út | Hài hoà, xã giao rộng, tinh thần cầu thị nên làm việc hiệu quả. | gt,sn | + | ✓ | HCM |
| V05 | Chỉ ngón út | Ghét tranh chấp, thích bình ổn, giỏi hoà giải bất đồng giữa mọi người. | gt | + | ✓ | HCM |
| V06 | Trỏ – giữa – áp út | Cẩn thận, có nhân cách, quyết tâm cao; đôi khi ít nhân nhượng với bạn bè. | tc | = | ✓ | HCM |
| V07 | Trỏ – giữa – út | Thành đạt nhiều hơn sau tuổi trung niên. Lúc trẻ gặp khó đừng nản. | sn | = | ✓ | HCM |
| V08 | Cái – giữa – út | Tự lập, ý chí kiên cường, không khuất phục khó khăn; mềm mỏng hơn sẽ ít va chạm. | tc | + | ✓ | HCM |
| V09 | Cái – giữa – áp út | Chắc mới làm nên cuộc sống vững vàng, đôi khi bỏ lỡ cơ hội vì quá cẩn thận. | tc | = | ✓ | HCM |
| V10 | Cái – trỏ – út | Thích đổi mới, nhạy với thương trường, giàu sáng tạo; dễ chán khi bị gò bó. | sn | + | ✓ | HCM |
| V11 | Cái – trỏ – áp út | Chính kiến mạnh. Lắng nghe ý người khác sẽ được nhiều thiện cảm hơn. | tc,gt | ! | ✓ | HCM |
| V12 | Trỏ – áp út – út | Tự lập sớm. Ổn định một nghề và mở rộng quan hệ sẽ giúp cuộc sống vững hơn. | sn | ! | ✓ | HCM |
| V13 | Cái – áp út – út | Giữ nguyên tắc, coi trọng đạo đức; bớt so sánh với người khác sẽ nhẹ lòng hơn. | tc | = | ✓ | HCM |
| V14 | Giữa – áp út – út | Duy mỹ, cảm thụ nghệ thuật tốt. Tự tin và thực tế hơn sẽ ít bị cô lập. | st | = | ✓ | HCM |
| V15 | Cái – trỏ – giữa | Nhạy bén, hoạt ngôn, có duyên và hài hước; tránh chủ quan khi xem nhẹ người khác. | gt | = | ✓ | HCM |

| ID | Ngón mang vân **xoáy** (còn lại móng thú) | Luận giải | Chủ đề | Mức | TTS | Nguồn |
|---|---|---|---|---|---|---|
| V16 | Chỉ ngón cái | Thời trẻ nhiều thử thách nhưng không bi quan; công sức bỏ ra càng nhiều, thành quả về sau càng lớn. | sn | + | ✓ | HCM |
| V17 | Chỉ ngón trỏ | Xã giao rộng, chu đáo với người khác, chín chắn trước tuổi nên được quý mến. | gt | + | ✓ | HCM |
| V18 | Chỉ ngón giữa | Linh hoạt, làm việc gì cũng được việc; cẩn trọng lời nói để giữ uy tín. | sn | + | ✓ | HCM |
| V19 | Chỉ ngón áp út **(cần đối chiếu: OCR ghi "ngón út" trùng với V20)** | Rộng rãi, có sức hút, biết nắm cơ hội và được xung quanh hỗ trợ. | gt,sn | + | ✓ | HCM |
| V20 | Chỉ ngón út | Nhiều hoài bão, không ngại thử thách. Quyết đoán hơn, bớt phụ thuộc ý kiến người khác. | tc | ! | ✓ | HCM |
| V21 | Trỏ – giữa – áp út | Chất phác, tâm tốt; càng lớn tuổi càng chân thành và được kính nể. | tc | + | ✓ | HCM |
| V22 | Trỏ – giữa – út | Đôn hậu, mến khách; về sau thành công nhiều hơn lúc khởi đầu. | gt | + | ✓ | HCM |
| V23 | Cái – giữa – út | Nóng nảy, hay tự quyết một mình. Mềm mỏng và tôn trọng tập quán nơi mình sống sẽ bớt phiền. | tc | ! | ✓ | HCM |
| V24 | Cái – giữa – áp út | Bình tĩnh, quyết đoán, thành thật, có năng lực lãnh đạo và gắn kết mọi người. | sn | + | ✓ | HCM |
| V25 | Cái – trỏ – út | Khao khát tự do, hợp nghề tự do và lối sống thong dong. | sn | = | ✓ | HCM |
| V26 | Cái – trỏ – áp út **(cần đối chiếu: sách in trùng nội dung với V22)** | Đôn hậu, có trực giác tốt khi giải quyết việc. | tc | + | ✓ | HCM |
| V27 | Trỏ – áp út – út | Thiên về khoa học xã hội hơn tự nhiên; tập nhìn xa hơn việc trước mắt. | tt | = | ✓ | HCM |
| V28 | Cái – áp út – út | Chu đáo, bền bỉ nên được tin cậy; đừng tự tạo áp lực quá mức. | sn | + | ✓ | HCM |
| V29 | Giữa – áp út – út | Hoạt bát, có duyên, nhiều ước mơ thành hiện thực nếu không tự mãn. | gt | + | ✓ | HCM |
| V30 | Cái – trỏ – giữa | Cảm xúc dao động giữa rất tự tin và bi quan. Tập giữ thăng bằng tâm lý. | tc | ! | ✓ | HCM |

### 5.5 Móng tay (chỉ dùng hình dáng)

Toàn bộ nội dung *màu móng, vết lưỡi liềm, sọc, đốm, độ cứng ↔ bệnh* bị loại (§12).

| ID | Đặc điểm | Luận giải | Chủ đề | Mức | TTS | Nguồn |
|---|---|---|---|---|---|---|
| N01 | Móng vuông | Sức chịu đựng cao, đôi khi hơi cố chấp. | tc | = | ✓ | HCM |
| N02 | Móng tròn / bầu | Ôn hoà, đôn hậu, ít tranh chấp; chỉ nổi giận khi bị chạm lòng tự trọng. | tc | + | ✓ | HCM |
| N03 | Móng chữ nhật dài | Chín chắn, thận trọng, tuân thủ quy tắc, làm việc đâu ra đấy. | tc | + | ✓ | HCM |
| N04 | Móng hình hạnh nhân **(cần đối chiếu Hình 129 HCM)** | Mộc mạc, thành thực, lễ độ, trang nhã; hiếm khi nóng giận. | tc | + | ✓ | HCM |
| N05 | Móng nhọn (hình kiếm) | Nhiệt tình, quyết đạt mục tiêu; nhớ giữ sức và cân nhắc cái giá phải trả. | tc,sn | = | ✓ | HCM |
| N06 | Móng rộng bản | Rộng rãi, hào phóng, hứng thú mạnh; đôi khi làm theo hứng. | tc | = | ✓ | HCM, DVT |
| N07 | Móng rất ngắn | Tiết kiệm, thực tế. | tl | = | ✓ | DVT |
| N08 | Móng tam giác | Dễ nóng tính; hít thở một nhịp trước khi phản ứng. | tc | ! | ✓ | DVT |

---

## 6. Các gò

| ID | Đặc điểm | Luận giải | Chủ đề | Mức | TTS | Nguồn |
|---|---|---|---|---|---|---|
| M01 | Gò Kim tinh đầy đặn, đàn hồi | Ấm áp, giàu sức sống và tình cảm, yêu đời, hợp vận động thể thao. | ss,tcm | + | ✓ | DVT, HCM, JDJ |
| M02 | Gò Kim tinh phẳng, thấp | Tiết chế, ít bộc lộ cảm xúc. Chăm sóc năng lượng bản thân đều đặn. | ss,tcm | ! | ✓ | DVT, JDJ |
| M03 | Gò Kim tinh rất cao | Cảm xúc và mong muốn mãnh liệt; cần giữ điều độ. | tcm | = | ✓ | DVT |
| M04 | Gò Mộc tinh đầy đặn, sáng | Tự tin, có chí tiến thủ và tài điều khiển, thích đứng ra dẫn dắt. | sn,tc | + | ✓ | DVT, HCM, JDJ |
| M05 | Gò Mộc tinh quá cao | Ham danh vị; giữ khiêm tốn sẽ được lòng người hơn. | sn | ! | ✓ | DVT |
| M06 | Gò Mộc tinh phẳng | Khiêm tốn, không tranh giành, hợp vai trò hỗ trợ. | tc | = | ✓ | JDJ |
| M07 | Gò Thổ tinh vừa phải | Cẩn thận, nhẫn nại, hợp nghiên cứu, kế toán, hành chính. | sn,tt | + | ✓ | HCM, DVT |
| M08 | Gò Thổ tinh nhô cao rõ | Hay trầm tư, dễ buồn vô cớ. Chia sẻ với người thân sẽ nhẹ lòng. | tc | ! | ✓ | DVT, HCM |
| M09 | Gò Thổ tinh trũng | Đường đi có phần vất vả; kiên trì là lợi thế. | sn | ! | ✓ | DVT |
| M10 | Gò Thái dương đầy đặn | Lạc quan, yêu cái đẹp, có duyên với thành công và tiếng tăm. | st,sn | + | ✓ | DVT, HCM, JDJ |
| M11 | Gò Thái dương rất cao | Đam mê nghệ thuật, thích được chú ý. | st | = | ✓ | DVT |
| M12 | Gò Thủy tinh đầy đặn | Lanh lợi, nhớ nhanh, giỏi giao tiếp và thương lượng, nhạy kinh doanh. | gt,tl | + | ✓ | DVT, HCM, JDJ |
| M13 | Gò Thủy tinh rất cao | Khôn khéo hơn người; giữ chữ tín để sự khéo léo thành uy tín. | gt | = | ✓ | DVT |
| M14 | Gò Thái âm đầy đặn | Giàu tưởng tượng và sáng tạo, thích khám phá, có duyên đi xa. | st,dx | + | ✓ | DVT, HCM, JDJ |
| M15 | Gò Thái âm rất cao | Dễ mơ mộng xa thực tế; ghi lại ý tưởng và chọn một cái để làm. | st | ! | ✓ | DVT |
| M16 | Gò Thái âm phẳng | Thực tế, ít mơ mộng. | tc | = | ✓ | JDJ |
| M17 | Gò Hỏa tinh dương đầy | Dũng cảm, xông xáo, không ngại khó; cần thêm kiên nhẫn ở chặng dài. | tc,sn | + | ✓ | HCM, DVT |
| M18 | Gò Hỏa tinh âm đầy | Bền bỉ, giữ vững lập trường dưới áp lực. | tc | + | ✓ | HCM, DVT |
| M19 | Cả hai gò Hỏa tinh đều trũng | Năng lượng hành động dễ hụt; đặt mục tiêu nhỏ để giữ đà. | ss | ! | ✓ | DVT |
| M20 | Cả hai gò Hỏa tinh đều rất nảy | Dễ làm quá sức, quá đà; biết dừng đúng lúc là sức mạnh. | tc | ! | ✓ | DVT |
| M21 | Các gò đều nổi, cân đối | Nhiệt tình, dễ cảm xúc, năng lượng dồi dào. | tc | = | ✓ | DVT |

---

## 7. Các đường chỉ

### 7.1 Sinh đạo (`sinh`) — sinh lực & nhịp sống

> **Quy tắc:** độ dài Sinh đạo **không** liên quan tuổi thọ (HCM nói thẳng). Không bao giờ sinh câu về tuổi thọ.

| ID | Đặc điểm | Luận giải | Chủ đề | Mức | TTS | Nguồn |
|---|---|---|---|---|---|---|
| SD01 | Rõ, sâu, liền mạch | Sức bền tốt, hồi phục nhanh, nhiệt thành và lạc quan. | ss | + | ✓ | DVT, JDJ, HCM |
| SD02 | Cong rộng, vượt ra ngoài đường tham chiếu cổ tay–ngón giữa | Năng lượng dồi dào, mệt mấy cũng mau lấy lại sức, hướng ngoại. | ss,tc | + | ✓ | HCM |
| SD03 | Vòng hẹp, ôm sát gốc ngón cái | Tiết chế, thận trọng, thích ổn định. Vận động và mở lòng nhiều hơn sẽ thêm sinh khí. | ss,tc | = | ✓ | DVT, HCM |
| SD04 | Mờ, mảnh | Nhạy cảm, dễ mệt khi làm dồn. Giữ nhịp nghỉ ngơi đều đặn. | ss | ! | ✓ | DVT, HCM |
| SD05 | Dạng dây xích, nhiều đoạn nhỏ nối nhau | Giai đoạn hay lo nghĩ, năng lượng lúc lên lúc xuống. Ưu tiên chăm sóc bản thân. | ss | ! | ✓ | DVT, HCM |
| SD06 | Đứt đoạn | Dấu mốc thay đổi lớn trong nếp sống (nơi ở, công việc, hướng đi). | ss,sn | = | ✓ | HCM |
| SD07 | Đứt nhưng có đoạn chồng lên hoặc hình vuông bao chỗ đứt | Có lực đỡ để vượt qua giai đoạn chuyển tiếp thuận lợi. | ss | + | ✓ | DVT, HCM |
| SD08 | Có Sinh đạo đôi hoặc đường song hành phía trong | Sức bền và sự hậu thuẫn mạnh, có người hoặc điều gì đó luôn nâng đỡ. | ss | + | ✓ | DVT, HCM |
| SD09 | Nhánh từ Sinh đạo đi lên phía ngón trỏ (đường Thượng thăng) | Cầu tiến, chăm chỉ, nỗ lực được cấp trên ghi nhận; mọi việc dễ suôn sẻ. | sn | + | ✓ | HCM, DVT |
| SD10 | Nhánh từ Sinh đạo đi lên phía ngón giữa | Nỗ lực bền bỉ đem lại danh dự. | sn | + | ✓ | DVT |
| SD11 | Nhánh từ Sinh đạo đi về phía ngón út | Thuận lợi cho buôn bán, kinh doanh. | tl,sn | + | ✓ | DVT |
| SD12 | Cuối Sinh đạo tách một nhánh dài về phía gò Thái âm | Có duyên đi xa, học tập hoặc làm việc ở nơi mới, đem về kinh nghiệm quý. | dx | + | ✓ | HCM, DVT |
| SD13 | Điểm khởi đầu cao, gần ngón trỏ | Nhiều hoài bão, tự tin, thích vươn lên. | tc | + | ✓ | DVT |
| SD14 | Điểm khởi đầu thấp, gần ngón cái | Điềm đạm, an phận, ít bon chen. | tc | = | ✓ | DVT |
| SD15 | Đoạn đầu nhiều vạch cắt hoặc dạng xích | Tuổi nhỏ có nhiều xáo trộn; chính điều đó rèn nên sự cứng cỏi. | ss | = | ✓ | DVT, HCM |
| SD16 | Nhiều vạch ngắn cắt ngang thân đường | Hay gặp trở ngại nhỏ trong kế hoạch. Tập thói quen chuẩn bị phương án dự phòng. | sn | ! | ✓ | DVT, HCM |
| SD17 | Ngôi sao ở cuối đường | Về sau sung túc, an vui. | tl | + | 1 ✓ | DVT |
| SD18 | Ngôi sao hoặc chữ thập ở đầu đường | Khởi đầu vất vả nhưng tương lai tốt lành. | sn | = | ✓ | DVT |
| SD19 | Có cù lao (hình đảo) | Một giai đoạn áp lực, hao năng lượng; thường qua đi khi nhịp sống ổn định lại. | ss | ! | ✓ | DVT, HCM |
| SD20 | Từ gò Kim tinh có vạch cắt qua Sinh đạo (đường cản trở) | Có lúc chịu áp lực từ gia đình hoặc người thân; nói chuyện thẳng thắn sẽ gỡ được. | tcm | ! | ✓ | DVT, HCM |

*Cột trọng số:* SD17 ghi `1 ✓` nghĩa là trọng số 1 và TTS ✓ — script tách số ở đầu ô TTS.

### 7.2 Trí đạo (`tri`) — cách nghĩ

| ID | Đặc điểm | Luận giải | Chủ đề | Mức | TTS | Nguồn |
|---|---|---|---|---|---|---|
| TD01 | Rõ, sâu, đậm | Trí nhớ tốt, tập trung, xử lý khôn ngoan. | tt | + | ✓ | DVT |
| TD02 | Thẳng ngang | Nhìn sự việc thực tế, logic, làm nhanh và gọn, hợp công việc chuyên môn. | tt,sn | + | ✓ | HCM |
| TD03 | Cong nhẹ xuống | Sáng tạo, giàu tưởng tượng. | tt,st | + | ✓ | HCM, DVT |
| TD04 | Cong sâu xuống tới gò Thái âm | Lãng mạn, nghệ sĩ tính, trực giác mạnh. Neo ý tưởng vào việc cụ thể để thành quả. | st | + | ✓ | HCM, DVT |
| TD05 | Dài tới gần mép bàn tay | Trực giác nhạy bén, có thể thành công ở nhiều lĩnh vực. | tt | + | ✓ | HCM |
| TD06 | Dài vừa, dừng khoảng dưới ngón áp út | Dễ thích nghi, hoà hợp với nhiều kiểu người. | tt,gt | + | ✓ | HCM |
| TD07 | Ngắn, dừng dưới ngón giữa | Quyết nhanh, thực dụng, mạnh ở việc trước mắt. Lập thêm kế hoạch dài hơi sẽ vững. | tt | = | ✓ | HCM, DVT |
| TD08 | Cuối đường chẻ đôi | Nhìn vấn đề nhiều góc, giỏi lý luận, viết lách. | tt,st | + | ✓ | DVT, HCM |
| TD09 | Đầu đường phân 3 nhánh trở lên | Thích ứng cao, nhiều tài, năng lực hơn mặt bằng. | tt | + | ✓ | HCM |
| TD10 | Có hai đường Trí đạo | Đa tài, làm nhiều việc song song một cách hứng thú. | tt,sn | + | ✓ | HCM |
| TD11 | Uốn lượn | Linh hoạt, năng động nhưng hay đổi ý; ghi lại quyết định giúp giữ hướng. | tt | = | ✓ | DVT, HCM |
| TD12 | Dạng dây xích | Dễ phân tán khi áp lực. Cho trí óc nghỉ ngơi định kỳ. | tt | ! | ✓ | DVT, HCM |
| TD13 | Có cù lao | Giai đoạn suy nghĩ nhiều, căng thẳng; sẽ nhẹ đi khi bớt ôm việc. | tt | ! | ✓ | DVT, HCM |
| TD14 | Khởi đầu cao từ gò Mộc tinh | Tự tin, nhiều chí hướng, có tố chất lãnh đạo; giữ sự khiêm tốn. | tt,sn | + | ✓ | DVT, HCM |
| TD15 | Đầu đường dính với Sinh đạo một đoạn | Thận trọng, cân nhắc kỹ trước khi hành động, gắn bó với gia đình. | tc | = | ✓ | HCM, DVT |
| TD16 | Tách hẳn khỏi Sinh đạo (có khe hở) | Độc lập, tự tin, tự quyết, dám nghĩ dám làm. | tc | + | ✓ | DVT, HCM |
| TD17 | Có nhánh nhỏ hướng lên ở đoạn đầu | Nỗ lực bền bỉ để đạt điều mình muốn. | sn | + | ✓ | HCM |
| TD18 | Cuối đường cong lên về phía gò Thái dương | Yêu thích và có năng khiếu nghệ thuật. | st | + | ✓ | DVT |
| TD19 | Đứt đoạn | Giai đoạn đổi cách nghĩ, đổi hướng học tập hoặc nghề nghiệp. | tt,sn | = | ✓ | HCM (nguyên tắc đường đứt) |

### 7.3 Tâm đạo (`tam`) — tình cảm & cách đối đãi

| ID | Đặc điểm | Luận giải | Chủ đề | Mức | TTS | Nguồn |
|---|---|---|---|---|---|---|
| TAM01 | Kết thúc giữa ngón trỏ và ngón giữa, cong tự nhiên | Chu đáo, nhã nhặn, ghét tranh chấp, biết nhường nhịn và vun vén hạnh phúc. | tcm | + | ✓ | HCM, DVT |
| TAM02 | Kéo dài tới gốc ngón trỏ | Điềm tĩnh, tự trọng, lý tưởng cao trong tình cảm; chậm bộc lộ nên dễ bị hiểu là lạnh. | tcm | = | ✓ | HCM |
| TAM03 | Chạy suốt ngang bàn tay | Tình cảm mãnh liệt, yêu ghét rõ ràng, đã thương là hết lòng. | tcm | = | ✓ | DVT |
| TAM04 | Ngắn, dừng dưới ngón giữa | Thực tế trong tình cảm, ít nói lời yêu thương; nói ra nhiều hơn sẽ gần nhau hơn. | tcm | ! | ✓ | DVT, HCM |
| TAM05 | Cong vút lên ngón giữa | Coi trọng bản thân trong tình cảm; lắng nghe cảm xúc người kia để giữ bền. | tcm | ! | ✓ | HCM |
| TAM06 | Gần như thẳng | Lý trí, điềm tĩnh trong tình cảm, có sức hút riêng. | tcm | = | ✓ | HCM |
| TAM07 | Cuối đường chẻ đôi hoặc chẻ ba | Giàu tình cảm, quan tâm người thân, hết lòng với người mình quý. | tcm,gt | + | ✓ | DVT, HCM |
| TAM08 | Nhiều nhánh nhỏ hướng lên | Vui vẻ, có trách nhiệm trong tình cảm, nhân duyên tốt. | tcm | + | ✓ | HCM |
| TAM09 | Nhiều nhánh nhỏ hướng xuống | Tận tâm với người mình thương nhưng dễ cả tin; giữ chút tỉnh táo. | tcm | ! | ✓ | HCM |
| TAM10 | Dạng dây xích hoặc răng cưa | Cảm xúc nhiều thăng trầm. Tập gọi tên cảm xúc trước khi phản ứng. | tcm | ! | ✓ | DVT, JDJ |
| TAM11 | Có cù lao | Một giai đoạn tình cảm vướng mắc hoặc chưa được ủng hộ; thường qua đi. | tcm | ! | ✓ | DVT, HCM |
| TAM12 | Nằm sát Trí đạo | Hay cân nhắc, để lý trí dẫn dắt tình cảm. | tcm,tt | = | ✓ | DVT |
| TAM13 | Đi xuống chạm hoặc nhập vào Trí đạo | Vị tha, bác ái, được nhiều người thương mến; học cách từ chối để không bị lợi dụng. | tcm,gt | + | ✓ | DVT |
| TAM14 | Có hai đường Tâm đạo song song | Tình cảm dồi dào, thuỷ chung. | tcm | + | ✓ | DVT |
| TAM15 | Đứt đoạn, có nhiều vân nhỏ | Tâm tính vui vẻ nhưng cảm xúc thay đổi theo giai đoạn. | tcm | = | ✓ | HCM |
| TAM16 | Có nhánh hướng về gò Thủy tinh | Thuận lợi phát triển nghề nghiệp và buôn bán. | sn,tl | + | ✓ | DVT |
| TAM17 | Có nhánh nhỏ tách ra ở mé dưới đường | Tâm địa tốt, sẵn lòng giúp người lúc khó; đôi khi dễ bị ý kiến người khác chi phối. | gt | + | ✓ | HCM |

### 7.4 Định mạng (`dinhmang`) — con đường sự nghiệp

| ID | Đặc điểm | Luận giải | Chủ đề | Mức | TTS | Nguồn |
|---|---|---|---|---|---|---|
| DM01 | Rõ, thẳng, dài lên tới ngón giữa | Định hướng rõ, trung thực, giỏi tính đường dài; sự nghiệp phát triển vững. | sn | + | 3 ✓ | HCM, DVT |
| DM02 | Xuất phát từ cổ tay | Tự lập sớm. | sn | + | ✓ | DVT |
| DM03 | Xuất phát từ hoặc dính với Sinh đạo | Độc lập, chín chắn, tự bồi dưỡng năng lực để đi lên. | sn | + | ✓ | HCM |
| DM04 | Xuất phát từ gò Thái âm | Thành công nhờ quý nhân, công chúng hoặc môi trường xa quê. | sn,dx | + | ✓ | DVT, HCM |
| DM05 | Xuất phát từ gò Kim tinh | Người thân, gia đình tiếp sức cho sự nghiệp. | sn,tcm | + | ✓ | DVT |
| DM06 | Bắt đầu từ giữa lòng bàn tay | Thành quả đến nhờ nỗ lực bản thân, thuận với lĩnh vực sáng tạo, văn chương. | sn,st | + | ✓ | DVT |
| DM07 | Chỉ rõ ở đoạn trên | Có tài nhưng thành đạt muộn; thực lực phát huy mạnh sau tuổi 30. | sn | = | ✓ | HCM |
| DM08 | Ngắn, đoạn trên không rõ | Năng nổ, thành công sớm trước 30; nhìn xa hơn để giữ được thành quả. | sn | = | ✓ | HCM |
| DM09 | Đứt đoạn, chắp nối | Đa năng, nhiều lần đổi việc hoặc đổi hướng. | sn | = | ✓ | HCM, DVT |
| DM10 | Đứt nhưng đoạn mới bắt đầu trước khi đoạn cũ dứt (hướng về phía ngón cái) | Biết nắm cơ hội chuyển đổi và thường thành công ở vị trí mới. | sn | + | ✓ | HCM |
| DM11 | Hơi cong | Nhân duyên tốt, được nhiều người mến mộ, hợp nghề tiếp xúc công chúng. | sn,gt | + | ✓ | HCM |
| DM12 | Chạy hết lên gò Thổ tinh | Phải bền bỉ qua thử thách mới thành; thành công đó rất vững. | sn | = | ✓ | DVT |
| DM13 | Có nhiều đường nhỏ song song đi kèm | Có tài và được hỗ trợ, sự nghiệp mở rộng. | sn | + | ✓ | DVT |
| DM14 | Cuối đường chẻ ba | Nhiều thành công trong đời. | sn | + | ✓ | DVT |
| DM15 | Không có hoặc rất mờ | Tự do, không theo khuôn mẫu; tự vạch đường đi và dấn thân đúng lúc sẽ thành. | sn | = | ✓ | DVT (ghi chú về "may mắn") |
| DM16 | Bị đường Trí đạo cong xuống che lấp | Dễ khinh suất vì tin vào may mắn; tính kỹ trước khi xuống tiền. | tl | ! | ✓ | HCM |

### 7.5 Thái dương (`thaiduong`) — tài năng & sự công nhận

| ID | Đặc điểm | Luận giải | Chủ đề | Mức | TTS | Nguồn |
|---|---|---|---|---|---|---|
| TDU01 | Rõ, dài, liền mạch | Có tài năng riêng và dễ được công nhận. | st,sn | + | 3 ✓ | DVT, HCM |
| TDU02 | Chỉ có đoạn ngắn từ Tâm đạo lên gốc áp út | Tích luỹ đều đặn, kiên nhẫn, về sau an nhàn. | tl | + | ✓ | HCM, DVT |
| TDU03 | Vượt qua Tâm đạo đi xuống | Tài vận đẹp, thực lực phát huy sau tuổi 30. | tl,sn | + | ✓ | HCM |
| TDU04 | Xuất phát từ Trí đạo | Thành công nhờ tri thức, khoảng từ tuổi 35. | sn,tt | + | ✓ | DVT |
| TDU05 | Xuất phát từ Sinh đạo | Thành công nhờ cần cù và kiên trì. | sn | + | ✓ | DVT |
| TDU06 | Xuất phát từ Định mạng hoặc giao với Định mạng | Thành công thuận lợi hơn, kinh tế mở rộng sau tuổi 30. | sn,tl | + | ✓ | DVT, HCM |
| TDU07 | Xuất phát từ gò Thái âm hoặc cong về phía đó | Có năng lực chuyên môn, sáng tạo, tính nghệ thuật; dễ được công chúng biết đến. | st | + | ✓ | HCM, DVT |
| TDU08 | Xuất phát từ gò Kim tinh | Đam mê và ý chí theo đuổi dẫn tới thành công. | st | + | ✓ | DVT |
| TDU09 | Xuất phát từ gò Hỏa tinh | Thành công nhờ quyết chí. | sn | + | ✓ | DVT |
| TDU10 | Nhiều đường ngắn nằm chếch cạnh nhau | Đa tài, ham học nhiều thứ; chọn một lĩnh vực để chuyên sâu sẽ toả sáng. Để ý chi tiêu. | st,tl | = | ✓ | DVT, HCM |
| TDU11 | Hai đường song song | Lúc khó khăn về kinh tế có người giúp vượt qua. | tl | + | ✓ | HCM |
| TDU12 | Có ngôi sao trên đường hoặc ở đầu trên | Tài năng sắp bừng sáng; hãy mạnh dạn thể hiện. | st | + | ✓ | DVT, HCM |
| TDU13 | Phân làm ba ở đầu trên | Nhân duyên tốt, được đánh giá cao nhờ kiên trì. | sn,gt | + | ✓ | HCM |
| TDU14 | Có vân nhỏ từ mé ngón út cong lên nhập vào | Thời điểm vận thế mạnh, có quý nhân phù trợ. | sn | + | ✓ | HCM |
| TDU15 | Bị cắt, có chữ thập hoặc cù lao | Tài năng chưa gặp thời. Kiên nhẫn, giữ uy tín và cẩn trọng chuyện tiền bạc. | st,tl | ! | ✓ | DVT, HCM |

### 7.6 Thủy tinh (`thuytinh`) — giao tế, kinh doanh

| ID | Đặc điểm | Luận giải | Chủ đề | Mức | TTS | Nguồn |
|---|---|---|---|---|---|---|
| TT01 | Rõ, thẳng, dài | Có khả năng thương mại, ngoại giao, thích đi đây đi đó và dễ thành công lớn. | gt,tl | + | ✓ | DVT |
| TT02 | Đứt khúc, uốn éo | Hay thay đổi công việc; tìm nghề hợp sở trường giao tiếp sẽ ổn định. | sn | = | ✓ | DVT |
| TT03 | Không có | Rất phổ biến, không mang ý nghĩa xấu. | gt | = | 1 ✓ | (biên tập) |

### 7.7 Tình duyên (`tinhduyen`)

> **Quy tắc:** số đường **không** phải số lần kết hôn (HCM). Đọc đường rõ, sâu nhất. Không dự đoán ly hôn, goá, ngoại tình.

| ID | Đặc điểm | Luận giải | Chủ đề | Mức | TTS | Nguồn |
|---|---|---|---|---|---|---|
| HN01 | Một đường rõ, dài, thẳng | Coi trọng sự gắn bó lâu dài, chân thành và chung thuỷ. | tcm | + | ✓ | DVT, HCM |
| HN02 | Dài, mảnh, thanh | Trang nhã, chân thành; rụt rè khi bày tỏ với người mình thích. | tcm | = | ✓ | HCM |
| HN03 | Ngắn và nhiều | Quan hệ rộng, duyên lành dễ đến qua bạn bè giới thiệu. | tcm,gt | + | ✓ | HCM |
| HN04 | Không có | Thận trọng trong tình cảm, ít bày tỏ nhưng có nhiều bạn bè. | tcm | = | ✓ | HCM |
| HN05 | Uốn cong lên, chạm đường Thái dương | Duyên lành giúp cả hai cùng tiến, cuộc sống chung viên mãn. | tcm,tl | + | ✓ | HCM, DVT |
| HN06 | Uốn cong xuống | Hết lòng lo cho người thương nhưng dễ bi quan; chủ động chăm sóc mối quan hệ. | tcm | ! | ✓ | HCM, DVT |
| HN07 | Uốn khúc | Thích chủ động, không chờ đợi; có thể kết duyên nhanh. | tcm | = | ✓ | HCM |
| HN08 | Đầu đường (phía mép tay) chẻ đôi rồi nhập lại | Lúc đầu xa cách, trắc trở, về sau tốt đẹp. | tcm | = | ✓ | DVT |
| HN09 | Cuối đường chẻ đôi | Dễ để cảm xúc dẫn dắt; dung hoà khác biệt và trò chuyện nhiều sẽ giữ bền. | tcm | ! | ✗ | HCM, DVT |
| HN10 | Đứt, có vạch cắt hoặc có cù lao | Có giai đoạn bất đồng. Giao tiếp và lùi một bước để cùng suy ngẫm. | tcm | ! | ✗ | HCM, DVT |
| HN11 | Có ngôi sao hoặc hình như mặt trời ở cuối | Duyên lành, cuộc sống chung đủ đầy. | tcm | + | ✓ | DVT, HCM |
| HN12 | Màu hồng, rõ nét | Cuộc sống chung ổn định, ít sóng gió. | tcm | + | ✓ | HCM |

**Vị trí ↔ thời điểm** (DVT, HCM): chia đôi khoảng giữa Tâm đạo và gốc ngón út. Đường rõ nhất nằm ở giữa → **khoảng 25–30 tuổi**; lệch về phía Tâm đạo → **sớm (dưới ~22)**; lệch về phía gốc ngón út → **muộn (trên ~30)**. App hiển thị "sớm / độ tuổi phổ biến / muộn", không đưa con số chính xác.

### 7.8 Đường phụ và dấu đặc biệt

| ID | Đặc điểm | Luận giải | Chủ đề | Mức | TTS | Nguồn |
|---|---|---|---|---|---|---|
| X01 | Vòng Kim tinh rõ, liền | Nhạy cảm với cái đẹp, cảm thụ nghệ thuật tốt, cảm xúc tinh tế. | st | + | ✓ | DVT, HCM |
| X02 | Vòng Kim tinh đứt, nhiều tầng | Cảm xúc dễ dao động. Nghệ thuật là nơi tốt để gửi gắm cảm xúc. | st,tcm | = | ✓ | HCM, DVT |
| X03 | Vòng Mộc tinh (vòng cung dưới ngón trỏ) | Sáng suốt, trực giác nhanh, hiểu người, phản ứng kịp thời trước tình thế. | tt | + | ✓ | DVT |
| X04 | Vòng cung dưới ngón giữa (vòng Thổ tinh) | Hay thu mình trong tình cảm; chia sẻ nhiều hơn sẽ được thấu hiểu. | tcm | ! | ✓ | DVT |
| X05 | Đường Viễn du rõ | Đi xa thuận lợi, gặt hái kinh nghiệm và thành công. | dx | + | ✓ | DVT, HCM |
| X06 | Đường Viễn du nhập vào Định mạng | Sự nghiệp phát triển nhờ xa quê hoặc làm việc với nơi khác. | dx,sn | + | ✓ | DVT |
| X07 | Đường Viễn du biến dạng trên gò Thái âm | Đi xa dễ gặp người quý giúp đỡ. | dx | + | ✓ | HCM |
| X08 | Đầu đường Viễn du chẻ đôi hoặc có cù lao | Khi đi xa nên chuẩn bị kỹ giấy tờ, ngôn ngữ, lịch trình; an toàn là trên hết. | dx | ! | ✓ | HCM |
| X09 | Đường Trực giác (cung từ gò Thái âm lên gò Thủy tinh) | Giác quan nhạy bén, hay đoán trúng xu hướng. | tt | + | ✓ | DVT |
| X10 | Đường ảnh hưởng nhập Định mạng từ phía gò Thái âm | Có người đồng hành tốt trong các mối quan hệ và công việc. | gt,sn | + | ✓ | HCM |
| X11 | Chữ thập thần bí (giữa Tâm đạo và Trí đạo) | Say mê triết lý, tâm linh; phản ứng nhanh trước tình huống bất ngờ. | tt | = | ✓ | DVT, HCM |
| X12 | Tam giác nhỏ giữa Tâm đạo và Trí đạo | Ham nghiên cứu, tìm hiểu. | tt | + | ✓ | DVT |
| X13 | Hình chữ M do 4 đường chính tạo thành | Trí tuệ, tình cảm và sức sống cân bằng; tuổi 30–50 là giai đoạn nổi bật. | sn | + | 3 ✓ | HCM, DVT |
| X14 | Chỉ nhỏ chạy từ gốc ngón út lên các lóng trên | Danh tiếng tăng nhanh nhờ giao tế, thương mại hoặc khoa học. | gt,sn | + | ✓ | DVT |
| X15 | Gò Thủy tinh có các sọc dọc ngắn | Thuận lợi trong buôn bán; có thiên hướng chăm sóc người khác. | tl,gt | + | ✓ | DVT, HCM |
| X16 | Đường phụ dọc đi kèm Định mạng và Thái dương | Đủ đầy, có hậu thuẫn. | tl | + | ✓ | DVT |
| X17 | Đường nối gò Kim tinh tới gò Thổ tinh | Tình cảm, gia đình là động lực cho sự nghiệp. | sn,tcm | + | ✓ | DVT |
| X18 | Đường nối gò Kim tinh tới gò Mộc tinh | Mối quan hệ gắn bó giúp vị thế đi lên. | sn,tcm | + | ✓ | DVT |
| X19 | Chữ thập ở lóng giữa ngón trỏ | Được người có uy tín nâng đỡ. | sn | + | 1 ✓ | DVT |
| X20 | Lóng trên ngón giữa có chỉ nhỏ cong queo | Sự nghiệp có lúc gian nan, dễ nản; giữ nhịp kiên trì. | sn | ! | 1 ✓ | DVT |

---

## 8. Tổ hợp đặc biệt

| ID | Đặc điểm | Luận giải | Chủ đề | Mức | TTS | Nguồn |
|---|---|---|---|---|---|---|
| C01 | Ba đường chính rõ, sâu, dài | Nền tảng vững: sức bền, trí tuệ và tình cảm đều sung mãn. | ss,tc | + | 3 ✓ | HCM |
| C02 | Ba đường chính xuất phát chung một điểm | Hành động nhanh, quyết liệt, bên ngoài điềm tĩnh. Chậm lại một nhịp với việc lớn. | tc | ! | ✓ | DVT, HCM |
| C03 | Ba đường chính tách rời nhau | Phóng khoáng, tự tin, thích tự quyết; tham khảo thêm người đi trước sẽ bớt vất vả. | tc | = | ✓ | DVT |
| C04 | Trí đạo và Tâm đạo dính nhau ở điểm khởi đầu | Trí tuệ, nhẫn nại, có tố chất dẫn dắt trong nghề khoa học kỹ thuật. | tt,sn | + | ✓ | DVT |
| C05 | Bàn tay chữ nhất: Tâm đạo và Trí đạo nhập thành một đường ngang | Tập trung cao độ, làm gì cũng hết mình, yêu ghét rõ ràng. | tc,tcm | = | 3 ✓ | DVT |
| C06 | Bàn tay ít chỉ, chủ yếu 3 đường chính | Đơn giản, thẳng tính, thực tế. | tc | = | ✓ | DVT |
| C07 | Bàn tay nhiều chỉ nhỏ | Nhạy cảm, tinh tế, dễ lo nghĩ. Thói quen thư giãn giúp tâm trí nhẹ hơn. | tc,ss | ! | ✓ | DVT, HCM |
| C08 | Ngôi sao ở cuối cả Định mạng và Thái dương | Dấu hiệu thành công nổi bật, đa tài, thông minh. | sn | + | ✓ | DVT |
| C09 | Trí đạo dài + nhiều sao trên các gò + Thủy tinh dài | Đa tài, giàu tưởng tượng; nhớ nghỉ ngơi để không quá tải. | st | + | ✓ | DVT |
| C10 | Chỉ thấy 2 đường chính (Sinh đạo + một đường ngang) | Xem đường ngang là Trí đạo kiêm Tâm đạo (như C05). | tc | = | 1 ✓ | DVT |

---

## 9. Dấu hiệu (đường bộ phận) — ý nghĩa theo vị trí

### 9.1 Ý nghĩa chung

| Dấu | Mô tả nhận diện | Ý nghĩa chung (dùng khi không có ô cụ thể ở §9.2) |
|---|---|---|
| Sao `star` | ≥ 3 vạch nhỏ toả từ một tâm (HCM: ≥ 6 tia) | Năng lượng dồn tụ, điểm sáng nổi bật của vùng đó. Trên gò Thổ tinh/cuối Trí đạo: áp lực đột ngột → câu `!` |
| Chữ thập `cross` | Hai vạch nhỏ cắt nhau, dài ~5mm–1cm | Thử thách, tranh luận cần giải quyết. Ngoại lệ: gò Mộc tinh (thuận), giữa Tâm–Trí (chữ thập thần bí) |
| Tam giác `triangle` | Ba vạch khép kín | Khéo léo, thuận lợi; trên mọi gò đều tốt |
| Hình vuông `square` | Khung 4 cạnh, ~3–5mm | **Bao quanh chỗ đứt:** lực đỡ, giảm nhẹ. **Đứng riêng trên gò:** kìm bớt ý nghĩa gò → "cần kiên trì" |
| Chữ nhật `rect` | Khung chữ nhật | Tăng cường điều tốt của vùng đó |
| Vòng tròn `circle` | Vòng khép nhỏ | Khiếu nghệ thuật, âm nhạc (trên gò Thái âm: kịch nghệ, viết truyện) |
| Cù lao `island` | Hình đảo/chiếc lá 2–5mm trên đường | Giai đoạn hao năng lượng của phạm vi đó; có thể mờ đi khi tinh thần, hoàn cảnh đổi |
| Lưới `grille` | Các vạch nhỏ đan ngang dọc | Năng lượng của gò bị tản; đôi khi là ý tưởng khác thường |
| Dây xích `chain` | Các vòng nhỏ nối nhau | Năng lượng không liền mạch |
| Nhánh `fork` | Đầu mút đường chia 2–3 | Thường tốt: tâm giao, đa chiều |
| Vạch chắn `bar` | Vạch ngắn 3–5mm cắt ngang đường | Trở ngại kế hoạch, biến đổi |
| Nốt son `redDot` | Chấm đỏ | Thúc đẩy điều tốt của gò |
| Nốt ruồi `mole` | Chấm sẫm trên lòng bàn tay | DVT xem là kìm hãm ý nghĩa gò/đường → app: câu `=` nhẹ, trọng số 1 |

### 9.2 Ma trận gò × dấu (DVT, có biên tập; ô trống → dùng §9.1)

| ID | Gò | Sao | Chữ thập | Tam giác | Vuông | Cù lao | Lưới |
|---|---|---|---|---|---|---|---|
| G-kim | Kim tinh | Có duyên, dễ tạo thiện cảm (+) | Tình cảm sâu đậm, chung thuỷ (=) | Tình cảm trong sáng (+) | — | Tình cảm có lúc chùng xuống (!) | Đam mê mạnh, cần cân bằng (=) |
| G-moc | Mộc tinh | Thành công khi đứng ra quản lý, điều hành (+) | Công danh hợp ý (+) | Thu hút thiện cảm (+) | — | Tránh tự kiêu, tham lợi quá đà (!) | Tham vọng lớn, giữ tỉnh táo (!) |
| G-tho | Thổ tinh | Có áp lực đột ngột nhưng thành công ở khoa học, thương mại (=) | Hay lo lắng, mất niềm tin; chia sẻ để nhẹ lòng (!) | Tin vào bản thân, thích điều huyền bí (+) | Nhiều trở ngại, bền bỉ sẽ vượt (!) | Suy nghĩ cần hướng về điều tích cực (!) | Hay buồn lo; tìm niềm vui đơn giản (!) |
| G-thaiduong | Thái dương | Tài năng nở rộ, may mắn lớn; giữ sức (+) | Tài năng tạm chưa phát huy (!) | Nổi danh nhờ tài riêng (+) | Tài năng bị giới hạn, kiên nhẫn (!) | Giữ gìn uy tín (!) | Tự tin quá mức, chậm lại (!) |
| G-thuy | Thủy tinh | Toại nguyện về buôn bán, đi xa (+) | Kế hoạch mở rộng cần tính kỹ (!) | Nhạy bén trong thương mại (+) | — | Thận trọng khi hùn hạp làm ăn (!) | Tỉnh táo trước cám dỗ lợi lộc (!) |
| G-thaiam | Thái âm | Thành công nhờ trí tưởng tượng (+) | Mơ mộng nhiều, cần thực tế (!) | Ước mơ thực tế, khả thi (+) | — | Dự định có thể chậm lại (!) | — |
| G-hoaam | Hỏa tinh âm | Thuận lợi về tinh thần (+) | Hay tranh luận để thắng (!) | Coi trọng đời sống tâm linh (+) | — | — | — |
| G-hoaduong | Hỏa tinh dương | Muốn dấn thân, sánh vai trong môi trường cạnh tranh (+) | Hăng hái, nóng nảy (=) | Lợi khi tham gia hoạt động xã hội (+) | — | — | — |
| G-donghoa | Đồng Hỏa tinh | Nổi danh nhờ sáng tạo (+) | Siêng năng, kiên nhẫn tiến từng nấc (+) | Được cảm tình của người khác (+) | — | — | — |

Nốt ruồi (DVT): Mộc tinh → tự gánh vác nhiều việc (=); Thổ tinh → có chuyện lo nghĩ (!); Thái dương → gặp người/việc bất ngờ ảnh hưởng sự nghiệp (=); Thủy tinh → hùn hạp chưa hợp ý (!); Thái âm → dự định dễ chậm (!); Kim tinh → tình cảm có lúc buồn (!).
Nốt son (DVT): Mộc → công danh phát triển; Kim → tình cảm thuận; Thổ → mau qua lúc buồn; Thủy → buôn bán phát đạt; Thái dương → tài năng phát triển; Thái âm → ước vọng thành; Hỏa → quyết tâm đem lại thành công (tất cả `+`, trọng số 1).

---

## 10. Tính tuổi trên đường (hiển thị dạng giai đoạn)

| Đường | Mốc | Nguồn |
|---|---|---|
| Định mạng | Cổ tay ≈ 0 tuổi · cắt Trí đạo ≈ 33–35 · trung điểm từ cổ tay tới đó ≈ 25 · cắt Tâm đạo ≈ 55 · gốc ngón giữa ≈ 80 | HCM (Hình 98–99), khớp với DVT |
| Thái dương | Xuất phát từ Sinh đạo: trước 30 · từ Trí đạo: từ ~35 · từ Tâm đạo: từ ~45 · giao Định mạng: tài vận mở sau 30 | DVT, HCM |
| Tình duyên | Giữa Tâm đạo–gốc ngón út ≈ 25–30; thấp hơn: sớm; cao hơn: muộn | DVT, HCM |
| Sinh đạo | Đoạn đầu = tuổi nhỏ; giữa = trung niên; cuối = về sau (không đo tuổi thọ) | DVT ("hình xác định tuổi") |
| Cửu cung | Tốn ≈ 0–25 · Ly ≈ 25–50 · Khôn ≈ 50–75 (cổ thuyết) | TCT |

App chỉ dùng: **"thời trẻ" / "khoảng tuổi 30–40" / "trung niên" / "về sau"**, mỗi mốc kèm "khoảng", và chỉ cho các câu `+` hoặc `=`. Không gắn tuổi vào câu `!`.

---

## 11. Bộ câu hỏi nhập liệu (chọn theo hình minh hoạ)

> **Đã đổi (05/11/2026):** máy nhận diện từ ảnh trước, câu còn lại mới hỏi, không bắt người dùng tự so hình mẫu. Xem ARCHITECTURE.md mục 13.

Mỗi câu luôn có lựa chọn **"Không rõ / bỏ qua"**. Bảng dưới vẫn là danh sách đặc điểm đầu vào của engine.

| Q | Câu hỏi | Lựa chọn → ID đặc điểm |
|---|---|---|
| Q01 | Bạn thuận tay nào? | phải / trái (quyết định tay "hiện tại") |
| Q02 | Hình dáng bàn tay giống hình nào nhất? | vuông H01 · chữ nhật H02 · thon nhọn H03 · bè H04 · tròn đầy H05 · xương khớp H06 · lẫn lộn H07 |
| Q03 | So với vóc người, bàn tay… | to H08 · vừa · nhỏ H09 |
| Q04 | Bàn tay dài hay rộng? | dài H10 · cân đối · rộng H11 |
| Q05 | Khi nắm thử, tay bạn… | cứng H12 · vừa · mềm H13 |
| Q06 | Tay bạn thường… | ấm H14 · bình thường · mát H15 |
| Q07 | Lòng bàn tay | đầy đặn H16 · trũng giữa H17 · mỏng phẳng H18 |
| Q08 | Áp ngón cái vào cạnh ngón trỏ, đầu ngón cái tới đâu? (§2.3) | dài F01 · trung bình · ngắn F02 |
| Q09 | Xoè tay tự nhiên, ngón cái… | dang xa F03 · bình thường · khép sát F04 |
| Q10 | Ngón trỏ so với ngón áp út | dài hơn F08 · ngắn hơn F09 · gần bằng F10 |
| Q11 | Ngón út so với ngấn đốt trên ngón áp út | vượt F14 · ngang · thấp F15 |
| Q12 | Ngón tay so với lòng bàn tay | dài F16 · cân đối · ngắn F17 |
| Q13 | Khớp ngón | nổi F18 · nhẵn F19 |
| Q14 | Đầu ngón đa số | vuông T01 · nhọn T02 · tròn T03 · bè T04 |
| Q15 | (tuỳ chọn) Vân tay từng ngón: móng thú / xoáy / cung | → P01–P08, V01–V30 |
| Q16 | (tuỳ chọn) Dáng móng | N01–N08 |
| Q17 | Sinh đạo: độ cong so với đường tham chiếu | vượt ra SD02 · vừa · ôm sát SD03 |
| Q18 | Sinh đạo: nét | rõ sâu SD01 · mờ SD04 · xích SD05 · đứt SD06 (+ có che chắn SD07) · đôi SD08 |
| Q19 | Sinh đạo: nhánh (chọn nhiều) | lên ngón trỏ SD09 · lên ngón giữa SD10 · về ngón út SD11 · ra gò Thái âm SD12 |
| Q20 | Đầu Sinh đạo & Trí đạo | dính một đoạn TD15 · tách hở TD16 · ba đường chung một điểm C02 · ba đường tách rời C03 |
| Q21 | Trí đạo: hướng & độ dài | thẳng ngang TD02 · cong nhẹ TD03 · cong sâu TD04 · dài tới mép TD05 · tới dưới áp út TD06 · ngắn TD07 |
| Q22 | Trí đạo: hình dạng (chọn nhiều) | chẻ đôi cuối TD08 · 3 nhánh đầu TD09 · hai đường TD10 · uốn lượn TD11 · xích TD12 · cù lao TD13 · đứt TD19 |
| Q23 | Tâm đạo: kết thúc ở đâu? | giữa trỏ–giữa TAM01 · gốc ngón trỏ TAM02 · chạy suốt TAM03 · dưới ngón giữa TAM04 · cong vút lên ngón giữa TAM05 · nhập Trí đạo TAM13 · chữ nhất C05 |
| Q24 | Tâm đạo: hình dạng (chọn nhiều) | thẳng TAM06 · chẻ cuối TAM07 · nhánh lên TAM08 · nhánh xuống TAM09 · xích TAM10 · cù lao TAM11 · đôi TAM14 |
| Q25 | Định mạng: có không, bắt đầu từ đâu? | không có DM15 · cổ tay DM02 · Sinh đạo DM03 · gò Thái âm DM04 · gò Kim tinh DM05 · giữa lòng DM06 · chỉ đoạn trên DM07 |
| Q26 | Định mạng: hình dạng | thẳng dài DM01 · đứt DM09 (+ chồng DM10) · cong DM11 · lên gò Thổ DM12 · chẻ ba DM14 |
| Q27 | Thái dương | không có · dài rõ TDU01 · đoạn ngắn trên Tâm đạo TDU02 · nhiều đoạn ngắn TDU10 · hai đường TDU11 |
| Q28 | Tình duyên: đường rõ nhất | không có HN04 · một đường dài HN01 · ngắn nhiều HN03 · cong lên chạm Thái dương HN05 · cong xuống HN06 · chẻ HN08/HN09 |
| Q29 | Tình duyên: vị trí đường rõ nhất | gần Tâm đạo · giữa · gần gốc ngón út (§7.7) |
| Q30 | Gò nổi rõ nhất (chọn 1–2) và gò phẳng nhất (chọn 1) trên sơ đồ | → M01–M21 |
| Q31 | Dấu đặc biệt: chạm vị trí trên sơ đồ rồi chọn hình dấu | → ma trận §9.2, X01–X20 |
| Q32 | Tổng thể số chỉ | ít chỉ C06 · vừa · nhiều chỉ nhỏ C07 |

Tay thứ hai (tuỳ chọn): chỉ hỏi lại Q17–Q29 để so sánh.

---

## 12. Danh mục loại bỏ (kèm lý do)

| Nhóm | Ví dụ trong sách | Lý do loại |
|---|---|---|
| Chẩn đoán, dự báo bệnh | Toàn bộ TCT; HCM Phần II; DVT "móng tay & bệnh lý", "bệnh lý trên bàn tay"; màu tay trẻ em ↔ bệnh | Chưa kiểm chứng y khoa, có thể khiến người dùng chậm đi khám; rủi ro chính sách nội dung sức khoẻ trên Google Play |
| Tuổi thọ, chết, tai nạn | "Sinh đạo dài: thọ", "Trí–Tâm dính ở áp út: chết bất ngờ", "68 và 73 tuổi có bệnh nặng", "tai nạn khi đi xa", JDJ "phương pháp tìm tuổi thọ" | Gây sợ hãi; nằm trong danh sách thầy không đọc của Phase 6 → loại hẳn |
| Tù tội, pháp luật | "đề phòng tù tội trên 40", "dễ sa vào trộm cắp" | Gán nhãn tiêu cực, không kiểm chứng |
| Tình dục | DVT "dấu hiệu thuộc lãnh vực tình dục", HCM hợp đôi tình dục, "vòng Kim tinh: háo sắc", JDJ "đường dâm ý" | Không phù hợp app văn hoá đại chúng, phân loại nội dung |
| Xu hướng tính dục | HCM "có khả năng đồng tính luyến ái" | Phân biệt đối xử |
| Phán xét theo giới | "nữ có thể thành gái mãi dâm", "nữ không trung thành", "bạn gái ranh mãnh xảo quyệt" | Định kiến giới |
| Con cái, sinh nở | Đường Tử tức, "con trai/con gái", "tuyệt tự", "sẩy thai", "khó sinh" | Nhạy cảm, có thể gây tổn thương |
| Hôn nhân tất định | "dạng chữ Y: ly dị, goá", "ngoại tình", "nhiều chồng nhiều vợ", "chồng giàu" | Dự đoán đổ vỡ; câu còn lại về bất đồng chỉ hiện chữ (HN09, HN10) |
| Cờ bạc, đầu cơ | HCM Chương V-C "thử vận may thắng bại", xổ số, chứng khoán | Khuyến khích cờ bạc |
| Người thật | Tay Hitler, Napoleon, Gandhi, Picasso, Caruso… | Không dùng hình/luận giải về người thật |
| Đoán nhân phẩm | Bắt tay "có hành vi lừa dối" | App không quan sát được; gán nhãn |
| "Cải vận" bằng ăn uống | HCM "ăn thịt, sữa, cá để đường chỉ tốt lên" | Lời khuyên dinh dưỡng không cơ sở. Chỉ giữ ý "tâm thế tích cực" |

### 12.1 Danh sách thầy không đọc (chỉ hiện chữ)
HN09, HN10. Bổ sung: mọi câu builder sinh ra có chứa các từ trong `TTS_FORBIDDEN` của Phase 6.5 (ly hôn, chia tay, bệnh, tai nạn, chết…) → tự chuyển sang chỉ hiện chữ (lớp bảo vệ thứ hai).

---

## 13. Liên kết với Lý Số (Đạo quán & Thầy đọc)

- **Lớp Cửu cung:** sơ đồ bàn tay có nút bật/tắt lớp Bát quái (§3.2), tô màu theo ngũ hành **dùng chung bảng màu với màn hình Bát Trạch**. Chạm vào cung → hiện tên cung, gò tương ứng, ngũ hành, và câu luận giải gò của người dùng (§6). Không luận giải riêng theo cung.
- **Dòng thời gian Tốn → Ly → Khôn** (cổ thuyết TCT) hiển thị như một dải "thời trẻ – trung niên – về sau" nối với §10. Mỗi đoạn chỉ là chú thích văn hoá, không gắn câu dự đoán.
- **Tĩnh thất:** thêm đồ vật mở công cụ, gợi ý **"tấm giấy dó in dấu bàn tay"** hoặc **"đèn dầu soi tay"** trên án thư.
- **Kịch bản đọc:** mở rộng `Cue.focus` thêm `palm?: { zones?: MountId[]; lines?: LineId[]; marks?: string[] }` để sơ đồ bàn tay tô sáng gò/đường khi thầy đang nói tới.
- **Câu mở/kết riêng cho chỉ tay:** câu mở nhắc "xem tay là soi mình, đường chỉ đổi theo cách mình sống"; câu kết nhắc xem lại sau 6–12 tháng + "Số là tham khảo, đức năng thắng số".
- **Data safety:** nếu có ảnh chụp tay → quyền CAMERA, ảnh chỉ lưu trong bộ nhớ app, không gửi đi; ghi rõ ở Phase 8.1.

---

## 14. Mô hình dữ liệu và thuật toán luận giải

### 14.1 Kiểu dữ liệu (đề xuất cho `src/content/palm/`)

```ts
export type PalmTopic = 'tc'|'tt'|'tcm'|'sn'|'tl'|'ss'|'gt'|'st'|'dx';
export type Tone = '+'|'='|'!';
export type LineId = 'sinh'|'tri'|'tam'|'dinhmang'|'thaiduong'|'thuytinh'|'tinhduyen'
  |'vongkim'|'vongmoc'|'vienDu'|'thuongthang'|'trucgiac'|'cantro'|'anhhuong';
export type MountId = 'kim'|'moc'|'tho'|'thaiduong'|'thuy'|'thaiam'|'hoaduong'|'hoaam'|'donghoa'|'kham';
export type MarkType = 'star'|'cross'|'triangle'|'square'|'rect'|'circle'|'island'|'grille'|'chain'|'fork'|'bar'|'redDot'|'mole';

export interface PalmReading {
  id: string;            // 'SD01', 'TAM07', 'G-moc.star'…
  group: 'hand'|'finger'|'tip'|'print'|'combo-print'|'nail'|'mount'|'line'|'extra'|'combo'|'mark';
  feature: string;       // mô tả đặc điểm (hiện trong bảng giải thích)
  text: string;          // luận giải ≤ 180 ký tự
  topics: PalmTopic[];
  tone: Tone;
  weight: 1|2|3;
  tts: boolean;
  sources: ('DVT'|'HCM'|'TCT'|'JDJ')[];
  line?: LineId; mount?: MountId; mark?: MarkType;   // để focus sơ đồ
}

export interface PalmHandInput {
  answers: Record<string /* Q01..Q32 */, string | string[] | null>;
  prints?: Array<'loop'|'whorl'|'arch'|null>;   // cái → út
  marks?: Array<{ mount: MountId; type: MarkType }>;
}
export interface PalmInput { dominant: 'left'|'right'; current: PalmHandInput; innate?: PalmHandInput; method: 'dominant'|'namTaNuHuu'|'clasp'; }

export interface PalmResult {
  sections: Array<{ key: 'tong-quan'|'ngon'|'duong-chinh'|'duong-phu'|'go-dau'|'tong-ket'; items: PalmReading[] }>;
  byTopic: Record<PalmTopic, { lines: string[]; confidence: 'xu-huong'|'ro' }>;
  compare?: Array<{ topic: PalmTopic; note: string }>;   // khi có tay thứ hai
}
```

### 14.2 Thuật toán (gợi ý cho bước 🔴 chốt)
1. Ánh xạ câu trả lời → danh sách ID (bảng §11). Vân tay: nếu 5 ngón chỉ gồm loop/whorl và đúng 1 hoặc 3 ngón loop (hoặc whorl) → tra V01–V30; ngược lại dùng P01–P03 theo đa số. Dấu → `G-<mount>.<mark>` nếu ô có nội dung, không thì câu chung §9.1.
2. Sắp xếp theo trình tự §2.2 và gom theo `section`.
3. **Tổng kết theo chủ đề:** với mỗi topic, lấy các reading có topic đó, xếp theo `weight` rồi `tone` (`+` trước). Có ≥ 2 reading cùng chiều → `confidence: 'ro'`, ngược lại `'xu-huong'` và thêm tiền tố "Có xu hướng". Tối đa 3 câu/chủ đề; bảo đảm ≥ 1 câu `+` hoặc `=` nếu có.
4. **So sánh hai tay** (khi có `innate`): cùng ID ở hai tay → "nền tảng vững"; chỉ tay hiện tại có `+` → "điểm đang phát triển"; chỉ tay bẩm sinh có `+` → "tiềm năng nên khơi lại".
5. Câu kết cố định: lời nhắc tướng tay thay đổi + lời nhắc văn hoá.
6. Mọi câu đi qua bộ chuẩn hoá TTS (Phase 5) và kiểm tra `TTS_FORBIDDEN`.

### 14.3 Mâu thuẫn giữa các sách và cách app xử lý

| Vấn đề | Sách nói | App chọn |
|---|---|---|
| Sinh đạo dài/ngắn | DVT, JDJ: dài = thọ · HCM: không liên quan tuổi thọ | Theo HCM: sinh lực, nhịp sống |
| Hình vuông | DVT: trên gò phần nhiều bất lợi, trên Sinh đạo thì bảo hộ · HCM: dấu # là vận xấu nhưng trên đường xấu thì "gặp hung hoá cát" | Bao chỗ đứt = lực đỡ; đứng riêng trên gò = "cần kiên trì" |
| Ngôi sao | HCM: luôn rất tốt · DVT: tuỳ vị trí (Thổ tinh xấu) | Theo vị trí (DVT), giọng nhẹ |
| Tay nào | 3 cách (§2.1) | Mặc định tay thuận, cho đổi trong Cài đặt |
| Nhiều đường Thái dương ngắn | DVT: đa tài · HCM: tiêu xài hoang phí | Gộp: đa tài + "để ý chi tiêu" (TDU10) |
| Trí đạo uốn lượn | DVT: lưỡng lự · HCM (dạng sóng): thể lực, âm nhạc | Gộp: năng động nhưng hay đổi ý (TD11) |
| Số đường Tình duyên | DVT: đường song song = nhiều người yêu · HCM: không phải số lần kết hôn | Theo HCM, chỉ đọc đường rõ nhất |
| Đường Thủy tinh | Cả hai gọi là "đường sức khoẻ" | Chỉ giữ nghĩa giao tế, kinh doanh |
| Vòng Kim tinh | Nhạy cảm nghệ thuật + đào hoa/dục tính | Chỉ giữ nghĩa nhạy cảm thẩm mỹ |
| Cửu cung | TCT: phân khu cổ "còn thô", khác nhau giữa các nhà | Chỉ là lớp hiển thị văn hoá |

---

## 15. Việc cần làm thủ công

- [ ] Đối chiếu bản giấy/ảnh: V19, V26 (HCM in trùng), N04 (tên dáng móng, Hình 129).
- [ ] Đặt vẽ ~90 hình minh hoạ SVG cho bộ câu hỏi §11 (một nét, cùng phong cách la bàn/bát quái của app) — ghi vào `docs/ART-BRIEF.md`.
- [ ] Đọc duyệt toàn bộ cột "Luận giải" bằng giọng thầy (Phase 6.7) trước khi phát hành.
