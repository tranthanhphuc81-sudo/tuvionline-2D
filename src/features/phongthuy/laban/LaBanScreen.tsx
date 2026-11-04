/* Màn hình La Bàn (Phase 4.2): vòng 8 hướng tô màu theo Mệnh Quái của hồ sơ đang xem, kim cố định, số độ, tên hướng, sao Du Niên.
   Tự dùng cảm biến, tự chuyển xoay tay kèm chẩn đoán nếu không có. Cảm biến chỉ chạy khi `active` (đang nhìn thấy màn hình này). */
import { useEffect, useMemo, useRef, useState } from 'react';
import { batTrachReading, compassTrust, laBanSectors, normDeg, resolveBirth, sectorOf, smoothHeading } from '../../../core';
import {
  LABAN_FAILURE, LABAN_FOOT, LABAN_INTRO, LABAN_MANUAL_HINT, LABAN_NO_PROFILE, LABAN_STATUS, LABAN_TILTED,
  laBanCalibrateText, laBanCells, laBanLessons, laBanVerdict, type LaBanFailure,
} from '../../../content/laban/explain';
import { birthErrorText } from '../../../content/common/birth';
import { CULTURAL_NOTE } from '../../../content/common/notes';
import { keepScreenOn, startCompass, type CompassReading } from '../../../platform/compass';
import { selectActiveProfile, setLaBanCalib } from '../../../state/actions';
import { useApp, useAppCtx } from '../../../app/context';
import { SectionView } from '../../../ui/components/SectionView';
import { Segmented } from '../../../ui/components/Segmented';
import ui from '../../../ui/components/ui.module.css';
import { Banner } from '../Banner';
import s from '../phongthuy.module.css';
import { Dial } from './Dial';

type Mode = 'sensor' | 'manual';
const NO_DATA_MS = 3000;
/** Không vẽ lại khi kim đổi dưới ngưỡng này, để số độ không rung. */
const DEADBAND_DEG = 0.4;
const angleGap = (a: number, b: number) => { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };

