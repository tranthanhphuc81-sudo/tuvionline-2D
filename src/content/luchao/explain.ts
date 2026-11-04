/* Lục Hào: "Luận đoán", "Giải thích chỉ số", ghi chú — NGUYÊN VĂN legacy (renderVerdict, renderExplain, renderNotes). */
import { LucHaoEngine, verdictHaos, type CastContext, type DungThanKey, type LucHaoResult } from '../../core';
import { p, type Section } from '../rich';

const { CAN, CHI } = LucHaoEngine;

export function dtLabel(key: DungThanKey): string {
  return key === 'the' ? 'Thế hào (bản thân)' : key === 'ung' ? 'Ứng hào (đối tượng/kết quả)' : key;
}

const THE_REL = [
  'đồng hành với Thế (ngang bằng, không sinh không khắc)',
  'bị Thế sinh ra (Thế phải "cho", có phần hao tổn cho bản thân)',
  'bị Thế khắc chế (bản thân chi phối được việc này)',
  'khắc chế lại Thế (bất lợi, việc này gây áp lực ngược lại bản thân)',
  'sinh trợ cho Thế (thuận lợi, có ích cho bản thân)',
];

/** Mục "Luận đoán" (legacy #kd-verdictCard). */
export function lucHaoVerdict(r: LucHaoResult, ctx: CastContext, key: DungThanKey): Section {
  const nhatChi = ctx.nhat.chi;
  const blocks = [p('luchao.verdict.dt', 'Dụng Thần đã chọn: ' + dtLabel(key))];
  const vs = verdictHaos(r, ctx, key);
  if (!vs.length) {
    blocks.push(p('luchao.verdict.none', 'Quẻ này KHÔNG có hào nào mang Lục Thân "' + key + '" — theo lý thuyết chuyên sâu cần tìm Phục Thần (nằm ngoài phạm vi công cụ). Có thể tạm xem xét quan hệ tổng quát của hào Thế với việc đang hỏi thay thế.'));
  }
  vs.forEach((v) => {
    const h = v.hao;
    const relTxt = v.nhatRel === 'xung' ? 'bị chính Nhật thần (' + CHI[nhatChi] + ') XUNG động thêm' : v.nhatRel === 'hop' ? 'được Nhật thần (' + CHI[nhatChi] + ') HỢP, có phần thuận lợi' : 'không bị Nhật thần xung hay hợp';
    blocks.push({ ...p('luchao.verdict.hao' + h.idx, '<b>Hào ' + h.idx + '</b> (' + CAN[h.can] + ' ' + CHI[h.chi] + ', ' + h.lucThan + ') đang ở trạng thái <b>' + v.state + '</b> theo Nguyệt lệnh (' + (v.strong ? 'khá mạnh' : 'khá yếu') + '), và ' + relTxt + '.' + (h.dong ? ' Hào này đang ĐỘNG, cho thấy tình huống sẽ có biến chuyển — xem thêm mục Quẻ biến ở trên để biết xu hướng.' : '')), ref: { hao: h.idx } });
    if (v.theRel !== null) blocks.push(p('luchao.verdict.the' + h.idx, 'So với Thế hào (hào ' + v.theIdx + '): Dụng Thần ' + THE_REL[v.theRel] + '.'));
  });
  const nDong = r.hao.filter((h) => h.dong).length;
  blocks.push(p('luchao.verdict.overview', '<b>Tổng quan quẻ ' + r.name + '</b> (Cung ' + r.cung + ', ' + r.step + ')' + (nDong > 0
    ? ': quẻ có ' + nDong + ' hào động nên tình huống đang trong giai đoạn biến chuyển, nên xem thêm quẻ biến ' + (r.bien ? r.bien.name : '') + ' để biết xu hướng sẽ đi về đâu.'
    : ': quẻ không có hào động nào — tình huống đang ổn định, chưa có biến chuyển rõ rệt, có thể tạm căn cứ vào ý nghĩa chung của quẻ chủ và trạng thái Dụng Thần ở trên.')));
  return { id: 'luchao.verdict', title: '', blocks };
}

