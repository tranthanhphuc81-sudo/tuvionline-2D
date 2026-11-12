# Tiến độ theo PROMPT-KIT

> Cập nhật sau mỗi bước. Phiên Claude Code mới: đọc `CLAUDE.md`, `docs/ARCHITECTURE.md`, rồi file này để làm tiếp.
> Làm việc và push thẳng lên nhánh `main` (chủ dự án làm một mình, đã đồng ý).

| Phase | Trạng thái |
|---|---|
| 0 — Kiểm tra môi trường | `npm test` 23/23 xanh, `npm run build` OK. APK debug đã build được ngày 04/11/2026 từ commit `617bc1e` trên máy Windows (đặt `ANDROID_HOME`). Mới thử trên máy ảo, chưa thử trên máy thật. |
| 1.1 — Kiến trúc | XONG → `docs/ARCHITECTURE.md` |
| 1.2 — Engine TypeScript | XONG — `npm test` 30 → 92 test xanh, `npm run build` OK |
| 2.1 — Khung app | XONG — 121 test xanh, build OK; Back và lưu dữ liệu đã kiểm trên máy ảo, chưa kiểm trên máy thật |
| 3.1 — Bố cục lá số Tử Vi | XONG — chọn phương án C (lưới gọn + thẻ chi tiết), xem ARCHITECTURE mục 10 |
| 3.2 — Tử Vi | XONG — 191 test xanh, build OK |
| 3.3 — Bát Tự | XONG — 257 test xanh, build OK |
| 3.4 — Lục Hào | XONG — 302 test xanh, build OK |
| 3.5 — Bát Trạch, Nạp Âm | XONG — 380 test xanh, build OK |
| 3.5b — Tổng Hợp đầy đủ | XONG — 386 test xanh, build OK |
| 4.1 — Chọn cách đọc cảm biến | XONG — plugin nội bộ đọc `TYPE_ROTATION_VECTOR`, xem ARCHITECTURE mục 11; chưa đo trên máy thật |
| 4.2 — Dựng la bàn | XONG phần code — 418 test xanh, build OK, APK chạy trên máy ảo. CHƯA ĐẠT điều kiện nghiệm thu: còn 9 phép thử trên máy thật (ARCHITECTURE mục 11) |
| 5.1 — Đọc thành lời | XONG phần code — 447 test xanh, build OK. CHƯA nghe được tiếng thật: cần thử trên máy thật đã tải gói tiếng Việt |
| 6.1 — Quyết định Đạo quán & Thầy đọc | XONG — ARCHITECTURE mục 12, chủ dự án đã duyệt các điểm cuối 12.11 |
| 6.2 — Engine cảnh | XONG phần code — 467 test xanh, build OK, chạy trên máy ảo. CHƯA đo được 60 fps: cần máy thật |
| 6.3 — Biến thể lịch và âm thanh | XONG phần code — chưa nghe tiếng thật; tiếng hiện là tổng hợp giữ chỗ |
| 6.4 — Tĩnh thất | XONG phần code — 502 test xanh, build OK, xem ở 360×740. Chưa thử trên máy thật |
| 6.5 — Thầy đọc | XONG phần code — 520 test xanh, build OK. Chưa nghe trên máy thật |
| 6.6 — Nhân vật, nghi thức | XONG phần code — CHƯA ĐẠT nghiệm thu: chủ dự án đồng ý đo fps trên máy tầm thấp sau; chưa thử lắc máy trên máy thật |
| 6.7 — Lời thầy, đạo đồng | XONG bản nháp — chờ chủ dự án đọc duyệt `docs/LOI-THAY.md` |
| 6.8 — Đặt hàng tranh, nhân vật, âm thanh | XONG tài liệu → `docs/ART-BRIEF.md`; chưa đặt hàng |
| 7.1 — Lưu và chia sẻ | XONG phần code — 599 test xanh, build OK, thử trên trình duyệt 360px. CHƯA thử trên máy thật, cần cài APK mới vì thêm plugin |
| 8.1 — Kế hoạch phát hành | XONG tài liệu → `docs/RELEASE.md`. TẠM HOÃN phát hành từ 06/11/2026 vì chủ dự án còn chỉnh và thêm tính năng; 5 điểm đầu tài liệu chưa chốt |
| 8.2, 8.3 | TẠM HOÃN cùng việc phát hành |
| 9 | ĐANG LÀM phần không cần máy (12/11/2026): `docs/QA-CHECKLIST.md` có đủ mục kiểm tay cho cả app (khởi động offline, Back, giao diện, đọc thành lời, chia sẻ, sao lưu), Tử Vi, Bát Tự cũ, Lục Hào, Bát Trạch, La Bàn (9 phép thử mục 11), Nạp Âm, Tĩnh thất và lối vào, bộ nhớ. Đã đo dung lượng: font 174 KB (ước 300 KB), `dist/` 24,5 MB, phần lớn là `palm/` 22,7 MB (ARCHITECTURE mục 4). CHƯA LÀM: chạy danh sách trên máy thật (cần chủ dự án), Playwright chụp màn hình tự soát (mục 7.2, chưa quyết có làm không). Rà trên trình duyệt (12/11/2026, 360×740, sáng/tối, cỡ chữ 130%; mọi tab, Cài đặt, Hồ sơ, Xem chỉ tay): sửa (1) màn con có nút quay lại tràn ngang 4px vì cột lưới của khung app giãn theo tiêu đề + chip hồ sơ (`grid-template-columns: minmax(0, 1fr)`, chip được co); (2) nút phân đoạn cao 36px nay nhận chạm cả phần đệm (≥ 44px) bằng `::before`; (3) ô chọn giọng đọc ở Cài đặt nằm trong nhãn cao 44px |
| Xem chỉ tay | 3B.1 XONG tài liệu → ARCHITECTURE mục 13.1. Đã chốt: không lưu ảnh tay, mở từ Tĩnh thất và Tổng hợp, bản đầu hoãn vân tay, móng, dấu đặc biệt. 3B.2 XONG: `src/core/palm` (đo từ nét và khớp tay, luận giải, tổng kết theo chủ đề, so sánh hai tay), `src/content/palm` (dữ liệu, 33 câu hỏi, ghép câu chữ); 599 → 621 test xanh, build OK. 3B.3 XONG PHẦN CODE (10/11/2026): lược đồ `lyso.state` lên v3 (`palmSessions`, migration 2→3, xoá cùng hồ sơ, vào file sao lưu), mô hình và WASM đóng gói offline (`public/palm/`, WASM chép từ node_modules bởi `scripts/copy-palm-assets.mjs`), `src/features/palm/` (nhìn ảnh, chạm 4 đường, xác nhận số đo, câu hỏi, kết quả, `PalmDiagram`), route `palm`/`palm.result`, đồ vật đèn dầu ở Tĩnh thất và ô Chỉ tay ở Tổng hợp, chỗ đứt → Q18/Q22/Q26 điền sẵn. CHƯA THỬ trên APK: nạp WASM trong WebView, nút chụp có cần quyền CAMERA không, tốc độ. Bổ sung 10/11/2026: sơ đồ kiểu sách cổ trên tranh bàn tay của chủ dự án; kết quả vẽ lên ảnh thật ngay sau khi xem (không lưu); máy tự trả lời thêm Q08 (ngón cái), Q18 (nét Sinh đạo rõ/mờ), Q22 (uốn lượn), Q24 (Tâm đạo thẳng), Q26 (Định mạng thẳng dài/lên gò Thổ/hơi cong), Q32 (số chỉ nhỏ), gom vào bảng "Máy đo được" có nút Sửa, không hỏi lại. Ngưỡng mới chỉ thử trên 1 ảnh mẫu. Lịch sử: giữ tối đa 12 lần mỗi tay mỗi hồ sơ (`PALM_HISTORY_MAX`), kết quả có phần "So với lần xem ngày …" (`diffHands`) và danh sách xem lại lần cũ (route `palm.result` có `id`). Sơ đồ co giãn tranh theo tỉ lệ tay thật (`handWarp`: ngón dài/ngắn, lòng bàn tay rộng/hẹp, có giới hạn). Không tự nhận được: Q02, Q03, Q05–Q07, Q13, Q14, Q30. Thầy đọc, tranh minh hoạ, câu chữ cuối là 3B.4 trở đi. 3B.6 XONG (12/11/2026; phần đọc kết quả chỉ tay đã có từ trước, bổ sung): `Cue.focus.palm` ({ zones, lines, marks }) cho mọi câu luận có đường chính, gò hay dấu; `PalmDiagram` nhận `zones` (gò sáng lên, các gò khác mờ; marks chưa có trên sơ đồ nên chưa tô); câu mở có lời nhắc "đường chỉ đổi theo cách mình sống"; test (a)–(e) của 3B.6 ở `tests/reader-script.test.ts`. 3B.8 XONG (12/11/2026): `TOOL_LINES.chitay` có 3 câu mở và 3 câu kết, đều có lời nhắc văn hoá và nhắc "đường chỉ đổi theo cách mình sống, xem lại sau sáu tháng đến một năm"; lời dẫn riêng cho từng mục (`LEADS.chitayTongQuan`, `chitayNgon`, `chitayBaDuong`, `chitayDuong`, `chitayDuongPhu`, `chitayGoDau`, mỗi loại 2 biến thể) thay cho việc đọc trơ tiêu đề; test 6.5 và 3B.6 chạy lại xanh. LOI-THAY.md chưa cập nhật phần chỉ tay: chủ dự án đọc duyệt các mẫu câu này (xem `src/content/reader/templates.ts`). Bản thử 09/11/2026: 39–68 giây một bàn tay trên S25 Ultra 3B.9 XONG (12/11/2026): rà code chỉ tay (không yêu cầu mạng, ảnh tay chỉ giữ trong bộ nhớ, không lưu), bổ sung Data safety ở docs/RELEASE.md, mục Xem chỉ tay trong docs/QA-CHECKLIST.md, câu mô tả Play gợi ý. 3B.7 đã có (đồ vật chitay ở Tĩnh thất, ART-BRIEF 6b). |
| Người đọc | XONG PHẦN CODE (10/11/2026): 10 nhân vật vẽ bằng code (`scripts/characters-personas.mjs`, danh sách ở `src/content/reader/personas.ts`), 8 màu áo đổi lúc chạy, hoặc ảnh của người dùng (lưu riêng khoá `lyso.reader.photo`, không vào sao lưu, xoá cùng "Xoá toàn bộ dữ liệu"). Lời đọc tự xưng theo nhân vật qua biến `{ta}`; cao độ giọng theo nhân vật; Cài đặt có nghe thử từng giọng của máy. Chưa thử giọng trên APK |
| Tranh hành trình | XONG bản tự vẽ — 26 SVG sơn mài, thuỷ mặc ở `src/assets/journey/art/`, sinh bằng `node scripts/build-journey-art.mjs`. Nhẹ, không dùng blur. Vẫn thay được bằng tranh hoạ sĩ. Chưa đo fps trên máy thật |
| Phân tích ngũ hành (Phase 3C) | 3C.1 XONG tài liệu (11/11/2026) → ARCHITECTURE mục 14. Chưa có đáp án người luận nên chọn phương án (B), đảo ngược được: giữ nguyên văn legacy, thêm mục "Phân tích ngũ hành" riêng trên màn Bát Tự kèm dòng đối chiếu 4 mức (trùng / gần / khác / ngược) và lý do theo nguyên nhân. Engine KHÔNG vào Tổng hợp, ảnh chia sẻ, kịch bản Bát Tự hiện có; 3C.8 không chạy. Điều kiện chuyển sang (C) ghi ở 14.1. Rà soát sau 3C.7 (12/11/2026): thêm kiểm tra độ nhạy theo hai preset (14.11; 78,7% lá số ổn định, 21,3% chưa vững, hiện ghi chú và Thầy nói thêm một câu), lời kiểm chứng đổi thành "khớp hơn với" kèm giới hạn (14.6), ghi rõ đáp án người luận là quy ước (14.1); mô hình 5 nút chưa làm (chỉ để minh hoạ). Số đo thêm: trong 1216 lá đảo chiều, 41,4% do vượng/nhược ngược, 32,9% do engine xếp trung hoà, 13,1% Điều hậu, 8,2% Tòng cách. Kit ở `docs/PROMPT-KIT-NGU-HANH.md`; engine tham chiếu `docs/ngu-hanh-engine/`; bảng so sánh `docs/NGU-HANH-SO-SANH.md`. 3C.2 XONG (12/11/2026): `src/core/nguhanh` (port v0.2: tính điểm, vượng/nhược, Tòng cách 4 điều kiện, nhiều cách luận, `evaluatePeriod`, `verificationQuestions` và `resolveWithFeedback` cho cả năm lẫn Đại Vận, `compareWithLegacy`, `toNguHanhChart`), dùng lại bảng của app, trả mã `Msg` thay câu văn, xuất qua `NguHanh` ở `src/core/index.ts`. Chứng minh giữ nguyên thuật toán: 500 lá số trùng bản tham chiếu từng số; 3000 lá ra đúng 36,1% / 61,2% / 40,5% và bảng nguyên nhân. `scripts/compare-dung-than.ts` (`npm run compare:dungthan`, thêm `tsx` 4.23.15): mục 1 của bảng so sánh không đổi, chỉ đổi chính tả "hòa→hoà" ở mục 3 và dòng lệnh mục 4. 693 → 716 test xanh, build OK, `core-snapshot` không đổi. Đã đổi so với kit: `nguoc` xét trước `trung` (ARCHITECTURE 14.1). 3C.3 XONG PHẦN CODE (12/11/2026): `src/content/nguhanh` (`msgText` cho mọi mã của engine, `reasons`, `followChecks`, `patternSummary`, `practicalReport`, `timingLabel`, `verificationPrompt`, `legacyComparisonText`, `resolutionText`; nội dung mới, không thuộc parity, dùng lại `FAMILY` của legacy), hai danh sách từ cấm (i) KHÔNG HIỆN `BANNED_TERMS` và (ii) KHÔNG ĐỌC (`NO_SPEECH_TERMS` + thẻ `no-speech` ở khối bảng, phần trăm, vết tính), `tests/fixtures/nguhanh-golden.json` (24 lá số, cột đáp án để trống). `docs/NGU-HANH.md` do `npm run doc:nguhanh` sinh từ code (kèm câu ví dụ cho mọi mã) để duyệt; script so sánh dùng nhãn của `src/content/nguhanh`, bảng so sánh không đổi. 716 → 725 test xanh, build OK. CHỦ DỰ ÁN CẦN ĐỌC DUYỆT `docs/NGU-HANH.md` (mục 10 liệt kê điều cần xem) trước khi làm 3C.4. 3C.4 XONG PHẦN CODE (12/11/2026): `src/features/battu/NguHanhSection.tsx` nối vào màn Bát Tự sau hai hộp Vượng Suy và Dụng Thần sơ bộ, trước dải Đại Vận: thanh 5 hành kèm vai trò Thập Thần và nhãn dụng/hỷ/kỵ/cừu (nhãn truy cập đọc "…, N phần trăm"), "Vì sao ra kết quả này" thu gọn, bảng 4 điều kiện Tòng cách (rõ khi Chân hoặc Giả, trong phần thu gọn khi Không thành), Chân có nút "Xem cách luận khác", Giả có hai lựa chọn ngang hàng, chiến lược theo Thập Thần, việc nên làm, Đại Vận hiện tại và 5 năm tới. Tổng hợp có nút sang tab Bát Tự; KHÔNG đổi ảnh chia sẻ, dải Đại Vận, thẻ Tra Lưu Niên (14.2). `Pillars` nhận thêm `focus.hidden` (dùng ở 3C.6). Đã xem ở 360px (332px thực đo), sáng và tối với lá Giả, Chân (qua test), đảo chiều: không cuộn ngang, vùng chạm ≥ 44px. 725 → 731 test xanh, build OK. CHƯA CÓ: thẻ kiểm chứng bằng các năm đã qua (3C.5, cần lược đồ v4). 3C.5 XONG PHẦN CODE (12/11/2026): lược đồ `lyso.state` lên v4 (`nguHanhAnswers`: hồ sơ, `birthKey`, mốc năm hoặc Đại Vận, kết quả gồm "không nhớ", giờ trả lời), migration 3→4 giữ nguyên `palmSessions` và mọi dữ liệu cũ (dùng chung `upgradeDoc` khi khởi động và khôi phục sao lưu), kiểm tra lược đồ, có trong file sao lưu, xoá cùng hồ sơ và "Xoá toàn bộ dữ liệu"; sửa ngày giờ sinh hay giới tính thì xoá câu trả lời cũ (màn sửa hồ sơ có dòng báo trước). Thẻ "Kiểm chứng bằng các năm đã qua" ở màn Bát Tự (chỉ khi có cách luận thay thế; 4 nút Thuận lợi / Bình thường / Khó khăn / Không nhớ; mỗi câu gọi `resolveWithFeedback` và cập nhật kết luận ngay; "Không nhớ" lưu để khỏi hỏi lại nhưng không đổi trọng số; đã kết luận thì không hỏi thêm; nút Làm lại). Đã thử trên trình duyệt: dữ liệu v3 tự lên v4 và lưu lại. 731 → 746 test xanh, build OK. Giới hạn đã biết: với lá số chỉ có 3 câu hỏi mà người dùng chọn "Không nhớ" cho một câu thì không đủ 3 câu để kết luận (ngưỡng ≥ 3 câu giữ nguyên v0.2). 3C.6 XONG PHẦN CODE (12/11/2026): Thầy đọc phần ngũ hành (`buildScript('nguhanh')`, `src/features/reader/nguhanhScript.ts`): 3–5 lý do có lời dẫn (nguyệt lệnh tô trụ tháng và tàng can qua `focus.hidden`, hợp cục, phương pháp chọn Dụng thần, Tòng cách, hai cách luận), chiến lược; không đọc bảng, phần trăm, vết tính, danh sách thói quen; câu mở và kết có lời nhắc văn hoá. Khi có cách luận thay thế mà chưa kết luận, Thầy hỏi giai đoạn kế tiếp chưa trả lời (cùng bộ lưu của thẻ kiểm chứng, 3C.5), nói kết luận hoặc "chưa đủ dữ liệu". Nút "Nghe phần ngũ hành" nằm trong mục ngũ hành của màn Bát Tự; `Pillars` tô tàng can theo `focus.hidden`. Tĩnh thất có thêm nút "Nghe phần ngũ hành" (`src/features/study/NguHanhTalk.tsx`): Thầy đọc xong, nếu lá số có hai cách luận mà chưa phân định thì chuyển sang hỏi đáp theo mẫu Intake (Thầy hỏi giai đoạn kế tiếp, 4 nút Thuận lợi / Bình thường / Khó khăn / Không nhớ ngay trong khung phụ đề, nút "Để Thầy hỏi sau"), lưu cùng bộ câu trả lời với thẻ kiểm chứng ở màn Bát Tự (hook dùng chung `useNguHanh`), Thầy cảm ơn từng câu rồi nói kết luận hoặc "chưa đủ để chắc". Lời dẫn ngũ hành đã viết kỹ ở 3C.7 (xem dưới). 753 → 766 test xanh, build OK, chưa thử giọng và luồng hỏi đáp trên APK (chỉ có test). 3C.9 XONG (12/11/2026, chỉ tài liệu và một dòng câu chữ): `docs/RELEASE.md` mục 3 ghi câu trả lời kiểm chứng ngũ hành (lưu trên máy, có trong file sao lưu, xoá theo hồ sơ, không đổi câu trả lời Data safety) và kết quả rà lại mạng sau Phase 3C (không có lệnh gọi mạng, SDK hay quyền mới); mục 4 ghi cách nói được phép và cấm khi viết mô tả ngũ hành trên Play. `docs/QA-CHECKLIST.md` (mới): 3 hồ sơ golden xem đủ mục, trả lời kiểm chứng rồi tắt app, sao lưu và khôi phục v3 → v4, Thầy hỏi giữa chừng thì app vào nền, 360px chữ lớn, máy bay. Thêm một ý vào `PRIVACY_POINTS` trong app. Chưa có `STORE-LISTING.md` (viết ở 8.3). 3C.7 XONG (12/11/2026): lời dẫn Thầy cho ngũ hành chọn theo lá số, mỗi loại ≥ 2 biến thể (đắc lệnh, thất lệnh, tam hợp, bán hợp, lục hợp, lục xung, Phù ức, Điều hậu, trung hoà, thuận thế, Thông quan, Chân, Giả, Không thành, hai cách luận), lời hỏi riêng cho Đại Vận và cho một năm, lời khi đã phân định, chưa chắc, chưa đủ dữ liệu; `docs/LOI-THAY.md` có mục "Ngũ hành" (mới) và mục "Chỉ tay" (cập nhật theo 3B.8) để chủ dự án duyệt. Còn lại của Phase 3C: 3C.8 không chạy (ARCHITECTURE 14.3); việc tay của chủ dự án: đọc duyệt `docs/NGU-HANH.md`. (12/11/2026: không nhờ được người luận, nên bộ lá số mẫu trong sách thay cho đáp án người luận và 24 lá ngẫu nhiên không còn phải điền; giữ phương án (B) lâu dài, ARCHITECTURE 14.1.) Đối chiếu với sách (12/11/2026): 50 lá ví dụ nói rõ dụng thần trong *Tử Bình Chân Thuyên* và *Trích Thiên Tủy* (`docs/sach/`, không commit) → `tests/fixtures/nguhanh-sach.json`, `docs/NGU-HANH-SACH.md` (`npm run compare:sach`), `tests/nguhanh-sach.test.ts` (kiểm tứ trụ theo Ngũ Hổ Độn, Ngũ Thử Độn; ghi lại mức khớp). Engine trùng dụng thần sách 18/50, khớp theo 14.1 điều 2 là 24/50 (48%) → rơi vào điều 5 (hiệu chỉnh engine). 784 → 787 test xanh. Hiệu chỉnh (12/11/2026, ARCHITECTURE 14.12): dò lưới 7 tham số với tập chỉnh 34 lá và tập thử 16 lá; chỉ giữ `follow.weakRootMax` 0,8 → 1,0 (khớp 25/50, trùng 20, ngược 9; tập thử không đổi; 1,5% lá ngẫu nhiên đổi Dụng thần). `REFERENCE_CONFIG` giữ v0.2 cho test port; bản chụp `nguhanh-snapshot.json` sinh lại có chủ ý (13/500 lá đổi cấp Tòng, 9 đổi Dụng thần, còn lại chỉ đổi số ngưỡng trong câu lý do). Các lệch còn lại cần đổi thuật toán (Hoá khí, cách chọn dụng khi thân vượng, trung hoà), chờ người luận. 788 test xanh. Kiểm tra độc lập (12/11/2026, ARCHITECTURE 14.13): thêm 41 lá *Trích Thiên Tủy* chưa dùng khi hiệu chỉnh (đợt 2, tổng 91 lá); đợt 2 khớp 19/41 (46%), trùng 7/41, hiệu chỉnh không đổi lá nào. Nhánh yếu nhất ở cả hai đợt: Trung hoà (trùng 2/13) và Điều hậu được ưu tiên (trùng 1/13); thêm kiểu "Thương quan dụng kiếp". Thử sửa quy tắc (12/11/2026, ARCHITECTURE 14.14): thêm cờ `rules` (mặc định tắt = v0.2), đo trên 91 lá, chốt hai phương án trước, rồi lấy đợt 3 (30 lá phụ lục Tử Bình Chân Thuyên, bỏ 2 lá in sai); cả hai phương án làm số lá ngược ở đợt 3 tăng 4 → 6 nên không giữ, engine không đổi. Cả 121 lá: khớp 55 (45%), bằng v0.2. Không có người luận nên chốt giữ (B) lâu dài (14.1). Câu "Tóm lại" và lời Thầy cho cách luận thuận thế đổi từ "Hành cần bổ sung" sang "Hành nên thuận theo … nên tránh …" (Dụng thần của lá Tòng thường là hành đang mạnh nhất) |

