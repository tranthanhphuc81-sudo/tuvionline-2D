/* Dùng chung cho các test truy cập (ARCHITECTURE 7.1): chạy axe-core trên cả trang trong jsdom, mở hết khối gập trước.
   Bật WCAG 2.0/2.1 A, AA và nhóm best-practice; tắt color-contrast vì jsdom không tính màu (đã có contrast-tokens.test.ts).
   Trả về "luật: phần tử — html" để thông báo lỗi dễ đọc. */
import axe from 'axe-core';

export async function axeViolations(): Promise<string[]> {
  document.querySelectorAll('details').forEach((d) => { d.open = true; });
  const r = await axe.run(document.body, {
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'] },
    rules: { 'color-contrast': { enabled: false } },
  });
  return r.violations.flatMap((v) => v.nodes.map((n) => `${v.id}: ${n.target.join(' ')} — ${n.html.slice(0, 120)}`));
}
