# So sánh Dụng thần: engine ngũ hành và lá số mẫu trong sách

> Sinh tự động bằng `npm run compare:sach` (`scripts/compare-sach.ts`) từ `tests/fixtures/nguhanh-sach.json`. Đừng sửa tay.
> 50 lá số chọn ngày 12/11/2026 từ hai sách chủ dự án cung cấp ở `docs/sach/`: 26 lá *Tử Bình Chân Thuyên* (bản dịch Phương Trọng Thầm), 24 lá *Trích Thiên Tủy* (Nhậm Thiết Tiều bình chú). Chỉ lấy lá sách nói rõ dùng gì.
> Sách cho tứ trụ, không cho ngày sinh, nên engine nhận thẳng tứ trụ (không có Đại Vận). Engine = preset mặc định.

**Đọc bảng này thế nào:** đáp án là cách luận của hai trường phái cổ, không phải sự thật khách quan (ARCHITECTURE 14.1). *Tử Bình Chân Thuyên* luận theo cách cục ở tháng sinh; *Trích Thiên Tủy* luận theo vượng suy, gần với cách engine luận hơn. Lá "Khác" hay "Ngược" là chỗ cần người luận xem lại, không tự coi bên nào đúng. Tứ trụ do người đọc chép từ sách, chưa có người thứ hai soát.

- **Trùng:** dụng thần chính của engine là hành sách nói.
- **Gần:** engine chọn một hành sách cũng nói là tốt, hoặc cách luận phụ của engine (ví dụ thuận thế) trùng sách.
- **Ngược:** kỵ thần của engine lại là dụng thần của sách.
- **Khác:** còn lại.

## 1. Kết quả tổng

| Nhóm | Số lá | Trùng | Gần | Khác | Ngược |
|---|---|---|---|---|---|
| Tất cả | 50 | 18/50 (36%) | 2/50 (4%) | 20/50 (40%) | 10/50 (20%) |
| Tử Bình Chân Thuyên | 26 | 11/26 (42%) | 1/26 (4%) | 10/26 (38%) | 4/26 (15%) |
| Trích Thiên Tủy | 24 | 7/24 (29%) | 1/24 (4%) | 10/24 (42%) | 6/24 (25%) |
| Sách dùng phù ức, chế hoá | 31 | 12/31 (39%) | 1/31 (3%) | 11/31 (35%) | 7/31 (23%) |
| Sách dùng điều hậu | 7 | 3/7 (43%) | 0/7 (0%) | 4/7 (57%) | 0/7 (0%) |
| Sách dùng tòng, chuyên vượng | 10 | 3/10 (30%) | 1/10 (10%) | 4/10 (40%) | 2/10 (20%) |
| Sách dùng hoá khí | 2 | 0/2 (0%) | 0/2 (0%) | 1/2 (50%) | 1/2 (50%) |

Theo định nghĩa "khớp" của ARCHITECTURE 14.1 điều 2 (dụng thần sách trùng dụng **hoặc hỷ** của engine, không nằm trong kỵ): 24/50 (48%); *Tử Bình Chân Thuyên* 14/26 (54%), *Trích Thiên Tủy* 10/24 (42%). Không so được với legacy vì legacy cần ngày sinh để lập lá số.

Dụng thần engine đổi theo preset (`analyzeSensitivity`, ARCHITECTURE 14.11) ở 4/50 (8%) lá; trong đó trùng sách 1 lá.

## 2. Tử Bình Chân Thuyên

