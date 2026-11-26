/* Xem ngày tốt xấu (ARCHITECTURE mục 17): một ngày (mặc định hôm nay), lịch tháng tô theo mức ngày, tìm ngày hợp một việc. */
import { useMemo, useState } from 'react';
import { LySoUtil, dayInfo, findDays, monthDays, profileSummary, tuoiChi, viecVerdict, TRUC_VIEC, VIEC_ORDER, type DayInfo, type SolarDay, type ViecId } from '../../core';
import {
  FIND_NONE, GRADE_TONE, GRADE_VI, VERDICT_VI, VIEC_VI, TRUC_VI, WEEKDAY_VI, XEMNGAY_INTRO, XEMNGAY_NO_PROFILE, XEMNGAY_PRACTICAL,
  XEMNGAY_RULE_NOTE, findTitle, hoursLine, lunarLine, solarLine, thanLine, tuoiLine, viecLine,
} from '../../content/xemngay';
import { CULTURAL_NOTE } from '../../content/common/notes';
import { useApp } from '../../app/context';
import { selectActiveProfile } from '../../state/actions';
import ui from '../../ui/components/ui.module.css';
import s from './xemngay.module.css';

const FIND_RANGE = 30;
const todayOf = (now = new Date()): SolarDay => ({ dd: now.getDate(), mm: now.getMonth() + 1, yy: now.getFullYear() });
const same = (a: SolarDay, b: SolarDay) => a.dd === b.dd && a.mm === b.mm && a.yy === b.yy;
const shift = (d: SolarDay, n: number): SolarDay => { const [dd, mm, yy] = LySoUtil.shiftSolar(d.dd, d.mm, d.yy, n); return { dd, mm, yy }; };
const iso = (d: SolarDay) => `${d.yy}-${LySoUtil.pad2(d.mm)}-${LySoUtil.pad2(d.dd)}`;
/** Năm ngoài khoảng lịch âm của app thì không nhận. */
const MIN_YEAR = 1900, MAX_YEAR = 2199;

const gradeOf = (d: DayInfo) => d.person?.grade ?? d.grade;

