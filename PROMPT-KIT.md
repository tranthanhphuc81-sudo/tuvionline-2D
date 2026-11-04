# PROMPT KIT — Dựng app Lý Số Trọn Bộ bằng Claude Code trong Codespace

Chạy lần lượt từng phase, trên cùng một Codespace. Mỗi prompt: dán vào Claude Code (`claude` trong terminal), đọc kết quả, chạy thử, rồi `git commit` trước khi sang prompt tiếp theo.

Ký hiệu chọn model (đổi bằng lệnh `/model` trong Claude Code):

- 🟢 **Nhanh/rẻ** (Haiku) — việc khuôn mẫu, ít rủi ro.
- 🔵 **Tầm trung, agentic** (Sonnet) — sửa nhiều file, có test để tự kiểm.
- 🔴 **Suy luận cao nhất** (Opus) — quyết định kiến trúc, việc khó đảo ngược. Các bước 🔴 chỉ RA QUYẾT ĐỊNH và ghi vào tài liệu, không viết code; bước code đi ngay sau đó dùng 🟢/🔵.

Quy ước chung cho mọi prompt: Claude Code đọc `CLAUDE.md` tự động. Luôn giữ `npm test` xanh.

> Bản 3D nhiều người chơi ("Đạo quán online") là sản phẩm riêng, xem `PROMPT-KIT-3D.md`.

---

## Phase 0 — Kiểm tra môi trường

### 0.1 · 🟢 Nhanh/rẻ — chỉ chạy lệnh và báo cáo, không có quyết định nào

```
Kiểm tra môi trường Codespace cho dự án này và báo cáo ngắn gọn bằng tiếng Việt:
1. node -v, java -version, sdkmanager --list_installed (cần platforms;android-36, build-tools;36.0.0).
2. npm test — phải 23/23 xanh.
3. npm run build.
4. npm run android:debug — nếu lỗi Gradle/SDK, đọc log, sửa cấu hình môi trường (không sửa src/core) rồi chạy lại.
Kết thúc bằng đường dẫn file APK và kích thước file.
```

Sau bước này: tải `app-debug.apk` về điện thoại, cài thử bản 0.1.

---

## Phase 1 — Kiến trúc và lõi tính toán

### 1.1 · 🔴 Suy luận cao nhất — quyết định kiến trúc ảnh hưởng mọi phase sau, đổi về sau rất tốn kém

```
Đọc CLAUDE.md, README.md, src/core/*, tests/golden.test.ts và lướt public/legacy/lyso-toolkit.html, public/legacy/la-ban-phong-thuy.html.
CHƯA VIẾT CODE. Hãy ra quyết định và ghi vào docs/ARCHITECTURE.md (tiếng Việt), mỗi mục nêu lựa chọn + lý do + phương án bị loại:
1. Điều hướng: cấu trúc màn hình cho 7 công cụ trên điện thoại (thanh tab dưới tối đa 5 mục — gộp những gì, vào đâu), cách xử lý nút Back của Android (@capacitor/app).
2. Quản lý trạng thái: hồ sơ người dùng dùng chung (nhiều người — bản thân, vợ/chồng, con…), kết quả tính, cài đặt. Có cần thư viện không hay React context là đủ.
3. Lưu trữ cục bộ: @capacitor/preferences hay IndexedDB; lược đồ dữ liệu có version để nâng cấp về sau.
4. Giao diện: CSS thuần với design tokens lấy từ bản legacy (sáng/tối) hay Tailwind; font chữ (đóng gói offline, có dấu tiếng Việt).
5. Cấu trúc lại src/core thành TypeScript: chia module (lịch âm & tiết khí dùng chung, can-chi, từng hệ thống), kiểu dữ liệu đầu vào/đầu ra, chỗ đặt phần "câu chữ giải thích" (tách khỏi engine).
6. Plugin native cần dùng (đọc thành lời, cảm biến la bàn, chia sẻ ảnh kết quả, rung nhẹ) — nêu tên gói, phiên bản tương thích Capacitor 8.
7. Chiến lược kiểm thử: unit (vitest), kiểm thử giao diện, và danh sách kiểm thử thủ công trên máy thật.
8. Chừa chỗ cho Phase 6 (Đạo quán & Thầy đọc): màn hình Tổng Hợp sẽ được thay bằng "tĩnh thất", nên tách phần trình bày kết quả khỏi dữ liệu kết quả để một lớp "kịch bản đọc" dùng lại được.
Cuối tài liệu: thứ tự các bước triển khai cho Phase 1.2 → Phase 3.
```

