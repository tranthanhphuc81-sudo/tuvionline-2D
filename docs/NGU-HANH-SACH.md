# So sánh Dụng thần: engine ngũ hành và lá số mẫu trong sách

> Sinh tự động bằng `npm run compare:sach` (`scripts/compare-sach.ts`) từ `tests/fixtures/nguhanh-sach.json`. Đừng sửa tay.
> 91 lá số chọn ngày 12/11/2026 từ hai sách chủ dự án cung cấp ở `docs/sach/`: 26 lá *Tử Bình Chân Thuyên* (bản dịch Phương Trọng Thầm), 65 lá *Trích Thiên Tủy* (Nhậm Thiết Tiều bình chú). Chỉ lấy lá sách nói rõ dùng gì.
> **Đợt 1** (50 lá) dùng để hiệu chỉnh engine (ARCHITECTURE 14.12). **Đợt 2** (41 lá, đều *Trích Thiên Tủy*) thêm sau khi hiệu chỉnh xong, không dùng khi chỉnh: là phép thử độc lập (14.13).
> Sách cho tứ trụ, không cho ngày sinh, nên engine nhận thẳng tứ trụ (không có Đại Vận). Engine = `DEFAULT_CONFIG` (bản app dùng); cột v0.2 = `REFERENCE_CONFIG`.

**Đọc bảng này thế nào:** đáp án là cách luận của hai trường phái cổ, không phải sự thật khách quan (ARCHITECTURE 14.1). *Tử Bình Chân Thuyên* luận theo cách cục ở tháng sinh; *Trích Thiên Tủy* luận theo vượng suy, gần với cách engine luận hơn. Lá "Khác" hay "Ngược" là chỗ cần người luận xem lại, không tự coi bên nào đúng. Tứ trụ do người đọc chép từ sách, chưa có người thứ hai soát.

- **Trùng:** dụng thần chính của engine là hành sách nói.
- **Gần:** engine chọn một hành sách cũng nói là tốt, hoặc cách luận phụ của engine (ví dụ thuận thế) trùng sách.
- **Ngược:** kỵ thần của engine lại là dụng thần của sách.
- **Khác:** còn lại.

## 1. Kết quả tổng

### Trước và sau hiệu chỉnh (khớp theo ARCHITECTURE 14.1 điều 2)

| Nhóm | Số lá | v0.2 (trước hiệu chỉnh) | Bản app dùng (sau hiệu chỉnh) |
|---|---|---|---|
| Đợt 1 (dùng để chỉnh) | 50 | 24/50 (48%) · trùng 18 · ngược 10 | 25/50 (50%) · trùng 20 · ngược 9 |
| **Đợt 2 (kiểm tra độc lập)** | 41 | 19/41 (46%) · trùng 7 · ngược 11 | 19/41 (46%) · trùng 7 · ngược 11 |
| Tất cả | 91 | 43/91 (47%) · trùng 25 · ngược 21 | 44/91 (48%) · trùng 27 · ngược 20 |

### Bản app dùng, chia theo nhóm

| Nhóm | Số lá | Trùng | Gần | Khác | Ngược |
|---|---|---|---|---|---|
| Tất cả | 91 | 27/91 (30%) | 2/91 (2%) | 42/91 (46%) | 20/91 (22%) |
| Đợt 1 | 50 | 20/50 (40%) | 2/50 (4%) | 19/50 (38%) | 9/50 (18%) |
| Đợt 2 | 41 | 7/41 (17%) | 0/41 (0%) | 23/41 (56%) | 11/41 (27%) |
| Tử Bình Chân Thuyên | 26 | 13/26 (50%) | 1/26 (4%) | 9/26 (35%) | 3/26 (12%) |
| Trích Thiên Tủy | 65 | 14/65 (22%) | 1/65 (2%) | 33/65 (51%) | 17/65 (26%) |
| Sách dùng phù ức, chế hoá | 66 | 17/66 (26%) | 1/66 (2%) | 32/66 (48%) | 16/66 (24%) |
| Sách dùng điều hậu | 11 | 5/11 (45%) | 0/11 (0%) | 5/11 (45%) | 1/11 (9%) |
| Sách dùng tòng, chuyên vượng | 12 | 4/12 (33%) | 1/12 (8%) | 4/12 (33%) | 3/12 (25%) |
| Sách dùng hoá khí | 2 | 1/2 (50%) | 0/2 (0%) | 1/2 (50%) | 0/2 (0%) |

