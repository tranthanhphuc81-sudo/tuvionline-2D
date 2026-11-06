/* Thẻ ảnh chia sẻ: dữ liệu và tính bố cục, không đụng canvas nên test được. Mỗi thẻ LUÔN có dòng lưu ý văn hoá. */
import { CULTURAL_NOTE } from '../../content/common/notes';
import { parseRich, toPlainText, type Section } from '../../content/rich';
import { birthLine } from '../profiles/format';
import type { Profile } from '../../state/schema';

export type ShareCells = readonly (readonly [string, string])[];

export interface ShareCard {
  /** dùng làm tên file, chỉ chữ thường không dấu */
  slug: string;
  title: string;
  person?: string;
  personLine?: string;
  groups: readonly { title?: string; cells: ShareCells }[];
  /** nhận định chính, chữ thường (đã bỏ thẻ) */
  verdict?: string;
  /** phần giải nghĩa cho người đọc ảnh, lấy từ Tổng kết */
  reading?: readonly CardSection[];
}

export interface CardLine { kind: 'p' | 'bullet' | 'small'; text: string }
export interface CardSection { title: string; lines: readonly CardLine[] }

/* Tổng kết đầy đủ có thể tới 6.000 ký tự, ảnh sẽ quá dài và bị nén khi gửi. Thẻ giữ phần tóm lại và 3 mục dùng được ngay;
   chi tiết còn lại (từng mảng cuộc sống, giai đoạn hiện tại, ví dụ) xem trong app. */
const KEPT = /\.(manh|luuy|khuyen)$/;
const plainLines = (nodes: Parameters<typeof toPlainText>[0], kind: CardLine['kind']): CardLine[] =>
  toPlainText(nodes).split('\n').map((t) => t.trim()).filter(Boolean).map((text) => ({ kind, text }));

/** Rút Tổng kết (Section đầu là phần tóm lại) thành các mục in trên thẻ, câu chữ giữ nguyên văn. */
export function cardReading(sections: readonly Section[]): CardSection[] {
  return sections.filter((s, i) => i === 0 || KEPT.test(s.id)).map((s) => ({
    title: s.title.replace(/^[^\p{L}]+/u, '') || 'Tóm lại',
    lines: s.blocks.flatMap((b): CardLine[] => {
      if (b.kind === 'list') return b.items.flatMap((x) => plainLines(x, 'bullet'));
      if (b.kind === 'p') return plainLines(b.rich, 'p');
      if (b.kind === 'verdict') return [...plainLines(b.rich, 'p'), ...(b.how ? [{ kind: 'small' as const, text: b.how }] : [])];
      return [];
    }),
  })).filter((s) => s.lines.length > 0);
}

/** Tên và ngày sinh của hồ sơ trên thẻ. */
export function cardWho(p: Profile | null | undefined): Pick<ShareCard, 'person' | 'personLine'> {
  return p ? { person: p.name, personLine: (p.gender === 'M' ? 'Nam' : 'Nữ') + ' · ' + birthLine(p) } : {};
}

/** Bỏ thẻ định dạng của câu chữ nội dung. */
export const plain = (html: string): string => toPlainText(parseRich(html));

export const CARD_W = 1080;
const PAD = 72;
const LABEL_W = 340;
const GAP = 28;
const BULLET = 34;

/* Thẻ giữ một bảng màu tối cố định theo tokens.css, để ảnh gửi đi giống nhau dù máy đang ở chế độ nào. */
export const CARD_COLOR = { bg: '#0b0f1a', panel: '#121a2c', ink: '#ece6d6', dim: '#c9c3ae', muted: '#8b93af', gold: '#d7b571' } as const;
const SANS = '"Be Vietnam Pro", system-ui, sans-serif';
const SERIF = '"Noto Serif", Georgia, serif';
export const CARD_FONT = {
  brand: `600 28px ${SANS}`, title: `700 62px ${SERIF}`, person: `600 38px ${SANS}`, line: `400 29px ${SANS}`,
  group: `600 30px ${SANS}`, label: `500 30px ${SANS}`, value: `600 32px ${SANS}`, verdict: `400 32px ${SANS}`, note: `400 26px ${SANS}`,
  heading: `700 36px ${SERIF}`, body: `400 31px ${SANS}`, small: `400 26px ${SANS}`,
} as const;