### 1.2 · 🔵 Tầm trung — chuyển đổi nhiều file nhưng có 23 bài test vàng làm lưới an toàn

```
Theo docs/ARCHITECTURE.md mục 5, viết lại src/core sang TypeScript strict (không còn any, không còn // @ts-nocheck):
- Gộp các hàm lịch âm/tiết khí đang bị lặp ở tuvi.js, battu.js, luchao.js, battrach.js thành một module dùng chung.
- Giữ NGUYÊN mọi công thức. Không đổi kết quả.
- Xuất kiểu dữ liệu rõ ràng cho đầu vào/đầu ra của từng hệ thống qua src/core/index.ts.
- Bổ sung test: (a) đổi dương→âm→dương khớp nhau với mọi ngày 1900–2100 (lấy mẫu mỗi 7 ngày), (b) bảng ngày Tết 2000–2030 so với lịch chính thức, (c) Mệnh Quái đủ 2 giới × 100 năm so với công thức.
- Xoá các file .js cũ khi bản .ts đã thay thế xong.
Chạy npm test và npm run build sau mỗi module; báo cáo số test trước/sau.
```

---

## Phase 2 — Khung app

### 2.1 · 🔵 Tầm trung — dựng khung nhiều màn hình theo kiến trúc đã chốt

```
Theo docs/ARCHITECTURE.md, dựng khung app:
- Điều hướng + thanh tab dưới + xử lý nút Back của Android.
- Design tokens sáng/tối lấy từ public/legacy/lyso-toolkit.html (biến --bg, --surface, --gold…), safe-area, font tiếng Việt đóng gói offline.
- Màn hình "Hồ sơ": thêm/sửa/xoá nhiều người (tên, giới tính, ngày sinh dương hoặc âm lịch, tháng nhuận, giờ sinh, tuỳ chọn giờ Tý muộn), có kiểm tra ngày hợp lệ y như bản legacy (thông báo lỗi tiếng Việt). Lưu cục bộ, chọn "người đang xem" dùng chung cho mọi công cụ.
- Chuyển màn hình "Tra nhanh" hiện tại thành màn hình Tổng Hợp đọc từ hồ sơ đang chọn.
- Giữ tạm các nút mở bản legacy cho những công cụ chưa dựng lại.
Kiểm tra ở chiều rộng 360px trên trình duyệt (npm run dev), rồi npm run android:debug.
```

---

## Phase 3 — Dựng lại từng công cụ

### 3.1 · 🔴 Suy luận cao nhất — lá số Tử Vi 12 cung không vừa màn hình 360px; chọn sai bố cục sẽ phải làm lại toàn bộ màn hình

```
CHƯA VIẾT CODE. Xem cách bản legacy hiển thị lá số 12 cung (lưới 4×4, cuộn ngang trên điện thoại).
Đề xuất 2–3 phương án hiển thị lá số Tử Vi trên điện thoại (ví dụ: lưới thu nhỏ chạm để phóng to từng cung; danh sách 12 cung có sơ đồ mini; lưới xoay ngang…). So sánh độ dễ đọc, khả năng thấy tam hợp/xung chiếu, khả năng chia sẻ thành ảnh, và khả năng tô sáng từng cung + vẽ đường tam hợp/xung chiếu khi thầy đọc (Phase 6). Chọn một phương án, phác thảo bằng ASCII, ghi vào docs/ARCHITECTURE.md mục "Màn hình Tử Vi".
```

### 3.2 · 🔵 Tầm trung — dựng màn hình theo bố cục đã chốt, nhiều component

