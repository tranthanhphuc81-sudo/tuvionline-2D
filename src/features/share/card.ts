/* Thẻ ảnh chia sẻ: dữ liệu và tính bố cục, không đụng canvas nên test được. Mỗi ảnh LUÔN có dòng lưu ý văn hoá. */
import { CULTURAL_NOTE } from '../../content/common/notes';
import { parseRich, sectionPlainText, toPlainText, type Block, type Section } from '../../content/rich';
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

export interface CardLine { kind: 'p' | 'sub' | 'bullet' | 'small'; text: string }
export interface CardSection { title: string; lines: readonly CardLine[] }

const plainLines = (nodes: Parameters<typeof toPlainText>[0], kind: CardLine['kind']): CardLine[] =>
  toPlainText(nodes).split('\n').map((t) => t.trim()).filter(Boolean).map((text) => ({ kind, text }));

function blockLines(b: Block): CardLine[] {
  switch (b.kind) {
    case 'p': return plainLines(b.rich, 'p');
    case 'list': return b.items.flatMap((x) => plainLines(x, 'bullet'));
    case 'verdict': return [...plainLines(b.rich, 'p'), ...(b.how ? [{ kind: 'small' as const, text: b.how }] : [])];
    case 'note': return plainLines(b.rich, 'small');
    case 'item': return [{ kind: 'sub', text: toPlainText(b.title).trim() + (b.label ? ' — ' + b.label : '') }, ...plainLines(b.rich, 'p')];
    case 'chips': return [...b.chips.map((x) => ({ kind: 'bullet' as const, text: x.text })), ...(b.after ? plainLines(b.after, 'p') : [])];
    case 'bars': return b.rows.map((r) => ({ kind: 'bullet', text: r.label + ': ' + r.pct + '%' }));
    default: return sectionPlainText({ id: b.id, title: '', blocks: [b] }, false).split('\n').map((t) => t.trim()).filter(Boolean).map((text) => ({ kind: 'p', text }));
  }
}

