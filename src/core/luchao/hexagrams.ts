/* Bảng 64 quẻ theo 8 cung (Kinh Phòng) và Nạp Giáp — chép nguyên văn từ bản web đã kiểm chứng (Phần 3). */
import type { CanIdx, ChiIdx, Quai } from '../types';
import type { HexaStep } from './types';

/** [cung, bậc, quái hạ, quái thượng, tên quẻ] */
export type HexaRow = readonly [cung: Quai, step: HexaStep, ha: Quai, thuong: Quai, name: string];

export const HEXA_ROWS: readonly HexaRow[] = [
['Càn','Bản cung','Càn','Càn','Càn vi Thiên'],['Càn','Nhất thế','Tốn','Càn','Thiên Phong Cấu'],
['Càn','Nhị thế','Cấn','Càn','Thiên Sơn Độn'],['Càn','Tam thế','Khôn','Càn','Thiên Địa Bĩ'],
['Càn','Tứ thế','Khôn','Tốn','Phong Địa Quán'],['Càn','Ngũ thế','Khôn','Cấn','Sơn Địa Bác'],
['Càn','Du hồn','Khôn','Ly','Hoả Địa Tấn'],['Càn','Quy hồn','Càn','Ly','Hoả Thiên Đại Hữu'],
['Khảm','Bản cung','Khảm','Khảm','Khảm vi Thuỷ'],['Khảm','Nhất thế','Đoài','Khảm','Thuỷ Trạch Tiết'],
['Khảm','Nhị thế','Chấn','Khảm','Thuỷ Lôi Truân'],['Khảm','Tam thế','Ly','Khảm','Thuỷ Hoả Ký Tế'],
['Khảm','Tứ thế','Ly','Đoài','Trạch Hoả Cách'],['Khảm','Ngũ thế','Ly','Chấn','Lôi Hoả Phong'],
['Khảm','Du hồn','Ly','Khôn','Địa Hoả Minh Di'],['Khảm','Quy hồn','Khảm','Khôn','Địa Thuỷ Sư'],
['Cấn','Bản cung','Cấn','Cấn','Cấn vi Sơn'],['Cấn','Nhất thế','Ly','Cấn','Sơn Hoả Bí'],
['Cấn','Nhị thế','Càn','Cấn','Sơn Thiên Đại Súc'],['Cấn','Tam thế','Đoài','Cấn','Sơn Trạch Tổn'],
['Cấn','Tứ thế','Đoài','Ly','Hoả Trạch Khuê'],['Cấn','Ngũ thế','Đoài','Càn','Thiên Trạch Lý'],
['Cấn','Du hồn','Đoài','Tốn','Phong Trạch Trung Phu'],['Cấn','Quy hồn','Cấn','Tốn','Phong Sơn Tiệm'],
['Chấn','Bản cung','Chấn','Chấn','Chấn vi Lôi'],['Chấn','Nhất thế','Khôn','Chấn','Lôi Địa Dự'],
['Chấn','Nhị thế','Khảm','Chấn','Lôi Thuỷ Giải'],['Chấn','Tam thế','Tốn','Chấn','Lôi Phong Hằng'],
['Chấn','Tứ thế','Tốn','Khôn','Địa Phong Thăng'],['Chấn','Ngũ thế','Tốn','Khảm','Thuỷ Phong Tỉnh'],
['Chấn','Du hồn','Tốn','Đoài','Trạch Phong Đại Quá'],['Chấn','Quy hồn','Chấn','Đoài','Trạch Lôi Tuỳ'],
['Tốn','Bản cung','Tốn','Tốn','Tốn vi Phong'],['Tốn','Nhất thế','Càn','Tốn','Phong Thiên Tiểu Súc'],
['Tốn','Nhị thế','Ly','Tốn','Phong Hoả Gia Nhân'],['Tốn','Tam thế','Chấn','Tốn','Phong Lôi Ích'],
['Tốn','Tứ thế','Chấn','Càn','Thiên Lôi Vô Vọng'],['Tốn','Ngũ thế','Chấn','Ly','Hoả Lôi Phệ Hạp'],
['Tốn','Du hồn','Chấn','Cấn','Sơn Lôi Di'],['Tốn','Quy hồn','Tốn','Cấn','Sơn Phong Cổ'],
['Ly','Bản cung','Ly','Ly','Ly vi Hoả'],['Ly','Nhất thế','Cấn','Ly','Hoả Sơn Lữ'],
['Ly','Nhị thế','Tốn','Ly','Hoả Phong Đỉnh'],['Ly','Tam thế','Khảm','Ly','Hoả Thuỷ Vị Tế'],
['Ly','Tứ thế','Khảm','Cấn','Sơn Thuỷ Mông'],['Ly','Ngũ thế','Khảm','Tốn','Phong Thuỷ Hoán'],
['Ly','Du hồn','Khảm','Càn','Thiên Thuỷ Tụng'],['Ly','Quy hồn','Ly','Càn','Thiên Hoả Đồng Nhân'],
['Khôn','Bản cung','Khôn','Khôn','Khôn vi Địa'],['Khôn','Nhất thế','Chấn','Khôn','Địa Lôi Phục'],
['Khôn','Nhị thế','Đoài','Khôn','Địa Trạch Lâm'],['Khôn','Tam thế','Càn','Khôn','Địa Thiên Thái'],
['Khôn','Tứ thế','Càn','Chấn','Lôi Thiên Đại Tráng'],['Khôn','Ngũ thế','Càn','Đoài','Trạch Thiên Quải'],
['Khôn','Du hồn','Càn','Khảm','Thuỷ Thiên Nhu'],['Khôn','Quy hồn','Khôn','Khảm','Thuỷ Địa Tỷ'],
['Đoài','Bản cung','Đoài','Đoài','Đoài vi Trạch'],['Đoài','Nhất thế','Khảm','Đoài','Trạch Thuỷ Khốn'],
['Đoài','Nhị thế','Khôn','Đoài','Trạch Địa Tuỵ'],['Đoài','Tam thế','Cấn','Đoài','Trạch Sơn Hàm'],
['Đoài','Tứ thế','Cấn','Khảm','Thuỷ Sơn Kiển'],['Đoài','Ngũ thế','Cấn','Khôn','Địa Sơn Khiêm'],
['Đoài','Du hồn','Cấn','Chấn','Lôi Sơn Tiểu Quá'],['Đoài','Quy hồn','Đoài','Chấn','Lôi Trạch Quy Muội'],
];

export const NAP_GIAP: Record<Quai, { noi: readonly (readonly [CanIdx, ChiIdx])[]; ngoai: readonly (readonly [CanIdx, ChiIdx])[] }> = {
  Càn:  { noi:[[0,0],[0,2],[0,4]], ngoai:[[8,6],[8,8],[8,10]] },
  Khôn: { noi:[[1,7],[1,5],[1,3]], ngoai:[[9,1],[9,11],[9,9]] },
  Chấn: { noi:[[6,0],[6,2],[6,4]], ngoai:[[6,6],[6,8],[6,10]] },
  Tốn:  { noi:[[7,1],[7,11],[7,9]], ngoai:[[7,7],[7,5],[7,3]] },
  Khảm: { noi:[[4,2],[4,4],[4,6]], ngoai:[[4,8],[4,10],[4,0]] },
  Ly:   { noi:[[5,3],[5,1],[5,11]], ngoai:[[5,9],[5,7],[5,5]] },
  Cấn:  { noi:[[2,4],[2,6],[2,8]], ngoai:[[2,10],[2,0],[2,2]] },
  Đoài: { noi:[[3,5],[3,3],[3,1]], ngoai:[[3,11],[3,9],[3,7]] },
};
