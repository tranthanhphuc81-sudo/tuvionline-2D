# Kiến trúc app Lý Số Trọn Bộ

> Tài liệu quyết định của Phase 1.1 (PROMPT-KIT). Mỗi mục ghi **Lựa chọn**, **Lý do**, **Phương án bị loại**.
> Các phase sau làm theo tài liệu này. Muốn đổi một quyết định thì sửa tài liệu trước, ghi lý do, rồi mới sửa code.
>
> Căn cứ khi viết: `CLAUDE.md`, `README.md`, `src/core/*` (6 file JS + `index.ts`), `tests/golden.test.ts` (23 test),
> `src/App.tsx`, `public/legacy/lyso-toolkit.html` (4.326 dòng) và `public/legacy/la-ban-phong-thuy.html` (665 dòng).
> Phiên bản gói lấy từ npm ngày 04/11/2026.

---

## 0. Hiện trạng (điểm xuất phát)

- **Engine** (`src/core/*.js`, có `// @ts-nocheck`): bốn file `tuvi.js`, `battu.js`, `luchao.js`, `battrach.js` đều chép lại cùng
  một bộ hàm thiên văn: `INT`, `jdFromDate`, `NewMoon`, `SunLongitude`, `findSolarTerm`, `convertSolar2Lunar`… Ba file chép lại
  bảng `CAN/CHI`, còn bảng 30 Nạp Âm có ở cả `tuvi.js` lẫn `napam.js`.
- **`src/core/index.ts`** xuất mọi engine với kiểu `any`. UI hiện chỉ dùng `quickProfile()` và `napAmForBirth()`.
- **Legacy** gồm 6 tab (`tuvi`, `battu`, `kinhdich`, `phongthuy`, `napam`, `tonghop`) và một form "Thông tin dùng chung"
  (`lyso-shared-v1` trong `localStorage`). Câu chữ nằm ở ba chỗ:
  1. các hàm `renderExplain` / `renderNotes` của từng tab (HTML dựng bằng template string);
  2. module `window.LySoInterp` (dòng ~1160–2030): `tuVi`, `tuViYear`, `batTu`, `thapThanProfile`, `lucHao`, `batTrach`,
     `napAm`, kèm các bảng `STAR`, `PAIRS`, `FAMILY`, `AREA`, `HANH_INFO`, `QUE`…;
  3. **ngay trong engine**: `NapAmEngine.relation()` trả về câu tiếng Việt, `battrach.js` có `STARS[].desc`.
- **Legacy còn chứa logic tính toán chưa có trong `src/core`.** Ví dụ: độ sáng sao (`brightness`), tra vận theo năm
  (`tuViYear`), hồ sơ Thập Thần (`thapThanProfile`), chấm Vượng Suy (`renderVuongSuy`), luận đoán Lục Hào (`renderVerdict`),
  đánh giá nhà theo hướng cửa. Phase 3 phải chuyển các phần này vào `src/core` và viết test (xem mục 5.4).

---

## 1. Điều hướng

### 1.1 Cấu trúc màn hình

**Lựa chọn:** thanh tab dưới gồm 5 mục. Không có tab "Thêm".

| # | Tab (nhãn) | Nội dung |
|---|---|---|
| 1 | 🏠 **Tổng hợp** | Màn hình chính: tóm tắt 4 hệ thống của người đang xem, ô lối tắt sang mọi công cụ, phần đọc tổng hợp (`src/content/tonghop`). Phase 6.4 đã thay bằng "Tĩnh thất"; phần đọc tổng hợp chuyển sang route `tonghop`. |
| 2 | 🔮 **Tử Vi** | Lá số, Tứ Hoá, Đại Hạn, tra vận theo năm, giải thích, tổng kết. |
| 3 | 📜 **Bát Tự** | 4 Trụ, Thập Thần, Vượng Suy, Đại Vận, Lưu Niên. |
| 4 | ☯ **Lục Hào** | Gieo quẻ, quẻ chủ, quẻ biến, luận đoán. |
| 5 | 🧭 **Phong thủy** | Nút chuyển ở đầu màn hình: **Bát Trạch · La Bàn · Nạp Âm**. |

Hai màn hình phụ không nằm trên thanh tab:

- **Hồ sơ:** chạm vào "chip người đang xem" ở thanh trên (mọi tab đều có) để mở bảng chọn từ dưới lên. Bảng gồm danh sách
  hồ sơ, nút "＋ Thêm", và mục "Quản lý hồ sơ", mở màn hình con để thêm, sửa, xoá.
- **Cài đặt:** nút ⚙ ở thanh trên, mở màn hình con.

Mọi công cụ đều tới được trong tối đa 2 lần chạm. Màn hình Tổng hợp có ô lối tắt "La Bàn" và "Nạp Âm & hợp hôn" để vào thẳng.

**Lý do:**
- Gộp Bát Trạch, La Bàn và Nạp Âm vào một tab vì cả ba thuộc **Phần 4** của tài liệu (Nạp Âm là Phụ lục của Phần 4).
  Bát Trạch và La Bàn còn dùng chung Mệnh Quái và bảng Du Niên: La Bàn tô màu 8 hướng theo kết quả Bát Trạch.
- Tử Vi, Bát Tự và Lục Hào là ba công cụ sâu nhất, nhiều màn hình nhất và dùng thường xuyên nhất, nên mỗi công cụ một tab.
- Hồ sơ là ngữ cảnh chung của mọi công cụ, không phải một công cụ. Đặt ở thanh trên thì đổi người mà không phải rời tab đang xem.
- Nhãn ngắn, vừa 5 × 72px ở chiều rộng 360px.

**Phương án bị loại:**
- *7 tab cuộn ngang:* trái hướng dẫn Material (3–5 mục), mục cuối bị khuất, khó chạm.
- *Ngăn kéo (drawer):* giấu công cụ, người lớn tuổi khó tìm, tốn thêm một lần chạm cho mọi việc.
- *Tab "Thêm" chứa Bát Trạch, Nạp Âm, La Bàn:* biến cả mảng phong thủy thành hạng hai, trong khi La Bàn là tính năng
  "chỉ app mới có".
- *Tab riêng cho Hồ sơ:* chiếm một chỗ quý cho việc làm một lần rồi ít khi quay lại.

### 1.2 Bộ điều hướng (router)

**Lựa chọn:** tự viết router nhỏ (khoảng 100 dòng) trong `src/app/router.ts`:
- Trạng thái là `{ tab: TabId; stacks: Record<TabId, Route[]> }`, mỗi tab có ngăn xếp màn hình riêng.
  `Route` là union có kiểu, ví dụ `{ name: 'tuvi' } | { name: 'tuvi.palace', palace: number } | { name: 'profiles.edit', id?: string }`.
- **Tab không bị gỡ khi ẩn** (giữ trong cây React với thuộc tính `hidden`). Nhờ vậy quẻ Lục Hào vừa gieo, vị trí cuộn và năm
  đang tra vẫn còn khi chuyển tab qua lại.
- Không dùng URL. Không có deep link trong bản này.

**Lý do:** chỉ có khoảng 12 route, không có server, không cần deep link. Router riêng cho kiểu chặt chẽ, dễ viết unit test,
không phụ thuộc thư viện, và điều khiển hoàn toàn được nút Back.

**Phương án bị loại:**
- *react-router / TanStack Router:* sinh ra cho URL và data loading, cả hai đều không cần ở đây. Mô hình "mỗi tab một stack,
  giữ mount" lại phải tự làm thêm. Dùng hash URL trong WebView còn sinh ra lỗi Back khó lường.
- *Ionic React:* kéo theo cả bộ component và phong cách giao diện riêng, xung đột với design tokens lấy từ legacy.

### 1.3 Nút Back của Android

**Lựa chọn:** dùng `@capacitor/app` (`App.addListener('backButton', …)`) và một **ngăn xếp trình xử lý Back** ở
`src/platform/back.ts`. Component đăng ký trình xử lý khi mount và tự huỷ khi unmount, qua hook
`useBackHandler(handler, enabled)`. Thứ tự xử lý khi bấm Back:

1. Trình xử lý đăng ký sau cùng chạy trước: đóng bảng chọn hoặc hộp thoại, dừng "Thầy đọc" (Phase 6), bỏ qua hành trình
   để vào thẳng tĩnh thất (Phase 6). Trình xử lý trả về `true` nghĩa là đã xử lý xong.
2. Ngăn xếp của tab hiện tại còn nhiều hơn 1 màn hình: lùi lại một màn hình.
3. Đang ở tab khác Tổng hợp: về tab Tổng hợp.
4. Đang ở gốc tab Tổng hợp: `App.minimizeApp()` (đưa app vào nền, giữ nguyên trạng thái, đúng cách Android 12+ xử lý Back ở
   màn hình gốc).

Trên trình duyệt (`npm run dev`), phím `Esc` và `popstate` gọi cùng hàm đó để thử được mà không cần điện thoại.

Trang legacy tạm mở trong app (Phase 2–3) là một tài liệu HTML khác. Khi đó listener của SPA không còn, Capacitor quay về
hành vi mặc định là `history.back()`, nên Back vẫn đưa người dùng về app.

**Lý do:** gom mọi quy tắc Back vào một chỗ và test được (`back.test.ts`). Phase 6 cần chèn quy tắc "Back trong hành trình
thì vào thẳng tĩnh thất" mà không phải sửa router.

**Phương án bị loại:**
- *Bấm Back hai lần để thoát kèm toast:* Android 12+ không còn khuyến khích, dễ làm người dùng khó chịu.
- *`App.exitApp()` ở màn hình gốc:* mất trạng thái, mở lại phải khởi động nguội.
- *Mỗi màn hình tự nghe `backButton`:* thứ tự chạy không xác định khi nhiều listener cùng lúc.

---

## 2. Quản lý trạng thái

**Lựa chọn:** một **store tự viết** (khoảng 40 dòng, `src/state/store.ts`): `createStore(initial)` trả về
`getState / setState / subscribe`, React đọc qua `useSyncExternalStore` với hàm selector. Có ba nhóm trạng thái:

