/* Vẽ thẻ chia sẻ ra PNG bằng Canvas 2D (ARCHITECTURE.md mục 6). Chạy offline, font lấy từ gói font của app. */
import { CARD_COLOR, CARD_FONT, CARD_W, layoutCard, type ShareCard } from './card';

function allText(card: ShareCard): string {
  return [card.title, card.person, card.personLine, card.verdict, ...card.groups.flatMap((g) => [g.title, ...g.cells.flat()]), ...(card.reading ?? []).flatMap((s) => [s.title, ...s.lines.map((l) => l.text)])].filter(Boolean).join(' ') + ' LÝ SỐ TRỌN BỘ';
}

export async function renderCard(card: ShareCard): Promise<Blob> {
  // Font chia theo vùng ký tự và chỉ tải khi cần: phải nạp đủ cho chính nội dung thẻ, không thì canvas vẽ bằng font hệ thống.
  const sample = allText(card);
  await Promise.all(Object.values(CARD_FONT).map((f) => document.fonts.load(f, sample)));
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Máy không vẽ được ảnh');
  const measure = (t: string, font: string) => { ctx.font = font; return ctx.measureText(t).width; };
  const { height, ops } = layoutCard(card, measure);
  canvas.width = CARD_W;
  canvas.height = height;
  ctx.textBaseline = 'top';
  ctx.fillStyle = CARD_COLOR.bg;
  ctx.fillRect(0, 0, CARD_W, height);
  for (const op of ops) {
    if (op.kind === 'text') {
      ctx.font = op.font;
      ctx.fillStyle = op.color;
      ctx.fillText(op.text, op.x, op.y);
    } else {
      ctx.fillStyle = op.color;
      ctx.beginPath();
      ctx.roundRect(op.x, op.y, op.w, op.h, op.radius ?? 0);
      ctx.fill();
    }
  }
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Máy không tạo được ảnh'))), 'image/png'));
}
