# Danh sách kiểm tay trước khi phát hành

> Tạo ngày 12/11/2026 ở bước 3C.9. Những mục dưới đây máy tự động (test, build) không kiểm được: cần người cầm điện thoại thật. Bổ sung dần khi thêm tính năng. Phase 9 (12/11/2026) thêm các mục chung và mục cho từng công cụ. Làm trên **APK thử từ GitHub Actions** (artifact `lyso-debug-apk`) hoặc bản phát hành.

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

## Chung cho cả app (Phase 9, thêm 12/11/2026)

Lấy từ ARCHITECTURE mục 7.3 và kết quả lần thử trên S25 Ultra (PROGRESS, 05/11/2026). Nên làm trên **hai máy**: một máy mới và một máy Android tầm thấp (RAM 2–3 GB).

### Cài đặt, khởi động, dữ liệu

- [ ] Cài APK (bản không đặt `LYSO_LIVE_URL`) rồi mở lần đầu khi **đang ở chế độ máy bay**: app chạy đủ, chữ tiếng Việt có dấu hiện đúng font (font đóng gói offline), không ô vuông.
- [ ] Thêm 3 hồ sơ: một nhập dương lịch, một nhập **âm lịch có tháng nhuận**, một sinh giờ Tý muộn (23:00–23:59) ngày 31/12. Tắt hẳn app, mở lại: cả 3 còn nguyên, hồ sơ đang chọn vẫn đúng.
- [ ] Nhập ngày không có thật (31/02, 30 tháng âm thiếu): báo lỗi tiếng Việt, KHÔNG tự đổi thành ngày khác.
- [ ] Cài bản mới đè lên bản cũ: hồ sơ, cài đặt, quẻ Lục Hào gần nhất, hướng cửa, cặp hợp hôn còn nguyên.

### Nút Back (ARCHITECTURE mục 1.3)

- [ ] Đang mở bảng chọn hồ sơ hoặc hộp thoại: Back đóng nó, không lùi màn.
- [ ] Đang ở màn con (chi tiết, sửa hồ sơ, kết quả chỉ tay): Back lùi một màn.
- [ ] Đang ở gốc một tab khác Tĩnh thất: Back về Tĩnh thất.
- [ ] Đang ở gốc Tĩnh thất: Back đưa app vào nền (không thoát hẳn); mở lại thấy đúng chỗ cũ, không chạy lại lối vào.
- [ ] Thầy đang đọc: Back dừng đọc trước. Đang đi lối vào đạo quán: Back vào thẳng Tĩnh thất.

### Giao diện

- [ ] Cỡ chữ hệ thống lớn nhất, màn 360dp: không màn nào cuộn ngang, chữ không bị cắt, nút vẫn bấm được.
- [ ] Cài đặt → Chế độ màu: Theo máy, Sáng, Tối đều đúng; đổi chế độ tối của máy khi đang để "Theo máy" thì app đổi theo.
- [ ] Xoay ngang máy ở từng tab: bố cục không vỡ, không mất dữ liệu đang nhập.
- [ ] TalkBack: các nút chỉ có biểu tượng (⏮ ⏭ 🐢, ±1, ±15 độ, chia sẻ) đọc đúng nhãn tiếng Việt.

### Đọc thành lời

- [ ] Máy **có** giọng tiếng Việt: nút đọc ở mỗi công cụ đọc hết bài dài, tắt mạng vẫn đọc.
- [ ] Máy **chưa có** giọng tiếng Việt (gỡ gói giọng hoặc dùng máy khác): hiện câu "Không đọc được trên máy này…" kèm cách tải gói giọng, không treo, không im lặng; Cài đặt có nút "Tải thêm giọng tiếng Việt" mở đúng trang cài giọng của máy.
- [ ] Đang đọc thì bấm Home: dừng đọc. Mở lại: không tự đọc tiếp lung tung.
- [ ] Thanh đọc: nghe lại đoạn trước, tạm dừng / đọc tiếp, đoạn sau, dừng đều chạy; Tốc độ đọc và Cao độ giọng trong Cài đặt có tác dụng.
- [ ] Có cuộc gọi đến khi đang đọc: dừng đọc, gọi xong không phát lại tiếng ồn.

### Chia sẻ, sao lưu

