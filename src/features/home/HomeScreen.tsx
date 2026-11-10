import { useMemo } from 'react';
import { profileSummary, tongHopOf } from '../../core';
import { birthErrorText, birthNotesText } from '../../content/common/birth';
import { CULTURAL_NOTE, RELATION_LABEL } from '../../content/common/notes';
import { tongHopParts } from '../../content/tonghop/explain';
import { selectActiveProfile } from '../../state/actions';
import { useApp, useAppCtx, useNav } from '../../app/context';
import type { Route, TabId } from '../../app/routes';
import { SectionView } from '../../ui/components/SectionView';
import { SpeakButton } from '../../ui/components/SpeakButton';
import { useWho } from '../reader/hooks';
import { buildScript } from '../reader/script';
import { ShareButton } from '../share/ShareButton';
import { cardReading, cardWho } from '../share/card';
import ui from '../../ui/components/ui.module.css';
import { birthLine } from '../profiles/format';
import s from './home.module.css';

const SHORTCUTS: readonly { icon: string; label: string; tab: TabId; route?: Route }[] = [
  { icon: '🔮', label: 'Tử Vi', tab: 'tuvi' },
  { icon: '📜', label: 'Bát Tự', tab: 'battu' },
  { icon: '☯', label: 'Lục Hào', tab: 'luchao' },
  { icon: '🏠', label: 'Bát Trạch', tab: 'phongthuy', route: { name: 'phongthuy', sub: 'battrach' } },
  { icon: '🧭', label: 'La Bàn', tab: 'phongthuy', route: { name: 'phongthuy', sub: 'laban' } },
  { icon: '🌙', label: 'Nạp Âm & hợp hôn', tab: 'phongthuy', route: { name: 'phongthuy', sub: 'napam' } },
  { icon: '✋', label: 'Chỉ tay', tab: 'home', route: { name: 'palm' } },
];

export function BootNoticeBanner() {
  const { notice } = useAppCtx();
  if (!notice) return null;
  if (notice.kind === 'imported-legacy') {
    return <p className={ui.info} role="status">Đã chuyển thông tin bạn nhập ở bản trước thành hồ sơ đầu tiên. Bạn có thể đổi tên hồ sơ trong mục Quản lý hồ sơ.</p>;
  }
  return (
    <p className={ui.error} role="alert">
      Dữ liệu đã lưu trên máy bị hỏng nên không đọc được ({notice.error}). App khởi động với dữ liệu trống; bản sao dữ liệu cũ vẫn được
      giữ nguyên trên máy để khôi phục sau.
    </p>
  );
}

