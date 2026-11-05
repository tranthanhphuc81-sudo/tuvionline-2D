# Tài liệu đặt hàng tranh, nhân vật và âm thanh

## 1. Giới thiệu

**Lý Số Trọn Bộ** là app Android tiếng Việt về văn hoá lý số phương Đông. Mỗi ngày người dùng có thể đi qua một đạo quán hư cấu gồm 5 trạm trước khi vào phòng làm việc của một vị thầy, nơi thầy đọc kết quả cho họ nghe.

Hiện app đã chạy với tranh, nhân vật và âm thanh **giữ chỗ**. Đơn hàng này thay chúng bằng bản thật. Bản giữ chỗ cho thấy bố cục, không phải phong cách cần theo. Có thể xem trên https://lyso-tron-bo.pages.dev.

**Phải thay:** 33 file tranh, 2 file nhân vật, 6 file âm thanh.
**Không cần làm:** khói, lá rơi, đom đóm, gợn nước và màu theo giờ trong ngày đều do app tạo.

## 2. Phong cách

- Sơn mài kết hợp thuỷ mặc: lớp phẳng, chiều sâu bằng sương và ánh sáng, viền vàng mảnh.
- Tĩnh, ấm, có chiều sâu, không u ám và không gợi rùng rợn.
- Bảng màu chính: mực `#0d1424`, chàm `#1b2845`, vàng `#d7b571`, hổ phách `#f0a94e`, đỏ son `#8f2a20`, gỗ `#3a2318`, giấy `#e6dac0`, ngọc `#2c5a50`.
- Không có chữ trong tranh, kể cả chữ Hán và chữ giả trang trí. Riêng câu đối Tết chỉ vẽ tờ giấy đỏ để trơn.

## 3. Quy tắc nội dung (bắt buộc)

- Đạo quán hoàn toàn hư cấu, không vẽ lại nơi có thật.
- **Tam Thanh:** ba pho tượng cách điệu, ở xa, trong ánh nến mờ, không rõ nét mặt.
- Không dùng kinh văn, phù chú hay ấn thật làm hoạ tiết.
- Không vẽ tiền, vật phẩm bán, hay bất cứ thứ gì gợi ý thắp hương để được lợi lộc.
- Nhân vật không dựa trên người có thật, không có tên riêng.
- Sản phẩm phải do người đặt hàng toàn quyền sử dụng thương mại. Nếu có dùng công cụ AI hoặc tài nguyên có sẵn, phải báo trước.

## 4. Tranh 5 trạm: 20 lớp

Mỗi trạm có 4 lớp xếp chồng, số `0` ở xa nhất. Các lớp trượt và phóng to khác nhau khi người dùng bước tới để tạo chiều sâu. Lớp 0 kín nền, lớp 1–3 có nền trong suốt.

| Trạm | Lớp 0 | Lớp 1 | Lớp 2 | Lớp 3 |
|---|---|---|---|---|
| `gate` cổng nguyệt môn | Trời | Tường và cổng tròn | Cây hai bên | Khung lá ở gần |
| `garden` sân vườn | Trời | Mái xa | Hồ | Bờ đá và cây |
| `hall` điện Tam Thanh | Nền tối | Ban thờ ở xa | Cột và ánh nến | Ngưỡng cửa |
| `corridor` hành lang | Tường | Cửa bức bàn | Cột | Đèn lồng ở gần |
| `study` tĩnh thất | Tường và giá sách | Cửa sổ | Án thư | Đèn dầu |

**Tên file:** `<trạm>-<số lớp>.webp`, ví dụ `gate-0.webp`, `study-3.webp`.

**Kích thước:** 720 × 1280 px, WebP.

**Vùng an toàn:**
- Vật chính nằm trong khoảng x = 80–640, vì máy dài sẽ bị cắt hai bên.
- Lớp 3 sẽ được phóng to tới 114% và trượt lên, nên đừng đặt chi tiết quan trọng sát mép.
- Giữ khoảng 1/4 dưới màn hình tương đối đơn giản, vì đây là chỗ đặt nút và lời nói của đạo đồng.
- Trạm `gate` chừa chỗ ở góc dưới bên trái cho đạo đồng đứng.

