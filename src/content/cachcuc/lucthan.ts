/* Câu chữ "Lục thân trong lá số" (ARCHITECTURE 15.8). Chỉ giải thích quy ước của sách: trụ nào, sao nào ứng với ai.
   Không có câu đoán nào về sức khoẻ, sinh tử, hôn nhân hay con cái của người thân. */
import { BatTuEngine, type LucThanItem, type ThanNhan } from '../../core';
import { note, p, type Block, type Section } from '../rich';

const { CAN } = BatTuEngine;
const TRU = ['trụ năm', 'trụ tháng', 'trụ ngày', 'trụ giờ'];
const WHO: Record<ThanNhan, string> = { cha: 'Cha', me: 'Mẹ', anhEm: 'Anh chị em, bạn bè', phoiNgau: 'Người bạn đời', con: 'Con cái' };

export const CUNG_VI = [
  'Trụ năm: gốc gia đình, ông bà và những năm thơ ấu.',
  'Trụ tháng: cha mẹ, anh chị em, và tuổi thanh niên.',
  'Trụ ngày: can ngày là chính mình; chi ngày là cung của người bạn đời.',
  'Trụ giờ: con cái, và những năm về già.',
];

function viTriText(it: LucThanItem): string {
  if (!it.viTri.length) return 'không thấy trong bốn trụ. Sách không xem đó là điều xấu: sao vắng thì xét cung vị và các năm vận.';
  const lo = it.viTri.filter((v) => v.lo), an = it.viTri.filter((v) => !v.lo);
  const fmt = (vs: typeof it.viTri) => vs.map((v) => CAN[v.can] + ' ở ' + TRU[v.pillar]).join(', ');
  return [lo.length ? 'lộ trên can: ' + fmt(lo) : '', an.length ? 'tàng trong chi: ' + fmt(an) : ''].filter(Boolean).join('; ') + '.';
}

export function lucThanSection(items: readonly LucThanItem[], gender: 'M' | 'F'): Section {
  const blocks: Block[] = [
    p('lucthan.cungvi', '<b>Cung vị:</b> mỗi trụ ứng với một lớp người thân.<ul>' + CUNG_VI.map((c) => '<li>' + c + '</li>').join('') + '</ul>'),
    p('lucthan.sao', '<b>Sao đại diện</b> (theo quy ước của sách cho lá số ' + (gender === 'M' ? 'nam' : 'nữ') + '):'),
    ...items.map((it, i) => p('lucthan.' + i, '<b>' + WHO[it.who] + '</b> là ' + it.sao.join(' hoặc ') + ': ' + viTriText(it))),
    note('lucthan.note', 'Đây là quy ước truyền thống để biết sao nào ứng với ai, chia theo giới tính như sách cổ. App không đoán sức khoẻ, hôn nhân hay chuyện con cái của ai; mối quan hệ trong đời thật do cách mỗi người sống với nhau.'),
  ];
  return { id: 'lucthan', title: '', blocks };
}
