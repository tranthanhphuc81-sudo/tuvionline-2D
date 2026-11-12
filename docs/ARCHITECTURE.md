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
- `appId` hiện là `vn.lyso.app` tạm thời, phương án và đề xuất ở `docs/RELEASE.md` mục 1, chờ chủ dự án chốt. Chú thích trong `capacitor.config.ts` còn ghi "Phase 7", sẽ sửa
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

**Người đọc chọn được (10/11/2026):** 10 nhân vật cùng một khung Lottie (`scripts/characters-personas.mjs`, khoảng 15 KB mỗi file, chỉ nạp file đang dùng), màu áo đổi lúc chạy theo tên lớp `robe`/`robeHi`/`robeFold` (không sinh mỗi màu một file), hoặc ảnh người dùng tự chọn (thu về 320 px, lưu ở khoá `lyso.reader.photo` ngoài `lyso.state` nên không vào file sao lưu). **Tách nền (10/11/2026):** lúc chọn ảnh, MediaPipe Selfie Segmenter (`public/palm/selfie_segmenter.tflite`, ~250 KB, dùng chung WASM với chỉ tay, chạy trên máy) tách người ra khỏi nền, lưu bản nền trong suốt 300 × 330 ở khoá `lyso.reader.cutout` để người đứng tự do ở Tĩnh thất như nhân vật vẽ sẵn (`src/features/reader/cutout.ts`). Không tách được thì chỉ có khung tròn; người dùng chọn giữ khung tròn qua `readerCustom.frame` (tuỳ chọn, không cần migration). **Ghép mặt (11/11/2026):** thêm MediaPipe Face Detector (`public/palm/blaze_face_short_range.tflite`, ~230 KB) để cắt riêng cái đầu (mặt và tóc theo mặt nạ người, nửa dưới cắt bầu dục ôm cằm, xoay thẳng hai mắt) vào khung 200 × 240 cố định, lưu ở khoá `lyso.reader.head`. Lúc chạy, `withFace` (Character.tsx) bỏ nét vẽ trong lớp `đầu` của file Lottie và thêm một lớp ảnh gắn (parent) vào lớp đó, nên đầu ảnh nghiêng, gật theo nhân vật; thân là Thầy (giọng nam) hoặc Cô đồ (giọng nữ), áo đổi màu như nhân vật vẽ sẵn. Cách hiện lưu ở `readerCustom.look` (`stand`/`frame`/`face`, thay cho `frame` cũ vẫn đọc được); thiếu bản ảnh nào thì lùi về bản có. **Ảnh cử động (11/11/2026):** từ hai mắt và miệng của Face Detector, `cutout.ts` tách thêm cho cả bản đứng tự do lẫn bản cái đầu: ảnh `upper` (ảnh gốc, riêng chỗ miệng dưới đường môi tối dần thành lòng miệng), ảnh `jaw` (riêng hàm dưới, đè đúng chỗ cũ, mép trên cắt theo đường môi: khe tối trên cùng theo tương phản cục bộ, dò từng cột rồi khớp parabol nên cong theo môi thật; trong lòng miệng vẽ răng dưới ở đáy khe, và răng trên nếu ảnh chưa có, màu lấy từ răng hoặc da trong ảnh) và chỗ đặt mí mắt (màu da lấy ở má), lưu chung một JSON ở khoá `lyso.reader.anim`. Ghép mặt: `faceRig.ts` thêm lớp hàm có khung hình mấp máy trong mọi đoạn trừ `idle` và hai lớp mí mắt chớp 6 lần mỗi vòng, đều gắn vào lớp `đầu`. Đứng tự do: `StandFigure` xếp ba lớp, CSS hạ hàm khi đang đọc và chớp mắt. Lottie ghi thẳng vào dữ liệu lúc dựng, nên mọi object thêm vào phải mới, không dùng chung (dùng chung làm nhân vật không hiện). Cài đặt lưu `reader`, `readerRobe`, `readerCustom` (tuỳ chọn, không cần migration; mã lạ thì dùng Thầy). Lời đọc tự xưng qua biến `{ta}`; người đọc trẻ tự động gọi người xem là "bạn".

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
| La Bàn | `laBanCells`, `laBanVerdict` (không có Tổng kết, không đọc câu dẫn phần này) | hướng đang chỉ |

KHÔNG đọc phần "Giải thích chỉ số": quá dài cho lời nói, vẫn xem được trên màn hình. Lời dẫn là bộ mẫu câu có biến, KHÔNG sinh tự do. Câu luận giải dùng lại nguyên `Section[]`, chia bằng `chunkSpeech`.

**Trình phát `CuePlayer`:** chuyển cue khi `speak()` resolve. Đọc/Dừng, ⏮/⏭ đổi cue ngay. "Nói chậm lại" nhân tốc độ với 0,85 từ cue kế tiếp. Cue im lặng dừng theo độ dài chữ (khoảng 15 ký tự/giây, tối thiểu 3 giây) và ⏭ qua được. Dừng khi rời màn hình hoặc app vào nền, dùng chung `stopReading`.

**Thời gian chờ:** trên Android, `say()` trong `tts.ts` coi một đoạn là treo nếu quá 8 giây + độ dài ÷ (6 ký tự/giây × tốc độ), lấy danh sách giọng quá 5 giây cũng vậy; khi đó dừng bộ đọc và báo lỗi thay vì đứng im. Trình duyệt dùng giới hạn riêng trong `webSpeech.ts`.

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

Căn cứ nội dung: `docs/CHI-TAY.md`, `src/content/palm/palm-content.vi.json`. Thứ tự bước: `docs/PROMPT-KIT-CHI-TAY.md`. Mục này là quyết định cho bước 3B.1, các ý còn lại của 3B.1 sẽ bổ sung khi có số đo.

**Cách nhập liệu: máy đo trước, phần còn lại hỏi bằng câu ngắn** (phương án (c) của kit, có giới hạn).
- **Người dùng chạm điểm, máy bám rãnh (chủ dự án quyết 09/11/2026, thay cho cách kéo vòng tròn ngày 06/11):** với mỗi đường, người dùng chạm đầu và cuối đường, Sinh đạo chạm thêm 1–2 điểm ở chỗ cong; máy tìm đường rẻ nhất theo rãnh chỉ tay giữa các điểm (`spike/chitay/livewire.ts`). Lệch chỗ nào thì chạm thêm điểm ở đó; có Lùi, Xoá đường, giữ để xem ảnh gốc. Nét máy tự dò chỉ hiện mờ làm gợi ý. Độ dài, độ cong, nơi dừng đo từ nét đã xác nhận. Lý do: máy tự dò không đủ đúng, còn kéo 6 vòng tròn mỗi đường mất 1,5–3 phút một ảnh.
- Lý do: nhiều người không tự tin khi tự so với hình mẫu, nên bỏ phương án (a), (b). Nhưng ảnh lòng bàn tay không trả lời được hết 32 câu ở CHI-TAY §11, nên không thể tự động hoàn toàn.
- Máy đo được khá chắc: Q04, Q08–Q12. Cần số đo mới biết: Q17, Q20, Q21, Q23. Định mạng (Q25) máy vẽ gợi ý, người dùng chỉnh và trả lời nơi bắt đầu, có lựa chọn "Không có". Khó, chưa làm ở bản đầu: Q18, Q19, Q22, Q24, Q26–Q29, Q32. Phải hỏi: Q01–Q03, Q05–Q07, Q13–Q16, Q30, Q31.
- Máy vẽ đường và đặc điểm đã đo lên ảnh để người dùng xác nhận. Không chắc thì để trống, không đoán.
- Câu còn lại luôn có "Không rõ"; `analyzePalm` phải chạy được khi thiếu câu trả lời.
- Phương án bị loại: gửi ảnh lên máy chủ AI, vì phá cam kết không gửi dữ liệu đi đâu.

**Mô hình:** MediaPipe Hand Landmarker (`@mediapipe/tasks-vision`, Apache-2.0) cho 21 điểm bàn tay, lọc đường vân tự viết cho 3 đường chính. Đóng gói trong app, nạp lười. APK tăng khoảng 10 MB. Giấy phép của file mô hình cần kiểm tra trước khi đóng gói.

**Cửa kiểm chứng:** bản thử ở `spike/chitay/`. Tiêu chí ban đầu chưa đạt (đo ngày 06/11/2026 trên 16 ảnh của từ 5 người trở lên, đo chéo, độ lệch tính trên khung 512):
- Cả 3 đường chính lệch tới 12px: 2/16 ảnh; tới 20px: 10/16 ảnh. Hình dáng trung bình gần như không nhìn ảnh đã đạt 8/13 ảnh ở mức 20px, nên máy chủ yếu gợi ý vị trí, chưa đọc được bàn tay riêng.
- Chỉnh một ảnh bằng chuột: khoảng 1,5–3 phút. Máy xử lý khoảng 0,15 giây trên máy tính.
- Sau khi chỉnh đường, gần như không phải sửa dòng đo nào (có thể đẹp hơn thực tế vì đáp án điền sẵn).
- Tín hiệu "máy chắc" không phân biệt được đúng sai, không dùng.