## Phase 7.1 — Lưu và chia sẻ — XONG PHẦN CODE, CHƯA THỬ MÁY THẬT

### Đã xong
- **Chia sẻ ảnh:** nút "Chia sẻ ảnh" ở Tử Vi, Bát Tự, Lục Hào, Bát Trạch, La Bàn, Nạp Âm, Tổng hợp. `src/features/share/`: `card.ts` tính bố cục (test được), `render.ts` vẽ Canvas 2D, thẻ rộng 1080px, nền tối cố định, luôn có dòng lưu ý văn hoá. Không dùng `html-to-image` (ARCHITECTURE mục 6). Sau góp ý của chủ dự án, thẻ in đủ Tổng kết nguyên văn (`cardReading`) và tự chia nhiều ảnh (`layoutPages`): mỗi ảnh cao tối đa 2.400px, ngắt ở ranh giới đoạn, tiêu đề mục đi cùng nội dung, có số "Ảnh 1/3", tên người và dòng lưu ý văn hoá trên mọi ảnh. Bảng chia sẻ gửi cả bộ ảnh cùng lúc. La Bàn và Lục Hào không in hồ sơ; các thẻ theo hồ sơ có tên và ngày sinh.
- **`src/platform/share.ts`:** Android ghi `Cache/share` rồi mở bảng chia sẻ; trình duyệt dùng Web Share hoặc tải file.
- **Sao lưu, khôi phục:** `src/state/backup.ts`, `src/features/settings/DataSection.tsx`. File là đúng tài liệu `lyso.state`, gửi qua bảng chia sẻ. Khôi phục chạy migration (`upgradeDoc`, dùng chung với lúc khởi động), kiểm ngày có thật, hỏi lại rồi thay toàn bộ.
- **Xoá toàn bộ:** đưa về `emptyState`, xoá `lyso.state.corrupt-*`, dữ liệu bản 0.1 trong localStorage và `Cache/share`.
- `resetScreens` trong `context.tsx` dựng lại mọi màn hình sau khôi phục hoặc xoá, để không còn ô nhập của dữ liệu cũ.
- **Cài đặt:** thêm mục "Dữ liệu của bạn", phần giới thiệu, chính sách quyền riêng tư (`src/content/common/about.ts`).
- Thử trên trình duyệt: cả 7 công cụ tạo được PNG; sao lưu, khôi phục, xoá toàn bộ chạy đúng; 360px không cuộn ngang; không lỗi console.

