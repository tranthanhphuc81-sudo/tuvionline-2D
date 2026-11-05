# PROMPT KIT bổ sung — Tính năng "Xem chỉ tay" (tuvionline-2D)

Bổ sung cho `PROMPT-KIT.md`. Chạy **Phase 3B sau bước 3.5, trước Phase 4**, trên cùng Codespace. Các bước móc nối (3B.6–3B.9) chạy **xen vào Phase 6–9** đúng vị trí ghi trong tiêu đề.

Ký hiệu model giữ như kit chính: 🟢 Haiku · 🔵 Sonnet · 🔴 Opus (bước 🔴 chỉ quyết định và ghi tài liệu, không viết code).

**Chuẩn bị (làm tay, một lần):**
1. Chép `CHI-TAY.md` vào `docs/CHI-TAY.md`.
2. Chép `palm-content.vi.json` vào `src/content/palm/palm-content.vi.json`.
3. `git add docs/CHI-TAY.md src/content/palm && git commit -m "docs: kiến thức chỉ tay + nội dung seed"`.

---

## Phase 3B — Xem chỉ tay

### 3B.1 · 🔴 Suy luận cao nhất — chọn cách nhập liệu, bố cục và thuật toán; quyết định cả rủi ro chính sách nội dung và Data safety, đổi về sau rất tốn kém

```
Đọc docs/CHI-TAY.md (toàn bộ, nhất là §1, §2, §11, §12, §14), docs/ARCHITECTURE.md, src/core/index.ts, cấu trúc module nội dung hiện có, và src/content/palm/palm-content.vi.json.
CHƯA VIẾT CODE. Ghi vào docs/ARCHITECTURE.md mục "Xem chỉ tay" (tiếng Việt), mỗi mục nêu lựa chọn + lý do + phương án bị loại:
1. Cách nhập liệu. So sánh: (a) bộ câu hỏi chọn theo hình minh hoạ (CHI-TAY §11); (b) (a) + ảnh chụp tay làm NỀN đối chiếu, không nhận diện; (c) nhận diện đường chỉ tay trên máy (ML on-device). Xét: độ chính xác, dung lượng app, thời gian làm, rủi ro đọc sai, quyền CAMERA và câu trả lời Data safety. Chủ dự án đã chọn (c) có giới hạn: máy đo trước, phần còn lại hỏi câu ngắn (ARCHITECTURE.md mục 13).
2. Vị trí trong điều hướng: thanh tab dưới đã tối đa 5 mục — chỉ tay vào đâu (gộp vào nhóm nào, hay chỉ mở từ tĩnh thất + màn Tra cứu). Nút Back trong wizard nhiều bước.
3. Bố cục 360px: phác thảo ASCII cho (i) wizard câu hỏi có hình + nút "Không rõ", (ii) màn kết quả: sơ đồ bàn tay + các mục §14.1 sections + tổng kết theo chủ đề, (iii) chế độ so sánh hai tay, (iv) lớp Cửu cung bật/tắt (CHI-TAY §13, dùng chung màu ngũ hành với Bát Trạch).
4. Component PalmDiagram (SVG): hệ toạ độ chuẩn hoá cho bàn tay trái/phải (lật gương), vùng gò + Cửu cung, đường chính/phụ, dấu; prop focus?: { zones?: MountId[]; lines?: LineId[]; marks?: string[] } để Phase 6 tô sáng.
5. Engine: chốt thuật toán CHI-TAY §14.2 (ánh xạ câu trả lời → ID, tra tổ hợp vân tay V01–V30, ma trận gò × dấu, tổng kết theo chủ đề với ngưỡng 'ro'/'xu-huong', so sánh hai tay). Đặt ở src/core/palm (thuần TS, không phụ thuộc UI). Đầu vào/đầu ra đúng kiểu PalmInput/PalmResult hoặc chỉnh và giải thích.
6. Lưu trữ: phiên xem gắn với hồ sơ + ngày (để so sánh theo thời gian vì "tướng tay thay đổi"), lược đồ có version; ảnh (nếu có) lưu ở thư mục riêng của app, xoá được, nằm trong "Xoá toàn bộ dữ liệu".
7. Chính sách nội dung: xác nhận danh mục loại bỏ CHI-TAY §12, cách hiển thị câu tts=false, lời nhắc cố định ở đầu và cuối kết quả, cách xử lý 3 mục needsReview (V19, V26, N04) khi chưa đối chiếu xong (ẩn hay hiện).
8. Ảnh hưởng tới Phase 6 (Cue.focus.palm, đồ vật trong tĩnh thất), Phase 7 (chia sẻ ảnh kết quả, sao lưu JSON) và Phase 8.1 (Data safety: CAMERA, ảnh không rời máy).
Cuối mục: thứ tự triển khai 3B.2 → 3B.5 và tiêu chí xong cho từng bước.
```

### 3B.2 · 🔵 Tầm trung — engine thuần TypeScript nhiều file, có test làm lưới an toàn