**Hệ quả:** không luận từ nét chưa được người dùng xác nhận, không có lựa chọn bỏ qua bước chạm.

**Kết quả cách chạm điểm (09/11/2026), đạt cửa kiểm chứng mới:**
- Giả lập trên 15 đường chuẩn, mỗi lần chạm lệch tới 10px: chạm 3 điểm thì lệch trung vị Tâm 3,3, Trí 2,6, Sinh 4,7, Định 2,9 px, cả 3 đường chính tới 12px ở 9/15 ảnh; chạm 4 điểm thì 13/15. Sinh đạo cần 4 điểm, chạm 2 điểm thì nét đi tắt.
- Chủ dự án thử trên Samsung Galaxy S25 Ultra: máy xử lý ảnh 0,2–0,3 giây; 3 lần dùng cách chạm mất 68, 48, 39 giây một ảnh (12–15 lần chạm), nhanh dần khi quen tay. Hai lần còn lại (226 và 122 giây, 80 và 47 lần thao tác) nhiều khả năng là bản kéo vòng tròn trước đó, vì nhật ký trên máy lưu chung.
- Tiêu chí mới: chỉnh xong một bàn tay dưới khoảng 1 phút với người đã quen, máy xử lý dưới 5 giây trên S25 Ultra, nét bám đúng sau vài lần chạm. Chưa thử với người dùng mới và máy Android tầm thấp.

**Còn phải quyết trước khi làm (bước 3B.1):** vị trí trong điều hướng, bố cục 360px, lưu kết quả và ảnh, câu hỏi vẫn phải hỏi (ngón tay, nét đứt, nhánh, gò), xác nhận giấy phép file mô hình trước khi đóng gói vào APK. Trang thử: `spike/chitay/phone.html`, đăng ở `/chitay-thu/phone.html` trên Cloudflare, không vào APK. Điểm chấm và đường chuẩn trên ảnh thật giữ ở `spike/chitay/truth/`, không đưa lên repo.

**Ảnh tay:** xem mục 13.1 phần 6.

**Mã nguồn và nội dung:** dùng tên `palm` (`src/core/palm`, `src/content/palm`). Câu chữ chỉ tay là nội dung mới, không chép nguyên văn sách. `V19`, `V26`, `N04` ẩn cho tới khi đối chiếu xong với sách.

### 13.1 Thiết kế bước 3B.1 (09/11/2026)

Dựa trên bản thử đã đạt (mục trên). Chủ dự án đã chốt ngày 09/11/2026: không lưu ảnh tay, mở từ Tĩnh thất và Tổng hợp, hoãn vân tay, móng và dấu đặc biệt sang bản sau.

#### 1. Cách nhập liệu

Luồng: **tay nào → chụp → chạm 4 đường → xác nhận số đo → câu hỏi ngắn (tuỳ chọn) → kết quả.**

| Nhóm | Câu (CHI-TAY §11) | Cách lấy |
|---|---|---|
| Hỏi trước khi chụp | Q01 tay thuận, và tay đang chụp là tay nào | Hai câu chọn nhanh. Không đoán từ ảnh vì camera trước có thể đã lật ảnh |
| Đo từ nét đã chạm | Q17, Q20, Q21, Q23, Q25 | Tự điền sau bước chạm, hiện trên một màn tóm tắt để sửa |
| Đo từ khớp tay | Q04, Q09, Q10, Q11, Q12 | Tự điền, cùng màn tóm tắt, có "Không rõ" khi ảnh không thấy đủ ngón |
| Phần cơ bản phải hỏi | Q02 hình bàn tay, Q14 đầu ngón | Hai câu có hình minh hoạ |
| "Xem kỹ hơn" (tuỳ chọn) | Q03, Q05–Q08, Q13, Q18, Q19, Q22, Q24, Q26–Q30, Q32 | Câu có hình, bỏ qua được cả nhóm |
| Hoãn sang bản sau | Q15 vân tay, Q16 móng, Q31 dấu đặc biệt | Ảnh lòng bàn tay không thấy rõ; dấu đặc biệt dễ đọc sai và cần hình minh hoạ riêng |

- **Lựa chọn:** người dùng chạm điểm cho 4 đường, máy bám rãnh; câu nào máy tự điền đều sửa được và có "Không rõ".
- **Lý do:** đây là cách duy nhất đạt cửa kiểm chứng; hỏi lần lượt 32 câu thì quá dài, và nhiều người không tự tin so hình (lý do chọn nhận diện từ đầu).
- **Phương án bị loại:** (a) chỉ hỏi theo hình mẫu; (b) ảnh làm nền rồi tự so; (c) máy tự đo hết không cần người xác nhận: đã đo, không đủ đúng (2/15 ảnh ở mức 12px).

**Camera:** dùng ô chọn tệp của WebView với `capture`, mở ứng dụng camera của máy, không khai báo quyền `CAMERA` cho app. Phải thử trên APK ở bước 3B.3; nếu Capacitor buộc xin quyền thì cập nhật mục này và `docs/RELEASE.md` mục 3 trước khi làm tiếp.

**Hướng dẫn chụp** hiện trước khi chụp: nền thoáng, đủ sáng, xoè tay tự nhiên, thấy cả ngón, **tháo nhẫn** (thẻ mô hình ghi rõ đồ trang sức, hình xăm làm giảm độ đúng).

#### 2. Vị trí trong điều hướng

- **Lựa chọn (đã chốt):** không thêm tab. Mở từ **đồ vật mới trên án thư Tĩnh thất** ("đèn dầu soi tay", CHI-TAY §13) và từ ô **Chỉ tay** trong lưới Công cụ của phần Tổng hợp. Route `palm` thuộc ngăn xếp tab Tĩnh thất, kết quả cũ mở bằng `palm.result`.
- **Back trong luồng nhiều bước:** lùi một bước; ở bước chạm đường thì lùi một đường; đang ở bước đầu thì thoát. Đã chạm điểm mà thoát thì hỏi lại "Bỏ dở lần xem này?". Không lưu nháp, vì ảnh không được lưu (mục 6).
- **Phương án bị loại:** tab thứ 6 (thanh dưới đã tối đa 5); gộp vào tab Phong thủy (khác bản chất, Phong thủy là nhà cửa và hướng).

#### 3. Bố cục 360px

```
(i) Chạm đường                 (ii) Xác nhận số đo           (iii) Kết quả
┌──────────────────────┐      ┌──────────────────────┐      ┌──────────────────────┐
│ 2/4 Trí đạo          │      │ Máy đo được           │      │ [Sơ đồ bàn tay   ]   │
│ Chạm đầu rồi cuối    │      │ Sinh đạo: cong vừa  ✎│      │ [ nét đã chạm    ]   │
│┌────────────────────┐│      │ Trí đạo: cong nhẹ   ✎│      │ [ gò, Cửu cung ◐ ]   │
││  ảnh lòng bàn tay  ││      │ Ngón út: ngang      ✎│      │ Lời nhắc văn hoá     │
││  nét bám rãnh      ││      │ ...                   │      │ ▸ Tổng quan          │
│└────────────────────┘│      │ [Xem kỹ hơn]  [Xong ›]│      │ ▸ Ba đường chính     │
│ ↶ Lùi  Giữ xem gốc   │      └──────────────────────┘      │ ▸ Gò, ngón tay       │
│ Xoá đường            │                                    │ ▸ Tổng kết theo chủ đề│
│ ‹ Trước  [Đúng rồi ›]│      (iv) Hai tay: dải chọn         │ Xem lại sau 6–12 tháng│
└──────────────────────┘      Tay hiện tại | Tay bẩm sinh   └──────────────────────┘
```

- Mỗi câu luận có chip chủ đề và nút "Vì sao?" mở đặc điểm, nguồn sách (DVT, HCM, TCT, JDJ).
- **Hai tay:** dải chọn trên sơ đồ, phần "So sánh hai tay" chỉ hiện khi đã xem đủ hai tay.
- **Lớp Cửu cung:** nút bật tắt trên sơ đồ, màu ngũ hành dùng chung với Bát Trạch, chạm cung hiện tên cung, gò, ngũ hành (CHI-TAY §13). Không luận riêng theo cung.

#### 4. Component `PalmDiagram`

- SVG một nét theo design tokens, **không dùng ảnh tay** (ảnh không được lưu).
- Hệ toạ độ chuẩn hoá 0…1 của khung xem trong bản thử: cổ tay ở dưới, ngón cái bên trái. Tay trái thật thì lật gương khi vẽ, để sơ đồ trùng hướng tay người dùng.
- Vẽ các nét đã chạm (toạ độ chuẩn hoá), gò (vùng ước lượng từ khớp tay như `mounds()` của bản thử), lớp Cửu cung.
- Prop `focus?: { zones?: MountId[]; lines?: LineId[]; marks?: string[] }` cho Thầy đọc tô sáng, phần còn lại mờ đi. Mỗi vùng và nét có nhãn truy cập.