export function lucHaoExplain(r: LucHaoResult, key: DungThanKey): Section[] {
  return [
    {
      id: 'luchao.explain.que', title: '1. Quẻ chủ và quẻ biến',
      blocks: [p('luchao.explain.que.0', 'Gieo 6 lần đồng xu (từ hào Sơ đến hào Thượng) tạo thành <b>quẻ chủ</b> — bức tranh hiện tại của sự việc. Nếu có hào đạt điểm 6 (Lão Âm) hoặc 9 (Lão Dương), hào đó "động" và sẽ đảo Âm↔Dương, sinh ra <b>quẻ biến</b> — cho biết xu hướng sự việc sẽ chuyển sang thế nào. ' + (r.bien ? 'Quẻ này có hào động nên đã sinh ra quẻ biến — xem mục "Quẻ biến" bên trên để biết chiều hướng chuyển tiếp.' : 'Quẻ này không có hào động nào, nên tình huống được xem là ổn định, chưa có quẻ biến.'))],
    },
    {
      id: 'luchao.explain.theung', title: '2. Thế và Ứng',
      blocks: [p('luchao.explain.theung.0', 'Trong 6 hào, có đúng 1 hào là <b>Thế</b> (đại diện cho người xem quẻ / bản thân) và 1 hào là <b>Ứng</b> (đại diện cho đối tượng liên quan hoặc kết quả sự việc). Vị trí của Thế/Ứng được xác định qua "Bước" (Nhất thế đến Lục thế, Du hồn, Quy hồn) — ở quẻ này là Thế tại Hào ' + r.theHao + ', Ứng tại Hào ' + r.ungHao + '. Xem quan hệ vượng suy và động tĩnh giữa 2 hào này thường là chìa khoá để luận đoán tổng quát.')],
    },
    {
      id: 'luchao.explain.lucthan', title: '3. Lục Thân — 6 vai trò gán cho từng hào',
      blocks: [p('luchao.explain.lucthan.0', 'Mỗi hào được gán 1 trong 6 vai trò (Lục Thân) tuỳ theo quan hệ Ngũ hành giữa hành của hào đó và hành của cung sở thuộc: <b>Phụ Mẫu</b> (cha mẹ, nhà cửa, giấy tờ, người lớn tuổi), <b>Huynh Đệ</b> (anh chị em, bạn bè, người cùng vai vế, sự cạnh tranh/hao tổn), <b>Tử Tôn</b> (con cái, học trò, thầy thuốc/bệnh tật, sự bình an — cũng là hào khắc chế Quan Quỷ nên tốt khi hỏi về tai hoạ/kiện tụng), <b>Thê Tài</b> (vợ, tiền bạc, của cải, việc làm ăn), <b>Quan Quỷ</b> (chồng, công danh chức vị, kiện tụng, cũng là điềm tai hoạ/bệnh tật khi hỏi việc khác). Khi hỏi một việc cụ thể, người xem chọn đúng Lục Thân tương ứng làm "Dụng Thần" — quẻ này đang chọn <b>' + dtLabel(key) + '</b> làm Dụng Thần.')],
    },
    {
      id: 'luchao.explain.dong', title: '4. Hào động — dấu hiệu biến chuyển',
      blocks: [p('luchao.explain.dong.0', 'Một hào "động" (điểm gieo là 6 hoặc 9) mang 2 ý nghĩa: (1) nó sẽ biến thành hào khác ở quẻ biến, và (2) theo dân gian, hào động mang năng lượng mạnh hơn, cho thấy khía cạnh đó của sự việc đang "chuyển động", sắp có thay đổi rõ rệt — trong khi hào tĩnh (7, 8) được xem là ổn định, chưa có biến chuyển. Quẻ này có ' + r.hao.filter((h) => h.dong).length + ' hào động.')],
    },
    {
      id: 'luchao.explain.vuongsuy', title: '5. Vượng suy theo Nguyệt lệnh (mùa xem quẻ)',
      blocks: [p('luchao.explain.vuongsuy.0', 'Mỗi hào mang 1 hành, và hành đó được so với mùa của Chi tháng lúc xem quẻ để xếp vào 1 trong 5 trạng thái: <b>Vượng</b> (mạnh nhất, đúng mùa) → <b>Tướng</b> (khá mạnh) → <b>Hưu</b> (nghỉ ngơi, trung tính) → <b>Tù</b> (suy yếu) → <b>Tử</b> (yếu nhất). Hào ở trạng thái Vượng/Tướng được xem là có lực để phát huy tốt vai trò Lục Thân của nó; hào Tù/Tử thường yếu thế, khó phát huy dù bản chất Lục Thân có tốt.')],
    },
    {
      id: 'luchao.explain.nhat', title: '6. Quan hệ với Nhật thần (ngày xem quẻ)',
      blocks: [p('luchao.explain.nhat.0', 'Chi của ngày xem quẻ gọi là <b>Nhật thần</b> — có sức ảnh hưởng tức thời lên các hào: nếu Chi của một hào <b>Lục Xung</b> với Nhật thần, hào đó bị "xung động" thêm (có thể là biến chuyển đột ngột, kể cả khi hào đang tĩnh); nếu <b>Lục Hợp</b> với Nhật thần, hào đó được trợ giúp, thuận lợi hơn. Đây là lý do cùng một quẻ nhưng xem vào 2 ngày khác nhau có thể cho luận đoán khác nhau đôi chút.')],
    },
  ];
}