```
Dựng màn hình Tử Vi theo docs/ARCHITECTURE.md mục "Màn hình Tử Vi", dùng engine TypeScript ở src/core:
lá số 12 cung (tên cung, chính tinh, phụ tinh, chấm Tứ Hoá cả trên phụ tinh, vòng Trường Sinh, Thái Tuế, Đại Hạn), Tứ Hoá bản mệnh, dải Đại Hạn (có tên cung), tra vận theo năm, mục "Giải thích chỉ số" và "Tổng kết".
Chuyển NGUYÊN VĂN câu chữ từ các hàm renderExplain / renderTongKet / renderNotes của tab Tử Vi trong public/legacy/lyso-toolkit.html sang module nội dung riêng (không viết lại nội dung). Bỏ nút mở legacy cho Tử Vi khi xong.
Component lá số nhận prop focus?: { palace?: number; lines?: [number, number][] } để tô cung và vẽ đường nối (dùng ở Phase 6).
```

### 3.3 · 🔵 Tầm trung — Bát Tự

```
Dựng màn hình Bát Tự giống cách làm ở 3.2: 4 Trụ, Tàng Can và Thập Thần, Vượng Suy + Dụng Thần, Đại Vận có tuổi khởi vận, tra Lưu Niên, banner khi Trụ Năm khác năm âm lịch (giai đoạn giữa Lập Xuân và Tết), "Giải thích chỉ số", "Tổng kết" — câu chữ chuyển nguyên văn từ tab Bát Tự trong bản legacy.
```

### 3.4 · 🔵 Tầm trung — Lục Hào

```
Dựng màn hình Lục Hào: chọn ngày xem quẻ (nút "Hôm nay"), chọn việc cần hỏi (Dụng Thần), gieo 6 lần 3 đồng xu có hiệu ứng (crypto.getRandomValues) hoặc nhập tay; GIỮ NGUYÊN quẻ khi đổi việc cần hỏi, có nút "Gieo quẻ mới"; quẻ chủ, hào động, quẻ biến, luận đoán, giải thích, tổng kết — câu chữ chuyển nguyên văn từ tab Lục Hào bản legacy. Rung nhẹ khi gieo xong (nếu ARCHITECTURE.md đã chọn plugin rung).
```

### 3.5 · 🔵 Tầm trung — Bát Trạch và Nạp Âm

```
Dựng 2 màn hình:
1. Bát Trạch: Mệnh Quái (tự lùi năm khi sinh trước Lập Xuân, có giải thích), bảng 8 sao Du Niên, gợi ý bố trí, đánh giá căn nhà theo hướng cửa, màu sắc ngũ hành.
2. Nạp Âm: tra theo NĂM ÂM LỊCH (đổi năm vào Tết), chọn 2 hồ sơ để xem hợp hôn, áp dụng đúng các ngoại lệ trong NapAmEngine.relation.
Câu chữ chuyển nguyên văn từ tab tương ứng trong bản legacy. Sau bước này xoá hẳn public/legacy/lyso-toolkit.html khỏi app (giữ bản sao trong docs/legacy/ để tham chiếu).
```

---

## Phase 4 — La bàn phong thủy

### 4.1 · 🔴 Suy luận cao nhất — cảm biến khác nhau theo từng máy; chọn sai cách đọc hướng thì la bàn chỉ sai mà người dùng không biết

```
CHƯA VIẾT CODE. Đọc public/legacy/la-ban-phong-thuy.html (logic cảm biến, chẩn đoán, chế độ xoay tay).
Trong Android WebView của Capacitor 8: so sánh dùng sự kiện deviceorientationabsolute với dùng plugin native đọc TYPE_ROTATION_VECTOR / từ kế. Xét: độ chính xác, hướng Bắc từ hay Bắc thật (độ từ thiên ở Việt Nam khoảng −1° đến 0°), xử lý khi máy không có từ kế, hiệu chỉnh hình số 8, xoay màn hình, tiết kiệm pin.
Chốt phương án và kế hoạch kiểm thử trên máy thật, ghi vào docs/ARCHITECTURE.md mục "La bàn".
```

### 4.2 · 🔵 Tầm trung — triển khai la bàn

