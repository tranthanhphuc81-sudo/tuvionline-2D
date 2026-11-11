# PROMPT KIT bổ sung — "Phân tích ngũ hành" cho Bát Tự (tuvionline-2D)

Bổ sung cho `PROMPT-KIT.md`. Thêm vào màn hình Bát Tự và Thầy đọc một lớp phân tích ngũ hành có định lượng:

- tính điểm 5 hành;
- chọn Dụng / Hỷ / Kỵ thần theo Phù ức, Điều hậu, Thông quan, Thuận thế;
- kiểm tra Tòng cách theo 4 điều kiện, kèm độ tin cậy;
- hiện nhiều cách luận có trọng số;
- kiểm chứng bằng các năm đã qua;
- lời khuyên thực hành theo Thập thần.

**Thứ tự chạy:** Phase 3C chạy ngay bây giờ, vì Phase 0–7 và 3B đã xong phần code. Phải xong trước khi mở lại Phase 8.x và 9.1. Chạy lần lượt trên cùng Codespace. Mỗi prompt: dán vào Claude Code, đọc kết quả, chạy thử, cập nhật `docs/PROGRESS.md`, `git commit` rồi mới sang prompt tiếp.

Ký hiệu model giữ như kit chính (đổi bằng `/model`):

- 🟢 **Nhanh/rẻ** (Haiku): việc khuôn mẫu, ít rủi ro.
- 🔵 **Tầm trung, agentic** (Sonnet): sửa nhiều file, có test để tự kiểm.
- 🔴 **Suy luận cao nhất** (Opus): quyết định khó đảo ngược. Bước 🔴 chỉ RA QUYẾT ĐỊNH và ghi tài liệu, không viết code.

**Đã có sẵn trong repo** (chép vào ngày 11/11/2026):

| File | Nội dung |
|---|---|
| `docs/ngu-hanh-engine/` | Engine tham chiếu v0.2: `data.ts`, `config.ts`, `engine.ts`, `follow.ts`, `advice.ts`, `README.md`, `demo.ts`. TypeScript thuần, KHÔNG nằm trong `tsconfig`/vitest, KHÔNG đóng gói vào app. Bước 3C.2 sẽ port vào `src/core`. |
| `docs/NGU-HANH-SO-SANH.md` | So sánh Dụng Thần legacy và engine trên 3000 lá số dùng chung tứ trụ của app, kèm bộ 24 lá số mẫu để gán nhãn. |
| `docs/ngu-hanh-engine/compare-dung-than.ts` | Script tái tạo bảng so sánh: `npx tsx docs/ngu-hanh-engine/compare-dung-than.ts`. |

Con số then chốt trong bảng so sánh:

- Dụng thần chính chỉ trùng **36,1%**.
- **40,5%** lá số bị **đảo chiều**: dụng thần của bên này là kỵ thần của bên kia.
- Legacy chỉ kết luận "Thân vượng" cho 14,4% lá số, engine kết luận vượng cho 34%.

Nguồn lệch lớn nhất: luật legacy `thanVuong = dacLenh && giup >= hao` chỉ đếm 3 can lộ.

**Việc tay của chủ dự án (nên làm trước 3C.1, không bắt buộc):** điền cột "Đáp án người luận" cho ít nhất 12/24 lá số ở mục 3 của `docs/NGU-HANH-SO-SANH.md`. Nguồn đáp án có thể là người luận quen biết hoặc sách Phần 2 trong `docs/`. Nếu chưa điền, 3C.1 phải chọn phương án đảo ngược được.

---

## Phase 3C — Phân tích ngũ hành

### 3C.1 · 🔴 Suy luận cao nhất — chốt cách xử lý xung đột Dụng thần với bản legacy. Quyết sai thì người dùng thấy hai kết luận ngược nhau trên cùng màn hình (40,5% lá số), phải sửa parity test, snapshot và lời thầy đọc. Đổi sau khi phát hành sẽ làm người dùng cũ mất niềm tin