| Nhóm | Ở đâu | Có lưu không |
|---|---|---|
| **Hồ sơ** `profiles: Profile[]`, `activeProfileId` | store toàn cục | Có |
| **Cài đặt** `settings` (giao diện, tốc độ/cao độ giọng, các mục Phase 6–7 thêm sau) | store toàn cục | Có |
| **Đầu vào riêng của công cụ** (năm tra vận, việc hỏi Dụng Thần, hướng cửa nhà, quẻ đã gieo, cặp hồ sơ hợp hôn) | store toàn cục, nhánh `tools` | Chỉ lưu những gì đáng giữ: quẻ Lục Hào gần nhất, hướng cửa, cặp hợp hôn |
| **Kết quả tính** | **Không lưu.** Tính lại bằng `useMemo` từ (hồ sơ + đầu vào). | Không |

Kết quả là **dữ liệu dẫn xuất**. Engine là hàm thuần và chạy trong vài mili giây, nên không cần bộ nhớ đệm hay "nguồn sự thật
thứ hai". Đổi hồ sơ là mọi tab tự tính lại.

Mỗi lần thay đổi đi qua một hàm hành động đặt tên rõ (`addProfile`, `updateProfile`, `removeProfile`, `setActiveProfile`,
`setSetting`, `setLucHaoCast`…) trong `src/state/actions.ts`. Các hàm này test được mà không cần React.

**Lý do:**
- React Context đủ dùng về chức năng, nhưng mỗi thay đổi sẽ render lại toàn bộ cây con của Provider. Muốn tránh thì phải tách
  nhiều Context và `useMemo` thủ công. Store ngoài kèm selector tránh được việc đó, mà vẫn không phải thêm gói nào.
- Lớp lưu trữ (mục 3) chỉ cần `subscribe` vào store, không phải gắn vào cây React.

**Phương án bị loại:**
- *Redux Toolkit / Zustand / Jotai:* trạng thái rất nhỏ, không đồng bộ server. Thêm gói chỉ để làm việc 40 dòng tự viết được.
- *Chỉ dùng React Context:* như phân tích ở trên.
- *Lưu kết quả tính vào store:* dễ lệch với hồ sơ sau khi sửa, và làm khó việc nâng cấp lược đồ dữ liệu.

---

## 3. Lưu trữ cục bộ

**Lựa chọn:** dùng **`@capacitor/preferences` (8.0.x)**. Toàn bộ dữ liệu là **một tài liệu JSON duy nhất**, khoá `lyso.state`:

```ts
interface PersistedState {
  version: 1;                       // tăng khi đổi lược đồ
  profiles: Profile[];
  activeProfileId: string | null;
  settings: Settings;
  tools: { lucHaoLastCast?: LucHaoCast; batTrachHuongCua?: Huong; napAmPair?: [string, string] };
}

// Phase 3.4: LucHaoCast = { tosses: number[6]; castAt: string; method?: 'random' | 'manual'; date?: [d, m, y] }
// (hai trường tuỳ chọn thêm sau, không tăng version vì dữ liệu cũ vẫn hợp lệ)

interface Profile {
  id: string;                       // crypto.randomUUID(), có hàm dự phòng
  name: string;
  gender: 'M' | 'F';
  calendar: 'solar' | 'lunar';      // LƯU ĐÚNG như người dùng nhập; ngày dương lịch được suy ra khi tính
  day: number; month: number; year: number;
  leapMonth: boolean;               // chỉ có nghĩa khi calendar = 'lunar'
  hourIdx: number;                  // 0 = Tý … 11 = Hợi
  lateTy: boolean;                  // giờ Tý muộn → tính sang ngày hôm sau
  relation?: 'self' | 'spouse' | 'child' | 'parent' | 'sibling' | 'other';
  createdAt: string; updatedAt: string;   // ISO
}

interface Settings { theme: 'system' | 'light' | 'dark'; ttsRate: number; ttsPitch: number }
```

Phase 3.5: `batTrachHuongCua` bỏ khỏi `tools` khi chọn "Chưa xét căn nhà cụ thể"; `napAmPair` chỉ lưu khi cả hai người đều là hồ sơ
(nhập tay thì không lưu, vì dữ liệu nhập tay không phải hồ sơ).

- **Nâng cấp lược đồ:** `src/state/migrations.ts` chứa mảng `migrations[v]: (old) => new`. Khi khởi động, app đọc khoá
  `lyso.state` rồi chạy tuần tự từ `version` cũ lên bản mới nhất, kiểm tra hình dạng dữ liệu (hàm `parsePersisted` viết tay,
  trả lỗi rõ ràng), rồi mới render. Dữ liệu hỏng thì giữ một bản sao ở khoá `lyso.state.corrupt-<thời điểm>`, khởi động với
  trạng thái rỗng và báo cho người dùng biết. Không âm thầm xoá.
- **Migration 0 → 1:** nếu chưa có `lyso.state` mà `localStorage` có `lyso-shared-v1` (người dùng bản 0.1 đã nhập ở trang
  legacy chạy trong app, cùng origin), tạo hồ sơ đầu tiên từ dữ liệu đó.
- **Ghi:** gộp các lần ghi trong 300ms, và ghi ngay khi app vào nền (`App` sự kiện `pause`).
- **Sao lưu/khôi phục (Phase 7)** xuất và nhập đúng tài liệu này, gửi đi qua bảng chia sẻ của Android, chọn file bằng `<input type="file">` (không lọc loại file vì Android đổi tên loại tuỳ nơi lưu). Khôi phục cũng chạy qua `migrations`, kiểm thêm ngày có thật của từng hồ sơ, hỏi lại rồi THAY toàn bộ dữ liệu, không gộp.

**Lý do:** dữ liệu chỉ vài KB. Preferences trên Android là SharedPreferences native, không bị dọn khi hệ thống xoá bộ nhớ
WebView, API đơn giản, và có bản web dùng `localStorage` để chạy `npm run dev`. Một tài liệu duy nhất thì ghi trọn vẹn,
dễ nâng cấp và dễ sao lưu.

**Phương án bị loại:**
- *IndexedDB (idb/Dexie):* dữ liệu nằm trong kho của WebView, API bất đồng bộ phức tạp hơn nhiều so với nhu cầu.
- *SQLite (`@capacitor-community/sqlite`):* thêm plugin native và lược đồ SQL cho vài chục bản ghi.
- *Nhiều khoá riêng lẻ:* nâng cấp phải đụng nhiều khoá, có nguy cơ ghi dở dang.
- *Lưu ngày dương lịch đã quy đổi thay cho ngày người dùng nhập:* mất thông tin "nhập âm lịch, tháng nhuận", và sai theo nếu
  sau này phát hiện lỗi đổi lịch.

---

## 4. Giao diện

### 4.1 Cách viết CSS

**Lựa chọn:** CSS thuần.
- `src/ui/tokens.css`: design tokens lấy **nguyên** từ legacy, gồm `--bg --surface --surface2 --surface3 --ink --ink-dim
  --muted --gold --vermillion --jade --blue --line --line-strong --shadow --radius`, có bộ sáng và bộ tối. Bổ sung token
  khoảng cách và cỡ chữ (`--space-1…6`, `--fs-sm/md/lg/xl`), `--tap: 44px`, và token safe-area.
- `src/ui/base.css`: reset và kiểu mặc định.
- Mỗi component một file **CSS Modules** (`*.module.css`), Vite hỗ trợ sẵn.
- **Chủ đề:** dùng thuộc tính `data-theme="light|dark"` trên `<html>` giống legacy. Không có thuộc tính thì theo
  `prefers-color-scheme`. Cập nhật thẻ `theme-color` khi đổi chủ đề.

**Lý do:** token đã có sẵn dưới dạng biến CSS, chép là chạy. Class của legacy (lưới lá số, thẻ trụ, hào quẻ) chuyển gần như
nguyên. CSS Modules tránh đụng tên class mà không cần gói nào.

**Phương án bị loại:**
- *Tailwind:* phải ánh xạ lại toàn bộ token, chép kiểu legacy sang không còn là "chép", thêm bước build và plugin.
- *CSS-in-JS (styled-components, Emotion):* tốn chi phí lúc chạy trong WebView máy yếu, và React 19 không cần.

### 4.2 Font chữ

**Lựa chọn:** dùng font giống legacy, **đóng gói offline** qua `@fontsource` (5.3.x):
- **Be Vietnam Pro** cho chữ thường, các độ đậm 400, 500, 600, 700.
- **Noto Serif** cho tiêu đề và tên sao, quẻ, trụ, các độ đậm 600, 700.
- Chỉ import tập ký tự `latin` + `vietnamese` (file `woff2`), `font-display: swap`. Ước khoảng 300 KB. Đo lại ở Phase 9.

**Lý do:** legacy đang tải hai font này từ Google Fonts, nên app sẽ giống bản web đã quen mắt. Cả hai có đủ dấu tiếng Việt và
giấy phép OFL. Đóng gói offline giữ cam kết "không gửi request mạng" (Phase 8, Data safety).

**Phương án bị loại:**
- *Google Fonts CDN:* có request mạng, và không có font khi offline.
- *Font hệ thống:* chữ có dấu trên một số máy Android cũ hiển thị không đều, và mất bản sắc so với bản web.

---

## 5. Cấu trúc lại `src/core` bằng TypeScript

### 5.1 Chia module