```
Theo docs/ARCHITECTURE.md mục "Xem chỉ tay" (mục 5, 6, 7) và docs/CHI-TAY.md §11, §14:
- src/content/palm/: kiểu PalmReading, loader đọc palm-content.vi.json, hàm getReading(id). Không sửa câu chữ trong JSON — nội dung chỉ đổi qua docs/CHI-TAY.md + script ở bước 3B.5.
- src/content/palm/questions.ts: bộ câu hỏi Q01–Q32 đúng bảng CHI-TAY §11 (id, câu hỏi, lựa chọn, ID đặc điểm, id hình minh hoạ ill.<Q>.<option>, chọn một/chọn nhiều, tuỳ chọn hay bắt buộc).
- src/core/palm/: analyzePalm(input: PalmInput): PalmResult theo thuật toán đã chốt; tra V01–V30 khi 5 ngón chỉ có loop/whorl với đúng 1 hoặc 3 ngón cùng loại; dấu → 'G-<gò>.<dấu>' hoặc câu chung §9.1; tổng kết theo chủ đề; so sánh hai tay; câu kết cố định.
- Xuất qua src/core/index.ts.
Unit test (vitest):
(a) mọi lựa chọn trong questions.ts trỏ tới ID có trong JSON;
(b) không reading nào > 180 ký tự; reading tts=true không chứa từ trong ttsForbidden;
(c) không ID nào trùng; mọi reading có ít nhất một nguồn (trừ TT03);
(d) 30 tổ hợp vân tay trả đúng V01–V30; tổ hợp có vân cung hoặc 2/4 ngón → rơi về P01–P03;
(e) ngưỡng confidence: 1 dấu hiệu → 'xu-huong', ≥ 2 cùng chiều → 'ro';
(f) mỗi chủ đề có câu thì có ít nhất một câu tone '+' hoặc '=' nếu dữ liệu có;
(g) không câu nào chứa con số tuổi gắn với tone '!';
(h) cùng đầu vào → cùng kết quả (không ngẫu nhiên);
(i) 5 hồ sơ bàn tay mẫu (tự tạo trong tests/fixtures/palm/) cho ra kết quả snapshot.
npm test và npm run build phải xanh; báo cáo số test trước/sau.
```

### 3B.3 · 🔵 Tầm trung — giao diện nhiều component, có thể kiểm bằng mắt ở 360px

```
Theo docs/ARCHITECTURE.md mục "Xem chỉ tay" (mục 1–4, 6):
- PalmDiagram (SVG): vẽ bàn tay giữ chỗ (một nét, theo design tokens), vùng gò, lớp Cửu cung bật/tắt (màu ngũ hành dùng chung với Bát Trạch), đường chính/phụ, dấu; nhận prop focus để tô sáng và dim phần còn lại; lật gương cho tay trái; nhãn truy cập cho từng vùng.
- Wizard câu hỏi: một câu một màn, hình minh hoạ (dùng SVG giữ chỗ ở src/assets/palm/ill/<Q>-<option>.svg — tự tạo hình đơn giản để tôi thay sau mà không đổi code), nút "Không rõ / bỏ qua", thanh tiến độ, Back của Android lùi một câu, lưu nháp cục bộ khi thoát giữa chừng.
- Tuỳ chọn ảnh nền (nếu ARCHITECTURE chọn): chụp hoặc chọn ảnh, hiện mờ phía sau sơ đồ để đối chiếu, lưu trong thư mục app, có nút xoá ảnh.
- Màn kết quả: lời nhắc đầu trang; các mục theo sections; mỗi câu có nhãn chủ đề và nút "Vì sao?" mở đặc điểm + nguồn (DVT/HCM/TCT/JDJ); câu tts=false vẫn hiện bình thường; tổng kết theo chủ đề; lời nhắc cuối "xem lại sau 6–12 tháng" + lời nhắc văn hoá.
- So sánh hai tay và so sánh với lần xem trước của cùng hồ sơ.
- Cài đặt: "Cách chọn tay xem chính" (Tay thuận / Nam tả nữ hữu / Phép đan tay).
- Điểm vào theo mục 2 của ARCHITECTURE.
Kiểm tra ở 360px (npm run dev) cả giao diện sáng/tối, cỡ chữ lớn; rồi npm run android:debug.
```

### 3B.4 · 🟢 Nhanh/rẻ — viết tài liệu đặt hàng, không đụng code

```
Bổ sung vào docs/ART-BRIEF.md mục "Xem chỉ tay": danh sách hình minh hoạ cho từng lựa chọn trong src/content/palm/questions.ts (tên file đúng quy ước ill/<Q>-<option>.svg, mô tả ngắn từng hình, phiên bản tay phải; tay trái do code lật gương), hình bàn tay gốc cho PalmDiagram (kích thước khung, các lớp: đường viền, gò, Cửu cung, đường chỉ, dấu), phong cách một nét đồng bộ với la bàn/bát quái, định dạng SVG tối ưu, tổng dung lượng mục tiêu ≤ 300 KB.
```

### 3B.5 · 🟢 Nhanh/rẻ — script khuôn mẫu, không đổi logic

