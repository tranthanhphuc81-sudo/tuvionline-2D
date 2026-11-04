# Tiến độ theo PROMPT-KIT

> Cập nhật sau mỗi bước. Phiên Claude Code mới: đọc `CLAUDE.md`, `docs/ARCHITECTURE.md`, rồi file này để làm tiếp.
> Làm việc và push thẳng lên nhánh `main` (chủ dự án làm một mình, đã đồng ý).

| Phase | Trạng thái |
|---|---|
| 0 — Kiểm tra môi trường | `npm test` 23/23 xanh, `npm run build` OK. `npm run android:debug` CHƯA chạy (máy cloud không có Android SDK — chạy trong Codespace). |
| 1.1 — Kiến trúc | XONG → `docs/ARCHITECTURE.md` |
| 1.2 — Engine TypeScript | XONG — `npm test` 30 → 92 test xanh, `npm run build` OK |
| 2.1 — Khung app | ĐANG LÀM (xem dưới) |

## Phase 2.1 — đang làm

### Đã xong
- **Bước 1 — nền tảng + trạng thái** (92 → 113 test): cài `@capacitor/app` 8.1, `@capacitor/preferences` 8.0,
  `@fontsource/be-vietnam-pro`, `@fontsource/noto-serif` (dùng ở bước 2), dev: `@testing-library/react`, `jsdom`.
  `src/platform/{native,storage,lifecycle,backStack,back}.ts`; `src/state/{schema,store,actions,migrations,persist,ids}.ts`
  (lược đồ `lyso.state` v1, `parsePersisted`, migration 0 → 1 từ `lyso-shared-v1` + `lyso-theme`, giữ bản sao khi dữ liệu hỏng,
  ghi gộp 300ms + ghi ngay khi vào nền); `src/app/{routes,router}.ts` (ngăn xếp mỗi tab, bảng quy tắc Back).
  Test: `src/state/state.test.ts`, `src/app/router.test.ts`; `vite.config.ts` thêm `src/**/*.test.{ts,tsx}`.

### Việc tiếp theo (ARCHITECTURE.md mục 10, Phase 2.1)
2. `src/ui/tokens.css`, `base.css`, font offline, chủ đề sáng/tối, safe-area.
3. Router + thanh tab dưới + thanh trên (chip người đang xem, ⚙) + Back.
4. Màn hình Hồ sơ (thêm/sửa/xoá, dương/âm, nhuận, giờ, Tý muộn, báo lỗi như legacy).
5. Tổng hợp đọc hồ sơ đang chọn; tab chưa dựng → nút mở trang legacy.
6. Kiểm 360px; `npm run android:debug` (cần Codespace có Android SDK).

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