export type DrawOp =
  | { kind: 'text'; text: string; x: number; y: number; font: string; color: string }
  | { kind: 'rect'; x: number; y: number; w: number; h: number; color: string; radius?: number };

export type Measure = (text: string, font: string) => number;

/** Ngắt dòng theo khoảng trắng; từ dài hơn cả dòng thì cắt theo ký tự để không tràn ảnh. */
export function wrapText(text: string, font: string, maxW: number, measure: Measure): string[] {
  const out: string[] = [];
  let line = '';
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const next = line ? line + ' ' + word : word;
    if (measure(next, font) <= maxW) { line = next; continue; }
    if (line) out.push(line);
    line = '';
    let rest = word;
    while (measure(rest, font) > maxW) {
      let n = 1;
      while (n < rest.length && measure(rest.slice(0, n + 1), font) <= maxW) n++;
      out.push(rest.slice(0, n));
      rest = rest.slice(n);
    }
    line = rest;
  }
  if (line) out.push(line);
  return out;
}

export function layoutCard(card: ShareCard, measure: Measure): { height: number; ops: DrawOp[] } {
  const ops: DrawOp[] = [];
  const inner = CARD_W - PAD * 2;
  let y = PAD;
  const text = (s: string, x: number, font: string, color: string, lh: number) => { ops.push({ kind: 'text', text: s, x, y, font, color }); y += lh; };
  const para = (s: string, x: number, w: number, font: string, color: string, lh: number) => { for (const l of wrapText(s, font, w, measure)) text(l, x, font, color, lh); };

  text('LÝ SỐ TRỌN BỘ', PAD, CARD_FONT.brand, CARD_COLOR.gold, 56);
  para(card.title, PAD, inner, CARD_FONT.title, CARD_COLOR.ink, 80);
  if (card.person) { y += 8; para(card.person, PAD, inner, CARD_FONT.person, CARD_COLOR.ink, 52); }
  if (card.personLine) para(card.personLine, PAD, inner, CARD_FONT.line, CARD_COLOR.muted, 42);
  y += 24;
  ops.push({ kind: 'rect', x: PAD, y, w: inner, h: 3, color: CARD_COLOR.gold });
  y += 36;

  for (const g of card.groups) {
    if (g.title) { para(g.title, PAD, inner, CARD_FONT.group, CARD_COLOR.gold, 48); y += 4; }
    for (const [k, v] of g.cells) {
      const top = y;
      para(k, PAD, LABEL_W - GAP, CARD_FONT.label, CARD_COLOR.muted, 44);
      const leftEnd = y;
      y = top;
      para(v, PAD + LABEL_W, inner - LABEL_W, CARD_FONT.value, CARD_COLOR.ink, 44);
      y = Math.max(y, leftEnd) + 14;
    }
    y += 16;
  }

  if (card.verdict) {
    const lines = wrapText(card.verdict, CARD_FONT.verdict, inner - 56, measure);
    const h = lines.length * 46 + 44;
    ops.push({ kind: 'rect', x: PAD, y, w: inner, h, color: CARD_COLOR.panel, radius: 18 });
    const top = y;
    y += 22;
    for (const l of lines) text(l, PAD + 28, CARD_FONT.verdict, CARD_COLOR.dim, 46);
    y = top + h + 36;
  }

  for (const sec of card.reading ?? []) {
    para(sec.title, PAD, inner, CARD_FONT.heading, CARD_COLOR.gold, 54);
    y += 4;
    for (const l of sec.lines) {
      if (l.kind === 'small') {
        para(l.text, PAD, inner, CARD_FONT.small, CARD_COLOR.muted, 38);
      } else if (l.kind === 'bullet') {
        text('•', PAD, CARD_FONT.body, CARD_COLOR.gold, 0);
        para(l.text, PAD + BULLET, inner - BULLET, CARD_FONT.body, CARD_COLOR.dim, 44);
      } else {
        para(l.text, PAD, inner, CARD_FONT.body, CARD_COLOR.dim, 44);
      }
      y += 10;
    }
    y += 22;
  }

  para(CULTURAL_NOTE, PAD, inner, CARD_FONT.note, CARD_COLOR.muted, 38);
  return { height: Math.ceil(y + PAD - 12), ops };
}