```
Dựng màn hình La Bàn theo docs/ARCHITECTURE.md mục "La bàn": vòng 8 hướng Bát Quái tô màu theo Mệnh Quái của hồ sơ đang chọn, kim cố định, số độ, tên hướng, sao Du Niên của hướng đang nhìn; tự dùng cảm biến nếu có, tự chuyển chế độ xoay tay nếu không, hiển thị thông báo chẩn đoán rõ ràng (không có cảm biến / bị chặn quyền / cần hiệu chỉnh) giống bản legacy; ô hiệu chỉnh độ lệch; giữ màn hình sáng khi đang đo.
Giữ ổn định (lọc nhiễu) để kim không rung. Sau khi xong, xoá public/legacy/la-ban-phong-thuy.html khỏi app.
```

---

## Phase 5 — Đọc thành lời

### 5.1 · 🔵 Tầm trung — tích hợp plugin native và chuyển logic chuẩn hoá văn bản

```
Android WebView không có speechSynthesis. Tích hợp @capacitor-community/text-to-speech (lang vi-VN):
- Chuyển logic chuẩn hoá văn bản từ bản legacy (đọc "nhãn: giá trị", ngày thành "ngày… tháng… năm…", bỏ ký hiệu ·, →, /) sang module dùng chung, có unit test.
- Chia đoạn ≤ 180 ký tự, đọc nối tiếp, nút Đọc/Dừng trên mỗi màn hình công cụ (đọc phần kết quả chính + tổng kết), tự dừng khi rời màn hình hoặc app vào nền.
- Kiểm tra máy có giọng tiếng Việt chưa (getSupportedLanguages / getSupportedVoices); nếu chưa, hướng dẫn cài "Google Text-to-speech" + gói tiếng Việt.
- Trên trình duyệt (npm run dev) vẫn dùng speechSynthesis để dễ thử.
- Viết lớp bọc speak(text, { rate, pitch }) trả về Promise resolve khi đọc xong một đoạn — Phase 6 dùng lớp này để đồng bộ hoạt ảnh và phụ đề.
```

---

## Phase 6 — Đạo quán & Thầy đọc (2D parallax, một người, offline)

Mục tiêu: trước khi vào xem, người dùng đi qua cổng nguyệt môn → sân vườn → điện Tam Thanh → hành lang, rồi được đạo đồng mời vào tĩnh thất, nơi thầy (nhân vật minh hoạ hư cấu) đọc kết quả từ engine. Toàn bộ chạy offline, không gửi dữ liệu nào ra khỏi máy.

### 6.1 · 🔴 Suy luận cao nhất — quyết định trải nghiệm, nội dung thầy được/không được nói, và định dạng kịch bản; sai ở đây thì toàn bộ phase phải làm lại, và có rủi ro chính sách Google Play

