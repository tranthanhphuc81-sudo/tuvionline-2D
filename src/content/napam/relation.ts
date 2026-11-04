/* Câu văn quan hệ hợp hôn theo Nạp Âm — chép NGUYÊN VĂN từ legacy (lyso-toolkit.html, NapAmEngine.relation).
   Engine (src/core/napam) chỉ trả mã; file này dựng lại đúng câu cũ. */
import type { NapAmNeedsId, NapAmRelation, NapAmYear } from '../../core';

type Party = Pick<NapAmYear, 'ten' | 'hanh'>;

const NEEDS_NOTE: Record<NapAmNeedsId, string> = {
  'kim-tho': 'là kim loại thô, cần Hoả để nung/luyện mới thành khí cụ hoàn chỉnh',
  'hoa-troi': 'là lửa trên trời/ánh chớp sấm sét, cần Thuỷ (mây, hơi ẩm) mới sinh ra được',
};

const KHAC_TAIL = ' Đây là MỘT lớp tham khảo khi xem tuổi hợp hôn, cần cân nhắc thêm cùng các yếu tố khác (tuổi xung theo Chi, Cung phi Bát Trạch...), không phải căn cứ duy nhất hay mang tính quyết định.';

/** Câu giải thích quan hệ giữa Người 1 (`pA`) và Người 2 (`pB`). */
export function napAmRelationText(rel: NapAmRelation, pA: Party, pB: Party): string {
  const p = (n: 1 | 2) => (n === 1 ? pA : pB);
  const f = p(rel.from), t = p(rel.to);
  switch (rel.kind) {
    case 'exc-dai-hai-sa-trung':
      return 'Đại Hải Thuỷ (nước biển lớn) được dân gian xem là dung nạp được Sa Trung Thổ (đất lẫn cát, đất cù lao) mà không bị khắc chế — đây là 1 trong 4 ngoại lệ sinh khắc đặc biệt của Nạp Âm (mục 5, Phụ lục Nạp Âm), dù theo Ngũ hành gốc thì Thổ khắc Thuỷ.';
    case 'exc-needs':
      return f.ten + ' (' + NEEDS_NOTE[rel.needs!] + ') — nên mạng ' + t.hanh + ' (' + t.ten + ') của người kia KHÔNG bị xem là khắc mà ngược lại còn được xem là có lợi, dù theo Ngũ hành gốc ' + t.hanh + ' khắc ' + f.hanh + '. Đây là 1 trong 4 ngoại lệ sinh khắc đặc biệt của Nạp Âm (mục 5, Phụ lục Nạp Âm).';
    case 'same':
      return 'Hai mạng cùng hành ' + pA.hanh + ' — dân gian xem là hoà hợp, ngang bằng, không xung khắc.';
    case 'sinh':
      return f.hanh + ' sinh ' + t.hanh + ' — mạng Người ' + rel.from + ' (' + f.ten + ') tương sinh, trợ lực cho mạng Người ' + rel.to + ' (' + t.ten + ').';
    case 'khac':
      return f.hanh + ' khắc ' + t.hanh + ' — theo Ngũ hành gốc, mạng Người ' + rel.from + ' (' + f.ten + ') khắc mạng Người ' + rel.to + ' (' + t.ten + ').' + KHAC_TAIL;
    default:
      return 'Không xác định được quan hệ sinh khắc.';
  }
}