/** Tổng hợp: tóm tắt 4 hệ thống của người đang xem, lối tắt sang mọi công cụ, rồi phần đọc tổng hợp. */
export function HomeScreen() {
  const nav = useNav();
  const who = useWho();
  const profile = useApp(selectActiveProfile);
  const res = useMemo(() => (profile ? profileSummary(profile) : null), [profile]);

  const parts = useMemo(() => (res?.ok ? tongHopParts(tongHopOf(res.birth)) : []), [res]);

  const go = (sc: (typeof SHORTCUTS)[number]) => {
    // Tổng hợp nằm trong tab Tĩnh thất: mở chồng lên để Back về lại Tổng hợp (goTo sẽ thay mất gốc tab)
    if (sc.route && sc.tab === 'home') nav.push(sc.route);
    else if (sc.route) nav.goTo(sc.tab, sc.route);
    else nav.selectTab(sc.tab);
  };

  return (
    <div className={ui.stack}>
      {!profile && (
        <section className={ui.card}>
          <h2>Chào bạn</h2>
          <p>Thêm hồ sơ ngày giờ sinh (của bạn hoặc người thân) để xem nhanh Tử Vi, Bát Tự, Bát Trạch và Nạp Âm. Mọi phép tính chạy ngay trên máy, không gửi dữ liệu đi đâu.</p>
          <button type="button" className={`${ui.btn} ${ui.primary} ${ui.block}`} onClick={() => nav.push({ name: 'profiles.edit' })}>＋ Thêm hồ sơ đầu tiên</button>
        </section>
      )}

      {profile && res && !res.ok && (
        <p className={ui.error} role="alert">{birthErrorText(res.errors[0])}</p>
      )}

      {profile && res?.ok && (
        <>
          <section className={ui.card}>
            <div>
              <h1 className={s.name}>{profile.name}</h1>
              <p className={ui.muted}>
                {profile.gender === 'M' ? 'Nam' : 'Nữ'}{profile.relation ? ' · ' + RELATION_LABEL[profile.relation] : ''} · {birthLine(profile)}
              </p>
              {birthNotesText(res.birth.notes) && <p className={ui.muted}>{birthNotesText(res.birth.notes)}</p>}
            </div>
          </section>
          <div className={s.grid}>
            <article className={ui.card}>
              <h2>🔮 Tử Vi</h2>
              <p>Âm lịch {res.summary.tuvi.lunar.day}/{res.summary.tuvi.lunar.month}{res.summary.tuvi.lunar.leap ? ' (nhuận)' : ''}/{res.summary.tuvi.lunar.year}</p>
              <p>Cung Mệnh <b>{res.summary.tuvi.menhChi}</b>{res.summary.tuvi.menhStars.length ? ` — ${res.summary.tuvi.menhStars.join(', ')}` : ' — Vô Chính Diệu'} · Cung Thân <b>{res.summary.tuvi.thanChi}</b></p>
              <p>Cục <b>{res.summary.tuvi.cucTen}</b></p>
            </article>
            <article className={ui.card}>
              <h2>📜 Bát Tự</h2>
              <p className={s.pillars}>{res.summary.battu.pillars.join(' · ')}</p>
              <p>Nhật Chủ <b>{res.summary.battu.nhatChu}</b> (hành {res.summary.battu.nhatChuHanh})</p>
            </article>
            <article className={ui.card}>
              <h2>🏠 Bát Trạch</h2>
              <p>Mệnh Quái <b>{res.summary.battrach.quai}</b> (hành {res.summary.battrach.hanh}) · {res.summary.battrach.nhom}</p>
              {res.summary.battrach.beforeLapXuan && <p className={ui.muted}>Sinh trước Lập Xuân → tính theo năm {res.summary.battrach.lySoYear}</p>}
            </article>
            <article className={ui.card}>
              <h2>🌙 Nạp Âm</h2>
              <p><b>{res.summary.napam.ten}</b> — {res.summary.napam.canChiTen} (hành {res.summary.napam.hanh})</p>
              {res.summary.napam.beforeTet && <p className={ui.muted}>Sinh trước Tết → thuộc năm âm lịch {res.summary.napam.lunar.year}</p>}
            </article>
          </div>
        </>
      )}

      <section className={ui.stack} aria-labelledby="home-tools">
        <h2 id="home-tools" className={ui.sectionTitle}>Công cụ</h2>
        <div className={s.shortcuts}>
          {SHORTCUTS.map((sc) => (
            <button key={sc.label} type="button" className={s.shortcut} onClick={() => go(sc)}>
              <span className={s.scIcon} aria-hidden="true">{sc.icon}</span>
              <span>{sc.label}</span>
            </button>
          ))}
        </div>
      </section>

      {parts.length > 0 && <SpeakButton id="tonghop" getCues={() => buildScript('tonghop', who, { sections: parts.flatMap((part) => part.sections) })} />}
      {profile && res?.ok && parts.length > 0 && <ShareButton getCard={() => ({ slug: 'tong-hop', title: 'Tổng hợp lý số', ...cardWho(profile), groups: [{ cells: [
        ['Cung Mệnh', res.summary.tuvi.menhChi + ' — ' + (res.summary.tuvi.menhStars.join(', ') || 'Vô Chính Diệu')], ['Cục', res.summary.tuvi.cucTen],
        ['Bát Tự', res.summary.battu.pillars.join(' · ')], ['Nhật Chủ', res.summary.battu.nhatChu + ' (hành ' + res.summary.battu.nhatChuHanh + ')'],
        ['Mệnh Quái', res.summary.battrach.quai + ' (hành ' + res.summary.battrach.hanh + ') · ' + res.summary.battrach.nhom],
        ['Nạp Âm', res.summary.napam.ten + ' — ' + res.summary.napam.canChiTen],
      ] }], reading: cardReading(parts[0].sections) })} />}
      {parts.map((part) => (
        <section key={part.id} className={ui.stack} aria-labelledby={`home-${part.id}`}>
          <h2 id={`home-${part.id}`} className={ui.sectionTitle}>{part.title}</h2>
          <div className={ui.card}><SectionView sections={part.sections} /></div>
        </section>
      ))}

      <p className={`${ui.muted} ${s.footer}`}>{CULTURAL_NOTE}</p>
    </div>
  );
}