Theo định nghĩa "khớp" của ARCHITECTURE 14.1 điều 2 (dụng thần sách trùng dụng **hoặc hỷ** của engine, không nằm trong kỵ): 44/91 (48%); *Tử Bình Chân Thuyên* 16/26 (62%), *Trích Thiên Tủy* 28/65 (43%). Không so được với legacy vì legacy cần ngày sinh để lập lá số.

Dụng thần engine đổi theo preset (`analyzeSensitivity`, ARCHITECTURE 14.11) ở 12/91 (13%) lá; trong đó trùng sách 3 lá.

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
| tbct-13 | 230 | Mậu Thân · Canh Thân · Bính Thìn · Mậu Tuất | dụng Kim. Tòng Tài cách | Cực nhược (13%), Thuận thế → dụng Kim, kỵ Hoả · Tòng Thế: Giả | Trùng |
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
| tbct-26 (Tham Chính) | 296 | Giáp Ngọ · Kỷ Tỵ · Quý Mùi · Mậu Ngọ | dụng Hoả. Quý nhược vô căn, hợp thành Quý hoá hoả, cách khá chân | Cực nhược (13%), Thuận thế → dụng Hoả, kỵ Thuỷ · Tòng Thế: Giả | Trùng |

## 3. Trích Thiên Tủy, đợt 1

| Mã | Trang | Tứ trụ (Năm · Tháng · Ngày · Giờ) | Sách | Engine | Khớp |
|---|---|---|---|---|---|
| ttt-11 | 24–25 | Giáp Dần · Nhâm Thân · Quý Tỵ · Quý Hợi | dụng Hoả. Thuỷ nhiều mà vượng, mộc bị xung không dùng được, dụng thần tại Tỵ hoả | Thân vượng (77%), Thuận thế → dụng Mộc, kỵ Thổ · Nhuận Hạ: Giả | Khác |
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

## 4. Trích Thiên Tủy, đợt 2 (thêm sau hiệu chỉnh)

