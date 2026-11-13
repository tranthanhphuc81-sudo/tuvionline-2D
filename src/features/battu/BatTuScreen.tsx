/* Màn hình Bát Tự (Phase 3.3): tóm tắt, 4 trụ, Vượng Suy + Dụng Thần, Đại Vận, tra Lưu Niên, giải thích, tổng kết. */
import { useEffect, useMemo, useRef, useState } from 'react';
import { BatTuEngine, batTuYearLookup, profileSummary } from '../../core';
import { birthErrorText, birthNotesText } from '../../content/common/birth';
import { CULTURAL_NOTE } from '../../content/common/notes';
import { parseRich } from '../../content/rich';
import { batTuDungThan, batTuExplain, batTuKhoiVanNote, batTuLapXuanNote, batTuNotes, batTuVuongSuy } from '../../content/battu/explain';
import { batTuTongKet } from '../../content/battu/tongket';
import { selectActiveProfile } from '../../state/actions';
import { useApp, useNav } from '../../app/context';
import { RichText } from '../../ui/components/RichText';
import { SectionView } from '../../ui/components/SectionView';
import { SpeakButton } from '../../ui/components/SpeakButton';
import { buildScript, batTuLead } from '../reader/script';
import { useCueFocus, useWho } from '../reader/hooks';
import { cellsSpeech, sectionsSpeech, speechOf } from '../../content/speech';
import { ShareButton } from '../share/ShareButton';
import { cardReading, cardWho } from '../share/card';
import ui from '../../ui/components/ui.module.css';
import { Pillars, hanhAmDuong } from './Pillars';
import { NguHanhSection } from './NguHanhSection';
import { cachCucOfBirth, dongKhi, lucThan, lucThanDau, noiVang, quanHe, BatTuEngine as BTE } from '../../core';
import { analyze, toNguHanhChart } from '../../core/nguhanh';
import { cachCucSection, cachCucSpeech } from '../../content/cachcuc/text';
import { quanHeSection } from '../../content/cachcuc/quanhe';
import { dongKhiSection, tinhTinhSection } from '../../content/cachcuc/dongkhi';
import { lucThanSection } from '../../content/cachcuc/lucthan';
import { thuongLySection, thuongLySpeech } from '../../content/cachcuc/thuongly';
import s from './battu.module.css';

const { CAN, CHI } = BatTuEngine;
const thisYear = () => new Date().getFullYear();