#### 5. Engine

- **`src/core/palm/` (thuần TS, không đụng canvas):** `measurePalm(lines, landmarks)` đổi nét đã xác nhận và 21 điểm khớp chuẩn hoá thành ID đặc điểm (chuyển từ `spike/chitay/classify.ts`, giữ các đường đo ảo); `analyzePalm(input: PalmInput): PalmResult` theo CHI-TAY §14.2: ánh xạ câu trả lời sang ID, tra V01–V30 khi có vân tay, gom theo mục, tổng kết theo chủ đề với ngưỡng `xu-huong` / `ro`, so sánh hai tay, câu kết cố định. Kiểu `PalmInput`, `PalmResult` giữ như CHI-TAY §14.1, thêm `measured: Record<string, string | null>` cho phần máy đo.
- **`src/features/palm/vision/` (phụ thuộc trình duyệt):** nạp MediaPipe lười, dò khớp, bản đồ rãnh, bám rãnh (`livewire.ts`), khung xem. Đây là UI, không vào `src/core` vì cần canvas và WASM.
- **Ngưỡng tạm** (ví dụ gò Thái Âm 0,5, ngưỡng chạm 0,032) chuyển nguyên từ bản thử, ghi chú là chưa kiểm chứng trên nhiều tay.
- **Đã làm ở 3B.2:** engine nhận phần mô tả đặc điểm (`PalmMeta`: nhóm, chủ đề, mức, trọng số) do content truyền vào, nên `src/core` không phụ thuộc câu chữ. Q21 tách thành `Q21-huong` và `Q21-dai`. Ô ma trận gò × dấu không có dữ liệu thì bỏ qua, chưa dùng câu chung §9.1 vì dấu đặc biệt để bản sau.

#### 6. Lưu trữ

- **Phiên xem** gắn với hồ sơ và ngày, để so theo thời gian (tướng tay thay đổi): `{ id, profileId, date, hand: 'left' | 'right', role: 'current' | 'innate', lines (toạ độ chuẩn hoá), landmarks (21 điểm chuẩn hoá), answers, measured, version }`.
- Lược đồ `lyso.state` lên version 3: thêm `palmSessions: PalmSession[]`, migration 2 → 3 thêm mảng rỗng. Xoá hồ sơ thì xoá phiên của hồ sơ đó; "Xoá toàn bộ dữ liệu" và sao lưu, khôi phục JSON bao gồm luôn.
- **Ảnh tay (đã chốt):** **không lưu ảnh**, chỉ lưu nét và điểm khớp đã chuẩn hoá. Lý do: quyền riêng tư (ảnh lòng bàn tay là dữ liệu cá nhân), dung lượng, và sơ đồ vẽ lại được từ nét. Đánh đổi: không xem lại ảnh cũ, thoát giữa chừng phải chụp lại. Thay thế cho mục "Ảnh tay" phía trên. Bổ sung 10/11/2026: ngay sau khi xem, màn kết quả vẽ đường lên ảnh thật (ảnh chỉ giữ trong bộ nhớ, `src/features/palm/photoMemory.ts`), rời màn kết quả là bỏ; mở lại thì dùng tranh sơ đồ. Cùng ngày: thay quyết định "lần mới thay lần cũ" bằng lịch sử tối đa 12 lần mỗi tay mỗi hồ sơ để so qua thời gian (CHI-TAY §13).

#### 7. Chính sách nội dung

- Giữ nguyên danh mục loại bỏ CHI-TAY §12. Câu `tts: false` vẫn hiện chữ bình thường, Thầy không đọc.
- Lời nhắc cố định ở đầu kết quả (văn hoá, tham khảo, tướng tay thay đổi) và cuối kết quả (xem lại sau 6–12 tháng, "Số là tham khảo, đức năng thắng số").
- V19, V26, N04 ẩn cho tới khi đối chiếu xong với sách (đã quyết từ 05/11).
- **Không luận từ nét chưa được người dùng xác nhận**, không có nút bỏ qua bước chạm.
- Câu luận giải chỉ tay là nội dung mới: chủ dự án đọc duyệt trước khi phát hành (CHI-TAY §15).

#### 8. Ảnh hưởng tới các phase khác

- **Phase 6:** `Cue.focus.palm`; đồ vật mới ở Tĩnh thất cần tranh (bổ sung `docs/ART-BRIEF.md`); câu mở, kết riêng của Thầy cho chỉ tay (3B.8, cần duyệt cùng `docs/LOI-THAY.md`).
- **Phase 7:** ảnh chia sẻ dùng sơ đồ và tóm tắt, không dùng ảnh tay; sao lưu JSON gồm phiên chỉ tay.
- **Phase 8.1:** ảnh chỉ xử lý trên máy và không lưu nên không phải khai thu thập; nếu cần quyền `CAMERA` thì khai lý do. Mô hình Hand Landmarker là **Apache 2.0** (thẻ mô hình "Hand Tracking (Lite/Full)", tháng 10/2021), WASM của `@mediapipe/tasks-vision` cũng Apache 2.0: cần ghi công trong màn Giới thiệu. Thẻ mô hình loại trừ giám sát và nhận dạng danh tính, không áp dụng cho app.
- **Dung lượng APK** tăng khoảng 23MB (mô hình 7,8MB, WASM 14,6MB). Đóng gói trong app vì app phải chạy offline; nạp lười khi mở chỉ tay. Nếu muốn nhẹ hơn thì cân nhắc ở 3B.3: bản WASM nhỏ hơn hoặc tải mô hình lần đầu, nhưng tải về thì phá cam kết offline.

#### Thứ tự triển khai

| Bước | Việc | Xong khi |
|---|---|---|
| 3B.2 | `src/content/palm` (nạp JSON, câu hỏi), `src/core/palm` (`measurePalm`, `analyzePalm`) | Test (a)–(i) của kit chính và test đo hình học từ nét mẫu; `npm test`, `npm run build` xanh |
| 3B.3 | `src/features/palm`: chụp, chạm 4 đường, xác nhận số đo, câu hỏi, kết quả, `PalmDiagram`, lưu phiên, lược đồ v3 | Chạy đủ luồng ở 360px sáng, tối; APK chụp được bằng camera; S25 Ultra chỉnh một bàn tay dưới khoảng 1 phút |
| 3B.4 | Đặt hàng hình minh hoạ câu hỏi và đồ vật Tĩnh thất vào `docs/ART-BRIEF.md` | Danh sách hình có kích thước và tên file |
| 3B.5 | Script sinh `palm-content.vi.json` từ CHI-TAY | Chạy lại ra đúng file hiện có |
| 3B.6–3B.9 | Thầy đọc chỉ tay, đồ vật Tĩnh thất, lời dẫn, rà chính sách | Theo kit |

## 14. Phân tích ngũ hành (Phase 3C, chốt 11/11/2026)

Căn cứ khi viết: `docs/NGU-HANH-SO-SANH.md` (3000 lá số, seed 20261111), engine tham chiếu `docs/ngu-hanh-engine/` v0.2, `src/core/battu/reading.ts`, `src/content/battu/*`, `src/core/tonghop/reading.ts`, `src/content/tonghop/*`, `src/content/interp/{battu,hanh}.ts`, `src/features/battu/BatTuScreen.tsx`, `src/features/reader/script.ts`, `tests/parity/battu.test.ts`, `tests/snapshot/compute.ts`, sách Phần 2 (mục 6.3 và Chương 7). Thứ tự bước: `docs/PROMPT-KIT-NGU-HANH.md`. Mục này là bước 3C.1, chưa có code.

**Đáp án người luận:** chủ dự án CHƯA điền cột "Đáp án người luận" (mục 3 của `NGU-HANH-SO-SANH.md`). Theo kit, mục này chỉ được chọn phương án đảo ngược được, kèm điều kiện để chuyển phương án (14.1).

**Số đo thêm (11/11/2026, cùng 3000 lá số, cùng seed):** 1216 lá bị đảo chiều (40,5%). Xếp mỗi lá vào một nguyên nhân, xét theo thứ tự trong bảng:

| Nguyên nhân | Lá đảo chiều | Trong các lá đảo chiều | Tỷ lệ đảo chiều của nhóm |
|---|---|---|---|
| Engine luận Tòng cách/Chuyên vượng (Chân hoặc Giả) | 100 | 8,2% | 75,8% của 132 lá |
| Engine dùng Điều hậu | 159 | 13,1% | 34,3% của 463 lá |
| Engine xếp trung hoà, bù hành yếu nhất | 400 | 32,9% | 66,9% của 598 lá |
| Hai bên kết luận vượng/nhược ngược nhau (legacy chỉ đếm 3 Can lộ; engine tính cả Tàng Can, hệ số chi tháng) | 504 | 41,4% | 100% của 504 lá |
| Cùng chiều vượng/nhược nhưng chọn hành khác | 53 | 4,4% | 4,2% của 1272 lá |

