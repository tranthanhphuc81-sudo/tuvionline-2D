# So sánh Dụng Thần: bản legacy và engine ngũ hành

> Sinh tự động ngày 11/11/2026 để làm đầu vào cho bước 🔴 3C.1 (`docs/PROMPT-KIT-NGU-HANH.md`). Không phải tài liệu kiến trúc.
> Mẫu: 3000 lá số ngẫu nhiên (seed cố định 20261111), năm sinh 1950–2009, đủ 12 giờ. Tứ trụ lấy từ `batTuChart` của app (đã xử lý Lập Xuân, giờ Tý muộn), nên hai bên dùng CÙNG một bộ tứ trụ.
> Legacy = `batTuReading` (`src/core/battu/reading.ts`). Engine = `src/core/nguhanh` với `DEFAULT_CONFIG` (v0.2 của `docs/ngu-hanh-engine` cộng hiệu chỉnh theo sách ngày 12/11/2026, ARCHITECTURE 14.12). Số của bản v0.2 gốc (36,1% / 61,2% / 40,5%) giữ trong ARCHITECTURE 14 và test `REFERENCE_CONFIG`.

## 1. Kết quả tổng

| Chỉ số | Giá trị |
|---|---|
| Dụng thần chính trùng nhau | 35.7% |
| Dụng thần engine nằm trong danh sách "dụng" của legacy | 60.3% |
| **Đảo chiều** (dụng của bên này là kỵ của bên kia) | **42.0%** |
| Cùng kết luận vượng/nhược (bỏ qua ca engine "trung hoà") | 73.6% |
| Legacy kết luận Thân vượng | 14.4% |
| Engine: vượng / trung hoà / nhược | 34.0% / 22.8% / 43.2% |
| Phương pháp engine dùng: Phù ức / Điều hậu / Trung hoà / Thuận thế | 58.9% / 14.8% / 19.9% / 6.4% |
| Engine xét tòng/chuyên vượng: Chân / Giả / Không thành | 1.2% / 5.2% / 16.5% |

## 2. Nguyên nhân chính của độ lệch

1. **Luật vượng/nhược của legacy rất chặt:** `thanVuong = dacLenh && giup >= hao`, chỉ đếm 3 thiên can lộ, không tính tàng can, không tính sức của địa chi.
   - Sinh ngoài mùa (1787 lá) thì legacy **luôn** kết luận nhược; engine đồng ý nhược ở 71.0%, thấy vượng ở 5.8% (nhật chủ có gốc mạnh ở địa chi hoặc được hợp cục), phần còn lại trung hoà.
   - Sinh đúng mùa (1213 lá) mà 3 can lộ "hao" nhiều hơn "giúp" thì legacy vẫn kết luận nhược (782 lá); engine thấy vượng ở 509 lá trong số đó (65.1%), vì chi tháng có hệ số lớn và tàng can được tính. **Đây là nguồn đảo chiều lớn nhất.**
2. **Legacy chỉ có một chiến lược** (Phù ức + mẫu "Sát trọng dụng Ấn"); không có Điều hậu, Thông quan, Tòng cách. Engine dùng Điều hậu ở 14.8% lá số.
3. **Legacy chọn dụng thần chính = hành ít chữ nhất** trong danh sách dụng (đếm thô 8 chữ). Engine chọn theo nguyên nhân gây mất cân bằng (vd. nhược vì Tài nặng thì dùng Tỷ Kiếp, không dùng Ấn).
4. **Engine có vùng "trung hoà"** (40–55% hỗ trợ) mà legacy không có; với vùng này engine chỉ bù hành yếu nhất, khác hẳn logic legacy.

## 3. Bộ 24 lá số mẫu để chủ dự án/người luận gán nhãn

> **12/11/2026:** không nhờ được người luận nên phần đối chiếu với đáp án chuyển sang bộ lá số mẫu trong sách (`docs/NGU-HANH-SACH.md`, ARCHITECTURE 14.1). Bảng dưới giữ làm mẫu xem câu chữ; cột cuối không còn là việc phải điền.

