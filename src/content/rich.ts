/* Chữ có định dạng tối thiểu (ARCHITECTURE.md mục 5.4): câu chữ legacy giữ nguyên các thẻ <b> <i> <small> <br> <ul> <li>.
   parseRich() đổi chuỗi thành cây RichNode để React vẽ KHÔNG cần dangerouslySetInnerHTML; thẻ khác in ra như chữ thường.
   toPlainText() lấy chữ thuần để đọc thành lời, phụ đề, chia sẻ. */
export type RichTag = 'b' | 'i' | 'small' | 'ul' | 'li' | 'br';
export type RichNode = string | { tag: RichTag; children: RichNode[] };

const ALLOWED: ReadonlySet<string> = new Set(['b', 'i', 'small', 'ul', 'li', 'br']);
const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'", nbsp: ' ' };
const decode = (s: string) => s.replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (_, e: string) => ENTITIES[e]);

export function parseRich(src: string): RichNode[] {
  const root: { tag: RichTag | null; children: RichNode[] } = { tag: null, children: [] };
  const stack: { tag: RichTag | null; children: RichNode[] }[] = [root];
  const re = /<(\/?)([a-z0-9]+)\s*\/?>/gi;
  let last = 0;
  const pushText = (t: string) => {
    if (!t) return;
    const kids = stack[stack.length - 1].children;
    const prev = kids[kids.length - 1];
    if (typeof prev === 'string') kids[kids.length - 1] = prev + t;
    else kids.push(t);
  };
  for (let m = re.exec(src); m; m = re.exec(src)) {
    pushText(decode(src.slice(last, m.index)));
    last = re.lastIndex;
    const closing = m[1] === '/', name = m[2].toLowerCase();
    if (!ALLOWED.has(name)) { pushText(m[0]); continue; }
    const tag = name as RichTag;
    if (tag === 'br') { if (!closing) stack[stack.length - 1].children.push({ tag: 'br', children: [] }); continue; }
    if (!closing) {
      const node = { tag, children: [] as RichNode[] };
      stack[stack.length - 1].children.push(node);
      stack.push(node);
    } else {
      const i = stack.map((x) => x.tag).lastIndexOf(tag);
      if (i > 0) stack.length = i; else pushText(m[0]);
    }
  }
  pushText(decode(src.slice(last)));
  return root.children;
}

/** Chữ thuần: <br> và mỗi <li> xuống dòng. */
export function toPlainText(nodes: readonly RichNode[]): string {
  let out = '';
  const walk = (ns: readonly RichNode[]) => {
    for (const n of ns) {
      if (typeof n === 'string') out += n;
      else if (n.tag === 'br') out += '\n';
      else if (n.tag === 'li') { if (out && !out.endsWith('\n')) out += '\n'; walk(n.children); out += '\n'; }
      else walk(n.children);
    }
  };
  walk(nodes);
  return out;
}

/* ===== Đơn vị nội dung ===== */
export type ContentTag = string;
export type Tone = 'ok' | 'mid' | 'warn';
export interface BlockRef { palace?: number; hao?: number; pillar?: number }