```
src/core/
  calendar/
    julian.ts        INT, jdFromDate, jdToDate (hai biến thể, xem 5.3)
    astro.ts         NewMoon, SunLongitude, getSunLongitude, getNewMoonDay, findSolarTerm
    lunar.ts         getLunarMonth11, getLeapMonthOffset, convertSolar2Lunar, convertLunar2Solar
    solarTerms.ts    TIET, tietBoundariesForYear, lapXuanJD, monthChiFromDate
    timezone.ts      lunarTzForSolarYear, lunarTzForLunarYear
    date.ts          validSolar, validLunar (đổi qua lại để kiểm tra), shiftSolar, pad2
  canchi/
    index.ts         CAN, CHI, mod, yearCanChi, dayCanChi, ngũ hổ độn, ngũ thử độn, HOUR_RANGES
    napamTable.ts    bảng 30 Nạp Âm + napAmLookup (Tử Vi tính Cục và tab Nạp Âm dùng chung)
    hanh.ts          type Hanh = 'Kim' | 'Thuỷ' | 'Mộc' | 'Hoả' | 'Thổ', sinh/khắc
  types.ts           alias chỉ số (CanIdx, ChiIdx, HourIdx), Gender, Quai — không phụ thuộc gì, mọi module dùng chung
  birth.ts           resolveBirth(profile) → { ok: true, solar, lunar, calcDate (sau Tý muộn), input, notes }
                     | { ok: false, errors } — trả MÃ lỗi/ghi chú, câu chữ ở src/content/common/birth.ts
  tuvi/   engine.ts, types.ts
  battu/  engine.ts, types.ts
  luchao/ engine.ts, types.ts, hexagrams.ts (bảng 64 quẻ, Nạp Giáp)
  battrach/ engine.ts, types.ts
  napam/  engine.ts, types.ts
  index.ts           ĐIỂM VÀO DUY NHẤT: xuất hàm và kiểu, không xuất các thứ nội bộ
```

Quy tắc phụ thuộc: `types` ← `calendar` ← `canchi` ← các hệ thống. Các hệ thống không import lẫn nhau. Riêng Tử Vi dùng `napamTable`
trong `canchi`, không dùng `napam/`. `src/core` không được đụng tới DOM, `window`, React hay Capacitor.

### 5.2 Kiểu dữ liệu

- Chỉ số dùng alias đặt tên rõ: `type CanIdx = number`, `type ChiIdx = number` (0 = Tý), `type HourIdx = number`. Hàm tạo
  `asChi(n)` kiểm tra miền giá trị ở biên. Không dùng union literal 0…11 vì phép `mod` làm TypeScript không suy được kiểu.
- Kiểu đầu vào chung: `BirthCalcInput { gender; dd; mm; yy; hourIdx }`, luôn là **ngày dương đã xử lý Tý muộn**.
  `resolveBirth` chịu trách nhiệm quy đổi từ hồ sơ.
- Kiểu đầu ra: `TuViChart`, `BatTuChart`, `LucHaoResult`, `BatTrachResult`, `NapAmYear`, `NapAmRelation`. **Giữ nguyên tên
  trường** như bản JS (`stars`, `phuTinh`, `menhChi`, `daiHan`, `pillars`…) để 23 test vàng chạy không phải sửa, và để chuyển
  câu chữ legacy (vốn đọc các trường này) gần như nguyên văn.
- `index.ts` vẫn xuất `TuViEngine`, `BatTuEngine`… dưới dạng object có kiểu, để tương thích với test. Cạnh đó xuất thêm
  các hàm gọn: `tuViChart(input)`, `batTuChart(input)`, `castHexagram(tosses)`, `menhQuai(year, gender)`, `napAmOfBirth(…)`.

### 5.3 Những chỗ phải giữ đúng như cũ (bẫy khi gộp code)

Gộp các bản sao lại nhưng **không được "sửa cho đẹp"** những điểm sau. Mỗi điểm cần một test khoá hành vi trước khi gộp.

1. **Hai biến thể `jdToDate`.** Bản trong `battrach.js` có `Math.round(jd)` và không xử lý lịch Julius. Bản trong
   `tuvi.js`/`battu.js` thì có. Giữ hai hàm tên khác nhau (`jdToDate` và `jdToDateRounded`).
2. **Thứ tự Ngũ Hành khác nhau giữa các engine.** `battu.js` dùng `HANH5 = [Mộc, Hoả, Thổ, Kim, Thuỷ]`, còn `luchao.js` dùng
   `HANH5 = [Kim, Thuỷ, Mộc, Hoả, Thổ]`. Thay chỉ số bằng `type Hanh` dạng chuỗi ở biên công khai. Bảng chỉ số nội bộ giữ
   trong từng module và đặt tên riêng (`BT_HANH_ORDER`, `LH_HANH_ORDER`).
3. **Múi giờ tiết khí của Bát Tự.** `battu.js` tìm Lập Xuân và các tiết với `TZ = 7` cố định, kể cả năm trước 1968, trong khi
   lịch âm dùng `lunarTzForSolarYear`. Giữ nguyên. Ghi vào mục "Cần đối chiếu" (mục 9) để kiểm với tài liệu sau.
4. **Mốc Lập Xuân của Bát Trạch** so ngày sinh theo quy ước JD giữa trưa, không có giờ. Bát Tự thì cộng độ lệch giờ sinh
   (`HOUR_OFFSET_FROM_NOON`). Hai cách khác nhau là chủ ý của bản gốc. Giữ nguyên.
5. **`calcChart` của Tử Vi nhận `input.tz`** (tuỳ chọn) và mặc định dùng `lunarTzForSolarYear`. Giữ tham số này.

### 5.4 Tách câu chữ khỏi engine

**Lựa chọn:** ba lớp, chỉ phụ thuộc theo một chiều:

```
src/core/      engine: số liệu thuần, không có câu văn cho người đọc
     ↓
src/content/   câu chữ NGUYÊN VĂN từ legacy, dạng hàm thuần: (kết quả engine, ngữ cảnh) → Section[]
     ↓
src/features/  màn hình React: trình bày Section[] và kết quả engine
```

- Engine trả về **mã**, không trả câu. Ví dụ `NapAmEngine.relation()` đổi thành
  `{ cls: 'ok' | 'warn', kind: 'same' | 'sinh' | 'khac' | 'exc-dai-hai-sa-trung' | 'exc-needs', from, to, note? }`.
  Câu văn cũ chuyển nguyên chữ sang `src/content/napam/relation.ts`. Tương tự, `STARS[].desc` chuyển sang
  `src/content/battrach/`. Test vàng cho Nạp Âm hiện chỉ kiểm `.cls`, nên vẫn xanh. Bổ sung test so khớp câu văn.
- **Định dạng câu chữ:** giữ chuỗi có một tập thẻ tối thiểu **chép thẳng từ legacy**, gồm `<b> <i> <small> <br> <ul> <li>`
  (`<small>` thêm ở Phase 3.2 vì tiêu đề "Từng mảng cuộc sống" và ghi chú lưu niên của legacy dùng nó). Hàm
  `parseRich()` trong `src/content/rich.ts` chuyển chuỗi thành cây `RichNode[]` (thẻ ngoài danh sách thì in ra dạng chữ thường).
  React vẽ cây này bằng component `<RichText>` mà **không dùng `dangerouslySetInnerHTML`**. Hàm `toPlainText()` lấy chữ thuần
  để đọc thành lời, làm phụ đề và chia sẻ.
- **Đơn vị nội dung:**
  ```ts
  interface Section { id: string; title: string; blocks: Block[] }
  interface Block   { id: string; rich: RichNode[]; tags?: ContentTag[]; ref?: { palace?: number; hao?: number; pillar?: number } }
  // Phase 3.2: Block là union có `kind` — p | list | verdict (nhãn màu) | item (tiêu đề + nhãn + thân) | chips | note
  // Về sau thêm: kv | bars | swatches | cards | table
  ```
  `id` ổn định (ví dụ `tuvi.explain.cuc`) để Phase 6 trỏ tới. `ref` chỉ ra block nói về cung, hào hay trụ nào, để thầy đọc
  tô sáng đúng chỗ. `tags` để dành cho cờ "không đọc thành lời" ở Phase 6. Danh sách nhãn do Phase 6.1 chốt, nên bây giờ
  chỉ khai báo kiểu `ContentTag = string`.
- `window.LySoInterp` chuyển sang `src/content/interp/` (bảng `STAR`, `PAIRS`, `FAMILY`…) cùng `src/content/<công cụ>/`.
  **Phần nào là tính toán** (độ sáng sao, `tuViYear`, `thapThanProfile`, chấm Vượng Suy, luận đoán Lục Hào, đánh giá nhà)
  thì chuyển vào `src/core/<công cụ>/` và viết test. Phần câu văn ở lại `src/content`.
- **Kiểm "nguyên văn" tự động** (mục 7.1, test đối chiếu): với mỗi hồ sơ mẫu, nạp `docs/legacy/lyso-toolkit.html` trong jsdom, điền form,
  lấy `textContent` của các khối `#tv-explain`, `#tv-tongket`… rồi so với `toPlainText()` của `src/content`. Đây là lưới an
  toàn cho yêu cầu "chuyển nguyên văn, không viết lại".

**Phương án bị loại:**
- *Để câu chữ trong component JSX:* Phase 6 không dùng lại được cho việc đọc và phụ đề, cũng không test riêng được.
- *Lưu HTML thô rồi `dangerouslySetInnerHTML`:* không lấy được chữ thuần một cách tin cậy, khó gắn `ref`/`tags`, và mở cửa
  cho lỗi chèn mã.
- *File JSON hay Markdown cho nội dung:* phần lớn câu legacy là **template có điều kiện** (`${thanTrungMenh ? … : …}`).
  Đưa sang JSON thì phải tự chế một ngôn ngữ template. Hàm TypeScript giữ nguyên logic và câu chữ, lại được kiểm kiểu.

---

## 6. Plugin native (Capacitor 8)

Chỉ cài khi phase cần, không cài sẵn. Phiên bản lấy từ npm ngày 04/11/2026, tất cả đều khai `peerDependencies @capacitor/core >= 8.0.0`.

