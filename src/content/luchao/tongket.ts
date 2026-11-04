/* "Tổng kết" của Lục Hào — NGUYÊN VĂN legacy lucHao() + block(). Phép chấm ở src/core/luchao/reading.ts. */
import { lucHaoReading, type CastContext, type DungThanKey, type LucHaoResult } from '../../core';
import { list, note, p, parseRich, type Section } from '../rich';
import { DT_EX, DT_PLAIN, QUE, queShort } from '../interp/luchao';
import { HANH_INFO } from '../interp/hanh';
import { VERDICT_HOW } from '../tuvi/tongket';

export const LUCHAO_NOTE = 'Lục Hào là phép xem theo văn hoá dân gian — dùng để tham khảo, suy ngẫm, không thay cho hành động và quyết định thực tế.';

function uniq(a: readonly string[]): string[] {
  const seen = new Set<string>();
  return a.filter((x) => { if (!x || seen.has(x)) return false; seen.add(x); return true; });
}

export function lucHaoTongKet(r: LucHaoResult, ctx: CastContext, key: DungThanKey): Section[] {
  const g = lucHaoReading(r, ctx, key);
  const tomTat: string[] = [], manh: string[] = [], luuY: string[] = [], khuyen: string[] = [], viDu: string[] = [];
  const sq = queShort(r.name);
  tomTat.push('Quẻ <b>' + r.name + '</b>: ' + (QUE[sq] || '') + '.' + (r.bien ? ' Quẻ có hào động nên việc sẽ chuyển sang hướng của quẻ <b>' + r.bien.name + '</b>: ' + (QUE[queShort(r.bien.name)] || '') + '.' : ''));
  tomTat.push('Bạn đang hỏi về <b>' + DT_PLAIN[key] + '</b>. Lục Hào xét hai lớp: ý nghĩa chung của quẻ (bối cảnh, hướng đi) và sức mạnh của hào đại diện cho việc bạn hỏi (quyết định được hay không ở thời điểm này). Kết luận bên trên dựa chủ yếu vào lớp thứ hai — nên có lúc quẻ mang nghĩa tốt nhưng kết luận vẫn là "chưa thuận": hướng đi đúng, chỉ là thời điểm chưa tới.');

  if (!g.dt) {
    luuY.push('Trong quẻ không xuất hiện hào đại diện cho việc bạn hỏi — thường là dấu hiệu việc chưa rõ ràng hoặc chưa đến lúc.');
  } else {
    const st = g.state!;
    if (g.strong) manh.push('Hào đại diện cho việc bạn hỏi đang <b>mạnh</b> (' + st + ') — sức của việc đang tốt.');
    else if (st === 'Hưu') manh.push('Hào đại diện cho việc bạn hỏi ở mức <b>trung bình</b> (Hưu) — chưa mạnh nhưng chưa yếu.');
    else luuY.push('Hào đại diện cho việc bạn hỏi đang <b>yếu</b> (' + st + ') — thời điểm này việc khó thuận.');
    if (g.nhatRel === 'hop') manh.push('Được ngày xem quẻ "hợp" — có yếu tố hỗ trợ, người giúp.');
    if (g.nhatRel === 'xung') {
      if (g.strong) manh.push('Bị ngày xem quẻ "xung" nhưng hào đang mạnh — việc được thúc đẩy, sắp có chuyển động.');
      else luuY.push('Bị ngày xem quẻ "xung" trong lúc hào yếu — dễ đổ vỡ, gián đoạn.');
    }
    const isThe = key === 'the';
    if (g.otherRel === 4) manh.push(isThe ? 'Đối phương/hoàn cảnh đang hỗ trợ bạn.' : 'Việc này "sinh" cho bạn — có lợi cho bản thân.');
    else if (g.otherRel === 2) manh.push(isThe ? 'Bạn chi phối được đối phương/hoàn cảnh.' : 'Bạn nắm được việc này trong tay.');
    else if (g.otherRel === 3) luuY.push(isThe ? 'Đối phương/hoàn cảnh đang gây áp lực ngược lại bạn.' : 'Việc này gây áp lực, khắc chế lại bạn.');
    else if (g.otherRel === 1) luuY.push(isThe ? 'Bạn phải bỏ công sức, "cho" nhiều để đổi lại.' : 'Bạn phải bỏ ra nhiều (thời gian, tiền bạc) cho việc này.');
    if (g.dt.dong) tomTat.push('Hào đại diện đang <b>động</b> — việc sẽ có thay đổi sớm, không đứng yên.');
    if (!g.strong) khuyen.push('Hành của việc này là ' + g.dtHanh + ' — thường thuận hơn vào ' + HANH_INFO[g.dtHanh!].mua + '. Nếu chưa gấp, có thể chờ đến thời điểm đó.');
  }

  let verdict: string;
  if (g.tone === 'ok') { verdict = '<b>Kết luận: khả quan.</b> Việc bạn hỏi có nhiều dấu hiệu thuận lợi — có thể tiến hành.'; khuyen.unshift('Có thể tiến hành, nhưng vẫn chuẩn bị một phương án dự phòng.'); }
  else if (g.tone === 'mid') { verdict = '<b>Kết luận: trung bình.</b> Việc có thể thành nhưng cần thêm nỗ lực hoặc điều kiện.'; khuyen.unshift('Làm từng bước nhỏ, kiểm tra kết quả rồi mới mở rộng; đừng dồn hết nguồn lực một lần.'); }
  else { verdict = '<b>Kết luận: chưa thuận.</b> Thời điểm này nhiều trở ngại.'; khuyen.unshift('Hoãn quyết định lớn, thu thập thêm thông tin, xem xét lại sau 1–2 tháng.'); }
  khuyen.push('Quẻ chỉ là một góc nhìn để suy ngẫm — quyết định thực tế nên dựa trên số liệu, kế hoạch và ý kiến người có chuyên môn.');
  viDu.push('Nếu câu hỏi của bạn là ' + DT_EX[key] + ', kết quả này có nghĩa: ' + (g.tone === 'ok' ? 'nhiều khả năng thuận lợi' : g.tone === 'mid' ? 'có cơ hội nhưng chưa chắc chắn, cần chuẩn bị thêm' : 'khả năng thấp ở thời điểm này') + '.');

  const sec = (id: string, title: string, items: string[], max: number): Section[] => {
    const xs = uniq(items).slice(0, max);
    return xs.length ? [{ id, title, blocks: [list(id + '.list', xs)] }] : [];
  };
  return [
    {
      id: 'luchao.tongket', title: 'Tóm lại: quẻ trả lời thế nào?', tone: g.tone,
      blocks: [
        { id: 'luchao.tongket.verdict', kind: 'verdict', tone: g.tone, rich: parseRich(verdict), how: VERDICT_HOW },
        ...tomTat.map((t, i) => p('luchao.tongket.tomtat.' + i, t)),
      ],
    },
    ...sec('luchao.tongket.manh', '✅ Điểm mạnh', manh, 5),
    ...sec('luchao.tongket.luuy', '⚠️ Điểm cần lưu ý', luuY, 5),
    ...sec('luchao.tongket.vidu', '💡 Ví dụ dễ hình dung', viDu, 4),
    ...sec('luchao.tongket.khuyen', '🎯 Lời khuyên thực tế', khuyen, 6),
    { id: 'luchao.tongket.note', title: '', blocks: [note('luchao.tongket.note.0', LUCHAO_NOTE)] },
  ];
}