```
Đọc CLAUDE.md, docs/ARCHITECTURE.md (mục 5, 7, 12, 13), docs/PROGRESS.md, docs/NGU-HANH-SO-SANH.md (toàn bộ, kể cả cột đáp án nếu chủ dự án đã điền), docs/ngu-hanh-engine/README.md và các file trong docs/ngu-hanh-engine/src, src/core/battu/reading.ts (assessThan, dungThanPattern, batTuReading), src/content/battu/*, src/features/battu/BatTuScreen.tsx, src/features/reader/script.ts, tests/parity/battu.test.ts. Lướt docs/Ly-So-Phan-2-Bat-Tu-Tu-Tru.docx phần Vượng suy và Dụng thần (dùng skill/công cụ đọc docx nếu có).
CHƯA VIẾT CODE. Ghi vào docs/ARCHITECTURE.md mục mới "14. Phân tích ngũ hành (Phase 3C)" (tiếng Việt). Mỗi điểm nêu lựa chọn + lý do + phương án bị loại:

1. XUNG ĐỘT DỤNG THẦN (quyết định chính). So sánh ít nhất 3 phương án:
   (A) Engine thay hẳn Dụng thần legacy: sửa batTuReading, lệch nguyên văn, phải xin ngoại lệ parity và core-snapshot.
   (B) Giữ nguyên văn mục "Vượng Suy + Dụng Thần" của legacy. Thêm mục riêng "Phân tích ngũ hành" chạy engine, nói rõ đây là phương pháp định lượng khác, và hiện dòng giải thích khi hai bên lệch nhau.
   (C) Engine là nguồn DUY NHẤT cho tên hành dụng/kỵ hiển thị và cho điểm Đại Vận/Lưu Niên. Câu chữ "bài học" legacy vẫn giữ, nhưng các đoạn nêu hành cụ thể được tách thành tham số.
   Với mỗi phương án, xét:
   - người dùng thấy gì ở lá số bị đảo chiều;
   - ảnh hưởng tới tests/parity, tests/core-snapshot.test.ts (KHÔNG được sinh lại) và quy tắc "nguyên văn legacy" trong CLAUDE.md;
   - công sửa;
   - khả năng đổi sang phương án khác sau này;
   - kết quả khớp đáp án người luận trong NGU-HANH-SO-SANH mục 3 (nếu có). Nếu chủ dự án CHƯA điền đáp án thì chỉ được chọn phương án đảo ngược được, và ghi điều kiện để chuyển phương án (vd. "engine khớp ≥ 75% đáp án trên ≥ 12 lá số").
2. Những nơi đang dùng Dụng thần và nguồn của từng nơi sau quyết định: dải Đại Vận và tra Lưu Niên ở màn Bát Tự (batTuReading.daiVanNow / yearNow), Tổng hợp, thẻ chia sẻ ảnh, kịch bản Thầy đọc, màu sắc ở Bát Trạch, La Bàn. Lập bảng: nơi, nguồn hiện tại, nguồn sau 3C, có đổi chữ hiển thị không.
3. Mâu thuẫn màu sắc và hướng: cùng một người có thể nhận gợi ý màu theo Nạp Âm, theo Mệnh Quái (Bát Trạch) và theo Dụng thần. Chọn: chỉ một nguồn ở mỗi màn, hay hiện cả ba và ghi rõ nguồn. Viết đúng câu giải thích sẽ hiện cho người dùng.
4. Port engine vào src/core/nguhanh:
   - DÙNG LẠI bảng có sẵn của app (CAN, CHI, TANG_CAN, CAN_HANH, CHI_HANH, BT_HANH_ORDER, seasonHanh), bỏ bảng trùng trong data.ts, có test chứng minh hai bảng khớp trước khi bỏ;
   - dùng chính tả "Hoả/Thuỷ" của app;
   - đầu vào là BatTuChart;
   - engine trả mã/số, không trả câu văn (đúng quy tắc src/core).
   Câu chữ: legacy ĐÃ CÓ bảng nguyên văn trùng ý với advice.ts, gồm src/content/interp/battu.ts (FAMILY: nét, nghề, lưu ý, ví dụ, khi thiếu của 5 nhóm Thập thần) và src/content/interp/hanh.ts (HANH_INFO: màu, hướng, nghề, vật phẩm, mùa). Chọn cho từng loại câu: dùng lại bảng legacy (nhất quán giọng văn, qua được parity) hay viết mới.
   - Phần không có trong legacy (lý do chọn dụng thần, điều kiện Tòng cách, dấu hiệu dư/cách tiết chế, nhãn năm, câu hỏi kiểm chứng) là NỘI DUNG MỚI ở src/content/nguhanh (ngoại lệ giống src/content/palm), nguồn ở docs/NGU-HANH.md.
   - Quyết định riêng về HANH_INFO.vat (vật phẩm): engine đặt vật phẩm/màu/hướng sau cùng vì là lớp biểu tượng. Có hiện vật phẩm trong mục ngũ hành không, và hiện thế nào để không thành gợi ý mua bán (ARCHITECTURE 12.8).
   Có mở preset trường phái (config.ts) cho người dùng trong Cài đặt không, hay chỉ để nội bộ ở bản đầu.
5. Thời gian:
   - Thay yearPillar() bằng yearCanChiIndex theo Lập Xuân của app.
   - Đưa Đại Vận (ch.daiVan, khoiVanYears) vào đánh giá giai đoạn và vào câu hỏi kiểm chứng. Đại Vận ưu tiên hơn Lưu Niên vì người dùng nhớ giai đoạn 10 năm dễ hơn từng năm.
   - Quy tắc chọn câu hỏi: tối đa mấy câu, từ tuổi bao nhiêu, cách hiện năm (có kèm tuổi mụ, ghi chú "tính từ Lập Xuân").
6. Kiểm chứng bằng quá khứ:
   - nơi hiện: màn Bát Tự, Tĩnh thất (thầy hỏi), hay cả hai;
   - lựa chọn trả lời: thuận / bình thường / khó khăn / KHÔNG NHỚ, và "không nhớ" không được tính;
   - lưu câu trả lời: lược đồ lyso.state v3 → v4, gắn theo hồ sơ, vào file sao lưu, xoá cùng hồ sơ và "Xoá toàn bộ", không rời máy;
   - làm lại hoặc xoá câu trả lời;
   - khi kết luận rồi thì có hỏi lại khi người dùng sửa ngày giờ sinh không.
7. Hiển thị nhiều cách luận:
   - khi nào hiện cách luận thay thế (Chân: chỉ một dòng "xem cách khác"; Giả: hai cột/tab ngang hàng);
   - trọng số hiện bằng % hay bằng chữ ("nghiêng về…");
   - cách hiện bảng 4 điều kiện Tòng cách cho người không học Bát Tự.
8. Chính sách nội dung, áp dụng ARCHITECTURE mục 12.8:
   - đổi nhãn năm "Cần thận trọng" / "Kém thuận" thành cách nói mềm, luôn kèm gợi ý nên làm gì;
   - không lời khuyên y tế, đầu tư, pháp lý cụ thể;
   - đoạn nào vào noSpeech;
   - lời nhắc văn hoá ở đầu và cuối mục;
   - không bao giờ gợi ý vật phẩm hay cúng giải.
9. Kiểm thử:
   - tests/fixtures/nguhanh-golden.json (24 lá số mẫu, có đáp án khi chủ dự án điền);
   - snapshot RIÊNG cho engine ngũ hành, không đụng core-snapshot;
   - bất biến: tổng trọng số cách luận = 1, dụng ≠ kỵ, cừu không trùng dụng/hỷ, Chân thì không cổng nào trượt.
10. Thứ tự triển khai 3C.2 → 3C.8 và tiêu chí xong cho từng bước. Ghi rõ điểm nào cần chủ dự án duyệt trước khi sang bước sau.
```

