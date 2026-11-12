# Câu chữ mục "Phân tích ngũ hành" (Phase 3C.3)

> **Tài liệu để chủ dự án đọc duyệt, sinh tự động ngày 12/11/2026 bằng `npm run doc:nguhanh`.** Câu chữ nằm trong `src/content/nguhanh`. Muốn sửa câu nào, ghi lại câu mới (hoặc sửa thẳng vào file code tương ứng) rồi chạy lại lệnh trên.
> Đây là NỘI DUNG MỚI, không chép nguyên văn legacy và không thuộc `tests/parity` (ngoại lệ giống chỉ tay). Giọng "bài học nhỏ", không hù doạ, không hứa hẹn. Quyết định gốc ở `docs/ARCHITECTURE.md` mục 14.

Phần dùng lại nguyên văn từ legacy, KHÔNG chép ở đây: nét và nghề của 5 nhóm Thập Thần (`FAMILY` trong `src/content/interp/battu.ts`), nghề theo hành (`HANH_INFO.nghe`).

## 1. Quy tắc (ARCHITECTURE 14.3, 14.8)

- Mục ngũ hành **không nêu màu, hướng, vật phẩm**. Mỗi màn một nguồn; câu giải thích ba nguồn ở mục 2 dưới đây.
- Không lời khuyên y tế, đầu tư tài chính, pháp lý cụ thể. Câu về sức khoẻ chỉ ở mức thói quen (ngủ đủ, vận động).
- Nhãn năm dùng cách nói mềm và luôn đi kèm gợi ý nên làm gì (mục 3).
- **Danh sách (i) KHÔNG HIỆN** (không được có trong bất kỳ câu mới nào, kể cả chữ chỉ để xem): cúng, giải hạn, hoá giải, hóa giải, trấn yểm, bùa, vật phẩm, kích tài, chiêu tài, mua, đeo để, chính xác, chắc chắn, tuyệt đối, dự đoán đúng, linh nghiệm, cổ phiếu, chứng khoán, tiền ảo, vay, thuốc. Có test chặn.
- **Danh sách (ii) KHÔNG ĐỌC** (câu vẫn hiện chữ, Thầy không đọc thành lời) là `NO_SPEECH_TERMS` ở `src/content/noSpeech.ts`: tai nạn, bệnh, ốm, tuổi thọ, trường thọ, chết, tử vong, qua đời, kiện tụng, kiện cáo, ly hôn, ly dị, ly thân, tai hoạ, tai họa, tai ương, hoả hoạn, hỏa hoạn, tổn hại, mổ, phẫu thuật, tang lễ, goá, góa, ung thư, sẩy thai, ngoại tình, chia tay.
- Khối chỉ để xem chứ không đọc (gắn thẻ `no-speech`): thanh 5 hành và phần trăm, vết tính "Vì sao ra kết quả này", bảng 4 điều kiện, danh sách thói quen và lĩnh vực, ghi chú thêm. Thầy chỉ đọc kết luận, lý do chính và chiến lược (3C.6).

## 2. Lời nhắc cố định

| Vị trí | Câu |
|---|---|
| Đầu mục | Đây là một cách tính định lượng theo lý số cổ truyền, mang tính văn hoá và tham khảo, không phải phép đo khoa học. |
| Cuối mục | Số là tham khảo, đức năng thắng số. |
| Cuối mục (nguồn màu và hướng) | Màu và hướng gợi ý trong app đến từ ba cách tính khác nhau: theo Dụng thần Bát Tự (tab Bát Tự và Tổng hợp), theo Mệnh Quái (Bát Trạch, La Bàn) và theo Nạp Âm năm sinh. Mỗi cách trả lời một câu hỏi riêng nên có thể không trùng nhau, và mỗi màn hình đã ghi rõ đang theo cách nào. Đây là gợi ý mang tính văn hoá, tham khảo; không cần thay đổi hay sắm sửa gì để "hợp mệnh". |
| Cuối mục (lưu ý) | Kết quả dựa trên hệ trọng số quy ước của một trường phái Tử Bình. Nên xem như gợi ý để tự soi xét và định hướng thói quen; các quyết định về sức khoẻ, tài chính, pháp lý cần ý kiến chuyên môn. |
| Mở thẻ kiểm chứng | Hai cách luận cho kết quả khác nhau về lá số này. Nếu bạn nhớ lại một vài giai đoạn đã qua, câu trả lời giúp so xem cách luận nào khớp hơn. Đây chỉ là so hai cách tính, không chứng minh cách nào đúng, và trí nhớ có thể lệch. Bạn có thể chọn "Không nhớ" bất cứ lúc nào. |
| Không đủ giai đoạn để hỏi | Chưa đủ giai đoạn đã qua để kiểm chứng. |
| Khi hai cách lệch nhau nhiều (dưới mục Giai đoạn) | Đánh giá các năm ở đây có thể khác mục "Giai đoạn hiện tại" trong Tổng kết, vì hai cách lấy hành có lợi khác nhau. |

## 3. Nhãn năm và Đại Vận (cách nói mềm, kèm gợi ý)

| Mức | Nhãn hiện | Gợi ý đi kèm |
|---|---|---|
| rat-tot | Rất thuận | hợp để bắt đầu việc đã chuẩn bị kỹ và mở rộng có kế hoạch |
| tot | Thuận | hợp để tiến hành kế hoạch đã chuẩn bị |
| binh | Bình thường | giữ nhịp, củng cố nền tảng |
| xau | Nên chậm lại, củng cố | nên ưu tiên học hỏi, chuẩn bị, tránh mở thêm việc lớn |
| rat-xau | Nên giữ chắc, chuẩn bị kỹ | nên giữ nhịp an toàn, bớt cam kết lớn, chú ý nghỉ ngơi và giữ gìn quan hệ |

Nút trả lời kiểm chứng: Thuận lợi / Bình thường / Khó khăn / Không nhớ. "Không nhớ" không đổi trọng số.

Cách nói trọng số (không hiện phần trăm ngoài mục "Vì sao"): từ 80% trở lên "nghiêng rõ về"; từ 60% đến dưới 80% "nghiêng nhẹ về"; dưới 60% "hai cách gần ngang nhau, hơi nghiêng về".

## 4. Tên gọi

| Nhóm | Tên hiện |
|---|---|
| Mức vượng nhược | Cực nhược · Thân nhược · Trung hoà · Thân vượng · Cực vượng |
| Phương pháp chọn Dụng thần | Phù ức (bổ chỗ yếu, tiết chỗ mạnh) · Điều hậu (cân bằng nóng lạnh) · Thông quan (nối hai hành đang xung khắc) · Thuận thế (tòng cách, chuyên vượng) · Giữ trung hoà |
| Tên cách cục | Tòng Sát · Tòng Tài · Tòng Nhi · Tòng Thế · Khúc Trực · Viêm Thượng · Giá Sắc · Tòng Cách (Kim chuyên vượng) · Nhuận Hạ · Tòng Cường |
| Hạng cách cục | Chân (thành cách rõ) · Giả (thành cách nhưng dễ bị phá) · Không thành cách |

Bảng 4 điều kiện Tòng cách (câu hỏi thường ngày, tên chuyên môn nhỏ bên dưới, kết quả: ✓ Đạt, ◐ Một phần, ✗ Không đạt):

- `root`: "Nhật Chủ có chỗ dựa trong các Chi không?" (Gốc ở địa chi (điều kiện bắt buộc))
- `exposed`: "Có Can nào lộ ra giúp hay chế Nhật Chủ không?" (Can lộ (điều kiện bắt buộc))
- `dominant`: "Phe mạnh có đủ áp đảo không?" (Thế của phe được theo)
- `direction`: "Phe mạnh là một hành hay nhiều hành?" (Hướng theo)

## 5. Chiến lược theo Thập Thần (vai trò của hành có lợi hoặc cần cân nhắc)