```
Đọc docs/ARCHITECTURE.md, src/core/index.ts, module nội dung (câu chữ legacy) và lớp speak() ở Phase 5.
CHƯA VIẾT CODE. Ghi vào docs/ARCHITECTURE.md mục "Đạo quán & Thầy đọc" (tiếng Việt), mỗi mục nêu lựa chọn + lý do + phương án bị loại:
1. Hành trình 5 trạm (gate, garden, hall, corridor, study): mỗi trạm có những lớp nào, tương tác gì (vuốt lên/chạm để bước tới; trạm điện Tam Thanh có thắp hương TUỲ CHỌN, nút "Đi tiếp" luôn cạnh đó; đạo đồng mời vào ở hành lang).
2. Quy tắc rút gọn: lần đầu đầy đủ (20–30 giây); các lần sau rút gọn 2–3 giây; tự đầy đủ vào rằm, mùng 1, Tết; nút "Bỏ qua" luôn hiện; nút Back của Android bỏ qua thẳng vào tĩnh thất; Cài đặt "Lối vào: Đầy đủ / Rút gọn / Không có"; prefers-reduced-motion chỉ mờ dần; âm thanh tôn trọng chế độ im lặng.
3. Biến thể cảnh theo giờ trong ngày (sáng/trưa/chiều/tối), theo mùa tính từ tiết khí của src/core, theo ngày âm (rằm trăng tròn, mùng 1 thêm khói hương, Tết câu đối đỏ). Bảng ánh xạ cụ thể.
4. Kỹ thuật: parallax bằng CSS transform + requestAnimationFrame; particle (khói, lá, đom đóm, gợn nước) bằng canvas 2D; Rive hay Lottie cho nhân vật (so sánh dung lượng, state machine, độ ổn định trong WebView). Ngân sách: toàn bộ ảnh + âm thanh hành trình ≤ 3 MB, 60 fps trên máy Android tầm thấp, nêu cách đo.
5. Định dạng cảnh dạng cấu hình (type Scene { id, layers[{src, depth, variants}], ambience[], interaction? }) để thêm trạm không phải sửa code.
6. Persona thầy: tên gọi trong app, giọng văn, cách xưng hô (thầy – con/anh/chị/cô/chú, tính từ tuổi + giới của hồ sơ, người dùng sửa được). Nhân vật hư cấu, không giống người thật.
7. Kịch bản đọc: type Cue = { text (≤180 ký tự, đã chuẩn hoá cho TTS); caption?; focus?: { palace?: number; lines?: [number, number][] }; gesture?: 'idle'|'point'|'turnPage'|'nod'; pauseAfterMs? }. Lời dẫn của thầy là bộ mẫu câu có biến, KHÔNG sinh tự do; câu chữ luận giải legacy giữ NGUYÊN VĂN. Mô tả script builder cho từng công cụ (Tử Vi, Bát Tự, Lục Hào, Bát Trạch, Nạp Âm) và trình phát (chuyển cue khi speak() resolve; Đọc/Dừng, ⏮/⏭, "nói chậm lại").
8. Danh sách nội dung thầy KHÔNG đọc thành lời (chỉ hiện chữ): tai nạn, bệnh tật, tuổi thọ, chết chóc, kiện tụng, ly hôn. Cách đánh dấu đoạn đó trong module nội dung. Thầy không bao giờ gợi ý cúng giải hạn hay mua vật phẩm. Câu mở và câu kết luôn có lời nhắc tham khảo văn hoá ("Số là tham khảo, đức năng thắng số").
9. Giọng đọc: TTS trên máy làm mặc định (chỉnh pitch/rate cho trầm, chậm); giọng đám mây KHÔNG làm trong bản này vì phá cam kết "không gửi dữ liệu" ở Data safety.
10. Thể hiện Tam Thanh: tượng cách điệu, ở xa, ánh nến mờ; không cho chạm vào tượng; thắp hương chỉ là tưởng niệm, không gắn với "tăng vận", không có vật phẩm trả phí; đạo quán hư cấu, không vẽ lại nơi có thật.
11. Thứ tự triển khai 6.2 → 6.8 và tiêu chí xong cho từng bước.
```

### 6.2 · 🔵 Tầm trung — engine cảnh nhiều file (parallax, particle, chuyển trạm), có thể kiểm bằng mắt và test logic

```
Theo docs/ARCHITECTURE.md mục "Đạo quán & Thầy đọc" (mục 1, 2, 4, 5), dựng src/features/journey/:
- SceneEngine: đọc cấu hình Scene, vẽ các lớp với hệ số độ sâu, hiệu ứng "bước tới" (lớp gần phóng to + trôi nhanh hơn lớp xa), chuyển trạm bằng vuốt lên/chạm, preload trạm kế tiếp.
- ParticleLayer canvas 2D: khói hương, lá rơi, đom đóm, gợn nước; tự giảm số hạt khi fps < 50.
- Ảnh GIỮ CHỖ: tự tạo các lớp SVG/WebP đơn giản (bóng mái cong, cột, hồ, cây, cổng tròn) theo bảng màu design tokens, đặt ở src/assets/journey/placeholder/ — tôi sẽ thay bằng tranh vẽ thật sau, không đổi code.
- Quy tắc rút gọn/bỏ qua, nút Back, prefers-reduced-motion, cài đặt "Lối vào" (lưu cục bộ).
- Unit test cho: chọn chế độ đầy đủ/rút gọn theo lần mở + ngày âm; máy trạng thái chuyển trạm; Back luôn đưa vào tĩnh thất.
Đo fps bằng Performance panel ở 360px với CPU throttle 4×; báo cáo kết quả và tổng dung lượng asset.
```