| Việc | Gói | Phiên bản | Phase | Ghi chú |
|---|---|---|---|---|
| Nút Back, vòng đời app (`pause`/`resume`), thu nhỏ app | `@capacitor/app` | 8.1.x | 2.1 | |
| Lưu cục bộ | `@capacitor/preferences` | 8.0.x | 2.1 | |
| Đọc thành lời (vi-VN) | `@capacitor-community/text-to-speech` | 8.0.x | 5.1 | WebView không có `speechSynthesis`. Trên web dùng `speechSynthesis`. |
| Rung nhẹ | `@capacitor/haptics` | 8.0.x | 3.4 | `impact({ style: Light })` khi gieo xong. Trên web không làm gì. |
| Chia sẻ ảnh kết quả, file sao lưu | `@capacitor/share` + `@capacitor/filesystem` | 8.0.x + 8.1.x | 7.1 | Ghi file vào `Cache/share` rồi chia sẻ URI; lần chia sẻ sau và "Xoá toàn bộ dữ liệu" dọn thư mục này. Ảnh vẽ bằng Canvas 2D (`src/features/share/`), không dùng `html-to-image`: thẻ chỉ có chữ, khỏi nhúng font vào SVG, không thêm thư viện, tính bố cục test được. |
| Giữ màn hình sáng khi đo la bàn | `@capacitor-community/keep-awake` | 8.0.x | 4.2 | |
| Cảm biến la bàn | Plugin nội bộ `LySoDevice` trong `android/`, không thêm gói npm | | 4.2 | Quyết định ở mục 11. |
| Biểu tượng và màn hình chờ | `@capacitor/assets` (dev) | 4.0.x | 8.2 | |

**Lớp bọc nền tảng:** mỗi plugin chỉ được gọi trong `src/platform/<việc>.ts`, ví dụ `tts.ts`, `storage.ts`, `haptics.ts`,
`share.ts`, `back.ts`, `lifecycle.ts`. Mỗi file kiểm `Capacitor.isNativePlatform()` và có bản dự phòng cho web. UI chỉ gọi hàm
trong `src/platform`, nhờ vậy test được bằng giả lập và chạy được `npm run dev`. Lớp `speak(text, { rate, pitch }): Promise<void>`
(Phase 5) nằm ở `src/platform/tts.ts`.

**Giọng đọc chỉ chạy trên máy (Phase 5):** app chỉ dùng giọng `…-local`, không lùi sang giọng mạng. Lý do: cam kết "không gửi dữ liệu đi đâu".
Giọng mặc định `vi-VN-language` báo `localService = true` nhưng log máy ảo cho thấy nó trỏ tới `vi-vn-x-vic-server`, tức có thể đọc qua máy chủ Google,
mà văn bản đọc có ngày sinh và luận giải. Không có giọng trên máy thì hướng dẫn cài. Đánh đổi: máy chưa tải gói tiếng Việt sẽ không đọc được cho tới khi cài.

**Phương án bị loại:**
- *Cài sẵn mọi plugin ngay từ đầu:* thêm quyền và mã native khi chưa dùng, mỗi lần nâng cấp phải rà thêm.
- *`@capacitor/motion` cho la bàn:* chỉ bọc `deviceorientation` thường, không bảo đảm hướng tuyệt đối. Để Phase 4.1 cân nhắc
  cùng các phương án khác.

---

**Giữ màn hình sáng:** chỉ khi thầy đang đọc, tạm dừng hoặc đọc xong thì thôi giữ (`src/platform/keepAwake.ts`). Android dùng cờ `FLAG_KEEP_SCREEN_ON` qua lệnh `keepScreenOn` của `LySoDevicePlugin.java`, trình duyệt dùng Wake Lock.

## 7. Chiến lược kiểm thử

### 7.1 Tự động (chạy bằng `npm test`)

| Lớp | Công cụ | Nội dung |
|---|---|---|
| **Engine** | Vitest, môi trường `node` | 23 test vàng (giữ nguyên file `tests/golden.test.ts`). Thêm ở Phase 1.2: đổi dương → âm → dương khớp nhau 1900–2100 (mẫu mỗi 7 ngày), bảng Tết 2000–2030, Mệnh Quái 2 giới × 100 năm. Phase 3 thêm test cho phần tính toán chuyển từ legacy (độ sáng sao, lưu niên, Vượng Suy, luận đoán Lục Hào). |
| **Nội dung** | Vitest + jsdom | `parseRich` và `toPlainText`. **Test đối chiếu legacy:** chạy `lyso-toolkit.html` trong jsdom với khoảng 10 hồ sơ mẫu (có tháng nhuận, trước 1968, trước Lập Xuân/Tết, Tý muộn), so chữ từng khối. Nếu jsdom không chạy nổi script legacy thì chuyển sang Playwright, đặt ở `npm run test:parity`. |
| **Trạng thái và nền tảng** | Vitest | `actions`, `migrations` (gồm cả dữ liệu hỏng), `parsePersisted`, bảng quy tắc Back, `resolveBirth` (âm lịch, nhuận, Tý muộn qua năm, ngày không tồn tại). |
| **Giao diện** | Vitest + `@testing-library/react` (16.x) + jsdom | Form hồ sơ báo lỗi tiếng Việt như legacy. Lục Hào **giữ quẻ khi đổi việc hỏi**. Chuyển tab không mất trạng thái. Nút chỉ có biểu tượng phải có `aria-label`. |

Quy ước: test engine để trong `tests/`, test của tính năng đặt cạnh file nguồn (`*.test.ts(x)`). Sửa `vite.config.ts`
cho `include` cả `src/**/*.test.{ts,tsx}`. Mặc định chạy môi trường `node`, file nào cần thì khai `// @vitest-environment jsdom`.

### 7.2 Kiểm bằng mắt trên trình duyệt

Sau mỗi màn hình mới: chạy `npm run dev`, mở DevTools ở 360×740, xem cả chế độ sáng và tối, cỡ chữ 130%. Chưa dùng so sánh
ảnh chụp tự động. Phase 9 sẽ xem xét Playwright chụp màn hình để tự soát.

### 7.3 Kiểm thủ công trên máy thật

Phase 9 sẽ đưa danh sách này vào `docs/QA-CHECKLIST.md`:

- Cài APK debug và mở lần đầu khi đang ở chế độ máy bay: phải chạy đủ, font không lỗi.
- Nút Back theo đúng bảng ở mục 1.3, trong cả bảng chọn, màn hình con và trang legacy.
- Thêm 3 hồ sơ (một nhập âm lịch có tháng nhuận), tắt app rồi mở lại: dữ liệu còn nguyên.
- Đọc thành lời: có giọng tiếng Việt và chưa có giọng tiếng Việt; chuyển app vào nền giữa chừng phải dừng đọc.
- La bàn: máy có từ kế và máy không có từ kế, hiệu chỉnh hình số 8, xoay màn hình, so với la bàn thật.
- Chia sẻ ảnh qua Zalo và Messenger.
- Cỡ chữ hệ thống lớn nhất, chế độ tối, máy Android tầm thấp (RAM 2–3 GB).

**Phương án bị loại:**
- *Chỉ dựa vào 23 test vàng:* không bắt được lỗi khi chuyển câu chữ và lỗi giao diện.
- *E2E đầy đủ bằng Appium hay Detox trên Android:* quá nặng cho một người làm. Phần native ít và đã có danh sách kiểm thủ công.

---

## 8. Chừa chỗ cho Phase 6 (Đạo quán & Thầy đọc)

Màn hình Tổng hợp sẽ thành "Tĩnh thất", nơi thầy đọc kết quả. Các quyết định ở trên đã chừa chỗ như sau:

1. **Dữ liệu tách khỏi trình bày.** Phase 6 có thể gọi `buildScript(tool, result, profile)` trực tiếp từ engine
   (`src/core`) và nội dung (`src/content` → `Section[]`), không cần mở màn hình công cụ. Block có `id`, `ref`, `tags`
   (mục 5.4) để thầy trỏ vào đúng cung, hào, trụ và bỏ qua đoạn không đọc.
2. **Component hiển thị nhận `focus`.** Lá số Tử Vi (Phase 3.2) nhận
   `focus?: { palace?: number; lines?: [number, number][] }`. Thẻ trụ Bát Tự và hào Lục Hào nhận `focus` tương tự. Mặc định
   là `undefined`, không ảnh hưởng gì.
3. **Tab Tổng hợp là một route** (`{ name: 'home' }`). Component của nó thay được bằng hành trình + tĩnh thất mà không phải
   sửa thanh tab hay router.
4. **Ngăn xếp trình xử lý Back** (mục 1.3) cho phép Phase 6 thêm quy tắc "Back trong hành trình thì vào thẳng tĩnh thất",
   "Back khi thầy đang đọc thì dừng đọc".
5. **`src/platform/tts.ts`** cung cấp `speak()` trả Promise (Phase 5), để CuePlayer chuyển cue khi đọc xong một đoạn.
   `src/platform/lifecycle.ts` phát sự kiện `pause` để dừng đọc và âm thanh.
6. **Lược đồ có version** (mục 3): Phase 6–7 thêm `settings.entryMode`, `settings.journeySound`, `settings.xungHo`,
   `incense.litAt`… bằng một migration, không phá dữ liệu cũ.
7. **`resolveBirth` và lịch âm dùng chung** cung cấp sẵn ngày âm, tiết khí, can chi hôm nay cho thanh trên của tĩnh thất
   và cho `getAmbience()` (Phase 6.3).

---

## 9. Cần đối chiếu (không chặn Phase 1.2)

Không sửa công thức trong Phase 1.2. Mỗi điểm dưới đây cần đối chiếu `docs/` và viết test chứng minh trước khi đụng tới
(theo `CLAUDE.md`):

- Tiết khí của Bát Tự dùng UTC+7 cả với năm trước 1968 (mục 5.3, điểm 3).
- `appId` hiện là `vn.lyso.app` tạm thời, chốt ở Phase 8.1. Chú thích trong `capacitor.config.ts` còn ghi "Phase 7", sẽ sửa
  khi đụng tới file này ở Phase 8.2.

---

## 10. Thứ tự triển khai Phase 1.2 đến hết Phase 3

Mỗi bước đều phải để `npm test` và `npm run build` xanh rồi mới commit.

### Phase 1.2: engine TypeScript

1. **Khoá hành vi trước khi gộp:** viết test cho 5 điểm ở mục 5.3, cùng test vòng tròn dương → âm → dương, bảng Tết
   2000–2030 (bảng cứng lấy từ lịch chính thức) và Mệnh Quái 2 × 100 năm. Các test này phải xanh với **bản JS hiện tại**.