Mục đích ban đầu: có "đáp án" độc lập trước khi chốt. Chọn phân tầng theo loại lệch. Cột cuối để trống: điền dụng thần đúng theo người luận (hoặc theo sách Phần 2 trong `docs/`), ghi nguồn. Đáp án của người luận là một quy ước chuyên môn (sự đồng thuận của nghề), không phải sự thật khách quan; các trường phái có thể cho đáp án khác nhau trên cùng một lá số. Bộ golden vì vậy chỉ là mốc tham chiếu, không phải chuẩn tuyệt đối: khi engine khác đáp án, ghi rõ hai bên và nguồn, không tự coi bên nào là đúng.

| # | Loại | Ngày sinh (dương) | Tứ trụ (Năm · Tháng · Ngày · Giờ) | Legacy | Engine | Đáp án người luận |
|---|---|---|---|---|---|---|
| 1 | Trùng dụng thần chính | 26/12/1977 giờ Hợi | Đinh Tỵ · Nhâm Tý · Đinh Tỵ · Tân Hợi | Nhược (Tử, giúp 1/hao 2) → dụng Mộc, Hoả; kỵ Thuỷ, Kim | Thân nhược (27%), Phù ức → dụng Mộc, hỷ Hoả; kỵ Kim |  |
| 2 | Trùng dụng thần chính | 02/05/1982 giờ Tuất | Nhâm Tuất · Giáp Thìn · Ất Dậu · Bính Tuất | Nhược (Tù, giúp 2/hao 1) → dụng Thuỷ, Mộc; kỵ Kim, Thổ | Thân nhược (31%), Phù ức → dụng Thuỷ, hỷ Mộc; kỵ Thổ |  |
| 3 | Trùng dụng thần chính | 27/04/1975 giờ Hợi | Ất Mão · Canh Thìn · Quý Mão · Quý Hợi | Nhược (Tử, giúp 2/hao 1) → dụng Kim, Thuỷ; kỵ Thổ, Hoả | Thân nhược (35%), Phù ức → dụng Kim, hỷ Thuỷ; kỵ Hoả |  |
| 4 | Trùng dụng thần chính | 24/03/1955 giờ Tý | Ất Mùi · Kỷ Mão · Giáp Thân · Giáp Tý | Vượng (Vượng, đắc lệnh, giúp 2/hao 1) → dụng Hoả, Thổ, Kim; kỵ Thuỷ, Mộc | Thân vượng (81%), Phù ức → dụng Hoả, hỷ Thổ; kỵ Thuỷ · Khúc Trực: Không thành cách |  |
| 5 | Lệch nhẹ (không đảo chiều) | 22/12/2001 giờ Tuất | Tân Tỵ · Canh Tý · Kỷ Mùi · Giáp Tuất | Nhược (Tù, giúp 0/hao 3) → dụng Hoả, Thổ; kỵ Mộc, Thuỷ | Thân nhược (32%), Phù ức → dụng Thổ, hỷ Hoả; kỵ Mộc |  |
| 6 | Lệch nhẹ (không đảo chiều) | 06/01/1957 giờ Tỵ | Bính Thân · Tân Sửu · Mậu Dần · Đinh Tỵ | Vượng (Vượng, đắc lệnh, giúp 2/hao 1) → dụng Kim, Thuỷ, Mộc; kỵ Hoả, Thổ | Thân vượng (63%), Phù ức → dụng Kim, hỷ Thuỷ; kỵ Hoả |  |
| 7 | Lệch nhẹ (không đảo chiều) | 03/06/1962 giờ Tỵ | Nhâm Dần · Ất Tỵ · Nhâm Thân · Ất Tỵ | Nhược (Tù, giúp 1/hao 2) → dụng Kim, Thuỷ; kỵ Thổ, Hoả | Thân nhược (39%), Phù ức → dụng Thuỷ, hỷ Kim; kỵ Thổ |  |
| 8 | Đảo chiều | 12/10/1963 giờ Mùi | Quý Mão · Nhâm Tuất · Mậu Tý · Kỷ Mùi | Nhược (Vượng, đắc lệnh, giúp 1/hao 2) → dụng Hoả, Thổ; kỵ Mộc, Thuỷ | Thân vượng (57%), Phù ức → dụng Mộc, hỷ Thuỷ; kỵ Kim |  |
| 9 | Đảo chiều | 08/12/1968 giờ Mùi | Mậu Thân · Giáp Tý · Nhâm Tý · Đinh Mùi | Nhược (Vượng, đắc lệnh, giúp 0/hao 3) → dụng Kim, Thuỷ; kỵ Thổ, Hoả | Thân vượng (71%), Phù ức → dụng Thổ, hỷ Hoả; kỵ Mộc |  |
| 10 | Đảo chiều | 24/12/1969 giờ Ngọ | Kỷ Dậu · Bính Tý · Quý Dậu · Mậu Ngọ | Nhược (Vượng, đắc lệnh, giúp 0/hao 3) → dụng Kim, Thuỷ; kỵ Thổ, Hoả | Thân vượng (70%), Phù ức → dụng Thổ, hỷ Hoả; kỵ Mộc |  |
| 11 | Đảo chiều | 05/03/1980 giờ Hợi | Canh Thân · Kỷ Mão · Đinh Sửu · Tân Hợi | Nhược (Tướng, đắc lệnh, giúp 0/hao 3) → dụng Mộc, Hoả; kỵ Thuỷ, Kim | Trung hoà (53%), Giữ trung hoà → dụng Hoả, hỷ Thổ; kỵ Mộc |  |
| 12 | Đảo chiều | 15/08/1982 giờ Tuất | Nhâm Tuất · Mậu Thân · Canh Ngọ · Bính Tuất | Nhược (Vượng, đắc lệnh, giúp 1/hao 2) → dụng Thổ, Kim; kỵ Hoả, Mộc | Thân vượng (62%), Phù ức → dụng Hoả, hỷ Mộc; kỵ Thuỷ |  |
| 13 | Đảo chiều | 26/12/1959 giờ Dần | Kỷ Hợi · Bính Tý · Nhâm Ngọ · Nhâm Dần | Nhược (Vượng, đắc lệnh, giúp 1/hao 2) → dụng Kim, Thuỷ; kỵ Thổ, Hoả | Thân vượng (58%), Phù ức → dụng Thổ, hỷ Hoả; kỵ Mộc |  |
| 14 | Đảo chiều | 02/09/1996 giờ Dần | Bính Tý · Bính Thân · Nhâm Dần · Nhâm Dần | Nhược (Tướng, đắc lệnh, giúp 1/hao 2) → dụng Kim, Thuỷ; kỵ Thổ, Hoả | Thân vượng (64%), Phù ức → dụng Mộc, hỷ Hoả; kỵ Kim |  |
| 15 | Đảo chiều | 11/10/2004 giờ Hợi | Giáp Thân · Giáp Tuất · Quý Hợi · Quý Hợi | Nhược (Tử, giúp 1/hao 2) → dụng Kim, Thuỷ; kỵ Thổ, Hoả | Trung hoà (51%), Giữ trung hoà → dụng Hoả, hỷ Kim; kỵ Mộc |  |
| 16 | Engine dùng Điều hậu | 19/11/2009 giờ Dậu | Kỷ Sửu · Ất Hợi · Mậu Thìn · Tân Dậu | Nhược (Tù, giúp 1/hao 2) → dụng Hoả, Thổ; kỵ Mộc, Thuỷ | Thân nhược (26%), Điều hậu → dụng Hoả, hỷ Mộc; kỵ Thuỷ |  |
| 17 | Engine dùng Điều hậu | 15/06/1987 giờ Tuất | Đinh Mão · Bính Ngọ · Ất Mùi · Bính Tuất | Nhược (Hưu, giúp 0/hao 3) → dụng Thuỷ, Mộc; kỵ Kim, Thổ | Thân nhược (19%), Điều hậu → dụng Thuỷ, hỷ Kim; kỵ Hoả · Tòng Nhi: Không thành cách |  |
| 18 | Engine dùng Điều hậu | 27/05/1988 giờ Ngọ | Mậu Thìn · Đinh Tỵ · Nhâm Ngọ · Bính Ngọ | Nhược (Tù, giúp 0/hao 3) → dụng Kim, Thuỷ; kỵ Thổ, Hoả | Cực nhược (13%), Điều hậu → dụng Thuỷ, hỷ Kim; kỵ Hoả · Tòng Tài: Không thành cách |  |
| 19 | Engine: Chân tòng/chuyên vượng | 10/03/1958 giờ Mão | Mậu Tuất · Ất Mão · Bính Tuất · Tân Mão | Nhược (Tướng, đắc lệnh, giúp 1/hao 2) → dụng Mộc, Hoả; kỵ Thuỷ, Kim | Thân vượng (76%), Thuận thế → dụng Thổ, hỷ Hoả; kỵ Thuỷ · Tòng Cường: Chân |  |
| 20 | Engine: Chân tòng/chuyên vượng | 02/10/2009 giờ Dậu | Kỷ Sửu · Quý Dậu · Canh Thìn · Ất Dậu | Nhược (Vượng, đắc lệnh, giúp 1/hao 2) → dụng Thổ, Kim; kỵ Hoả, Mộc | Thân vượng (80%), Thuận thế → dụng Thuỷ, hỷ Kim; kỵ Hoả · Tòng Cách (Kim chuyên vượng): Chân |  |
| 21 | Engine: Chân tòng/chuyên vượng | 03/01/1955 giờ Thìn | Giáp Ngọ · Bính Tý · Giáp Tý · Mậu Thìn | Nhược (Tướng, đắc lệnh, giúp 1/hao 2) → dụng Thuỷ, Mộc; kỵ Kim, Thổ | Thân vượng (76%), Thuận thế → dụng Hoả, hỷ Mộc; kỵ Kim · Tòng Cường: Chân |  |
| 22 | Engine: Giả tòng/chuyên vượng | 10/08/1953 giờ Tý | Quý Tỵ · Canh Thân · Quý Tỵ · Nhâm Tý | Vượng (Tướng, đắc lệnh, giúp 3/hao 0) → dụng Mộc, Hoả, Thổ; kỵ Kim, Thuỷ | Cực vượng (86%), Thuận thế → dụng Mộc, hỷ Thuỷ; kỵ Thổ · Nhuận Hạ: Giả |  |
| 23 | Engine: Giả tòng/chuyên vượng | 13/03/1986 giờ Mão | Bính Dần · Tân Mão · Bính Thìn · Tân Mão | Nhược (Tướng, đắc lệnh, giúp 1/hao 2) → dụng Mộc, Hoả; kỵ Thuỷ, Kim | Thân vượng (80%), Thuận thế → dụng Thổ, hỷ Hoả; kỵ Thuỷ · Tòng Cường: Giả |  |
| 24 | Engine: Giả tòng/chuyên vượng | 17/09/1980 giờ Thân | Canh Thân · Ất Dậu · Quý Tỵ · Canh Thân | Vượng (Tướng, đắc lệnh, giúp 2/hao 1) → dụng Mộc, Hoả, Thổ; kỵ Kim, Thuỷ | Cực vượng (86%), Thuận thế → dụng Mộc, hỷ Thuỷ; kỵ Thổ · Tòng Cường: Giả |  |

## 4. Cách tái tạo

Chạy từ gốc repo: `npm run compare:dungthan` (seed cố định nên ra đúng bảng này). Script ở `scripts/compare-dung-than.ts`, chạy engine đã port ở `src/core/nguhanh`; bản tham chiếu `docs/ngu-hanh-engine` giữ nguyên để đối chiếu.