### 6.3 · 🔵 Tầm trung — biến thể theo lịch và lớp âm thanh, chạm nhiều module

```
Theo mục 3 và 4 của "Đạo quán & Thầy đọc":
- getAmbience(now, lunar, tietKhi) trả về { timeOfDay, season, lunarEvent } dùng engine src/core; SceneEngine chọn variants tương ứng. Unit test cho các ngày: rằm, mùng 1, mùng 1 Tết, ngày Lập Xuân, 23h59 và 00h00.
- Âm thanh theo lớp bằng Web Audio: ngoài vườn (gió, chim, chuông gió, suối), vào điện nhỏ dần + một tiếng chuông, tĩnh thất chỉ còn đèn dầu lách tách. Crossfade khi chuyển trạm; tắt hết khi app vào nền; tôn trọng chế độ im lặng và nút tắt tiếng trong Cài đặt.
- Âm thanh giữ chỗ: tự tạo bằng tổng hợp (Web Audio oscillator/noise) hoặc để file rỗng có ghi chú; ghi danh sách file âm thanh cần thu/mua bản quyền vào docs/ART-BRIEF.md.
```

### 6.4 · 🔵 Tầm trung — đổi màn hình Tổng Hợp thành tĩnh thất, nối với điều hướng hiện có

```
Thay màn hình Tổng Hợp bằng "Tĩnh thất":
- Án thư với các đồ vật chạm được: tờ lá số giấy dó → Tử Vi; bốn thẻ tre → Bát Tự; ba đồng xu + mai rùa → Lục Hào; la bàn gỗ → Bát Trạch/La bàn; sách cổ → Nạp Âm & hợp hôn. Vẫn giữ thanh tab dưới để đi thẳng vào công cụ.
- Thanh trên: ngày âm + can chi hôm nay; thanh điều khiển: ⏮ ⏯ "Thầy đọc" ⏭ 🐢 (nói chậm).
- Khung phụ đề luôn hiện (cỡ chữ theo cài đặt hệ thống).
- Nếu chưa có hồ sơ: đạo đồng/thầy hỏi lần lượt họ tên, giới tính, ngày giờ sinh — đây là form Hồ sơ được thoại hoá, dùng lại đúng logic kiểm tra ngày hợp lệ ở 2.1.
- Bố cục theo phác thảo 360px trong ARCHITECTURE.md; nhãn truy cập cho mọi đồ vật.
```

### 6.5 · 🔵 Tầm trung — script builder và trình phát cue, có logic cần test kỹ

```
Theo mục 6–8 của "Đạo quán & Thầy đọc", dựng src/features/reader/:
- templates.ts: bộ mẫu lời dẫn có biến ({xungHo}, {cung}, {chinhTinh}, {quaiChu}…) — viết bộ tối thiểu cho mỗi công cụ; bộ đầy đủ viết ở 6.7.
- xungHo(profile, settings): tính cách xưng hô từ tuổi + giới, cho phép ghi đè.
- buildScript(tool, result, profile): Cue[] = câu mở (có lời nhắc văn hoá) + lời dẫn + đoạn luận giải NGUYÊN VĂN (chuẩn hoá cho TTS, chia ≤180 ký tự) + câu kết; bỏ qua phần TTS của đoạn bị đánh dấu "không đọc" nhưng vẫn hiện caption "(Phần này con xem chữ trên màn hình)".
- CuePlayer: play/pause/next/prev/slower, chuyển cue khi speak() resolve, phát sự kiện focus/gesture/caption, dừng khi rời màn hình hoặc app vào nền.
- Nối focus vào component lá số (prop focus ở 3.2) để tô cung và vẽ đường tam hợp/xung chiếu.
- Unit test: (a) không cue nào > 180 ký tự; (b) mọi đoạn luận giải legacy xuất hiện nguyên văn trong caption; (c) không cue TTS nào chứa từ trong danh sách cấm đọc; (d) câu mở và câu kết luôn có lời nhắc; (e) xưng hô đúng cho 6 hồ sơ mẫu.
```

### 6.6 · 🔵 Tầm trung — nhân vật và hoạt ảnh nghi thức, nhiều component