**Màu theo giờ:** vẽ tất cả trong ánh sáng ban ngày trung tính. App tự phủ màu cho bình minh, hoàng hôn và ban đêm, nên đừng vẽ riêng các buổi. Nguồn sáng như nến, đèn lồng, đèn dầu cần trông vẫn đẹp khi cảnh bị phủ tối.

## 5. Lớp theo mùa và ngày lễ: 6 file

Nền trong suốt, kích thước 720 × 1280 px, phủ lên cảnh tương ứng.

| File | Hiện ở | Nội dung |
|---|---|---|
| `over-xuan.webp` | Vườn, mùa xuân | Hoa đào |
| `over-ha.webp` | Vườn, mùa hạ | Sen trên hồ |
| `over-thu.webp` | Vườn, mùa thu | Lá vàng |
| `over-dong.webp` | Vườn, mùa đông | Cành khô và sương |
| `over-moon.webp` | Vườn, rằm | Trăng tròn, nằm sau lớp mái (xếp ở xa nhất) |
| `over-tet.webp` | Cổng, Tết | Giấy đỏ để trơn hai bên cổng, đèn lồng đỏ |

Các lớp `xuan`, `ha`, `thu`, `dong` phải khớp vị trí hồ và bờ đá của trạm `garden`, nên nên vẽ sau khi trạm này được duyệt.

## 6. Tĩnh thất, màn hình chính: 7 file

| File | Kích thước | Nội dung |
|---|---|---|
| `room.webp` | 720 × 980 px | Phòng làm việc của thầy, kín nền |
| `obj-laso.webp` | 288 × 216 px | Tờ lá số giấy dó, không có chữ |
| `obj-thetre.webp` | 288 × 216 px | Bốn thẻ tre |
| `obj-xu.webp` | 288 × 216 px | Ba đồng xu và mai rùa |
| `obj-laban.webp` | 288 × 216 px | La bàn gỗ |
| `obj-sach.webp` | 288 × 216 px | Sách cổ, bìa không chữ |
| `obj-so.webp` | 288 × 216 px | Cuốn sổ |

- `room`: ảnh được neo theo cạnh dưới, nên có thể bị cắt ở trên và hai bên. Thầy ngồi ở giữa, phía sau án thư. Sáu đồ vật hiện trên mặt án, nên mặt án cần trống và đủ rộng. Góc phải dưới là ánh đèn dầu.
- Đồ vật: nền trong suốt, hiển thị nhỏ cỡ 72 × 54 px trên màn hình, nên phải nhận ra được ngay bằng hình khối. Các đồ vật này là nút bấm mở từng công cụ.

## 7. Nhân vật: 2 file Lottie

| File | Nhân vật |
|---|---|
| `thay.json` | **Thầy:** cao tuổi, hiền, đạo bào giản dị, ngồi sau án thư |
| `daodong.json` | **Đạo đồng:** khoảng 10–12 tuổi, lễ phép, đạo bào ngắn, đứng |

**Điều quan trọng nhất:** bản nháp trước bị nhận xét giống con rối trong phim kinh dị. Tránh mắt mở trừng, nhìn thẳng cố định, khớp tay gập cứng, miệng há ngậm. Nên dùng dáng mềm, mắt khép hoặc nhìn xuống, chuyển động rất nhẹ. Thầy nói nhiều, nên không cần khớp miệng với lời.

**Trạng thái cần có.** Mỗi trạng thái là một đoạn lặp liền mạch, đặt marker đúng tên:

| Marker | Thời lượng | Hành động |
|---|---|---|
| `idle` | 4 giây | Thở nhẹ, tĩnh |
| `talk` | 2 giây | Đang giảng, đầu và vai động rất ít |
| `point` | 2 giây | Tay chỉ nhẹ xuống án thư hoặc về phía người xem |
| `turnPage` | 2 giây | Lật một trang sách |
| `nod` | 2 giây | Gật đầu chậm |

**Yêu cầu kỹ thuật:**
- Khung 200 × 224 px, 30 khung hình/giây. Nền trong suốt.
- Xuất từ After Effects qua Bodymovin, chỉ dùng hình vector, không nhúng ảnh.
- Không dùng expression, vì app dùng bản Lottie rút gọn, không hỗ trợ. Không dùng merge path và hiệu ứng làm mờ.
- Hai file tổng tối đa 150 KB.
- Khung đầu của `idle` phải đẹp khi đứng yên, vì đây là hình người dùng thấy nếu máy tắt chuyển động.
- Hiển thị khoảng 150–180 px chiều rộng trên điện thoại.

