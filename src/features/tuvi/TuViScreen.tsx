/* Màn hình Tử Vi (Phase 3.2): tóm tắt, lá số (bố cục C) / danh sách, Tứ Hoá, Đại Hạn, tra năm, giải thích, tổng kết. */
import { useEffect, useMemo, useRef, useState } from 'react';
import { TuViEngine, cungNameFor, profileSummary, tuViYear, tuViYearLookup } from '../../core';
import { birthErrorText, birthNotesText } from '../../content/common/birth';
import { CULTURAL_NOTE } from '../../content/common/notes';
import { tuViExplain, tuViNotes } from '../../content/tuvi/explain';
import { tuViTongKet } from '../../content/tuvi/tongket';
import { tuViYearSections } from '../../content/tuvi/year';
import { selectActiveProfile } from '../../state/actions';
import { useApp, useNav } from '../../app/context';
import { Segmented } from '../../ui/components/Segmented';
import { SectionView } from '../../ui/components/SectionView';
import ui from '../../ui/components/ui.module.css';
import { ChartGrid, HOA_LABEL } from './ChartGrid';
import { PalaceDetail, PalaceList } from './PalaceDetail';
import s from './tuvi.module.css';

const { CHI, CAN } = TuViEngine;
const thisYear = () => new Date().getFullYear();

