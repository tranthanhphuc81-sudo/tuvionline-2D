import { RELATION_LABEL } from '../../content/common/notes';
import { setActiveProfile } from '../../state/actions';
import { useApp, useAppCtx, useNav } from '../../app/context';
import { Sheet } from '../../ui/components/Sheet';
import ui from '../../ui/components/ui.module.css';
import { birthLine, initials } from './format';
import s from './profiles.module.css';

/** Bảng chọn người đang xem (mở từ chip ở thanh trên). */
export function ProfileSheet({ open, onClose }: { open: boolean; onClose(): void }) {
  const { store } = useAppCtx();
  const nav = useNav();
  const profiles = useApp((x) => x.profiles);
  const activeId = useApp((x) => x.activeProfileId);
  return (
    <Sheet open={open} title="Đang xem lá số của" onClose={onClose}>
      {profiles.length === 0 && <p className={ui.muted}>Chưa có hồ sơ nào. Thêm hồ sơ để các công cụ tự tính theo ngày giờ sinh.</p>}
      <ul className={s.list} role="radiogroup" aria-label="Chọn hồ sơ">
        {profiles.map((p) => (
          <li key={p.id}>
            <button type="button" role="radio" aria-checked={p.id === activeId} className={s.item} onClick={() => { setActiveProfile(store, p.id); onClose(); }}>
              <span className={s.avatar} aria-hidden="true">{initials(p.name)}</span>
              <span className={s.itemText}>
                <span className={s.itemName}>{p.name}{p.relation ? ' · ' + RELATION_LABEL[p.relation] : ''}</span>
                <span className={s.itemSub}>{birthLine(p)}</span>
              </span>
              {p.id === activeId && <span className={s.badge}>Đang xem</span>}
            </button>
          </li>
        ))}
      </ul>
      <div className={ui.row}>
        <button type="button" className={`${ui.btn} ${ui.primary}`} style={{ flex: 1 }} onClick={() => { onClose(); nav.push({ name: 'profiles.edit' }); }}>＋ Thêm hồ sơ</button>
        {profiles.length > 0 && (
          <button type="button" className={ui.btn} style={{ flex: 1 }} onClick={() => { onClose(); nav.push({ name: 'profiles' }); }}>Quản lý hồ sơ</button>
        )}
      </div>
    </Sheet>
  );
}
