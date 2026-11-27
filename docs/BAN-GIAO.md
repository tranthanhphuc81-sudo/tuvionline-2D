# Bàn giao sang máy khác (27/11/2026)

Ghi lúc chuyển việc từ máy Windows (`E:\TuViOnline-2D`) sang máy khác. Đọc cùng `CLAUDE.md`, `docs/ARCHITECTURE.md` và `docs/PROGRESS.md`. Lần bàn giao trước (26/11/2026) đã được thay bằng bản này.

## 1. Trạng thái trên GitHub

- `main` có đủ mọi việc tới ngày 27/11/2026. Bản Cloudflare https://lyso-tron-bo.pages.dev và APK thử (`lyso-debug-apk`) build từ `main`, workflow cuối đều xanh (`02f8536`, sau đó chỉ có commit tài liệu).
- **Không còn PR mở.** Mọi nhánh trên máy này đều đã đẩy lên GitHub: không có commit chưa đẩy, không có stash, không có thay đổi chưa commit.
- Việc đã lên `main` ngày 27/11/2026 (mới nhất trước):
  - Tách gói JS: bốn tab Tử Vi, Bát Tự, Lục Hào, Phong thủy dựng ở lần đầu bấm vào; Tổng hợp, Xem ngày, Cài đặt, Hồ sơ, khung Hỏi chuyện Thầy nạp khi mở; JS lúc mở app 850 → 622 KB (nén 270 → 204 KB); tải gói lỗi thì chỉ màn đó báo "Thử lại" (`02f8536`, ARCHITECTURE 1.2, 4.2).
  - PR #42 video lối vào chậm, dừng trước cổng, cửa chính điện, án thư. App phát file 20 giây sẵn có ở tốc độ 2/3 (`VIDEO_SLOW`), không dùng video AI 30 giây (`aa8d728`, ARCHITECTURE 12.12). Tiêu đề PR trên GitHub còn chữ "[chờ video 30 giây]" vì máy này không có `gh`.
  - Lục thân: sao chỉ lộ trên can, không gốc trong chi không còn bị gọi là "chỉ ẩn trong chi" (`a683c84`, ARCHITECTURE 15.8).
  - Hỏi chuyện Thầy thêm nhóm "Đời sống": tám câu ghép nguyên chữ "Từng mảng cuộc sống" của Tử Vi và "Lục thân" của Bát Tự; sửa "người con đời" (`d7de1f4`, ARCHITECTURE 16.3.2).
  - Quét truy cập màn Xem ngày, ô lịch tháng chạm đủ 44px (`a1b24ff`).
  - Việc hôm nay thêm một câu theo lịch truyền thống (`81d365c`, ARCHITECTURE 16.3.1).
  - PR #41 Xem ngày tốt xấu (`7faa30b`, ARCHITECTURE 17).
- Kiểm tra "Cloudflare Workers and Pages" (Worker `tuvionline-2d`) đã ngắt kết nối Git ngày 27/11/2026 theo ý chủ dự án: Worker riêng, luôn đỏ vì repo không có cấu hình wrangler, không liên quan quy trình đăng `lyso-tron-bo`. Worker vẫn còn, chưa xoá. Nếu kiểm tra này đỏ lại thì có người đã nối lại.

## 2. Thứ KHÔNG có trong git

| Đường dẫn | Là gì | Có cần chép? |
|---|---|---|
| `docs/sach/` | 2 PDF *Tử Bình Chân Thuyên*, *Trích Thiên Tủy* (74 MB) | Chép nếu còn đối chiếu lá số sách (`npm run compare:sach`). Sách có bản quyền, cố ý không commit (`.gitignore`). |
| `spike/chitay/truth/` | Điểm chấm và đường chuẩn trên ảnh tay thật (36 KB) | Chép bằng USB hoặc ổ riêng nếu còn làm bản thử chỉ tay. Dữ liệu riêng, repo công khai nên **không được commit**. |
| `spike/chitay/index.html`, `main.ts`, `public/sample.jpg`, `public/mp/` | Trang chấm chỉ tay chỉ dùng trên máy; `public/mp/` là bản chép mô hình và WASM MediaPipe | Chép cùng thư mục trên nếu cần; `public/mp/` lấy lại được từ `node_modules`. |
| `.claude/launch.json` | Cấu hình chạy thử trên trình duyệt cho Claude | Không cần. Claude tự tạo lại (`dev` cổng 5173). |
| `.claude/worktrees/xem-ngay`, `.claude/worktrees/video-cham` | Bản làm việc phụ của Claude, đang ở HEAD tách, sạch | Không cần, mọi thứ đã trên GitHub. |
| `lyso-app/` | Vài file Android lẻ (10 KB) | Rác, không chép. |
| `src/assets/journey/video/Lối vào Tĩnh thất - 30s.mp4` | Video AI 30 giây ngày 27/11 (10,9 MB), không dùng | **Không chép.** Nằm trong thư mục dự án nên làm test ngân sách 3 MB đỏ khi chạy test ở thư mục gốc. |

WASM của MediaPipe trong `public/palm/` (chép từ `node_modules` khi `dev`/`build`) và mọi thứ trong `android/` sinh ra khi build: không cần chép.

## 3. Cài trên máy mới

Máy này dùng Node 22.23.3, npm 10.9.9, Git 2.50.