| Mã | Trang | Tứ trụ (Năm · Tháng · Ngày · Giờ) | Sách | Engine | Khớp |
|---|---|---|---|---|---|
| tbct-1 (Thư Thượng thư) | 152, 154 | Đinh Hợi · Nhâm Tý · Tân Tỵ · Đinh Dậu | dụng Hoả. Kim thuỷ Thực thần dụng Sát; dụng thần là Quan tinh, để điều hậu | Thân nhược (31%), Phù ức → dụng Thổ, kỵ Mộc | Khác |
| tbct-2 (Tiền Tham chính) | 152, 154 | Bính Ngọ · Quý Tỵ · Giáp Tý · Bính Dần | dụng Thuỷ. Mộc hoả Thương quan dụng Ấn, cũng là ý điều hậu | Thân nhược (32%), Phù ức → dụng Thuỷ, kỵ Thổ | Trùng |
| tbct-3 (Thường Quốc Công) | 151–152 | Tân Mão · Tân Mão · Quý Dậu · Kỷ Mùi | dụng Kim. Thực bị Kiêu đoạt, dùng Ấn hoá Sát | Thân nhược (35%), Phù ức → dụng Kim, kỵ Hoả | Trùng |
| tbct-4 (Hồ Hội Nguyên) | 151–152 | Mậu Tuất · Nhâm Tuất · Bính Tý · Mậu Tuất | dụng Mộc. Mậu thổ quá nặng chế Sát, cần nhất là Ấn | Cực nhược (13%), Thuận thế → dụng Thổ, kỵ Mộc · Tòng Nhi: Giả · cách luận phụ trùng sách | Ngược |
| tbct-5 | 153 | Kỷ Hợi · Bính Dần · Giáp Dần · Nhâm Thân | dụng Hoả. Bính hoả Thực thần thấu là hỷ, Nhâm Ấn đoạt Thực là bệnh | Thân vượng (65%), Phù ức → dụng Hoả, kỵ Thuỷ | Trùng |
| tbct-6 | 200 | Ất Dậu · Ất Dậu · Ất Dậu · Giáp Thân | dụng Kim (cũng tốt: Thổ, Thuỷ). Tòng Sát cách: vận Kim tốt nhất, thổ thuỷ cũng cát, hoả là nghịch | Thân nhược (29%), Phù ức → dụng Thuỷ, kỵ Thổ | Gần |
| tbct-7 | 205 | Giáp Thìn · Đinh Mão · Giáp Tý · Mậu Thìn | dụng Hoả. Dương Nhận tháng hai, dụng Đinh tiết tú | Thân vượng (76%), Thuận thế → dụng Hoả, kỵ Kim · Khúc Trực: Chân | Trùng |
| tbct-8 | 205 | Quý Mão · Ất Mão · Giáp Dần · Đinh Mão | dụng Mộc (cũng tốt: Thuỷ). Đinh vô căn bị Quý hại, luận Chuyên Vượng, vận Đông Bắc thuận | Cực vượng (86%), Thuận thế → dụng Hoả, kỵ Kim · Khúc Trực: Chân | Khác |
| tbct-9 (Thị lang) | 210 | Đinh Dậu · Kỷ Dậu · Giáp Thìn · Ất Hợi | dụng Hoả. Thất Sát nắm lệnh, Đinh thấu thì dụng Đinh chế Sát | Thân nhược (30%), Phù ức → dụng Thuỷ, kỵ Thổ | Khác |
| tbct-10 (Thượng thư) | 218 | Canh Thân · Nhâm Ngọ · Ất Mão · Tân Tỵ | dụng Thuỷ. Điều hậu dụng Nhâm, thông căn ở Thân | Thân nhược (37%), Phù ức → dụng Thuỷ, kỵ Thổ | Trùng |
| tbct-11 | 222 | Mậu Thìn · Quý Hợi · Ất Tỵ · Bính Tý | dụng Hoả. Điều hậu dụng Bính | Thân vượng (74%), Phù ức → dụng Thổ, kỵ Mộc · đổi theo preset | Khác |
| tbct-12 | 230 | Giáp Dần · Nhâm Thân · Bính Tý · Quý Tỵ | dụng Mộc. Quan Sát hỗn tạp, được Giáp mộc hoá | Thân nhược (25%), Phù ức → dụng Mộc, kỵ Kim | Trùng |
| tbct-13 | 230 | Mậu Thân · Canh Thân · Bính Thìn · Mậu Tuất | dụng Kim. Tòng Tài cách | Cực nhược (13%), Phù ức → dụng Hoả, kỵ Thuỷ | Khác |
| tbct-14 (Lâm Sâm) | 235 | Mậu Thìn · Giáp Dần · Đinh Mão · Kỷ Dậu ¹ | dụng Kim. Mộc hoả bế tắc, lấy Dậu kim ở chi giờ làm dụng | Thân vượng (74%), Phù ức → dụng Kim, kỵ Hoả · đổi theo preset | Trùng |
| tbct-15 | 235 | Tân Mão · Canh Dần · Đinh Dậu · Quý Mão | dụng Mộc. Không có Giáp thì dụng Mão (Khô thảo dẫn Đinh) | Thân vượng (64%), Phù ức → dụng Kim, kỵ Hoả | Khác |
| tbct-16 (Hồ Lâm Dực) | 240 | Nhâm Thân · Đinh Mùi · Đinh Mùi · Kỷ Dậu | dụng Kim (cũng tốt: Thuỷ). Kỷ thổ dày nặng, hỷ có kim hoá; vận kim thuỷ đẹp | Thân nhược (31%), Phù ức → dụng Mộc, kỵ Kim · đổi theo preset | Ngược |
| tbct-17 | 250 | Mậu Ngọ · Kỷ Mùi · Mậu Thân · Kỷ Mùi | dụng Kim. Thổ dày, nhờ chi ngày Thân kim làm dụng | Cực vượng (86%), Thuận thế → dụng Kim, kỵ Mộc · Giá Sắc: Giả | Trùng |
| tbct-18 | 258 | Tân Mùi · Quý Tỵ · Kỷ Mùi · Kỷ Tỵ | dụng Thuỷ. Hoả viêm thổ táo, hỷ Quý thuỷ nhuận trạch | Thân vượng (78%), Thuận thế → dụng Kim, kỵ Mộc · Giá Sắc: Giả | Khác |
| tbct-19 | 262 | Ất Dậu · Bính Tuất · Kỷ Mão · Giáp Tuất | dụng Thổ (cũng tốt: Hoả). Giáp Kỷ hoá thổ cách, vận hoả thổ quý | Thân vượng (58%), Phù ức → dụng Mộc, kỵ Kim | Khác |
| tbct-20 (Ngự Sử) | 262 | Ất Mùi · Bính Tuất · Kỷ Sửu · Mậu Thìn | dụng Thổ (cũng tốt: Hoả). Giá Sắc cách, hoả vận phát quý, mộc vận phá cách | Thân vượng (79%), Phù ức → dụng Kim, kỵ Hoả | Khác |
| tbct-21 (Vương Sĩ Trân) | 270 | Tân Dậu · Bính Thân · Canh Tý · Bính Tuất | dụng Hoả. Thân cường dụng Bính, Bính hoả thấu hai vị | Thân vượng (57%), Phù ức → dụng Hoả, kỵ Thuỷ | Trùng |
| tbct-22 | 270 | Mậu Thân · Canh Thân · Canh Thân · Canh Thìn | dụng Thuỷ (cũng tốt: Kim). Không có hoả, vượng cực cần tiết, vận Tây Bắc | Thân vượng (82%), Thuận thế → dụng Thuỷ, kỵ Hoả · Tòng Cách: Chân | Trùng |
| tbct-23 | 280 | Nhâm Thìn · Kỷ Dậu · Tân Sửu · Quý Tỵ | dụng Thuỷ. Vượng cực cần tiết, thủ Nhâm thuỷ làm dụng | Thân vượng (75%), Phù ức → dụng Thuỷ, kỵ Thổ | Trùng |
| tbct-24 | 290 | Bính Tý · Đinh Dậu · Nhâm Thân · Giáp Thìn | dụng Thuỷ (cũng tốt: Kim, Mộc). Thân Tý Thìn đủ thuỷ cục, nhận Chuyên Vượng; vận thuỷ mộc đều tốt | Thân vượng (75%), Phù ức → dụng Hoả, kỵ Thuỷ | Ngược |
| tbct-25 (Bá tước) | 296 | Giáp Thìn · Kỷ Tỵ · Quý Dậu · Tân Dậu | dụng Kim. Sát cường có Giáp hợp, thân nhược có Tân phát nguyên | Trung hoà (47%), Điều hậu → dụng Thuỷ, kỵ Hoả | Khác |
| tbct-26 (Tham Chính) | 296 | Giáp Ngọ · Kỷ Tỵ · Quý Mùi · Mậu Ngọ | dụng Hoả. Quý nhược vô căn, hợp thành Quý hoá hoả, cách khá chân | Cực nhược (13%), Điều hậu → dụng Thuỷ, kỵ Hoả | Ngược |