2. `calendar/*` (gộp 4 bản sao) → cho `tuvi.js`, `battu.js`, `luchao.js`, `battrach.js` import từ đây, chạy test.
3. `canchi/*` (CAN, CHI, can chi năm/ngày, ngũ hổ độn, ngũ thử độn, bảng Nạp Âm) → chạy test.
4. Chuyển từng hệ thống sang `.ts` strict, mỗi hệ thống một commit: `napam` (đổi `relation()` sang trả mã, câu văn sang
   `src/content/napam/relation.ts`) → `battrach` (`desc` sang `src/content`) → `luchao` → `battu` → `tuvi`.
5. `birth.ts` (`resolveBirth`) và `index.ts` có kiểu đầy đủ, bỏ `any`. `quickProfile` dùng `resolveBirth`.
6. Xoá các file `.js` cũ, bỏ `allowJs`. Báo số test trước và sau.

### Phase 2.1: khung app

1. `src/platform/{storage,lifecycle,back}.ts`, `src/state/{store,actions,schema,migrations}.ts` kèm test.
2. `src/ui/tokens.css`, `base.css`, font `@fontsource`, chuyển chủ đề sáng/tối, safe-area.
3. Router + thanh tab dưới + thanh trên (chip người đang xem, ⚙) + bảng quy tắc Back.
4. Màn hình Hồ sơ: danh sách, thêm, sửa, xoá; nhập ngày dương hoặc âm, tháng nhuận, giờ, Tý muộn; báo lỗi giống legacy.
   Thêm migration `lyso-shared-v1`.
5. Tổng hợp đọc từ hồ sơ đang chọn (thay "Tra nhanh"). Các tab chưa dựng thì hiện nút mở trang legacy. Trước khi mở,
   `openLegacy()` ghi hồ sơ đang xem vào `lyso-shared-v1` (định dạng của form "Thông tin dùng chung") để trang legacy tự điền.
6. Kiểm ở 360px, rồi `npm run android:debug`.

### Phase 3: dựng lại từng công cụ

Phase 3.1 (quyết định bố cục lá số Tử Vi) phải xong trước 3.2. Mỗi công cụ đi theo cùng một khuôn:

1. Chuyển phần **tính toán** còn nằm trong legacy vào `src/core/<công cụ>/`, kèm test.
2. Chuyển **câu chữ** vào `src/content/<công cụ>/` (nguyên văn), kèm test đối chiếu legacy.
3. Dựng màn hình trong `src/features/<công cụ>/` (component nhận `focus`), có nút ẩn trang legacy.

Thứ tự công cụ: **3.2 Tử Vi** (lá số + `src/content/interp` dùng chung) → **3.3 Bát Tự** → **3.4 Lục Hào** (+ `haptics`)
→ **3.5 Bát Trạch, Nạp Âm** (+ tab con của Phong thủy, màn hình chọn cặp hợp hôn) → xoá
`public/legacy/lyso-toolkit.html` khỏi app, chuyển bản sao sang `docs/legacy/`. Test đối chiếu sẽ đọc từ `docs/legacy/`.

### Phase 3.1: bố cục lá số Tử Vi (ĐÃ CHỐT 04/11/2026)

**Lựa chọn: phương án C — "lưới gọn + thẻ chi tiết"**, chủ dự án chọn sau khi xem bản mẫu chạy engine thật ở 360px
(ảnh và mã bản mẫu: `docs/design/tuvi-3.1/`).

- **Lưới 4×4 truyền thống** vừa khít chiều rộng 360px (không cuộn ngang). Vị trí 12 cung giữ đúng bảng `order` của legacy
  (`renderChart`: Tỵ ở góc trên trái, Dần góc dưới trái, Hợi góc dưới phải), ô giữa 2×2 là "thiên bàn": tên, giới, ngày âm,
  giờ, can chi năm, Cục, Nạp Âm. Mỗi ô là một `<button>` gồm: Chi (serif đậm), tên cung (vàng), chính tinh (mỗi sao một dòng,
  chấm màu Tứ Hoá như legacy: Lộc `--jade`, Quyền `--gold`, Khoa `--blue`, Kỵ `--vermillion`; không có thì "vô chính diệu"),
  tuổi Đại hạn ở đáy, nhãn **Thân** đầu ô. Phụ tinh và hai vòng KHÔNG hiện trong ô (không đủ chỗ).
- **Cung Mệnh** viền vàng mảnh; **cung đang chọn** viền vàng đậm; ba cung **tam phương tứ chính** (+4, +8 tam hợp, +6 xung
  chiếu) viền ngọc; **đường nối nét đứt** từ tâm cung đang chọn tới ba cung kia (SVG nằm trên thiên bàn, dưới các ô).
  Mặc định chọn cung Mệnh.
- **Thẻ chi tiết** ngay dưới lưới: "Cung X tại Chi · Đại hạn a–b tuổi", nút ‹ › (44px) chuyển cung trước/sau, chính tinh,
  phụ tinh, vòng Trường Sinh · Thái Tuế, tam phương tứ chính. Phase 3.2 thêm độ sáng sao và câu giải thích cung từ
  `src/content/interp`.
- **Nút chuyển "Lá số · Danh sách"** ở đầu màn hình. Danh sách = 12 thẻ dọc bắt đầu từ Mệnh (phương án B), dùng để đọc
  liền mạch và cho trình đọc màn hình.
- **Cỡ chữ** trong ô tính bằng `rem` (0,62–0,85rem); ô cao theo nội dung (`grid-template-rows: auto`), tên sao được xuống dòng
  khi cỡ chữ hệ thống lớn — đã thử 130%: không tràn, không cuộn ngang.
- **Truy cập:** mỗi ô có `aria-label` đầy đủ ("Cung Mệnh tại Thìn, Thiên Cơ, Thiên Lương Hoá Khoa, Đại hạn 3 đến 12 tuổi"),
  `aria-pressed` cho ô đang chọn; chấm Tứ Hoá có chữ ẩn cho trình đọc.
- **Chừa chỗ Phase 6 (mục 8):** component `TuViChartGrid` nhận `selected` + `onSelect` và `focus?: { palace?: number;
  lines?: [number, number][] }`. Khi có `focus` thì thầy đọc điều khiển ô tô sáng và đường nối thay cho người dùng.
- Route: chọn cung là trạng thái cục bộ của màn hình Tử Vi (không đẩy route mới), để Back không phải lùi qua từng cung.

**Phương án bị loại** (ảnh trong `docs/design/tuvi-3.1/` của bản mẫu):
- *A — lưới gốc 720px cuộn ngang:* quen mắt với bản web nhưng trên điện thoại chỉ thấy nửa lá số, mất quan hệ giữa các cung.
- *B — chỉ danh sách 12 cung:* dễ đọc nhưng mất hình dạng lá số truyền thống và quan hệ vị trí; giữ lại làm chế độ phụ.

### Cây thư mục đích (sau Phase 3)

```
src/
  app/        App.tsx, router.ts, routes.ts, TabBar, TopBar
  core/       engine (mục 5)
  content/    rich.ts, interp/, tuvi/, battu/, luchao/, battrach/, napam/, common/ (lời lưu ý văn hoá)
  platform/   back.ts, lifecycle.ts, storage.ts (sau thêm tts.ts, haptics.ts, share.ts, compass.ts)
  state/      store.ts, actions.ts, schema.ts, migrations.ts, selectors.ts
  ui/         tokens.css, base.css, components/ (Button, Segmented, Card, Sheet, RichText, DateField, HourField…)
  features/   home/, profiles/, settings/, tuvi/, battu/, luchao/, phongthuy/{battrach,laban,napam}/
              (Phase 6 thêm journey/, reader/)
tests/        golden.test.ts, calendar.test.ts, parity/ (đối chiếu legacy)
```

---

## 11. La bàn (Phase 4.1, 04/11/2026)

**Lựa chọn:** viết một plugin native nhỏ NGAY TRONG `android/` (`LySoDevice`, tên cũ `LySoCompass`, khoảng 150 dòng Java, đăng ký trong `MainActivity`),
đọc **`TYPE_ROTATION_VECTOR`**. Lớp bọc `src/platform/compass.ts` chọn nguồn theo thứ tự:

1. Android: plugin, `TYPE_ROTATION_VECTOR`.
2. Máy không có con quay: plugin, `TYPE_GEOMAGNETIC_ROTATION_VECTOR`.
3. Trình duyệt (`npm run dev`): sự kiện `deviceorientationabsolute`.
4. Không có nguồn nào, hoặc 3 giây không có dữ liệu: chuyển chế độ xoay tay, kèm thông báo chẩn đoán.

Plugin trả `{ heading, accuracy, headingErrorDeg }`: `accuracy` từ `onAccuracyChanged` của từ kế, `headingErrorDeg` từ `values[4]`
của rotation vector (không có thì `null`).

**Lý do:** rủi ro lớn nhất của la bàn là chỉ sai mà người dùng không biết. Đọc hướng thì WebView làm được, nhưng sự kiện web
KHÔNG cho biết độ tin cậy, nên không thể báo "cần hiệu chỉnh" dựa trên số liệu thật. Chỉ API native có tín hiệu này.

**Đã đo trên máy ảo** (`Medium_Phone`, WebView 149, app chạy ở `https://localhost`):
- `deviceorientationabsolute` có chạy trong WebView của Capacitor, `absolute=true`, khoảng 60 lần/giây, không cần xin quyền.
  `deviceorientation` thường trả `absolute=false` và không phải hướng Bắc, nên không được dùng thay thế (bản legacy có đường lùi này).
- Đo khi đã ổn định ở hai hướng giả lập: Bắc 0,0° và Đông 90,0°. Nam và Tây chỉ đo sau 2,5 giây, chưa kịp ổn định (166,5° và 256,9°).
  Sau khi đổi từ trường đột ngột cần khoảng 8 giây để hội tụ
  (+1s 48°, +2s 73°, +4s 87,5°, +8s 90°). Khi đó con quay đứng yên nên chỉ từ kế kéo dần về; trên máy thật xoay máy có con quay, phải đo lại.
