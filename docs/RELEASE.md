# Phát hành Google Play (Phase 8.1)

> Lập ngày 06/11/2026. Quy định của Google đổi thường xuyên: mở lại các trang ở cuối tài liệu trước khi nộp. Đây không phải tư vấn pháp lý.
> Phase 8.2 làm theo tài liệu này. Muốn đổi quyết định thì sửa ở đây trước.

## Chủ dự án cần chốt

| # | Việc | Đề xuất | Chặn bước nào |
|---|---|---|---|
| 1 | Chọn `appId` (mục 1) | `vn.lysotronbo.app` | 8.2 |
| 2 | Chọn email công khai trên Play và trong chính sách quyền riêng tư | Email riêng cho app, không dùng email cá nhân | 8.2 |
| 3 | Tài khoản Play Console: đã có chưa, cá nhân hay tổ chức, tạo ngày nào | | Mục 7 |
| 4 | Tìm 12 người thử trong 14 ngày liên tục (chỉ khi là tài khoản cá nhân tạo sau 13/11/2023) | Bắt đầu tìm từ bây giờ | Mục 7 |
| 5 | Phát hành bản đầu với tranh, nhân vật, âm thanh hiện tại hay chờ hoạ sĩ | Quyết trước khi chụp ảnh cho trang Play | 8.3 |

## 1. Định danh

### appId

**Không đổi được sau khi phát hành.** Đổi appId là tạo một app mới: mất đánh giá, lượt cài và đường cập nhật cho người dùng cũ.

| Phương án | Ưu | Nhược |
|---|---|---|
| **`vn.lysotronbo.app` (đề xuất)** | Khớp tên app, ngắn. Tra DNS ngày 06/11/2026: `lysotronbo.vn` và `lysotronbo.com` chưa có bản ghi | Chưa sở hữu tên miền. Google không bắt buộc, nhưng nên mua `lysotronbo.vn` nếu định dùng lâu dài |
| `io.github.tranthanhphuc81sudo.lysotronbo` | Đúng không gian tên GitHub bạn đang giữ | Dài, gắn với tên tài khoản GitHub |
| `vn.lyso.app` (đang dùng tạm) | Không phải đổi code | `lyso.vn` có vẻ đã được đăng ký (tra DNS không rõ kết quả), có thể đụng thương hiệu người khác |

Tra DNS chỉ là dấu hiệu, không chứng minh tên miền còn trống. Trùng appId chỉ biết chắc khi tạo app trên Play Console.

### Tên, phân loại

- **Tên trên Play:** `Lý Số Trọn Bộ` (13 ký tự, giới hạn 30). Không thêm emoji, chữ in hoa toàn bộ hay lời khoe.
- **Thể loại đề xuất:** Phong cách sống (Lifestyle). App miễn phí, không quảng cáo, không mua trong app.
- **Đánh số phiên bản:** `package.json` là nguồn duy nhất. `versionName` theo dạng `MAJOR.MINOR.PATCH`. `versionCode = MAJOR × 10000 + MINOR × 100 + PATCH`.

| Bản | versionName | versionCode |
|---|---|---|
| Thử nghiệm kín đầu tiên | 0.9.0 | 900 |
| Phát hành chính thức | 1.0.0 | 10000 |

`versionCode` chỉ được tăng, kể cả khi bản trước bị huỷ.

## 2. Ký app

Dùng **Play App Signing** (app mới được đăng ký tự động): Google giữ khoá ký thật, mình giữ **upload key**. Mất upload key thì Google đặt lại được, nhưng vẫn phải giữ cẩn thận.

### Tạo upload key

Chạy một lần trên máy có JDK bất kỳ, ví dụ Codespace. Lệnh tự hỏi mật khẩu, không gõ mật khẩu vào dòng lệnh:

```bash
keytool -genkeypair -v -keystore lyso-upload.jks -keyalg RSA -keysize 4096 -validity 9125 -alias upload
```

- Tạo ở ngoài thư mục repo. `.gitignore` đã chặn `*.jks`, `*.keystore`, `keystore.properties`, nhưng không nên dựa vào đó.
- Cất file `.jks` và mật khẩu ở 2 nơi riêng, ví dụ trình quản lý mật khẩu và USB mã hoá. Xoá bản trên Codespace sau khi đã đưa vào Secrets.