| Nhóm | Khi là hành có lợi | Khi cần cân nhắc | Việc nên làm |
|---|---|---|---|
| Tỷ Kiếp | Sức mạnh đến từ bản thân và đồng đội. Nên xây đội nhóm, cộng sự, mạng lưới ngang hàng; tự tin đứng tên việc của mình. | Dễ cạnh tranh, bị chia phần; khi hợp tác về tiền bạc nên thoả thuận rõ ràng ngay từ đầu. | Tìm cộng sự bù trừ năng lực; Tham gia cộng đồng nghề nghiệp; Rèn sức bền thể chất |
| Ấn | Được nâng đỡ qua học vấn, người thầy, tổ chức che chở. Nên dành thời gian học thêm, lấy chứng chỉ, tìm người hướng dẫn. | Dễ ỷ lại, học mãi không làm, chần chừ hành động. Cần chuyển kiến thức thành sản phẩm cụ thể. | Học một chứng chỉ chuyên môn; Tìm một hai người hướng dẫn; Làm việc trong tổ chức có hệ thống đào tạo |
| Thực Thương | Thành công đến từ thể hiện và sáng tạo: làm sản phẩm, viết, dạy, nói. Nên có "đầu ra" công khai đều đặn. | Dễ tiêu hao sức, nói nhiều thì mệt, dễ va chạm với cấp trên, chi tiêu theo hứng. | Xây sản phẩm hay hồ sơ cá nhân; Chia sẻ chuyên môn công khai; Biến kỹ năng thành dịch vụ |
| Tài | Hợp với hành động hướng kết quả, kinh doanh, quản lý nguồn lực. Nên đặt mục tiêu thu nhập cụ thể và theo dõi dòng tiền. | Dễ bị tiền bạc, công việc vật chất kéo quá sức. Nên giữ gìn sức khoẻ và không mở rộng quá năng lực. | Lập ngân sách và theo dõi dòng tiền; Thử một nguồn thu nhập phụ quy mô nhỏ; Học kỹ năng thương lượng, bán hàng |
| Quan Sát | Hợp với môi trường có cấu trúc, trách nhiệm, chức danh. Áp lực vừa phải giúp phát triển; nên nhận vai trò quản lý, tuân thủ quy chuẩn. | Áp lực, kiểm soát, cấp trên khắt khe dễ gây căng thẳng. Cần ranh giới rõ, tránh nhận quá nhiều trách nhiệm cùng lúc. | Nhận một vai trò có trách nhiệm rõ ràng; Xây kỷ luật cá nhân bằng lịch cố định; Làm việc trong tổ chức có quy chế minh bạch |

## 6. Thói quen và cách điều tiết theo hành

| Hành | Phẩm chất | Thói quen bổ sung | Lĩnh vực hợp | Khi quá dư | Cách điều tiết |
|---|---|---|---|---|---|
| Mộc | tăng trưởng, học hỏi, kế hoạch dài hạn, lòng nhân | Đặt một mục tiêu học tập dài hạn (khoá học, chứng chỉ) và theo dõi tiến độ hằng tuần; Vận động ngoài trời buổi sáng, đi bộ nơi có cây xanh; Viết kế hoạch 3–6 tháng, chia thành mốc nhỏ | giáo dục, đào tạo; xuất bản, nội dung; thiết kế, kiến trúc; phát triển sản phẩm giai đoạn đầu | ôm nhiều việc cùng lúc, dàn trải, cố chấp với ý tưởng của mình | chốt phạm vi trước khi mở việc mới; dùng quy trình và hạn chót (Kim) để cắt tỉa |
| Hoả | thể hiện, truyền cảm hứng, nhiệt huyết, tầm nhìn | Chủ động trình bày ý tưởng: viết bài, thuyết trình, chia sẻ công việc công khai; Duy trì một hoạt động tạo hứng khởi (thể thao đồng đội, sự kiện, cộng đồng); Ra ngoài nắng sáng, giữ nơi làm việc đủ sáng | truyền thông, marketing; đào tạo kỹ năng mềm; giải trí, sự kiện; vai trò đại diện, đối ngoại | nóng vội, quyết định theo cảm xúc, hứng nhanh bỏ nhanh | quy tắc "ngủ một đêm trước quyết định lớn"; ghi chép, đo lường kết quả (Thổ) để giữ nhịp |
| Thổ | ổn định, tin cậy, tích luỹ, trung gian kết nối | Giữ nếp sinh hoạt cố định: giờ ngủ, giờ làm, ngân sách tháng; Tích luỹ đều đặn thay vì làm theo đợt; Giữ không gian sống gọn gàng, ấm áp | vận hành, hành chính, quản lý dự án; dịch vụ khách hàng, vai trò trung gian; kế toán quản trị | trì trệ, ngại thay đổi, ôm đồm trách nhiệm, chậm ra quyết định | đặt mốc thử điều mới mỗi quý (Mộc); chia việc thay vì gánh hết |
| Kim | kỷ luật, quyết đoán, chuẩn mực, biết cắt bỏ cái thừa | Viết quy trình hay danh sách kiểm cho việc lặp lại; Dọn dẹp, tối giản: mỗi tuần bỏ bớt một thứ không cần; Đặt tiêu chuẩn chất lượng rõ ràng và tự rà lại trước khi giao | tài chính, kiểm soát; tuân thủ, kiểm toán; kỹ thuật, cơ khí; kiểm định chất lượng, bảo mật | cứng nhắc, khắt khe với mình và người khác, dễ đứt gãy quan hệ | lắng nghe trước khi kết luận; tham gia hoạt động mềm, sáng tạo (Thuỷ) để giải toả |
| Thuỷ | trí tuệ, linh hoạt, lưu thông, thích nghi | Đọc và tổng hợp thông tin đều đặn, ghi chú kiến thức; Mở rộng mạng lưới: gặp người mới, đi đây đi đó; Ngủ đủ, nghỉ ngơi có chủ đích, uống đủ nước | công nghệ thông tin, dữ liệu, nghiên cứu; thương mại, vận chuyển; du lịch, xuất nhập khẩu; tư vấn, kết nối | thiếu định hướng, nghĩ nhiều làm ít, dễ đổi theo hoàn cảnh | chọn một mục tiêu chính và cam kết thời hạn; cấu trúc hoá tuần làm việc (Thổ) |

## 7. Dòng đối chiếu với gợi ý sơ bộ (ARCHITECTURE 14.1)

Hiện ngay đầu mục ngũ hành, một ví dụ cho mỗi tình huống.

