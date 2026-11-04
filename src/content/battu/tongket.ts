/* "Tổng kết" của tab Bát Tự — NGUYÊN VĂN legacy batTu() + thapThanHtml() + block(). Phép tính ở src/core/battu/reading.ts. */
import { BatTuEngine, batTuReading, type BatTuChart, type ThapThanCombo, type ThapThanProfile } from '../../core';
import { list, note, p, type Section } from '../rich';
import { CAN_TRAITS, FAMILY, GOD_SHORT } from '../interp/battu';
import { HANH_INFO } from '../interp/hanh';

const { CAN, CHI } = BatTuEngine;
export const BATTU_NOTE = 'Cách đánh giá ở đây dựa trên nguyên tắc Vượng Suy cơ bản (chưa xét đầy đủ Tàng Can, Hình – Xung – Hội – Hợp hay các Cách Cục đặc biệt) — mang tính văn hoá, tham khảo.';

const COMBO_TEXT: Record<ThapThanCombo, string> = {
  'thuc-thuong-sinh-tai': '<b>Thực Thương sinh Tài</b> — dùng tài năng để ra tiền: rất hợp kinh doanh dựa trên sản phẩm hoặc kỹ năng của chính mình (bán hàng online, dịch vụ, làm tự do).',
  'quan-an': '<b>Quan Ấn tương sinh</b> — hợp môi trường tổ chức lớn, nhà nước, học hàm học vị; thăng tiến theo từng bậc.',
  'thuong-quan-gap-quan': '<b>Thương Quan gặp Quan</b> — có tài nhưng dễ va chạm cấp trên; nên chọn nơi tôn trọng ý kiến cá nhân, hoặc tự làm chủ.',
  'ty-kiep-gap-tai': '<b>Tỷ Kiếp mạnh gặp Tài</b> — cẩn thận hùn hạp, cho vay, góp vốn với bạn bè; tiền chung phải rõ ràng từ đầu.',
  'sat-an': '<b>Sát Ấn tương sinh</b> — chịu được áp lực lớn, hợp vai trò xử lý khủng hoảng, quản lý, kỹ thuật cao.',
  'an-nhieu-thieu-thuc-thuong': '<b>Ấn nhiều, thiếu Thực Thương</b> — biết nhiều nhưng ngại thể hiện; hãy tập biến kiến thức thành sản phẩm (bài viết, khoá học, dự án).',
};

/** Mục "🧩 Thập Thần nổi bật" (legacy thapThanHtml). */
export function thapThanSection(tp: ThapThanProfile): Section {
  const top = tp.order[0], second = tp.order[1];
  return {
    id: 'battu.tongket.thapthan', title: '🧩 Thập Thần nổi bật — tính cách và nghề nghiệp',
    blocks: [
      p('battu.tongket.thapthan.intro', 'Tỷ lệ 5 nhóm Thập Thần trong lá số (tính cả Can lộ và Can ẩn trong Chi):'),
      { id: 'battu.tongket.thapthan.bars', kind: 'bars', rows: tp.order.map((f) => ({ label: f, pct: tp.pct[f] })) },
      p('battu.tongket.thapthan.top', 'Nhóm mạnh nhất là <b>' + top + '</b>: ' + FAMILY[top].net + '. Nhóm thứ hai là <b>' + second + '</b>: ' + FAMILY[second].net + '.'
        + ' Hai "vai" nổi bật nhất: ' + tp.topGods.map((g) => '<b>' + g + '</b> (' + GOD_SHORT[g] + ')').join(' và ') + '.'),
      p('battu.tongket.thapthan.nghe', '<b>Nghề nghiệp hợp:</b> ' + FAMILY[top].nghe + '; ngoài ra có thể cân nhắc ' + FAMILY[second].nghe + '.'),
      ...(tp.combos.length ? [list('battu.tongket.thapthan.combos', tp.combos.map((c) => COMBO_TEXT[c]))] : []),
      note('battu.tongket.thapthan.how', 'Tỷ lệ này là cách công cụ đếm (Can lộ tính 1, Can ẩn tính 1 / 0,5 / 0,3 theo Bản – Trung – Dư khí), dùng để thấy nhóm nào trội — không phải số đo chính xác.'),
    ],
  };
}

function uniq(a: readonly string[]): string[] {
  const seen = new Set<string>();
  return a.filter((x) => { if (!x || seen.has(x)) return false; seen.add(x); return true; });
}

const tone = (sc: number) => (sc >= 1 ? '<b>thuận lợi</b> — nên chủ động tiến lên' : sc <= -1 ? '<b>cần thận trọng</b> — giữ chắc những gì đang có, tránh mạo hiểm' : '<b>bình thường</b> — được hay mất tuỳ sự chuẩn bị');