- `navigator.wakeLock` có sẵn, nên giữ màn hình sáng không cần thêm plugin.
- Máy ảo chỉ chứng minh luồng dữ liệu và phép tính, KHÔNG nói được độ chính xác trên máy thật.

**Các điểm xét:**
- **Bắc từ hay Bắc thật:** dùng **Bắc từ**, không cộng độ từ thiên. Rotation vector vốn trả Bắc từ, la kinh phong thủy cũng đo theo kim
  từ, độ từ thiên ở Việt Nam chỉ khoảng −1° đến 0°, và tính độ từ thiên cần vị trí, tức phải thêm quyền. Ô hiệu chỉnh độ lệch vẫn giữ (±45°).
- **Máy không có từ kế:** `getDefaultSensor` trả `null` thì báo rõ và chuyển xoay tay. Không dùng `GAME_ROTATION_VECTOR` vì không có Bắc.
- **Hiệu chỉnh hình số 8:** `accuracy` thấp hoặc không tin cậy, hoặc `headingErrorDeg > 15`, thì hiện hướng dẫn và làm mờ số độ, nhưng không tắt la bàn.
  Ngưỡng 15° là tạm, chốt sau khi đo trên máy thật.
- **Nhiễu từ trường:** thử trên S25 Ultra (05/11/2026): để gần loa, kim loại không hiện cảnh báo, vì hai số trên do máy tự báo và không đủ. Plugin gửi thêm `fieldUT`,
  độ lớn từ trường của `TYPE_MAGNETIC_FIELD`; ngoài 25–65 µT thì báo nhiễu, làm mờ số độ, không tắt la bàn. Ngưỡng là tạm, số µT hiện trên màn hình để đo.
- **Xoay màn hình:** app không khoá chiều dọc. Plugin dùng `remapCoordinateSystem` theo `Display.getRotation()`. Máy dựng đứng thì azimuth
  mất ổn định, nên có nhắc đặt máy nằm ngang.
- **Pin:** `SENSOR_DELAY_UI`, gửi lên JS tối đa 15 lần/giây, chỉ đăng ký khi đang ở tab La Bàn và chế độ cảm biến; huỷ khi rời tab hoặc `pause`.
- **Lọc nhiễu:** bộ lọc hàm mũ trên vòng tròn (trung bình sin/cos để qua được mốc 359° → 0°), viết thành hàm thuần ở `src/core` kèm test.
- **Quyền và dữ liệu:** không thêm quyền Android, không cần vị trí. Cam kết "không gửi dữ liệu đi đâu" giữ nguyên.

**Phương án bị loại:**
- *Chỉ dùng `deviceorientationabsolute`:* ít code nhất và đọc hướng đúng, nhưng không có độ tin cậy. Đây là phương án dự phòng nếu plugin gặp vấn đề.
- *`@capgo/capacitor-compass` (8.1.x):* đã đọc mã nguồn: tự tính từ gia tốc kế và từ kế thô, không qua hợp nhất cảm biến nên không có con quay giữ
  ổn định, và không có sai số hướng. Thêm một gói ngoài mà chất lượng kém hơn cả sự kiện web.
- *`@capacitor/motion`:* không bảo đảm hướng tuyệt đối (mục 6).

**Kế hoạch kiểm thử trên máy thật (điều kiện để coi 4.2 là xong).** Tối thiểu 2 máy: một máy tầm trung Android cũ, một máy mới.

| # | Kiểm | Đạt khi |
|---|---|---|
| 1 | So với la bàn vật lý hoặc Google Maps ở 8 hướng, máy nằm ngang, ngoài trời, xa kim loại | Lệch ≤ 5° |
| 2 | Xoay máy nhanh 90° | Kim theo kịp trong 1 giây, không vọt lố quá 5° |
| 3 | Đặt yên 30 giây | Dao động ≤ 2° |
| 4 | Đặt cạnh loa hoặc vật kim loại lớn | Hiện cảnh báo, không im lặng chỉ sai |
| 5 | Vẽ hình số 8 sau khi bị nhiễu | Cảnh báo tự mất |
| 6 | Xoay ngang máy | Hướng vẫn đúng |
| 7 | Vào nền rồi quay lại | Cảm biến dừng khi ở nền, chạy lại khi về |
| 8 | Để đo liên tục 10 phút | Màn hình sáng, máy không nóng bất thường, pin tụt hợp lý |
| 9 | Máy không có từ kế, nếu kiếm được | Báo rõ, tự chuyển xoay tay |

**Đã kiểm trên máy ảo sau khi dựng (Phase 4.2):** plugin đăng ký và chạy; 4 hướng giả lập ra 360,0° · 89,6° · 178,6° · 268,7°, `accuracy` = 3, `tilted` = false;
khoảng 10 lần/giây; vào nền dừng hẳn, quay lại chạy tiếp. Chưa kiểm được: `headingErrorDeg` thật (máy ảo trả 0), cảnh báo nhiễu, xoay ngang, và cả 9 phép thử trên.
Trên web, trạng thái "bị chặn quyền" gộp chung vào "không có dữ liệu"; trong app Android không có quyền cảm biến nên không có trường hợp này.

---

## 12. Đạo quán & Thầy đọc (Phase 6.1, 05/11/2026)

> Quyết định chưa viết code. Mỗi mục nêu **Lựa chọn**, **Lý do**, **Phương án bị loại**. Ba điểm cần chủ dự án duyệt nằm ở cuối mục 12.11.

### 12.1 Hành trình 5 trạm

**Lựa chọn:** 5 trạm theo thứ tự, mỗi trạm tối đa 4 lớp ảnh. Vuốt lên hoặc chạm để bước tới; nút "Bỏ qua" luôn hiện.

| Trạm | Lớp (xa → gần) | Hạt | Tương tác |
|---|---|---|---|
| `gate` cổng nguyệt môn | trời · tường và cổng tròn · cây hai bên · khung lá gần | lá rơi | Bước tới; đạo đồng chào một câu |
| `garden` sân vườn | trời · mái xa · hồ · bờ đá và cây | gợn nước, đom đóm tối | Bước tới |
| `hall` điện Tam Thanh | nền tối · ban thờ ở xa · cột và ánh nến · ngưỡng cửa | khói hương | Thắp hương TUỲ CHỌN, nút "Đi tiếp" luôn nằm cạnh |
| `corridor` hành lang | tường · cửa bức bàn · cột · đèn lồng gần | khói nhẹ | Đạo đồng mời vào, chạm để vào |
| `study` tĩnh thất | tường và giá sách · cửa sổ · án thư · đèn dầu | khói nhẹ | Trạm cuối, là màn hình chính |

**Lý do:** 4 lớp là đủ để có chiều sâu mà vẫn giữ ngân sách 12.4. Không trạm nào bắt buộc tương tác, để người chỉ muốn xem kết quả không bị chặn.

**Phương án bị loại:** *Bắt buộc thắp hương mới được đi tiếp:* biến nghi thức thành cửa chặn, và dễ bị hiểu là điều kiện để được xem. *Thế giới 3D:* vượt ngân sách và sai yêu cầu 2D parallax.

### 12.2 Quy tắc rút gọn

**Lựa chọn:** hàm thuần `entryPlan(settings, history, lunarToday, reducedMotion)` trả `full | short | none | fade`, xét theo thứ tự:

1. Cài đặt "Không có" → `none`.
2. `prefers-reduced-motion` → `fade` (chỉ mờ dần vào tĩnh thất), không phụ thuộc các mục sau.
3. Cài đặt "Đầy đủ" hoặc "Rút gọn" → đúng như vậy.
4. Cài đặt "Tự động" (mặc định): lần mở đầu tiên, hoặc hôm nay là rằm (15 âm), mùng 1, hoặc Tết (mùng 1–3 tháng Giêng) và hôm nay chưa chạy bản đầy đủ → `full`, 20–30 giây.
5. Còn lại → `short`, 2–3 giây.

Nút "Bỏ qua" luôn hiện. Back trong hành trình vào thẳng tĩnh thất. Khi đang có đường dẫn trực tiếp tới công cụ thì không chạy hành trình.

**Âm thanh và chế độ im lặng:** Web Audio phát trên kênh media nên KHÔNG tự tắt theo chế độ im lặng của máy, và WebView không đọc được chế độ này. Vì vậy thêm hàm `ringerMode()` vào plugin nội bộ
(`LySoDevice`, gọi `AudioManager.getRingerMode()`). Máy đang im lặng hoặc rung thì không phát nhạc nền. Thầy đọc vẫn đọc vì đó là hành động người dùng tự bấm.

**Phương án bị loại:** *Luôn đầy đủ:* người mở app mỗi ngày sẽ khó chịu. *Đầy đủ theo số lần mở:* không gắn với lịch nên mất ý nghĩa nghi lễ.

### 12.3 Biến thể theo lịch

**Lựa chọn:** `getAmbience(now)` trả `{ timeOfDay, season, lunarEvent }`, lấy từ `src/core`. Giờ theo đồng hồ máy; lịch âm dùng UTC+7.

| Trục | Giá trị | Mốc | Hiển thị |
|---|---|---|---|
| `timeOfDay` | `dawn` 05–10h · `noon` 10–16h · `dusk` 16–19h · `night` 19–05h | giờ máy | Lớp phủ màu; `night` thêm đom đóm và đèn sáng hơn |
| `season` | `xuan` · `ha` · `thu` · `dong` | Chi tháng theo tiết (`monthChiFromDate`): Dần–Thìn, Tỵ–Mùi, Thân–Tuất, Hợi–Sửu; đổi đúng ở Lập Xuân, Lập Hạ, Lập Thu, Lập Đông | Xuân hoa đào, Hạ sen trên hồ, Thu lá vàng, Đông cành khô và sương |
| `lunarEvent` | `ram` · `mung1` · `tet` · `null` | ngày âm: 15 · 1 · 1–3 tháng Giêng; `tet` ưu tiên hơn `mung1` | `ram` trăng tròn · `mung1` thêm khói hương · `tet` câu đối đỏ, đèn lồng đỏ |

