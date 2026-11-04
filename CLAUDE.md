# Lý Số Trọn Bộ — app Android (React + Vite + Capacitor)

App tiếng Việt gồm 7 công cụ: Tử Vi Đẩu Số, Bát Tự, Lục Hào, Bát Trạch, Nạp Âm, Tổng Hợp và La Bàn Phong Thủy. Phát hành trên Google Play qua Capacitor (Android). Toàn bộ phép tính chạy trên máy, không có backend, không gửi dữ liệu người dùng đi đâu.

## Lệnh hay dùng

- `npm test` — bộ kiểm thử vàng (`tests/golden.test.ts`). PHẢI xanh trước và sau mọi thay đổi ở `src/core`.
- `npm run dev` — chạy app trên trình duyệt (cổng 5173, Codespaces tự mở preview).
- `npm run build` — typecheck + build ra `dist/`.
- `npm run android:debug` — build + `cap sync` + Gradle → `android/app/build/outputs/apk/debug/app-debug.apk`.
- `npm run android:release` — build AAB để đưa lên Google Play (cần cấu hình ký ở Phase 8).

## Cấu trúc

- `src/core/` — engine tính toán, là NGUỒN SỰ THẬT. Hiện là JS trích nguyên văn từ bản web đã kiểm chứng; `src/core/index.ts` là điểm vào duy nhất mà UI được phép import.
- `src/App.tsx` — màn hình "Tra nhanh" tạm thời (bản khởi tạo 0.1).
- `public/legacy/` — bản web đầy đủ đã kiểm chứng (`lyso-toolkit.html`, `la-ban-phong-thuy.html`). Dùng làm TÀI LIỆU THAM CHIẾU cho UI, câu chữ giải thích, phần "Giải thích chỉ số", "Tổng kết", và logic đọc thành lời. App hiện mở được các trang này để dùng tạm; xoá khỏi app khi đã có màn hình mới tương đương (Phase 3).
- `docs/ARCHITECTURE.md` — các quyết định kiến trúc (Phase 1.1): điều hướng, trạng thái, lưu trữ, giao diện, cấu trúc `src/core`/`src/content`, plugin, kiểm thử. ĐỌC TRƯỚC khi làm bất kỳ phase nào; muốn đổi quyết định thì sửa tài liệu này trước.
- `docs/` — 5 tài liệu Word (Phần 1–4 và bản Trọn bộ). Là căn cứ lý thuyết cho mọi công thức.
- `android/` — project Android do Capacitor sinh ra (compileSdk 36, Java 21, Gradle 8.14).

## Quy tắc bắt buộc

- Không tự ý đổi công thức an sao / lập trụ / Mệnh Quái / Nạp Âm. Nếu nghi có sai, đối chiếu `docs/` và các nguồn chuẩn, viết test chứng minh trước, rồi mới sửa — và ghi rõ trong commit.
- Mọi chữ hiển thị cho người dùng là tiếng Việt có dấu, giọng văn "bài học nhỏ" giống bản web; luôn giữ dòng lưu ý rằng nội dung mang tính văn hoá, tham khảo.
- Lịch âm: dùng UTC+7 từ năm 1968, UTC+8 trước 1968 (`LySoUtil.lunarTzForSolarYear`). Nạp Âm đổi năm theo Tết; Bát Tự và Bát Trạch đổi năm theo Lập Xuân.
- Kiểm tra ngày nhập (`LySoUtil.validSolar`, âm lịch thì đổi qua lại để kiểm tra) trước khi tính; không được âm thầm "cuộn" 31/2 thành 3/3.
- Android WebView KHÔNG có `speechSynthesis` → đọc thành lời phải dùng plugin native `@capacitor-community/text-to-speech` (lang `vi-VN`), chia văn bản thành đoạn ngắn.
- La bàn: chỉ hoạt động trên máy thật có cảm biến từ trường; luôn có chế độ xoay tay dự phòng và thông báo chẩn đoán rõ ràng (xem logic trong `public/legacy/la-ban-phong-thuy.html`).
- Không commit khoá ký (`*.jks`, `*.keystore`, `keystore.properties`). Mật khẩu ký để trong Codespaces Secrets.
- Mobile-first: vùng chạm tối thiểu 44px, chạy tốt ở chiều rộng 360px, hỗ trợ chế độ sáng/tối, có nhãn truy cập (aria) cho nút chỉ có biểu tượng.
