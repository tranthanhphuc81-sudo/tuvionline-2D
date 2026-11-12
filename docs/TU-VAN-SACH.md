# Tư vấn tính năng từ hai sách trong `docs/sach/`

> Viết ngày 12/11/2026, theo yêu cầu của chủ dự án. Bản tư vấn trước đó (trên máy cơ quan) không được lưu lại, nên đây là bản làm lại.
> Đây là đề xuất, chưa có quyết định nào. Muốn làm mục nào thì ghi quyết định vào ARCHITECTURE trước, như mọi phase khác.

## 1. Hai sách và cách đã đọc

| Sách | File | Đọc thế nào |
|---|---|---|
| *Tử Bình Chân Thuyên* (Thẩm Hiếu Chiêm, Từ Nhạc Ngô bình chú, bản dịch Phương Trọng Thầm) | 303 trang, bản quét ảnh, không có lớp chữ | Đọc mục lục 48 chương (trang 2–3) và xem mẫu các phần. Phần cuối, khoảng từ trang 200, luận từng Can ngày theo tháng sinh, kèm lá số ví dụ. KHÔNG đọc hết từng trang |
| *Trích Thiên Tủy* (Lưu Bá Ôn, Nhậm Thiết Tiều bình chú, bản sachhoc.com) | 202 trang, có lớp chữ | Đọc mục lục: Phần I "Thông thần luận" 34 chương, Phần II "Luận lục thân" 29 chương |

Hai sách đã dùng trong app: 121 lá số mẫu (`src/content/nguhanh/sach.json`) để hiệu chỉnh và kiểm engine ngũ hành, và mục "Lá số cổ giống bạn" (ARCHITECTURE 14.12–14.14).

## 2. App đã có gì so với hai sách

| Nội dung trong sách | App |
|---|---|
| Can chi, âm dương, sinh vượng tử tuyệt, tàng can (TBCT ch.1–3; TTT ch.7–9) | Có: engine Bát Tự |
| Suy vượng của Nhật Chủ (TBCT ch.6; TTT ch.17) | Có: chấm điểm 5 hành, vượng/nhược |
| Phù ức, Điều hậu, Thông quan (TTT ch.18, 20, 29, 30; TBCT ch.14) | Có: các cách luận của engine ngũ hành |
| Tòng cách, chuyên vượng (TBCT ch.22; TTT II ch.12, 14) | Có: Tòng cách 4 điều kiện |
| Hành vận, Đại Vận, lưu niên (TBCT ch.25; TTT II ch.28) | Có: Đại Vận, năm, kiểm chứng bằng các năm đã qua |
| Can hợp, lục hợp, tam hợp, lục xung | Có trong bảng tính điểm, nhưng KHÔNG hiện cho người dùng |
| **Cách cục theo tháng sinh** (TBCT ch.8–21, 31–48; TTT ch.12, 15) | **Chưa có.** Đây là phần lớn nhất của TBCT |
| **Nhân nguyên tư lệnh** (TBCT phụ lục ch.3) | **Chưa có** |
| **Hình, xung, hội, hợp và cách giải** (TBCT ch.5, 7, 17; TTT ch.11, II ch.18–19) | **Chưa có** phần giải thích |
| Thanh trọc, chân thần, giả thần, nguyên lưu (TTT ch.19, 23–26) | Chưa có |
| Lục thân theo cung vị và thập thần (TBCT ch.23–24; TTT II ch.1–4) | Chưa có |
| Tính tình (TBCT ch.4; TTT II ch.24) | Chỉ có nét của Can ngày (legacy) |
| Hoá khí cách (TTT II ch.13, 15) | Chưa có |

**Điều số liệu cho thấy:** engine chỉ khớp sách 45% (`docs/NGU-HANH-SACH.md`). Với *Tử Bình Chân Thuyên*, 55% lá số ở nhóm "khác", vì sách luận theo cách cục ở tháng sinh, còn engine chọn Dụng thần theo cân bằng 5 hành. Phiên trước đã thử sửa quy tắc phù ức mà không cải thiện được (ARCHITECTURE 14.14). Nghĩa là muốn gần sách hơn thì phải thêm một cách luận khác, không phải chỉnh tiếp con số.

## 3. Đề xuất, theo thứ tự ưu tiên

### A. Cách cục theo tháng sinh (ưu tiên cao nhất)