Lưu ý: `seasonOfMonthChi` của Lục Hào trả cả `tuquy` nên KHÔNG dùng lại ở đây; bốn mùa của cảnh là một bảng riêng.

**Lý do:** dùng lớp phủ và vài lớp phụ thay vì vẽ lại 5 trạm × 4 giờ × 4 mùa, tức 80 bộ ảnh, không thể vừa 3 MB.

### 12.4 Kỹ thuật và ngân sách

**Lựa chọn:**
- Parallax bằng CSS `transform` chạy qua `requestAnimationFrame`, chỉ đổi `transform` và `opacity`.
- Hạt (khói, lá, đom đóm, gợn nước) bằng canvas 2D, tự giảm số hạt khi fps < 50.
- Nhân vật dùng **Lottie**, gói `lottie_light`.

| Tiêu chí | Lottie (`lottie_light` 5.13) | Rive (`@rive-app/canvas-lite` 2.49) |
|---|---|---|
| Runtime đo được | 365 KB, gzip **72 KB** | JS 539 KB + wasm 849 KB, wasm gzip riêng **350 KB** |
| State machine | Không có, tự chuyển bằng `playSegments` | Có sẵn |
| Trong WebView | JS thuần, không wasm, không `eval` ở bản light | Cần nạp wasm cục bộ |
| Người vẽ | Xuất từ After Effects, dễ tìm người làm | Cần công cụ riêng của Rive |

**Lý do:** nhân vật chỉ có 5 trạng thái rời (idle, talk, point, turnPage, nod) và không cần lip-sync, nên state machine của Rive chưa đáng so với runtime lớn gấp nhiều lần. Điểm yếu của `lottie_light` là vẽ SVG: file nhiều nét sẽ nặng trên máy yếu. Vì vậy giới hạn 400 nét mỗi nhân vật, và 6.6 phải đo trên máy thật; không đạt thì đổi sang Rive mà không đổi `Cue`.

**Ngân sách tối đa 3 MB (ảnh + âm thanh):**

| Hạng mục | Tính toán | Dung lượng |
|---|---|---|
| Ảnh 5 trạm, WebP rộng 720px | nền 120 KB + 3 lớp × 60 KB = 300 KB mỗi trạm | 1.500 KB |
| Lớp phụ theo mùa, rằm, Tết | 8 lớp × 25 KB | 200 KB |
| Âm thanh mono 96 kbps | 4 vòng lặp 10 giây + 2 tiếng ngắn | 600 KB |
| Thầy và đạo đồng | 2 file JSON | 150 KB |
| **Tổng** | còn dư 550 KB | **2.450 KB** |

**Cách đo:** Chrome Performance ở 360px, CPU throttle 4×, rồi `adb shell dumpsys gfxinfo vn.lyso.app` trên một máy Android tầm thấp thật. Đạt khi 95% khung hình ≤ 16,7 ms. Có test CI cộng dung lượng `src/assets/journey`, vượt 3 MB thì đỏ.

**Phương án bị loại:** *WebGL hoặc game engine:* quá tay với 2D parallax. *Video nền:* không đổi được theo giờ, mùa và quá nặng. *Rive:* như trên, giữ làm phương án dự phòng.

### 12.5 Cấu hình cảnh

**Lựa chọn:** cảnh là dữ liệu, ở `src/features/journey/scenes.ts`:

```ts
interface SceneLayer { src: string; depth: number; variants?: Partial<Record<VariantKey, string>>; overlay?: boolean }
type VariantKey = TimeOfDay | Season | Exclude<LunarEvent, null>;
interface Scene {
  id: 'gate' | 'garden' | 'hall' | 'corridor' | 'study' | (string & {});
  layers: SceneLayer[];            // depth 0 = xa nhất, 1 = gần nhất
  particles?: ParticleSpec[];
  ambience: AmbienceTrack[];
  interaction?: 'step' | 'incense' | 'invite';
  durationMs: { full: number; short: number };
}
```

**Lý do:** thêm trạm hoặc thay tranh thật chỉ sửa dữ liệu, và test được máy trạng thái không cần ảnh. **Phương án bị loại:** *Mỗi trạm một component:* thay tranh là phải sửa code.

### 12.6 Persona thầy

**Lựa chọn:**
- **Tên gọi:** chỉ là "Thầy" và "đạo đồng", không họ tên, không đạo hiệu. Đạo quán cũng không có tên riêng. Cách này tránh trùng người hay nơi có thật.
- **Giọng văn:** mộc, từ tốn, câu ngắn. Giảng như người thầy chỉ cho học trò: "con xem ở đây…". Không hù doạ, không hứa hẹn, không phán quyết.
- **Xưng hô:** thầy luôn tự xưng "thầy". `xungHo(profile, settings)`:

| Tuổi của người được gọi | Nam | Nữ |
|---|---|---|
| Dưới 40, hoặc chưa sinh | con | con |
| 40–54 | anh | chị |
| Từ 55 | chú | cô |

`settings.xungHo` ghi đè được: `tu-dong`, `con`, `anh`, `chi`, `co`, `chu`, `ban`.

**Điểm cần xử lý:** người cầm máy có thể đang xem hồ sơ của người khác. Khi `relation` khác `self` và không để trống, thầy nói ở ngôi thứ ba ("lá số của {tên}"), không gọi hồ sơ đó là "con". Mẫu câu luôn có hai biến thể.

**Lý do:** ngôi xưng sai với người lớn tuổi rất dễ gây khó chịu ở tiếng Việt, nên phải sửa được. **Phương án bị loại:** *Đặt tên riêng cho thầy:* dễ trùng người thật, lại không thêm giá trị. *Luôn gọi "con":* thiếu lễ với người lớn tuổi.

### 12.7 Kịch bản đọc

**Lựa chọn:**

```ts
interface Cue {
  id: string;
  text: string;          // ≤180 ký tự, đã chuẩn hoá cho TTS; rỗng = cue im lặng
  caption?: string;      // chữ gốc NGUYÊN VĂN để hiện phụ đề
  focus?: { palace?: number; hao?: number; pillar?: number; huong?: Huong; lines?: [number, number][] };
  gesture?: 'idle' | 'point' | 'turnPage' | 'nod';
  pauseAfterMs?: number;
}
```

Bổ sung so với brief: `focus` có thêm `hao`, `pillar`, `huong` vì Lục Hào, Bát Tự, Bát Trạch không có cung.

`buildScript(tool, ctx)` là hàm thuần, không gọi engine lần hai, ghép theo thứ tự: câu mở → lời dẫn + kết quả chính → lời dẫn + Tổng kết → câu kết.

| Công cụ | Nguồn dựng cue | `focus` |
|---|---|---|
| Tử Vi | ô tóm tắt, `tuViTongKet` | cung Mệnh, tam phương tứ chính |
| Bát Tự | ô tóm tắt, `batTuVuongSuy`, `batTuTongKet` | trụ ngày, trụ tháng |
| Lục Hào | `lucHaoVerdict`, `lucHaoTongKet` | hào Thế, Dụng Thần |
| Bát Trạch | `batTrachSummary`, `batTrachTongKet` | 4 hướng tốt |
| Nạp Âm | `napAmPersonCells`, `napAmTongKet` | không |

KHÔNG đọc phần "Giải thích chỉ số": quá dài cho lời nói, vẫn xem được trên màn hình. Lời dẫn là bộ mẫu câu có biến, KHÔNG sinh tự do. Câu luận giải dùng lại nguyên `Section[]`, chia bằng `chunkSpeech`.

**Trình phát `CuePlayer`:** chuyển cue khi `speak()` resolve. Đọc/Dừng, ⏮/⏭ đổi cue ngay. "Nói chậm lại" nhân tốc độ với 0,85 từ cue kế tiếp. Cue im lặng dừng theo độ dài chữ (khoảng 15 ký tự/giây, tối thiểu 3 giây) và ⏭ qua được. Dừng khi rời màn hình hoặc app vào nền, dùng chung `stopReading`.

**Lưu ý:** bản giữ chỗ dùng được ngay, nhưng phải thử trên máy thật: nếu `speak()` im lặng lâu khi thiếu gói giọng (PROGRESS, Phase 5.1) thì `CuePlayer` phải có thời gian chờ, không được treo.

**Phương án bị loại:** *AI sinh lời dẫn:* cần mạng, và không kiểm soát được câu chữ. *Viết lại luận giải cho hợp giọng thầy:* phá nguyên tắc nguyên văn, và test đối chiếu mất tác dụng.

### 12.8 Nội dung không đọc thành lời

**Lựa chọn:** lọc theo **từng câu, bằng từ điển**, tại `src/content/noSpeech.ts`, chạy khi dựng cue:

```ts
export const NO_SPEECH_TERMS = ['tai nạn', 'bệnh', 'ốm', 'tuổi thọ', 'trường thọ', 'chết', 'tử vong', 'qua đời', 'kiện tụng', 'kiện cáo',
  'ly hôn', 'ly dị', 'ly thân', 'tai hoạ', 'tai ương', 'hoả hoạn', 'tổn hại', 'mổ', 'phẫu thuật', 'tang lễ'];
```

Câu dính từ cấm: `text` rỗng, `caption` là chữ gốc kèm lời "(Phần này con xem chữ trên màn hình)". Thêm thẻ `no-speech` ở block cho trường hợp từ điển không bắt được. Từ so khớp nguyên từ, không phân biệt hoa thường.

**Đã quét `src/content`:** "kiện tụng" 5 lần, "tai hoạ" 3, "bệnh" 3, "tai nạn" 2, "hoả hoạn" 1, "ốm" 1, "trường thọ" 1, "đổ vỡ" 1; không có "chết", "ly hôn", "tuổi thọ". Tập trung ở mô tả sao Du Niên (Tuyệt Mệnh, Lục Sát, Ngũ Quỷ, Diên Niên), Lục Hào, sao Kình Dương.
- **Không cấm "sức khoẻ":** xuất hiện 17 lần, phần lớn mang nghĩa tốt ("tốt cho giấc ngủ, sức khoẻ"). Câu xấu về sức khoẻ của Tuyệt Mệnh bị bắt qua "tổn hại".
- **Không cấm "tang", "tù", "tử":** là tên Tang Đố Mộc, trạng thái Tù và Tử của Vượng Suy, Tử Tôn. Cấm sẽ làm hỏng cả bảng.

