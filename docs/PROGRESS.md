# Tiến độ theo PROMPT-KIT

> Cập nhật sau mỗi bước. Phiên Claude Code mới: đọc `CLAUDE.md`, `docs/ARCHITECTURE.md`, rồi file này để làm tiếp.
> Làm việc và push thẳng lên nhánh `main` (chủ dự án làm một mình, đã đồng ý).

| Phase | Trạng thái |
|---|---|
| 0 — Kiểm tra môi trường | `npm test` 23/23 xanh, `npm run build` OK. `npm run android:debug` CHƯA chạy (máy cloud không có Android SDK — chạy trong Codespace). |
| 1.1 — Kiến trúc | XONG → `docs/ARCHITECTURE.md` |
| 1.2 — Engine TypeScript | ĐANG LÀM (xem dưới) |

## Phase 1.2 — đang làm

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

### Việc tiếp theo (theo ARCHITECTURE.md mục 10)
1. ~~Test bổ sung theo yêu cầu kit, chạy xanh với bản JS hiện tại:
   - `tests/calendar.test.ts`: đổi dương → âm → dương khớp nhau mọi ngày 1900–2100, mẫu mỗi 7 ngày
     (dùng CÙNG một tz cho cả hai chiều: `lunarTzForSolarYear(năm dương)`); bảng Tết 2000–2030 so với lịch chính thức;
     tham số `tz` tuỳ chọn của `TuViEngine.calcChart`.
   - Mệnh Quái 2 giới × 100 năm (1950–2049) so với công thức độc lập: Nam `(11 − năm mod 9) mod 9`,
     Nữ `(năm mod 9 + 4) mod 9`; 0 → 9; 5 → Nam Khôn / Nữ Cấn.
   - Bẫy ở ARCHITECTURE mục 5.3: hai biến thể `jdToDate`, thứ tự Ngũ Hành khác nhau giữa Bát Tự và Lục Hào.~~ XONG
2. Gộp `src/core/calendar/*` → `canchi/*` → chuyển từng hệ thống sang `.ts` strict (napam → battrach → luchao → battu → tuvi),
   `birth.ts`, `index.ts` có kiểu đầy đủ; câu chữ trong engine chuyển sang `src/content`.
3. Xoá file `.js` cũ, bỏ `allowJs`, báo số test trước/sau. Commit mỗi bước, `npm test` + `npm run build` xanh.

## Tồn đọng
- Xem ARCHITECTURE.md mục 9 ("Cần đối chiếu").
