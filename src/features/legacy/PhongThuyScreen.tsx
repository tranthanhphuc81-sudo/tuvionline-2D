import { useNav } from '../../app/context';
import type { PhongThuySub } from '../../app/routes';
import { Segmented } from '../../ui/components/Segmented';
import ui from '../../ui/components/ui.module.css';
import { LegacyToolScreen } from './LegacyToolScreen';

/** Tab Phong thủy: nút chuyển Bát Trạch · La Bàn · Nạp Âm ở đầu màn hình (ARCHITECTURE.md mục 1.1). */
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
      <LegacyToolScreen key={sub} tool={sub} />
    </div>
  );
}