```powershell
git clone https://github.com/tranthanhphuc81-sudo/tuvionline-2D.git
cd tuvionline-2D
npm install
npm test        # kết quả đúng: 948 test xanh (27/11/2026)
npm run dev     # cổng 5173
```

Nên cài GitHub CLI để Claude mở, đổi tên và theo dõi PR trực tiếp (máy này không có, nên PR được merge bằng `git merge --no-ff` rồi đẩy lên `main`):

```powershell
winget install --id GitHub.cli
gh auth login
```

APK chỉ build bằng GitHub Actions khi có thay đổi trên `main` (máy này không có Android SDK, JDK 21). Muốn build tại chỗ thì cần Android SDK, JDK 21, Gradle 8.14 (`npm run android:debug`).

## 4. Ghi nhớ của Claude (không tự sang máy mới)

Claude lưu ghi nhớ trong hồ sơ người dùng của máy, không trong repo. Những điều cần biết:

- **Bản xem và APK:** đẩy lên `main` thì GitHub Actions đăng https://lyso-tron-bo.pages.dev và build APK debug (`lyso-debug-apk`). APK thử tải giao diện từ Cloudflare (`LYSO_LIVE_URL`): sửa web thì chỉ cần tắt hẳn app rồi mở lại, đổi plugin hay Java mới phải cài APK mới. Repo công khai nên đọc kết quả chạy qua GitHub API không cần đăng nhập, nhưng chỉ 60 lần mỗi giờ: đừng hỏi dồn; hết lượt thì xem trang github.com/…/actions.
- **Cách chủ dự án làm việc:** Claude làm mỗi việc trên một nhánh `claude/…`, chạy đủ `npm test` và `npm run build`, thử trên trình duyệt khi có thay đổi nhìn thấy được, đẩy nhánh rồi hỏi merge. Chủ dự án trả lời "Merge luôn" thì merge vào `main`, chạy lại test trên bản merge, đẩy lên, xem hai workflow xanh. "Tiếp tục việc tiếp theo" nghĩa là tự chọn việc kế tiếp trong mục 5 của file này, `docs/PROGRESS.md`, hay việc còn mở.
- **Không `git add -A src` ở thư mục gốc** khi còn file video 30 giây chưa commit (mục 2): nó sẽ lọt vào commit. Add từng file. Chạy test ở thư mục gốc thì test ngân sách tài nguyên đỏ vì file đó; đó không phải lỗi mã.
- **Google Play đang hoãn** (từ 06/11/2026): đừng nhắc chốt appId, email, tài khoản Play hay tìm người thử cho tới khi chủ dự án quay lại việc phát hành. Kế hoạch ở `docs/RELEASE.md`; khi quay lại phải đọc lại quy định Google. Tính năng mới vẫn giữ mục 3 của `docs/RELEASE.md`: không thêm SDK hay lệnh gửi dữ liệu nếu chưa bàn.
- **Chỉ tay:** chủ dự án chọn cách chạm điểm (người dùng chạm vài điểm, máy bám rãnh), đã đạt cửa kiểm chứng trên S25 Ultra (ARCHITECTURE mục 13). Máy tự dò chỉ đưa vị trí gợi ý: app không được luận từ nét chưa được người dùng xác nhận. Không chụp màn hình ảnh tay của người dùng.
- **Video lối vào:** muốn mượt hơn thì làm bản chậm có nội suy từ chính `loi-vao.mp4` (CapCut "Smooth slow-mo" 0,67x, 720p, 24 fps, dưới khoảng 2,5 MB), đặt `VIDEO_SLOW = 1` và nhân mọi mốc với 1,5. Video tạo bằng Gemini không dùng được (cảnh khác, chữ và nút vẽ sẵn, dấu hình thoi).
- **Câu chữ:** Hỏi chuyện Thầy chỉ ghép kết quả và câu chữ đã có, không tạo luận mới (ARCHITECTURE 16). Chưa có câu cho học hành, bạn bè và đồng nghiệp, hợp tuổi; thêm là phải viết nội dung mới và chủ dự án duyệt.

## 5. Việc đang chờ chủ dự án

- Thử trên APK theo `docs/QA-CHECKLIST.md`, nhất là các mục mới:
  - Lối vào bản đầy đủ (Cài đặt → lối vào "Đầy đủ"): video có tự phát trong WebView không, phát chậm 2/3 có giật quá không, dừng đúng trước cổng, cửa chính điện, án thư.
  - Lần đầu bấm vào bốn tab công cụ có hiện ngay không (bấm thật sớm sau khi mở có thể thấy "Đang mở …" thoáng qua).
  - Giọng Thầy đọc câu trả lời Hỏi chuyện Thầy (cả nhóm Đời sống), rung khi gõ chuông và thắp hương.
- Duyệt câu chữ mới ở `docs/LOI-THAY.md`: mục "Hỏi chuyện Thầy", "Hỏi chuyện Thầy: Việc hôm nay" và "Hỏi chuyện Thầy: Đời sống" (đánh dấu chờ duyệt).
- Đọc duyệt câu chữ màn Xem ngày (`src/content/xemngay.ts`): lời giải 12 trực, bảng việc nên và nên tránh theo trực, cách gộp mức ngày.
- Dời file `src/assets/journey/video/Lối vào Tĩnh thất - 30s.mp4` ra khỏi thư mục dự án (hoặc xoá).
- Tuỳ chọn: sửa tiêu đề PR #42 trên GitHub (bỏ "[chờ video 30 giây]").
