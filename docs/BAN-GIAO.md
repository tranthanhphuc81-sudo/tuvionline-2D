# Bàn giao sang máy khác (26/11/2026)

Ghi lúc chuyển việc từ máy Windows cũ (`E:\TuViOnline-2D`) sang máy mới. Đọc cùng `CLAUDE.md`, `docs/ARCHITECTURE.md` và `docs/PROGRESS.md`.

## 1. Trạng thái trên GitHub

- `main` ở `3cdd424` (merge PR #40, nhóm câu hỏi "Việc hôm nay" của Hỏi chuyện Thầy). Bản Cloudflare https://lyso-tron-bo.pages.dev và APK thử (`lyso-debug-apk`) đã build từ commit này.
- Mọi nhánh trên máy cũ đều khớp với GitHub: không có commit chưa đẩy, không có stash, không có thay đổi chưa commit.
- Hai PR đang mở:
  - **#41** `claude/xem-ngay`: Xem ngày tốt xấu (Hoàng đạo, thập nhị trực, giờ hoàng đạo, xung tuổi). Làm ở một phiên khác, chưa duyệt. Có thể bổ sung cho nhóm "Việc hôm nay", vì nhóm đó chưa dùng các bảng này (ARCHITECTURE 16.3.1).
  - **#42** `claude/video-cham-tuong-tac`: video lối vào chậm hơn, dừng ở cổng, cửa chính điện, án thư. **Chưa merge**: mã tính mốc theo video làm chậm 30 giây, còn `src/assets/journey/video/loi-vao.mp4` vẫn là bản 20 giây ngày 13/11. Merge lúc này thì không dừng ở án thư và ranh giới trạm rơi sai cảnh. Khi có video mới: thay file trên nhánh này, thêm một test đọc độ dài file mp4 và so với mốc cuối `VIDEO_SEGMENTS`, bỏ "[chờ video 30 giây]" khỏi tiêu đề rồi mới merge.
- Kiểm tra "Cloudflare Workers and Pages" (Workers Builds: tuvionline-2d) đỏ ở các PR gần đây (#39, #40). Là kiểm tra tùy chọn, không chặn merge, chưa xem lý do. Không phải quy trình đăng `lyso-tron-bo` (quy trình đó chạy bằng GitHub Actions).

## 2. Thứ KHÔNG có trong git, phải chép tay nếu cần

| Đường dẫn | Là gì | Ghi chú |
|---|---|---|
| `docs/sach/` | 2 PDF *Tử Bình Chân Thuyên*, *Trích Thiên Tủy* (khoảng 74 MB) | Sách có bản quyền, cố ý không commit (`.gitignore`). Cần khi chạy `npm run compare:sach` hoặc đối chiếu thêm lá số sách. |
| `spike/chitay/truth/` | Điểm chấm và đường chuẩn trên ảnh tay thật | Dữ liệu riêng, repo công khai nên **không được commit**. Chép bằng USB hoặc ổ riêng. |
| `spike/chitay/index.html`, `main.ts`, `public/sample.jpg` | Trang chấm chỉ tay chỉ dùng trên máy | Cùng lý do, nằm trong `spike/chitay/.gitignore`. |
| `.claude/launch.json` | Cấu hình chạy thử trên trình duyệt cho Claude | Không cần chép, Claude tự tạo lại (`dev` cổng 5173, `chitay` cổng 5180). |
| `.claude/worktrees/xem-ngay` | Bản làm việc của PR #41 | Đã đẩy đủ lên GitHub, không cần chép. |
| `lyso-app/` | Vài file Android lẻ (khoảng 10 KB) | Rác, không cần chép. |

WASM của MediaPipe (`public/palm/vision_wasm_internal.*`) và mọi thứ trong `android/` sinh ra khi build: không cần chép.

## 3. Cài trên máy mới

```powershell
git clone https://github.com/tranthanhphuc81-sudo/tuvionline-2D.git
cd tuvionline-2D
npm install
npm test        # kết quả đúng: 904 test xanh
npm run dev     # cổng 5173
```

Nên cài GitHub CLI để Claude mở và theo dõi PR trực tiếp (máy cũ không có nên phải mở PR qua trình duyệt):

```powershell
winget install --id GitHub.cli
gh auth login
```

APK chỉ build bằng GitHub Actions khi có thay đổi trên `main` (máy cũ không có Android SDK, JDK 21). Muốn build tại chỗ thì cần Android SDK, JDK 21, Gradle 8.14 (`npm run android:debug`).

## 4. Ghi nhớ của Claude trên máy cũ (không tự sang máy mới)

Claude lưu ghi nhớ trong hồ sơ người dùng của máy, không trong repo. Những điều cần biết:

- **Bản xem và APK**: đẩy lên `main` thì GitHub Actions đăng https://lyso-tron-bo.pages.dev và build APK debug (`lyso-debug-apk`). Repo công khai nên đọc kết quả chạy qua GitHub API không cần đăng nhập. APK thử tải giao diện từ Cloudflare (`LYSO_LIVE_URL`), sửa web không phải cài lại.
- **Google Play đang hoãn** (từ 06/11/2026): đừng nhắc chốt appId, email, tài khoản Play hay tìm người thử cho tới khi chủ dự án quay lại việc phát hành. Kế hoạch ở `docs/RELEASE.md`; khi quay lại phải đọc lại quy định Google. Tính năng mới vẫn giữ mục 3 của `docs/RELEASE.md`: không thêm SDK hay lệnh gửi dữ liệu nếu chưa bàn.
- **Chỉ tay**: chủ dự án chọn cách chạm điểm (người dùng chạm vài điểm, máy bám rãnh), đã đạt cửa kiểm chứng trên S25 Ultra (ARCHITECTURE mục 13). Máy tự dò chỉ đưa vị trí gợi ý, không đọc được bàn tay riêng: app không được luận từ nét chưa được người dùng xác nhận. Không chụp màn hình ảnh tay của người dùng.
- **Video lối vào**: xem PR #42 ở mục 1.

## 5. Việc đang chờ chủ dự án

- Video lối vào bản làm chậm 30 giây (PR #42).
- Duyệt câu chữ mới ở `docs/LOI-THAY.md`: mục "Hỏi chuyện Thầy" và "Hỏi chuyện Thầy: Việc hôm nay" (đánh dấu chờ duyệt).
- Duyệt PR #41 (Xem ngày tốt xấu).
- Nghe thử trên APK: giọng Thầy đọc câu trả lời Hỏi chuyện Thầy, rung khi gõ chuông và thắp hương.