### 3C.2 · 🔵 Tầm trung — port engine nhiều file vào src/core, có bảng so sánh và test làm lưới an toàn

```
Theo docs/ARCHITECTURE.md mục 14 (điểm 4, 5, 9), port docs/ngu-hanh-engine/src vào src/core/nguhanh (TypeScript strict, import không đuôi .ts theo moduleResolution Bundler):
- Trước tiên viết test chứng minh bảng tàng can, hành của can/chi, thứ tự hành trong docs/ngu-hanh-engine/src/data.ts khớp bảng có sẵn trong src/core/battu/engine.ts và src/core/canchi. Khớp rồi mới bỏ bảng trùng và dùng bảng của app.
- toNguHanhChart(ch: BatTuChart). Tính điểm, xếp loại nhật chủ, assessFollow, buildReadings, evaluatePeriod (nhận cả trụ Lưu Niên lẫn trụ Đại Vận), verificationQuestions, resolveWithFeedback: giữ NGUYÊN thuật toán và hệ số của v0.2, chỉ đổi kiểu dữ liệu và tên hành.
- Engine trả mã (method, grade, strength, check id, tham số số liệu) thay cho câu văn. Các câu trong engine.ts/follow.ts hiện là chuỗi tiếng Việt: đổi thành { code, params } để src/content dựng câu ở 3C.3.
- Không dùng new Date() trong core: năm hiện tại là tham số.
- Xuất qua src/core/index.ts.
- Chuyển docs/ngu-hanh-engine/compare-dung-than.ts thành scripts/compare-dung-than.ts, trỏ vào engine đã port. Chạy lại phải ra đúng các con số trong docs/NGU-HANH-SO-SANH.md (seed cố định). Lệch thì dừng lại báo cáo, không sửa số.
Unit test (vitest):
(a) 5 lá số trong docs/ngu-hanh-engine/demo.ts ra đúng: Chân Tòng Sát; Giả tòng 65/35; Không thành; Chân Khúc Trực; lá thường.
(b) resolveWithFeedback: 4/4 năm khớp thì kết luận; 2/3 thì "chưa phân định"; dưới 3 năm thì "chưa đủ dữ liệu".
(c) Bất biến ở ARCHITECTURE 14.9 chạy trên 500 lá số sinh từ batTuChart.
(d) Snapshot riêng tests/nguhanh-snapshot.test.ts cho 500 lá số.
npm test phải xanh, tests/core-snapshot.test.ts KHÔNG đổi, npm run build OK. Báo cáo số test trước/sau.
```