- **nguoc/trung-hoa**: Ở lá số này, hai cách tính cho kết quả gần như ngược nhau: gợi ý sơ bộ nghiêng về Thổ, Kim, phân tích định lượng nghiêng về **Thuỷ**. Khi tính đủ 8 chữ, Nhật Chủ gần cân bằng (trung hoà), nên phân tích định lượng chỉ bù hành yếu nhất thay vì bồi thêm hay tiết bớt Nhật Chủ. Sách Phần 2 (mục 6.3 và Chương 7) coi cách sơ bộ là bước nền tảng, còn lá số thực tế cần xét thêm những yếu tố này. Bạn có thể đọc cả hai như hai góc nhìn. Nếu định dựa vào đây để quyết định việc gì, nên nhờ người luận xem trực tiếp.
- **trung**: Phân tích định lượng cũng chọn **Hoả** là hành cần bổ sung nhất, trùng với gợi ý sơ bộ ở trên.
- **nguoc/vuong-nhuoc**: Ở lá số này, hai cách tính cho kết quả gần như ngược nhau: gợi ý sơ bộ nghiêng về Thổ, Kim, phân tích định lượng nghiêng về **Hoả**. Gợi ý sơ bộ chỉ đếm mùa sinh và 3 Can lộ nên thấy Thân nhược; khi tính cả Can ẩn trong Chi và sức của chi tháng, Nhật Chủ lại thiên vượng. Sách Phần 2 (mục 6.3 và Chương 7) coi cách sơ bộ là bước nền tảng, còn lá số thực tế cần xét thêm những yếu tố này. Bạn có thể đọc cả hai như hai góc nhìn. Nếu định dựa vào đây để quyết định việc gì, nên nhờ người luận xem trực tiếp.
- **nguoc/dieu-hau**: Ở lá số này, hai cách tính cho kết quả gần như ngược nhau: gợi ý sơ bộ nghiêng về Hoả, Thổ, phân tích định lượng nghiêng về **Thuỷ**. Lá số sinh mùa nóng mà hành Thuỷ rất ít, nên phân tích định lượng ưu tiên Điều hậu (cân bằng nóng lạnh) trước việc bồi thêm hay tiết bớt Nhật Chủ. Sách Phần 2 (mục 6.3 và Chương 7) coi cách sơ bộ là bước nền tảng, còn lá số thực tế cần xét thêm những yếu tố này. Bạn có thể đọc cả hai như hai góc nhìn. Nếu định dựa vào đây để quyết định việc gì, nên nhờ người luận xem trực tiếp.
- **gan/dieu-hau**: Phân tích định lượng chọn **Hoả** làm Dụng thần chính, gợi ý sơ bộ ở trên chọn Mộc. Hai cách cùng một hướng: Hoả vẫn nằm trong nhóm hành có lợi của gợi ý sơ bộ. Lá số sinh mùa lạnh mà hành Hoả rất ít, nên phân tích định lượng ưu tiên Điều hậu (cân bằng nóng lạnh) trước việc bồi thêm hay tiết bớt Nhật Chủ.
- **gan/khac-chon**: Phân tích định lượng chọn **Kim** làm Dụng thần chính, gợi ý sơ bộ ở trên chọn Thổ. Hai cách cùng một hướng: Kim vẫn nằm trong nhóm hành có lợi của gợi ý sơ bộ. Hai cách cùng thấy Thân nhược nhưng chọn hành khác: gợi ý sơ bộ lấy hành ít chữ nhất, phân tích định lượng lấy hành chữa đúng nguyên nhân mất cân bằng.
- **khac/trung-hoa**: Phân tích định lượng chọn **Hoả**, khác các hành gợi ý sơ bộ (Thuỷ, Mộc), nhưng hai cách không ngược nhau. Khi tính đủ 8 chữ, Nhật Chủ gần cân bằng (trung hoà), nên phân tích định lượng chỉ bù hành yếu nhất thay vì bồi thêm hay tiết bớt Nhật Chủ.
- **nguoc/tong-cach**: Ở lá số này, hai cách tính cho kết quả gần như ngược nhau: gợi ý sơ bộ nghiêng về Hoả, Thổ, Kim, phân tích định lượng nghiêng về **Hoả**. Lá số có dấu hiệu cách cục đặc biệt (Khúc Trực); khi đó nguyên tắc Vượng Suy thông thường không còn áp dụng (Phần 2, Chương 7). Sách Phần 2 (mục 6.3 và Chương 7) coi cách sơ bộ là bước nền tảng, còn lá số thực tế cần xét thêm những yếu tố này. Bạn có thể đọc cả hai như hai góc nhìn. Nếu định dựa vào đây để quyết định việc gì, nên nhờ người luận xem trực tiếp.
- **nguoc/khac-chon**: Ở lá số này, hai cách tính cho kết quả gần như ngược nhau: gợi ý sơ bộ nghiêng về Thổ, Kim, Thuỷ, phân tích định lượng nghiêng về **Thuỷ**. Hai cách cùng thấy Thân vượng nhưng chọn hành khác: gợi ý sơ bộ lấy hành ít chữ nhất, phân tích định lượng lấy hành chữa đúng nguyên nhân mất cân bằng. Sách Phần 2 (mục 6.3 và Chương 7) coi cách sơ bộ là bước nền tảng, còn lá số thực tế cần xét thêm những yếu tố này. Bạn có thể đọc cả hai như hai góc nhìn. Nếu định dựa vào đây để quyết định việc gì, nên nhờ người luận xem trực tiếp.
- **khac/tong-cach**: Phân tích định lượng chọn **Hoả**, khác các hành gợi ý sơ bộ (Thuỷ, Mộc), nhưng hai cách không ngược nhau. Lá số có dấu hiệu cách cục đặc biệt (Khúc Trực); khi đó nguyên tắc Vượng Suy thông thường không còn áp dụng (Phần 2, Chương 7).
- **khac/dieu-hau**: Phân tích định lượng chọn **Thuỷ**, khác các hành gợi ý sơ bộ (Thổ, Kim), nhưng hai cách không ngược nhau. Lá số sinh mùa nóng mà hành Thuỷ rất ít, nên phân tích định lượng ưu tiên Điều hậu (cân bằng nóng lạnh) trước việc bồi thêm hay tiết bớt Nhật Chủ.
- **gan/trung-hoa**: Phân tích định lượng chọn **Thổ** làm Dụng thần chính, gợi ý sơ bộ ở trên chọn Hoả. Hai cách cùng một hướng: Thổ vẫn nằm trong nhóm hành có lợi của gợi ý sơ bộ. Khi tính đủ 8 chữ, Nhật Chủ gần cân bằng (trung hoà), nên phân tích định lượng chỉ bù hành yếu nhất thay vì bồi thêm hay tiết bớt Nhật Chủ.

## 8. Câu cho từng mã của engine (một ví dụ thật)

Engine chỉ trả mã và số; mỗi mã dưới đây đổi thành câu như sau. Tham số trong câu (hành, can chi, phần trăm) thay đổi theo từng lá số.