**Nguồn:** TBCT ch.8–16 (dụng thần, thành bại cứu ứng, biến hoá, thuần tạp, cao thấp, tương thần), ch.31–48 (từng cách và thủ vận); TTT ch.12 "Bát cách", ch.15 "Nguyệt lệnh".

**Làm gì:**
- Xác định cách từ chi tháng: can tàng nào thấu lên can năm, tháng, giờ thì lấy làm cách. Tám cách chính: Chính Quan, Thất Sát (Thiên Quan), Tài, Ấn, Thực Thần, Thương Quan, Kiến Lộc, Dương Nhận (Nguyệt Kiếp). Không thấu thì theo can tư lệnh (mục B).
- Theo quy tắc của sách, cách lành (Quan, Tài, Ấn, Thực) cần được bảo vệ; cách dữ (Sát, Thương, Nhận, Kiếp) cần được chế. Từ đó ra **tương thần**: chữ giúp cách thành.
- Xét **thành, bại, cứu, ứng**: cách có bị phá không, có chữ nào cứu không.
- Hiện thành một mục riêng "Cách cục" trên màn Bát Tự, đặt cạnh kết quả của engine ngũ hành. Thêm cách luận thứ hai, không thay engine hiện có.

**Vì sao đáng làm:** đây là xương sống của TBCT, và là phần app thiếu rõ nhất. Có sẵn 56 lá TBCT để kiểm: sách nói cách gì, dụng gì, nên đo được mức khớp ngay bằng `scripts/compare-sach.ts`.

**Rủi ro:** quy tắc thành bại có nhiều ngoại lệ, nên cần nói rõ "cách luận theo sách", như cách engine ngũ hành đang làm. Việc này lớn, ước tương đương Phase 3C.

### B. Nhân nguyên tư lệnh (làm cùng A)

**Nguồn:** TBCT phụ lục ch.3 "chi tàng nhân nguyên tư lệnh".

**Làm gì:** biết can tàng nào đang cầm quyền theo số ngày từ tiết khí đầu tháng tới ngày sinh. Engine lịch đã có tiết khí nên tính được. Hiện thêm một dòng trên thẻ trụ tháng, và dùng cho mục A.

**Công việc:** nhỏ, nhưng cần đối chiếu bảng số ngày trong sách. Các bản lưu truyền có chênh nhau, nên phải chọn một bảng và ghi lý do.

### C. Hình, xung, hội, hợp và cách giải

**Nguồn:** TBCT ch.5 "hợp nhi bất hợp", ch.7 "hình xung hội hợp giải pháp", ch.17 mộ khố; TTT ch.11 "Phương cục", II ch.18–19 "Chiến cục", "Hợp cục".

**Làm gì:**
- Một bảng các quan hệ trong lá số: can hợp, tam hội, tam hợp, bán hợp, lục hợp, xung, hình, hại.
- Kèm quy tắc của sách: khi nào hợp mà không hoá, khi nào xung được giải.
- Có thể vẽ đường nối lên 4 thẻ trụ, giống đường tam phương trên lá số Tử Vi.

**Vì sao:** engine đã dùng các bảng này để chấm điểm nhưng người dùng không thấy. Phần này giải thích được "vì sao hành này mạnh lên", hợp giọng "bài học nhỏ" của app.

**Công việc:** vừa phải; dữ liệu đã có, chủ yếu thêm phần hình, hại, phá và câu chữ.

### D. Dòng chảy của khí (nguyên lưu, thông quan)

**Nguồn:** TTT ch.19 "Nguyên lưu", ch.20 "Thông quan", ch.28 "Thuận nghịch".

**Làm gì:** vẽ khí sinh từ đâu, chảy qua hành nào, dừng ở đâu. Ví dụ "Kim sinh Thuỷ, Thuỷ sinh Mộc, dừng ở Mộc". Hiện thành sơ đồ trên hình 5 nút đã có.

**Vì sao:** trực quan, giải thích tốt, và gắn với mô hình cân bằng 5 hành đã làm. Nên tránh phần "thanh trọc" (TTT ch.23–24) theo nghĩa xếp lá số cao hay thấp, vì dễ thành phán xét người dùng.

### E. Tính tình theo ngũ hành và thập thần

**Nguồn:** TTT II ch.24 "Tính tình"; TBCT ch.4.

**Làm gì:** mô tả tính cách từ hành vượng, suy và thập thần nổi bật, viết bằng lời của app. Hợp mục "Tóm lại về bạn".

