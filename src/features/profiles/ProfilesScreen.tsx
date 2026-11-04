import { RELATION_LABEL } from '../../content/common/notes';
import { useApp, useNav } from '../../app/context';
import ui from '../../ui/components/ui.module.css';
import { birthLine, initials } from './format';
import s from './profiles.module.css';

/** Quản lý hồ sơ: danh sách, chạm để sửa, nút thêm. */
export function ProfilesScreen() {
  const nav = useNav();
  const profiles = useApp((x) => x.profiles);
  const activeId = useApp((x) => x.activeProfileId);
  return (
    <div className={ui.stack}>
      <p className={ui.muted}>Hồ sơ chỉ lưu trên máy này, không gửi đi đâu. Chạm vào một hồ sơ để sửa hoặc xoá.</p>
      <ul className={s.list}>
        {profiles.map((p) => (
          <li key={p.id}>
            <button type="button" className={s.item} aria-current={p.id === activeId} onClick={() => nav.push({ name: 'profiles.edit', id: p.id })}>
              <span className={s.avatar} aria-hidden="true">{initials(p.name)}</span>
              <span className={s.itemText}>
                <span className={s.itemName}>{p.name}{p.relation ? ' · ' + RELATION_LABEL[p.relation] : ''}</span>
                <span className={s.itemSub}>{p.gender === 'M' ? 'Nam' : 'Nữ'} · {birthLine(p)}</span>
              </span>
              {p.id === activeId && <span className={s.badge}>Đang xem</span>}
              <span className={s.chev} aria-hidden="true">›</span>
            </button>
          </li>
        ))}
      </ul>
      <button type="button" className={`${ui.btn} ${ui.primary} ${ui.block}`} onClick={() => nav.push({ name: 'profiles.edit' })}>＋ Thêm hồ sơ</button>
    </div>
  );
}