### Chưa kiểm
- Bảng chia sẻ thật, gửi qua Zalo và Messenger, chọn file khôi phục bằng trình chọn file của Android. Java của 2 plugin mới chưa biên dịch trên máy này: chờ GitHub Actions.
- APK thử cũ mở giao diện mới sẽ báo lỗi ở nút chia sẻ, sao lưu cho tới khi cài APK mới.

### Đã quyết ở Phase 8.1, làm ở 8.2 (`docs/RELEASE.md`)
- Đổi `android:allowBackup` thành `false`.
- Thêm email liên hệ vào chính sách quyền riêng tư và đăng bản công khai trên Cloudflare.

## APK thử tự cập nhật

APK từ GitHub Actions đặt `LYSO_LIVE_URL` (`capacitor.config.ts`) nên tải giao diện từ Cloudflare, plugin native vẫn chạy. Mất mạng thì dùng file đóng gói qua `errorPath`, chưa thử trên máy. `scripts/gradle.mjs` chặn `bundleRelease` khi có biến này.

## Phase 6.6 — Nhân vật và nghi thức — XONG PHẦN CODE, CHƯA ĐO

### Đã xong
- Lottie: `lottie-web` 5.13, gói `lottie_light`, tải riêng khi cần. `src/features/reader/Character.tsx` chọn trạng thái theo marker `idle, talk, point, turnPage, nod`, nên thay file không đổi code. File giữ chỗ sinh bằng `node scripts/build-characters.mjs` vào `src/assets/journey/character/`.
- Thầy ngồi sau án thư ở Tĩnh thất, đổi tư thế theo `Cue.gesture`; đạo đồng ở cổng và hành lang (chỉ bản đầy đủ).
- Khác brief: KHÔNG cho miệng mấp máy và không xoay tay quanh khớp. Bản đầu làm vậy, chủ dự án thấy giống con rối, nên vẽ lại mắt nhắm hiền, chỉ thở, nghiêng đầu, đưa tay áo nhẹ.
- Thắp hương: `src/features/journey/incense.tsx`, chạm giữ 0,8 giây, cháy thật 20 phút theo `tools.incenseLitAt`, hiện ở điện và trên án thư. Trạm điện kéo dài 9 giây ở bản đầy đủ để kịp giữ.
- Gieo xu: `CoinToss` tự gieo 6 hào, chạm hoặc lắc (`src/platform/shake.ts`), rung nhẹ. Nút gieo nhanh vẫn giữ.
- An sao: mở Tử Vi từ tờ lá số thì sao rơi vào 12 cung trong khoảng 2,6 giây trên nền giấy; chạm để bỏ qua, tắt khi giảm chuyển động.

