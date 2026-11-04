import { CULTURAL_NOTE } from '../../content/common/notes';
import { setSetting } from '../../state/actions';
import type { Theme } from '../../state/schema';
import { useApp, useAppCtx } from '../../app/context';
import { Segmented } from '../../ui/components/Segmented';
import ui from '../../ui/components/ui.module.css';

export function SettingsScreen() {
  const { store } = useAppCtx();
  const theme = useApp((x) => x.settings.theme);
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
        <h2>Về ứng dụng</h2>
        <p>Lý Số Trọn Bộ · phiên bản {__APP_VERSION__}</p>
        <p className={ui.muted}>Mọi phép tính chạy ngay trên máy. Hồ sơ chỉ lưu trên máy này, ứng dụng không gửi dữ liệu của bạn đi đâu.</p>
        <p className={ui.muted}>{CULTURAL_NOTE}</p>
      </section>
    </div>
  );
}
