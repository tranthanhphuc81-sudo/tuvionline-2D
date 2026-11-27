/* Câu chữ mục Xem ngày tốt xấu (ARCHITECTURE mục 17). Nội dung mới, viết lại bằng lời của app từ lời giải
   12 thần và thập nhị trực thường in trong lịch vạn niên; không chép nguyên văn sách nào.
   Không dùng từ cấm (`BANNED_TERMS` ở nguhanh/vocab.ts): nói "sắm sửa" chứ không nói chữ kia, không nhắc lễ bái hay vật phẩm. */
import { BatTuEngine, type DayGrade, type DayInfo, type ThanId, type TrucId, type ViecId, type ViecVerdict } from '../core';

const { CAN, CHI } = BatTuEngine;

/** Tiêu đề thanh trên: ngắn để vừa 360px cạnh chip hồ sơ. */
export const XEMNGAY_TITLE = 'Xem ngày';

export const THAN_VI: Record<ThanId, string> = {
  'thanh-long': 'Thanh Long', 'minh-duong': 'Minh Đường', 'thien-hinh': 'Thiên Hình', 'chu-tuoc': 'Chu Tước',
  'kim-quy': 'Kim Quỹ', 'kim-duong': 'Kim Đường (Bảo Quang)', 'bach-ho': 'Bạch Hổ', 'ngoc-duong': 'Ngọc Đường',
  'thien-lao': 'Thiên Lao', 'huyen-vu': 'Huyền Vũ', 'tu-menh': 'Tư Mệnh', 'cau-tran': 'Câu Trận',
};

export const TRUC_VI: Record<TrucId, { name: string; text: string }> = {
  kien: { name: 'Kiến', text: 'Trực Kiến là ngày "dựng lên", khí của tháng đang mạnh. Hợp để xuất hành, nhận việc mới, mở hàng; nên tránh đào đắp, động thổ.' },
  tru: { name: 'Trừ', text: 'Trực Trừ là ngày "bỏ cái cũ". Hợp dọn dẹp, sửa sang, thanh lý những gì không dùng nữa; chưa hợp cưới hỏi hay khai trương.' },
  man: { name: 'Mãn', text: 'Trực Mãn là ngày "đầy đủ". Hợp sắm sửa, đi lại, thu xếp chuyện tiền nong trong nhà; nên tránh nhận chức mới và động thổ.' },
  binh: { name: 'Bình', text: 'Trực Bình là ngày "bằng phẳng". Không nghiêng hẳn về bên nào, hợp làm đều các việc thường ngày.' },
  dinh: { name: 'Định', text: 'Trực Định là ngày "yên chỗ". Hợp ký kết, giao dịch, cưới hỏi, dọn về nhà mới, động thổ; nên tránh đi xa.' },
  chap: { name: 'Chấp', text: 'Trực Chấp là ngày "giữ lấy". Hợp lập giao kèo, nhận người, động thổ, cưới hỏi; nên tránh chi khoản lớn, dọn nhà, đi xa và mở hàng.' },
  pha: { name: 'Phá', text: 'Trực Phá là ngày "phá vỡ", lịch xưa khuyên chỉ nên dỡ bỏ cái cũ; việc lớn nên để ngày khác.' },
  nguy: { name: 'Nguy', text: 'Trực Nguy là ngày "chênh vênh", nên làm việc gì cũng cẩn trọng; tránh đi xa, động thổ, khai trương, cưới hỏi.' },
  thanh: { name: 'Thành', text: 'Trực Thành là ngày "thành tựu", được coi là một trong những trực tốt nhất: hợp cưới hỏi, khai trương, dọn nhà, ký kết, khởi công.' },
  thu: { name: 'Thu', text: 'Trực Thu là ngày "thu về". Hợp thu xếp tiền nong, nhận hàng, sắm sửa đồ dùng; nên tránh khởi công, đi xa, khai trương.' },
  khai: { name: 'Khai', text: 'Trực Khai là ngày "mở ra". Hợp khai trương, cưới hỏi, nhận việc, xuất hành, động thổ, dọn về nhà mới.' },
  be: { name: 'Bế', text: 'Trực Bế là ngày "đóng lại". Lịch xưa chỉ khuyên đắp, lấp, xây tường rào; khai trương, đi xa, cưới hỏi nên chọn ngày khác.' },
};

export const VIEC_VI: Record<ViecId, string> = {
  'cuoi-hoi': 'Cưới hỏi', 'khai-truong': 'Khai trương, mở hàng', 'dong-tho': 'Động thổ, khởi công', 'nhap-trach': 'Dọn về nhà mới',
  'xuat-hanh': 'Đi xa, xuất hành', 'ky-ket': 'Ký kết, giao dịch', 'sam-sua': 'Sắm sửa đồ lớn (xe, nhà, máy móc)', 'nhan-viec': 'Nhận việc, nhậm chức',
};

