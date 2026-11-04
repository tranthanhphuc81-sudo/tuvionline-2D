import { useNav } from '../../app/context';
import type { PhongThuySub } from '../../app/routes';
import { Segmented } from '../../ui/components/Segmented';
import ui from '../../ui/components/ui.module.css';
import { LegacyToolScreen } from '../legacy/LegacyToolScreen';
import { BatTrachScreen } from './battrach/BatTrachScreen';
import { NapAmScreen } from './napam/NapAmScreen';

/** Tab Phong thủy: nút chuyển Bát Trạch · La Bàn · Nạp Âm ở đầu màn hình (ARCHITECTURE.md mục 1.1).
    Cả ba giữ mount để đổi qua lại không mất dữ liệu đang nhập. */
export function PhongThuyScreen({ sub = 'battrach' }: { sub?: PhongThuySub }) {
  const nav = useNav();
  return (
    <div className={ui.stack}>
      <Segmented
        label="Công cụ phong thủy"
        hideLabel
        value={sub}
        onChange={(v) => nav.replace({ name: 'phongthuy', sub: v })}
        options={[{ value: 'battrach', label: 'Bát Trạch' }, { value: 'laban', label: 'La Bàn' }, { value: 'napam', label: 'Nạp Âm' }]}
      />
      <div hidden={sub !== 'battrach'}><BatTrachScreen /></div>
      <div hidden={sub !== 'laban'}><LegacyToolScreen /></div>
      <div hidden={sub !== 'napam'}><NapAmScreen /></div>
    </div>
  );
}