- Có cách luận thay thế (Chân 36 + Giả 96): 132 lá, **4,4%**. Chỉ những lá này mới có câu hỏi kiểm chứng (14.6).
- Có dấu hiệu tòng/chuyên vượng nên engine chấm bảng 4 điều kiện (kể cả Không thành): 688 lá, **22,9%**.
- Hai nguyên nhân lớn nhất (vượng/nhược ngược và trung hoà) chiếm 74% số lá đảo chiều, đều do legacy không tính Tàng Can.

**Sách nói gì:** Phần 2 mục 6.3 viết rằng một lá số vượng thật thường cần 2 trong 3 yếu tố Đắc Lệnh, Đắc Địa, Đắc Thế, còn tài liệu "ở mức nền tảng" chỉ dùng Đắc Lệnh và đối chiếu nhanh Can lộ. Chương 7 viết rằng luận Dụng thần chuẩn còn phải xét Điều hậu, Thông quan, các Cách cục đặc biệt, và kết luận ở Chương 10 chỉ để minh hoạ. Câu chữ legacy cũng tự ghi giới hạn đó (`batTuVuongSuy`, `batTuDungThan`, `batTuNotes`, `BATTU_NOTE`). Vậy **legacy là bài học nền tảng đúng theo sách, engine là phần "học tiếp" mà sách chỉ nêu tên**. Hai bên đều có căn cứ, khác nhau ở mức độ, nên không bên nào là "sai" cần xoá.

### 14.1 Xung đột Dụng thần với legacy

**Lựa chọn: phương án (B).** Giữ nguyên văn mọi câu chữ legacy về Vượng Suy, Dụng thần, Tổng kết, Tổng hợp. Thêm mục mới **"Phân tích ngũ hành"** trên màn Bát Tự, đặt ngay sau hai hộp "Vượng Suy và Dụng Thần sơ bộ", trước dải Đại Vận. Mục mới chạy engine, tự giới thiệu là phần "học tiếp" của mục 6.3 và Chương 7, và mở đầu bằng **một dòng đối chiếu** với gợi ý sơ bộ.

**Mức đối chiếu** (engine trả mã qua `compareWithLegacy(reading, nguHanh)` ở `src/core/nguhanh`, cùng định nghĩa với `compare-dung-than.ts`):

| Mã | Điều kiện |
|---|---|
| `nguoc` | Đảo chiều: Dụng thần engine nằm trong `ky` legacy, hoặc Kỵ thần engine nằm trong `dung` legacy. **Xét trước**, để không báo "trùng" khi kỵ của engine lại là hành legacy khuyên dùng (chốt khi làm 3C.2) |
| `trung` | Không đảo chiều, Dụng thần chính của engine = `primary` của legacy |
| `gan` | Không đảo chiều, Dụng thần engine nằm trong `dung` của legacy |
| `khac` | Không đảo chiều, Dụng thần engine không nằm trong `dung` của legacy |

Số "trùng 36,1%" của `NGU-HANH-SO-SANH.md` đếm riêng theo `primary` (chưa loại ca đảo chiều), nên không bằng số ca `trung` ở đây.

Kèm mã nguyên nhân theo bảng số đo: `tong-cach`, `dieu-hau`, `trung-hoa`, `vuong-nhuoc`, `khac-chon`.

**Câu hiện cho người dùng** (nội dung mới; câu cuối cùng chốt ở `docs/NGU-HANH.md` bước 3C.3, giữ đúng ý dưới đây):

- `trung`: "Phân tích định lượng cũng chọn **{X}** là hành cần bổ sung nhất, trùng với gợi ý sơ bộ ở trên."
- `gan`: "Phân tích định lượng chọn **{X}** làm Dụng thần chính, gợi ý sơ bộ ở trên chọn {Y}. Hai cách cùng một hướng: {X} vẫn nằm trong nhóm hành có lợi của gợi ý sơ bộ."
- `khac`: "Phân tích định lượng chọn **{X}**, khác các hành gợi ý sơ bộ ({danh sách}), nhưng hai cách không ngược nhau. {lý do}"
- `nguoc`: "Ở lá số này, hai cách tính cho kết quả gần như ngược nhau: gợi ý sơ bộ nghiêng về {danh sách}, phân tích định lượng nghiêng về **{X}**. {lý do} Sách Phần 2 (mục 6.3 và Chương 7) coi cách sơ bộ là bước nền tảng, còn lá số thực tế cần xét thêm những yếu tố này. Bạn có thể đọc cả hai như hai góc nhìn. Nếu định dựa vào đây để quyết định việc gì, nên nhờ người luận xem trực tiếp."
- {lý do} theo mã nguyên nhân:
  - `vuong-nhuoc`: "Gợi ý sơ bộ chỉ đếm mùa sinh và 3 Can lộ nên thấy Thân {vượng/nhược}; khi tính cả Can ẩn trong Chi và sức của chi tháng, Nhật Chủ lại thiên {nhược/vượng}."
  - `trung-hoa`: "Khi tính đủ 8 chữ, Nhật Chủ gần cân bằng (trung hoà), nên phân tích định lượng chỉ bù hành yếu nhất thay vì bồi thêm hay tiết bớt Nhật Chủ."
  - `dieu-hau`: "Lá số sinh mùa {lạnh/nóng} mà hành {Hoả/Thuỷ} rất ít, nên phân tích định lượng ưu tiên Điều hậu (cân bằng nóng lạnh) trước việc bồi thêm hay tiết bớt Nhật Chủ."
  - `tong-cach`: "Lá số có dấu hiệu cách cục đặc biệt ({tên cách}); khi đó nguyên tắc Vượng Suy thông thường không còn áp dụng (Phần 2, Chương 7)."
  - `khac-chon`: "Hai cách cùng thấy Thân {vượng/nhược} nhưng chọn hành khác: gợi ý sơ bộ lấy hành ít chữ nhất, phân tích định lượng lấy hành chữa đúng nguyên nhân mất cân bằng."
- Khi `nguoc`, phần Đại Vận và các năm tới của mục mới có thêm dòng: "Đánh giá các năm ở đây có thể khác mục 'Giai đoạn hiện tại' trong Tổng kết, vì hai cách lấy hành có lợi khác nhau."

**So sánh các phương án:**

| | (A) Engine thay legacy | **(B) Giữ legacy, thêm mục riêng** | (C) Engine là nguồn tên hành, câu legacy thành tham số |
|---|---|---|---|
| Người dùng thấy gì ở lá đảo chiều | Một kết luận (engine) | Hai kết luận, có dòng đối chiếu giải thích vì sao | Một tên hành (engine) trong câu legacy |
| `tests/parity` | Đỏ ở Bát Tự (Tổng kết, Vượng Suy, Dụng Thần) và Tổng hợp (Tóm lại, thẻ Bát Tự, hướng "vàng"); phải ghi ngoại lệ trong CLAUDE.md | Giữ nguyên, không ngoại lệ | Phải đổi cách so (so khuôn câu thay vì chữ) hoặc ghi ngoại lệ |
| `tests/core-snapshot` | Không đổi: bản chụp chỉ có lá số và hằng số, không có `batTuReading` (đã xem `tests/snapshot/compute.ts`) | Không đổi | Không đổi |
| Quy tắc "nguyên văn legacy" | Phá | Giữ | Phá một phần |
| Mâu thuẫn trong câu chữ | Không | Có, giữa hai mục (đã có câu giải thích) | **Có, trong cùng một câu**: câu "Thân nhược, bạn tinh tế…" của legacy đi cùng hành dụng của engine khi engine thấy vượng hay trung hoà, sai cả lý luận |
| Công sửa | Lớn: legacy chỉ có 2 trạng thái và 1 cách chọn, engine có 5 mức và 5 phương pháp, phải viết lại câu cho mọi trường hợp | Vừa: toàn bộ là phần thêm | Lớn nhất: tham số hoá cộng viết câu mới cho trung hoà, Điều hậu, Tòng cách |
| Đổi phương án về sau | Khó: Dụng thần của 40,5% người dùng đổi qua một lần cập nhật | Dễ: gỡ hoặc nâng mục mới không đụng legacy; sang (C) chỉ là thêm việc | Trung bình |
| Khớp đáp án người luận | Chưa có đáp án | Chưa có đáp án | Chưa có đáp án |

**Phương án bị loại:**

- **(A):** không đảo ngược được, và chưa có đáp án nào cho thấy engine đúng hơn trên lá số thật.
- **(C):** tạo mâu thuẫn ngay trong một câu, nặng hơn mâu thuẫn giữa hai mục của (B). Là đích có thể chuyển tới khi đáp án ủng hộ engine.
- **(D) Cài đặt cho người dùng chọn "Sơ bộ / Định lượng":** người dùng không có căn cứ để chọn; nhân đôi ma trận test và câu chữ ở mọi màn dùng Dụng thần.
- **(E) Dùng câu hỏi năm đã qua để phân xử legacy với engine:** kiểm chứng của engine chỉ thiết kế cho hai cách luận của chính nó; legacy chỉ có thang 3 mức cho năm; dễ khiến người dùng hiểu là app "đoán đúng". Có thể xem lại khi đã có dữ liệu đáp án.