**Lưu ý:** viết theo hướng gợi ý, không gán nhãn xấu.

### F. Lục thân theo cung vị và thập thần (cẩn thận)

**Nguồn:** TBCT ch.23–24; TTT II ch.1–4.

**Làm gì:** chỉ phần giáo dục: trụ năm ứng ông bà, trụ tháng ứng cha mẹ và anh chị em, trụ ngày ứng người phối ngẫu, trụ giờ ứng con cái; sao nào đại diện cho ai.

**Không làm:** đoán sinh tử, ly hôn, khắc chồng khắc vợ, hiếm muộn. Các phần này vướng danh sách từ cấm (ARCHITECTURE 12.8), chính sách Google Play, và dễ gây tổn thương.

### G. Lời sách cho Can ngày theo tháng sinh

**Nguồn:** phần cuối TBCT, khoảng từ trang 200 tới 303: từng Can ngày sinh mỗi tháng, có ý chính và lá số ví dụ.

**Làm gì:** tra theo Can ngày × tháng sinh của hồ sơ, hiện ý chính và lá số ví dụ gần nhất. Mở rộng được từ "Lá số cổ giống bạn".

**Rủi ro:** phần này phải đọc và tóm tắt bằng mắt từ ảnh quét, khoảng 100 trang, nên tốn công. Phải viết lại bằng lời của app (xem mục 5).

### H. Hoá khí cách

**Nguồn:** TTT II ch.13 "Hoá tượng", ch.15 "Giả hoá"; TBCT ch.22 "ngoại cách".

**Làm gì:** nhận ra lá số Can ngày hợp hoá thành công, như Tòng cách đang làm. Sách mẫu chỉ có 3 lá thuộc loại này nên khó kiểm, vì vậy để sau.

## 4. Không nên thêm

| Nội dung | Lý do |
|---|---|
| **Thần sát** (Thiên Ất, Đào Hoa, Dịch Mã…) | Chính TBCT ch.21 "Luận tinh thần vô quan cách cục" nói thần sát không liên quan tới cách cục. Thêm vào là đi ngược sách |
| Bệnh tật (TTT II ch.25) | Chính sách sức khoẻ của Google Play, và nằm trong danh sách từ cấm đọc |
| Thọ yểu, giàu nghèo, quý tiện (TTT II ch.5 "Hà tri", ch.26–27) | Phán xét số phận, trái giọng "tham khảo văn hoá" của app |
| Nữ mệnh (TTT II ch.6) | Nhiều quan niệm cũ về vai trò phụ nữ, khó đưa vào mà không gây phản cảm |
| Tiểu nhi (TTT II ch.7) | Đoán về trẻ nhỏ, nhạy cảm |

## 5. Bản quyền: đọc trước khi làm mục nào

- Cả hai là **bản dịch tiếng Việt**: TBCT bản dịch Phương Trọng Thầm, TTT bản trên sachhoc.com. Bản gốc chữ Hán đã cũ, nhưng **bản dịch có thể vẫn còn bản quyền**.
- **Được dùng:** quy tắc và kiến thức (cách xác định cách cục, tư lệnh, hình xung), và dữ kiện như tứ trụ của lá số mẫu. Các thứ này không thuộc bản quyền.
- **Không chép:** câu văn của bản dịch vào app. Mọi câu chữ phải viết lại bằng lời của app, giống cách đã làm với chỉ tay (`src/content/palm`).
- Nếu muốn trích nguyên văn, hoặc ghi tên bản dịch trong app, cần hỏi người dịch, nhà xuất bản hoặc chủ trang web.

## 6. Thứ tự gợi ý

1. **B rồi A:** tư lệnh và cách cục, đo khớp với 56 lá TBCT. Nên viết kit riêng như `docs/PROMPT-KIT-NGU-HANH.md`, bắt đầu bằng bước quyết định (cách cục hiện ở đâu, xử lý thế nào khi cách cục và engine ngũ hành cho Dụng thần khác nhau).
2. **C:** hình xung hội hợp; dữ liệu có sẵn, giá trị giải thích cao.
3. **D, E:** sơ đồ dòng khí và tính tình, làm giàu phần đọc.
4. **G, F, H:** để sau, tuỳ thời gian và mức quan tâm.

**Cần chủ dự án quyết:** có làm A không; nếu làm, cách cục chỉ để tham khảo hay được dùng khi Thầy đọc và trong "Tóm lại về bạn".