export function lucHaoNotes(): Section {
  return {
    id: 'luchao.notes', title: '',
    blocks: [p('luchao.notes.0', '<b>Phạm vi công cụ:</b> lập quẻ chủ (ngẫu nhiên hoặc nhập tay theo đúng quy ước 3 đồng xu), tra Bát Cung và bước biến hào, nạp Can Chi theo bảng Nạp Giáp, an Lục Thân, xác định Thế/Ứng, lập quẻ biến và tính "hoá" của các hào động, xét vượng suy theo Nguyệt lệnh (tính chính xác theo tiết khí, không dùng lịch xấp xỉ) và quan hệ Lục Xung/Lục Hợp với Nhật thần. '
      + 'Công cụ <b>chưa xét</b>: Phục Thần (hào ẩn khi quẻ thiếu Lục Thân cần dùng), Không Vong, quan hệ sinh khắc phức tạp giữa nhiều hào động cùng lúc, và phần nghĩa lý nguyên văn Thoán từ/Hào từ — đúng như phạm vi đã nêu trong tài liệu Phần 3. Đây là công cụ tính toán theo hệ lý số cổ truyền (lối Lục Hào Nạp Giáp), mang tính văn hoá và tham khảo, không phải khoa học thực nghiệm.')],
  };
}

/** Dòng báo kết quả gieo ngẫu nhiên. Phỏng theo legacy (#kd-tossBanner) nhưng câu chỉ dẫn nút bấm đã đổi theo giao diện app:
    đổi "Hỏi về việc gì" là luận lại ngay, không cần nút "Luận Quẻ". */
export function lucHaoTossBanner(tosses: readonly number[]): string {
  return '<b>Kết quả gieo ngẫu nhiên</b> (từ hào Sơ đến hào Thượng): ' + tosses.join(', ') + '. Quẻ được giữ nguyên khi bạn đổi "Hỏi về việc gì" hoặc ngày xem — muốn gieo lại thì bấm <b>🎲 Gieo quẻ mới</b>. Nếu đã gieo bằng đồng xu thật, chuyển sang "Nhập tay" và nhập đúng 6 số đó.';
}