/** Đổi Tổng kết thành các mục in trên ảnh, câu chữ giữ nguyên văn. Section ghi chú không tiêu đề được thay bằng dòng lưu ý cuối mỗi ảnh. */
export function cardReading(sections: readonly Section[]): CardSection[] {
  return sections.filter((s, i) => i === 0 || s.title).map((s) => ({
    title: s.title.replace(/^[^\p{L}]+/u, '') || 'Tóm lại',
    lines: s.blocks.flatMap(blockLines),
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
/** Chiều cao tối đa một ảnh: tỉ lệ 20:9 của điện thoại, gửi qua Zalo, Messenger không bị nén thành dải dài. */
export const PAGE_H = 2400;
const PAGE_NO_H = 48;

/* Thẻ giữ một bảng màu tối cố định theo tokens.css, để ảnh gửi đi giống nhau dù máy đang ở chế độ nào. */
export const CARD_COLOR = { bg: '#0b0f1a', panel: '#121a2c', ink: '#ece6d6', dim: '#c9c3ae', muted: '#8b93af', gold: '#d7b571' } as const;
const SANS = '"Be Vietnam Pro", system-ui, sans-serif';
const SERIF = '"Noto Serif", Georgia, serif';
export const CARD_FONT = {
  brand: `600 28px ${SANS}`, title: `700 62px ${SERIF}`, person: `600 38px ${SANS}`, line: `400 29px ${SANS}`,
  group: `600 30px ${SANS}`, label: `500 30px ${SANS}`, value: `600 32px ${SANS}`, verdict: `400 32px ${SANS}`, note: `400 26px ${SANS}`,
  heading: `700 36px ${SERIF}`, sub: `600 31px ${SANS}`, body: `400 31px ${SANS}`, small: `400 26px ${SANS}`,
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

export interface CardPage { height: number; ops: DrawOp[] }

/** Một khối không tách rời; `keepNext`: phải nằm cùng ảnh với khối sau (tiêu đề với nội dung của nó). */
interface Atom { h: number; ops: DrawOp[]; keepNext?: boolean }

/** Chia thẻ thành nhiều ảnh, mỗi ảnh vừa một màn hình điện thoại và ngắt ở ranh giới đoạn. Ảnh nào cũng có dòng lưu ý văn hoá. */
export function layoutPages(card: ShareCard, measure: Measure): CardPage[] {
  const inner = CARD_W - PAD * 2;
  let ops: DrawOp[] = [];
  let y = 0;
  const text = (s: string, x: number, font: string, color: string, lh: number) => { ops.push({ kind: 'text', text: s, x, y, font, color }); y += lh; };
  const para = (s: string, x: number, w: number, font: string, color: string, lh: number) => { for (const l of wrapText(s, font, w, measure)) text(l, x, font, color, lh); };
  const rule = () => { y += 24; ops.push({ kind: 'rect', x: PAD, y, w: inner, h: 3, color: CARD_COLOR.gold }); y += 36; };
  const atom = (build: () => void, keepNext = false): Atom => { ops = []; y = 0; build(); return { h: y, ops, keepNext }; };

  const firstHeader = atom(() => {
    text('LÝ SỐ TRỌN BỘ', PAD, CARD_FONT.brand, CARD_COLOR.gold, 56);
    para(card.title, PAD, inner, CARD_FONT.title, CARD_COLOR.ink, 80);
    if (card.person) { y += 8; para(card.person, PAD, inner, CARD_FONT.person, CARD_COLOR.ink, 52); }
    if (card.personLine) para(card.personLine, PAD, inner, CARD_FONT.line, CARD_COLOR.muted, 42);
    rule();
  });
  const nextHeader = atom(() => {
    text('LÝ SỐ TRỌN BỘ', PAD, CARD_FONT.brand, CARD_COLOR.gold, 44);
    para(card.person ? card.title + ' · ' + card.person : card.title, PAD, inner, CARD_FONT.line, CARD_COLOR.muted, 42);
    rule();
  });
  const note = atom(() => { para(CULTURAL_NOTE, PAD, inner, CARD_FONT.note, CARD_COLOR.muted, 38); });

  const atoms: Atom[] = [];
  for (const g of card.groups) {
    if (g.title) { const t = g.title; atoms.push(atom(() => { para(t, PAD, inner, CARD_FONT.group, CARD_COLOR.gold, 48); y += 4; }, true)); }
    g.cells.forEach(([k, v], i) => atoms.push(atom(() => {
      para(k, PAD, LABEL_W - GAP, CARD_FONT.label, CARD_COLOR.muted, 44);
      const leftEnd = y;
      y = 0;
      para(v, PAD + LABEL_W, inner - LABEL_W, CARD_FONT.value, CARD_COLOR.ink, 44);
      y = Math.max(y, leftEnd) + 14 + (i === g.cells.length - 1 ? 16 : 0);
    })));
  }
  if (card.verdict) {
    const v = card.verdict;
    atoms.push(atom(() => {
      const lines = wrapText(v, CARD_FONT.verdict, inner - 56, measure);
      const h = lines.length * 46 + 44;
      ops.push({ kind: 'rect', x: PAD, y: 0, w: inner, h, color: CARD_COLOR.panel, radius: 18 });
      y = 22;
      for (const l of lines) text(l, PAD + 28, CARD_FONT.verdict, CARD_COLOR.dim, 46);
      y = h + 36;
    }));
  }
  for (const sec of card.reading ?? []) {
    atoms.push(atom(() => { para(sec.title, PAD, inner, CARD_FONT.heading, CARD_COLOR.gold, 54); y += 4; }, true));
    sec.lines.forEach((l, i) => {
      const end = (i === sec.lines.length - 1 ? 32 : 10);
      atoms.push(atom(() => {
        if (l.kind === 'small') para(l.text, PAD, inner, CARD_FONT.small, CARD_COLOR.muted, 38);
        else if (l.kind === 'sub') para(l.text, PAD, inner, CARD_FONT.sub, CARD_COLOR.ink, 44);
        else if (l.kind === 'bullet') {
          text('•', PAD, CARD_FONT.body, CARD_COLOR.gold, 0);
          para(l.text, PAD + BULLET, inner - BULLET, CARD_FONT.body, CARD_COLOR.dim, 44);
        } else para(l.text, PAD, inner, CARD_FONT.body, CARD_COLOR.dim, 44);
        y += end;
      }, l.kind === 'sub'));
    });
  }

  const room = PAGE_H - PAD * 2 - note.h - PAGE_NO_H;
  const pages: Atom[][] = [[]];
  let used = firstHeader.h;
  for (let i = 0; i < atoms.length; i++) {
    let j = i;
    while (atoms[j].keepNext && j + 1 < atoms.length) j++;
    const unit = atoms.slice(i, j + 1);
    const h = unit.reduce((sum, a) => sum + a.h, 0);
    if (used + h > room && pages[pages.length - 1].length > 0) { pages.push([]); used = nextHeader.h; }
    pages[pages.length - 1].push(...unit);
    used += h;
    i = j;
  }

  return pages.map((page, n) => {
    const out: DrawOp[] = [];
    let at = PAD;
    const place = (a: Atom) => { for (const op of a.ops) out.push({ ...op, y: op.y + at }); at += a.h; };
    place(n === 0 ? firstHeader : nextHeader);
    page.forEach(place);
    place(note);
    if (pages.length > 1) { out.push({ kind: 'text', text: `Ảnh ${n + 1}/${pages.length}`, x: PAD, y: at + 8, font: CARD_FONT.brand, color: CARD_COLOR.gold }); at += PAGE_NO_H; }
    return { height: Math.ceil(at + PAD - 12), ops: out };
  });
}