| Mã | Ví dụ |
|---|---|
| `direction.anLed` | Ấn nhiều hơn Tỷ Kiếp → nghiêng về Tòng Cường |
| `direction.mixed` | Hỗn hợp: Tài (5,22) và Thực Thương (3,27) ngang ngửa → tòng thế |
| `direction.selfLed` | Tỷ Kiếp làm chủ → chuyên vượng đúng nghĩa |
| `direction.single` | Theo một hướng rõ: Quan Sát gấp 3 lần Tài |
| `dominant.chuyenVuong` | Tỷ Kiếp + Ấn chiếm 80%; Nhật Chủ Kim đắc lệnh (sinh mùa Kim) |
| `dominant.tong` | Phe khắc, tiết Nhật Chủ chiếm 78% (cần ≥ 70%); Quan Sát Thuỷ đắc lệnh (sinh mùa Thuỷ) |
| `exposed.list` | Đinh (trụ năm) không bị hợp hay khắc; Đinh (trụ giờ) không bị hợp hay khắc |
| `exposed.none` | Không có Ấn/Tỷ thấu can |
| `follow.summary` | Có dấu hiệu Tòng Cách (Kim chuyên vượng) nhưng chưa đạt điều kiện (độ tin cậy 75%) → luận theo thân vượng thông thường. |
| `momentum.deLenh` | đắc lệnh (sinh mùa Kim) |
| `momentum.halfTriad` | bán hợp hướng Thuỷ |
| `momentum.lenhSinh` | được lệnh tháng sinh (mùa Thuỷ sinh Mộc) |
| `momentum.triad` | thành tam hợp cục Mộc |
| `reading.follow` | Luận Khúc Trực |
| `reading.normal` | Luận thân vượng thông thường |
| `reason.chuyenVuong` | Nhật Chủ Mộc chiếm 83% lực → thuận theo thế vượng; dùng Thực Thương Hoả để thoát khí, tránh Quan Sát Kim đi ngược thế |
| `reason.dieuHauFirst` | Thiếu hụt rõ nên ưu tiên Điều hậu trước việc bồi thêm hay tiết bớt Nhật Chủ (theo tinh thần Cùng Thông Bảo Giám) |
| `reason.followHead` | Khúc Trực — Giả (thành cách nhưng dễ bị phá), độ tin cậy 83% |
| `reason.followMixed` | Phe tiết, khắc hỗn hợp (Tài + Quan Sát) → theo thế chung, lấy Tài Thuỷ làm trục |
| `reason.followSingle` | Nhật Chủ Thổ chỉ có 14% lực, không có gốc → không "cứu", thuận theo Tài Thuỷ |
| `reason.nhuoc.quanSat` | Thân nhược do Quan Sát nặng (3,93) → dùng Ấn Thuỷ: Quan sinh Ấn, Ấn sinh Thân (vừa hoá bớt áp lực vừa bồi Thân) |
| `reason.nhuoc.tai` | Thân nhược do Tài nặng (4,35) → dùng Tỷ Kiếp Kim để gánh Tài (Ấn bị Tài khắc nên kém hiệu quả) |
| `reason.nhuoc.thucThuong` | Thân nhược do Thực Thương tiết khí (3,36) → dùng Ấn Kim để chế Thực Thương và bổ Thân |
| `reason.trungHoa` | Nhật Chủ gần cân bằng (trung hoà, 52% hỗ trợ) → không cần can thiệp mạnh: bù hành yếu nhất Thuỷ, bớt hành dư nhất Thổ |
| `reason.vuong.an` | Thân vượng chủ yếu do Ấn nhiều (4,27 so với Tỷ Kiếp 4,02) → dùng Tài Thuỷ để chế Ấn |
| `reason.vuong.quanSat` | Thân vượng do Tỷ Kiếp nhiều, trong cục có Quan Sát (1,45) → dùng Quan Sát Hoả để chế bớt Thân |
| `reason.vuong.thucThuong` | Thân vượng do Tỷ Kiếp, Quan Sát yếu hoặc không có → dùng Thực Thương Hoả để tiết bớt (nhẹ nhàng hơn là đưa Quan Sát vào khắc) |
| `resolve.decided` | Các mốc đã qua khớp hơn với "Luận thân nhược thông thường" (3/4 mốc, trọng số 88%). Đây chỉ là so sánh giữa hai cách tính, chưa chứng minh cách nào đúng; trí nhớ về các năm cũ cũng có thể lệch. |
| `resolve.insufficient` | Chưa đủ dữ liệu: cần ít nhất 3 mốc để kết luận (hiện có 0). |
| `resolve.undecided` | Chưa phân định rõ ("Luận Khúc Trực" khớp 1/4 mốc, trọng số 72%). Có thể do câu hỏi quá chung chung hoặc trí nhớ chưa chắc. Bạn có thể trả lời thêm, hoặc nhờ người luận xem trực tiếp. |
| `root.none` | Quan Sát (phe chế Nhật Chủ) không có gốc ở địa chi nào |
| `root.real` | Ấn/Tỷ (phe cứu Nhật Chủ) có gốc: Bính (bản khí) trong chi năm Tỵ = 1; Giáp (trung khí) trong chi tháng Hợi = 1; Giáp (trung khí) trong chi ngày Hợi = 0,75 → tổng 2,75 (> 1: có gốc thật) |
| `root.weak` | Quan Sát (phe chế Nhật Chủ) có gốc: Tân (trung khí) trong chi năm Tuất = 0,5; Tân (dư khí) trong chi giờ Sửu = 0,2 → tổng 0,7 (≤ 1: gốc yếu) |
| `secondary.dieuHau` | Sinh mùa lạnh (tháng Tý) mà Hoả chỉ chiếm 2% → cục thiên lạnh, cần Hoả sưởi ấm |
| `secondary.thongQuan` | Mộc (31%) đang khắc mạnh Thổ (26%) → dùng Hoả làm cầu nối (Mộc sinh Hoả, Hoả sinh Thổ) |
| `trace.clash` | Lục xung Mão–Dậu: giảm lực hai chi (×0,75) |
| `trace.final` | Điểm cuối: Mộc 1,72 · Hoả 2,72 · Thổ 3,14 · Kim 1,25 · Thuỷ 0,47 |
| `trace.halfTriad` | Bán hợp Dậu–Sửu hướng Kim: cộng 0,6 |
| `trace.raw` | Điểm thô (chưa xét mùa): Mộc 2,02 · Hoả 2,72 · Thổ 2,24 · Kim 1,04 · Thuỷ 0,67 |
| `trace.season` | Sinh tháng Tuất (mùa Thổ): Mộc Tù ×0,85, Hoả Hưu ×1, Thổ Vượng ×1,4, Kim Tướng ×1,2, Thuỷ Tử ×0,7 |
| `trace.sixCombo` | Lục hợp Hợi–Dần hướng Mộc: cộng 0,4 |
| `trace.stemCombo` | Can hợp Nhâm–Đinh (hướng hoá Mộc): hai can bị "trói" bớt lực (×0,85) |
| `trace.triad` | Tam hợp Dần–Ngọ–Tuất cục Hoả: cộng 1,5 |

## 9. Báo cáo đầy đủ cho vài lá số

### Lá số thường (sinh 2/4/1960, giờ thứ 8 trong 12 giờ)

> Đây là một cách tính định lượng theo lý số cổ truyền, mang tính văn hoá và tham khảo, không phải phép đo khoa học.
>
> Phân tích định lượng chọn Kim làm Dụng thần chính, gợi ý sơ bộ ở trên chọn Thổ. Hai cách cùng một hướng: Kim vẫn nằm trong nhóm hành có lợi của gợi ý sơ bộ. Hai cách cùng thấy Thân nhược nhưng chọn hành khác: gợi ý sơ bộ lấy hành ít chữ nhất, phân tích định lượng lấy hành chữa đúng nguyên nhân mất cân bằng.

> Tóm lại
>
> Nhật Chủ Kim — Thân nhược. Hành cần bổ sung: Kim (hỗ trợ: Thổ); hành nên tiết chế: Hoả.
>
> Mộc · Tài · Cừu thần 42%
>
> Thuỷ · Thực Thương 28%
>
> Kim · Tỷ Kiếp · Dụng thần 14%
>
> Thổ · Ấn · Hỷ thần 12%
>
> Hoả · Quan Sát · Kỵ thần 4%
>
> Kết luận này ổn định: đổi sang cách đặt hệ số khác (coi trọng nguyệt lệnh hơn) vẫn cho cùng Dụng thần.

> Nói dễ hiểu
>
> Bạn là Canh (Kim): can của ngày sinh, đại diện cho chính bạn. Phe giúp bạn (Kim và hành sinh ra Kim) chiếm khoảng 33% lực của lá số, phần còn lại thuộc về các hành làm bạn tiêu hao hay bị chế ngự. Như vậy là yếu: giống một người phải gánh việc nặng hơn sức mình, nên điều lá số cần trước hết là được tiếp sức hoặc bớt gánh.
>
> Hành mạnh nhất trong lá số là Mộc (42%): bạn sinh tháng Mão (mùa xuân), đúng lúc Mộc vượng nhất. Ngược lại, Hoả gần như vắng mặt (4%).
>
> Vì phe bạn đang yếu, hành có ích là hành tiếp sức cho bạn hoặc giúp bạn gánh bớt: Kim. Với bạn, Kim là Tỷ Kiếp, trong đời sống ứng với chính bạn và những người ngang hàng: anh chị em, bạn bè, đồng nghiệp cùng cấp, sức khoẻ và sự tự lập. "Bổ sung Kim" không phải chuyện đồ vật, mà là đưa thêm những điều đó vào nếp sống, vừa sức mình. Ví dụ: thay vì một mình gánh một việc lớn, rủ một người bạn cùng nghề làm chung và chia rõ phần ai nấy làm; hoặc giữ lịch tập thể dục ba buổi một tuần để có sức bền.
>
> Hỗ trợ cho Kim là Thổ (Ấn của bạn): việc học, bằng cấp, người thầy, người đi trước nâng đỡ, và những lúc nghỉ để nạp lại sức. Có thêm phần này thì phần trên bền hơn.
>
> Hành nên tiết chế là Hoả (Quan Sát của bạn), ứng với khuôn khổ và trách nhiệm: cấp trên, chức danh, nội quy, kỷ luật, danh tiếng. Khi phần này lấn lên, dễ gặp những chuyện như: nhận cùng lúc nhiều chức danh, hoặc làm dưới quyền người quá khắt khe mà không nói ra cho đến lúc kiệt sức.
>
> Năm thuận nhất trong 12 năm tới là 2029 Kỷ Dậu: can Kỷ thuộc Thổ (hành hỗ trợ), chi Dậu thuộc Kim (đúng hành bạn cần). Đây là năm hợp để tìm cộng sự bù trừ năng lực. Năm nên giữ nhịp nhất là 2026 Bính Ngọ: cả can Bính lẫn chi Ngọ đều thuộc Hoả, hành nên tiết chế. Năm đó nên giữ nhịp an toàn, chưa vội mở rộng hay nhận thêm cam kết lớn. Đây là gợi ý sắp xếp nhịp làm việc, không phải lời báo trước.

