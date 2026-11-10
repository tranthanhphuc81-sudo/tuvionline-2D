/* Cài đặt > Dữ liệu của bạn: sao lưu, khôi phục, xoá toàn bộ (Phase 7.1). */
import { useRef, useState, type ChangeEvent } from 'react';
import { BACKUP_FAILED, BACKUP_HINT, BACKUP_SAVED, RESTORE_ERROR, WIPE_CONFIRM, restoreConfirmText } from '../../content/common/about';
import { useApp, useAppCtx } from '../../app/context';
import { replaceState } from '../../state/actions';
import { BACKUP_MAX_BYTES, backupFileName, backupText, parseBackup } from '../../state/backup';
import { LEGACY_SHARED_KEY, LEGACY_THEME_KEY } from '../../state/migrations';
import { emptyState, STATE_KEY, type PersistedState } from '../../state/schema';
import { clearShareCache, shareFiles } from '../../platform/share';
import { preferencesKV, removeLocalStorage, type KV } from '../../platform/storage';
import { READER_PHOTO_KEY, removeReaderPhoto } from '../reader/customPhoto';
import { stopReading } from '../../platform/tts';
import { Sheet } from '../../ui/components/Sheet';
import ui from '../../ui/components/ui.module.css';

/** Xoá những gì nằm ngoài `lyso.state`: bản sao dữ liệu hỏng, dữ liệu bản 0.1, file chia sẻ tạm. */
export async function wipeExtras(kv: KV): Promise<void> {
  const keys = await kv.keys();
  await Promise.all(keys.filter((k) => k.startsWith(`${STATE_KEY}.corrupt-`) || k === READER_PHOTO_KEY).map((k) => kv.remove(k)));
  removeLocalStorage(LEGACY_SHARED_KEY);
  removeLocalStorage(LEGACY_THEME_KEY);
  await clearShareCache();
}

export function DataSection() {
  const { store, resetScreens } = useAppCtx();
  const profileCount = useApp((x) => x.profiles.length);
  const fileInput = useRef<HTMLInputElement>(null);
  const [note, setNote] = useState<{ text: string; error: boolean } | null>(null);
  const [incoming, setIncoming] = useState<PersistedState | null>(null);
  const [wipe, setWipe] = useState(false);

  const backup = async () => {
    setNote(null);
    try {
      const blob = new Blob([backupText(store.getState())], { type: 'application/json' });
      const outcome = await shareFiles([{ blob, name: backupFileName(new Date()) }], 'Sao lưu Lý Số Trọn Bộ');
      if (outcome === 'saved') setNote({ text: BACKUP_SAVED, error: false });
    } catch {
      setNote({ text: BACKUP_FAILED, error: true });
    }
  };

  const pickFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setNote(null);
    if (file.size > BACKUP_MAX_BYTES) { setNote({ text: RESTORE_ERROR['too-large'], error: true }); return; }
    let text: string;
    try {
      text = await file.text();
    } catch {
      setNote({ text: RESTORE_ERROR.unreadable, error: true });
      return;
    }
    const r = parseBackup(text);
    if (r.ok) setIncoming(r.state);
    else setNote({ text: RESTORE_ERROR[r.error], error: true });
  };

  const applyState = (next: PersistedState) => {
    stopReading();
    replaceState(store, next);
    resetScreens();
  };

  return (
    <section className={ui.card}>
      <h2>Dữ liệu của bạn</h2>
      <p className={ui.muted}>{BACKUP_HINT}</p>
      <button type="button" className={`${ui.btn} ${ui.block}`} onClick={() => void backup()}>Sao lưu ra file</button>
      <button type="button" className={`${ui.btn} ${ui.block}`} onClick={() => fileInput.current?.click()}>Khôi phục từ file</button>
      <input ref={fileInput} type="file" hidden aria-label="Chọn file sao lưu" onChange={(e) => void pickFile(e)} />
      {note && <p className={note.error ? ui.error : ui.info} role={note.error ? 'alert' : 'status'}>{note.text}</p>}
      <button type="button" className={`${ui.btn} ${ui.danger} ${ui.block}`} onClick={() => setWipe(true)}>Xoá toàn bộ dữ liệu</button>

      <Sheet open={incoming !== null} title="Khôi phục từ file sao lưu?" onClose={() => setIncoming(null)}>
        <p>{restoreConfirmText(incoming?.profiles.length ?? 0, profileCount)}</p>
        <div className={ui.row}>
          <button type="button" className={ui.btn} style={{ flex: 1 }} onClick={() => setIncoming(null)}>Huỷ</button>
          <button type="button" className={`${ui.btn} ${ui.primary}`} style={{ flex: 1 }} onClick={() => { if (incoming) applyState(incoming); setIncoming(null); }}>Khôi phục</button>
        </div>
      </Sheet>

      <Sheet open={wipe} title="Xoá toàn bộ dữ liệu?" onClose={() => setWipe(false)}>
        <p>{WIPE_CONFIRM}</p>
        <div className={ui.row}>
          <button type="button" className={ui.btn} style={{ flex: 1 }} onClick={() => setWipe(false)}>Huỷ</button>
          <button type="button" className={`${ui.btn} ${ui.danger}`} style={{ flex: 1 }} onClick={() => { setWipe(false); applyState(emptyState()); void wipeExtras(preferencesKV).then(() => removeReaderPhoto()); }}>Xoá hết</button>
        </div>
      </Sheet>
    </section>
  );
}
