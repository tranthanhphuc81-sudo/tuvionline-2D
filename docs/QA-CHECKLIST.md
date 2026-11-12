# Danh sách kiểm tay trước khi phát hành

> Tạo ngày 12/11/2026 ở bước 3C.9. Những mục dưới đây máy tự động (test, build) không kiểm được: cần người cầm điện thoại thật. Bổ sung dần khi thêm tính năng. Làm trên **APK thử từ GitHub Actions** (artifact `lyso-debug-apk`) hoặc bản phát hành.

Cách đánh dấu: ghi ngày, máy (ví dụ "Galaxy S25 Ultra, Android 16"), và kết quả (đạt / lỗi kèm mô tả) ngay sau mục.

## Phân tích ngũ hành (Phase 3C)

Chuẩn bị ba hồ sơ mẫu (lấy từ `tests/fixtures/nguhanh-golden.json`, dương lịch, nam):

| Loại | Ngày sinh | Giờ |
|---|---|---|
| Chân (tòng, chuyên vượng) | 10/03/1958 | Mão |
| Giả (hai cách luận) | 13/03/1986 | Mão |
| Thường | 06/02/2021 | Ngọ |
| Đảo chiều so với gợi ý sơ bộ | 12/10/1963 | Mùi |

### Xem đủ các mục (màn Bát Tự)

- [ ] Với từng hồ sơ trên: mục "Phân tích ngũ hành" nằm sau hai hộp Vượng Suy và Dụng Thần sơ bộ, trước dải Đại Vận.
- [ ] Có đủ: lời nhắc văn hoá, dòng đối chiếu với gợi ý sơ bộ, thanh 5 hành, "Vì sao ra kết quả này" mở và gập được, chiến lược, việc nên làm, Đại Vận hiện tại và 5 năm tới, lời nhắc cuối.
- [ ] Hồ sơ Chân: có bảng 4 điều kiện, nút "Xem cách luận khác" và "Quay lại cách luận chính" hoạt động.
- [ ] Hồ sơ Giả: có hai lựa chọn cách luận ngang hàng, đổi qua lại thì nội dung đổi theo.
- [ ] Hồ sơ thường: không có lựa chọn cách luận, không có thẻ kiểm chứng.
- [ ] Hồ sơ đảo chiều: dòng đối chiếu nói rõ hai cách ngược nhau, có câu khuyên nhờ người luận xem trực tiếp.
- [ ] Không chỗ nào trong mục nêu màu, hướng, vật phẩm; cuối mục có câu giải thích ba nguồn màu hướng.
- [ ] Các mục cũ của Bát Tự (Vượng Suy, Dụng Thần, Tổng kết, Đại Vận, Tra Lưu Niên) vẫn y như trước.

### Kiểm chứng bằng các năm đã qua

- [ ] Trả lời một câu rồi **tắt hẳn app** (vuốt khỏi danh sách ứng dụng gần đây), mở lại: câu trả lời vẫn còn, kết luận vẫn đúng.
- [ ] Chọn "Không nhớ": câu đó không hỏi lại, kết luận không đổi.
- [ ] Trả lời hết các câu: có kết luận hoặc dòng "chưa đủ dữ liệu/chưa phân định", không hỏi thêm.
- [ ] "Làm lại": xoá hết câu trả lời, hỏi lại từ đầu.
- [ ] Sửa ngày giờ sinh của hồ sơ: màn sửa có dòng báo trước; lưu xong, câu trả lời cũ biến mất, hỏi lại từ đầu.
- [ ] Sửa tên hay quan hệ của hồ sơ: câu trả lời còn nguyên.
- [ ] Xoá hồ sơ: không còn câu trả lời của hồ sơ đó (kiểm bằng sao lưu: mở file, tìm `nguHanhAnswers`).

### Sao lưu và khôi phục (đổi lược đồ lên v4)

- [ ] **Trước khi cài bản mới đè lên bản cũ:** sao lưu ra file ở bản cũ (v3) và giữ lại.
- [ ] Cài bản mới: app mở được, hồ sơ, cài đặt, lần xem chỉ tay còn nguyên.
- [ ] Khôi phục file sao lưu v3 vừa giữ: thành công, không mất dữ liệu.
- [ ] Trả lời vài câu kiểm chứng → sao lưu → xoá toàn bộ dữ liệu → khôi phục: câu trả lời trở lại.
- [ ] "Xoá toàn bộ dữ liệu": không còn câu trả lời nào.

### Thầy đọc

- [ ] Màn Bát Tự: nút "Nghe phần ngũ hành" đọc được bằng giọng tiếng Việt của máy; trụ tháng và các Can tàng sáng lên khi Thầy nói tới nguyệt lệnh.
- [ ] Thầy không đọc bảng điều kiện, phần trăm, danh sách thói quen; câu mở và câu kết có lời nhắc văn hoá.
- [ ] Tĩnh thất, hồ sơ Giả: bấm "Nghe phần ngũ hành", nghe hết thì Thầy chuyển sang hỏi; 4 nút trả lời hiện trong khung phụ đề; sau mỗi câu Thầy cảm ơn rồi hỏi tiếp; hết thì nói kết luận hoặc "chưa đủ để chắc".
- [ ] Tĩnh thất, hồ sơ Giả: **thầy đang hỏi giữa chừng thì app vào nền** (bấm nút Home, mở lại sau 30 giây): không treo, không mất câu trả lời đã bấm, bấm "Để Thầy hỏi sau" thoát được.
- [ ] Tĩnh thất, hồ sơ thường: đọc xong không hỏi gì.
- [ ] Đổi người đọc (Cài đặt): lời hỏi đáp tự xưng theo nhân vật đã chọn.

