import { useEffect, useState } from 'react';
import { CULTURAL_NOTE } from '../../content/common/notes';
import { setSetting } from '../../state/actions';
import type { EntryMode, Theme, XungHoSetting } from '../../state/schema';
import { speechFailedText } from '../../content/speech';
import { isNative } from '../../platform/native';
import { lastSpeechError, localVietnameseVoices, speak } from '../../platform/tts';
import { thayVoice } from '../reader/hooks';
import { useApp, useAppCtx } from '../../app/context';
import { Segmented } from '../../ui/components/Segmented';
import { PRIVACY_POINTS } from '../../content/common/about';
import { DataSection } from './DataSection';
import ui from '../../ui/components/ui.module.css';

const VOICE_SAMPLE = 'Thầy chào bạn. Số là tham khảo, đức năng thắng số.';
const XUNG_HO: readonly { value: XungHoSetting; label: string }[] = [
  { value: 'tu-dong', label: 'Tự động theo tuổi' }, { value: 'con', label: 'Con' }, { value: 'anh', label: 'Anh' }, { value: 'chi', label: 'Chị' },
  { value: 'chu', label: 'Chú' }, { value: 'co', label: 'Cô' }, { value: 'ban', label: 'Bạn' },
];

export function SettingsScreen() {
  const { store } = useAppCtx();
  const theme = useApp((x) => x.settings.theme);
  const entryMode = useApp((x) => x.settings.entryMode);
  const journeySound = useApp((x) => x.settings.journeySound);
  const rate = useApp((x) => x.settings.ttsRate);
  const pitch = useApp((x) => x.settings.ttsPitch);
  const voice = useApp((x) => x.settings.ttsVoice);
  const xungHo = useApp((x) => x.settings.xungHo);
  const [voices, setVoices] = useState<string[]>([]);
  const [sampleNote, setSampleNote] = useState<string | null>(null);
  useEffect(() => { void localVietnameseVoices().then(setVoices); }, []);
  return (
    <div className={ui.stack}>
      <section className={ui.card}>
        <h2>Giao diện</h2>
        <Segmented<Theme>
          label="Chế độ màu"
          value={theme}
          onChange={(v) => setSetting(store, 'theme', v)}
          options={[{ value: 'system', label: 'Theo máy' }, { value: 'light', label: 'Sáng' }, { value: 'dark', label: 'Tối' }]}
        />
      </section>
      <section className={ui.card}>
        <h2>Lối vào đạo quán</h2>
        <Segmented<EntryMode>
          label="Khi mở app"
          value={entryMode}
          onChange={(v) => setSetting(store, 'entryMode', v)}
          options={[{ value: 'auto', label: 'Tự động' }, { value: 'full', label: 'Đầy đủ' }, { value: 'short', label: 'Rút gọn' }, { value: 'none', label: 'Không có' }]}
        />
        <p className={ui.muted}>Tự động: lần đầu và các ngày rằm, mùng 1, Tết đi đầy đủ, những lần khác rút gọn.</p>
        <Segmented
          label="Âm thanh lối vào"
          value={journeySound ? 'on' : 'off'}
          onChange={(v) => setSetting(store, 'journeySound', v === 'on')}
          options={[{ value: 'on', label: 'Bật' }, { value: 'off', label: 'Tắt' }]}
        />
        <p className={ui.muted}>Khi máy đang để im lặng hoặc rung, lối vào không phát âm thanh.</p>
      </section>
      <section className={ui.card}>
        <h2>Đọc thành lời</h2>
        <Segmented
          label="Tốc độ đọc"
          value={String(rate)}
          onChange={(v) => setSetting(store, 'ttsRate', Number(v))}
          options={[{ value: '0.85', label: 'Chậm' }, { value: '1', label: 'Vừa' }, { value: '1.15', label: 'Nhanh' }]}
        />
        <Segmented
          label="Cao độ giọng"
          value={String(pitch)}
          onChange={(v) => setSetting(store, 'ttsPitch', Number(v))}
          options={[{ value: '0.9', label: 'Trầm' }, { value: '1', label: 'Vừa' }, { value: '1.1', label: 'Cao' }]}
        />
        {voices.length > 1 && (
          <label className={ui.field}>
            <span className={ui.label}>Giọng đọc</span>
            <select className={ui.input} value={voice ?? ''} onChange={(e) => setSetting(store, 'ttsVoice', e.target.value || undefined)}>
              <option value="">Tự chọn</option>
              {voices.map((v, i) => <option key={v} value={v}>Giọng {i + 1}</option>)}
            </select>
          </label>
        )}
        <button type="button" className={`${ui.btn} ${ui.block}`} onClick={() => { setSampleNote(null); void speak(VOICE_SAMPLE, thayVoice(rate, pitch)).catch(() => setSampleNote(speechFailedText(isNative(), lastSpeechError()))); }}>🔊 Nghe thử giọng thầy</button>
        {sampleNote && <p className={ui.info} role="status">{sampleNote}</p>}
        <label className={ui.field}>
          <span className={ui.label}>Thầy gọi bạn là</span>
          <select className={ui.input} value={xungHo} onChange={(e) => setSetting(store, 'xungHo', e.target.value as XungHoSetting)}>
            {XUNG_HO.map((x) => <option key={x.value} value={x.value}>{x.label}</option>)}
          </select>
        </label>
      </section>
      <DataSection />
      <section className={ui.card}>
        <h2>Về ứng dụng</h2>
        <p>Lý Số Trọn Bộ · phiên bản {__APP_VERSION__}</p>
        <p>Bảy công cụ lý số phương Đông bằng tiếng Việt: Tử Vi, Bát Tự, Lục Hào, Bát Trạch, Nạp Âm, Tổng hợp và La Bàn phong thủy.</p>
        <p className={ui.muted}>Mọi phép tính chạy ngay trên máy. Hồ sơ chỉ lưu trên máy này, ứng dụng không gửi dữ liệu của bạn đi đâu.</p>
        <p className={ui.muted}>{CULTURAL_NOTE}</p>
        <details>
          <summary className={ui.foldTitle}>Chính sách quyền riêng tư</summary>
          <ul className={ui.privacyList}>
            {PRIVACY_POINTS.map((x) => <li key={x}>{x}</li>)}
          </ul>
        </details>
      </section>
    </div>
  );
}
