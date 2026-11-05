# Lý Số Trọn Bộ — app Android (React + Vite + Capacitor)

App tiếng Việt gồm 7 công cụ: Tử Vi Đẩu Số, Bát Tự, Lục Hào, Bát Trạch, Nạp Âm, Tổng Hợp và La Bàn Phong Thủy. Phát hành trên Google Play qua Capacitor (Android). Toàn bộ phép tính chạy trên máy, không có backend, không gửi dữ liệu người dùng đi đâu.

## Lệnh hay dùng

- `npm test` — bộ kiểm thử vàng (`tests/golden.test.ts`). PHẢI xanh trước và sau mọi thay đổi ở `src/core`.
- `npm run dev` — chạy app trên trình duyệt (cổng 5173, Codespaces tự mở preview).
- `npm run build` — typecheck + build ra `dist/`.
- `npm run android:debug` — build + `cap sync` + Gradle → `android/app/build/outputs/apk/debug/app-debug.apk`.
- GitHub Actions (`.github/workflows/android-debug.yml`) — mỗi lần đẩy lên `main` tự chạy test và build APK debug; lấy ở tab Actions, mục Artifacts `lyso-debug-apk`. Dùng khi máy không có Android SDK.
- `npm run android:release` — build AAB để đưa lên Google Play (cần cấu hình ký ở Phase 8).

## Cấu trúc

- `src/core/` — engine tính toán, là NGUỒN SỰ THẬT. TypeScript strict (`calendar/`, `canchi/`, `tuvi/`, `battu/`, `luchao/`, `battrach/`, `napam/`, `tonghop/`, `laban/`, `birth.ts`), công thức giữ nguyên từ bản web đã kiểm chứng; `src/core/index.ts` là điểm vào duy nhất mà UI được phép import. Engine trả số liệu/mã, không trả câu văn.
- `src/content/` — câu chữ cho người đọc, chép NGUYÊN VĂN từ legacy, dạng hàm thuần nhận kết quả engine (ARCHITECTURE mục 5.4).
- `tests/core-snapshot.test.ts` — bản chụp ~70.000 đầu ra engine; KHÔNG sinh lại (`UPDATE_CORE_SNAPSHOT=1`) để làm test xanh.
- `src/app/` — khung app: `App.tsx` (thanh trên, 5 tab giữ mount, thanh tab dưới), `router.ts` (ngăn xếp mỗi tab + bảng quy tắc Back), `boot.ts`, `context.tsx`.
- `src/state/` — store, hành động, lược đồ `lyso.state` + migration; `src/platform/` — bọc plugin Capacitor (storage, lifecycle, back, haptics, compass, tts, device, ambientAudio); `src/ui/` — tokens, base, font offline, component dùng chung; `src/features/` — các màn hình (home, profiles, settings, tuvi, battu, luchao, phongthuy gồm Bát Trạch, La Bàn, Nạp Âm).
- `tests/parity/` — chạy trang legacy trong jsdom và so câu chữ với `src/content` (đã có cho Tử Vi, Bát Tự, Lục Hào, Bát Trạch, Nạp Âm, Tổng Hợp, La Bàn; bộ hồ sơ mẫu dùng chung `sampleProfiles()`). Sửa câu chữ ở `src/content` mà test này đỏ nghĩa là đã lệch nguyên văn legacy.
- `docs/legacy/` — hai trang web đã kiểm chứng (`lyso-toolkit.html`, `la-ban-phong-thuy.html`). KHÔNG đóng gói vào app, giữ làm TÀI LIỆU THAM CHIẾU và để `tests/parity/` đối chiếu câu chữ.
- `docs/ARCHITECTURE.md` — các quyết định kiến trúc (Phase 1.1): điều hướng, trạng thái, lưu trữ, giao diện, cấu trúc `src/core`/`src/content`, plugin, kiểm thử. ĐỌC TRƯỚC khi làm bất kỳ phase nào; muốn đổi quyết định thì sửa tài liệu này trước.
- `docs/` — 5 tài liệu Word (Phần 1–4 và bản Trọn bộ). Là căn cứ lý thuyết cho mọi công thức.
- `android/` — project Android do Capacitor sinh ra (compileSdk 36, Java 21, Gradle 8.14).

## Quy tắc bắt buộc

- Không tự ý đổi công thức an sao / lập trụ / Mệnh Quái / Nạp Âm. Nếu nghi có sai, đối chiếu `docs/` và các nguồn chuẩn, viết test chứng minh trước, rồi mới sửa — và ghi rõ trong commit.
- Mọi chữ hiển thị cho người dùng là tiếng Việt có dấu, giọng văn "bài học nhỏ" giống bản web; luôn giữ dòng lưu ý rằng nội dung mang tính văn hoá, tham khảo.
- Lịch âm: dùng UTC+7 từ năm 1968, UTC+8 trước 1968 (`LySoUtil.lunarTzForSolarYear`). Nạp Âm đổi năm theo Tết; Bát Tự và Bát Trạch đổi năm theo Lập Xuân.
- Kiểm tra ngày nhập (`LySoUtil.validSolar`, âm lịch thì đổi qua lại để kiểm tra) trước khi tính; không được âm thầm "cuộn" 31/2 thành 3/3.
- Android WebView KHÔNG có `speechSynthesis` → đọc thành lời phải dùng plugin native `@capacitor-community/text-to-speech` (lang `vi-VN`), chia văn bản thành đoạn ngắn.
- La bàn: chỉ hoạt động trên máy thật có cảm biến từ trường; luôn có chế độ xoay tay dự phòng và thông báo chẩn đoán rõ ràng (ARCHITECTURE mục 11, plugin nội bộ `android/app/src/main/java/vn/lyso/app/LySoDevicePlugin.java`; `src/platform/compass.ts`).
- Không commit khoá ký (`*.jks`, `*.keystore`, `keystore.properties`). Mật khẩu ký để trong Codespaces Secrets.
- Mobile-first: vùng chạm tối thiểu 44px, chạy tốt ở chiều rộng 360px, hỗ trợ chế độ sáng/tối, có nhãn truy cập (aria) cho nút chỉ có biểu tượng.
