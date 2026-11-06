import { useState } from 'react';
import { SHARE_FAILED, SHARE_SAVED } from '../../content/common/about';
import { shareFiles } from '../../platform/share';
import ui from '../../ui/components/ui.module.css';
import type { ShareCard } from './card';
import { renderCards } from './render';

/** Nút Chia sẻ ảnh. `getCard` chỉ chạy khi bấm nên màn hình không tốn công dựng thẻ khi chưa cần. */
export function ShareButton({ getCard }: { getCard(): ShareCard }) {
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const run = async () => {
    setBusy(true);
    setNote(null);
    try {
      const card = getCard();
      const blobs = await renderCards(card);
      const files = blobs.map((blob, i) => ({ blob, name: blobs.length > 1 ? `ly-so-${card.slug}-${i + 1}.png` : `ly-so-${card.slug}.png` }));
      const outcome = await shareFiles(files, card.title);
      if (outcome === 'saved') setNote(SHARE_SAVED);
    } catch {
      setNote(SHARE_FAILED);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={ui.stack}>
      <button type="button" className={`${ui.btn} ${ui.block}`} disabled={busy} onClick={() => void run()}>{busy ? 'Đang tạo ảnh…' : '📤 Chia sẻ ảnh'}</button>
      {note && <p className={ui.info} role="status">{note}</p>}
    </div>
  );
}