export function TuViScreen() {
  const nav = useNav();
  const profile = useApp(selectActiveProfile);
  const res = useMemo(() => (profile ? profileSummary(profile) : null), [profile]);
  const [mode, setMode] = useState<'chart' | 'list'>('chart');
  const [picked, setPicked] = useState<number | null>(null);
  const [yearInput, setYearInput] = useState(String(thisYear()));
  const [year, setYear] = useState(thisYear());
  const strip = useRef<HTMLDivElement>(null);
  // Cuộn dải Đại Hạn tới chặng của năm đang tra (chỉ cuộn ngang trong dải, không cuộn trang)
  useEffect(() => {
    const el = strip.current, cur = el?.querySelector<HTMLElement>('[data-cur="true"]');
    if (el && cur) el.scrollLeft = cur.offsetLeft - (el.clientWidth - cur.offsetWidth) / 2;
  }, [year, res, nav.tab]);

  if (!profile) {
    return (
      <section className={ui.card}>
        <h2>Tử Vi Đẩu Số</h2>
        <p>Thêm hồ sơ ngày giờ sinh để lập lá số 12 cung, Tứ Hoá, Đại Hạn và đọc vận theo năm.</p>
        <button type="button" className={`${ui.btn} ${ui.primary} ${ui.block}`} onClick={() => nav.push({ name: 'profiles.edit' })}>＋ Thêm hồ sơ</button>
      </section>
    );
  }
  if (!res || !res.ok) return <p className={ui.error} role="alert">{res && !res.ok ? birthErrorText(res.errors[0]) : ''}</p>;

  const ch = res.summary.tuvi.chart;
  const sel = picked ?? ch.menhChi;
  const notes = birthNotesText(res.birth.notes);
  const lookup = tuViYearLookup(ch, year);
  const curAge = lookup.age > 0 ? lookup.age : null;
  const summary: [string, string][] = [
    ['Âm lịch', ch.lunar.day + '/' + ch.lunar.month + (ch.lunar.leap ? ' (nhuận)' : '') + '/' + ch.lunar.year],
    ['Tứ trụ năm', CAN[ch.yearCC.can] + ' ' + CHI[ch.yearCC.chi]],
    ['Tứ trụ ngày', CAN[ch.dayCC.can] + ' ' + CHI[ch.dayCC.chi]],
    ['Tứ trụ giờ', CAN[ch.gioCanIdx] + ' ' + CHI[ch.gioChiIdx]],
    ['Cung Mệnh', CHI[ch.menhChi]],
    ['Cung Thân', CHI[ch.thanChi]],
    ['Cục', ch.cucTen],
    ['Âm/Dương mệnh chủ', ch.isDuongCan ? 'Dương Can' : 'Âm Can'],
  ];

  return (
    <div className={ui.stack}>
      {notes && <p className={ui.muted}>{notes}</p>}
      <dl className={s.summary}>
        {summary.map(([k, v]) => <div key={k} className={s.cell}><dt>{k}</dt><dd>{v}</dd></div>)}
      </dl>

      <h2 className={ui.sectionTitle}>Lá số 12 cung</h2>
      <Segmented<"chart" | "list"> label="Cách xem lá số" hideLabel value={mode} onChange={setMode} options={[{ value: 'chart', label: 'Lá số' }, { value: 'list', label: 'Danh sách' }]} />
      {mode === 'chart' ? (
        <>
          <ChartGrid ch={ch} name={profile.name} gender={profile.gender} selected={sel} onSelect={setPicked} />
          <PalaceDetail ch={ch} chi={sel} onSelect={setPicked} />
        </>
      ) : (
        <PalaceList ch={ch} onPick={(c) => { setPicked(c); setMode('chart'); }} />
      )}

      <h2 className={ui.sectionTitle}>Tứ Hoá bản mệnh</h2>
      <div className={s.tuhoa}>
        {(['loc', 'quyen', 'khoa', 'ky'] as const).map((k) => (
          <div key={k} className={s.hoa} data-hoa={k}><span className={s.hoaLbl}>{HOA_LABEL[k]}</span><span className={s.hoaStar}>{ch.tuHoaBanMenh[k]}</span></div>
        ))}
      </div>

      <h2 className={ui.sectionTitle}>Đại Hạn (mỗi giai đoạn 10 năm, khởi từ cung Mệnh)</h2>
      <div ref={strip} className={s.strip} role="list" aria-label="Các Đại Hạn">
        {ch.daiHan.map((d) => {
          const cur = curAge != null && curAge >= d.tuoiStart && curAge <= d.tuoiEnd;
          return (
            <button key={d.chi} type="button" role="listitem" className={s.dh} data-cur={cur} aria-current={cur || undefined} onClick={() => { setPicked(d.chi); setMode('chart'); }}>
              <b>{CHI[d.chi]}</b><span>{d.cungTen}</span><span>{d.tuoiStart}–{d.tuoiEnd} tuổi</span>
            </button>
          );
        })}
      </div>

      <h2 className={ui.sectionTitle}>Tra vận hạn theo năm</h2>
      <section className={ui.card}>
        <form className={s.yearForm} onSubmit={(e) => { e.preventDefault(); const y = parseInt(yearInput, 10); if (Number.isInteger(y) && y >= 1900 && y <= 2200) setYear(y); }}>
          <label className={ui.field} style={{ flex: 1 }}>
            <span className={ui.label}>Xem vận năm dương lịch</span>
            <input className={ui.input} type="number" inputMode="numeric" min={1900} max={2200} value={yearInput} onChange={(e) => setYearInput(e.target.value)} />
          </label>
          <button type="submit" className={ui.btn}>Xem</button>
        </form>
        <dl className={s.summary}>
          {([
            ['Tuổi (âm)', lookup.age > 0 ? lookup.age + ' tuổi' : '—'],
            ['Năm', CAN[lookup.yearCC.can] + ' ' + CHI[lookup.yearCC.chi]],
            ['Đại Hạn tại', lookup.daiHanChi != null ? CHI[lookup.daiHanChi] + ' (' + cungNameFor(ch.menhChi, lookup.daiHanChi) + ')' : '—'],
            ['Tiểu Hạn tại', lookup.tieuHanChi != null ? CHI[lookup.tieuHanChi] + ' (' + cungNameFor(ch.menhChi, lookup.tieuHanChi) + ')' : '—'],
            ['Tứ Hoá lưu niên', 'L:' + lookup.tuHoa.loc + ' · Q:' + lookup.tuHoa.quyen + ' · K:' + lookup.tuHoa.khoa + ' · Ky:' + lookup.tuHoa.ky],
          ] as [string, string][]).map(([k, v]) => <div key={k} className={s.cell}><dt>{k}</dt><dd>{v}</dd></div>)}
        </dl>
        <SectionView sections={tuViYearSections(ch, tuViYear(ch, year))} level={4} />
      </section>

      <details className={s.fold}>
        <summary><h2 className={ui.sectionTitle}>Giải thích chỉ số</h2><span className={s.muted}>6 bài học nhỏ</span></summary>
        <section className={ui.card}><SectionView sections={tuViExplain(ch)} level={4} /></section>
      </details>

      <h2 className={ui.sectionTitle}>Tổng kết</h2>
      <section className={ui.card}><SectionView sections={tuViTongKet(ch, thisYear())} level={4} /></section>

      <section className={s.notes}><SectionView sections={[tuViNotes()]} /></section>

      <p className={ui.muted}>{CULTURAL_NOTE}</p>
    </div>
  );
}