| Mã | Trang | Tứ trụ (Năm · Tháng · Ngày · Giờ) | Sách | Engine | Khớp |
|---|---|---|---|---|---|
| ttt-27 | 33 | Kỷ Dậu · Đinh Mão · Canh Thìn · Giáp Thân | dụng Hoả. Dụng quan tinh Đinh hoả, Mão mộc tài tinh | Thân nhược (36%), Phù ức → dụng Kim, kỵ Hoả | Ngược |
| ttt-34 | 35 | Tân Mão · Canh Dần · Giáp Thìn · Bính Dần | dụng Hoả. Dần Mão Thìn hội mộc, Bính thấu khắc Canh Tân, lấy Bính hoả làm dụng thần | Thân vượng (56%), Phù ức → dụng Kim, kỵ Hoả | Ngược |
| ttt-35 | 35 | Canh Dần · Canh Thìn · Giáp Dần · Đinh Mão | dụng Kim. Thìn thổ đương quyền sinh Canh, Đinh không hại Canh, lấy sát làm dụng thần | Thân nhược (39%), Phù ức → dụng Mộc, kỵ Kim | Ngược |
| ttt-36 | 36 | Quý Tỵ · Bính Thìn · Bính Ngọ · Canh Dần | dụng Kim. Thìn tiết hoả sinh kim, Canh kim được sinh có lực làm dụng thần | Trung hoà (53%), Giữ trung hoà → dụng Thuỷ, kỵ Hoả | Khác |
| ttt-52 | 42 | Nhâm Dần · Giáp Thìn · Đinh Hợi · Kỷ Dậu | dụng Thổ. Quan sinh ấn, ấn sinh nhật chủ, dụng thực thần Kỷ thổ | Thân nhược (37%), Phù ức → dụng Mộc, kỵ Kim | Khác |
| ttt-58 | 43 | Mậu Tuất · Tân Dậu · Mậu Tuất · Tân Dậu | dụng Kim. Hai khí thổ kim thành tượng, dụng thần Tân kim (thực thương) | Thân nhược (29%), Phù ức → dụng Hoả, kỵ Thuỷ | Khác |
| ttt-82 | 53 | Quý Mão · Bính Thìn · Giáp Thìn · Bính Dần | dụng Thổ (cũng tốt: Hoả). Thân vượng dụng tài, Bính thực sinh tài là hỷ thần, kỵ Quý thuỷ | Trung hoà (43%), Giữ trung hoà → dụng Kim, kỵ Thổ · đổi theo preset | Ngược |
| ttt-91 | 57 | Kỷ Tỵ · Canh Ngọ · Bính Ngọ · Giáp Ngọ | dụng Thổ (cũng tốt: Kim). Vận Đinh Mão, Bính Dần làm dụng thần thổ, kim bị thương tổn | Thân vượng (67%), Điều hậu → dụng Thuỷ, kỵ Hoả | Khác |
| ttt-107 | 68 | Tân Tỵ · Đinh Dậu · Đinh Dậu · Tân Sửu | dụng Thổ (cũng tốt: Kim). Dụng thần thực thương, vận tài rất tốt | Thân nhược (17%), Phù ức → dụng Hoả, kỵ Thuỷ | Khác |
| ttt-112 | 69 | Quý Dậu · Giáp Tý · Mậu Tý · Mậu Ngọ | dụng Kim (cũng tốt: Thuỷ). Dụng thần thực thương, vận tài cũng được (vận thực thương tốt hơn) | Thân nhược (23%), Điều hậu → dụng Hoả, kỵ Thuỷ | Khác |
| ttt-146 | 82 | Nhâm Thân · Đinh Mùi · Đinh Mùi · Quý Mão | dụng Kim. Nhâm toạ Thân kim, hợp mà không hoá, Thân kim là dụng thần | Trung hoà (47%), Giữ trung hoà → dụng Kim, kỵ Thổ | Trùng |
| ttt-151 | 83 | Nhâm Thìn · Nhâm Tý · Bính Dần · Quý Tỵ | dụng Mộc. Sát thế mạnh, ấn tinh dụng thần đắc lực | Thân nhược (26%), Phù ức → dụng Mộc, kỵ Kim · đổi theo preset | Trùng |
| ttt-160 | 86 | Kỷ Sửu · Tân Mùi · Bính Dần · Kỷ Sửu | dụng Mộc. Hoả thổ thương quan trùng điệp, Giáp mộc tàng trong Dần làm dụng thần | Thân nhược (30%), Điều hậu → dụng Thuỷ, kỵ Hoả | Khác |
| ttt-167 | 88 | Nhâm Thân · Tân Hợi · Tân Dậu · Canh Dần | dụng Mộc. Kim thuỷ thương quan, toàn tỷ kiếp, dụng thần Dần mộc là tài | Trung hoà (48%), Điều hậu → dụng Hoả, kỵ Thuỷ | Khác |
| ttt-168 | 88 | Quý Hợi · Tân Dậu · Mậu Thân · Kỷ Mùi | dụng Thổ. Thương quan dụng kiếp: kiếp tài ở giờ Mùi thông căn làm dụng thần | Thân nhược (26%), Phù ức → dụng Hoả, kỵ Thuỷ | Khác |
| ttt-169 | 88 | Kỷ Mùi · Quý Dậu · Mậu Tuất · Canh Thân | dụng Thổ. Thổ kim thương quan, kim khí quá trọng, lấy kiếp làm dụng thần | Thân nhược (33%), Phù ức → dụng Hoả, kỵ Thuỷ | Khác |
| ttt-171 | 88 | Mậu Thân · Kỷ Mùi · Bính Tuất · Kỷ Sửu | dụng Hoả. Sinh tháng Mùi hoả khí còn thừa, lấy Đinh hoả tàng trong Mùi làm dụng | Thân nhược (17%), Điều hậu → dụng Thuỷ, kỵ Hoả | Ngược |
| ttt-172 | 89 | Mậu Thìn · Canh Thân · Kỷ Dậu · Quý Dậu | dụng Thổ. Thương quan dụng kiếp | Thân nhược (22%), Phù ức → dụng Hoả, kỵ Thuỷ | Khác |
| ttt-173 | 89 | Canh Thìn · Kỷ Mão · Nhâm Thìn · Canh Tý | dụng Mộc. Thìn không chế được thuỷ mà sinh kim trợ thuỷ, lấy Mão mộc làm dụng thần | Trung hoà (42%), Giữ trung hoà → dụng Hoả, kỵ Mộc · đổi theo preset | Ngược |
| ttt-174 | 89 | Ất Dậu · Mậu Dần · Quý Dậu · Quý Sửu | dụng Mộc. Ấn tinh vượng, Dậu Sửu hợp kim, lấy Dần mộc làm dụng thần | Trung hoà (49%), Giữ trung hoà → dụng Hoả, kỵ Mộc · đổi theo preset | Ngược |
| ttt-175 | 89 | Kỷ Mão · Canh Ngọ · Giáp Dần · Đinh Mão | dụng Hoả. Hai Mão một Dần, nhật nguyên cường vượng, lấy Đinh hoả làm dụng | Thân nhược (34%), Điều hậu → dụng Thuỷ, kỵ Hoả | Ngược |
| ttt-176 | 90 | Bính Tý · Ất Mùi · Bính Thìn · Ất Mùi | dụng Thổ. Tứ trụ vô kim, Tý thuỷ khô kiệt, lấy thổ làm dụng | Trung hoà (49%), Giữ trung hoà → dụng Kim, kỵ Thổ | Ngược |
| ttt-177 | 90 | Nhâm Tuất · Kỷ Dậu · Mậu Tuất · Ất Mão | dụng Mộc. Thổ kim thương quan, Nhâm nhuận thổ tiết kim sinh mộc, lấy quan làm dụng thần | Trung hoà (41%), Giữ trung hoà → dụng Hoả, kỵ Kim | Khác |
| ttt-178 | 90 | Canh Ngọ · Kỷ Mão · Nhâm Thân · Kỷ Dậu | dụng Thổ. Quan ấn thông căn, nhật nguyên sinh vượng, lấy quan làm dụng thần | Trung hoà (42%), Giữ trung hoà → dụng Thuỷ, kỵ Mộc · đổi theo preset | Khác |
| ttt-179 | 90 | Tân Mùi · Tân Mão · Nhâm Thìn · Kỷ Dậu | dụng Thổ. Thuỷ mộc thương quan, thuỷ có căn, lấy Kỷ thổ quan tinh làm dụng | Thân nhược (38%), Phù ức → dụng Kim, kỵ Hoả | Khác |
| ttt-180 | 90 | Quý Dậu · Kỷ Mùi · Bính Ngọ · Quý Tỵ | dụng Thuỷ. Hoả quá mạnh thổ táo, quan tinh thấu, lấy quan tinh làm dụng thần | Thân nhược (35%), Phù ức → dụng Mộc, kỵ Kim | Khác |
| ttt-185 | 91 | Ất Dậu · Tân Tỵ · Mậu Ngọ · Bính Thìn | dụng Kim. Hoả thổ đương quyền, Ất mộc vô căn, lấy Tân kim làm dụng thần | Thân vượng (68%), Điều hậu → dụng Thuỷ, kỵ Hoả | Khác |
| ttt-186 | 92 | Đinh Dậu · Ất Tỵ · Mậu Ngọ · Bính Thìn | dụng Kim. Như lá trên, cũng lấy Tân kim (trong Dậu) làm dụng thần, không luận quan ấn | Thân vượng (74%), Điều hậu → dụng Thuỷ, kỵ Hoả | Khác |
| ttt-198 | 97 | Canh Tuất · Mậu Dần · Quý Mùi · Quý Sửu | dụng Kim. Lấy Canh kim làm dụng thần: hoá quan sát cường bạo, sinh nhật nguyên | Thân nhược (36%), Phù ức → dụng Kim, kỵ Hoả | Trùng |
| ttt-199 | 98 | Bính Tý · Kỷ Hợi · Tân Dậu · Kỷ Hợi | dụng Thổ. Thuỷ thế càn rỡ, không dụng quan được, phải dụng Kỷ thổ ấn tinh | Thân nhược (39%), Điều hậu → dụng Hoả, kỵ Thuỷ | Khác |
| ttt-201 | 99 | Nhâm Tuất · Mậu Thân · Canh Dần · Bính Tuất | dụng Hoả. Chi toàn thổ kim vượng cực, Bính thấu, Dần Tuất hợp, lấy Bính hoả làm dụng | Thân vượng (64%), Phù ức → dụng Hoả, kỵ Thuỷ | Trùng |
| ttt-211 | 103 | Bính Thìn · Tân Sửu · Canh Thìn · Bính Tý | dụng Thuỷ. Thấp thổ trùng điệp, Bính hợp Tân hoá thuỷ, Bính giờ vô căn, dụng thuỷ không dụng hoả | Thân vượng (61%), Phù ức → dụng Mộc, kỵ Kim | Khác |
| ttt-214 | 104 | Quý Sửu · Đinh Tỵ · Giáp Thìn · Canh Ngọ | dụng Thuỷ. Quý thuỷ toạ Sửu dư khí, lấy Quý làm dụng thần | Thân nhược (24%), Phù ức → dụng Thuỷ, kỵ Thổ | Trùng |
| ttt-215 | 104 | Kỷ Mão · Tân Mùi · Bính Tý · Tân Mão | dụng Kim. Quan tinh bị Mùi thổ khắc quá mức, buộc phải lấy Tân kim làm dụng thần | Trung hoà (40%), Giữ trung hoà → dụng Hoả, kỵ Thổ · đổi theo preset | Khác |
| ttt-220 | 107 | Bính Dần · Canh Dần · Giáp Thân · Ất Sửu | dụng Hoả. Sơ xuân mộc non, trời lạnh, toạ Thân kim, Canh thấu, dụng hoả công kim | Thân vượng (56%), Phù ức → dụng Kim, kỵ Hoả | Ngược |
| ttt-221 | 107 | Canh Tuất · Kỷ Mão · Giáp Dần · Đinh Mão | dụng Thổ. Trọng xuân toạ lộc gặp dương nhận, mộc vượng kim suy, dụng thổ | Thân vượng (63%), Phù ức → dụng Hoả, kỵ Thuỷ | Khác |
| ttt-222 | 107 | Canh Thìn · Nhâm Ngọ · Giáp Thìn · Đinh Mão | dụng Thuỷ. Trọng hạ, Đinh hoả lộ, dụng thuỷ nhuận | Thân nhược (36%), Phù ức → dụng Thuỷ, kỵ Thổ | Trùng |
| ttt-223 | 107 | Canh Tuất · Giáp Thân · Giáp Tuất · Ất Sửu | dụng Thổ. Tài sinh sát vượng, mộc không gốc, dụng thổ tòng | Thân nhược (34%), Phù ức → dụng Thuỷ, kỵ Thổ | Ngược |
| ttt-224 | 108 | Tân Dậu · Canh Tý · Giáp Tý · Bính Dần | dụng Hoả. Trọng đông mộc suy kim lạnh, dụng hoả sưởi ấm, kim cũng được chế | Thân vượng (66%), Phù ức → dụng Thổ, kỵ Mộc · đổi theo preset | Khác |
| ttt-225 | 109 | Bính Tý · Kỷ Hợi · Bính Dần · Mậu Tý | dụng Mộc. Mạnh đông gặp hai Tý, hoả suy thuỷ vượng, lấy mộc làm dụng thần | Thân nhược (39%), Phù ức → dụng Mộc, kỵ Kim · đổi theo preset | Trùng |
| ttt-226 | 109 | Nhâm Ngọ · Nhâm Dần · Nhâm Tuất · Canh Tuất | dụng Kim. Can thuỷ suy, chi hoả vượng, lấy kim làm dụng thần | Thân nhược (37%), Phù ức → dụng Thuỷ, kỵ Thổ | Khác |

¹ tbct-14: Sách in giờ Ất Dậu; ngày Đinh thì giờ Dậu phải là Kỷ Dậu (Ngũ Thử Độn), coi là lỗi in.

## 5. Cách tái tạo

Chạy `npm run compare:sach` từ gốc repo. Thêm lá số: sửa `tests/fixtures/nguhanh-sach.json` (ghi trang, câu sách nói về dụng thần), chạy lại lệnh, rồi sửa con số kỳ vọng trong `tests/nguhanh-sach.test.ts`.