export function XemNgayScreen() {
  const profile = useApp(selectActiveProfile);
  const birthChi = useMemo(() => {
    if (!profile) return undefined;
    const r = profileSummary(profile);
    return r.ok ? tuoiChi(r.birth.lunar.year) : undefined;
  }, [profile]);

  const today = todayOf();
  const [day, setDay] = useState<SolarDay>(today);
  const [month, setMonth] = useState({ mm: today.mm, yy: today.yy });
  const [viec, setViec] = useState<ViecId>('sam-sua');

  const info = useMemo(() => dayInfo(day.dd, day.mm, day.yy, birthChi), [day, birthChi]);
  const grid = useMemo(() => monthDays(month.mm, month.yy, birthChi), [month, birthChi]);
  const found = useMemo(() => findDays(day, FIND_RANGE, viec, birthChi), [day, viec, birthChi]);

  const pick = (d: SolarDay) => {
    if (d.yy < MIN_YEAR || d.yy > MAX_YEAR) return;
    setDay(d);
    setMonth({ mm: d.mm, yy: d.yy });
  };
  const onDateInput = (v: string) => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
    if (!m) return;
    const d = { yy: +m[1], mm: +m[2], dd: +m[3] };
    if (LySoUtil.validSolar(d.dd, d.mm, d.yy)) pick(d);
  };
  const moveMonth = (n: number) => {
    const t = month.mm - 1 + n;
    const yy = month.yy + Math.floor(t / 12);
    if (yy >= MIN_YEAR && yy <= MAX_YEAR) setMonth({ mm: ((t % 12) + 12) % 12 + 1, yy });
  };

  const g = gradeOf(info);
  const lead = (grid[0].weekday + 6) % 7; // lịch bắt đầu từ thứ Hai

  return (
    <div className={ui.stack}>
      <section className={ui.card} aria-labelledby="xn-day">
        <div className={s.dateBar}>
          <button type="button" className={s.navBtn} aria-label="Ngày trước" onClick={() => pick(shift(day, -1))}>‹</button>
          <label className={s.dateField}>
            <span className={ui.label}>Chọn ngày dương lịch</span>
            <input className={ui.input} type="date" value={iso(day)} min={`${MIN_YEAR}-01-01`} max={`${MAX_YEAR}-12-31`} onChange={(e) => onDateInput(e.target.value)} />
          </label>
          <button type="button" className={s.navBtn} aria-label="Ngày sau" onClick={() => pick(shift(day, 1))}>›</button>
        </div>
        {!same(day, today) && <button type="button" className={`${ui.btn} ${ui.ghost}`} onClick={() => pick(today)}>Về hôm nay</button>}

        <h2 id="xn-day" className={s.dayTitle}>{same(day, today) ? 'Hôm nay, ' : ''}{solarLine(info)}</h2>
        <p className={ui.muted}>{lunarLine(info)}</p>
        <p className={s.grade} data-tone={GRADE_TONE[g]}>{GRADE_VI[g]}{info.person ? ' với tuổi của hồ sơ' : ''}</p>
        <p>{thanLine(info)}</p>
        <p>{TRUC_VI[info.truc].text}</p>
        <p>{tuoiLine(info)}</p>
        {!info.person && <p className={ui.muted}>{XEMNGAY_NO_PROFILE}</p>}
        <p className={ui.muted}>{hoursLine(info)}</p>
      </section>

      <section className={ui.card} aria-labelledby="xn-viec">
        <h2 id="xn-viec" className={ui.sectionTitle}>Việc trong ngày này</h2>
        <ul className={s.viecList}>
          {VIEC_ORDER.map((v) => {
            const verdict = viecVerdict(info, v);
            return (
              <li key={v} className={s.viecRow}>
                <span className={s.verdict} data-verdict={verdict}>{VERDICT_VI[verdict]}</span>
                <span>{viecLine(info, v, verdict)}</span>
              </li>
            );
          })}
        </ul>
      </section>

      <section className={ui.card} aria-labelledby="xn-find">
        <h2 id="xn-find" className={ui.sectionTitle}>{findTitle(FIND_RANGE)}</h2>
        <div className={s.chips} role="radiogroup" aria-label="Chọn việc cần xem ngày">
          {VIEC_ORDER.map((v) => (
            <button key={v} type="button" role="radio" aria-checked={viec === v} className={s.chip} onClick={() => setViec(v)}>{VIEC_VI[v]}</button>
          ))}
        </div>
        {found.length === 0 ? <p className={ui.muted}>{FIND_NONE}</p> : (
          <ul className={s.foundList}>
            {found.map((d) => (
              <li key={iso(d.date)}>
                <button type="button" className={s.foundBtn} aria-current={same(d.date, day) ? 'date' : undefined} onClick={() => pick(d.date)}>
                  <span className={s.foundDate}>{solarLine(d)}</span>
                  <span className={ui.muted}>{lunarLine(d)} · trực {TRUC_VI[d.truc].name}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        <p className={ui.muted}>Trực hợp việc này: {Object.entries(TRUC_VIEC).filter(([, t]) => t.nen.includes(viec)).map(([k]) => TRUC_VI[k as keyof typeof TRUC_VI].name).join(', ')}.</p>
      </section>

      <section className={ui.card} aria-labelledby="xn-month">
        <div className={s.monthBar}>
          <button type="button" className={s.navBtn} aria-label="Tháng trước" onClick={() => moveMonth(-1)}>‹</button>
          <h2 id="xn-month" className={s.monthTitle}>Tháng {month.mm}/{month.yy}</h2>
          <button type="button" className={s.navBtn} aria-label="Tháng sau" onClick={() => moveMonth(1)}>›</button>
        </div>
        <div className={s.grid}>
          <div className={s.week} aria-hidden="true">
            {[1, 2, 3, 4, 5, 6, 0].map((w) => <span key={w} className={s.wd}>{w === 0 ? 'CN' : `T${w + 1}`}</span>)}
          </div>
          <div className={s.cells}>
            {Array.from({ length: lead }, (_, i) => <span key={`e${i}`} aria-hidden="true" />)}
            {grid.map((d) => {
              const dg = gradeOf(d);
              return (
                <button
                  key={d.date.dd} type="button" className={s.cell} data-tone={GRADE_TONE[dg]}
                  aria-pressed={same(d.date, day)} aria-current={same(d.date, today) ? 'date' : undefined}
                  aria-label={`${solarLine(d)}, ${lunarLine(d)}, ${GRADE_VI[dg]}`}
                  onClick={() => pick(d.date)}
                >
                  <span className={s.cellDay}>{d.date.dd}</span>
                  <span className={s.cellLunar}>{d.lunar.day === 1 ? `${d.lunar.day}/${d.lunar.month}` : d.lunar.day}</span>
                </button>
              );
            })}
          </div>
        </div>
        <p className={s.legend}>
          <span><i data-tone="ok" />{GRADE_VI.dep}</span>
          <span><i data-tone="mid" />{GRADE_VI.thuong}</span>
          <span><i data-tone="warn" />{GRADE_VI.tranh}</span>
        </p>
      </section>

      <section className={ui.card}>
        <p>{XEMNGAY_INTRO}</p>
        <p className={ui.muted}>{XEMNGAY_RULE_NOTE}</p>
        <p className={ui.muted}>{XEMNGAY_PRACTICAL}</p>
        <p className={ui.muted}>{CULTURAL_NOTE}</p>
      </section>
    </div>
  );
}
