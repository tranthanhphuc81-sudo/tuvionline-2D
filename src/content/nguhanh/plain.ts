/* Mục "Nói dễ hiểu" của Phân tích ngũ hành: giải thích kết luận bằng lời thường, dựng từ chính số liệu của lá số
   (chữ nào ở trụ nào làm lá số lệch, hành cần thêm nghĩa là gì trong đời sống, hai năm ví dụ có lý do).
   NỘI DUNG MỚI (README.md). Không nêu màu, hướng, vật phẩm (ARCHITECTURE 14.3); không dùng từ cấm (vocab.ts).
   Mỗi nhánh trả về một "khoá" để test chứng minh mọi trường hợp đều có câu (tests/nguhanh-content.test.ts). */
import { BatTuEngine } from '../../core';
import {
  evaluatePeriod, hiddenStems, pillarOfYear, seasonClimate, stemElement, tenGodOf,
  type Element, type NguHanhAnalysis, type Pillar, type Reading, type TenGodGroup,
} from '../../core/nguhanh';
import { p, type Block } from '../rich';
import { TEN_GOD_PRACTICAL } from './practical';
import { msgText } from './render';
import { TEN_GOD_VI } from './vocab';

const { CAN, CHI } = BatTuEngine;
const NO_SPEECH = ['no-speech'];
const ELS: Element[] = ['Mộc', 'Hoả', 'Thổ', 'Kim', 'Thuỷ'];
const pc = (x: number) => Math.round(x * 100) + '%';
const POS_VI = { year: 'năm', month: 'tháng', day: 'ngày', hour: 'giờ' } as const;
/** Mùa theo chi tháng (Dần Mão Thìn xuân …); tháng Thìn Mùi Tuất Sửu là tháng giao mùa, Thổ vượng. */
const SEASON_VI = ['đông', 'cuối đông', 'xuân', 'xuân', 'cuối xuân', 'hạ', 'hạ', 'cuối hạ', 'thu', 'thu', 'cuối thu', 'đông'];
const lowerFirst = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);
const branchElement = (b: number) => stemElement(hiddenStems(b as never)[0]);
const canChi = (pl: Pillar) => `${CAN[pl.stem]} ${CHI[pl.branch]}`;

/** Các khoá nhánh có thể xảy ra (trừ 'method.thong-quan': engine chưa chọn Thông quan làm Dụng thần chính). */
export const PLAIN_KEYS: readonly string[] = [
  'self.follow-weak', 'self.follow-strong', 'self.weak', 'self.balanced', 'self.strong',
  'method.phu-uc-nhuoc', 'method.phu-uc-vuong', 'method.dieu-hau', 'method.trung-hoa', 'method.tong-cach',
  'source.season', 'source.stem', 'source.branch', 'source.hidden', 'weakest.absent',
  ...(['TyKiep', 'An', 'ThucThuong', 'Tai', 'QuanSat'] as TenGodGroup[]).flatMap((g) => [`dung.${g}`, `ky.${g}`]),
  'year.good', 'year.bad', 'year.no-good', 'year.no-bad',
];

/** Nhánh có thật nhưng rất hiếm trên lá số thật (không gặp trong 3000 lá ngẫu nhiên); test dựng tình huống riêng để kiểm. */
export const PLAIN_RARE_KEYS: readonly string[] = ['source.hidden', 'year.no-good', 'year.no-bad'];

export interface PlainResult { blocks: Block[]; keys: string[] }

/** Dựng mục "Nói dễ hiểu" cho một cách luận của lá số. */
type YearRow = { y: number; pl: Pillar; ev: ReturnType<typeof evaluatePeriod> };
/** Chọn năm thuận nhất và năm nên giữ nhịp nhất; tách riêng để test truyền tình huống hiếm (không có năm nào). */
export type YearPick = (rows: YearRow[]) => { good?: YearRow; bad?: YearRow };
const defaultPick: YearPick = (rows) => ({
  good: rows.filter((x) => x.ev.favor === 'rat-tot' || x.ev.favor === 'tot').sort((m, n) => n.ev.score - m.ev.score)[0],
  bad: rows.filter((x) => x.ev.favor === 'xau' || x.ev.favor === 'rat-xau').sort((m, n) => m.ev.score - n.ev.score)[0],
});

