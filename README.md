# Lý Số Trọn Bộ — bộ khởi tạo app Android

Bộ khởi tạo này đưa Bộ Công Cụ Lý Số và La Bàn Phong Thủy từ bản web sang một dự án app thật (React + Vite + TypeScript + Capacitor), chạy được ngay trong GitHub Codespaces và build ra file APK/AAB cho Google Play.

Những gì đã có sẵn:

- Engine tính toán của 6 hệ thống (`src/core/`), trích nguyên văn từ bản web đã kiểm chứng, kèm **23 bài kiểm thử vàng** (`tests/golden.test.ts`) — trong đó có trọn ví dụ lá số Chương 10 của tài liệu Phần 1, ví dụ Bát Tự, Lục Hào, Bát Trạch, Nạp Âm. Tất cả đang xanh.
- Màn hình "Tra nhanh" (bản 0.1) xem 4 hệ thống cùng lúc, cộng nút mở bản web đầy đủ ngay trong app để dùng tạm.
- Project Android (`android/`) đã sinh sẵn, `appId` tạm là `vn.lyso.app`.
- `.devcontainer/` cài sẵn Node 22, Java 21, Android SDK 36 và Claude Code khi tạo Codespace.
- `CLAUDE.md` — hướng dẫn dự án cho Claude Code, và `PROMPT-KIT.md` — các phase để Claude Code dựng app hoàn chỉnh.

## 1. Đưa lên GitHub

Trên máy tính của bạn (đã cài `git` và `gh`):

```bash
unzip lyso-app.zip && cd lyso-app
git init && git add . && git commit -m "Khởi tạo app Lý Số Trọn Bộ (bản 0.1)"
gh repo create lyso-app --private --source=. --push
```

## 2. Mở Codespace

Trên trang repo: **Code → Codespaces → ⋯ → New with options**, chọn máy **4-core / 16 GB** (Gradle cần RAM), rồi **Create codespace**. Lần đầu mất khoảng 5–10 phút để cài Android SDK. Khi xong, terminal sẽ báo `✓ Android SDK sẵn sàng`.

## 3. Kiểm tra nhanh

```bash
npm test            # 23 bài kiểm thử vàng phải xanh
npm run dev         # xem app trên trình duyệt (Codespaces tự mở tab preview cổng 5173)
npm run android:debug
```

Lệnh cuối tạo `android/app/build/outputs/apk/debug/app-debug.apk`. Chuột phải vào file trong cây thư mục → **Download**, chép sang điện thoại Android và cài (cho phép "cài ứng dụng không rõ nguồn gốc"). Cảm biến la bàn và đọc thành lời chỉ thử được trên máy thật.

## 4. Dựng app hoàn chỉnh với Claude Code

Trong terminal của Codespace gõ `claude`, đăng nhập lần đầu, rồi làm lần lượt từng phase trong `PROMPT-KIT.md` (dán từng prompt, xem kết quả, commit, rồi sang prompt tiếp theo).

## Lưu ý

- Đổi `appId` trong `capacitor.config.ts` và `android/app/build.gradle` **trước khi** đưa lên Google Play — sau khi phát hành không đổi được nữa (Phase 8 hướng dẫn).
- Không commit khoá ký app; dùng Codespaces Secrets.
- Nội dung app mang tính văn hoá, tham khảo — giữ nguyên các dòng lưu ý này khi dựng lại giao diện.