### Chưa đo
- fps và số nét trên máy Android tầm thấp (điều kiện chặn 6.6, chủ dự án đồng ý làm sau). Nếu không đạt thì đổi sang ảnh động CSS.
- Ngưỡng lắc 22 m/s² là số tạm.

## Phase 6.5 — Thầy đọc — XONG PHẦN CODE, CHƯA NGHE TRÊN MÁY THẬT

### Đã xong
- `src/content/noSpeech.ts`: từ cấm đọc theo từng câu; `speechOf` dùng chung nên nút "Đọc kết quả" của La Bàn cũng lọc.
- `src/content/reader/templates.ts`: bộ mẫu tối thiểu; `src/features/reader/script.ts`: `xungHo`, `buildScript`, lời dẫn cho từng công cụ; `hooks.ts`: `thayVoice`, `useWho`, `useCueFocus`.
- 5 công cụ và Tổng hợp đọc theo kịch bản; Tử Vi, Bát Tự, Lục Hào, Bát Trạch tô sáng vùng đang đọc qua prop `focus`.
- Trình phát: dùng luôn phiên đọc trong `src/platform/tts.ts` (khác 12.7 tách `CuePlayer` riêng, để tạm dừng, lùi, tiến, `ReadingBar` chạy chung một chỗ). Đoạn chỉ có chữ dừng theo độ dài, tối thiểu 3 giây.
- Cài đặt: chọn giọng (`settings.ttsVoice`, tuỳ chọn, không tăng version), nghe thử giọng thầy, "Thầy gọi bạn là". Mục chọn giọng chỉ hiện khi máy có từ 2 giọng trở lên.

### Chưa làm hoặc chưa kiểm
- ~~Chưa có thời gian chờ khi `speak()` treo~~ XONG 06/11/2026 (ARCHITECTURE 12.7), đã test bằng plugin giả; chưa gặp ca treo thật trên máy.
- ~~La Bàn chưa có kịch bản thầy~~ XONG 06/11/2026: 'laban' trong `TOOL_LINES`, tô sáng hướng trên vòng la bàn. Lời mới ở `docs/LOI-THAY.md`, chờ duyệt cùng 6.7.
- Chưa nghe giọng thầy, chưa xem tô sáng khi đang đọc trên máy thật. Bộ mẫu đầy đủ ở 6.7.

## Phase 6.4 — Tĩnh thất — XONG PHẦN CODE

### Đã xong
- `src/features/study/`: `StudyScreen` là gốc tab chính, 6 đồ vật trên án thư có nhãn truy cập, phụ đề, điều khiển ⏮ ⏯ Thầy đọc ⏭ 🐢. Tranh `room.svg`, `obj-*.svg` sinh cùng script hành trình.
- `HomeScreen` chuyển sang route `tonghop`, mở từ sổ tổng hợp. Thanh trên hiện ngày âm và năm Can Chi (`yearCanChiName` thêm ở core). Tab đổi tên thành Tĩnh thất.
- `Intake.tsx`: chưa có hồ sơ thì hỏi lần lượt tên, giới tính, ngày, giờ; dùng chung `profiles/draft.ts` với `ProfileForm` nên kiểm tra ngày đúng một logic. Vẫn có nút "Điền cả hồ sơ một lần".
- `tts.ts`: `ReadingState` thêm `text` làm phụ đề, thêm `setReadingOptions`. `ReadingBar` ẩn với lần đọc của Tĩnh thất.

### Tạm thời

## Thử trên máy thật lần 1 — Samsung Galaxy S25 Ultra, 05/11/2026

Chủ dự án tự thử, APK debug đề 06:20 ngày 05/11. Mới một máy, cao cấp; ARCHITECTURE mục 11 cần 2 máy, gồm một máy đời cũ.

