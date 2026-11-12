/**
 * Bộ trọng số tính điểm. KHÔNG có chuẩn duy nhất giữa các trường phái —
 * vì vậy mọi hệ số đều để ở đây để app có thể đổi preset hoặc cho người dùng
 * nâng cao tự chỉnh, thay vì hard-code trong thuật toán.
 */

export interface ScoringConfig {
  id: string;
  name: string;

  /** Điểm gốc mỗi thiên can lộ */
  stemWeight: number;
  /** Tổng điểm một địa chi, chia cho tàng can theo hiddenRatios */
  branchWeight: number;
  /** Tỷ lệ chia tàng can theo số lượng tàng can [1 can], [2 can], [3 can] */
  hiddenRatios: { 1: number[]; 2: number[]; 3: number[] };

  /** Hệ số vị trí: trụ tháng (nguyệt lệnh) và trụ ngày thường nặng hơn */
  positionWeight: {
    yearStem: number; yearBranch: number;
    monthStem: number; monthBranch: number;
    dayStem: number; dayBranch: number;
    hourStem: number; hourBranch: number;
  };

  /** Hệ số theo trạng thái mùa: Vượng / Tướng / Hưu / Tù / Tử */
  seasonal: { vuong: number; tuong: number; huu: number; tu: number; tuDie: number };

  /** Tương tác */
  interactions: {
    /** Điểm cộng cho hành của tam hợp cục khi đủ 3 chi */
    triadBonus: number;
    /** Điểm cộng khi có 2/3 chi tam hợp và có chi chính (Tý/Ngọ/Mão/Dậu) — bán hợp */
    halfTriadBonus: number;
    /** Điểm cộng cho hành hóa của lục hợp chi kề nhau */
    sixComboBonus: number;
    /** Hệ số giảm cho 2 chi bị lục xung (nhân vào điểm của chi) */
    clashFactor: number;
    /** Hệ số giảm cho 2 can kề nhau bị hợp (hợp bán, chưa hóa) */
    stemComboFactor: number;
  };

  /** Ngưỡng phân loại nhật chủ theo tỷ lệ (Tỷ Kiếp + Ấn) / tổng */
  thresholds: {
    followWeak: number;   // < ngưỡng này: xét Tòng cách (tòng nhược)
    weak: number;         // < ngưỡng này: thân nhược
    strong: number;       // > ngưỡng này: thân vượng
    followStrong: number; // > ngưỡng này: xét Chuyên vượng
  };

  /** Điều hậu: tỷ lệ tối thiểu của hành Hỏa (sinh mùa lạnh) / Thủy (sinh mùa nóng) */
  climateMinShare: number;
  /** Điều hậu được ưu tiên hơn Phù ức khi hành cần chiếm dưới tỷ lệ này (v0.2: climateMinShare / 2) */
  climatePriorityShare: number;
  /** Thông quan: mỗi hành trong cặp xung khắc phải chiếm ít nhất tỷ lệ này */
  bridgeMinShare: number;

  /** Kiểm tra điều kiện Tòng cách / Chuyên vượng (xem follow.ts) */
  follow: {
    /** Tỷ lệ hỗ trợ dưới mức này thì bắt đầu xét Tòng (rộng hơn thresholds.followWeak để bắt cả giả tòng) */
    candidateWeak: number;
    /** Tỷ lệ hỗ trợ trên mức này thì bắt đầu xét Chuyên vượng */
    candidateStrong: number;
    /** Trọng số gốc theo vị trí tàng can: bản khí / trung khí / dư khí */
    rootWeights: [number, number, number];
    /** Gốc ở chi tháng / chi ngày nặng hơn */
    monthRootMultiplier: number;
    dayRootMultiplier: number;
    /** Tổng điểm gốc ≤ mức này coi là "gốc yếu" (giả tòng), lớn hơn là có gốc thật (không thành cách) */
    weakRootMax: number;
    /** Phe được theo phải chiếm ít nhất tỷ lệ này */
    dominantMinShare: number;
    /** Hành mạnh nhất / hành thứ nhì trong phe được theo ≥ mức này thì là "tòng nhất hành", ngược lại "tòng thế" */
    singleDirectionRatio: number;
    /** Trọng số 4 điều kiện khi tính độ tin cậy */
    checkWeights: { root: number; exposed: number; dominant: number; direction: number };
    /** Ngưỡng độ tin cậy */
    chanMin: number; // ≥: Chân tòng / chuyên vượng thật
    giaMin: number;  // ≥: Giả tòng (hiện cả hai cách luận)
    /** Trọng số tối đa của cách luận thuận thế khi chỉ là Giả tòng — để cách luận còn lại luôn hiện rõ */
    giaMaxWeight: number;
  };
}

