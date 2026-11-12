import { useState } from 'react';
import { addProfile, removeProfile, setActiveProfile, updateProfile } from '../../state/actions';
import { useApp, useAppCtx, useNav } from '../../app/context';
import { Sheet } from '../../ui/components/Sheet';
import ui from '../../ui/components/ui.module.css';
import { ProfileForm } from './ProfileForm';

/** Thêm hoặc sửa một hồ sơ. Sửa thì có nút xoá (hỏi lại trước khi xoá). */
export function ProfileEditScreen({ id }: { id?: string }) {
  const { store } = useAppCtx();
  const nav = useNav();
  const profile = useApp((x) => (id ? x.profiles.find((p) => p.id === id) : undefined));
  const [confirm, setConfirm] = useState(false);
  const hasAnswers = useApp((x) => !!id && x.nguHanhAnswers.some((a) => a.profileId === id));

  if (id && !profile) return <p className={ui.muted}>Hồ sơ này đã bị xoá.</p>;

  return (
    <div className={ui.stack}>
      {hasAnswers && <p className={ui.muted} role="note">Nếu sửa ngày giờ sinh hay giới tính, các câu trả lời kiểm chứng ngũ hành đã lưu cho hồ sơ này sẽ bị xoá, vì lá số đổi thì các giai đoạn đã hỏi cũng đổi.</p>}
      <ProfileForm
        key={id ?? 'new'}
        initial={profile}
        submitLabel={profile ? 'Lưu thay đổi' : 'Lưu hồ sơ'}
        onSubmit={(p) => {
          if (profile) updateProfile(store, profile.id, p);
          else setActiveProfile(store, addProfile(store, p));
          nav.back();
        }}
      />
      {profile && (
        <button type="button" className={`${ui.btn} ${ui.danger} ${ui.block}`} onClick={() => setConfirm(true)}>Xoá hồ sơ này</button>
      )}
      {profile && (
        <Sheet open={confirm} title={`Xoá hồ sơ “${profile.name}”?`} onClose={() => setConfirm(false)}>
          <p className={ui.muted}>Hồ sơ sẽ bị xoá khỏi máy này và không khôi phục được.</p>
          <div className={ui.row}>
            <button type="button" className={ui.btn} style={{ flex: 1 }} onClick={() => setConfirm(false)}>Huỷ</button>
            <button type="button" className={`${ui.btn} ${ui.danger}`} style={{ flex: 1 }} onClick={() => { setConfirm(false); removeProfile(store, profile.id); nav.back(); }}>Xoá</button>
          </div>
        </Sheet>
      )}
    </div>
  );
}