interface BlockBase { id: string; tags?: ContentTag[]; ref?: BlockRef }
/** Đoạn văn */
export interface PBlock extends BlockBase { kind: 'p'; rich: RichNode[] }
/** Danh sách gạch đầu dòng */
export interface ListBlock extends BlockBase { kind: 'list'; items: RichNode[][] }
/** Nhãn đánh giá tô màu (kèm câu "cách chấm" nếu có) */
export interface VerdictBlock extends BlockBase { kind: 'verdict'; tone: Tone; rich: RichNode[]; how?: string }
/** Một mục có tiêu đề + nhãn màu + thân (ví dụ "Từng mảng cuộc sống") */
export interface ItemBlock extends BlockBase { kind: 'item'; title: RichNode[]; label?: string; tone?: Tone; rich: RichNode[] }
/** Dãy "chip" màu (ví dụ nhãn 3 năm tới) */
export interface ChipsBlock extends BlockBase { kind: 'chips'; chips: { text: string; tone: Tone }[]; after?: RichNode[] }
/** Ghi chú nhỏ, chữ mờ */
export interface NoteBlock extends BlockBase { kind: 'note'; rich: RichNode[] }
/** Các hàng nhãn – giá trị (ví dụ bảng Vượng Suy) */
export interface KvBlock extends BlockBase { kind: 'kv'; rows: { k: string; v: string }[] }
/** Thanh tỷ lệ phần trăm (ví dụ 5 nhóm Thập Thần) */
export interface BarsBlock extends BlockBase { kind: 'bars'; rows: { label: string; pct: number }[] }
/** Dãy mẫu màu kèm tên (ví dụ màu Ngũ hành của Bát Trạch) */
export interface SwatchesBlock extends BlockBase { kind: 'swatches'; items: { label: string; hex: string }[] }
/** Dãy thẻ nhỏ: nhãn + giá trị nổi bật + chi tiết (ví dụ Ngũ hành theo từng hệ thống) */
export interface CardsBlock extends BlockBase { kind: 'cards'; cards: { label: string; value: string; rich: RichNode[] }[] }
/** Bảng có tiêu đề cột (ví dụ so sánh 4 hệ thống) */
export interface TableBlock extends BlockBase { kind: 'table'; head: string[]; rows: RichNode[][][] }
/** Vòng 5 hành minh hoạ: cạnh sinh (+) và khắc (−) giữa 5 nút; chỉ để giải thích, không chọn Dụng thần (ARCHITECTURE 14.11) */
export interface CycleBlock extends BlockBase {
  kind: 'cycle';
  nodes: { label: string; pct: number; role?: string; focus?: boolean; fill: string; ink: string }[];
  edges: { from: number; to: number; kind: 'sinh' | 'khac'; active: boolean }[];
  caption: RichNode[];
}
export type Block = PBlock | ListBlock | VerdictBlock | ItemBlock | ChipsBlock | NoteBlock | KvBlock | BarsBlock | SwatchesBlock | CardsBlock | TableBlock | CycleBlock;

export interface Section { id: string; title: string; icon?: string; tone?: Tone; blocks: Block[] }

export const p = (id: string, html: string, ref?: BlockRef): PBlock => ({ id, kind: 'p', rich: parseRich(html), ...(ref ? { ref } : {}) });
export const list = (id: string, items: readonly string[]): ListBlock => ({ id, kind: 'list', items: items.map(parseRich) });
export const note = (id: string, html: string): NoteBlock => ({ id, kind: 'note', rich: parseRich(html) });

/** Chữ thuần của cả một Section (tiêu đề + các khối theo thứ tự) — dùng cho đọc thành lời và test đối chiếu legacy. */
export function sectionPlainText(s: Section, withTitle = true, { how = true }: { how?: boolean } = {}): string {
  const parts: string[] = withTitle && s.title ? [s.title] : [];
  for (const b of s.blocks) {
    switch (b.kind) {
      case 'p': case 'note': parts.push(toPlainText(b.rich)); break;
      case 'verdict': parts.push(toPlainText(b.rich) + (how && b.how ? '\n' + b.how : '')); break;
      case 'list': parts.push(b.items.map((i) => toPlainText(i)).join('\n')); break;
      case 'item': parts.push(toPlainText(b.title) + (b.label ? ' ' + b.label : '') + '\n' + toPlainText(b.rich)); break;
      case 'chips': parts.push(b.chips.map((c) => c.text).join('\n') + (b.after ? ' ' + toPlainText(b.after) : '')); break;
      case 'kv': parts.push(b.rows.map((r) => r.k + ' ' + r.v).join('\n')); break;
      case 'bars': parts.push(b.rows.map((r) => r.label + ' ' + r.pct + '%').join('\n')); break;
      case 'swatches': parts.push(b.items.map((i) => i.label).join('\n')); break;
      case 'cards': parts.push(b.cards.map((c) => c.label + '\n' + c.value + '\n' + toPlainText(c.rich)).join('\n')); break;
      case 'cycle': parts.push(toPlainText(b.caption)); break;
      case 'table': parts.push(b.head.join('\n'), b.rows.map((r) => r.map((c) => toPlainText(c)).join('\n')).join('\n')); break;
    }
  }
  return parts.join('\n');
}
