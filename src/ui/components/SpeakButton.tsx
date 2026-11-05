import { useState, useSyncExternalStore } from 'react';
import { thayVoice } from '../../features/reader/hooks';
import type { Cue } from '../../features/reader/script';
import { SPEECH_FAILED, SPEECH_NO_VOICE, chunkSpeech } from '../../content/speech';
import { isNative } from '../../platform/native';
import { openVoiceInstall, readAloud, readingOwner, stopReading, subscribeReading, vietnameseVoice } from '../../platform/tts';
import { useApp } from '../../app/context';
import ui from './ui.module.css';

/** Nút Đọc/Dừng. `getText`, `getCues` chỉ chạy khi bấm nên màn hình không tốn công dựng chữ khi chưa cần. Có `getCues` thì thầy đọc theo kịch bản. */
export function SpeakButton({ id, getText, getCues }: { id: string; getText?(): string; getCues?(): Cue[] }) {
  const rate = useApp((x) => x.settings.ttsRate);
  const pitch = useApp((x) => x.settings.ttsPitch);
  const speaking = useSyncExternalStore(subscribeReading, readingOwner) === id;
  const [note, setNote] = useState<'voice' | 'failed' | null>(null);

  const toggle = async () => {
    if (speaking) { stopReading(); return; }
    setNote(null);
    if ((await vietnameseVoice()) === 'missing') { setNote('voice'); return; }
    const ok = getCues ? await readAloud(id, getCues(), thayVoice(rate, pitch)) : await readAloud(id, chunkSpeech(getText?.() ?? ''), { rate, pitch });
    if (!ok) setNote('failed');
  };

  return (
    <div className={ui.stack}>
      <button type="button" className={`${ui.btn} ${ui.block}`} aria-pressed={speaking} onClick={() => void toggle()}>
        {speaking ? '⏹ Dừng đọc' : getCues ? '🔊 Thầy đọc' : '🔊 Đọc kết quả'}
      </button>
      {note && (
        <div className={ui.info} role="status">
          <p>{note === 'voice' ? SPEECH_NO_VOICE : SPEECH_FAILED}</p>
          {isNative() && <button type="button" className={`${ui.btn} ${ui.block}`} onClick={() => void openVoiceInstall()}>Mở cài đặt giọng đọc</button>}
        </div>
      )}
    </div>
  );
}
