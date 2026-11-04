/* Thông tin Ngũ Hành dùng chung (màu, hướng, nghề, vật phẩm, mùa) — CHÉP NGUYÊN VĂN từ legacy (docs/legacy/lyso-toolkit.html, module LySoInterp).
   Sinh bằng script cắt thẳng từ file legacy; chỉ đổi `var` thành `export const` và thêm kiểu. Đừng sửa câu chữ ở đây
   (test đối chiếu tests/parity/* sẽ báo). */

export const HANH_INFO: Record<string, { mau: string; huong: string[]; nghe: string; vat: string; mua: string }> = {
  'Mộc': { mau:'xanh lá, xanh rêu', huong:['Đông','Đông Nam'], nghe:'giáo dục, xuất bản, thiết kế, thời trang, nông – lâm nghiệp, chăm sóc sức khoẻ', vat:'cây xanh, đồ gỗ, tranh cây cỏ', mua:'mùa Xuân (tháng Giêng, tháng Hai âm lịch)' },
  'Hoả': { mau:'đỏ, cam, hồng, tím', huong:['Nam'], nghe:'truyền thông, quảng cáo, điện – điện tử, công nghệ, ẩm thực, làm đẹp, biểu diễn', vat:'đèn sáng, đồ màu đỏ/cam', mua:'mùa Hạ (tháng Tư, tháng Năm âm lịch)' },
  'Thổ': { mau:'vàng, nâu đất, be', huong:['Đông Bắc','Tây Nam'], nghe:'bất động sản, xây dựng, nông nghiệp, kho vận, bảo hiểm, tư vấn, quản trị', vat:'gốm sứ, đá, pha lê', mua:'các tháng cuối mùa (tháng Ba, Sáu, Chín, Chạp âm lịch)' },
  'Kim': { mau:'trắng, xám, bạc, ánh kim', huong:['Tây','Tây Bắc'], nghe:'tài chính – ngân hàng, kế toán, cơ khí, kỹ thuật, pháp luật, trang sức', vat:'đồ kim loại, chuông gió kim loại', mua:'mùa Thu (tháng Bảy, tháng Tám âm lịch)' },
  'Thuỷ': { mau:'đen, xanh dương, xanh navy', huong:['Bắc'], nghe:'thương mại, xuất nhập khẩu, vận tải, logistics, du lịch, các nghề cần đi lại nhiều', vat:'bể cá, tiểu cảnh nước, tranh sông nước', mua:'mùa Đông (tháng Mười, tháng Mười Một âm lịch)' }
};