> Mô hình cân bằng 5 hành (tuỳ chọn)
>
> Hình minh hoạ, không dùng để chọn Dụng thần. Muốn bổ sung Kim: nuôi Thổ (sinh Kim) và bớt Hoả (khắc Kim).
>
> Lưu ý: chỉ vòng sinh khắc là kiến thức cổ truyền. Phương trình và các hệ số là mô hình tự đặt để minh hoạ, không lấy từ sách hay trường phái nào, chưa được kiểm chứng; đừng dùng nó để luận đoán.
>
> Mô hình đơn giản: mỗi bước, mỗi hành nhận thêm 30% phần chênh so với hành sinh ra nó và bị hành khắc nó trừ 5%; hệ đứng yên khi cả năm hành đều 20%. "Can thiệp tối thiểu": thử thêm 10% vào từng hành một, cho chạy 5 bước, hành nào đưa lá số về gần mức cân bằng nhất thì xếp hạng 1.
>
> Theo mô hình này, Kim xếp thứ 3/5; hành bù chỗ lệch hiệu quả nhất là Thổ. Mô hình bỏ qua mùa sinh và Nhật Chủ nên Dụng thần vẫn lấy theo cách luận ở trên.

> Vì sao ra kết quả này
>
> Phương pháp: Phù ức (bổ chỗ yếu, tiết chỗ mạnh)
>
> Thân nhược do Tài nặng (4,35) → dùng Tỷ Kiếp Kim để gánh Tài (Ấn bị Tài khắc nên kém hiệu quả)

> Chiến lược: phát huy Tỷ Kiếp
>
> Sức mạnh đến từ bản thân và đồng đội. Nên xây đội nhóm, cộng sự, mạng lưới ngang hàng; tự tin đứng tên việc của mình.
>
> Tìm cộng sự bù trừ năng lực
>
> Tham gia cộng đồng nghề nghiệp
>
> Rèn sức bền thể chất

> Việc nên làm đều đặn
>
> Kim — kỷ luật, quyết đoán, chuẩn mực, biết cắt bỏ cái thừa.
>
> Viết quy trình hay danh sách kiểm cho việc lặp lại
>
> Dọn dẹp, tối giản: mỗi tuần bỏ bớt một thứ không cần
>
> Đặt tiêu chuẩn chất lượng rõ ràng và tự rà lại trước khi giao
>
> Lĩnh vực hợp với hành này: tài chính, kiểm soát; tuân thủ, kiểm toán; kỹ thuật, cơ khí; kiểm định chất lượng, bảo mật.
>
> Thổ — ổn định, tin cậy, tích luỹ, trung gian kết nối.
>
> Giữ nếp sinh hoạt cố định: giờ ngủ, giờ làm, ngân sách tháng
>
> Tích luỹ đều đặn thay vì làm theo đợt
>
> Giữ không gian sống gọn gàng, ấm áp
>
> Lĩnh vực hợp với hành này: vận hành, hành chính, quản lý dự án; dịch vụ khách hàng, vai trò trung gian; kế toán quản trị.

> Điều cần cân nhắc
>
> Quan Sát (Hoả) là điểm cần cân nhắc: Áp lực, kiểm soát, cấp trên khắt khe dễ gây căng thẳng. Cần ranh giới rõ, tránh nhận quá nhiều trách nhiệm cùng lúc.
>
> Hành Mộc đang nhiều: dễ ôm nhiều việc cùng lúc, dàn trải, cố chấp với ý tưởng của mình. Cách điều tiết: chốt phạm vi trước khi mở việc mới; dùng quy trình và hạn chót (Kim) để cắt tỉa.

> Giai đoạn hiện tại và các năm tới
>
> Đại Vận hiện tại Ất Dậu (60–69 tuổi): Thuận — hợp để tiến hành kế hoạch đã chuẩn bị.
>
> 2026 Bính Ngọ: Nên giữ chắc, chuẩn bị kỹ
>
> 2027 Đinh Mùi: Nên chậm lại, củng cố
>
> 2028 Mậu Thân: Rất thuận
>
> 2029 Kỷ Dậu: Rất thuận
>
> 2030 Canh Tuất: Rất thuận
>
> 2026: Nên giữ chắc, chuẩn bị kỹ — nên giữ nhịp an toàn, bớt cam kết lớn, chú ý nghỉ ngơi và giữ gìn quan hệ.
>
> 2027: Nên chậm lại, củng cố — nên ưu tiên học hỏi, chuẩn bị, tránh mở thêm việc lớn.
>
> 2028: Rất thuận — hợp để bắt đầu việc đã chuẩn bị kỹ và mở rộng có kế hoạch.
>
> 2029: Rất thuận — hợp để bắt đầu việc đã chuẩn bị kỹ và mở rộng có kế hoạch.
>
> 2030: Rất thuận — hợp để bắt đầu việc đã chuẩn bị kỹ và mở rộng có kế hoạch.
>
> Năm tính theo Lập Xuân (khoảng đầu tháng 2 dương lịch). Nhãn chỉ để gợi ý cách sắp xếp nhịp làm việc, không phải lời báo trước.

> Số là tham khảo, đức năng thắng số.
>
> Màu và hướng gợi ý trong app đến từ ba cách tính khác nhau: theo Dụng thần Bát Tự (tab Bát Tự và Tổng hợp), theo Mệnh Quái (Bát Trạch, La Bàn) và theo Nạp Âm năm sinh. Mỗi cách trả lời một câu hỏi riêng nên có thể không trùng nhau, và mỗi màn hình đã ghi rõ đang theo cách nào. Đây là gợi ý mang tính văn hoá, tham khảo; không cần thay đổi hay sắm sửa gì để "hợp mệnh".
>
> Kết quả dựa trên hệ trọng số quy ước của một trường phái Tử Bình. Nên xem như gợi ý để tự soi xét và định hướng thói quen; các quyết định về sức khoẻ, tài chính, pháp lý cần ý kiến chuyên môn.

### Lá số đảo chiều so với gợi ý sơ bộ (sinh 26/10/1995, giờ thứ 11 trong 12 giờ)

> Đây là một cách tính định lượng theo lý số cổ truyền, mang tính văn hoá và tham khảo, không phải phép đo khoa học.
>
> Ở lá số này, hai cách tính cho kết quả gần như ngược nhau: gợi ý sơ bộ nghiêng về Thổ, Kim, phân tích định lượng nghiêng về Thuỷ. Khi tính đủ 8 chữ, Nhật Chủ gần cân bằng (trung hoà), nên phân tích định lượng chỉ bù hành yếu nhất thay vì bồi thêm hay tiết bớt Nhật Chủ. Sách Phần 2 (mục 6.3 và Chương 7) coi cách sơ bộ là bước nền tảng, còn lá số thực tế cần xét thêm những yếu tố này. Bạn có thể đọc cả hai như hai góc nhìn. Nếu định dựa vào đây để quyết định việc gì, nên nhờ người luận xem trực tiếp.