export function LaBanScreen({ active }: { active: boolean }) {
  const { store } = useAppCtx();
  const profile = useApp(selectActiveProfile);
  const calib = useApp((x) => x.tools.laBanCalib ?? 0);
  const [mode, setMode] = useState<Mode>('sensor');
  const [heading, setHeading] = useState(0);
  const [live, setLive] = useState(false);
  const [failure, setFailure] = useState<LaBanFailure | null>(null);
  const [signal, setSignal] = useState<Pick<CompassReading, 'accuracy' | 'headingErrorDeg' | 'tilted'>>({ accuracy: null, headingErrorDeg: null, tilted: false });
  const [degInput, setDegInput] = useState('0');
  const [calibInput, setCalibInput] = useState(String(calib));

  const calibRef = useRef(calib);
  calibRef.current = calib;

  useEffect(() => {
    if (!active || mode !== 'sensor') return;
    let dead = false, got = false, stop = () => {}, filtered: number | null = null, shown: number | null = null;
    const fail = (why: LaBanFailure) => { if (!dead) { setFailure(why); setMode('manual'); } };
    setLive(false);
    const release = keepScreenOn();
    const timer = setTimeout(() => { if (!got) fail('no-data'); }, NO_DATA_MS);
    void startCompass((r) => {
      if (dead) return;
      if (!got) { got = true; setLive(true); }
      filtered = smoothHeading(filtered, r.heading);
      const next = normDeg(filtered + calibRef.current);
      if (shown === null || angleGap(shown, next) >= DEADBAND_DEG) { shown = next; setHeading(next); setDegInput(String(Math.round(next) % 360)); }
      setSignal((p) => {
        const err = r.headingErrorDeg === null ? null : Math.round(r.headingErrorDeg);
        return p.accuracy === r.accuracy && p.headingErrorDeg === err && p.tilted === r.tilted ? p : { accuracy: r.accuracy, headingErrorDeg: err, tilted: r.tilted };
      });
    }).then((res) => {
      if (dead) { if (res.ok) res.stop(); return; }
      if (res.ok) stop = res.stop; else fail('no-sensor');
    });
    return () => { dead = true; clearTimeout(timer); stop(); release(); };
  }, [active, mode]);

  const birth = useMemo(() => (profile ? resolveBirth(profile) : null), [profile]);
  const reading = useMemo(() => (profile && birth?.ok ? batTrachReading(birth.solar, profile.gender) : null), [profile, birth]);
  const sectors = useMemo(() => laBanSectors(reading?.dn ?? null), [reading]);
  const cur = sectorOf(heading, sectors);

  const setManual = (deg: number) => { const d = normDeg(deg); setHeading(d); setDegInput(String(Math.round(d) % 360)); };
  const onCalib = (v: string) => {
    setCalibInput(v);
    const n = parseInt(v, 10);
    if (Number.isInteger(n) && n >= -45 && n <= 45) setLaBanCalib(store, n);
  };
  const pickMode = (m: Mode) => { setFailure(null); setMode(m); };

  const status = mode === 'manual' ? (failure ? LABAN_FAILURE[failure] : LABAN_STATUS.manual) : live ? LABAN_STATUS.on : LABAN_STATUS.waiting;
  const calibrate = mode === 'sensor' && live && compassTrust(signal.accuracy, signal.headingErrorDeg) === 'calibrate';
  const deg = Math.round(heading) % 360;

  return (
    <div className={ui.stack}>
      <p className={ui.muted}>{LABAN_INTRO}</p>
      <Dial
        sectors={sectors} heading={heading} onDrag={mode === 'manual' ? setManual : undefined}
        label={`La bàn: ${deg} độ, hướng ${cur.huong}, quẻ ${cur.quai}${cur.star ? ', sao ' + cur.star.star : ''}`}
      />
      <div className={s.readout} data-dim={calibrate}>
        <div className={s.deg}>{deg}°</div>
        <div className={s.huong}>{cur.huong} — {cur.quai}</div>
      </div>
      <p className={s.status} data-on={mode === 'sensor' && live} role="status">{status}</p>
      {calibrate && <p className={ui.error} role="alert">{laBanCalibrateText(signal.headingErrorDeg)}</p>}
      {mode === 'sensor' && live && signal.tilted && <p className={ui.info}>{LABAN_TILTED}</p>}

      <Segmented<Mode> label="Cách đọc hướng" hideLabel value={mode} onChange={pickMode} options={[{ value: 'sensor', label: '🧭 Dùng cảm biến' }, { value: 'manual', label: '✋ Xoay tay' }]} />

      {mode === 'manual' ? (
        <section className={ui.card}>
          <div className={s.stepRow}>
            <button type="button" className={ui.btn} aria-label="Giảm 15 độ" onClick={() => setManual(heading - 15)}>−15</button>
            <button type="button" className={ui.btn} aria-label="Giảm 1 độ" onClick={() => setManual(heading - 1)}>−1</button>
            <input
              className={ui.input} type="number" inputMode="numeric" min={0} max={359} aria-label="Hướng (độ)" value={degInput}
              onChange={(e) => { setDegInput(e.target.value); const n = parseInt(e.target.value, 10); if (!Number.isNaN(n)) setHeading(normDeg(n)); }}
            />
            <button type="button" className={ui.btn} aria-label="Tăng 1 độ" onClick={() => setManual(heading + 1)}>+1</button>
            <button type="button" className={ui.btn} aria-label="Tăng 15 độ" onClick={() => setManual(heading + 15)}>+15</button>
          </div>
          <p className={ui.muted}>{LABAN_MANUAL_HINT}</p>
        </section>
      ) : (
        <section className={ui.card}>
          <label className={ui.field}>
            <span className={ui.label}>Hiệu chỉnh (độ)</span>
            <input className={ui.input} type="number" inputMode="numeric" min={-45} max={45} value={calibInput} onChange={(e) => onCalib(e.target.value)} />
          </label>
        </section>
      )}

      <h2 className={ui.sectionTitle}>Hướng hiện tại</h2>
      <dl className={s.summary}>
        {laBanCells(cur, reading?.quai ?? null).map(([k, v]) => <div key={k} className={s.cell}><dt>{k}</dt><dd>{v}</dd></div>)}
      </dl>
      {birth && !birth.ok && <p className={ui.error} role="alert">{birthErrorText(birth.errors[0])}</p>}
      {cur.star
        ? <Banner id="laban.verdict" tone={cur.star.good ? 'ok' : 'warn'} html={laBanVerdict(cur)} />
        : !(birth && !birth.ok) && <p className={ui.info}>{LABAN_NO_PROFILE}</p>}

      <details className={s.fold}>
        <summary><h2 className={ui.sectionTitle}>Cách đọc la bàn này</h2><span className={ui.muted}>4 bài học nhỏ</span></summary>
        <section className={ui.card}><SectionView sections={laBanLessons()} level={4} /></section>
      </details>

      <p className={ui.muted}>{LABAN_FOOT}</p>
      <p className={ui.muted}>{CULTURAL_NOTE}</p>
    </div>
  );
}