- [ ] Nút "Chia sẻ ảnh" ở cả 7 chỗ (Tử Vi, Bát Tự, Lục Hào, Bát Trạch, La Bàn, Nạp Âm, Tổng hợp): bảng chia sẻ của Android mở ra; gửi qua **Zalo** và **Messenger** được; bài dài ra nhiều ảnh có số "Ảnh 1/N", mọi ảnh có dòng lưu ý văn hoá.
- [ ] Sao lưu ra file → khôi phục bằng trình chọn file của Android: thành công, có hỏi lại trước khi thay.
- [ ] Khôi phục một file không phải sao lưu (ảnh, văn bản): báo lỗi rõ, dữ liệu hiện có không mất.

## Tử Vi

- [ ] Mở Tử Vi từ tờ lá số ở Tĩnh thất: sao rơi vào 12 cung (khoảng 2,6 giây); chạm lá số thì bỏ qua; bật "giảm chuyển động" của máy thì không có hiệu ứng.
- [ ] Lá số 12 cung đọc được ở 360dp; chạm một cung thì thẻ chi tiết đổi theo; "Danh sách" → chạm một cung thì quay về lá số đúng cung đó.
- [ ] Dải Đại Hạn: giai đoạn hiện tại được đánh dấu; chạm một giai đoạn thì chọn đúng cung.
- [ ] Tra vận hạn theo năm: đổi năm thì nội dung đổi theo.
- [ ] Thầy đọc: cung đang nói tới sáng lên trên lá số.
- [ ] Đọc lại mục sức khoẻ (cung Tật Ách) trong Tổng kết và trên ảnh chia sẻ: chủ dự án quyết định có thêm câu "không thay cho tư vấn y tế" (`docs/RELEASE.md` mục 4, "Rủi ro cần xem ở Phase 9").

## Bát Tự (phần có từ trước Phase 3C)

- [ ] Bốn trụ, Vượng Suy, Dụng Thần sơ bộ, Tổng kết hiện đủ; sinh sát Lập Xuân thì trụ năm đổi đúng theo Lập Xuân (không theo Tết).
- [ ] Dải Đại Vận cuộn ngang bằng ngón tay, giai đoạn hiện tại được đánh dấu; Tra Lưu Niên đổi năm được.
- [ ] Thầy đọc: trụ đang nói tới sáng lên.

## Bát Tự: các mục thêm từ hai sách (13/11/2026)

- [ ] Mở hết các khối gập (Cách cục, Hình xung hội hợp, Dòng khí, Tính tình, Lục thân, Lời sách theo tháng) ở 360dp và cỡ chữ lớn nhất: không cuộn ngang, chữ không bị cắt.
- [ ] Lời sách theo tháng: phần "Lá của bạn có các can này chưa?" khớp với tứ trụ trên màn (can lộ ở trụ nào, ẩn trong chi nào).
- [ ] Lục thân: phần "Sách xưa luận thêm" đọc có nhẹ nhàng không, có chỗ nào gây lo lắng không (ghi lại câu cụ thể để sửa); hồ sơ người thân (vợ, con…) cũng xem lại.
- [ ] Phân tích ngũ hành: mục "Nói dễ hiểu" và "Lá số cổ giống bạn" hiện đúng chỗ; đổi cách luận (lá có hai cách) thì "Nói dễ hiểu" đổi theo.
- [ ] Nút "Nghe phần ngũ hành": Thầy đọc phần ví dụ và hai năm ví dụ, xưng hô (con, anh, chị…) tự nhiên; bài không quá dài.
- [ ] Chế độ sáng: chữ vàng, chữ xám đọc rõ ngoài trời (màu đã đậm hơn bản cũ).

## Lục Hào

- [ ] "Gieo quẻ" bằng nút và bằng **lắc máy**: gieo đủ 6 hào, có rung nhẹ; lắc nhẹ khi đi bộ không tự gieo (ngưỡng lắc 22 m/s² là số tạm, ghi lại cảm nhận).
- [ ] Chuyển sang tab khác rồi lắc: không gieo.
- [ ] "Nhập tay" 6 số rồi "Lập quẻ từ 6 số đã nhập": ra đúng quẻ.
- [ ] **Đổi việc hỏi (Dụng Thần) hoặc ngày xem: quẻ giữ nguyên, không gieo lại.** Tắt app, mở lại: quẻ gần nhất còn.
- [ ] Nhập ngày xem không có thật: báo lỗi, không lập quẻ.
- [ ] Thầy đọc: hào đang nói tới sáng lên.

## Bát Trạch

- [ ] Sinh sát Lập Xuân: Mệnh Quái đổi năm theo Lập Xuân.
- [ ] Chọn hướng cửa chính: phần căn nhà đang xét hiện ra; bỏ chọn thì mất; tắt app mở lại vẫn nhớ hướng.
- [ ] Bảng Du Niên, gợi ý bố trí, ngũ hành ứng dụng hiện đủ; Thầy đọc tô sáng đúng hướng.