### Build bản phát hành

Máy Windows hiện tại không có Android SDK và repo là công khai, nên build AAB bằng GitHub Actions thay vì Codespaces Secrets như kế hoạch cũ. Phase 8.2 làm:

- Workflow riêng, **chỉ chạy tay** (`workflow_dispatch`), không chạy khi đẩy code.
- Dùng một GitHub Environment tên `release`, chỉ cho nhánh `main`, phải duyệt tay trước khi chạy. Bản fork không đọc được secret.
- 4 secret: `LYSO_UPLOAD_KEYSTORE_B64` (file `.jks` mã hoá base64), `LYSO_UPLOAD_STORE_PASSWORD`, `LYSO_UPLOAD_KEY_PASSWORD`, `LYSO_UPLOAD_KEY_ALIAS`. Bạn tự nhập trên GitHub, không gửi vào cuộc trò chuyện.
- Gradle đọc từ biến môi trường, thiếu thì dừng báo lỗi, không ký bằng khoá debug.
- Workflow chạy `npm test` trước, không đặt `LYSO_LIVE_URL` (`scripts/gradle.mjs` đã chặn).

## 3. An toàn dữ liệu (Data safety)

### Rà soát mạng ngày 06/11/2026

Rà tĩnh, chưa bắt gói tin khi chạy.

| Nơi rà | Kết quả |
|---|---|
| `src/` | Không có lệnh gọi mạng nào; địa chỉ web duy nhất là chú thích nguồn thuật toán lịch |
| `dist/` | Địa chỉ ngoài chỉ có `www.w3.org` (không gian tên SVG) và `react.dev` (đường dẫn trong thông báo lỗi của React) |
| `fetch`, `XMLHttpRequest` trong `dist/` | Đều nằm trong mã thư viện không được dùng để gửi dữ liệu: tải trước module cùng nguồn của Vite, `CapacitorHttp`, phần web của plugin, tải file của lottie (app đưa dữ liệu trực tiếp nên không gọi) |
| Java nội bộ | Không có mã HTTP |
| SDK | Không có Firebase, analytics, crash report, quảng cáo. Gradle có sẵn dòng `google-services` nhưng chỉ bật khi có `google-services.json`, file này không tồn tại |
| Font, tranh, âm thanh | Đóng gói trong app |
| Giọng đọc | Android chỉ dùng giọng `…-local`, không có thì báo, không lùi sang mạng |

Phase 9 phải chạy lại ở chế độ máy bay và soi lưu lượng trên bản release thật.

### Quyền Android

| Quyền | Nguồn | Ghi chú |
|---|---|---|
| `INTERNET` | Mặc định của Capacitor | Bản thử cần để tải giao diện từ Cloudflare. Bản phát hành không dùng. 8.2 thử gỡ riêng cho bản release; WebView lỗi tải trang thì giữ lại |
| `VIBRATE` | `@capacitor/haptics` | Rung nhẹ khi gieo quẻ |

Không xin vị trí, danh bạ, micro, camera, bộ nhớ dùng chung. Cảm biến la bàn không cần quyền.

### Quyết định: tắt Auto Backup

Hiện `android:allowBackup="true"`. Android có thể tự sao lưu dữ liệu app lên Google Drive của người dùng, nên câu "hồ sơ chỉ lưu trên máy" không còn đúng hẳn, và Google không nêu rõ cách khai trường hợp này.

**8.2 đổi thành `android:allowBackup="false"`.** Người dùng đổi máy thì dùng "Sao lưu ra file" đã có ở Phase 7.1. Theo tài liệu Android, từ Android 12 cờ này không chặn chuyển dữ liệu trực tiếp giữa hai máy; việc đó không qua máy chủ của app nên giữ nguyên. Cần kiểm lại khi làm 8.2.

### Câu trả lời trên form