export function batTuTongKet(ch: BatTuChart, nowYear: number): Section[] {
  const r = batTuReading(ch, nowYear);
  const a = r.assessment, nc = a.nhatChuHanh;
  const can = CAN[ch.nhatChu], ct = CAN_TRAITS[can];
  const info = HANH_INFO[r.primary];
  const HANH5 = ['Mộc', 'Hoả', 'Thổ', 'Kim', 'Thuỷ'] as const;

  const tomTat: string[] = [];
  tomTat.push('Nhật Chủ của bạn là <b>' + can + '</b> (hành ' + nc + ') — hình ảnh <b>' + ct.hinh + '</b>: ' + ct.net + '.');
  tomTat.push(a.thanVuong
    ? 'Lá số thuộc dạng <b>Thân vượng</b> — bạn như cục pin đầy: nhiều năng lượng, tự lập, chịu áp lực tốt. Năng lượng này cần được "xả" vào việc có ích (công việc, kiếm tiền, vận động); dồn nén lâu dễ thành bướng, nóng.'
    : 'Lá số thuộc dạng <b>Thân nhược</b> — bạn tinh tế và làm tốt nhất khi có điểm tựa: môi trường ổn định, người đồng hành, được học hỏi. Đứng một mình giữa áp lực lớn sẽ nhanh mệt.');
  tomTat.push('Tám chữ trong lá số có: ' + HANH5.map((h) => h + ' ' + r.count[h]).join(', ') + '.'
    + (r.thieu.length ? ' Lá số <b>thiếu hành ' + r.thieu.join(', ') + '</b>.' : '')
    + (r.nhieu.length ? ' Hành <b>' + r.nhieu.join(', ') + '</b> đang nhiều.' : '')
    + ' Hành nên bổ sung nhất cho bạn (Dụng Thần) là <b>' + r.primary + '</b>' + (r.dung.length > 1 ? '; ngoài ra hợp với ' + r.dung.filter((h) => h !== r.primary).join(', ') : '')
    + '. Nên hạn chế bớt hành ' + r.ky.join(', ') + '.');

  const manh = ct.manh.slice(), luuY = ct.luuY.slice();
  if (a.thanVuong) { manh.push('Chịu áp lực tốt, càng bận càng hăng'); luuY.push('Dễ cố chấp, khó nghe người khác khi đang "đà"'); }
  else { manh.push('Biết lắng nghe, hợp tác tốt, khéo dựa vào sức tập thể'); luuY.push('Dễ ôm quá sức rồi kiệt sức; ngại từ chối'); }

  const viDu = [ct.viDu,
    'Hành ' + r.primary + ' hợp với bạn, nên trong đời sống có thể chọn: ví, ốp điện thoại, áo khoác màu <b>' + info.mau + '</b>; bàn làm việc quay mặt về hướng <b>' + info.huong.join(' hoặc ') + '</b>; trang trí bằng ' + info.vat + '.'];

  const khuyen: string[] = [];
  khuyen.push('Nghề nghiệp nên nghiêng về các lĩnh vực hợp hành ' + r.primary + ': ' + info.nghe + '.');
  if (a.thanVuong) {
    khuyen.push('Chọn việc có thử thách và chỉ tiêu rõ ràng — bạn càng có việc để "dồn sức" thì càng phát huy.');
    khuyen.push('Vận động thể thao đều đặn để giải toả năng lượng; trước quyết định lớn, hỏi ý kiến ít nhất một người bạn tin.');
  } else {
    khuyen.push('Ưu tiên học thêm (bằng cấp, kỹ năng, chứng chỉ) và tìm một người hướng dẫn — đó là nguồn lực lớn nhất của bạn.');
    khuyen.push('Không gánh nợ lớn hay hợp tác rủi ro khi chưa đủ nền; làm việc theo nhóm sẽ hiệu quả hơn làm một mình.');
  }
  khuyen.push('Mùa thuận lợi để bắt đầu việc mới: ' + info.mua + '.');

  const hienTai: string[] = [];
  const dv = r.daiVanNow;
  if (dv) hienTai.push('Bạn đang ở Đại Vận <b>' + CAN[dv.canChi.can] + ' ' + CHI[dv.canChi.chi] + '</b> (' + dv.tuoiStart + '–' + (dv.tuoiStart + 9) + ' tuổi), mang hành ' + dv.hanhCan + ' và ' + dv.hanhChi + ' — so với hành hợp của bạn, 10 năm này nhìn chung ' + tone(dv.score) + '.');
  const yn = r.yearNow;
  hienTai.push('Năm nay (' + yn.year + ', ' + CAN[yn.canChi.can] + ' ' + CHI[yn.canChi.chi] + ') mang hành ' + yn.hanhCan + ' và ' + yn.hanhChi + ': ' + tone(yn.score) + '.');

  const tp = r.profile, topF = FAMILY[tp.order[0]];
  manh.push('Nhóm Thập Thần trội nhất là ' + tp.order[0] + ': ' + topF.net);
  luuY.push(tp.order[0] + ' trội: ' + topF.luuY);
  viDu.unshift(topF.viDu);
  tp.missing.forEach((f) => luuY.push('Lá số gần như thiếu nhóm ' + f + ': ' + FAMILY[f].thieu));
  khuyen.unshift('Theo Thập Thần nổi bật, nghề hợp với bạn: ' + topF.nghe + '. Kết hợp với hành nên bổ sung (' + r.primary + ') ở trên để chọn lĩnh vực cụ thể.');

  const sec = (id: string, title: string, items: string[], max: number): Section[] => {
    const xs = uniq(items).slice(0, max);
    return xs.length ? [{ id, title, blocks: [list(id + '.list', xs)] }] : [];
  };
  return [
    { id: 'battu.tongket', title: 'Tóm lại: lá số này nói gì về bạn?', blocks: tomTat.map((t, i) => p('battu.tongket.tomtat.' + i, t, i === 0 ? { pillar: 2 } : undefined)) },
    ...sec('battu.tongket.manh', '✅ Điểm mạnh', manh, 5),
    ...sec('battu.tongket.luuy', '⚠️ Điểm cần lưu ý', luuY, 5),
    thapThanSection(tp),
    { id: 'battu.tongket.now', title: '📅 Giai đoạn hiện tại', blocks: hienTai.map((t, i) => p('battu.tongket.now.' + i, t)) },
    ...sec('battu.tongket.vidu', '💡 Ví dụ dễ hình dung', viDu, 4),
    ...sec('battu.tongket.khuyen', '🎯 Lời khuyên thực tế', khuyen, 6),
    { id: 'battu.tongket.note', title: '', blocks: [note('battu.tongket.note.0', BATTU_NOTE)] },
  ];
}
