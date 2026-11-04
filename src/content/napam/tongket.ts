/* "Tổng kết" của Nạp Âm — NGUYÊN VĂN legacy LySoInterp.napAm() + block(). Phép chấm ở src/core/napam/reading.ts. */
import { NapAmEngine, PhongThuyEngine, type HopLevel, type NapAmCompat, type NapAmYear } from '../../core';
import { tongKetSections } from '../common/tongket';
import { HANH_INFO } from '../interp/hanh';
import { NAPAM_IMG } from '../interp/napam';
import type { Section } from '../rich';
import { napAmRelationText } from './relation';

const { CHI, sinhOf: sinhRa, khacOf: khacDi } = NapAmEngine;
const { SINH_PREV: duocSinhBoi, KHAC_PREV: biKhacBoi } = PhongThuyEngine;

export const NAPAM_NOTE = 'Xem tuổi theo Nạp Âm và con giáp là quan niệm dân gian — chỉ nên tham khảo; sự hiểu nhau, tôn trọng và cùng nỗ lực mới là điều quyết định một mối quan hệ.';

const CHI_REL_TEXT: Record<NapAmCompat['chiKind'], string> = {
  'same': 'cùng con giáp — dễ hiểu nhau nhưng cũng dễ "cứng đầu" giống nhau',
  'luc-hop': 'tuổi Lục Hợp — dân gian xem là hợp, dễ gắn bó',
  'tam-hop': 'tuổi Tam Hợp — dân gian xem là hợp, cùng chí hướng',
  'luc-xung': 'tuổi Lục Xung — dân gian xem là dễ va chạm, cần nhường nhịn',
  'none': 'tuổi không xung không hợp — bình thường',
};

const LEVEL_TEXT: Record<HopLevel, string> = {
  'rat-hop': '<b>Mức độ hợp: rất hợp.</b> Cả mạng (Nạp Âm) lẫn tuổi (con giáp) đều thuận.',
  'hop': '<b>Mức độ hợp: hợp.</b> Có điểm thuận rõ ràng, điểm chưa thuận không đáng ngại.',
  'binh-thuong': '<b>Mức độ hợp: bình thường.</b> Có điểm hợp, có điểm cần dung hoà — giống hầu hết các cặp đôi.',
  'dung-hoa': '<b>Mức độ hợp: cần dung hoà nhiều.</b> Theo dân gian, cả mạng và tuổi đều có điểm khắc — nhưng đây chỉ là một góc nhìn, sự thấu hiểu mới là quyết định.',
};

export function napAmTongKet(r1: NapAmYear, pair: { r2: NapAmYear; compat: NapAmCompat } | null): Section[] {
  const tomTat: string[] = [], manh: string[] = [], luuY: string[] = [], viDu: string[] = [], khuyen: string[] = [];
  const h = r1.hanh;
  tomTat.push('Mạng của bạn là <b>' + r1.ten + '</b> (hành ' + r1.hanh + ') — hình ảnh ' + (NAPAM_IMG[r1.ten] || '') + '.');
  manh.push('Hợp nhất với người mạng <b>' + duocSinhBoi[h] + '</b> (họ "nuôi dưỡng", hỗ trợ bạn) và người cùng mạng <b>' + h + '</b>.');
  manh.push('Bạn là chỗ dựa tốt cho người mạng <b>' + sinhRa(h) + '</b> (bạn hỗ trợ họ).');
  luuY.push('Với người mạng <b>' + biKhacBoi[h] + '</b> (khắc bạn) và <b>' + khacDi(h) + '</b> (bạn khắc) thì cần dung hoà, nhường nhịn hơn.');
  khuyen.push('Màu sắc hợp mệnh: ' + HANH_INFO[h].mau + ' và ' + HANH_INFO[duocSinhBoi[h]].mau + '; hạn chế ' + HANH_INFO[biKhacBoi[h]].mau + '.');
  if (pair) {
    const { r2, compat: c } = pair;
    tomTat.push('Người kia mạng <b>' + r2.ten + '</b> (hành ' + r2.hanh + ') — ' + (NAPAM_IMG[r2.ten] || '') + '.');
    tomTat.push('Về mạng: ' + napAmRelationText(c.rel, r1, r2));
    tomTat.push('Về tuổi: ' + CHI[r1.chi] + ' và ' + CHI[r2.chi] + ' là ' + CHI_REL_TEXT[c.chiKind] + '.');
    const a = r1.hanh, b = r2.hanh;
    const nguoi1 = 'Người 1 (' + a + ')', nguoi2 = 'Người 2 (' + b + ')';
    if (c.flow.kind === 'same') {
      viDu.push('Hai người cùng hành ' + a + ' giống hai người cùng "tần số": dễ đồng ý với nhau, nhưng khi bất đồng thì cả hai cùng khó lùi bước.');
      khuyen.push('Thống nhất trước "ai quyết việc gì" (ví dụ: một người lo tài chính, một người lo con cái) để tránh giằng co.');
    } else if (c.flow.kind === 'sinh') {
      const giver = c.flow.by === 1 ? nguoi1 : nguoi2, taker = c.flow.by === 1 ? nguoi2 : nguoi1;
      viDu.push(giver + ' thường là người chăm lo, nâng đỡ; ' + taker + ' được hỗ trợ nhiều hơn — giống người lo cơm nước và người được chăm sóc.');
      khuyen.push(taker + ' nên chủ động ghi nhận, đáp lại để người kia không thấy "cho mãi mà không được nhận".');
    } else {
      const strongP = c.flow.by === 1 ? nguoi1 : nguoi2, weakP = c.flow.by === 1 ? nguoi2 : nguoi1;
      viDu.push(strongP + ' dễ lấn át, quyết định thay; ' + weakP + ' dễ cảm thấy bị kiểm soát — ví dụ chuyện chi tiêu, chọn trường cho con thường hay tranh luận.');
      khuyen.push(strongP + ' nên hỏi ý kiến trước khi quyết; ' + weakP + ' nên nói rõ mong muốn thay vì im lặng chịu đựng.');
    }
    khuyen.push('Dành thời gian nói chuyện thẳng thắn về tiền bạc, con cái và cách sống trước khi về chung nhà — điều này quan trọng hơn mọi phép xem tuổi.');
  } else {
    viDu.push('Ví dụ: nếu bạn mạng ' + h + ', khi chọn người hợp tác làm ăn mạng ' + duocSinhBoi[h] + ', dân gian cho rằng người đó dễ "nâng đỡ" bạn; còn với người mạng ' + biKhacBoi[h] + ' thì nên phân chia vai trò thật rõ.');
  }
  return tongKetSections('napam.tongket', {
    title: pair ? 'Tóm lại: hai người có hợp nhau không?' : 'Tóm lại: mạng của bạn nói gì?',
    verdict: pair ? { html: LEVEL_TEXT[pair.compat.level], tone: pair.compat.tone } : null,
    tomTat, manh, luuY, viDu, khuyen, note: NAPAM_NOTE,
  });
}