export function plainBlocks(a: NguHanhAnalysis, reading: Reading, nowYear: number, pick: YearPick = defaultPick): PlainResult {
  const keys: string[] = [];
  const ug = reading.usefulGod;
  const follow = ug.method === 'tong-cach';
  const dm = a.dayMaster.dayMaster;
  const ch = a.chart;
  const shares = a.score.shares;
  const ratio = a.dayMaster.supportRatio;
  const role = (e: Element) => tenGodOf(dm, e);
  const blocks: Block[] = [];

  // 1. Bạn là ai trong lá số, phe giúp chiếm bao nhiêu
  const me = `<b>Bạn là ${CAN[ch.day.stem]} (${dm})</b>: can của ngày sinh, đại diện cho chính bạn. Phe giúp bạn (${dm} và hành sinh ra ${dm}) chiếm khoảng <b>${pc(ratio)}</b> lực của lá số, phần còn lại thuộc về các hành làm bạn tiêu hao hay bị chế ngự.`;
  let picture: string;
  if (follow && ratio < 0.5) {
    keys.push('self.follow-weak');
    picture = 'Phe của bạn gần như không còn chỗ dựa. Gặp trường hợp này, sách xưa không cố "cứu" mà cho thuận theo phe đang mạnh, giống cây non giữa dòng nước lớn thì uốn theo dòng chứ không chống lại.';
  } else if (follow) {
    keys.push('self.follow-strong');
    picture = 'Phe của bạn mạnh áp đảo. Gặp trường hợp này, sách xưa không ép bớt mà cho thuận theo thế mạnh, giống dòng sông lớn thì nên khơi cho chảy chứ không đắp đập chặn ngang.';
  } else if (a.dayMaster.strength === 'nhuoc' || a.dayMaster.strength === 'tong-nhuoc') {
    keys.push('self.weak');
    picture = 'Như vậy là <b>yếu</b>: giống một người phải gánh việc nặng hơn sức mình, nên điều lá số cần trước hết là được tiếp sức hoặc bớt gánh.';
  } else if (a.dayMaster.strength === 'trung-hoa') {
    keys.push('self.balanced');
    picture = 'Như vậy là <b>gần cân bằng</b>: hai phe xấp xỉ nhau, nên chỉ cần chỉnh nhẹ chỗ đang thiếu, không cần thay đổi lớn.';
  } else {
    keys.push('self.strong');
    picture = 'Như vậy là <b>mạnh</b>: giống một người dư sức mà thiếu chỗ dùng, nên điều lá số cần là có việc để dồn sức vào, có khuôn khổ để định hướng.';
  }
  blocks.push({ ...p('nguhanh.plain.self', `${me} ${picture}`, { pillar: 2 }), tags: NO_SPEECH });

  // 2. Vì sao lệch: hành mạnh nhất đến từ đâu, hành nào vắng
  const sorted = [...ELS].sort((x, y) => shares[y] - shares[x]);
  const top = sorted[0], weakest = sorted[4];
  const parts: string[] = [];
  if (a.score.seasonElement === top) {
    keys.push('source.season');
    parts.push(`bạn sinh tháng ${CHI[ch.month.branch]} (mùa ${SEASON_VI[ch.month.branch]}), đúng lúc ${top} vượng nhất`);
  }
  const stems = (['year', 'month', 'hour'] as const).filter((k) => stemElement(ch[k].stem) === top).map((k) => `can ${POS_VI[k]} ${CAN[ch[k].stem]}`);
  if (stems.length) { keys.push('source.stem'); parts.push(`${top} lộ ra ở ${stems.join(', ')}`); }
  const branches = (['year', 'month', 'day', 'hour'] as const)
    .filter((k) => branchElement(ch[k].branch) === top && !(k === 'month' && a.score.seasonElement === top))
    .map((k) => `chi ${POS_VI[k]} ${CHI[ch[k].branch]}`);
  if (branches.length) { keys.push('source.branch'); parts.push(`${top} nằm sẵn trong ${branches.join(', ')}`); }
  if (!parts.length) { keys.push('source.hidden'); parts.push(`${top} chủ yếu đến từ các can ẩn trong địa chi và các chi hợp lại với nhau`); }
  let src = `Hành mạnh nhất trong lá số là <b>${top}</b> (${pc(shares[top])}): ${parts.join('; ')}.`;
  if (shares[weakest] < 0.08) {
    keys.push('weakest.absent');
    src += ` Ngược lại, ${weakest} gần như vắng mặt (${pc(shares[weakest])}).`;
  }
  blocks.push({ ...p('nguhanh.plain.source', src), tags: NO_SPEECH });

  // 3. Vì sao chọn hành này, và nó nghĩa là gì trong đời sống, kèm ví dụ
  const dungRole = role(ug.dung), hyRole = role(ug.hy), kyRole = role(ug.ky);
  keys.push(`dung.${dungRole}`);
  let why: string;
  if (follow) {
    keys.push('method.tong-cach');
    why = `Lá số theo thế ${a.follow ? msgText({ code: 'reading.follow', p: { type: a.follow.type } }).replace(/^Luận /, '') : 'chung'}, nên hành có ích là hành đi cùng thế mạnh: <b>${ug.dung}</b>.`;
  } else if (ug.method === 'dieu-hau') {
    keys.push('method.dieu-hau');
    const cold = seasonClimate(ch.month.branch) === 'lanh';
    why = `Bạn sinh mùa ${cold ? 'lạnh' : 'nóng'} mà ${ug.dung} trong lá số rất ít, nên việc đầu tiên là cân lại nóng lạnh: cần <b>${ug.dung}</b> để ${cold ? 'sưởi ấm' : 'làm dịu'}, trước cả chuyện mạnh yếu.`;
  } else if (ug.method === 'trung-hoa') {
    keys.push('method.trung-hoa');
    why = `Hai phe gần cân bằng nên không cần chỉnh mạnh; chỉ bù hành đang thiếu nhất là <b>${ug.dung}</b>.`;
  } else if (ug.method === 'thong-quan') {
    keys.push('method.thong-quan');
    why = `Trong lá số có hai hành đang khắc nhau mạnh, nên hành có ích là hành đứng giữa làm cầu nối: <b>${ug.dung}</b>.`;
  } else if (ratio < 0.5) {
    keys.push('method.phu-uc-nhuoc');
    why = `Vì phe bạn đang yếu, hành có ích là hành tiếp sức cho bạn hoặc giúp bạn gánh bớt: <b>${ug.dung}</b>.`;
  } else {
    keys.push('method.phu-uc-vuong');
    why = `Vì phe bạn đang dư sức, hành có ích là hành giúp xả bớt hoặc định hướng sức đó: <b>${ug.dung}</b>.`;
  }
  const dg = TEN_GOD_PRACTICAL[dungRole];
  const verb = follow ? `"Thuận theo ${ug.dung}"` : `"Bổ sung ${ug.dung}"`;
  blocks.push(p('nguhanh.plain.dung',
    `${why} Với bạn, ${ug.dung} là <b>${TEN_GOD_VI[dungRole]}</b>, trong đời sống ứng với ${dg.meaning}. ${verb} không phải chuyện đồ vật, mà là đưa thêm những điều đó vào nếp sống, vừa sức mình. Ví dụ: ${dg.example}.`));
  blocks.push(p('nguhanh.plain.hy', `Hỗ trợ cho ${ug.dung} là <b>${ug.hy}</b> (${TEN_GOD_VI[hyRole]} của bạn): ${TEN_GOD_PRACTICAL[hyRole].meaning}. Có thêm phần này thì phần trên bền hơn.`));

  // 4. Hành nên tiết chế (hay nên tránh, với cách luận thuận thế), kèm ví dụ
  keys.push(`ky.${kyRole}`);
  blocks.push(p('nguhanh.plain.ky',
    `${follow ? 'Hành nên tránh, vì đi ngược thế của lá số,' : 'Hành nên tiết chế'} là <b>${ug.ky}</b> (${TEN_GOD_VI[kyRole]} của bạn), ứng với ${TEN_GOD_PRACTICAL[kyRole].meaning}. Khi phần này lấn lên, dễ gặp những chuyện như: ${TEN_GOD_PRACTICAL[kyRole].harmExample}.`));

  // 5. Hai năm ví dụ trong 12 năm tới, có lý do
  const rel = (e: Element) => e === ug.dung ? (follow ? 'đúng hành nên thuận theo' : 'đúng hành bạn cần')
    : e === ug.hy ? 'hành hỗ trợ'
    : e === ug.ky ? (follow ? 'hành nên tránh' : 'hành nên tiết chế')
    : e === ug.cuu ? (follow ? 'hành tiếp sức cho hành nên tránh' : 'hành tiếp sức cho hành nên tiết chế')
    : 'hành trung tính với lá số này';
  const describe = (pl: Pillar) => {
    const se = stemElement(pl.stem), be = branchElement(pl.branch);
    return se === be ? `cả can ${CAN[pl.stem]} lẫn chi ${CHI[pl.branch]} đều thuộc ${se}, ${rel(se)}` : `can ${CAN[pl.stem]} thuộc ${se} (${rel(se)}), chi ${CHI[pl.branch]} thuộc ${be} (${rel(be)})`;
  };
  const yrs: YearRow[] = Array.from({ length: 12 }, (_, i) => { const y = nowYear + i, pl = pillarOfYear(y); return { y, pl, ev: evaluatePeriod(pl, ug) }; });
  const { good, bad } = pick(yrs);
  const yl: string[] = [];
  if (good) { keys.push('year.good'); yl.push(`Năm thuận nhất trong 12 năm tới là <b>${good.y} ${canChi(good.pl)}</b>: ${describe(good.pl)}. Đây là năm hợp để ${lowerFirst(dg.actions[0])}.`); }
  else { keys.push('year.no-good'); yl.push(`Trong 12 năm tới không có năm nào nghiêng rõ về thuận; phần lớn ở mức bình thường, nên làm đều đặn quan trọng hơn chờ thời điểm.`); }
  if (bad) { keys.push('year.bad'); yl.push(`Năm nên giữ nhịp nhất là <b>${bad.y} ${canChi(bad.pl)}</b>: ${describe(bad.pl)}. Năm đó nên giữ nhịp an toàn, chưa vội mở rộng hay nhận thêm cam kết lớn.`); }
  else { keys.push('year.no-bad'); yl.push('Trong 12 năm tới cũng không có năm nào nghiêng rõ về khó.'); }
  blocks.push(p('nguhanh.plain.years', `${yl.join(' ')} Đây là gợi ý sắp xếp nhịp làm việc, không phải lời báo trước.`));

  return { blocks, keys };
}