> Tóm lại
>
> Nhật Chủ Kim — Trung hoà. Hành cần bổ sung: Thuỷ (hỗ trợ: Kim); hành nên tiết chế: Thổ.
>
> Thổ · Ấn · Kỵ thần 34%
>
> Hoả · Quan Sát · Cừu thần 29%
>
> Mộc · Tài 19%
>
> Kim · Tỷ Kiếp · Hỷ thần 13%
>
> Thuỷ · Thực Thương · Dụng thần 5%
>
> Kết luận này chưa vững: nếu coi trọng nguyệt lệnh hơn thì Dụng thần là Mộc thay vì Thuỷ. Nên xem như một gợi ý, chưa phải kết quả chắc.

> Nói dễ hiểu
>
> Bạn là Canh (Kim): can của ngày sinh, đại diện cho chính bạn. Phe giúp bạn (Kim và hành sinh ra Kim) chiếm khoảng 52% lực của lá số, phần còn lại thuộc về các hành làm bạn tiêu hao hay bị chế ngự. Như vậy là gần cân bằng: hai phe xấp xỉ nhau, nên chỉ cần chỉnh nhẹ chỗ đang thiếu, không cần thay đổi lớn.
>
> Hành mạnh nhất trong lá số là Thổ (34%): bạn sinh tháng Tuất (mùa cuối thu), đúng lúc Thổ vượng nhất; Thổ nằm sẵn trong chi giờ Tuất. Ngược lại, Thuỷ gần như vắng mặt (5%).
>
> Hai phe gần cân bằng nên không cần chỉnh mạnh; chỉ bù hành đang thiếu nhất là Thuỷ. Với bạn, Thuỷ là Thực Thương, trong đời sống ứng với khả năng thể hiện và làm ra cái mới: nói, viết, dạy, sáng tạo, tay nghề. "Bổ sung Thuỷ" không phải chuyện đồ vật, mà là đưa thêm những điều đó vào nếp sống, vừa sức mình. Ví dụ: mỗi tuần viết một bài chia sẻ điều mình làm tốt, hoặc nhận dạy kèm một kỹ năng mình có cho vài người quen.
>
> Hỗ trợ cho Thuỷ là Kim (Tỷ Kiếp của bạn): chính bạn và những người ngang hàng: anh chị em, bạn bè, đồng nghiệp cùng cấp, sức khoẻ và sự tự lập. Có thêm phần này thì phần trên bền hơn.
>
> Hành nên tiết chế là Thổ (Ấn của bạn), ứng với việc học, bằng cấp, người thầy, người đi trước nâng đỡ, và những lúc nghỉ để nạp lại sức. Khi phần này lấn lên, dễ gặp những chuyện như: học hết khoá này sang khoá khác mà chưa làm ra sản phẩm nào; hoặc chờ có người sắp xếp sẵn rồi mới bắt tay vào việc.
>
> Năm thuận nhất trong 12 năm tới là 2032 Nhâm Tý: cả can Nhâm lẫn chi Tý đều thuộc Thuỷ, đúng hành bạn cần. Đây là năm hợp để xây sản phẩm hay hồ sơ cá nhân. Năm nên giữ nhịp nhất là 2027 Đinh Mùi: can Đinh thuộc Hoả (hành tiếp sức cho hành nên tiết chế), chi Mùi thuộc Thổ (hành nên tiết chế). Năm đó nên giữ nhịp an toàn, chưa vội mở rộng hay nhận thêm cam kết lớn. Đây là gợi ý sắp xếp nhịp làm việc, không phải lời báo trước.

> Mô hình cân bằng 5 hành (tuỳ chọn)
>
> Hình minh hoạ, không dùng để chọn Dụng thần. Muốn bổ sung Thuỷ: nuôi Kim (sinh Thuỷ) và bớt Thổ (khắc Thuỷ).
>
> Lưu ý: chỉ vòng sinh khắc là kiến thức cổ truyền. Phương trình và các hệ số là mô hình tự đặt để minh hoạ, không lấy từ sách hay trường phái nào, chưa được kiểm chứng; đừng dùng nó để luận đoán.
>
> Mô hình đơn giản: mỗi bước, mỗi hành nhận thêm 30% phần chênh so với hành sinh ra nó và bị hành khắc nó trừ 5%; hệ đứng yên khi cả năm hành đều 20%. "Can thiệp tối thiểu": thử thêm 10% vào từng hành một, cho chạy 5 bước, hành nào đưa lá số về gần mức cân bằng nhất thì xếp hạng 1.
>
> Theo mô hình này, bổ sung Thuỷ là cách bù chỗ lệch hiệu quả nhất, khớp với Dụng thần ở trên.

> Vì sao ra kết quả này
>
> Phương pháp: Giữ trung hoà
>
> Nhật Chủ gần cân bằng (trung hoà, 52% hỗ trợ) → không cần can thiệp mạnh: bù hành yếu nhất Thuỷ, bớt hành dư nhất Thổ

> Chiến lược: phát huy Thực Thương
>
> Thành công đến từ thể hiện và sáng tạo: làm sản phẩm, viết, dạy, nói. Nên có "đầu ra" công khai đều đặn.
>
> Xây sản phẩm hay hồ sơ cá nhân
>
> Chia sẻ chuyên môn công khai
>
> Biến kỹ năng thành dịch vụ

> Việc nên làm đều đặn
>
> Thuỷ — trí tuệ, linh hoạt, lưu thông, thích nghi.
>
> Đọc và tổng hợp thông tin đều đặn, ghi chú kiến thức
>
> Mở rộng mạng lưới: gặp người mới, đi đây đi đó
>
> Ngủ đủ, nghỉ ngơi có chủ đích, uống đủ nước
>
> Lĩnh vực hợp với hành này: công nghệ thông tin, dữ liệu, nghiên cứu; thương mại, vận chuyển; du lịch, xuất nhập khẩu; tư vấn, kết nối.
>
> Kim — kỷ luật, quyết đoán, chuẩn mực, biết cắt bỏ cái thừa.
>
> Viết quy trình hay danh sách kiểm cho việc lặp lại
>
> Dọn dẹp, tối giản: mỗi tuần bỏ bớt một thứ không cần
>
> Đặt tiêu chuẩn chất lượng rõ ràng và tự rà lại trước khi giao
>
> Lĩnh vực hợp với hành này: tài chính, kiểm soát; tuân thủ, kiểm toán; kỹ thuật, cơ khí; kiểm định chất lượng, bảo mật.

> Điều cần cân nhắc
>
> Ấn (Thổ) là điểm cần cân nhắc: Dễ ỷ lại, học mãi không làm, chần chừ hành động. Cần chuyển kiến thức thành sản phẩm cụ thể.
>
> Hành Hoả đang nhiều: dễ nóng vội, quyết định theo cảm xúc, hứng nhanh bỏ nhanh. Cách điều tiết: quy tắc "ngủ một đêm trước quyết định lớn"; ghi chép, đo lường kết quả (Thổ) để giữ nhịp.
>
> Hành Thổ đang nhiều: dễ trì trệ, ngại thay đổi, ôm đồm trách nhiệm, chậm ra quyết định. Cách điều tiết: đặt mốc thử điều mới mỗi quý (Mộc); chia việc thay vì gánh hết.