```
Viết scripts/palm-md2json.mjs (Node, không thêm dependency): đọc docs/CHI-TAY.md, sinh lại src/content/palm/palm-content.vi.json theo đúng định dạng file hiện có (đọc các bảng 7 cột "ID | Đặc điểm | Luận giải | Chủ đề | Mức | TTS | Nguồn" và ma trận "ID | Gò | Sao | …"; ô TTS dạng "✓", "✗" hoặc "3 ✓" = trọng số + TTS). Kiểm tra: ID trùng, > 180 ký tự, chủ đề lạ, từ cấm đọc khi tts=true; thoát mã 1 nếu có lỗi.
Thêm "npm run palm:content". Chạy script với docs/CHI-TAY.md hiện tại: JSON sinh ra phải giống file đang có về nội dung (parse cả hai rồi so sánh sâu; khác khoảng trắng thì không sao). Chạy lại test 3B.2 — phải xanh.
```

---

## Móc nối vào các phase sau

### 3B.6 · 🔵 Tầm trung — chạy NGAY SAU 6.5: script builder cho chỉ tay, có logic cần test

```
Theo docs/ARCHITECTURE.md mục "Đạo quán & Thầy đọc" và mục "Xem chỉ tay", docs/CHI-TAY.md §12–§13:
- Mở rộng type Cue: focus.palm?: { zones?: MountId[]; lines?: LineId[]; marks?: string[] }.
- buildScript('palm', result, profile): câu mở riêng cho chỉ tay (có lời nhắc "đường chỉ đổi theo cách mình sống" + lời nhắc văn hoá) → lời dẫn từng mục → reading (text giữ nguyên, chuẩn hoá TTS) kèm focus theo line/mount/mark của reading → tổng kết theo chủ đề → câu kết (xem lại sau 6–12 tháng + "Số là tham khảo, đức năng thắng số").
- Reading tts=false: không đọc, vẫn hiện caption "(Phần này con xem chữ trên màn hình)".
- Nối focus.palm vào PalmDiagram để tô gò/đường khi thầy nói tới.
Unit test bổ sung vào bộ test 6.5: (a) mọi cue palm ≤ 180 ký tự; (b) không cue TTS nào chứa từ cấm; (c) reading tts=false không sinh cue TTS; (d) câu mở/kết luôn có lời nhắc; (e) mỗi cue của reading có line/mount thì có focus.palm tương ứng.
```

### 3B.7 · 🔵 Tầm trung — chạy CÙNG LÚC với 6.4: thêm đồ vật vào tĩnh thất

```
Trong màn Tĩnh thất (6.4), thêm đồ vật mở Xem chỉ tay theo docs/ARCHITECTURE.md mục "Xem chỉ tay" (gợi ý trong CHI-TAY §13: tấm giấy dó in dấu bàn tay, hoặc đèn dầu soi tay), có nhãn truy cập, hình giữ chỗ để tôi thay sau. Nếu hồ sơ đang chọn chưa có phiên xem tay: đạo đồng mời "con xoè tay cho thầy xem" rồi mở wizard 3B.3. Bổ sung đồ vật này vào docs/ART-BRIEF.md.
```

### 3B.8 · 🟢 Nhanh/rẻ — chạy CÙNG LÚC với 6.7: viết lời dẫn, không đổi logic

```
Mở rộng src/features/reader/templates.ts cho công cụ 'palm' theo persona và danh sách cấm đọc trong docs/ARCHITECTURE.md: 3 câu mở, 3 câu kết (đều có lời nhắc văn hoá và lời nhắc tướng tay thay đổi), lời dẫn cho từng mục (hình bàn tay, ngón, ba đường chính, đường phụ, gò và dấu, tổng kết), mỗi lời dẫn ≥ 2 biến thể. Giọng mộc, từ tốn, không hù doạ, không hứa hẹn, không nhắc bệnh tật, tuổi thọ, con cái, chia ly. Chạy lại test 6.5 và 3B.6 — phải xanh.
```

### 3B.9 · 🔵 Tầm trung — chạy TRƯỚC 8.1 và 9.1: rà soát chính sách và dữ liệu

```
1. Bổ sung vào docs/RELEASE.md mục Data safety: quyền CAMERA (nếu dùng ảnh nền), ảnh tay chỉ lưu trong thư mục app, không gửi đi, xoá được; phiên xem tay lưu cục bộ. Rà lại code chỉ tay để chắc không có request mạng.
2. Bổ sung vào docs/QA-CHECKLIST.md: làm đủ wizard với mọi lựa chọn "Không rõ"; chỉ khai một tay; hai tay ngược nhau; đổi cách chọn tay trong Cài đặt; xoay ngang; Back giữa wizard; app vào nền khi đang chụp ảnh; thầy đọc kết quả chỉ tay và tô sơ đồ; chia sẻ ảnh kết quả; "Xoá toàn bộ dữ liệu" xoá cả ảnh tay.
3. Mô tả Play (docs/STORE-LISTING.md): thêm một câu giới thiệu Xem chỉ tay với cùng lời nhắc tính chất văn hoá – tham khảo; không dùng từ "chẩn đoán", "dự đoán chính xác".
```