### Cỡ chữ lớn và màn nhỏ

- [ ] Đặt cỡ chữ hệ thống ở mức lớn nhất, màn ngang 360dp: mục ngũ hành, thẻ kiểm chứng và khung hỏi đáp ở Tĩnh thất không cuộn ngang, không chữ bị cắt, nút bấm được (≥ 44px).
- [ ] Chế độ tối và sáng: thanh 5 hành, bảng điều kiện, nút đọc rõ chữ.
- [ ] TalkBack: thanh 5 hành đọc thành "Thuỷ · Thực Thương · Dụng thần, 5 phần trăm"; nút trả lời đọc đúng nhãn.

### Không gửi dữ liệu đi đâu

- [ ] Bản phát hành (hoặc bản không đặt `LYSO_LIVE_URL`) ở chế độ máy bay: toàn bộ phần ngũ hành và hỏi đáp chạy bình thường.

## Xem chỉ tay (Phase 3B, thêm ở 3B.9)

Chuẩn bị: một hồ sơ có sẵn, ánh sáng đủ, thêm một ảnh tay mờ và một ảnh không có tay để thử lỗi.

### Chụp ảnh và vẽ đường

- [ ] Nút chụp mở được app máy ảnh của máy (nếu không mở được: ghi lại, phải thêm quyền `CAMERA`, xem `docs/RELEASE.md`).
- [ ] Chọn ảnh từ thư viện cũng được.
- [ ] Lần đầu vào: mô hình nạp xong không cần mạng (bật chế độ máy bay trước khi vào).
- [ ] Ảnh mờ hoặc không có tay: có thông báo rõ, cho chụp lại, không treo.
- [ ] Vẽ và sửa đường chỉ bằng ngón tay: nét theo tay, không giật; vùng chạm đủ lớn.
- [ ] **App vào nền khi đang mở máy ảnh** (bấm Home rồi quay lại sau 30 giây): quay về đúng bước, ảnh không mất hoặc báo chụp lại, không treo.
- [ ] Nút Back của máy khi đang giữa các bước: lùi đúng một bước (hoặc hỏi trước khi bỏ), không thoát app.
- [ ] Xoay ngang màn hình giữa chừng: không mất dữ liệu đã vẽ, bố cục không vỡ.

### Câu hỏi và kết quả

- [ ] Trả lời "Không rõ" cho mọi câu: vẫn ra kết quả, phần thiếu được nói rõ, không có câu luận bịa.
- [ ] Chỉ xem một tay: kết quả không nhắc so sánh hai tay.
- [ ] Xem cả hai tay, chọn hai tay có đặc điểm ngược nhau: phần so sánh hai tay nói đúng, không mâu thuẫn.
- [ ] Màn kết quả: đường chỉ vẽ trên chính ảnh vừa chụp; đổi sang tranh vẽ được; dòng "Ảnh chỉ hiện lúc này và không được lưu" hiện rõ.
- [ ] Rời màn kết quả rồi mở lại từ lịch sử: chỉ còn tranh vẽ, không còn ảnh thật.
- [ ] Xoá một lần xem trong lịch sử: biến mất; lần khác còn nguyên.

### Thầy đọc

- [ ] Nút nghe kết quả chỉ tay đọc bằng giọng tiếng Việt của máy; đường, gò, dấu sáng lên trên sơ đồ đúng lúc Thầy nói tới.
- [ ] Câu mở và câu kết có lời nhắc văn hoá và lời nhắc đường tay đổi theo cách sống; không nhắc bệnh tật, tuổi thọ, con cái, chia ly.
- [ ] Tĩnh thất: đồ vật đèn dầu soi tay mở được Xem chỉ tay; hồ sơ chưa xem tay thì đạo đồng mời xoè tay.

### Dữ liệu

- [ ] Sao lưu ra file: mở file, có `palmSessions`, KHÔNG có dữ liệu ảnh (không chuỗi `data:image`).
- [ ] "Xoá toàn bộ dữ liệu": không còn lần xem tay nào; ảnh người đọc tự tạo (nếu có) cũng mất.
- [ ] Xoá hồ sơ: các lần xem tay của hồ sơ đó mất theo.

### Không áp dụng (chưa có trong app)

- Đổi cách chọn tay trong Cài đặt và chia sẻ ảnh kết quả chỉ tay: kit 3B.9 có nhắc, nhưng app hiện chưa có hai tính năng này. Khi thêm thì bổ sung mục kiểm.

## Các phần khác

Chưa có danh sách kiểm tay cho Tử Vi, Bát Tự cũ, Lục Hào, Bát Trạch, La Bàn, Nạp Âm, Hành trình. Bổ sung ở Phase 9 (xem `docs/RELEASE.md` mục 7).