### 3C.3 · 🔵 Tầm trung — module nội dung mới và dựng câu từ mã của engine, cần test để không sót mã nào

```
Theo ARCHITECTURE mục 14 (điểm 4, 7, 8):
- Phần đã chốt dùng lại legacy (FAMILY, HANH_INFO…): import từ src/content/interp, KHÔNG chép lại hay sửa câu.
- Phần mới: viết docs/NGU-HANH.md làm NGUỒN câu chữ. Lấy từ ELEMENT_PRACTICAL, TEN_GOD_PRACTICAL, FAVOR_VI, FAVOR_HINT và các câu lý do trong docs/ngu-hanh-engine/src, bỏ những ý đã có trong bảng legacy. Áp dụng quy tắc đổi nhãn mềm và danh sách cấm ở điểm 8. Giọng "bài học nhỏ" như các công cụ khác.
- src/content/nguhanh/: hàm thuần nhận kết quả engine và trả câu, gồm reasons(), followChecks(), patternSummary(), practicalReport(), timingLabel(), verificationPrompt(). Đánh dấu noSpeech cho đoạn thuộc danh sách cấm đọc.
- Ghi chú ở đầu thư mục: đây là nội dung mới, không chép legacy, không thuộc tests/parity (giống src/content/palm).
Unit test:
(a) mọi mã engine có thể trả về (method, grade, strength, check id, favor) đều có câu tương ứng, không có chuỗi rỗng hay "undefined";
(b) không câu nào chứa từ trong danh sách cấm của ARCHITECTURE 12.8 và 14.8;
(c) lời nhắc văn hoá có ở đầu và cuối practicalReport;
(d) 24 lá số golden dựng câu không lỗi.
```

### 3C.4 · 🔵 Tầm trung — giao diện nhiều component trên màn Bát Tự, kiểm bằng mắt ở 360px

