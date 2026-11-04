# Tiến độ theo PROMPT-KIT

> Cập nhật sau mỗi bước. Phiên Claude Code mới: đọc `CLAUDE.md`, `docs/ARCHITECTURE.md`, rồi file này để làm tiếp.
> Làm việc và push thẳng lên nhánh `main` (chủ dự án làm một mình, đã đồng ý).

| Phase | Trạng thái |
|---|---|
| 0 — Kiểm tra môi trường | `npm test` 23/23 xanh, `npm run build` OK. `npm run android:debug` CHƯA chạy (máy cloud không có Android SDK — chạy trong Codespace). |
| 1.1 — Kiến trúc | XONG → `docs/ARCHITECTURE.md` |
| 1.2 — Engine TypeScript | XONG — `npm test` 30 → 92 test xanh, `npm run build` OK |
| 2.1 — Khung app | XONG (trừ `android:debug`, cần Codespace) — 121 test xanh, build OK |
| 3.1 — Bố cục lá số Tử Vi | XONG — chọn phương án C (lưới gọn + thẻ chi tiết), xem ARCHITECTURE mục 10 |
| 3.2 — Tử Vi | XONG — 191 test xanh, build OK |
| 3.3 — Bát Tự | CHƯA LÀM — chờ chủ dự án đồng ý |

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