export function BatTuScreen() {
  const nav = useNav();
  const profile = useApp(selectActiveProfile);
  const who = useWho();
  const bt = useCueFocus('battu'), ng = useCueFocus('nguhanh');
  const cueFocus = ng ?? bt;
  const res = useMemo(() => (profile ? profileSummary(profile) : null), [profile]);
  const [yearInput, setYearInput] = useState(String(thisYear()));
  const [year, setYear] = useState(thisYear());
  const strip = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = strip.current, cur = el?.querySelector<HTMLElement>('[data-cur="true"]');
    if (el && cur) el.scrollLeft = cur.offsetLeft - (el.clientWidth - cur.offsetWidth) / 2;
  }, [year, res, nav.tab]);

  if (!profile) {
    return (
      <section className={ui.card}>
        <h2>Bát Tự Tứ Trụ</h2>
        <p>Thêm hồ sơ ngày giờ sinh để lập 4 trụ theo tiết khí, xem Thập Thần, Vượng Suy, Dụng Thần và Đại Vận.</p>
        <button type="button" className={`${ui.btn} ${ui.primary} ${ui.block}`} onClick={() => nav.push({ name: 'profiles.edit' })}>＋ Thêm hồ sơ</button>
      </section>
    );
  }
  if (!res || !res.ok) return <p className={ui.error} role="alert">{res && !res.ok ? birthErrorText(res.errors[0]) : ''}</p>;

  const ch = res.summary.battu.chart;
  const notes = birthNotesText(res.birth.notes);
  const lx = batTuLapXuanNote(ch);
  const look = batTuYearLookup(ch, year);
  const curAge = look.tuoi > 0 ? look.tuoi : null;
  const nh = analyze(toNguHanhChart(ch));
  const cc = cachCucOfBirth(ch, res.birth.input, nh);
  const nhatChuHanh = BTE.HANH5[BTE.CAN_HANH[ch.nhatChu]];
  const nv = noiVang(nh.score.shares);
  const summary: [string, string][] = [
    ['Âm lịch', ch.lunar[0] + '/' + ch.lunar[1] + (ch.lunar[3] ? ' (nhuận)' : '') + '/' + ch.lunar[2]],
    ['Nhật Chủ', CAN[ch.nhatChu] + ' (' + hanhAmDuong(ch.nhatChu) + ')'],
    ['Bát Tự', ch.pillars.map((p) => CAN[p.can] + ' ' + CHI[p.chi]).join(' · ')],
    ['Âm/Dương Nam Nữ', (ch.isDuongCan ? 'Dương ' : 'Âm ') + (profile.gender === 'M' ? 'Nam' : 'Nữ') + ' → ' + (ch.thuanDaiVan ? 'Đại Vận THUẬN' : 'Đại Vận NGHỊCH')],
  ];

  return (
    <div className={ui.stack}>
      {notes && <p className={ui.muted}>{notes}</p>}
      <dl className={s.summary}>
        {summary.map(([k, v]) => <div key={k} className={s.cell} data-wide={k === 'Bát Tự' || k === 'Âm/Dương Nam Nữ'}><dt>{k}</dt><dd>{v}</dd></div>)}
      </dl>
      <SpeakButton id="battu" getCues={() => buildScript('battu', who, { cells: summary, leads: [batTuLead(ch.pillars.findIndex((p) => p.isNhatChu), res.summary.battu.nhatChu)], prose: [cachCucSpeech(cc), thuongLySpeech(ch.nhatChu, ch.monthChiIdx, ch.pillars)], sections: batTuTongKet(ch, thisYear()) })} />
      <ShareButton getCard={() => ({ slug: 'bat-tu', title: 'Bát Tự Tứ Trụ', ...cardWho(profile), groups: [{ cells: summary }], reading: cardReading(batTuTongKet(ch, thisYear())) })} />
      {lx && <p className={ui.info} role="note"><RichText nodes={parseRich(lx)} /></p>}

      <h2 className={ui.sectionTitle}>Tứ Trụ hoàn chỉnh</h2>
      <Pillars ch={ch} focus={cueFocus} />

      <details className={s.fold}>
        <summary><h2 className={ui.sectionTitle}>Hình, xung, hội, hợp</h2><span className={ui.muted}>các chữ kéo đẩy nhau</span></summary>
        <section className={ui.card}><SectionView sections={[quanHeSection(quanHe(ch.pillars.map((x) => x.can), ch.pillars.map((x) => x.chi)), ch.pillars.map((x) => x.can), ch.pillars.map((x) => x.chi))]} /></section>
      </details>

      <h2 className={ui.sectionTitle}>Vượng Suy và Dụng Thần sơ bộ</h2>
      <section className={ui.card}><SectionView sections={[batTuVuongSuy(ch)]} /></section>
      <section className={ui.card}><SectionView sections={[batTuDungThan(ch)]} /></section>

      <NguHanhSection profileId={profile.id} key={ch.pillars.map((x) => x.can + '-' + x.chi).join(',')} ch={ch} nowYear={thisYear()} />

      <h2 className={ui.sectionTitle}>Cách cục theo Tử Bình Chân Thuyên</h2>
      <section className={ui.card}><SectionView sections={[cachCucSection(cc, ch.pillars.map((x) => x.can), ch.monthChiIdx, nh.usefulGod.dung)]} /></section>
      <details className={s.fold}>
        <summary><h2 className={ui.sectionTitle}>Lời sách cho Can ngày theo tháng sinh</h2><span className={ui.muted}>lẽ thường trong phụ lục sách</span></summary>
        <section className={ui.card}><SectionView sections={[thuongLySection(ch.nhatChu, ch.monthChiIdx, cc.dung, ch.pillars)]} /></section>
      </details>

      <details className={s.fold}>
        <summary><h2 className={ui.sectionTitle}>Dòng chảy của khí</h2><span className={ui.muted}>khí bắt đầu và dừng ở đâu</span></summary>
        <section className={ui.card}><SectionView sections={[dongKhiSection(dongKhi(nh.score.shares, nhatChuHanh), nhatChuHanh)]} /></section>
      </details>
      <details className={s.fold}>
        <summary><h2 className={ui.sectionTitle}>Tính tình theo ngũ hành</h2><span className={ui.muted}>gợi ý để tự soi</span></summary>
        <section className={ui.card}><SectionView sections={[tinhTinhSection(nv.noi, nv.vang)]} /></section>
      </details>
      <details className={s.fold}>
        <summary><h2 className={ui.sectionTitle}>Lục thân trong lá số</h2><span className={ui.muted}>trụ nào, sao nào ứng với ai</span></summary>
        <section className={ui.card}><SectionView sections={[lucThanSection(lucThan(ch, profile.gender), profile.gender, lucThanDau(ch, profile.gender))]} /></section>
      </details>

      <h2 className={ui.sectionTitle}>Đại Vận (mỗi chặng 10 năm, khởi từ Trụ Tháng)</h2>
      <div ref={strip} className={s.strip} role="list" aria-label="Các Đại Vận">
        {ch.daiVan.map((d, i) => {
          const start = ch.khoiVanYears + i * 10;
          const cur = curAge != null && curAge >= start && curAge < start + 10;
          return (
            <div key={i} role="listitem" className={s.dv} data-cur={cur} aria-current={cur || undefined}>
              <b>{CAN[d.can]} {CHI[d.chi]}</b><span>{start}–{start + 9} tuổi</span>
            </div>
          );
        })}
      </div>
      <p className={ui.muted}>{batTuKhoiVanNote(ch)}</p>

      <h2 className={ui.sectionTitle}>Tra Lưu Niên theo năm</h2>
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
            ['Tuổi (âm)', look.tuoi > 0 ? look.tuoi + ' tuổi' : '—'],
            ['Lưu Niên', CAN[look.yearCC.can] + ' ' + CHI[look.yearCC.chi]],
            ['Thập Thần Lưu Niên', look.thapThan],
            ['Đại Vận đang đi', look.daiVan ? CAN[look.daiVan.can] + ' ' + CHI[look.daiVan.chi] : '—'],
          ] as [string, string][]).map(([k, v]) => <div key={k} className={s.cell}><dt>{k}</dt><dd>{v}</dd></div>)}
        </dl>
      </section>

      <details className={s.fold}>
        <summary><h2 className={ui.sectionTitle}>Giải thích chỉ số</h2><span className={ui.muted}>6 bài học nhỏ</span></summary>
        <section className={ui.card}><SectionView sections={batTuExplain(ch)} level={4} /></section>
      </details>

      <h2 className={ui.sectionTitle}>Tổng kết</h2>
      <section className={ui.card}><SectionView sections={batTuTongKet(ch, thisYear())} level={4} /></section>

      <section className={s.notes}><SectionView sections={[batTuNotes()]} /></section>

      <p className={ui.muted}>{CULTURAL_NOTE}</p>
    </div>
  );
}