| Phần | Kết quả |
|---|---|
| Chung | Đạt: Back đúng, đóng mở lại còn hồ sơ, không tràn màn hình, không khó đọc |
| Hành trình | Mượt, có tiếng nền, chữ thanh trạng thái đọc được. Chưa ấn tượng vì còn là ảnh giữ chỗ |
| Đọc thành lời | Có tiếng Việt, đọc hết bài dài, tắt mạng vẫn đọc, bấm đọc không bị im lâu. Giọng nghe cứng, thiếu truyền cảm, chưa đổi được giọng |
| La bàn | Kim không rung. **KHÔNG ĐẠT phép thử 4:** gần loa, kim loại không hiện cảnh báo. Phép thử 1 (so hướng) chưa làm |

### Đã sửa sau lần thử (chưa thử lại trên máy thật)
- **La bàn báo nhiễu:** cảnh báo cũ chỉ dựa vào `accuracy` và `headingErrorDeg`, là số do máy tự báo. Plugin gửi thêm `fieldUT` (độ lớn từ trường);
  ngoài 25–65 µT thì `compassTrust` trả `interference`, màn hình báo lỗi và làm mờ số độ, đồng thời luôn hiện số µT đo được để chốt ngưỡng.
- **Điều khiển đọc:** `src/ui/components/ReadingBar.tsx` nằm trên thanh tab, chỉ hiện khi đang đọc: nghe lại đoạn trước, tạm dừng / đọc tiếp, đoạn sau, dừng, vị trí đoạn.
  `tts.ts` thêm `pauseReading`, `resumeReading`, `skipReading`, `readingState`. Tạm dừng rồi đọc tiếp thì đọc lại từ đầu đoạn dở vì plugin không dừng giữa câu được.

- 490 test xanh, build OK. **Chưa biên dịch được file Java và chưa có APK mới:** máy làm việc này không có Android SDK. Thanh đọc mới kiểm bằng test, chưa xem ở 360px.

- Máy Windows hiện tại không có Android SDK và JDK 21, nên APK build bằng GitHub Actions (`.github/workflows/android-debug.yml`).

- APK từ Actions chạy trên S25 Ultra: thanh đọc hiện, nhưng dòng từ trường không hiện; chưa rõ nguyên nhân. Plugin đổi sang nhận từ kế theo loại cảm biến, màn hình báo rõ khi chưa có số đo.

### Cần thử lại
- Phép thử 4: xem số µT lúc bình thường và lúc để sát loa; từ kế tự hiệu chỉnh có thể làm nhiễu nhẹ không vượt ngưỡng.

## Phase 3.5b — Tổng Hợp đầy đủ — XONG

### Đã xong
- **Tính toán:** `src/core/tonghop/reading.ts` (`tongHopReading`, `hanhRel` = legacy `relHanhPair`, `huongOfHanh` suy từ Hậu Thiên Bát Quái,
  có test khớp `HANH_INFO`); `tongHopOf(birth)` trong `src/core/index.ts`. Không đổi công thức.
- **Câu chữ (nguyên văn):** `src/content/tonghop/{tongket,explain}.ts`; `tongHopParts(r)` trả 4 phần, mỗi phần là `Section[]` để Phase 6 đọc lại.
  `rich.ts` thêm khối `cards` và `table` (`SectionView` vẽ; dưới 560px mỗi hàng bảng thành một thẻ).
- **Màn hình:** `HomeScreen`: tóm tắt 4 hệ thống → Công cụ → Tóm lại về bạn → Ngũ hành → Bảng so sánh → Đọc tổng hợp thế nào?.
- **Đối chiếu legacy:** `tests/parity/tonghop.test.ts`: 52 hồ sơ, so toàn bộ `#tonghop-content`, khớp 100%, có kiểm đã đi qua đủ các nhánh
  (hướng vàng, Vô Chính Diệu, Thân vượng/nhược, 5 kiểu quan hệ hành). Đã thử sửa một chữ → test báo đúng chỗ.
  Thêm `src/features/home/HomeScreen.test.tsx`; `src/app/App.test.tsx` thêm `selector: 'b'` vì Cục và Nạp Âm nay hiện ở nhiều chỗ. 380 → 386 test.
- Kiểm 360×740 sáng/tối: không cuộn ngang, không lỗi console. Chưa kiểm cỡ chữ 130% và chưa chạy trên máy Android.

### Lưu ý
- Bỏ có chủ ý các phần chỉ có nghĩa với form riêng từng tab của legacy: dải "Đồng bộ / Chưa đồng bộ", hộp "Chưa có dữ liệu", câu nhắc đồng bộ
  thay cho đối chiếu chéo, nút "Cập nhật Tổng Hợp". App luôn tính từ một hồ sơ. Nút "Đọc toàn bộ tổng hợp" chờ Phase 5 (`src/platform/tts.ts`).

## Phase 6.2 — Engine cảnh — XONG PHẦN CODE, CHƯA ĐO ĐƯỢC FPS THẬT

### Đã xong
- `src/features/journey/`: `plan.ts` (quy tắc lối vào, máy trạng thái), `scenes.ts` (cấu hình 5 trạm), `SceneEngine.tsx`, `particles.ts` + `ParticleLayer.tsx`, `Journey.tsx` (phủ lên app, Bỏ qua, Back), `gate.ts`.
- 20 ảnh SVG giữ chỗ ở `src/assets/journey/placeholder/` (nay thay bằng `art/`), tổng 24 KB trên đĩa. `tests/assets-budget.test.ts` chặn vượt 3 MB.
- Lược đồ lên version 2 (migration 1 → 2): `settings.entryMode`, `journeySound`, `xungHo`; `tools.journey`, `incenseLitAt`.
- Đổi so với 6.1: thêm chế độ `auto` làm mặc định. Nếu mặc định là `full` như đã ghi thì quy tắc rút gọn không bao giờ chạy (ARCHITECTURE 12.2, 12.11).
- Cài đặt có mục "Lối vào đạo quán". `App` chỉ chạy hành trình khi có prop `journey` (bật ở `main.tsx`).

### Kết quả đo
| Môi trường | Trung vị | p95 | Khung ≤ 17 ms |
|---|---|---|---|
| Máy ảo, app đứng yên | 16,7 ms | 33 ms | 92,5% |
| Máy ảo, một div toàn màn hình di chuyển | 50 ms | 117 ms | 18% |
| Máy ảo, hành trình đầy đủ | 117 ms | 367 ms | 5,4% |

Máy ảo chạy không GPU nên chỉ một lớp di chuyển đã rớt còn khoảng 20 fps; số trên KHÔNG đại diện máy thật. Chưa đo được: CPU throttle 4× (lần chạy không bắt kịp hành trình),
trình duyệt (khung xem bị ẩn nên `requestAnimationFrame` dừng), và máy Android thật. Hành trình nặng gấp khoảng 2,3 lần một lớp, nên vẫn là rủi ro cần đo.

### Chưa làm
- Tĩnh thất thật (6.4); thắp hương, nhân vật (6.6); lời đạo đồng (6.7).
- Chữ đồng hồ trên thanh trạng thái Android khó đọc khi hành trình phủ nền tối.

## Phase 5.1 — Đọc thành lời — XONG PHẦN CODE, CHỜ THỬ MÁY THẬT

### Đã xong
- `@capacitor-community/text-to-speech` ~8.0.2. `src/platform/tts.ts`: `speak(text, { rate, pitch })` resolve khi đọc xong một đoạn (Phase 6 dùng),
  `readAloud` đọc nối tiếp, mỗi lúc một nơi, `stopReading`, `vietnameseVoice`, `openVoiceInstall`. Trình duyệt do plugin dùng `speechSynthesis`.
- `src/content/speech.ts`: chuẩn hoá chuyển từ legacy, thêm "độ", "phần trăm", bỏ dòng cách chấm, đoạn luôn ≤ 180 ký tự. `tests/speech.test.ts`.
- `src/ui/components/SpeakButton.tsx`: nút Đọc/Dừng ở Tử Vi, Bát Tự, Lục Hào, Bát Trạch, La Bàn, Nạp Âm, Tổng hợp. `App.tsx` tự dừng khi đổi màn hình, đổi người đang xem, app vào nền.
- Cài đặt: tốc độ đọc và cao độ giọng.
- Chỉ dùng giọng `…-local`, xem ARCHITECTURE mục 6.
- Kiểm trên máy ảo: nút đổi trạng thái, tự dừng khi đổi tab, không crash; không còn tải giọng server mà gọi bộ tổng hợp trên máy.