| Câu hỏi | Trả lời | Căn cứ |
|---|---|---|
| App có thu thập hoặc chia sẻ dữ liệu thuộc các loại bắt buộc không? | **Không** | "Thu thập" là truyền dữ liệu ra khỏi máy. Mọi dữ liệu xử lý và lưu trên máy |
| Chia sẻ ảnh, gửi file sao lưu | Không khai | Người dùng bấm và tự chọn nơi nhận, đúng kỳ vọng của họ. Google miễn khai trường hợp này |
| Hồ sơ, ngày sinh, cài đặt, quẻ đã gieo, hương đã thắp, độ hiệu chỉnh la bàn | Không khai | Chỉ lưu trên máy, xoá được bằng "Xoá toàn bộ dữ liệu" hoặc gỡ app |
| Mã hoá khi truyền, yêu cầu xoá tài khoản | Không áp dụng | Không truyền dữ liệu, không có tài khoản |

Điều kiện để các câu trên đúng: đã tắt Auto Backup, bản phát hành không đặt `LYSO_LIVE_URL`, không thêm SDK nào. Thêm tính năng gửi dữ liệu hoặc SDK bất kỳ thì phải khai lại.

**Chỉ tay không nằm trong bản đầu**, nên chưa có quyền `CAMERA` hay ảnh tay. Khi làm tính năng này (`docs/PROMPT-KIT-CHI-TAY.md`, 3B.9) phải cập nhật mục này trước.

### Chính sách quyền riêng tư

Bắt buộc có kể cả khi không thu thập gì.

- Đặt ở `https://lyso-tron-bo.pages.dev/privacy.html` (trang HTML tĩnh, đăng cùng Cloudflare; không dùng GitHub Pages như kế hoạch cũ vì workflow đó đã bỏ). Không dùng PDF.
- Tiêu đề có chữ "Chính sách quyền riêng tư". Phải có tên app, tên nhà phát triển trùng với trên Play, email liên hệ, loại dữ liệu xử lý, cách lưu giữ và xoá.
- Trong app đã có nội dung ở Cài đặt, 8.2 thêm email liên hệ và đường dẫn.

## 4. Nội dung và đối tượng

- **Xếp hạng nội dung:** bắt buộc điền bảng hỏi, trả lời đúng thực tế. App chưa xếp hạng không được ở lại trên Play.
- **Đối tượng mục tiêu:** chọn **18 tuổi trở lên**. App không nhắm tới trẻ em, tránh các yêu cầu của chính sách Gia đình.
- **Khai báo khác:** không quảng cáo, không phải app tài chính, tin tức hay chính phủ. Tính năng sức khoẻ: không có.
- **Tôn giáo:** điện Tam Thanh đã theo ARCHITECTURE 12.10: tượng cách điệu, đạo quán hư cấu, thắp hương không ảnh hưởng kết quả, không bán vật phẩm. Giữ nguyên.

### Quy tắc câu chữ trên trang Play

Không tìm thấy điều riêng về tử vi, phong thủy trong các trang đã đọc. Rủi ro chủ yếu đến từ lời quảng cáo:

- Luôn nói rõ là nội dung văn hoá, tham khảo. Không dùng "dự đoán chính xác", "đổi vận", "chữa", "chẩn đoán", "cam kết".
- Không ghi "số 1", "tốt nhất", giá, khuyến mãi, lời khen không rõ nguồn. Không dùng tên người nổi tiếng hay logo khác.
- Ảnh chụp phải đúng trải nghiệm thật trong app.

### Rủi ro cần xem ở Phase 9

Tổng kết Tử Vi có mục sức khoẻ theo cung Tật Ách, nêu bộ phận cơ thể và lời khuyên sinh hoạt, và nay còn in trên ảnh chia sẻ. Google cấm tuyên bố sức khoẻ sai lệch. Câu chữ này là nguyên văn legacy nên chưa sửa, và đã có ghi chú "tham khảo". Chủ dự án cần đọc lại và quyết định có thêm câu "không thay cho tư vấn y tế" hay không.

## 5. Yêu cầu kỹ thuật

| Yêu cầu | Hiện trạng |
|---|---|
| App mới phải nhắm API 36 trở lên | Đạt: `targetSdkVersion = 36` |
| Tải lên dạng AAB | `npm run android:release`, còn thiếu cấu hình ký |
| Biểu tượng và màn hình chờ riêng | Thiếu: đang là mặc định từ khi khởi tạo Capacitor |
| Không thuộc diện quyền mới ở thông báo 29/10/2026 | Đạt: không dùng mạng cục bộ, danh bạ, vị trí, SMS |
| Yêu cầu chất lượng về bộ nhớ từ 02/2027 | Chưa đọc chi tiết, xem lại ở Phase 9 cùng lúc đo máy tầm thấp |