## 8. Âm thanh: 6 file

Có thể thu riêng hoặc mua, cần giấy phép dùng thương mại, không yêu cầu ghi nguồn trong app.

| File | Dùng ở | Mô tả | Độ dài | Kiểu |
|---|---|---|---|---|
| `wind.ogg` | Cổng, vườn, nhỏ dần vào điện | Gió nhẹ qua cây | 10 giây | Vòng lặp liền mạch |
| `stream.ogg` | Vườn | Suối chảy nhỏ | 10 giây | Vòng lặp liền mạch |
| `birds.ogg` | Cổng, vườn | Chim xa, thưa | 10 giây | Vòng lặp liền mạch |
| `wind-chime.ogg` | Cổng, vườn | Chuông gió kim loại nhỏ, vài tiếng | 10 giây | Vòng lặp liền mạch |
| `bell.ogg` | Điện Tam Thanh, khi bước vào | Một tiếng chuông đồng, ngân dài | 3–4 giây | Một lần |
| `lamp.ogg` | Tĩnh thất | Đèn dầu lách tách rất nhẹ | 10 giây | Vòng lặp liền mạch |

**Yêu cầu kỹ thuật:** mono, khoảng 80 kbps, Ogg Vorbis, không có khoảng lặng ở hai đầu vòng lặp.

**Lưu ý:** không dùng kinh, tụng niệm, hay tiếng ghi tại một nơi thờ tự có thật.

## 9. Ngân sách dung lượng

App kiểm tra tự động: toàn bộ tranh, nhân vật và âm thanh không được vượt **3 MB**.

| Hạng mục | Số file | Mức trần mỗi file | Tổng |
|---|---|---|---|
| Lớp 0 của 5 trạm | 5 | 120 KB | 600 KB |
| Lớp 1–3 của 5 trạm | 15 | 60 KB | 900 KB |
| Lớp mùa và lễ | 6 | 25 KB | 150 KB |
| `room` | 1 | 120 KB | 120 KB |
| Đồ vật | 6 | 15 KB | 90 KB |
| Nhân vật | 2 | | 150 KB |
| Âm thanh | 6 | | 600 KB |
| **Tổng** | **41** | | **2.610 KB** |

Phần dư khoảng 460 KB để dự phòng, không nên dùng hết.

## 10. Giao hàng và thứ tự duyệt

1. **Phác thảo:** trạm `gate` và thầy ở trạng thái `idle`, để chốt phong cách trước.
2. **Toàn bộ 5 trạm** và tĩnh thất ở dạng phác thảo.
3. **Bản hoàn thiện** cùng toàn bộ nhân vật và âm thanh.

**Giao gồm:** file WebP, JSON, OGG đúng tên ở trên; file gốc có lớp (PSD, AEP hoặc tương đương); giấy phép hoặc xác nhận chuyển quyền sử dụng.

---

## Ghi chú cho lập trình (không cần gửi hoạ sĩ)

- Tranh thật đặt vào `src/assets/journey/art/`. App đang nạp đuôi `.svg` ở `src/features/journey/scenes.ts` và `src/features/study/StudyScreen.tsx`: đổi sang `.webp` ở đó rồi xoá `scripts/build-journey-art.mjs`.
- Nhân vật đặt vào `src/assets/journey/character/`, giữ tên marker thì không phải đổi code. `tests/assets-budget.test.ts` đo tổng dung lượng thư mục `src/assets/journey`.
- Âm thanh hiện tổng hợp bằng Web Audio trong `src/platform/ambientAudio.ts`, cần thêm phần phát file thật.
- Hình cho Xem chỉ tay (bước 3B.4 của `docs/PROMPT-KIT-CHI-TAY.md`) chưa có ở đây, vì còn chờ kết quả bản thử nhận diện. Nên gộp vào đơn này nếu kịp, số hình sẽ ít hơn khoảng 90 hình ghi trong `docs/CHI-TAY.md`.
