/* Hướng dẫn sử dụng app, hiện ở Cài đặt → Hướng dẫn sử dụng. Giọng "bài học nhỏ", ngắn, theo đúng tên nút trên màn hình. */
export const GUIDE_INTRO = 'Mọi phép tính chạy ngay trên máy, không cần mạng và không gửi dữ liệu của bạn đi đâu. Nội dung mang tính văn hoá, tham khảo.';

export const GUIDE_SECTIONS: readonly { title: string; items: readonly string[] }[] = [
  { title: 'Bắt đầu', items: [
    'Lần đầu mở app, đạo đồng hỏi tên, giới tính, ngày và giờ sinh để lập hồ sơ. Không nhớ giờ sinh thì chọn giờ gần nhất.',
    'Thêm hồ sơ cho người thân ở chip tên trên thanh trên cùng, chạm vào đó để đổi người đang xem.',
    'Ngày âm lịch có tháng nhuận thì đánh dấu "nhuận". Ngày không có thật (như 31/2) app sẽ báo, không tự đổi.',
  ] },
  { title: 'Tĩnh thất', items: [
    'Màn hình chính là án thư của người đọc. Chạm vào từng món để mở công cụ: lá số (Tử Vi), thẻ tre (Bát Tự), đồng xu (Lục Hào), la bàn (Bát Trạch, La Bàn), sách (Nạp Âm), sổ (Tổng hợp), đèn dầu (Chỉ tay).',
    'Bấm nút đọc để nghe phần tổng hợp; dùng ⏮ ⏭ để nghe lại hay bỏ qua một đoạn, 🐢 để nói chậm.',
    'Chạm giữ cây hương để thắp hương, chỉ để trang trí cho ấm cúng.',
  ] },
  { title: 'Các công cụ', items: [
    'Tử Vi: lá số 12 cung; chạm một cung để xem sao và lời giải. Bát Tự: bốn trụ năm, tháng, ngày, giờ và Ngũ hành.',
    'Lục Hào: nghĩ về một câu hỏi rồi gieo 6 lần (gieo ngẫu nhiên hoặc tự nhập kết quả gieo xu thật).',
    'Bát Trạch: Mệnh Quái và các hướng tốt xấu; chọn hướng cửa để xem riêng căn nhà. La Bàn: cầm máy nằm phẳng, xa đồ kim loại; máy không có cảm biến thì xoay tay.',
    'Nạp Âm: mệnh theo năm sinh và xem hợp hôn giữa hai hồ sơ. Tổng hợp: gom bốn hệ thống lại và đối chiếu.',
  ] },
  { title: 'Xem chỉ tay', items: [
    'Chọn tay thuận và tay muốn chụp, chụp lòng bàn tay rõ, rồi chạm 4 đường theo từng bước.',
    'Nét đứt mờ chỉ là máy gợi ý. Nếu nó lệch khỏi đường thật trên tay, đừng chạm theo nó: chạm vào đầu và cuối đường thật, nét lệch thì chạm thêm điểm, chạm nhầm thì "Lùi" hoặc "Xoá đường" rồi chạm lại.',
    'Xem lại bảng "Máy đo được" và sửa chỗ chưa đúng trước khi xem kết quả. Ảnh không được lưu; app giữ các nét đã chạm để vẽ lại sơ đồ và so sánh các lần xem.',
  ] },
  { title: 'Người đọc và giọng đọc', items: [
    'Cài đặt → Người đọc: chọn nhân vật, màu áo, hoặc dùng ảnh của bạn (app tự tách người ra khỏi nền để đứng trong Tĩnh thất, hoặc ghép khuôn mặt lên thân nhân vật vẽ sẵn; ảnh rõ mặt thì còn chớp mắt và mấp máy miệng khi đọc). Lời đọc tự xưng theo nhân vật.',
    'Nghe thử từng giọng của máy rồi chọn. Máy chưa có giọng tiếng Việt thì bấm "Tải thêm giọng tiếng Việt".',
  ] },
  { title: 'Lưu và chia sẻ', items: [
    'Nút chia sẻ tạo ảnh kết quả (có thể nhiều ảnh) để gửi qua ứng dụng khác. Ảnh có tên và ngày sinh, xem kỹ trước khi gửi.',
    'Cài đặt → Dữ liệu của bạn: sao lưu ra file, khôi phục từ file, hoặc xoá toàn bộ dữ liệu.',
  ] },
];