**Giới hạn để (B) đỡ rối:** engine chỉ hiện ở màn Bát Tự và trong lựa chọn "Ngũ hành" của Thầy đọc. Không đưa vào Tổng hợp, ảnh chia sẻ, kịch bản Bát Tự hiện có (14.2).

**Điều kiện chuyển phương án** (quyết lại bằng tay, không tự động):

1. Chủ dự án điền ít nhất 12/24 lá, ưu tiên nhóm đảo chiều (#8–15) và Điều hậu (#16–18), có ghi nguồn đáp án.
2. "Khớp" nghĩa là Dụng thần chính của người luận trùng dụng hoặc hỷ của bên đó, và không nằm trong kỵ của bên đó.
3. Engine khớp ≥ 75% **và** legacy khớp ≤ 50% trên các lá đã điền → chuyển sang (C).
4. Cả hai dưới 75%, hoặc chênh nhau dưới 25 điểm phần trăm → giữ (B), bổ sung đáp án.
5. Engine khớp dưới 50% → hiệu chỉnh engine (preset, ngưỡng; xem `config.ts`) và chạy lại so sánh trước khi làm gì khác.
6. Chỉ xét (A) sau khi (C) đã chạy ổn qua một bản phát hành.
7. Muốn chuyển: sửa mục này trước, ghi kết quả đối chiếu, và ghi rõ ngoại lệ parity trong CLAUDE.md.

**Đối chiếu với sách (12/11/2026).** 24 lá ở `NGU-HANH-SO-SANH.md` mục 3 là lá ngẫu nhiên nên không sách nào luận sẵn; điều 1 ở trên vẫn chưa đạt. Thay vào đó, lấy 50 lá ví dụ mà sách nói rõ dùng gì: 26 lá *Tử Bình Chân Thuyên* (bản dịch Phương Trọng Thầm), 24 lá *Trích Thiên Tủy* (Nhậm Thiết Tiều bình chú), cả hai ở `docs/sach/` (không commit vì là sách có bản quyền và nặng). Dữ liệu ở `tests/fixtures/nguhanh-sach.json`, bảng ở `docs/NGU-HANH-SACH.md` (`npm run compare:sach`); sách không cho ngày sinh nên engine nhận thẳng tứ trụ, không so được với legacy. Kết quả: dụng thần chính của engine trùng sách 18/50 (36%), ngược 10/50 (20%); theo định nghĩa khớp của điều 2 là 24/50 (48%), *Tử Bình Chân Thuyên* 13/26, *Trích Thiên Tủy* 11/24. Dưới 50% nên **rơi vào điều 5** (hiệu chỉnh engine rồi chạy lại trước khi làm gì khác). Đã hiệu chỉnh cùng ngày (14.12): lên 25/50 (50%), trùng 20/50, ngược 9/50; các số trong câu này là của v0.2. Các nhóm lệch thấy rõ: engine không có Hoá khí cách (2 lá); lá sách dùng Quan Sát hay Tài khắc chế mà engine lại cho thân nhược hoặc trung hoà (ttt-26, ttt-40, ttt-41, ttt-46, tbct-9); Tòng Tài sách nhận mà engine không thành cách (tbct-13); lá engine xếp "trung hoà" thì chỉ bù hành yếu nhất, hay lệch sách. Khi hiệu chỉnh phải giữ bộ này làm tập kiểm tra, tránh chỉnh cho khớp đúng 50 lá này (chia một phần làm tập thử riêng).

**Đáp án người luận là quy ước.** Đáp án của người luận là một quy ước chuyên môn (sự đồng thuận của nghề), không phải sự thật khách quan; các trường phái có thể cho đáp án khác nhau trên cùng một lá số. Bộ golden vì vậy chỉ là mốc tham chiếu, không phải chuẩn tuyệt đối: khi engine khác đáp án, ghi rõ hai bên và nguồn, không tự coi bên nào là đúng.

### 14.2 Nơi dùng Dụng thần sau 3C

| Nơi | Nguồn hiện tại | Nguồn sau 3C | Đổi chữ hiển thị? |
|---|---|---|---|
| Bát Tự · hộp "Đánh giá Vượng Suy", "Gợi ý Dụng Thần" | legacy (`assessThan`, `dungThanPattern`) | giữ legacy | Không |
| Bát Tự · Tổng kết: Dụng thần chính, màu, hướng, vật, nghề theo hành, mùa | legacy (`batTuReading.primary/dung/ky`) | giữ legacy | Không |
| Bát Tự · Tổng kết "Giai đoạn hiện tại" | legacy (`daiVanNow`, `yearNow`, thang 3 mức) | giữ legacy | Không |
| Bát Tự · dải Đại Vận, thẻ "Tra Lưu Niên" | không dùng Dụng thần (Can Chi, tuổi, Thập Thần) | giữ nguyên ở bản đầu, không tô màu tốt/xấu | Không |
| Bát Tự · mục "Phân tích ngũ hành" | chưa có | engine | Mục mới |
| Tổng hợp · thẻ Bát Tự "Dụng Thần nghiêng về", Tóm lại (hành nên bổ sung, màu, nghề), hướng "vàng" (Bát Trạch ∩ `dung` legacy) | legacy | giữ legacy | Không. Thêm một liên kết "Xem phân tích ngũ hành ở tab Bát Tự" ở lớp màn hình, ngoài các Section mà parity so |
| Ảnh chia sẻ Bát Tự (`cardReading(batTuTongKet)`) | legacy (gián tiếp) | giữ legacy, KHÔNG thêm tóm tắt ngũ hành ở bản đầu | Không |
| Thầy đọc · Bát Tự (`buildScript('battu')`, cue từ `batTuTongKet`) | legacy (gián tiếp) | giữ legacy | Không |
| Thầy đọc · Ngũ hành (3C.6) | chưa có | engine | Mục mới |
| Bát Trạch · hướng, màu | Mệnh Quái | giữ, không thêm Dụng thần | Không |
| La Bàn | Mệnh Quái, Du Niên | giữ, không thêm | Không |
| Nạp Âm · màu hợp mệnh | hành Nạp Âm | giữ | Không |

- **Ảnh chia sẻ không thêm ngũ hành:** ảnh rời khỏi app, không mang theo dòng đối chiếu; hai kết luận ngược nhau trên một tấm ảnh là trường hợp khó hiểu nhất. Xét lại khi chuyển sang (C).
- **Dải Đại Vận không tô màu:** tô theo engine sẽ đặt kết luận của engine ngay cạnh Tổng kết legacy ở cả những lá `nguoc`. Đại Vận theo engine nằm trong mục mới.

### 14.3 Màu sắc và hướng

**Lựa chọn: mỗi màn một nguồn và ghi rõ nguồn. Mục ngũ hành không nêu màu, hướng, vật phẩm cụ thể.**

- Bát Tự (Tổng kết) và Tổng hợp: theo Dụng thần sơ bộ (legacy, như hiện nay).
- Bát Trạch, La Bàn: theo Mệnh Quái. Nạp Âm: theo hành Nạp Âm.
- Mục ngũ hành chỉ nêu thói quen, công việc, cách sắp xếp nhịp sống. Nếu nêu màu hướng theo engine thì ở lá `nguoc` sẽ có hai lời khuyên màu ngược nhau cách nhau vài màn cuộn.

**Câu giải thích**, hiện ở cuối mục ngũ hành:

> Màu và hướng gợi ý trong app đến từ ba cách tính khác nhau: theo Dụng thần Bát Tự (tab Bát Tự và Tổng hợp), theo Mệnh Quái (Bát Trạch, La Bàn) và theo Nạp Âm năm sinh. Mỗi cách trả lời một câu hỏi riêng nên có thể không trùng nhau, và mỗi màn hình đã ghi rõ đang theo cách nào. Đây là gợi ý mang tính văn hoá, tham khảo; không cần mua sắm hay thay đổi gì để "hợp mệnh".

**Phương án bị loại:** hiện cả ba nguồn ở mọi màn (dài, rối, nhân mâu thuẫn); gộp thành một "màu tổng hợp" (không có căn cứ trong sách; Tổng hợp đã ghi việc đối chiếu chéo là không chính thống).

**Hệ quả:** bước 3C.8 (nối Dụng thần sang Bát Trạch, La Bàn) **không chạy**.

### 14.4 Port engine vào `src/core/nguhanh`

- **Dùng lại bảng của app:** `CAN`, `CHI` (`src/core/canchi`), `TANG_CAN`, `CAN_HANH`, `CHI_HANH`, `BT_HANH_ORDER`, `seasonHanh` (`src/core/battu/engine.ts`). Ngày 11/11/2026 đã đối chiếu tay: `HIDDEN_STEMS` của engine khớp `TANG_CAN` cả thứ tự Bản/Trung/Dư khí; 3C.2 vẫn phải có test chứng minh trước khi bỏ bảng trùng.
- **Giữ bảng riêng của engine** ở `src/core/nguhanh/data.ts` khi app không có bảng tương ứng: tam hợp, bán hợp, can hợp, khí hậu theo chi tháng (`SEASON_CLIMATE`). Lục hợp, lục xung đối chiếu với `LUC_HOP`, `LUC_XUNG` trong `src/core/luchao/engine.ts` bằng test, khớp thì dùng chung.
- **Không gộp hệ số Tàng Can** của engine (`hiddenRatios`, `rootWeights`) với hệ số 1 / 0,5 / 0,3 của `thapThanProfile`: đổi bên nào cũng làm đổi kết quả của bên đó.
- Chính tả "Hoả", "Thuỷ", "trung hoà" của app. Đầu vào là `BatTuChart` (giờ sinh luôn có, app không có hồ sơ "không rõ giờ", nên bỏ nhánh `hour?` của engine). Engine trả mã và số, không trả câu văn. Năm hiện tại là tham số, không gọi `new Date()`.

**Câu chữ, theo từng loại:**

| Loại | Nguồn | Lý do |
|---|---|---|
| Nét và nghề của 5 nhóm Thập Thần | `FAMILY` (`src/content/interp/battu.ts`), import, không chép | Đã có nguyên văn, cùng giọng với Tổng kết |
| Nghề theo hành | `HANH_INFO.nghe`, import | Như trên |
| Vai trò của nhóm Thập Thần khi là dụng / là kỵ (`TEN_GOD_PRACTICAL.asUseful/asHarmful`) | Nội dung mới | Legacy không có |
| Thói quen, dấu hiệu dư, cách tiết chế của hành (`ELEMENT_PRACTICAL`) | Nội dung mới, bỏ ý trùng `HANH_INFO` | Legacy không có |
| Lý do chọn Dụng thần, điều kiện Tòng cách, câu đối chiếu (14.1), nhãn năm, câu hỏi kiểm chứng | Nội dung mới | Legacy không có |
| Màu, hướng (`HANH_INFO.mau/huong`), mùa (`HANH_INFO.mua`) | Không dùng trong mục ngũ hành | 14.3 |
| Vật phẩm (`HANH_INFO.vat`) | **Không hiện** trong mục ngũ hành | Tránh thành gợi ý mua bán (12.8). `HANH_INFO.vat` vẫn ở Tổng kết legacy như hiện nay |

- Nội dung mới đặt ở `src/content/nguhanh`, nguồn câu chữ ở `docs/NGU-HANH.md`, không thuộc `tests/parity` (ngoại lệ giống `src/content/palm`). Chủ dự án đọc duyệt `docs/NGU-HANH.md` trước khi làm giao diện (14.10).
- **Preset trường phái (`config.ts`): chỉ để nội bộ ở bản đầu**, không có trong Cài đặt. Lý do: người dùng không có căn cứ chọn trường phái; mỗi preset cần snapshot và câu chữ riêng. `MONTH_HEAVY_CONFIG` giữ trong code để so sánh khi hiệu chỉnh.

### 14.5 Thời gian

- **Năm:** thay `yearPillar()` bằng `yearCanChiIndex` của app (theo Lập Xuân). Tuổi tính như `batTuYearLookup` (`year - tietYear + 1`, tuổi mụ theo năm tiết).
- **Đại Vận:** lấy từ `ch.daiVan`, `ch.khoiVanYears`; Đại Vận thứ `i` ứng với tuổi `khoiVanYears + 10i` đến `+9`. `evaluatePeriod` chấm trụ Đại Vận như trụ năm.
- **Mục ngũ hành hiện:** Đại Vận đang đi và 5 năm tới (từ năm nay), mỗi năm một nhãn mềm (14.8) và một gợi ý nên làm gì.

**Chọn câu hỏi kiểm chứng:**

- Chỉ khi có cách luận thay thế và chưa kết luận (14.6, 14.7).
- **Đại Vận trước:** tối đa 2 Đại Vận đã đi **hết**, bắt đầu từ 12 tuổi trở lên, mà hai cách luận chấm ngược dấu. Không hỏi Đại Vận đang đi dở.
- **Lưu Niên sau:** tối đa 3 năm trong 20 năm gần nhất, từ 18 tuổi trở lên, ngược dấu, ưu tiên năm chênh lệch lớn. Giữ cách chọn của v0.2, chỉ đổi tham số: tuổi tối thiểu 15 → 18 tuổi mụ (người dùng nhớ rõ hơn từ tuổi trưởng thành), số năm tối đa 4 → 3. v0.2 viết cứng `birthYear + 15`, nên 3C.2 thêm tham số `minAge` (mặc định giữ như v0.2 để test so với v0.2 vẫn đúng), app gọi với 18 tuổi mụ, tức từ năm `tietYear + 17`.
- Tổng tối đa **5 câu**. Không đủ năm (người còn trẻ) thì hiện "Chưa đủ năm đã qua để kiểm chứng".
- Cách hiện năm: "Năm 2015 (Ất Mùi), lúc bạn 27 tuổi (tuổi mụ). Năm tính từ Lập Xuân, khoảng đầu tháng 2 dương lịch." Đại Vận: "Giai đoạn từ khoảng 23 đến 32 tuổi (khoảng 2011–2020)."

**Tính câu trả lời Đại Vận trong `resolveWithFeedback`:**

- Hệ số `k` của Đại Vận **bằng** của năm (0,7). Một giai đoạn 10 năm dễ nhớ hơn nhưng gộp cả năm tốt lẫn năm xấu, nên không chắc phân biệt tốt hơn; giữ bằng nhau cho tới khi có dữ liệu.
- Một Đại Vận tính là **một câu** trong ngưỡng kết luận (≥ 3 câu, ≥ 80%, khớp ≥ 75%). Ngưỡng giữ nguyên v0.2.
- Câu trả lời chỉ có năm phải ra đúng trọng số như v0.2 (test ở 3C.2).

### 14.6 Kiểm chứng bằng quá khứ

- **Nơi hiện:** cả hai, dùng chung một bộ câu trả lời. Màn Bát Tự có thẻ "Kiểm chứng bằng các năm đã qua" nằm trong mục ngũ hành. Tĩnh thất: Thầy hỏi khi đọc phần Ngũ hành (3C.6). Trả lời ở đâu cũng thấy ở nơi kia.
- **Lựa chọn trả lời:** Thuận lợi / Bình thường / Khó khăn / Không nhớ. "Không nhớ" được lưu để khỏi hỏi lại câu đó, nhưng không truyền vào engine và không đổi trọng số.
- **Lưu (lược đồ `lyso.state` v3 → v4):** thêm `nguHanhAnswers: NguHanhAnswer[]`:

  ```ts
  interface NguHanhAnswer {
    profileId: string;
    birthKey: string;   // băm các trường ngày giờ sinh của hồ sơ (lịch, ngày, tháng, năm, nhuận, giờ, giờ Tý muộn, giới tính)
    target: { kind: 'nam'; year: number } | { kind: 'daiVan'; index: number };
    outcome: 'tot' | 'binh' | 'xau' | 'khong-nho';
    answeredAt: string; // ISO
  }
  ```

  Migration 3 → 4 thêm mảng rỗng, dùng chung `upgradeDoc` khi khởi động và khi khôi phục sao lưu. Có trong file sao lưu. Xoá hồ sơ thì xoá câu trả lời của hồ sơ đó; "Xoá toàn bộ dữ liệu" xoá hết. Không rời máy.
- **Sửa, làm lại, xoá:** câu đã trả lời vẫn hiện cùng lựa chọn đã chọn; bấm nút khác của câu đó là sửa (ghi đè). Nút "Làm lại" xoá mọi câu trả lời của hồ sơ đó và hỏi lại từ đầu; đây cũng là cách xoá.
- **Đã kết luận:** không hỏi thêm; thẻ hiện kết luận và nút "Làm lại".
- **Sửa ngày giờ sinh:** câu trả lời có `birthKey` khác không còn dùng được (Đại Vận và các năm được hỏi đã khác). Khi lưu hồ sơ có `birthKey` mới, xoá câu trả lời cũ của hồ sơ đó và báo một dòng: "Đã xoá các câu trả lời kiểm chứng ngũ hành cũ vì ngày giờ sinh thay đổi." Sửa tên, quan hệ thì không ảnh hưởng.
- **Phương án bị loại:** hỏi lại người dùng có giữ câu trả lời cũ không (câu trả lời cũ gắn với lá số cũ, giữ lại là sai); chỉ lưu trong bộ nhớ (mất khi tắt app, người dùng phải trả lời lại).

**Giới hạn của kiểm chứng bằng quá khứ.** (1) Thiên lệch xác nhận: người nhớ lại có xu hướng thấy "khớp" với điều đã đọc. (2) Câu hỏi "thuận hay khó" rất chung, cùng một năm có thể kể thành tốt hoặc xấu tuỳ tâm trạng. (3) Chỉ so được hai cách tính đang có, không chứng minh cách nào đúng. Vì vậy lời trong app chỉ nói "các mốc đã qua khớp hơn với cách luận A", không bao giờ nói "đã xác định đúng"; câu hỏi luôn cho phép chọn "Không nhớ" và nhắc rằng trí nhớ có thể lệch.

### 14.7 Hiển thị nhiều cách luận

- **Chân** (36/3000 lá): hiện cách thuận thế là chính. Một dòng "Xem cách luận khác" mở cách luận thông thường; thẻ kiểm chứng nằm trong phần mở này.
- **Giả** (96/3000 lá): hai tab ngang hàng "Cách luận 1 · Cách luận 2", tab đầu là cách có trọng số cao hơn. Thẻ kiểm chứng hiện sẵn, ngay dưới hai tab.
- **Không thành hoặc không có dấu hiệu:** chỉ một cách luận, không có tab, không có thẻ kiểm chứng.
- **Trọng số hiện bằng chữ**, phần trăm chỉ có trong "Vì sao ra kết quả này": từ 0,8 trở lên là "nghiêng rõ về", từ 0,6 đến dưới 0,8 là "nghiêng nhẹ về", dưới 0,6 là "hai cách gần ngang nhau". Lý do: các ngưỡng là quy ước, hiện "65%" dễ bị hiểu là xác suất đúng.
- **Bảng 4 điều kiện Tòng cách:** hiện rõ khi Chân hoặc Giả; khi Không thành thì nằm trong "Vì sao ra kết quả này". Mỗi dòng là một câu hỏi thường ngày kèm tên chuyên môn nhỏ bên dưới:
  1. "Nhật Chủ có chỗ dựa trong các Chi không?" (Gốc ở địa chi)
  2. "Có Can nào lộ ra giúp hay chế Nhật Chủ không?" (Can lộ)
  3. "Phe mạnh có đủ áp đảo không?" (Thế phe được theo)
  4. "Phe mạnh là một hành hay nhiều hành?" (Hướng)

  Trạng thái là chữ kèm biểu tượng (✓ Đạt, ◐ Một phần, ✗ Không đạt), không chỉ dùng màu. Dòng 1 và 2 có chú thích "điều kiện bắt buộc".

### 14.8 Chính sách nội dung

- **Nhãn năm mềm:** Rất thuận · Thuận · Bình thường · "Nên chậm lại, củng cố" (thay "Kém thuận") · "Nên giữ chắc, chuẩn bị kỹ" (thay "Cần thận trọng"). Mỗi nhãn luôn đi cùng một gợi ý nên làm gì (lấy ý `FAVOR_HINT` của engine, viết lại ở `docs/NGU-HANH.md`).
- Không lời khuyên y tế, đầu tư tài chính, pháp lý cụ thể. Câu về sức khoẻ chỉ ở mức thói quen (ngủ đủ, vận động), không nêu bệnh, bộ phận cơ thể, thuốc.
- **Lời nhắc văn hoá** ở đầu mục ngũ hành ("Đây là một cách tính định lượng theo lý số cổ truyền, mang tính văn hoá, tham khảo.") và ở cuối (câu chuẩn "Số là tham khảo, đức năng thắng số." cộng câu 14.3).
- **Hai danh sách, đặt ở `src/content/nguhanh`, có test:**
  - **(i) KHÔNG HIỆN** (không được có trong bất kỳ câu mới nào, kể cả chữ chỉ để xem): cúng, giải hạn, hoá giải, trấn yểm, bùa, vật phẩm, kích tài, chiêu tài, mua, đeo để, chính xác, chắc chắn, tuyệt đối, dự đoán đúng, linh nghiệm, cổ phiếu, chứng khoán, tiền ảo, vay, thuốc. So khớp nguyên cụm từ, không phân biệt hoa thường. "Đầu tư" không cấm vì engine dùng nghĩa "đầu tư học thêm"; câu chữ mới không dùng "đầu tư" theo nghĩa tiền bạc.
  - **(ii) KHÔNG ĐỌC:** `NO_SPEECH_TERMS` ở `src/content/noSpeech.ts` (12.8), không bổ sung từ mới ở bản đầu. Câu chứa từ này vẫn hiện chữ, chỉ không đọc. Ngoài ra **không đọc** (chỉ hiện chữ): bảng 4 điều kiện Tòng cách, các số phần trăm, danh sách thói quen và công việc; Thầy chỉ đọc lý do chính, chiến lược theo Thập Thần và kết luận (3C.6).
- **Không bao giờ** gợi ý vật phẩm, cúng giải, hay "phải làm thế này mới tránh được".

### 14.9 Kiểm thử

- `tests/fixtures/nguhanh-golden.json`: 24 lá số của `NGU-HANH-SO-SANH.md` mục 3, mỗi lá có tứ trụ, kết quả engine mong đợi (strength, method, dung, hy, ky, grade) và chỗ cho đáp án người luận.
- **Snapshot riêng** `tests/nguhanh-snapshot.test.ts` (500 lá sinh từ `batTuChart`), cùng cách băm như `core-snapshot`, KHÔNG đụng `tests/fixtures/core-snapshot.json`. Sinh lại chỉ khi cố ý đổi hệ số, có ghi lý do trong commit.
- **Bất biến** (500 lá): tổng trọng số các cách luận = 1; dụng ≠ kỵ; cừu khác dụng và hỷ (hoặc null); Chân thì không cổng nào trượt; Giả thì cách thuận thế ≤ `giaMaxWeight`; câu hỏi kiểm chứng chỉ trỏ tới năm, Đại Vận đã qua và đúng ngưỡng tuổi 14.5.
- **Đối chiếu với bảng so sánh:** chạy `compareWithLegacy` trên 3000 lá (seed 20261111) phải ra đúng 36,1% / 61,2% / 40,5% và bảng nguyên nhân ở đầu mục này.
- **Parity Bát Tự và Tổng hợp** không đổi một test nào (điều kiện của phương án B).
- Test nội dung (3C.3): mọi mã có câu; không chuỗi rỗng hay "undefined"; danh sách (i) không xuất hiện; câu chứa từ (ii) có cờ không đọc; lời nhắc ở đầu và cuối.

### 14.11 Kiểm tra độ nhạy theo trường phái

Hai preset của engine (`PRESETS`: mặc định và coi trọng nguyệt lệnh hơn) được chạy trên cùng lá số (`analyzeSensitivity`, `src/core/nguhanh/sensitivity.ts`). Cùng Dụng thần thì báo "Kết luận này ổn định"; khác thì báo "chưa vững", nêu Dụng thần của bộ kia và dặn xem như gợi ý; Thầy nói thêm một câu lưu ý. Đo trên 3000 lá số ngẫu nhiên: 78,7% ổn định, 21,3% chưa vững. Đây là chỉ báo độ tin cậy, không đổi Dụng thần đang hiển thị.

**Nguồn gốc mô hình cân bằng (nói thẳng):** chỉ vòng sinh khắc là kiến thức cổ truyền; dạng phương trình tuyến tính, các hệ số (S 0,30, K 0,05, DELTA 0,10, 5 bước) do dự án tự đặt, K được chọn nhỏ để hệ hội tụ về 20% mỗi hành (K 0,15 thì không), không từ sách hay tác giả nào, chưa kiểm chứng với người luận. Trên 1500 lá số ngẫu nhiên, Dụng thần của engine đứng hạng 1 theo mô hình chỉ khoảng 39% (hạng 2: 32%, 3: 18%, 4: 10%, 5: 1%). Vì vậy mô hình nằm trong phần gập "tuỳ chọn" ở mục Phân tích ngũ hành, ghi rõ là mô hình tự đặt, và không bao giờ đổi Dụng thần.

**Hệ vi phân (tuỳ chọn thứ hai):** cùng mô hình viết liên tục dx/dt = S·(P − I)·x − K·P²·x (P là phép dịch vòng sinh), tích phân RK4 trong 5 đơn vị thời gian rồi chuẩn hoá tổng về 100%; người dùng đổi qua lại bằng nút chọn trong phần gập. Điểm đứng yên vẫn là 20% mỗi hành. Hai cách viết cho cùng hạng ở 99,1% trong 1500 lá số, nên đổi sang vi phân không làm mô hình đáng tin hơn (hệ số vẫn tự đặt); Dụng thần đứng hạng 1 ở 39,0%.

**Điểm cân bằng theo mùa sinh và Nhật Chủ (tuỳ chọn thứ ba):** thay vì 20% đều, điểm cân bằng τ dịch theo mùa (mùa lạnh Hoả +5%, mùa nóng Thuỷ +5%) và vượng suy (Thân nhược hoặc Cực vượng: hành Nhật Chủ và hành sinh ra nó +4% mỗi hành; Thân vượng hoặc Cực nhược: hành Nhật Chủ sinh ra và hành Nhật Chủ khắc +4% mỗi hành), rồi chuẩn hoá. Hệ chạy trên y = x/τ nên τ là điểm đứng yên. Mức dịch là hệ số tự đặt. Đo trên 1500 lá số (sai phân): Dụng thần đứng hạng 1 ở 33,9% (đều 20%: 38,8%), hạng 1 hoặc 2 ở 69,1% (đều: 70,7%). Tức là thêm mùa sinh và Nhật Chủ theo cách này không làm mô hình khớp engine hơn; cần đáp án người luận để biết bên nào gần thực tế.

**Mô hình hệ động lực 5 nút** (sinh là cạnh +, khắc là cạnh −, trạng thái cân bằng, can thiệp tối thiểu) chỉ nên làm hình minh hoạ cho Thầy giải thích "vì sao cần thêm hành này", không là phương pháp chọn Dụng thần thứ ba. Đã làm (12/11/2026): khối `cycle` ở mục "Tóm lại" của Phân tích ngũ hành (nét liền sinh, nét đứt khắc, tô đậm hai cạnh vào Dụng thần); Thầy không đọc hình này.

### 14.12 Hiệu chỉnh engine theo lá số mẫu trong sách (12/11/2026)

**Bối cảnh:** đối chiếu 50 lá số mẫu trong sách (14.1) cho khớp 24/50 (48%), rơi vào điều 5. Chủ dự án yêu cầu hiệu chỉnh.

**Cách làm:** chia 50 lá thành tập chỉnh 34 lá và tập thử 16 lá (mỗi sách, cứ lá thứ ba vào tập thử). Dò lưới 7 tham số trên tập chỉnh: `follow.candidateWeak` (0,25–0,40), `follow.weakRootMax` (0,8–1,2), độ chênh theo mùa (×0,5–1), trọng số chi tháng (1,5–2,5), ngưỡng nhược/vượng (0,35–0,45 / 0,50–0,60), mức ưu tiên Điều hậu `climatePriorityShare` (6–12%, trước là `climateMinShare / 2` cố định). Mỗi bộ đo thêm tỷ lệ đổi Dụng thần trên 3000 lá ngẫu nhiên.

**Kết quả:**

| Phương án | 50 lá (khớp 14.1 / trùng / ngược) | Tập chỉnh | Tập thử | Đổi Dụng thần trên 3000 lá |
|---|---|---|---|---|
| v0.2 (trước) | 24 / 18 / 10 | 17/34 | 7/16 | 0% |
| **`weakRootMax` 1,0 (đã chọn)** | **25 / 20 / 9** | 18/34 | 7/16 | 1,5% |
| Điều hậu ưu tiên dưới 12% | 25 / 18 / 9 | 18/34 | 7/16 | 10,5% |
| Hai thay đổi trên | 26 / 20 / 8 | 19/34 | 7/16 | 11,7% |
| Tốt nhất trên tập chỉnh (đổi 6 tham số) | — | 22/34 | 9/16, trùng giảm 6 → 4–5 | — |

**Lựa chọn:** chỉ đổi `weakRootMax` 0,8 → 1,0 trong `DEFAULT_CONFIG`. Lý do theo sách: một trung khí ở chi tháng (0,5 × 2 = 1,0) hay trung khí ở chi ngày cộng một dư khí vẫn là gốc yếu, sách vẫn nhận Tòng (tbct-13 Tòng Tài dù Thìn có Ất, Tuất có Đinh). Ảnh hưởng nhỏ: 1,5% lá số ngẫu nhiên đổi Dụng thần, Tòng cách thành cách (Chân hoặc Giả) từ 4,4% lên 6,4%; so với legacy, đảo chiều tăng 40,5% → 42,0% (thêm 43 lá; nhóm nguyên nhân Tòng cách 100 → 152, các nhóm khác giảm nhẹ), lá có hai cách luận 132 → 192. `REFERENCE_CONFIG` giữ nguyên v0.2 để test chứng minh bản port; `climatePriorityShare` thành tham số nhưng giữ 6% (không đổi hành vi).

**Phương án bị loại:**
- *Bộ tốt nhất trên tập chỉnh (đổi 6 tham số cùng lúc):* tập chỉnh lên 22/34 nhưng tập thử chỉ 9/16 và số lá trùng thẳng ở tập thử giảm. Đó là dấu hiệu chỉnh vừa khít 34 lá chứ không tốt lên thật.
- *Ưu tiên Điều hậu rộng hơn:* thêm 1 lá nhưng 6–11% người dùng đổi Dụng thần; không đáng.
- *Chỉ nới `candidateWeak`:* một mình không đổi lá nào (các lá Tòng vẫn trượt cổng gốc hoặc can lộ).

**Điều tham số không chữa được (cần đổi thuật toán, nên có người luận duyệt trước):**
1. Không có Hoá khí cách (tbct-19, tbct-26).
2. Thân vượng: engine chọn Tài khi Ấn nhiều hơn Tỷ, Quan Sát khi Quan Sát ≥ 1, còn lại Thực Thương, theo điểm. Sách chọn theo chữ thấu can và có gốc (ttt-83, ttt-105 dùng Thực Thương dù có Quan Sát; tbct-21, ttt-71 dùng Quan Sát dù Thực Thương nhiều hơn), nên không có ngưỡng điểm nào khớp cả hai phía.
3. Thân nhược mà Thực Thương quá nặng: sách có khi dùng Tài tiết Thực Thương (tbct-16) thay vì Ấn.
4. Lá engine xếp "trung hoà": bù hành yếu nhất chỉ khớp 1/4 lá; chia theo phía vượng/nhược cũng chỉ 1/4.
5. Vài lá sách thấy thân mạnh nhờ trường sinh, lộc ở chi ngày, giờ mà engine thấy nhược (ttt-26, ttt-46); làm phẳng hệ số mùa chữa được hai lá này nhưng làm hỏng lá khác.

Sau hiệu chỉnh vẫn khớp đúng 50% (25/50), vừa chạm ngưỡng của điều 5; khác biệt so với v0.2 là 1 lá, tập thử không đổi, nên **không coi là engine đã đáng tin hơn**. Muốn tiến xa hơn cần thêm dữ liệu (thêm lá số từ sách, hoặc người luận) và quyết định về các điểm thuật toán ở trên.

### 14.10 Thứ tự triển khai

| Bước | Việc | Xong khi | Chủ dự án duyệt |
|---|---|---|---|
| 3C.2 | `src/core/nguhanh` (port, dùng bảng app, mã thay câu, Đại Vận theo 14.5), `compareWithLegacy`, `scripts/compare-dung-than.ts`, `tsx` vào devDependencies | Test (a)–(d) và (b2) của kit, test 14.9; số so sánh khớp; `npm test`, `npm run build` xanh; `core-snapshot` không đổi | Không |
| 3C.3 | `docs/NGU-HANH.md` và `src/content/nguhanh` (câu đối chiếu 14.1, nhãn 14.8, hai danh sách) | Test nội dung xanh; 24 lá golden dựng câu không lỗi | **Có:** đọc duyệt `docs/NGU-HANH.md` trước khi sang 3C.4 |
| 3C.4 | Mục "Phân tích ngũ hành" trên màn Bát Tự; liên kết ở Tổng hợp; KHÔNG đổi ảnh chia sẻ, dải Đại Vận, thẻ Tra Lưu Niên (14.2) | `BatTuScreen.test.tsx` cập nhật; 360px không cuộn ngang, sáng/tối, vùng chạm ≥ 44px, aria cho thanh biểu đồ | **Có:** xem 3 lá (Chân, Giả, thường) và 1 lá `nguoc` trên điện thoại hoặc bản Cloudflare |
| 3C.5 | Lược đồ v4, thẻ kiểm chứng, xử lý sửa ngày giờ sinh (14.6) | Test (a)–(e) của kit, thêm test `birthKey`; CLAUDE.md ghi lược đồ v4 | Không |
| 3C.6 | Kịch bản Thầy đọc phần Ngũ hành, hỏi kiểm chứng trong Tĩnh thất. Chạy **sau 3B.6** | Test (a)–(e) của kit | Không |
| 3C.7 | Lời dẫn và câu hỏi của Thầy. Chạy **sau 3B.8** | Test 3C.6 xanh | **Có:** duyệt `docs/LOI-THAY.md` mục "Ngũ hành" |
| 3C.8 | Nối Dụng thần sang Bát Trạch, La Bàn | **Không chạy** (14.3) | — |
| 3C.9 | Data safety, QA checklist (trước 8.1, 9.1) | Theo kit | Không |

Khi chủ dự án điền đáp án: chạy lại so sánh với đáp án, rồi xét điều kiện chuyển phương án ở 14.1 trước bước kế tiếp.
