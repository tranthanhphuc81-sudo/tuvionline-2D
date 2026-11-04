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
| 1 | 🏠 **Tổng hợp** | Màn hình chính: tóm tắt 4 hệ thống của người đang xem, ô lối tắt sang mọi công cụ. Phase 6 thay bằng "Tĩnh thất". |
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

- **Nâng cấp lược đồ:** `src/state/migrations.ts` chứa mảng `migrations[v]: (old) => new`. Khi khởi động, app đọc khoá
  `lyso.state` rồi chạy tuần tự từ `version` cũ lên bản mới nhất, kiểm tra hình dạng dữ liệu (hàm `parsePersisted` viết tay,
  trả lỗi rõ ràng), rồi mới render. Dữ liệu hỏng thì giữ một bản sao ở khoá `lyso.state.corrupt-<thời điểm>`, khởi động với
  trạng thái rỗng và báo cho người dùng biết. Không âm thầm xoá.
- **Migration 0 → 1:** nếu chưa có `lyso.state` mà `localStorage` có `lyso-shared-v1` (người dùng bản 0.1 đã nhập ở trang
  legacy chạy trong app, cùng origin), tạo hồ sơ đầu tiên từ dữ liệu đó.
- **Ghi:** gộp các lần ghi trong 300ms, và ghi ngay khi app vào nền (`App` sự kiện `pause`).
- **Sao lưu/khôi phục (Phase 7)** xuất và nhập đúng tài liệu này. Khôi phục cũng chạy qua `migrations`.

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
- **Định dạng câu chữ:** giữ chuỗi có một tập thẻ tối thiểu **chép thẳng từ legacy**, gồm `<b> <i> <br> <ul> <li>`. Hàm
  `parseRich()` trong `src/content/rich.ts` chuyển chuỗi thành cây `RichNode[]` (thẻ ngoài danh sách thì in ra dạng chữ thường).
  React vẽ cây này bằng component `<RichText>` mà **không dùng `dangerouslySetInnerHTML`**. Hàm `toPlainText()` lấy chữ thuần
  để đọc thành lời, làm phụ đề và chia sẻ.
- **Đơn vị nội dung:**
  ```ts
  interface Section { id: string; title: string; blocks: Block[] }
  interface Block   { id: string; rich: RichNode[]; tags?: ContentTag[]; ref?: { palace?: number; hao?: number; pillar?: number } }
  ```
  `id` ổn định (ví dụ `tuvi.explain.cuc`) để Phase 6 trỏ tới. `ref` chỉ ra block nói về cung, hào hay trụ nào, để thầy đọc
  tô sáng đúng chỗ. `tags` để dành cho cờ "không đọc thành lời" ở Phase 6. Danh sách nhãn do Phase 6.1 chốt, nên bây giờ
  chỉ khai báo kiểu `ContentTag = string`.
- `window.LySoInterp` chuyển sang `src/content/interp/` (bảng `STAR`, `PAIRS`, `FAMILY`…) cùng `src/content/<công cụ>/`.
  **Phần nào là tính toán** (độ sáng sao, `tuViYear`, `thapThanProfile`, chấm Vượng Suy, luận đoán Lục Hào, đánh giá nhà)
  thì chuyển vào `src/core/<công cụ>/` và viết test. Phần câu văn ở lại `src/content`.
- **Kiểm "nguyên văn" tự động** (mục 7.1, test đối chiếu): với mỗi hồ sơ mẫu, nạp `lyso-toolkit.html` trong jsdom, điền form,
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
| Chia sẻ ảnh kết quả | `@capacitor/share` + `@capacitor/filesystem` | 8.0.x + 8.1.x | 7.1 | Ghi PNG vào thư mục `Cache` rồi chia sẻ URI. Ảnh tạo bằng `html-to-image` (1.11.x, thư viện JS). Phase 7.1 chốt lại sau khi thử font offline. |
| Giữ màn hình sáng khi đo la bàn | `@capacitor-community/keep-awake` | 8.0.x | 4.2 | |
| Cảm biến la bàn | **Chốt ở Phase 4.1.** Hai ứng viên: `deviceorientationabsolute` của WebView, hoặc `@capgo/capacitor-compass` (8.1.x, đọc cảm biến native) | | 4.1 | |
| Biểu tượng và màn hình chờ | `@capacitor/assets` (dev) | 4.0.x | 8.2 | |

**Lớp bọc nền tảng:** mỗi plugin chỉ được gọi trong `src/platform/<việc>.ts`, ví dụ `tts.ts`, `storage.ts`, `haptics.ts`,
`share.ts`, `back.ts`, `lifecycle.ts`. Mỗi file kiểm `Capacitor.isNativePlatform()` và có bản dự phòng cho web. UI chỉ gọi hàm
trong `src/platform`, nhờ vậy test được bằng giả lập và chạy được `npm run dev`. Lớp `speak(text, { rate, pitch }): Promise<void>`
(Phase 5) nằm ở `src/platform/tts.ts`.

**Phương án bị loại:**
- *Cài sẵn mọi plugin ngay từ đầu:* thêm quyền và mã native khi chưa dùng, mỗi lần nâng cấp phải rà thêm.
- *`@capacitor/motion` cho la bàn:* chỉ bọc `deviceorientation` thường, không bảo đảm hướng tuyệt đối. Để Phase 4.1 cân nhắc
  cùng các phương án khác.

---

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
5. Tổng hợp đọc từ hồ sơ đang chọn (thay "Tra nhanh"). Các tab chưa dựng thì hiện nút mở trang legacy.
6. Kiểm ở 360px, rồi `npm run android:debug`.

### Phase 3: dựng lại từng công cụ

Phase 3.1 (quyết định bố cục lá số Tử Vi) phải xong trước 3.2. Mỗi công cụ đi theo cùng một khuôn:

1. Chuyển phần **tính toán** còn nằm trong legacy vào `src/core/<công cụ>/`, kèm test.
2. Chuyển **câu chữ** vào `src/content/<công cụ>/` (nguyên văn), kèm test đối chiếu legacy.
3. Dựng màn hình trong `src/features/<công cụ>/` (component nhận `focus`), có nút ẩn trang legacy.

Thứ tự công cụ: **3.2 Tử Vi** (lá số + `src/content/interp` dùng chung) → **3.3 Bát Tự** → **3.4 Lục Hào** (+ `haptics`)
→ **3.5 Bát Trạch, Nạp Âm** (+ tab con của Phong thủy, màn hình chọn cặp hợp hôn) → xoá
`public/legacy/lyso-toolkit.html` khỏi app, chuyển bản sao sang `docs/legacy/`. Test đối chiếu sẽ đọc từ `docs/legacy/`.

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
