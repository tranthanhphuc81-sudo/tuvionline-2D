# src/content/nguhanh — câu chữ của mục "Phân tích ngũ hành" (Phase 3C)

NỘI DUNG MỚI, **không chép nguyên văn legacy** và **không thuộc `tests/parity`** (ngoại lệ giống `src/content/palm`, ARCHITECTURE mục 14.4).

- Engine (`src/core/nguhanh`) chỉ trả mã và số. Thư mục này đổi mã thành câu: `render.ts` (từng mã), `index.ts` (các Section hoàn chỉnh), `plain.ts` (mục "Nói dễ hiểu": kết luận bằng lời thường, dựng từ số liệu của lá số, có ví dụ; mỗi nhánh trả một khoá trong `PLAIN_KEYS` và test kiểm mọi khoá đều có câu), `books.ts` + `sach.json` (mục "Lá số cổ giống bạn": 121 lá ví dụ của Tử Bình Chân Thuyên và Trích Thiên Tủy, câu "sách luận" là tóm tắt tự viết, không chép nguyên văn; cũng là bộ đối chiếu engine của `npm run compare:sach`).
- Phần legacy đã có thì **import, không chép**: `FAMILY` (`../interp/battu`) cho nét và nghề của Thập Thần.
- Danh sách từ cấm ở `vocab.ts`: (i) KHÔNG HIỆN (không được có trong mọi câu mới), (ii) KHÔNG ĐỌC là `NO_SPEECH_TERMS` ở `../noSpeech.ts` (câu vẫn hiện chữ). Mục 14.8.
- Câu để xem chứ không đọc thành lời (bảng điều kiện, phần trăm, vết tính, danh sách thói quen) gắn thẻ `no-speech` ở khối.
- Tài liệu duyệt: `docs/NGU-HANH.md` (sinh từ code bằng `npm run doc:nguhanh`, kèm câu ví dụ cho từng mã).