/**
 * Bộ hệ số gốc của bản tham chiếu docs/ngu-hanh-engine v0.2, giữ nguyên để test chứng minh bản port đúng thuật toán.
 * App KHÔNG dùng bộ này; app dùng DEFAULT_CONFIG (đã hiệu chỉnh theo sách, ARCHITECTURE 14.12).
 */
export const REFERENCE_CONFIG: ScoringConfig = {
  id: "tu-binh-pho-thong",
  name: "Tử Bình phổ thông (v0.2)",
  stemWeight: 1.0,
  branchWeight: 1.2,
  hiddenRatios: { 1: [1], 2: [0.7, 0.3], 3: [0.6, 0.3, 0.1] },
  positionWeight: {
    yearStem: 0.8, yearBranch: 0.8,
    monthStem: 1.0, monthBranch: 2.0,
    dayStem: 0,     dayBranch: 1.3, // nhật can là nhật chủ, không tự cộng cho chính nó
    hourStem: 0.9, hourBranch: 0.9,
  },
  seasonal: { vuong: 1.4, tuong: 1.2, huu: 1.0, tu: 0.85, tuDie: 0.7 },
  interactions: {
    triadBonus: 1.5,
    halfTriadBonus: 0.6,
    sixComboBonus: 0.4,
    clashFactor: 0.75,
    stemComboFactor: 0.85,
  },
  thresholds: { followWeak: 0.15, weak: 0.4, strong: 0.55, followStrong: 0.85 },
  climateMinShare: 0.12,
  climatePriorityShare: 0.06,
  bridgeMinShare: 0.3,
  follow: {
    candidateWeak: 0.25,
    candidateStrong: 0.75,
    rootWeights: [1, 0.5, 0.2],
    monthRootMultiplier: 2,
    dayRootMultiplier: 1.5,
    weakRootMax: 0.8, // 1 trung khí ở chi ngày (0.75) = gốc yếu; có bản khí (≥ 1) = gốc thật
    dominantMinShare: 0.7,
    singleDirectionRatio: 1.8,
    checkWeights: { root: 0.35, exposed: 0.25, dominant: 0.25, direction: 0.15 },
    chanMin: 0.8,
    giaMin: 0.5,
    giaMaxWeight: 0.65,
  },
};

/**
 * Bộ hệ số app dùng: v0.2 cộng hiệu chỉnh theo 50 lá số mẫu trong sách (ARCHITECTURE 14.12, docs/NGU-HANH-SACH.md).
 * Hiệu chỉnh 12/11/2026: weakRootMax 0,8 → 1,0. Một trung khí ở chi tháng (0,5 × 2 = 1,0) hay một trung khí ở chi ngày
 * cộng một dư khí vẫn là gốc yếu, không chặn Tòng cách (sách nhận Tòng Tài ở tbct-13 dù Thìn có Ất, Tuất có Đinh).
 * Các thay đổi khác đã thử mà không giữ: xem ARCHITECTURE 14.12.
 */
export const DEFAULT_CONFIG: ScoringConfig = {
  ...REFERENCE_CONFIG,
  name: "Tử Bình phổ thông (mặc định)",
  follow: { ...REFERENCE_CONFIG.follow, weakRootMax: 1.0 },
};

/** Preset ví dụ: coi nguyệt lệnh cực nặng (gần với cách luận "đắc lệnh là chính") */
export const MONTH_HEAVY_CONFIG: ScoringConfig = {
  ...DEFAULT_CONFIG,
  id: "nguyet-lenh-nang",
  name: "Trọng nguyệt lệnh",
  positionWeight: { ...DEFAULT_CONFIG.positionWeight, monthBranch: 3.0 },
  seasonal: { vuong: 1.6, tuong: 1.3, huu: 1.0, tu: 0.8, tuDie: 0.6 },
};

export const PRESETS: ScoringConfig[] = [DEFAULT_CONFIG, MONTH_HEAVY_CONFIG];