> Giai đoạn hiện tại và các năm tới
>
> Đại Vận hiện tại Giáp Thân (25–34 tuổi): Thuận — hợp để tiến hành kế hoạch đã chuẩn bị.
>
> 2026 Bính Ngọ: Nên giữ chắc, chuẩn bị kỹ
>
> 2027 Đinh Mùi: Nên giữ chắc, chuẩn bị kỹ
>
> 2028 Mậu Thân: Nên chậm lại, củng cố
>
> 2029 Kỷ Dậu: Nên chậm lại, củng cố
>
> 2030 Canh Tuất: Bình thường
>
> 2026: Nên giữ chắc, chuẩn bị kỹ — nên giữ nhịp an toàn, bớt cam kết lớn, chú ý nghỉ ngơi và giữ gìn quan hệ.
>
> 2027: Nên giữ chắc, chuẩn bị kỹ — nên giữ nhịp an toàn, bớt cam kết lớn, chú ý nghỉ ngơi và giữ gìn quan hệ.
>
> 2028: Nên chậm lại, củng cố — nên ưu tiên học hỏi, chuẩn bị, tránh mở thêm việc lớn.
>
> 2029: Nên chậm lại, củng cố — nên ưu tiên học hỏi, chuẩn bị, tránh mở thêm việc lớn.
>
> 2030: Bình thường — giữ nhịp, củng cố nền tảng.
>
> Năm tính theo Lập Xuân (khoảng đầu tháng 2 dương lịch). Nhãn chỉ để gợi ý cách sắp xếp nhịp làm việc, không phải lời báo trước.
>
> Đánh giá các năm ở đây có thể khác mục "Giai đoạn hiện tại" trong Tổng kết, vì hai cách lấy hành có lợi khác nhau.

> Số là tham khảo, đức năng thắng số.
>
> Màu và hướng gợi ý trong app đến từ ba cách tính khác nhau: theo Dụng thần Bát Tự (tab Bát Tự và Tổng hợp), theo Mệnh Quái (Bát Trạch, La Bàn) và theo Nạp Âm năm sinh. Mỗi cách trả lời một câu hỏi riêng nên có thể không trùng nhau, và mỗi màn hình đã ghi rõ đang theo cách nào. Đây là gợi ý mang tính văn hoá, tham khảo; không cần thay đổi hay sắm sửa gì để "hợp mệnh".
>
> Kết quả dựa trên hệ trọng số quy ước của một trường phái Tử Bình. Nên xem như gợi ý để tự soi xét và định hướng thói quen; các quyết định về sức khoẻ, tài chính, pháp lý cần ý kiến chuyên môn.

### Lá số Giả tòng (hai cách luận) (sinh 24/11/1994, giờ thứ 2 trong 12 giờ)

> Đây là một cách tính định lượng theo lý số cổ truyền, mang tính văn hoá và tham khảo, không phải phép đo khoa học.
>
> Ở lá số này, hai cách tính cho kết quả gần như ngược nhau: gợi ý sơ bộ nghiêng về Hoả, Thổ, Kim, phân tích định lượng nghiêng về Hoả. Lá số có dấu hiệu cách cục đặc biệt (Khúc Trực); khi đó nguyên tắc Vượng Suy thông thường không còn áp dụng (Phần 2, Chương 7). Sách Phần 2 (mục 6.3 và Chương 7) coi cách sơ bộ là bước nền tảng, còn lá số thực tế cần xét thêm những yếu tố này. Bạn có thể đọc cả hai như hai góc nhìn. Nếu định dựa vào đây để quyết định việc gì, nên nhờ người luận xem trực tiếp.

> Tóm lại
>
> Nhật Chủ Mộc — Thân vượng, luận theo thế chung của lá số. Hành nên thuận theo: Hoả (hỗ trợ: Mộc); hành đi ngược thế, nên tránh: Kim.
>
> Mộc · Tỷ Kiếp · Hỷ thần 55%
>
> Thuỷ · Ấn 27%
>
> Thổ · Tài · Cừu thần 11%
>
> Kim · Quan Sát · Kỵ thần 4%
>
> Hoả · Thực Thương · Dụng thần 4%
>
> Kết luận này ổn định: đổi sang cách đặt hệ số khác (coi trọng nguyệt lệnh hơn) vẫn cho cùng Dụng thần.

> Nói dễ hiểu
>
> Bạn là Giáp (Mộc): can của ngày sinh, đại diện cho chính bạn. Phe giúp bạn (Mộc và hành sinh ra Mộc) chiếm khoảng 83% lực của lá số, phần còn lại thuộc về các hành làm bạn tiêu hao hay bị chế ngự. Phe của bạn mạnh áp đảo. Gặp trường hợp này, sách xưa không ép bớt mà cho thuận theo thế mạnh, giống dòng sông lớn thì nên khơi cho chảy chứ không đắp đập chặn ngang.
>
> Hành mạnh nhất trong lá số là Mộc (55%): Mộc lộ ra ở can năm Giáp, can tháng Ất, can giờ Ất; Mộc nằm sẵn trong chi ngày Dần. Ngược lại, Hoả gần như vắng mặt (4%).
>
> Lá số theo thế Khúc Trực, nên hành có ích là hành đi cùng thế mạnh: Hoả. Với bạn, Hoả là Thực Thương, trong đời sống ứng với khả năng thể hiện và làm ra cái mới: nói, viết, dạy, sáng tạo, tay nghề. "Thuận theo Hoả" không phải chuyện đồ vật, mà là đưa thêm những điều đó vào nếp sống, vừa sức mình. Ví dụ: mỗi tuần viết một bài chia sẻ điều mình làm tốt, hoặc nhận dạy kèm một kỹ năng mình có cho vài người quen.
>
> Hỗ trợ cho Hoả là Mộc (Tỷ Kiếp của bạn): chính bạn và những người ngang hàng: anh chị em, bạn bè, đồng nghiệp cùng cấp, sức khoẻ và sự tự lập. Có thêm phần này thì phần trên bền hơn.
>
> Hành nên tránh, vì đi ngược thế của lá số, là Kim (Quan Sát của bạn), ứng với khuôn khổ và trách nhiệm: cấp trên, chức danh, nội quy, kỷ luật, danh tiếng. Khi phần này lấn lên, dễ gặp những chuyện như: nhận cùng lúc nhiều chức danh, hoặc làm dưới quyền người quá khắt khe mà không nói ra cho đến lúc kiệt sức.
>
> Năm thuận nhất trong 12 năm tới là 2026 Bính Ngọ: cả can Bính lẫn chi Ngọ đều thuộc Hoả, đúng hành nên thuận theo. Đây là năm hợp để xây sản phẩm hay hồ sơ cá nhân. Năm nên giữ nhịp nhất là 2029 Kỷ Dậu: can Kỷ thuộc Thổ (hành tiếp sức cho hành nên tránh), chi Dậu thuộc Kim (hành nên tránh). Năm đó nên giữ nhịp an toàn, chưa vội mở rộng hay nhận thêm cam kết lớn. Đây là gợi ý sắp xếp nhịp làm việc, không phải lời báo trước.

> Mô hình cân bằng 5 hành (tuỳ chọn)
>
> Hình minh hoạ, không dùng để chọn Dụng thần. Muốn bổ sung Hoả: nuôi Mộc (sinh Hoả) và bớt Thuỷ (khắc Hoả).
>
> Lưu ý: chỉ vòng sinh khắc là kiến thức cổ truyền. Phương trình và các hệ số là mô hình tự đặt để minh hoạ, không lấy từ sách hay trường phái nào, chưa được kiểm chứng; đừng dùng nó để luận đoán.
>
> Mô hình đơn giản: mỗi bước, mỗi hành nhận thêm 30% phần chênh so với hành sinh ra nó và bị hành khắc nó trừ 5%; hệ đứng yên khi cả năm hành đều 20%. "Can thiệp tối thiểu": thử thêm 10% vào từng hành một, cho chạy 5 bước, hành nào đưa lá số về gần mức cân bằng nhất thì xếp hạng 1.
>
> Theo mô hình này, Hoả xếp thứ 3/5; hành bù chỗ lệch hiệu quả nhất là Thổ. Mô hình bỏ qua mùa sinh và Nhật Chủ nên Dụng thần vẫn lấy theo cách luận ở trên.

