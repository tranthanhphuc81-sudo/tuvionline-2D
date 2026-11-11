# Ngũ hành Engine (Bát Tự) — v0.2

> **Bản tham chiếu trong repo tuvionline-2D.** Không nằm trong `tsconfig`/vitest, không đóng gói vào app. Bước 3C.2 của `docs/PROMPT-KIT-NGU-HANH.md` port engine này vào `src/core/nguhanh` (dùng lại bảng can chi, tàng can của app). Giữ thư mục này để đối chiếu, giống `docs/legacy/`. Lệnh `npm run demo`/`typecheck` bên dưới là của gói gốc; trong repo này chạy demo bằng `node docs/ngu-hanh-engine/demo.ts` (Node ≥ 22.18 tự bỏ kiểu, không cần cài thêm). Script so sánh `compare-dung-than.ts` import cả `src` (không đuôi `.ts`) nên phải chạy bằng `npx tsx` (tải tsx từ npm cho tới khi bước 3C.2 thêm vào devDependencies).

Module TypeScript thuần (không phụ thuộc thư viện) để:

1. **Tính điểm ngũ hành** của một lá số Bát Tự: thiên can, tàng can, hệ số vị trí, nguyệt lệnh (Vượng/Tướng/Hưu/Tù/Tử), tam hợp, bán hợp, lục hợp, lục xung, can hợp.
2. **Xếp loại nhật chủ**: cực nhược / nhược / trung hòa / vượng / cực vượng.
3. **Kiểm tra Tòng cách / Chuyên vượng** theo 4 điều kiện, xếp hạng Chân / Giả / Không thành kèm độ tin cậy.
4. **Chọn Dụng – Hỷ – Kỵ – Cừu thần** theo Phù ức, Điều hậu, Thông quan, Thuận thế — trả về **nhiều cách luận có trọng số** khi lá số mơ hồ.
5. **Kiểm chứng bằng quá khứ**: chọn các năm đã qua mà hai cách luận dự đoán ngược nhau, hỏi người dùng, cập nhật trọng số.
6. **Diễn giải thực tế**: chiến lược theo Thập thần, thói quen, công việc, môi trường, hành cần tiết chế, đánh giá các năm tới.

Mọi bước đều ghi lý do (`trace`, `reasons`, `checks[].detail`) để app hiển thị "vì sao ra kết quả này".

## Cấu trúc

```
src/data.ts     Dữ liệu nền: can, chi, tàng can, sinh khắc, hợp xung, thập thần
src/config.ts   Bộ trọng số + ngưỡng (preset theo trường phái) — chỉnh ở đây, không sửa thuật toán
src/engine.ts   scoreElements → classifyDayMaster → assessFollow → buildReadings; analyze()
src/follow.ts   Kiểm tra điều kiện Tòng cách / Chuyên vượng
src/advice.ts   buildPracticalReport(), verificationQuestions(), resolveWithFeedback()
demo.ts         5 lá số mẫu (chân tòng, giả tòng, không thành, chuyên vượng, lá số thường) + demo phân xử
```

`npm run demo` · `npm run typecheck` (Node ≥ 22.18, chạy trực tiếp file .ts)

## Luồng dùng trong app

```ts
import { analyze, buildPracticalReport, resolveWithFeedback } from "./src/index.ts";

// 1. Phân tích
const a = analyze({
  year:  { stem: "Nham", branch: "Than" },
  month: { stem: "Nham", branch: "Ty" },
  day:   { stem: "Binh", branch: "Thin" },
  hour:  { stem: "Mau",  branch: "Ty" },   // tùy chọn
});

// 2. Báo cáo theo cách luận chính
const report = buildPracticalReport(a, { fromYear: 2026, years: 5, birthYear: 1990 });
//   report.pattern       → kết quả kiểm tra tòng cách (nếu có dấu hiệu)
//   report.alternative   → cách luận thay thế + điểm khác biệt chính
//   report.timing[].altFavor → đánh giá năm theo cách luận thay thế
//   report.verification  → câu hỏi về các năm đã qua

// 3. Người dùng trả lời → cập nhật trọng số
const res = resolveWithFeedback(a, [
  { year: 2020, outcome: "xau" },
  { year: 2015, outcome: "tot" },
  { year: 2014, outcome: "tot" },
]);
// res.decided, res.conclusion; dựng lại báo cáo từ res.analysis
const final = buildPracticalReport(res.analysis, { fromYear: 2026 });

// Xem báo cáo theo cách luận còn lại (tab "Cách luận khác")
const other = buildPracticalReport(a, { readingId: "thong-thuong" });
```