```
Theo ARCHITECTURE mục 14 (điểm 1, 2, 3, 7), sửa src/features/battu:
- Mục "Phân tích ngũ hành", đặt theo phương án đã chốt ở 14.1:
  - thanh 5 hành theo tỷ lệ, gắn nhãn dụng/hỷ/kỵ/cừu và vai trò Thập thần;
  - "Vì sao ra kết quả này" thu gọn được;
  - bảng 4 điều kiện Tòng cách (chỉ khi có dấu hiệu) với trạng thái Đạt / Một phần / Không đạt;
  - cách luận thay thế theo quy tắc 14.7;
  - chiến lược theo Thập thần, thói quen, công việc, môi trường, hành cần tiết chế;
  - Đại Vận hiện tại và 5 năm tới, mỗi năm có gợi ý nên làm gì.
- Nối các nơi dùng Dụng thần theo bảng 14.2. Nơi nào đổi nguồn thì đổi đúng như bảng, không đổi thêm.
- Thẻ chia sẻ ảnh (src/features/share): thêm tóm tắt ngũ hành theo 14.2, vẫn có dòng lưu ý văn hoá.
- Pillars nhận thêm focus.hidden?: number[] để tô tàng can khi thầy giải thích gốc (dùng ở 3C.6).
- 360px không cuộn ngang, sáng/tối, vùng chạm ≥ 44px, aria cho thanh biểu đồ (đọc được "Thuỷ 78 phần trăm, dụng thần").
Cập nhật BatTuScreen.test.tsx. Chạy npm test, npm run build, xem ở 360×740 với 3 lá số: Chân tòng, Giả tòng, lá thường (lấy từ fixture golden).
```

### 3C.5 · 🔵 Tầm trung — lược đồ dữ liệu v4 + luồng kiểm chứng, chạm state, migration, sao lưu; sai migration là mất dữ liệu người dùng

```
Theo ARCHITECTURE mục 14 (điểm 5, 6):
- src/state: lyso.state v3 → v4, thêm nguHanhAnswers theo hồ sơ ({ profileId, year | daiVanIndex, outcome, answeredAt }). Viết migration 3→4 trong migrations.ts, dùng chung upgradeDoc khi khởi động và khi khôi phục sao lưu. Kiểm tra lược đồ trong schema.ts. Xoá cùng hồ sơ và "Xoá toàn bộ dữ liệu". Có trong file sao lưu.
- Thẻ "Kiểm chứng bằng các năm đã qua" ở màn Bát Tự:
  - chỉ hiện khi có cách luận thay thế;
  - câu hỏi Đại Vận trước, Lưu Niên sau;
  - 4 nút: Thuận lợi / Bình thường / Khó khăn / Không nhớ;
  - mỗi lần trả lời thì gọi resolveWithFeedback, cập nhật trọng số và kết luận ngay;
  - có nút "Làm lại" và "Xoá câu trả lời".
- Sửa ngày giờ sinh của hồ sơ thì xử lý câu trả lời cũ theo 14.6.
Unit test:
(a) migration 3→4 giữ nguyên palmSessions và mọi dữ liệu cũ;
(b) sao lưu → khôi phục giữ câu trả lời;
(c) xoá hồ sơ thì xoá câu trả lời của hồ sơ đó;
(d) "Không nhớ" không đổi trọng số;
(e) đã kết luận thì không hỏi thêm.
Cập nhật CLAUDE.md dòng "Lược đồ lyso.state hiện là v3" thành v4.
```

### 3C.6 · 🔵 Tầm trung — kịch bản Thầy đọc và hội thoại hỏi đáp trong Tĩnh thất, logic cần test kỹ

```
Theo ARCHITECTURE mục 12.7–12.8 và 14 (điểm 6, 8), mở rộng src/features/reader:
- buildScript cho "nguhanh". Lấy 3–5 lý do quan trọng nhất của engine (nguyệt lệnh, hợp cục, phương pháp chọn dụng thần, kết quả Tòng cách) thành cue có lời dẫn. Cue có focus (pillar, hidden) để Pillars tô trụ và tàng can. Lời khuyên chỉ đọc phần chiến lược, phần còn lại để chữ.
- Khi có cách luận thay thế và chưa kết luận: thầy hỏi lần lượt các năm/giai đoạn kiểm chứng, theo mẫu hội thoại của Intake.tsx. Có 4 nút trả lời trong khung phụ đề. Câu trả lời lưu vào state như 3C.5. Thầy nói kết luận, hoặc nói "chưa đủ để chắc" khi chưa phân định.
- Đồ vật trên án thư: dùng bốn thẻ tre (Bát Tự) có sẵn, thêm lựa chọn "Ngũ hành" sau khi đọc xong Bát Tự. Không thêm đồ vật mới trừ khi 14.6 đã quyết.
Unit test thêm vào tests/reader-script.test.ts:
(a) không cue nào > 180 ký tự;
(b) không cue TTS nào chứa từ cấm;
(c) câu mở và câu kết có lời nhắc văn hoá;
(d) chỉ có cue hỏi kiểm chứng khi có cách luận thay thế và chưa kết luận;
(e) focus.hidden chỉ trỏ tới tàng can có thật của trụ đó.
```