> Vì sao ra kết quả này
>
> Phương pháp: Thuận thế (tòng cách, chuyên vượng)
>
> Khúc Trực — Giả (thành cách nhưng dễ bị phá), độ tin cậy 83%
>
> Nhật Chủ Mộc chiếm 83% lực → thuận theo thế vượng; dùng Thực Thương Hoả để thoát khí, tránh Quan Sát Kim đi ngược thế
>
> Trọng số các cách luận: Luận Khúc Trực 65%, Luận thân vượng thông thường 35%.

> Kiểm tra cách cục đặc biệt
>
> Có thể là Khúc Trực nhưng chưa trọn (độ tin cậy 83%): nên xem cả hai cách luận và kiểm chứng bằng các năm đã qua. Khi gặp Kim, cục có xu hướng quay về luận thân vượng thông thường.
>
> Câu hỏi
>
> Tên chuyên môn
>
> Kết quả
>
> Chi tiết
>
> Nhật Chủ có chỗ dựa trong các Chi không?
>
> Gốc ở địa chi (điều kiện bắt buộc)
>
> ◐ Một phần
>
> Quan Sát (phe chế Nhật Chủ) có gốc: Tân (trung khí) trong chi năm Tuất = 0,5; Tân (dư khí) trong chi giờ Sửu = 0,2 → tổng 0,7 (≤ 1: gốc yếu)
>
> Có Can nào lộ ra giúp hay chế Nhật Chủ không?
>
> Can lộ (điều kiện bắt buộc)
>
> ✓ Đạt
>
> Không có Quan Sát thấu can
>
> Phe mạnh có đủ áp đảo không?
>
> Thế của phe được theo
>
> ✓ Đạt
>
> Tỷ Kiếp + Ấn chiếm 83%; Nhật Chủ Mộc được lệnh tháng sinh (mùa Thuỷ sinh Mộc)
>
> Phe mạnh là một hành hay nhiều hành?
>
> Hướng theo
>
> ✓ Đạt
>
> Tỷ Kiếp làm chủ → chuyên vượng đúng nghĩa

> Cách luận khác
>
> Hiện nghiêng nhẹ về Luận Khúc Trực. Cách luận còn lại, Luận thân vượng thông thường, chọn Dụng thần Hoả, Hỷ thần Mộc, Kỵ thần Thuỷ.
>
> Hai cách luận khác nhau về mức độ nhưng không đảo chiều hành nào.

> Chiến lược: phát huy Thực Thương
>
> Thành công đến từ thể hiện và sáng tạo: làm sản phẩm, viết, dạy, nói. Nên có "đầu ra" công khai đều đặn.
>
> Xây sản phẩm hay hồ sơ cá nhân
>
> Chia sẻ chuyên môn công khai
>
> Biến kỹ năng thành dịch vụ

> Việc nên làm đều đặn
>
> Hoả — thể hiện, truyền cảm hứng, nhiệt huyết, tầm nhìn.
>
> Chủ động trình bày ý tưởng: viết bài, thuyết trình, chia sẻ công việc công khai
>
> Duy trì một hoạt động tạo hứng khởi (thể thao đồng đội, sự kiện, cộng đồng)
>
> Ra ngoài nắng sáng, giữ nơi làm việc đủ sáng
>
> Lĩnh vực hợp với hành này: truyền thông, marketing; đào tạo kỹ năng mềm; giải trí, sự kiện; vai trò đại diện, đối ngoại.
>
> Mộc — tăng trưởng, học hỏi, kế hoạch dài hạn, lòng nhân.
>
> Đặt một mục tiêu học tập dài hạn (khoá học, chứng chỉ) và theo dõi tiến độ hằng tuần
>
> Vận động ngoài trời buổi sáng, đi bộ nơi có cây xanh
>
> Viết kế hoạch 3–6 tháng, chia thành mốc nhỏ
>
> Lĩnh vực hợp với hành này: giáo dục, đào tạo; xuất bản, nội dung; thiết kế, kiến trúc; phát triển sản phẩm giai đoạn đầu.

> Điều cần cân nhắc
>
> Quan Sát (Kim) là điểm cần cân nhắc: Áp lực, kiểm soát, cấp trên khắt khe dễ gây căng thẳng. Cần ranh giới rõ, tránh nhận quá nhiều trách nhiệm cùng lúc.

> Giai đoạn hiện tại và các năm tới
>
> Đại Vận hiện tại Đinh Sửu (24–33 tuổi): Thuận — hợp để tiến hành kế hoạch đã chuẩn bị.
>
> 2026 Bính Ngọ: Rất thuận
>
> 2027 Đinh Mùi: Thuận
>
> 2028 Mậu Thân: Nên giữ chắc, chuẩn bị kỹ
>
> 2029 Kỷ Dậu: Nên giữ chắc, chuẩn bị kỹ
>
> 2030 Canh Tuất: Nên giữ chắc, chuẩn bị kỹ
>
> 2026: Rất thuận — hợp để bắt đầu việc đã chuẩn bị kỹ và mở rộng có kế hoạch (cách luận khác: Rất thuận).
>
> 2027: Thuận — hợp để tiến hành kế hoạch đã chuẩn bị (cách luận khác: Rất thuận).
>
> 2028: Nên giữ chắc, chuẩn bị kỹ — nên giữ nhịp an toàn, bớt cam kết lớn, chú ý nghỉ ngơi và giữ gìn quan hệ (cách luận khác: Nên chậm lại, củng cố).
>
> 2029: Nên giữ chắc, chuẩn bị kỹ — nên giữ nhịp an toàn, bớt cam kết lớn, chú ý nghỉ ngơi và giữ gìn quan hệ (cách luận khác: Nên chậm lại, củng cố).
>
> 2030: Nên giữ chắc, chuẩn bị kỹ — nên giữ nhịp an toàn, bớt cam kết lớn, chú ý nghỉ ngơi và giữ gìn quan hệ (cách luận khác: Nên chậm lại, củng cố).
>
> Năm tính theo Lập Xuân (khoảng đầu tháng 2 dương lịch). Nhãn chỉ để gợi ý cách sắp xếp nhịp làm việc, không phải lời báo trước.
>
> Đánh giá các năm ở đây có thể khác mục "Giai đoạn hiện tại" trong Tổng kết, vì hai cách lấy hành có lợi khác nhau.

> Ghi chú thêm
>
> Điều hậu (cân bằng nóng lạnh): Sinh mùa lạnh (tháng Hợi) mà Hoả chỉ chiếm 4% → cục thiên lạnh, cần Hoả sưởi ấm

> Số là tham khảo, đức năng thắng số.
>
> Màu và hướng gợi ý trong app đến từ ba cách tính khác nhau: theo Dụng thần Bát Tự (tab Bát Tự và Tổng hợp), theo Mệnh Quái (Bát Trạch, La Bàn) và theo Nạp Âm năm sinh. Mỗi cách trả lời một câu hỏi riêng nên có thể không trùng nhau, và mỗi màn hình đã ghi rõ đang theo cách nào. Đây là gợi ý mang tính văn hoá, tham khảo; không cần thay đổi hay sắm sửa gì để "hợp mệnh".
>
> Kết quả dựa trên hệ trọng số quy ước của một trường phái Tử Bình. Nên xem như gợi ý để tự soi xét và định hướng thói quen; các quyết định về sức khoẻ, tài chính, pháp lý cần ý kiến chuyên môn.

## 10. Việc cần chủ dự án duyệt

1. Giọng văn các mục 2 đến 8: có đủ mềm, không hù doạ, không hứa hẹn?
2. Nhãn năm "Nên chậm lại, củng cố" và "Nên giữ chắc, chuẩn bị kỹ" (mục 3).
3. Câu giải thích nguồn màu và hướng (mục 2) và câu đối chiếu khi hai cách tính ngược nhau (mục 7).
4. Danh sách từ KHÔNG HIỆN (mục 1): thiếu từ nào cần chặn thêm?
Duyệt xong mới sang bước 3C.4 (giao diện).