## 3. Trích Thiên Tủy

| Mã | Trang | Tứ trụ (Năm · Tháng · Ngày · Giờ) | Sách | Engine | Khớp |
|---|---|---|---|---|---|
| ttt-11 | 24–25 | Giáp Dần · Nhâm Thân · Quý Tỵ · Quý Hợi | dụng Hoả. Thuỷ nhiều mà vượng, mộc bị xung không dùng được, dụng thần tại Tỵ hoả | Thân vượng (77%), Phù ức → dụng Mộc, kỵ Kim | Khác |
| ttt-12 | 25 | Quý Tỵ · Quý Hợi · Giáp Dần · Nhâm Thân | dụng Hoả. Giáp mộc sinh mùa đông, hàn tất lấy hoả làm dụng thần | Cực vượng (86%), Điều hậu → dụng Hoả, kỵ Thuỷ | Trùng |
| ttt-13 | 25 | Tân Mão · Đinh Dậu · Mậu Tý · Mậu Ngọ | dụng Mộc (cũng tốt: Hoả). Thương quan dụng ấn cách, lấy quan tinh làm dụng; hỷ dụng tại mộc hoả | Thân nhược (39%), Phù ức → dụng Hoả, kỵ Thuỷ | Gần |
| ttt-14 | 25 | Tân Mùi · Tân Sửu · Mậu Thìn · Nhâm Tuất | dụng Kim. Vận mộc hoả làm dụng thần Tân kim thụ thương | Thân vượng (55%), Điều hậu → dụng Hoả, kỵ Thuỷ | Khác |
| ttt-17 | 27 | Tân Mùi · Ất Mùi · Canh Thìn · Đinh Hợi | dụng Hoả. Đinh hoả tư lệnh phát lộ làm dụng thần, chế Tân kim tỷ kiếp | Thân vượng (59%), Phù ức → dụng Mộc, kỵ Kim · đổi theo preset | Khác |
| ttt-20 | 29 | Đinh Tỵ · Quý Sửu · Đinh Mão · Bính Ngọ | dụng Kim. Quý thuỷ thoái khí không chế được kiếp, lấy Tân kim tàng trong Sửu làm dụng thần | Trung hoà (55%), Giữ trung hoà → dụng Kim, kỵ Hoả | Trùng |
| ttt-26 | 33 | Kỷ Hợi · Đinh Mão · Canh Thân · Canh Thìn | dụng Hoả. Canh kim lộc vượng ở Thân, có Kỷ ấn, dụng Đinh làm dụng thần | Thân nhược (33%), Phù ức → dụng Kim, kỵ Hoả | Ngược |
| ttt-28 | 33 | Canh Thân · Nhâm Ngọ · Tân Dậu · Quý Tỵ | dụng Hoả. Kim thuỷ tương sinh, Ngọ hoả làm dụng đắc thế | Trung hoà (48%), Giữ trung hoà → dụng Mộc, kỵ Hoả | Ngược |
| ttt-38 | 37 | Bính Tý · Kỷ Hợi · Ất Dậu · Nhâm Ngọ | dụng Hoả. Ất mộc lạnh cần sưởi ấm, Bính hoả làm dụng thần, Nhâm thuỷ là khắc thần | Thân vượng (64%), Phù ức → dụng Thổ, kỵ Mộc | Khác |
| ttt-40 | 38 | Giáp Dần · Mậu Thìn · Bính Dần · Bính Thân | dụng Kim. Nhật chủ quá vượng, Thân xung Dần, tài tinh làm dụng thần | Trung hoà (51%), Giữ trung hoà → dụng Thuỷ, kỵ Thổ | Khác |
| ttt-41 | 38 | Nhâm Thân · Giáp Thìn · Bính Dần · Bính Thân | dụng Mộc. Nhâm thuỷ sinh Giáp mộc, Giáp là dụng thần | Trung hoà (48%), Giữ trung hoà → dụng Thuỷ, kỵ Thổ | Khác |
| ttt-42 | 38 | Kỷ Tỵ · Tân Mùi · Nhâm Ngọ · Ất Tỵ | dụng Hoả. Không lấy Tân kim làm dụng; Nhâm hợp Đinh trong Ngọ, tòng hoả | Thân nhược (26%), Điều hậu → dụng Thuỷ, kỵ Hoả | Ngược |
| ttt-46 | 40 | Kỷ Tỵ · Quý Dậu · Bính Dần · Canh Dần | dụng Thuỷ. Bính toạ hai Dần trường sinh, có lộc ở năm, lấy quan làm dụng | Thân nhược (28%), Phù ức → dụng Hoả, kỵ Thuỷ | Ngược |
| ttt-61 | 44 | Nhâm Tuất · Nhâm Tý · Giáp Tý · Mậu Thìn | dụng Thổ. Thuỷ thế cường bạo, chỉ Mậu thổ tài tinh làm dụng được | Thân vượng (85%), Thuận thế → dụng Hoả, kỵ Kim · Tòng Cường: Giả | Khác |
| ttt-65 | 46 | Kỷ Mùi · Đinh Sửu · Mậu Tý · Kỷ Mùi | dụng Kim. Thổ vượng, nhật chủ thổ thì dụng kim đẹp nhất, tú khí lưu hành | Thân vượng (82%), Thuận thế → dụng Kim, kỵ Mộc · Giá Sắc: Giả | Trùng |
| ttt-66 | 46 | Bính Dần · Giáp Ngọ · Bính Tuất · Ất Mùi | dụng Thổ. Chi hội hoả cục, hoả cực vượng, dụng thổ đẹp nhất | Thân vượng (76%), Thuận thế → dụng Thổ, kỵ Thuỷ · Viêm Thượng: Chân | Trùng |
| ttt-71 | 49 | Đinh Sửu · Canh Tuất · Canh Tý · Giáp Thân | dụng Hoả. Kim cần hoả luyện; Đinh có gốc ở Tuất làm dụng thần | Thân vượng (65%), Phù ức → dụng Hoả, kỵ Thuỷ | Trùng |
| ttt-74 | 50 | Nhâm Tý · Quý Sửu · Bính Ngọ · Nhâm Thìn | dụng Mộc. Cần dụng mộc ấn tinh hoá sát sinh nhật chủ | Thân nhược (22%), Phù ức → dụng Mộc, kỵ Kim | Trùng |
| ttt-83 | 54 | Tân Mùi · Tân Mão · Ất Mùi · Đinh Hợi | dụng Hoả. Tam hợp mộc cục, kim hư, Đinh hoả thấu chế sát làm dụng thần | Thân vượng (64%), Phù ức → dụng Kim, kỵ Hoả | Ngược |
| ttt-89 | 56 | Tân Mão · Bính Thân · Quý Mão · Nhâm Tuất | dụng Kim. Ấn thụ cách, lấy Thân kim làm dụng thần | Thân vượng (63%), Phù ức → dụng Hoả, kỵ Thuỷ | Khác |
| ttt-103 | 67 | Ất Sửu · Giáp Thân · Giáp Thân · Tân Mùi | dụng Kim. Mộc không căn, Tân kim thấu, mộc thái suy nên dụng kim | Thân nhược (39%), Phù ức → dụng Thuỷ, kỵ Thổ | Khác |
| ttt-105 | 68 | Ất Sửu · Nhâm Ngọ · Bính Tuất · Giáp Ngọ | dụng Thổ. Hoả thái vượng, dụng thổ | Thân vượng (61%), Phù ức → dụng Thuỷ, kỵ Thổ | Ngược |
| ttt-109 | 69 | Mậu Thìn · Mậu Ngọ · Mậu Thân · Kỷ Mùi | dụng Kim. Thổ trọng sinh mùa hạ, thổ thái vượng, dụng thần tại kim | Cực vượng (86%), Thuận thế → dụng Kim, kỵ Mộc · Giá Sắc: Giả | Trùng |
| ttt-116 | 70 | Kỷ Hợi · Đinh Mão · Canh Dần · Bính Tý | dụng Mộc. Dụng thần mộc; vận mộc (tài) tốt, vận thuỷ trung bình, vận hoả kém | Cực nhược (14%), Phù ức → dụng Kim, kỵ Hoả | Khác |

¹ tbct-14: Sách in giờ Ất Dậu; ngày Đinh thì giờ Dậu phải là Kỷ Dậu (Ngũ Thử Độn), coi là lỗi in.

## 4. Cách tái tạo

Chạy `npm run compare:sach` từ gốc repo. Thêm lá số: sửa `tests/fixtures/nguhanh-sach.json` (ghi trang, câu sách nói về dụng thần), chạy lại lệnh, rồi sửa con số kỳ vọng trong `tests/nguhanh-sach.test.ts`.