### Chưa kiểm được
- Máy ảo chưa có gói giọng trên máy nên KHÔNG có tiếng thật. Ở đó nút giữ "Dừng đọc" ít nhất 5 giây rồi mới báo lỗi: cần xem trên máy thật có bị im lặng lâu không.
- Chất lượng đọc tiếng Việt, tốc độ, đọc hết bài dài, tắt mạng vẫn đọc được.

## Phase 4.2 — La bàn — XONG PHẦN CODE, CHỜ THỬ MÁY THẬT

### Đã xong
- **Tính toán:** `src/core/laban/reading.ts` (8 cung, cung gần nhất, góc chạm, lọc nhiễu trên vòng tròn, `compassTrust`). Không đổi công thức Mệnh Quái, Du Niên.
- **Câu chữ:** `src/content/laban/explain.ts` nguyên văn legacy. Riêng bài học 3 và thông báo cảm biến viết lại vì app không qua trình duyệt, không hỏi quyền.
  `tests/parity/laban.test.ts`: 12 hồ sơ × 16 hướng, khớp 100%.
- **Plugin:** `android/app/src/main/java/vn/lyso/app/LySoDevicePlugin.java` (`TYPE_ROTATION_VECTOR`, dự phòng `TYPE_GEOMAGNETIC_ROTATION_VECTOR`), đăng ký trong `MainActivity`;
  lớp bọc `src/platform/compass.ts` (kèm `keepScreenOn` dùng `navigator.wakeLock`).
- **Màn hình:** `src/features/phongthuy/laban/{Dial,LaBanScreen}.tsx`, tự dùng cảm biến, 3 giây không có dữ liệu thì chuyển xoay tay. Ô hiệu chỉnh lưu ở `tools.laBanCalib`
  (thêm ở Phase 4.2, tuỳ chọn, không tăng version). `Dial` có prop `focus` cho Phase 6.
- **Gỡ legacy:** `la-ban-phong-thuy.html` chuyển sang `docs/legacy/`; xoá `public/`, `src/features/legacy`, `src/platform/legacy.ts`. App không còn trang web cũ nào.
- Kiểm trên máy ảo: xem ARCHITECTURE cuối mục 11.

### Việc tiếp theo
- Chạy 9 phép thử trên ít nhất 2 máy thật (ARCHITECTURE mục 11), chốt ngưỡng cảnh báo 15°.
- ~~Phase 5~~ XONG phần code.

## Phase 3.5 — Bát Trạch, Nạp Âm — XONG

### Đã xong
- **Tính toán:** `src/core/battrach/reading.ts` (`batTrachReading`: năm lý số, ngày Lập Xuân, 4 hướng tốt/xấu theo thứ tự legacy,
  đánh giá nhà, ba hành ứng dụng; `trachQuaiOf`, `HUONG_LIST`), `src/core/napam/reading.ts` (`napAmForBirth` chuyển từ `index.ts`,
  `resolveNapAmInput` = legacy `resolvePerson`, `napAmCompat`: điểm mạng + tuổi, mức hợp, vai sinh/khắc). Không đổi công thức.
- **Câu chữ (nguyên văn):** `src/content/battrach/{explain,tongket}.ts`, `src/content/napam/{explain,tongket}.ts`,
  `src/content/interp/napam.ts` (NAPAM_IMG cắt thẳng từ legacy), `src/content/common/tongket.ts` (thứ tự và giới hạn của `block()`).
  `rich.ts` thêm khối `swatches` (mẫu màu Ngũ hành).
- **Đối chiếu legacy:** `tests/parity/battrach.test.ts` (50 hồ sơ × chưa xét nhà + 2 hướng cửa × 9 khối; 8 hướng × 9 năm × 2 giới),
  `tests/parity/napam.test.ts` (hồ sơ mẫu một người và ghép đôi, chỉ nhập năm, 60 × 12 năm, 4 ngoại lệ hai chiều, thông báo lỗi): khớp 100%.
  Đã chạy một lần đủ 60 × 60 cặp năm: khớp 100%, nhưng quá nặng nên bản giữ lại là 60 × 12. Đã thử sửa một chữ → test báo đúng chỗ.
  `tests/phongthuy-reading.test.ts` cho quy tắc nhỏ. 302 → 380 test.
- **Màn hình:** `src/features/phongthuy/` — `PhongThuyScreen` (3 tab con giữ mount), `battrach/{BatTrachScreen,StarGrid}` (prop `focus`
  cho Phase 6), `napam/NapAmScreen` (chọn hồ sơ hoặc nhập tay, chỉ nhập năm cũng được; Người 1 đổi theo người đang xem).
  Test: `src/features/phongthuy/PhongThuyScreen.test.tsx`.
- **Gỡ legacy:** `lyso-toolkit.html` chuyển sang `docs/legacy/`, parity test đọc từ đó. Bỏ nút "Mở bản web cũ" ở Tử Vi, Bát Tự,
  Lục Hào. `src/features/legacy` chỉ còn phục vụ La Bàn.
- `tests/locks.test.ts`: tăng thời gian chờ của test Lập Xuân Bát Tự lên 30 giây (chạy riêng 2,5 giây, quá 5 giây khi chạy song song; không đổi kỳ vọng).
- Kiểm 360px sáng/tối: không cuộn ngang, không lỗi console. Chưa kiểm cỡ chữ 130% và chưa chạy trên máy Android.

### Việc tiếp theo
- Phase 4 (La bàn) — hỏi chủ dự án trước khi bắt đầu.

## Phase 3.4 — Lục Hào — XONG

### Đã xong
- **Bước 1 — tính toán + câu chữ + đối chiếu legacy** (257 → 296 test):
  - `src/core/luchao/reading.ts`: gieo quẻ (`randomToss`/`randomTosses`, nhận hàm tung đồng xu để test được; mặc định
    `crypto.getRandomValues`), bối cảnh ngày xem (`castContext`: Nhật thần, Nguyệt lệnh theo tiết, mùa), `haoViews`,
    `findDungThanHao`, `verdictHaos` (mục Luận đoán), `lucHaoReading` (chấm điểm Tổng kết).
  - `src/content/interp/luchao.ts` (QUE 64 quẻ, DT_PLAIN, DT_EX cắt thẳng từ legacy, `queShort`);
    `src/content/luchao/{explain,tongket}.ts`: Luận đoán, Giải thích chỉ số, Tổng kết, ghi chú (nguyên văn).
    Riêng dòng báo kết quả gieo ngẫu nhiên đổi câu chỉ dẫn nút bấm cho đúng giao diện app (không còn nút "Luận Quẻ").
  - `tests/parity/luchao.test.ts`: 31 tổ hợp gieo × 6 ngày xem × 7 loại "Hỏi về việc gì" × 4 khối: khớp 100%.
    `tests/luchao-reading.test.ts` cho quy tắc nhỏ.

- **Bước 2 — màn hình Lục Hào + rung** (296 → 302 test): cài `@capacitor/haptics` ~8.0, `src/platform/haptics.ts`
  (`tapLight()`, chỉ chạy trên Android), `npx cap sync android` đã đăng ký plugin. `src/features/luchao/` — `Hexagram`
  (sơ đồ quẻ, danh sách 6 hào có Can Chi, hành, Lục Thân, THẾ/ỨNG/ĐỘNG/DỤNG THẦN, vượng suy, Nhật xung/hợp, `aria-label`
  từng hào, prop `focus` cho Phase 6; thẻ quẻ biến), `LucHaoScreen` (ngày xem + "Hôm nay", gieo ngẫu nhiên / nhập tay,
  "Hỏi về việc gì", tóm tắt, luận đoán, giải thích gập/mở, tổng kết, ghi chú). Quẻ gần nhất lưu ở `tools.lucHaoLastCast`
  (thêm `method`, `date` tuỳ chọn — ARCHITECTURE mục 3), **giữ nguyên khi đổi việc hỏi hoặc ngày xem**; ngày xem sai thì báo
  lỗi nguyên văn legacy. Kiểm 360px sáng/tối/130%. Test: `src/features/luchao/LucHaoScreen.test.tsx`, thêm test lược đồ.

### Việc tiếp theo
- ~~Phase 3.5~~ XONG.

## Phase 3.3 — Bát Tự — XONG