Đầu vào là **tứ trụ đã an sẵn**. Việc đổi ngày giờ sinh → can chi (tiết khí, Lập Xuân, giờ địa phương) dùng module lịch của app. `yearPillar()` chỉ tính theo năm dương lịch, chưa xét mốc Lập Xuân — câu hỏi kiểm chứng nên ghi chú "tính từ khoảng đầu tháng 2".

## Kiểm tra Tòng cách (follow.ts)

Chỉ chạy khi tỷ lệ hỗ trợ nhật chủ < `follow.candidateWeak` (Tòng) hoặc > `follow.candidateStrong` (Chuyên vượng).

| # | Điều kiện | Loại | Cách chấm |
|---|---|---|---|
| 1 | Gốc ở địa chi | cổng cứng | Cộng điểm tàng can của phe cứu (tòng) / phe chế (chuyên vượng): bản khí 1, trung khí 0.5, dư khí 0.2; chi tháng ×2, chi ngày ×1.5. 0 → đạt; ≤ `weakRootMax` → một phần; lớn hơn → trượt |
| 2 | Can lộ | cổng cứng | Mỗi can lộ của phe đó: bị hợp (không phải với nhật chủ) hoặc bị khắc mà không gốc → vô hiệu; hợp với nhật chủ hoặc bị khắc nhưng có gốc → một phần; còn lại → trượt |
| 3 | Thế phe được theo | mềm | Chiếm ≥ `dominantMinShare` và đắc lệnh / được lệnh sinh / thành cục |
| 4 | Hướng | mềm | Hành mạnh nhất ≥ `singleDirectionRatio` × hành nhì → nhất hành (Tòng Sát/Tài/Nhi); ngược lại Tòng Thế |

- **Chân**: không cổng nào trượt, hai cổng đạt trọn, tin cậy ≥ `chanMin` → cách thuận thế chiếm tối đa 95%.
- **Giả**: không cổng nào trượt, tin cậy ≥ `giaMin` → hai cách luận song song, cách thuận thế tối đa `giaMaxWeight` (65%).
- **Không thành**: một cổng trượt hoặc tin cậy thấp → chỉ luận thông thường, vẫn trả `follow` để app giải thích vì sao không thành.
- `breakers`: hành mà khi đến (năm/đại vận) sẽ phá cách.

## Phân xử bằng quá khứ (advice.ts)

- `verificationQuestions()` chọn tối đa 4 năm trong 20 năm gần nhất (sau tuổi 15 nếu có `birthYear`) mà hai cách luận dự đoán **ngược dấu**, ưu tiên năm chênh lệch lớn.
- `resolveWithFeedback()` cập nhật kiểu Bayes: mỗi câu trả lời nhân trọng số với `exp(k × mức khớp)`, mức khớp kẹp ±1 để một năm không quyết định tất cả; sàn 2% cho mỗi cách luận.
- Chỉ kết luận khi: ≥ 3 năm, trọng số ≥ 80% **và** cách luận đó khớp ≥ 75% số năm (2 đúng 1 sai → "chưa phân định").
- Sau khi kết luận, báo cáo không hỏi lại; chưa kết luận thì chỉ hỏi các năm chưa trả lời.

## Các quyết định thiết kế

- **Trọng số tách thành config** vì các trường phái không thống nhất hệ số. `MONTH_HEAVY_CONFIG` là preset thứ hai để so sánh.
- **Hỷ/Kỵ không suy máy móc** từ "hành khắc dụng thần": Điều hậu kỵ hành gây nóng/lạnh thái quá; Trung hòa kỵ hành dư nhất; Tòng cách kỵ hành "cứu" nhật chủ.
- **Không cách luận nào 100%**: luôn giữ cách thiểu số ≥ 5% (≥ 2% sau phân xử) để minh bạch.
- **Thứ tự lời khuyên**: Hành vi → Công việc → Môi trường. Màu sắc, hướng là lớp biểu tượng chi phí thấp, đặt sau cùng.
- **Không lời khuyên y tế/đầu tư cụ thể**, luôn kèm `disclaimer`.

## Giới hạn hiện tại

- Chưa xét: hình, hại, phá; thần sát; hợp hóa thành công (mới xử lý "hợp trói").
- Tàng can Thìn/Tuất/Sửu/Mùi theo bảng Mậu-Ất-Quý…; một số trường phái coi can thứ hai là "dư khí" — đổi thứ tự trong `HIDDEN_STEMS` hoặc chỉnh `rootWeights` nếu theo trường phái đó.
- Đại vận: chưa có hàm an đại vận; `evaluatePeriod()` và câu hỏi kiểm chứng hiện chỉ xét lưu niên. Thêm đại vận sẽ làm kiểm chứng chính xác hơn nhiều (người dùng nhớ giai đoạn 10 năm dễ hơn từng năm).
- Các ngưỡng là quy ước, nên hiệu chỉnh bằng một bộ lá số đã được luận làm test set.