Xác minh nhà phát triển Android mở rộng toàn cầu từ 2027, các trang đã đọc không nhắc riêng Việt Nam. Nhà phát triển trên Play làm luôn trong Play Console.

## 6. Tuyên bố thương nhân (trader status)

Tài khoản mới phải khai ngay khi tạo, tài khoản cũ trước 01/02/2027, dù không phát hành ở châu Âu. Khai là thương nhân thì tài khoản cá nhân bị công khai số điện thoại và địa chỉ. Không phải thương nhân thì công khai email và quốc gia. App miễn phí, không doanh thu thì nhiều khả năng không phải thương nhân, nhưng đây là khai báo của riêng bạn, nên đọc trang của Google trước khi chọn.

## 7. Thứ tự làm trên Play Console

Việc 2 đến 7 làm được song song với Phase 8.2, 8.3.

1. Tạo hoặc kiểm tra tài khoản, hoàn tất xác minh danh tính, khai trader status.
2. Tạo app: tên, tiếng Việt, app miễn phí. **Miễn phí không đổi sang có phí được.**
3. Nạp `appId` bằng bản AAB đầu tiên lên thử nghiệm nội bộ. Trùng tên thì Console báo ở bước này.
4. Điền App content: chính sách quyền riêng tư, quảng cáo, quyền truy cập app (không cần đăng nhập), xếp hạng, đối tượng, Data safety.
5. Điền trang Play theo `docs/STORE-LISTING.md` (Phase 8.3): biểu tượng 512×512, ảnh bìa, ảnh chụp.
6. Thử nghiệm nội bộ, tự kiểm theo `docs/QA-CHECKLIST.md` (Phase 9).
7. **Thử nghiệm kín:** với tài khoản cá nhân tạo sau 13/11/2023, cần ít nhất **12 người giữ tham gia 14 ngày liên tục**. Người rút giữa chừng rồi quay lại thì tính lại từ đầu, nên tuyển dư. Họ cần dùng app thật: Google có hỏi về mức độ tham gia và có thể từ chối.
8. Sửa theo phản hồi, tăng `versionCode`, đưa lên thử nghiệm kín.
9. Bấm **Apply for production** trên Dashboard, trả lời 3 phần câu hỏi. Thường duyệt dưới 7 ngày, có khi lâu hơn.
10. Phát hành dần (ví dụ 20%), theo dõi crash, rồi mở 100%.

Tài khoản tổ chức hoặc tài khoản cá nhân tạo trước mốc trên không có yêu cầu ở bước 7, nhưng vẫn nên chạy thử nghiệm kín ngắn.

## Nguồn đã đọc (06/11/2026)

- [Yêu cầu thử nghiệm với tài khoản cá nhân mới](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en)
- [Data safety](https://support.google.com/googleplay/android-developer/answer/10787469?hl=en)
- [Chính sách dữ liệu người dùng](https://support.google.com/googleplay/android-developer/answer/10144311?hl=en)
- [Play App Signing](https://support.google.com/googleplay/android-developer/answer/9842756?hl=en)
- [Yêu cầu target API](https://support.google.com/googleplay/android-developer/answer/11926878?hl=en)
- [Chính sách Metadata](https://support.google.com/googleplay/android-developer/answer/9898842?hl=en)
- [Trader status](https://support.google.com/googleplay/android-developer/answer/17594752?hl=en)
- [Khai báo trang App content](https://support.google.com/googleplay/android-developer/answer/9859455?hl=en)
- [Thông báo chính sách 15/07/2026](https://support.google.com/googleplay/android-developer/answer/17134731?hl=en), [29/10/2026](https://support.google.com/googleplay/android-developer/answer/18100766?hl=en-GB)
- [Xác minh nhà phát triển Android](https://developer.android.com/developer-verification/guides/faq?hl=en)
- [Auto Backup](https://developer.android.com/identity/data/autobackup)