export const GRADE_VI: Record<DayGrade, string> = { dep: 'Ngày đẹp', thuong: 'Ngày thường', tranh: 'Nên tránh việc lớn' };
export const GRADE_TONE: Record<DayGrade, 'ok' | 'mid' | 'warn'> = { dep: 'ok', thuong: 'mid', tranh: 'warn' };
export const VERDICT_VI: Record<ViecVerdict, string> = { hop: 'Hợp', trung: 'Làm được', ky: 'Nên tránh' };

export const WEEKDAY_VI = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

export const canChiName = (c: { can: number; chi: number }) => `${CAN[c.can]} ${CHI[c.chi]}`;
export const chiName = (chi: number) => CHI[chi];
const two = (n: number) => String(n).padStart(2, '0');

/** "Thứ Năm, 26/11/2026" */
export const solarLine = (d: DayInfo) => `${WEEKDAY_VI[d.weekday]}, ${two(d.date.dd)}/${two(d.date.mm)}/${d.date.yy}`;
/** "Âm lịch 18/10 (nhuận) · ngày Giáp Thìn" */
export const lunarLine = (d: DayInfo) =>
  `Âm lịch ${d.lunar.day}/${d.lunar.month}${d.lunar.leap ? ' nhuận' : ''} · ngày ${canChiName(d.canChi)}`;

export const thanLine = (d: DayInfo) =>
  `${d.hoangDao ? 'Hoàng đạo' : 'Hắc đạo'}: ngày ${THAN_VI[d.than]}. ${d.hoangDao
    ? 'Theo lịch xưa, ngày có thần tốt trực, làm việc lớn thuận hơn.'
    : 'Theo lịch xưa, ngày thần xấu trực; việc lớn không gấp thì chọn ngày Hoàng đạo.'}`;

export const hoursLine = (d: DayInfo) =>
  `Giờ hoàng đạo: ${d.hours.map((h) => `${CHI[h]} (${two((h * 2 + 23) % 24)}–${two((h * 2 + 1) % 24)} giờ)`).join(', ')}.`;

/** Câu về tuổi: có hồ sơ thì nói riêng cho tuổi đó, không thì nêu tuổi bị xung. */
export function tuoiLine(d: DayInfo): string {
  if (!d.person) return `Ngày ${CHI[d.canChi.chi]} xung tuổi ${CHI[d.xungChi]}: người tuổi ${CHI[d.xungChi]} nên chọn ngày khác cho việc lớn.`;
  return d.person.xung
    ? `Ngày ${CHI[d.canChi.chi]} xung tuổi ${CHI[d.person.birthChi]} của hồ sơ này, nên mức ngày hạ một bậc. Việc lớn nên chọn ngày khác hoặc nhờ người nhà đứng ra lo.`
    : `Ngày ${CHI[d.canChi.chi]} không xung tuổi ${CHI[d.person.birthChi]} của hồ sơ này (ngày này xung tuổi ${CHI[d.xungChi]}).`;
}

/** Một dòng cho việc `v` trong ngày `d`. */
export function viecLine(d: DayInfo, v: ViecId, verdict: ViecVerdict): string {
  if (verdict === 'hop') return `${VIEC_VI[v]}: hợp. Ngày Hoàng đạo, trực ${TRUC_VI[d.truc].name} thuận cho việc này.`;
  if (verdict === 'ky') {
    return d.person?.xung
      ? `${VIEC_VI[v]}: nên tránh vì ngày xung tuổi.`
      : `${VIEC_VI[v]}: nên tránh, trực ${TRUC_VI[d.truc].name} kỵ việc này.`;
  }
  return `${VIEC_VI[v]}: làm được, ngày không nghiêng hẳn về bên nào.`;
}

export const XEMNGAY_INTRO = 'Lịch xưa chấm ngày bằng ba điều: thần trực ngày (Hoàng đạo hay Hắc đạo), thập nhị trực (Kiến, Trừ, Mãn…) và ngày có xung tuổi mình không. App tính cả ba từ can chi và tiết khí, ngay trên máy.';
export const XEMNGAY_RULE_NOTE = 'Cách app gộp thành một mức: Hoàng đạo và trực không phải Phá, Bế là ngày đẹp; Hắc đạo gặp trực Phá hoặc Bế là nên tránh việc lớn; còn lại là ngày thường. Thần trực ngày và trực tính theo tháng tiết khí; vài cuốn lịch tính thần theo tháng âm nên có thể lệch ở mấy ngày gần lúc giao tiết.';
export const XEMNGAY_PRACTICAL = 'Ngày tháng chỉ là phần phụ. Việc lớn nên quyết theo sự chuẩn bị, khả năng tài chính, giấy tờ rõ ràng và sức khoẻ của người làm.';
export const XEMNGAY_NO_PROFILE = 'Thêm hồ sơ để app xem riêng ngày có xung tuổi của bạn không.';
export const findTitle = (n: number) => `Ngày hợp trong ${n} ngày tới`;
export const FIND_NONE = 'Trong khoảng này chưa có ngày nào vừa Hoàng đạo, vừa có trực hợp việc, vừa không xung tuổi. Có thể chọn ngày "làm được" và chuẩn bị chu đáo.';