### Đã xong
- **Bước 1 — tính toán + câu chữ + đối chiếu legacy** (191 → 252 test):
  - `src/core/battu/reading.ts`: Vượng Suy (`assessThan`), mùa sinh, gợi ý Dụng Thần (`dungThanPattern`: Sát trọng dụng Ấn /
    vượng / nhược), hồ sơ Thập Thần (`thapThanProfile`: tỷ lệ 5 nhóm, 2 vai nổi bật, 6 mẫu kết hợp, nhóm vắng),
    `batTuReading` (đếm hành 8 chữ, Dụng/Kỵ thần, Dụng Thần chính, Đại Vận + năm hiện tại), `batTuYearLookup`, `tangCanOf`.
  - `src/content/interp/battu.ts` (FAMILY, GOD_SHORT, CAN_TRAITS cắt thẳng từ legacy), `interp/hanh.ts` (HANH_INFO dùng chung);
    `src/content/battu/{explain,tongket}.ts`: Giải thích chỉ số, hộp Vượng Suy, Gợi ý Dụng Thần, lưu ý Lập Xuân/Tết,
    tuổi khởi vận, Tổng kết (cả mục "🧩 Thập Thần nổi bật" có thanh tỷ lệ), ghi chú.
  - `rich.ts` thêm khối `kv` (hàng nhãn – giá trị) và `bars` (thanh tỷ lệ).
  - `tests/parity/battu.test.ts`: 52 hồ sơ (bộ mẫu dùng chung `sampleProfiles()` trong `tests/parity/legacy.ts`, thêm ví dụ
    vàng 6/2/2021 và ca giữa Lập Xuân – Tết) × 7 khối: khớp 100%. `tests/battu-reading.test.ts` cho quy tắc nhỏ.

- **Bước 2 — màn hình Bát Tự** (252 → 257 test): `src/features/battu/` — `Pillars` (4 thẻ trụ, 2×2 ở 360px / 4 cột khi rộng:
  Can Chi, hành Âm Dương, Thập Thần hoặc "NHẬT CHỦ", Tàng Can 3 lớp kèm Thập Thần, `aria-label` đầy đủ, prop `focus` cho
  Phase 6), `BatTuScreen` (tóm tắt, lưu ý Lập Xuân/Tết, hộp Vượng Suy + Gợi ý Dụng Thần, dải Đại Vận tự cuộn tới chặng hiện
  tại + tuổi khởi vận, tra Lưu Niên, Giải thích chỉ số gập/mở, Tổng kết có thanh tỷ lệ Thập Thần, ghi chú, nút bản web cũ).
  Kiểm 360px sáng/tối/cỡ chữ 130%: không cuộn ngang, không lỗi console. Test: `src/features/battu/BatTuScreen.test.tsx`.

### Việc tiếp theo
- Phase 3.4 (Lục Hào + rung nhẹ `haptics`) — hỏi chủ dự án trước khi bắt đầu.

## Phase 3.2 — Tử Vi — XONG

### Đã xong
- **Bước 1 — tính toán + câu chữ + đối chiếu legacy** (121 → 185 test):
  - `src/content/rich.ts`: `parseRich` (thẻ `<b> <i> <small> <br> <ul> <li>`, thẻ khác in ra như chữ), `toPlainText`,
    kiểu `Section`/`Block` (p, list, verdict, item, chips, note) có `id` ổn định và `ref.palace` cho Phase 6.
  - `src/core/tuvi/reading.ts`: phần TÍNH TOÁN của luận giải legacy — độ sáng sao, bản mệnh, Cục ↔ bản mệnh, quan hệ Chi,
    tam phương tứ chính, đánh giá chung, Đại Hạn hiện tại, lưu niên (`tuViYear`), bảng tra năm (`tuViYearLookup`),
    6 mảng cuộc sống. `nowYear` truyền vào thay cho `new Date()`. `banMenh` tính riêng (legacy gắn vào chart) để không đổi
    đầu ra `calcChart` — bản chụp giữ nguyên.
  - `src/content/interp/tuvi.ts`: 14 bảng câu chữ (STAR, PHU, PAIRS, AREA…) cắt thẳng từ legacy bằng script;
    `src/content/tuvi/{explain,tongket,year}.ts`: "Giải thích chỉ số", "Tổng kết", "Đọc nhanh năm", ghi chú — nguyên văn.
  - `tests/parity/`: chạy `lyso-toolkit.html` trong jsdom (ngày cố định 15/6/2026), điền form Tử Vi cho 50 hồ sơ
    (tháng nhuận, trước 1968, trước Tết, Tý muộn, sinh sau năm nay…) + tra 3 năm mỗi hồ sơ: chữ khớp 100%
    (so bỏ khoảng trắng). Đã thử sửa một chữ → test báo đúng chỗ. `tests/tuvi-reading.test.ts` cho các quy tắc nhỏ.

- **Bước 2 — màn hình Tử Vi** (185 → 191 test): `src/features/tuvi/` — `ChartGrid` (bố cục C: lưới 4×4 gọn, chấm Tứ Hoá
  dính chữ cuối, nhãn Thân, tam phương tứ chính + đường nối, `aria-label` đầy đủ từng ô, prop `focus` cho Phase 6),
  `PalaceDetail` (‹ ›, ý nghĩa cung, chính tinh + sáng/tối + nét chính, phụ tinh, vòng, tam phương), `PalaceList`
  (chế độ Danh sách), `TuViScreen` (tóm tắt 8 ô, Tứ Hoá, dải Đại Hạn tự cuộn tới chặng hiện tại, tra năm + đọc nhanh,
  "Giải thích chỉ số" gập/mở, Tổng kết, ghi chú, nút "Mở bản web cũ (để đối chiếu)"). Component dùng chung
  `src/ui/components/{RichText,SectionView}.tsx`. Kiểm ở 360px sáng/tối/cỡ chữ 130%: không cuộn ngang, không lỗi console.
  Test: `src/features/tuvi/TuViScreen.test.tsx`.

### Việc tiếp theo
- Phase 3.3 (Bát Tự) — hỏi chủ dự án trước khi bắt đầu.

## Phase 2.1 — XONG

### Đã xong
- **Bước 1 — nền tảng + trạng thái** (92 → 113 test): cài `@capacitor/app` 8.1, `@capacitor/preferences` 8.0,
  `@fontsource/be-vietnam-pro`, `@fontsource/noto-serif` (dùng ở bước 2), dev: `@testing-library/react`, `jsdom`.
  `src/platform/{native,storage,lifecycle,backStack,back}.ts`; `src/state/{schema,store,actions,migrations,persist,ids}.ts`
  (lược đồ `lyso.state` v1, `parsePersisted`, migration 0 → 1 từ `lyso-shared-v1` + `lyso-theme`, giữ bản sao khi dữ liệu hỏng,
  ghi gộp 300ms + ghi ngay khi vào nền); `src/app/{routes,router}.ts` (ngăn xếp mỗi tab, bảng quy tắc Back).
  Test: `src/state/state.test.ts`, `src/app/router.test.ts`; `vite.config.ts` thêm `src/**/*.test.{ts,tsx}`.

- **Bước 2 — giao diện nền:** `src/ui/{tokens.css,base.css,fonts.ts,theme.ts}` — bảng màu nguyên từ legacy (sáng/tối theo
  `data-theme` hoặc hệ thống), token khoảng cách/cỡ chữ/`--tap: 44px`/safe-area, Be Vietnam Pro + Noto Serif offline
  (latin + vietnamese), `applyTheme` cập nhật `theme-color`.
- **Bước 3–5 — khung app, Hồ sơ, Tổng hợp** (một commit vì phụ thuộc lẫn nhau): `src/app/{App,context,boot,hooks}.tsx`,
  thanh trên (nút Quay lại, chip người đang xem → bảng chọn hồ sơ, ⚙), 5 tab luôn mount + giữ vị trí cuộn, thanh tab dưới;
  Back: bảng chọn/hộp thoại → màn hình con → về Tổng hợp → thu nhỏ app (web: Esc + nút Back trình duyệt).
  `src/features/profiles/*`: chọn, thêm, sửa, xoá (hỏi lại), dương/âm lịch, tháng nhuận, giờ, Tý muộn, báo lỗi nguyên văn
  legacy, xem trước ngày quy đổi. `features/home`: tóm tắt 4 hệ thống (core thêm `profileSummary(profile)` nhận cả âm lịch),
  lối tắt 6 công cụ, thông báo khi nhập từ bản 0.1 hoặc dữ liệu hỏng. `features/legacy`: tab Tử Vi/Bát Tự/Lục Hào và
  Phong thủy (Bát Trạch · La Bàn · Nạp Âm) hiện giới thiệu + "Mở bản web đầy đủ" (tự điền hồ sơ). `features/settings`: chế độ màu,
  thông tin app. Xoá `src/App.tsx`, `src/styles.css` (màn hình "Tra nhanh" 0.1).
  Test: `src/app/App.test.tsx` (form báo lỗi, chuyển tab giữ trạng thái, thứ tự Back, aria-label nút biểu tượng, sửa/xoá),
  `src/ui/theme.test.ts`. 113 → 121 test.