```
- Nhân vật thầy và đạo đồng theo công cụ đã chọn ở 6.1 (Rive hoặc Lottie): state idle / talk / point / turnPage / nod; nhân vật GIỮ CHỖ vẽ đơn giản (bóng dáng, áo đạo bào) để tôi thay file sau mà không đổi code. Miệng mấp máy theo trạng thái đang nói, không cần lip-sync.
- Hoạt ảnh "an sao": khi mở Tử Vi từ tĩnh thất, lá số hiện dần trên nền giấy dó, mỗi sao rơi vào cung trong 2–3 giây (bỏ qua được, tắt khi reduced-motion).
- Lục Hào: người dùng tự gieo xu trước mặt thầy (chạm hoặc lắc máy qua devicemotion, có ngưỡng chống rung tay), rung nhẹ mỗi lần gieo.
- Thắp hương ở điện Tam Thanh: chạm giữ để thắp, nén hương cháy theo thời gian thật (lưu lit_at cục bộ, 20 phút), quay lại thấy hương đã tàn. Không tính điểm, không huy hiệu.
```

### 6.7 · 🟢 Nhanh/rẻ — viết nội dung theo quy tắc đã chốt ở 6.1, không đổi logic; tôi sẽ đọc duyệt bằng tay

```
Mở rộng src/features/reader/templates.ts theo đúng persona, xưng hô và danh sách cấm đọc trong docs/ARCHITECTURE.md mục "Đạo quán & Thầy đọc":
- Mỗi công cụ: 3 câu mở, 3 câu kết (đều có lời nhắc văn hoá), lời dẫn cho từng phần kết quả (ít nhất 2 biến thể để đỡ lặp).
- Lời đạo đồng ở cổng, hành lang, và khi hỏi hồ sơ.
- Giọng văn mộc, từ tốn, không hù doạ, không hứa hẹn, không gợi ý mua bán hay cúng giải hạn.
Chạy lại test 6.5 — phải xanh.
```

### 6.8 · 🟢 Nhanh/rẻ — viết tài liệu đặt hàng, không đụng code

```
Viết docs/ART-BRIEF.md (tiếng Việt) để tôi gửi hoạ sĩ minh hoạ và người làm âm thanh:
- Danh sách lớp ảnh cho 5 trạm × biến thể (giờ/mùa/ngày âm), kích thước, định dạng WebP, quy ước tên file đúng với cấu hình Scene hiện có.
- Yêu cầu nhân vật thầy và đạo đồng (hư cấu, đạo bào, phong cách), danh sách state cần có cho file Rive/Lottie.
- Quy tắc thể hiện Tam Thanh (mục 10 của ARCHITECTURE).
- Danh sách âm thanh cần có, độ dài, yêu cầu bản quyền thương mại.
- Ngân sách dung lượng tổng ≤ 3 MB.
```

---

## Phase 7 — Lưu và chia sẻ

### 7.1 · 🔵 Tầm trung — nhiều màn hình, plugin native

```
- Nút "Chia sẻ" trên mỗi màn hình kết quả: xuất ảnh PNG gọn đẹp (tiêu đề, hồ sơ, kết quả chính, dòng lưu ý văn hoá) rồi mở bảng chia sẻ của Android (@capacitor/share + @capacitor/filesystem). Chạy hoàn toàn offline.
- Sao lưu / khôi phục danh sách hồ sơ ra file JSON.
- Màn hình Cài đặt: giao diện sáng/tối/theo máy, tốc độ và cao độ giọng thầy, xưng hô của thầy, "Lối vào" (Đầy đủ / Rút gọn / Không có), âm thanh hành trình bật/tắt, xoá toàn bộ dữ liệu, giới thiệu và chính sách quyền riêng tư.
```

---

## Phase 8 — Phát hành Google Play

### 8.1 · 🔴 Suy luận cao nhất — appId, khoá ký và khai báo dữ liệu không sửa lại được sau khi phát hành

