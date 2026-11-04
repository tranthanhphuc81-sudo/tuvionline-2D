import { CULTURAL_NOTE } from '../../content/common/notes';
import { setSetting } from '../../state/actions';
import type { EntryMode, Theme } from '../../state/schema';
import { useApp, useAppCtx } from '../../app/context';
import { Segmented } from '../../ui/components/Segmented';
import ui from '../../ui/components/ui.module.css';

export function SettingsScreen() {
  const { store } = useAppCtx();
  const theme = useApp((x) => x.settings.theme);
  const entryMode = useApp((x) => x.settings.entryMode);
  const journeySound = useApp((x) => x.settings.journeySound);
  const rate = useApp((x) => x.settings.ttsRate);
  const pitch = useApp((x) => x.settings.ttsPitch);
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
      </section>
      <section className={ui.card}>
        <h2>Về ứng dụng</h2>
        <p>Lý Số Trọn Bộ · phiên bản {__APP_VERSION__}</p>
        <p className={ui.muted}>Mọi phép tính chạy ngay trên máy. Hồ sơ chỉ lưu trên máy này, ứng dụng không gửi dữ liệu của bạn đi đâu.</p>
        <p className={ui.muted}>{CULTURAL_NOTE}</p>
      </section>
    </div>
  );
}