- **Bước 6 — kiểm:** Playwright ở 360×740, sáng và tối: không cuộn ngang, không lỗi console, dữ liệu còn sau khi tải lại,
  trang legacy tự điền hồ sơ và Back quay về app. `npx cap sync android` đã chạy (đăng ký plugin App + Preferences vào
  `android/`). **`npm run android:debug` CHƯA chạy** — máy cloud không có Android SDK; cần chạy trong Codespace.

### Việc tiếp theo
- Chạy `npm run android:debug` trong Codespace, cài APK, kiểm Back/lưu dữ liệu trên máy thật (ARCHITECTURE mục 7.3).
- ~~Phase 3.1~~ XONG: 3 bản mẫu (A lưới gốc cuộn ngang, B danh sách, C lưới gọn + thẻ chi tiết) dựng bằng engine thật,
  chụp ở 360px sáng/tối/cỡ chữ 130%; chủ dự án chọn **C**. Ghi ở ARCHITECTURE mục 10 "Phase 3.1", ảnh + mã bản mẫu ở
  `docs/design/tuvi-3.1/`.
- Phase 3.2 (Tử Vi: chuyển tính toán legacy còn lại vào `src/core/tuvi`, câu chữ vào `src/content`, dựng màn hình theo C)
  — hỏi chủ dự án trước khi bắt đầu.

## Phase 1.2 — XONG

### Đã xong
- **Bản chụp engine** (`tests/core-snapshot.test.ts`, `tests/snapshot/*`, `tests/fixtures/core-snapshot.json`):
  băm ~70.000 ca đầu ra của engine JS gốc (lịch âm 1900–2100, Tử Vi, Bát Tự quanh Lập Xuân/tiết, đủ 4096 quẻ Lục Hào,
  Bát Trạch, Nạp Âm mọi cặp, quickProfile). Đây là lưới an toàn: mọi bước refactor phải giữ test này xanh.
  KHÔNG sinh lại bản chụp (`UPDATE_CORE_SNAPSHOT=1`) trừ khi cố ý đổi công thức và ghi rõ lý do.
- `tests/snapshot/adapters.ts`: lấy câu chữ (mô tả sao Du Niên, câu quan hệ Nạp Âm). Khi chuyển câu chữ sang `src/content`
  (ARCHITECTURE mục 5.4) thì CHỈ sửa file này cho trỏ sang `src/content`, bản chụp phải giữ nguyên.

- **Bước 1 — test khoá hành vi** (xanh với bản JS gốc, 30 → 77 test):
  `tests/calendar.test.ts` (vòng tròn dương → âm → dương mỗi 7 ngày 1900–2100, bảng Tết 2000–2030 gồm 2007 và 2030
  khác lịch Trung Quốc, tham số `tz` của Tử Vi, hai biến thể `jdToDate`), `tests/locks.test.ts` (Mệnh Quái 2 × 100 năm
  so với công thức độc lập, thứ tự Ngũ Hành Bát Tự/Lục Hào, mốc Lập Xuân của Bát Tự UTC+7 cố định + giờ sinh và của Bát Trạch).

- **Bước 2 — `src/core/calendar/*`** (`julian`, `astro`, `lunar`, `solarTerms`, `timezone`, `date`) bằng TypeScript strict,
  gộp 4 bản sao hàm lịch; `util.js` bị xoá, `LySoUtil` lấy từ đây. Thêm `validLunar` (đổi âm → dương → âm để kiểm tra)
  kèm test. Kiểu chỉ số dùng chung ở `src/core/types.ts` (calendar cần `ChiIdx` mà không được phụ thuộc `canchi`).

- **Bước 3 — `src/core/canchi/*`** (`index`: CAN, CHI, HOUR_RANGES, DAN, mod, can chi năm/ngày, Ngũ Hổ Độn, Ngũ Thử Độn,
  vòng 60 Hoa Giáp; `napamTable`: bảng 30 Nạp Âm + `napAmLookup`; `hanh`: `type Hanh`, sinh/khắc). Các engine import từ đây.

- **Bước 4a — Nạp Âm sang TS** (`src/core/napam/{engine,types}.ts`): `relation()` trả mã
  `{ cls, kind, from, to, needs? }`; câu văn nguyên văn ở `src/content/napam/relation.ts` (`napAmRelationText`),
  `tests/snapshot/adapters.ts` trỏ sang đó — bản chụp giữ nguyên. Thêm `tests/content-napam.test.ts`.

- **Bước 4b — Bát Trạch sang TS** (`src/core/battrach/{engine,types}.ts`, kiểu `Quai`, `Huong`, `StarName`…):
  `duNien()` không còn `desc`; mô tả sao nguyên văn ở `src/content/battrach/stars.ts`. Golden test chỉ thêm một dấu `!`
  (kiểu `find()` có thể `undefined`), không đổi kỳ vọng.

- **Bước 4c — Lục Hào sang TS** (`src/core/luchao/{engine,types,hexagrams}.ts`): bảng 64 quẻ + Nạp Giáp tách riêng,
  `LH_HANH_ORDER` đặt tên rõ; `type Quai` chuyển lên `src/core/types.ts` (Lục Hào và Bát Trạch không import lẫn nhau).
  Bỏ `pillClass` (hàm trình bày, chưa từng được xuất).

- **Bước 4d — Bát Tự sang TS** (`src/core/battu/{engine,types}.ts`): `BT_HANH_ORDER` đặt tên rõ, giữ UTC+7 cố định cho
  tiết khí (chú thích tại chỗ). Không tìm được tiết của tháng thì ném lỗi thay vì trả `null` (không xảy ra trong 1900–2100).

- **Bước 4e — Tử Vi sang TS** (`src/core/tuvi/{engine,types}.ts`): bảng sao/vòng đưa lên mức module, giữ tham số `tz`
  (`input.tz || lunarTzForSolarYear`). Không còn file `.js` nào trong `src/core`.

- **Bước 5 — `birth.ts` + `index.ts` có kiểu đầy đủ:** `resolveBirth(profile)` (dương/âm lịch, tháng nhuận, Tý muộn,
  kiểm tra theo đúng logic legacy) trả mã lỗi/ghi chú; câu chữ nguyên văn ở `src/content/common/birth.ts`.
  `index.ts` bỏ hết `any`, xuất kiểu và các hàm gọn `tuViChart`, `batTuChart`, `castHexagram`, `menhQuai`, `napAmOfBirth`;
  `quickProfile` dùng `resolveBirth`. Thêm `tests/birth.test.ts`. ARCHITECTURE mục 5.1 cập nhật dạng trả về của `resolveBirth`.

- **Bước 6 — dọn dẹp:** không còn file `.js` trong `src/`, bỏ `allowJs`/`checkJs` khỏi `tsconfig.json` và khai báo
  `declare module '*.js'`. CLAUDE.md cập nhật mô tả `src/core`, `src/content`.

**Số test:** trước Phase 1.2: 30 (23 vàng + 7 nhóm bản chụp). Sau: 92 (thêm `calendar` 42, `locks` 8, `birth` 8,
`content-napam` 4 — gồm 31 test Tết 2000–2030). Bản chụp engine KHÔNG sinh lại lần nào.

### Việc tiếp theo
- Phase 2.1 (khung app) theo ARCHITECTURE.md mục 10 — **hỏi chủ dự án trước khi bắt đầu**.

## Tồn đọng
- Xem ARCHITECTURE.md mục 9 ("Cần đối chiếu").
- `validLunar` (mới) loại thêm ngày âm quy ra dương ngoài 1900–2100; `resolveBirth` giữ đúng logic legacy (không có kiểm tra này).
- Golden test có 2 dấu `!` (chỉ về kiểu) do engine giờ có kiểu chặt; kỳ vọng không đổi.