## La Bàn (9 phép thử ARCHITECTURE mục 11, điều kiện nghiệm thu 4.2)

Ghi lại số µT hiện trên màn hình ở mỗi phép thử để chốt ngưỡng 25–65 µT và ngưỡng sai số 15°.

- [ ] 1. So với la bàn vật lý hoặc Google Maps ở 8 hướng, máy nằm ngang, ngoài trời, xa kim loại: lệch ≤ 5°.
- [ ] 2. Xoay máy nhanh 90°: kim theo kịp trong 1 giây, không vọt lố quá 5°.
- [ ] 3. Đặt yên 30 giây: dao động ≤ 2°.
- [ ] 4. Đặt cạnh loa hoặc vật kim loại lớn: hiện cảnh báo nhiễu, số độ mờ đi (lần thử 05/11/2026 KHÔNG ĐẠT, đã sửa, chưa thử lại).
- [ ] 5. Vẽ hình số 8 sau khi bị nhiễu: cảnh báo tự mất.
- [ ] 6. Xoay ngang máy: hướng vẫn đúng. Dựng đứng máy: có nhắc đặt máy nằm ngang.
- [ ] 7. Vào nền rồi quay lại: cảm biến dừng khi ở nền, chạy lại khi về.
- [ ] 8. Để đo liên tục 10 phút: màn hình không tắt, máy không nóng bất thường, pin tụt hợp lý.
- [ ] 9. Máy không có từ kế (nếu kiếm được): báo rõ, tự chuyển "✋ Xoay tay".
- [ ] "✋ Xoay tay": kéo vòng la bàn bằng ngón tay, nút ±1, ±15 độ và ô nhập số độ đều chạy. Ô "Hiệu chỉnh (độ)" nhận −45 đến 45 và được nhớ sau khi tắt app.

## Nạp Âm

- [ ] Sinh trước Tết (tháng 1, đầu tháng 2 dương lịch): mạng Nạp Âm tính theo năm âm trước (đổi năm theo Tết).
- [ ] Chọn Người 1 và Người 2 để xem hợp hôn: bảng so sánh hiện ra; tắt app mở lại vẫn nhớ cặp.

## Tĩnh thất và lối vào đạo quán

- [ ] Cài đặt → Khi mở app: thử cả "Tự động", "Đầy đủ", "Rút gọn", "Không có"; mở lại app thấy đúng kiểu. "Tự động": ngày rằm, mùng 1 đi đầy đủ.
- [ ] Lối vào: chạm "Bỏ qua" và Back đều vào thẳng Tĩnh thất. Máy để im lặng hoặc rung thì không phát tiếng.
- [ ] Đo fps lối vào và Tĩnh thất trên **máy tầm thấp** (điều kiện chặn 6.2 và 6.6): mượt, không giật khi chuyển trạm. Không đạt thì ghi lại để đổi sang ảnh động CSS.
- [ ] Thắp hương: chạm giữ khoảng 0,8 giây thì nén hương cháy; tắt app mở lại trong 20 phút vẫn còn cháy, hết 20 phút thì tàn.
- [ ] 6 đồ vật trên án thư mở đúng công cụ; Thầy đọc có phụ đề, nút ⏮ ⏯ ⏭ 🐢 chạy.
- [ ] Chưa có hồ sơ: Intake hỏi lần lượt tên, giới tính, ngày, giờ; nhập ngày sai bị báo như form hồ sơ.
- [ ] Đổi người đọc trong Cài đặt (10 nhân vật, màu áo, hoặc ảnh tự chọn): hình ở Tĩnh thất đổi theo, lời đọc tự xưng đúng.

## Bộ nhớ và hiệu năng

- [ ] Máy tầm thấp: mở lần lượt cả 5 tab, Xem chỉ tay và lối vào đầy đủ, rồi quay lại tab đầu: không bị Android đóng app, không mất trạng thái.
- [ ] Đọc yêu cầu chất lượng về bộ nhớ của Google Play áp dụng từ 02/2027 (`docs/RELEASE.md` mục 5) và đối chiếu với lần đo này.

## Ngoài phạm vi danh sách này

- Thiết lập ký và cấu hình phát hành: `docs/RELEASE.md` mục 2 (Phase 8.2, đang tạm hoãn).
- Soi lưu lượng mạng trên bản release thật ở chế độ máy bay: `docs/RELEASE.md` mục 3.