### 3C.7 · 🟢 Nhanh/rẻ — viết lời dẫn theo quy tắc đã chốt, không đổi logic; chủ dự án đọc duyệt bằng tay

```
Theo persona, xưng hô và danh sách cấm trong ARCHITECTURE mục 12 và 14.8, mở rộng src/content/reader/templates.ts cho phần ngũ hành:
- 3 câu mở, 3 câu kết;
- lời dẫn cho từng loại lý do (đắc lệnh, thất lệnh, tam hợp, lục xung, Phù ức, Điều hậu, Thông quan, Chân tòng, Giả tòng, Không thành), mỗi loại ít nhất 2 biến thể;
- lời hỏi kiểm chứng cho Đại Vận và Lưu Niên;
- lời khi kết luận và khi chưa phân định.
Dùng biến {ta}, {xungHo} như các mẫu hiện có. Giọng mộc, từ tốn, không hù doạ, không hứa hẹn.
Thêm các câu mới vào docs/LOI-THAY.md mục "Ngũ hành" để chủ dự án duyệt. Chạy lại test 3C.6, phải xanh.
```

### 3C.8 · 🔵 Tầm trung — nối Dụng thần sang Bát Trạch và La Bàn, chạm 2 màn hình khác. Chỉ chạy nếu 14.3 chọn hiện nhiều nguồn

```
Theo ARCHITECTURE mục 14.3:
- Bát Trạch: phần màu sắc ngũ hành hiện thêm dòng theo Dụng thần, ghi rõ nguồn ("theo Mệnh Quái" / "theo Dụng thần Bát Tự") và câu giải thích đã chốt.
- La Bàn: tuỳ chọn tô thêm hướng hợp Dụng thần (Mộc Đông, Hoả Nam, Thổ trung tâm/Tây Nam–Đông Bắc, Kim Tây, Thuỷ Bắc), tắt mặc định. Màu khác màu Du Niên, có chú giải.
- Không đổi công thức Mệnh Quái hay Du Niên. tests/parity cho Bát Trạch, La Bàn phải xanh nguyên.
Cập nhật PhongThuyScreen.test.tsx. Xem ở 360px.
```

---

## Móc nối vào các phase sau

### 3C.9 · 🟢 Nhanh/rẻ — chạy TRƯỚC 8.1 và 9.1 khi mở lại phát hành: cập nhật tài liệu, không đụng code

```
- docs/RELEASE.md mục Data safety: thêm câu trả lời kiểm chứng (lưu trên máy, trong file sao lưu, không gửi đi). Rà lại để chắc không có request mạng mới.
- docs/QA-CHECKLIST.md (tạo nếu chưa có), thêm:
  - 3 lá số golden (Chân, Giả, thường) xem đủ mục;
  - trả lời kiểm chứng rồi tắt app, mở lại vẫn còn;
  - sao lưu, khôi phục;
  - thầy hỏi kiểm chứng khi đang đọc thì app vào nền;
  - 360px ở chế độ chữ lớn.
- docs/STORE-LISTING.md (khi viết ở 8.3): có thể nêu "phân tích ngũ hành định lượng, giải thích vì sao". Không dùng từ "chính xác", "dự đoán đúng".
```

---

## Ghi chú cho chủ dự án

- **Không xoá `docs/ngu-hanh-engine/` sau khi port.** Đây là bản tham chiếu để đối chiếu khi nghi lệch, giống `docs/legacy/`.
- Muốn đổi hệ số hoặc ngưỡng sau này: sửa preset trong `src/core/nguhanh/config.ts`, chạy `scripts/compare-dung-than.ts` và test golden, rồi mới cập nhật snapshot ngũ hành. Ghi lý do trong commit.
- Bộ golden càng có nhiều đáp án của người luận thì 3C.1 và các lần hiệu chỉnh sau càng chắc. Có thể bổ sung dần vào `tests/fixtures/nguhanh-golden.json`.
