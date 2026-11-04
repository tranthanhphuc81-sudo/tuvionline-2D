/* Kiểu chỉ số dùng chung cho mọi module của src/core (không phụ thuộc gì). */
/** Chỉ số Can 0…9 (0 = Giáp). */
export type CanIdx = number;
/** Chỉ số Chi 0…11 (0 = Tý). */
export type ChiIdx = number;
/** Chỉ số giờ (Chi của giờ) 0…11 (0 = Tý). */
export type HourIdx = number;

/** Giới tính: 'M' = nam, 'F' = nữ. */
export type Gender = 'M' | 'F';

/** Tên 8 quái đơn (Bát Quái). */
export type Quai = 'Càn' | 'Khảm' | 'Cấn' | 'Chấn' | 'Tốn' | 'Ly' | 'Khôn' | 'Đoài';