```
CHƯA VIẾT CODE. Lập docs/RELEASE.md (tiếng Việt) gồm:
1. appId cuối cùng (đề xuất 2–3 phương án theo tên miền/thương hiệu của tôi, giải thích không đổi được sau khi phát hành), tên app trên Play, quy ước versionName/versionCode.
2. Ký app: dùng Play App Signing + upload key; tạo upload key ở đâu, lưu ở đâu (KHÔNG commit), đưa mật khẩu vào Codespaces Secrets thế nào.
3. Câu trả lời cho mục An toàn dữ liệu (Data safety): app không thu thập/không gửi dữ liệu, mọi dữ liệu lưu trên máy (kể cả hồ sơ, hương đã thắp, cài đặt lối vào); giọng đọc dùng TTS trên máy. Rà lại toàn bộ code để chắc không có request mạng nào.
4. Phân loại nội dung, đối tượng người dùng, lưu ý chính sách cho nhóm app tử vi/phong thủy (nội dung giải trí – văn hoá, không cam kết dự đoán); hình ảnh tôn giáo (điện Tam Thanh) thể hiện tôn trọng, không gắn với mua bán.
5. Danh sách việc cần làm trên Play Console (theo thứ tự), bao gồm yêu cầu thử nghiệm kín với tài khoản nhà phát triển cá nhân mới (số người thử và số ngày theo quy định hiện hành — kiểm tra lại trên trang chính thức của Google).
```

### 8.2 · 🔵 Tầm trung — cấu hình build phát hành

```
Theo docs/RELEASE.md:
- Đổi appId ở capacitor.config.ts và android/app/build.gradle (kể cả namespace và package Java), chạy npx cap sync.
- Biểu tượng app + màn hình chờ bằng @capacitor/assets từ một ảnh nguồn 1024×1024 tôi sẽ cung cấp ở assets/ (tạm thời tạo ảnh giữ chỗ hình la bàn/bát quái nếu chưa có).
- Cấu hình ký release trong Gradle đọc từ biến môi trường (Codespaces Secrets), không có mật khẩu trong repo.
- Script tăng versionCode/versionName.
- Trang chính sách quyền riêng tư tĩnh (docs/privacy.html) để đăng qua GitHub Pages.
- npm run android:release và báo cáo đường dẫn file AAB.
```

### 8.3 · 🟢 Nhanh/rẻ — viết nội dung, không đụng code

```
Viết nội dung trang Google Play bằng tiếng Việt vào docs/STORE-LISTING.md: tên ngắn (≤30 ký tự), mô tả ngắn (≤80 ký tự), mô tả đầy đủ (≤4000 ký tự, có câu lưu ý mang tính văn hoá – tham khảo; giới thiệu hành trình đạo quán và thầy đọc kết quả), 8 tiêu đề gợi ý cho ảnh chụp màn hình (có cổng nguyệt môn, điện Tam Thanh, tĩnh thất), danh sách từ khoá.
```

---

## Phase 9 — Kiểm thử trước phát hành

### 9.1 · 🔵 Tầm trung — rà soát toàn app, sửa lỗi nhiều nơi

```
Rà soát chất lượng toàn app và sửa lỗi tìm được:
- npm test, npm run build, kiểm tra kích thước bundle và thời gian khởi động (đo cả khi hành trình ở chế độ đầy đủ và rút gọn).
- Truy cập: nhãn cho nút biểu tượng và đồ vật trong tĩnh thất, cỡ chữ lớn của hệ thống, độ tương phản ở cả 2 giao diện sáng/tối, vùng chạm ≥ 44px, reduced-motion.
- Màn hình 360px và máy tính bảng; xoay ngang; nút Back (đặc biệt trong hành trình và khi thầy đang đọc).
- Ngày biên: 29/2, 31/12 giờ Tý muộn, sinh trước 1968, tháng nhuận, sinh đúng ngày Lập Xuân / Tết; biến thể cảnh vào rằm, mùng 1, Tết, nửa đêm.
- Thầy đọc: thử đủ 5 công cụ, chuyển app vào nền giữa chừng, có cuộc gọi đến, máy chưa cài giọng tiếng Việt.
- Lập docs/QA-CHECKLIST.md để tôi tự kiểm trên máy thật (la bàn, đọc thành lời, hành trình, chia sẻ, chế độ máy bay, máy Android tầm thấp).
```
