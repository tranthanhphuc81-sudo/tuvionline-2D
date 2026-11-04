/* Màn hình Bát Trạch (Phase 3.5): Mệnh Quái theo hồ sơ đang xem (tự lùi năm khi sinh trước Lập Xuân), đánh giá căn nhà theo
   hướng cửa (lưu ở tools.batTrachHuongCua), bảng 8 sao Du Niên, gợi ý bố trí, màu Ngũ hành, giải thích, tổng kết. */
import { useMemo } from 'react';
import { HUONG_LIST, batTrachReading, resolveBirth, type Huong } from '../../../core';
import { birthErrorText, birthNotesText } from '../../../content/common/birth';
import { CULTURAL_NOTE } from '../../../content/common/notes';
import { parseRich } from '../../../content/rich';
import {
  batTrachExplain, batTrachHanhCard, batTrachHouseBanner, batTrachLapXuanNote, batTrachNotes, batTrachPositions, batTrachStarCards, batTrachSummary,
} from '../../../content/battrach/explain';
import { batTrachTongKet } from '../../../content/battrach/tongket';
import { selectActiveProfile, setBatTrachHuongCua } from '../../../state/actions';
import { useApp, useAppCtx, useNav } from '../../../app/context';
import { RichText } from '../../../ui/components/RichText';
import { SectionView } from '../../../ui/components/SectionView';
import { SpeakButton } from '../../../ui/components/SpeakButton';
import { cellsSpeech, richSpeech, sectionsSpeech, speechOf } from '../../../content/speech';
import ui from '../../../ui/components/ui.module.css';
import { Banner } from '../Banner';
import s from '../phongthuy.module.css';
import { StarGrid } from './StarGrid';

export function BatTrachScreen() {
  const nav = useNav();
  const { store } = useAppCtx();
  const profile = useApp(selectActiveProfile);
  const huongCua = useApp((x) => x.tools.batTrachHuongCua);
  const birth = useMemo(() => (profile ? resolveBirth(profile) : null), [profile]);
  const r = useMemo(() => (profile && birth?.ok ? batTrachReading(birth.solar, profile.gender, huongCua) : null), [profile, birth, huongCua]);

  if (!profile) {
    return (
      <section className={ui.card}>
        <h2>Mệnh Quái & Hướng Nhà (Bát Trạch)</h2>
        <p>Thêm hồ sơ ngày sinh để tính Mệnh Quái, nhóm Đông/Tây Tứ Mệnh, 8 sao Du Niên và gợi ý bố trí hướng cửa, bếp, giường, bàn làm việc.</p>
        <button type="button" className={`${ui.btn} ${ui.primary} ${ui.block}`} onClick={() => nav.push({ name: 'profiles.edit' })}>＋ Thêm hồ sơ</button>
      </section>
    );
  }
  if (!birth || !birth.ok || !r) return <p className={ui.error} role="alert">{birth && !birth.ok ? birthErrorText(birth.errors[0]) : ''}</p>;

  const notes = birthNotesText(birth.notes.filter((n) => n.code === 'from-lunar'));
  const lx = batTrachLapXuanNote(birth.solar, r);

  return (
    <div className={ui.stack}>
      {notes && <p className={ui.muted}>{notes}</p>}
      {lx && <Banner id="battrach.lapxuan" tone="warn" html={lx} />}
      <dl className={s.summary}>
        {batTrachSummary(r).map(([k, v]) => <div key={k} className={s.cell}><dt>{k}</dt><dd>{v}</dd></div>)}
      </dl>
      <SpeakButton id="battrach" getText={() => speechOf(cellsSpeech(batTrachSummary(r)), r.house ? richSpeech(batTrachHouseBanner(r.house)) : '', sectionsSpeech([batTrachHanhCard(r)]), sectionsSpeech(batTrachTongKet(r)))} />

      <section className={ui.card} aria-labelledby="pt-house-title">
        <h2 id="pt-house-title" className={ui.sectionTitle}>Căn nhà đang xét</h2>
        <label className={ui.field}>
          <span className={ui.label}>Hướng cửa chính của căn nhà đang xét (không bắt buộc)</span>
          <select className={ui.input} value={huongCua ?? ''} onChange={(e) => setBatTrachHuongCua(store, (e.target.value || undefined) as Huong | undefined)}>
            <option value="">— Chưa xét căn nhà cụ thể —</option>
            {HUONG_LIST.map((h) => <option key={h} value={h}>{h}</option>)}
          </select>
        </label>
        <p className={ui.muted}>Hướng cửa = hướng nhìn ra khi đứng ở cửa chính quay lưng vào nhà (mục 1.4 Phần 4).</p>
        {r.house && <Banner id="battrach.house" tone={r.house.hop ? 'ok' : 'warn'} html={batTrachHouseBanner(r.house)} />}
      </section>

      <h2 className={ui.sectionTitle}>Bảng Du Niên — 8 sao ứng với Mệnh Quái của bạn</h2>
      <StarGrid cards={batTrachStarCards(r)} />

      <h2 className={ui.sectionTitle}>Gợi ý bố trí theo hướng</h2>
      <dl className={s.posGrid}>
        {batTrachPositions(r).map(([k, v]) => <div key={k} className={s.pos}><dt>{k}</dt><dd><RichText nodes={parseRich(v)} /></dd></div>)}
      </dl>

      <h2 className={ui.sectionTitle}>Ngũ hành ứng dụng — màu sắc, vật phẩm</h2>
      <section className={ui.card}><SectionView sections={[batTrachHanhCard(r)]} /></section>

      <details className={s.fold}>
        <summary><h2 className={ui.sectionTitle}>Giải thích chỉ số</h2><span className={ui.muted}>5 bài học nhỏ</span></summary>
        <section className={ui.card}><SectionView sections={batTrachExplain(r)} level={4} /></section>
      </details>

      <h2 className={ui.sectionTitle}>Tổng kết</h2>
      <section className={ui.card}><SectionView sections={batTrachTongKet(r)} level={4} /></section>

      <section className={s.notes}><SectionView sections={[batTrachNotes()]} /></section>
      <p className={ui.muted}>{CULTURAL_NOTE}</p>
    </div>
  );
}