**Thầy không bao giờ** gợi ý cúng giải hạn, mua vật phẩm, hay nói "phải làm thế này mới tránh được". Test 6.5 quét mẫu câu tìm các từ này. Câu mở và câu kết luôn có lời nhắc văn hoá, câu chuẩn: **"Số là tham khảo, đức năng thắng số."**

**Áp dụng cho cả nút "Đọc kết quả" của Phase 5:** nút đó hiện đang đọc cả các câu này. 6.5 cho `sectionsSpeech` dùng chung bộ lọc, để một quy tắc áp dụng ở mọi nơi.

**Lý do chọn từ điển:** phần lớn câu là mẫu có điều kiện với rất nhiều tổ hợp, gắn thẻ tay từng chuỗi sẽ sót, và phải sửa file câu chữ nguyên văn. Từ điển giữ nguyên chuỗi và test được cả danh sách. **Phương án bị loại:** *Chỉ gắn thẻ tay:* như trên, và `ListBlock` chỉ gắn được cả danh sách, không gắn được từng mục. *Bỏ hẳn các câu đó:* mất nội dung, và phá nguyên tắc nguyên văn.

**Liên quan chính sách Google Play** (đọc ngày 05/11/2026): Inappropriate Content cấm kích động thù ghét theo tôn giáo và trục lợi từ sự kiện nhạy cảm; Health Content and Services cấm tuyên bố sức khoẻ sai lệch. Không tìm thấy điều riêng về tử vi hay chiêm tinh. Bài báo về Co-Star cho thấy rủi ro có thể đến từ quy định metadata, nên mô tả trên Play phải tránh lời hứa dự đoán. Phase 8.1 cần đọc lại toàn văn: Google đổi chính sách thường xuyên, và đây không phải tư vấn pháp lý.

### 12.9 Giọng đọc

**Lựa chọn:** TTS trên máy, chỉ giọng `…-local` (mục 6). Thầy đọc bằng cao độ 0,85 và tốc độ 0,9 nhân với cài đặt của người dùng. Chọn giọng trầm trong các giọng `-local` sau khi nghe trên máy thật.

**Lý do:** giữ cam kết Data safety. **Phương án bị loại:** *Giọng đám mây:* gửi dữ liệu ra ngoài. *Thu âm sẵn:* không thể với nội dung động, và vượt ngân sách.

### 12.10 Thể hiện Tam Thanh

**Lựa chọn:**
- Tượng cách điệu, ở xa, ánh nến mờ, không rõ nét mặt. Không chạm vào tượng được và không phóng to.
- Thắp hương chỉ là tưởng niệm. Không gắn với "tăng vận", không tính điểm, không huy hiệu, không vật phẩm trả phí.
- Đạo quán hư cấu, không vẽ lại nơi có thật, không dùng kinh văn hay phù chú thật làm hoạ tiết.
- Không có câu nào ngụ ý thắp hương làm kết quả tốt hơn; kết quả đọc giống hệt dù có thắp hay không.

**Phương án bị loại:** *Bán hương hoặc vật phẩm:* đúng thứ brief cấm, và rủi ro chính sách. *Không có điện thờ:* mất tinh thần đạo quán mà chủ dự án muốn.

### 12.11 Lưu trữ, bố cục và thứ tự triển khai

**Lưu trữ:** tăng `SCHEMA_VERSION` lên 2, migration thêm `settings.entryMode` (`auto | full | short | none`, mặc định `auto`; thêm `auto` ở Phase 6.2 vì nếu mặc định là `full` thì quy tắc rút gọn không bao giờ chạy), `settings.journeySound` (mặc định bật), `settings.xungHo` (mặc định `tu-dong`), `tools.incenseLitAt?`, `tools.journey?: { firstDone: boolean; lastFullDate?: string }`.

**Tĩnh thất ở 360px:**

```
┌──────────────────────────────┐
│ 16/9 Bính Ngọ · hồ sơ · ⚙    │  thanh trên
├──────────────────────────────┤
│   giá sách        cửa sổ     │
│        [ Thầy ]              │
│ ────────── án thư ────────── │
│ lá số · thẻ tre · xu · la bàn│  đồ vật chạm được, vùng ≥ 44px
│ sách cổ · sổ tổng hợp        │
├──────────────────────────────┤
│ phụ đề (tối đa 3 dòng)       │
│ ⏮  ⏯ Thầy đọc  ⏭  🐢         │
├──────────────────────────────┤
│ thanh tab dưới               │
└──────────────────────────────┘
```

**Bổ sung so với brief 6.4:** brief thay màn hình Tổng Hợp bằng Tĩnh thất nhưng không có đồ vật nào cho phần Tổng Hợp đầy đủ vừa dựng (Phase 3.5b). Vì vậy thêm "sổ tổng hợp" trên án thư, mở route `{ name: 'tonghop' }` là nội dung `HomeScreen` hiện tại.

| Bước | Nội dung | Tiêu chí xong |
|---|---|---|
| 6.2 | SceneEngine, hạt, ảnh giữ chỗ, `entryPlan`, Back, cài đặt Lối vào, migration v2 | Test máy trạng thái và rút gọn xanh; báo fps với throttle 4× và tổng dung lượng |
| 6.3 | `getAmbience`, biến thể, âm thanh theo lớp, `ringerMode` | Test các ngày rằm, mùng 1, Tết, Lập Xuân, 23h59/00h00; im lặng thì không có tiếng |
| 6.4 | Tĩnh thất, đồ vật, form hồ sơ thoại hoá | Mọi đồ vật có nhãn aria; không cuộn ngang ở 360px; vẫn dùng được thanh tab |
| 6.5 | `noSpeech`, `xungHo`, `buildScript`, `CuePlayer`, nối `focus` | 5 test của brief xanh; thêm test không có câu cúng giải hạn, mua vật phẩm |
| 6.6 | Nhân vật Lottie, an sao, gieo xu, thắp hương | Đo fps trên máy thật; quay lại sau 20 phút thấy hương tàn; kết quả không đổi khi thắp hương |
| 6.7 | Viết đủ mẫu câu | Chủ dự án đọc duyệt; test 6.5 vẫn xanh |
| 6.8 | `docs/ART-BRIEF.md` | Chủ dự án gửi được cho hoạ sĩ, tên file khớp cấu hình Scene |

**Điều kiện chặn:** 6.5 cần kết quả nghe giọng đọc trên máy thật; 6.6 cần một máy Android tầm thấp để đo. 6.2–6.4 có thể làm trước.

**Chủ dự án đã duyệt (05/11/2026):**
1. Danh sách từ cấm ở 12.8, gồm việc KHÔNG cấm "sức khoẻ", áp dụng cả cho nút "Đọc kết quả".
2. Bảng xưng hô ở 12.6, giữ các mốc 40 và 55 tuổi.
3. Dùng Lottie; không đặt tên riêng cho thầy và đạo quán.
4. Thêm mục chọn giọng trong Cài đặt: liệt kê giọng `-local`, có nút nghe thử (bổ sung cho 12.9).

## 13. Xem chỉ tay (chốt cách nhập liệu 05/11/2026)

Căn cứ nội dung: `docs/CHI-TAY.md`, `docs/palm-content.vi.json`. Thứ tự bước: `docs/PROMPT-KIT-CHI-TAY.md`. Mục này là quyết định cho bước 3B.1, các ý còn lại của 3B.1 sẽ bổ sung khi có số đo.

**Cách nhập liệu: máy đo trước, phần còn lại hỏi bằng câu ngắn** (phương án (c) của kit, có giới hạn).
- Lý do: nhiều người không tự tin khi tự so với hình mẫu, nên bỏ phương án (a), (b). Nhưng ảnh lòng bàn tay không trả lời được hết 32 câu ở CHI-TAY §11, nên không thể tự động hoàn toàn.
- Máy đo được khá chắc: Q04, Q08–Q12. Cần số đo mới biết: Q17, Q20, Q21, Q23. Khó, chưa làm ở bản đầu: Q18, Q19, Q22, Q24–Q29, Q32. Phải hỏi: Q01–Q03, Q05–Q07, Q13–Q16, Q30, Q31.
- Máy vẽ đường và đặc điểm đã đo lên ảnh để người dùng xác nhận. Không chắc thì để trống, không đoán.
- Câu còn lại luôn có "Không rõ"; `analyzePalm` phải chạy được khi thiếu câu trả lời.
- Phương án bị loại: gửi ảnh lên máy chủ AI, vì phá cam kết không gửi dữ liệu đi đâu.

**Mô hình:** MediaPipe Hand Landmarker (`@mediapipe/tasks-vision`, Apache-2.0) cho 21 điểm bàn tay, lọc đường vân tự viết cho 3 đường chính. Đóng gói trong app, nạp lười. APK tăng khoảng 10 MB. Giấy phép của file mô hình cần kiểm tra trước khi đóng gói.

**Cửa kiểm chứng:** bản thử ở `spike/chitay/` (không commit) đo trên khoảng 30 ảnh thật. Chỉ làm tính năng khi: từ 80% ảnh tốt đúng cả 3 đường, phân loại đủ tốt để không luận sai, dưới 5 giây trên S25 Ultra, và ảnh kém được báo "không chắc".

**Ảnh tay:** bản đầu đề xuất không lưu ảnh, chỉ lưu kết quả; chủ dự án chưa chốt.

**Mã nguồn và nội dung:** dùng tên `palm` (`src/core/palm`, `src/content/palm`). Câu chữ chỉ tay là nội dung mới, không chép nguyên văn sách. `V19`, `V26`, `N04` ẩn cho tới khi đối chiếu xong với sách.
