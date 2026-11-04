/* Màn hình Nạp Âm & hợp hôn (Phase 3.5): chọn 1–2 hồ sơ hoặc nhập tay (có thể chỉ nhập năm), tra theo NĂM ÂM LỊCH (đổi năm vào
   Tết), so sánh hai người kèm các ngoại lệ của NapAmEngine.relation. Cặp hồ sơ được lưu ở tools.napAmPair. */
import { useEffect, useState } from 'react';
import { napAmCompat, napAmPersonOfDate, resolveBirth, resolveNapAmInput, type NapAmPerson } from '../../../core';
import { birthErrorText } from '../../../content/common/birth';
import { CULTURAL_NOTE } from '../../../content/common/notes';
import { parseRich } from '../../../content/rich';
import { napAmExplain, napAmInputErrorText, napAmNotes, napAmPersonCells } from '../../../content/napam/explain';
import { napAmRelationText } from '../../../content/napam/relation';
import { napAmTongKet } from '../../../content/napam/tongket';
import { setNapAmPair } from '../../../state/actions';
import type { Profile } from '../../../state/schema';
import { useApp, useAppCtx } from '../../../app/context';
import { RichText } from '../../../ui/components/RichText';
import { SectionView } from '../../../ui/components/SectionView';
import { SpeakButton } from '../../../ui/components/SpeakButton';
import { cellsSpeech, richSpeech, sectionsSpeech, speechOf } from '../../../content/speech';
import ui from '../../../ui/components/ui.module.css';
import { Banner } from '../Banner';
import s from '../phongthuy.module.css';

const MANUAL = '__manual', NONE = '__none';
type Raw = [string, string, string];
const BLANK: Raw = ['', '', ''];
type Outcome = { person: NapAmPerson } | { error: string } | null;

function resolveChoice(choice: string, profile: Profile | undefined, applied: Raw, label: string): Outcome {
  if (profile) {
    const b = resolveBirth(profile);
    return b.ok ? { person: napAmPersonOfDate(b.solar.dd, b.solar.mm, b.solar.yy) } : { error: birthErrorText(b.errors[0]) };
  }
  if (choice !== MANUAL || applied.every((x) => x.trim() === '')) return null;
  const r = resolveNapAmInput(...applied);
  return r.ok ? { person: r.person } : { error: napAmInputErrorText(r.error, label) };
}

function PersonField({ label, value, onChange, profiles, optional, raw, onRaw }: {
  label: string; value: string; onChange(v: string): void; profiles: readonly Profile[]; optional?: boolean; raw: Raw; onRaw(r: Raw): void;
}) {
  return (
    <div className={ui.stack}>
      <label className={ui.field}>
        <span className={ui.label}>{label}</span>
        <select className={ui.input} value={value} onChange={(e) => onChange(e.target.value)}>
          {optional && <option value={NONE}>— Chỉ xem 1 người —</option>}
          {profiles.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          <option value={MANUAL}>Nhập ngày sinh khác…</option>
        </select>
      </label>
      {value === MANUAL && (
        <div className={s.dmyRow}>
          {(['Ngày', 'Tháng', 'Năm (dương lịch)'] as const).map((lbl, i) => (
            <label key={lbl} className={ui.field}>
              <span className={ui.label}>{lbl}</span>
              <input
                className={ui.input} type="number" inputMode="numeric" aria-label={label + ' — ' + lbl} value={raw[i]}
                onChange={(e) => { const n = [...raw] as Raw; n[i] = e.target.value; onRaw(n); }}
              />
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

function PersonSummary({ title, person }: { title: string; person: NapAmPerson }) {
  return (
    <>
      <h2 className={ui.sectionTitle}>{title}</h2>
      <dl className={s.summary}>
        {napAmPersonCells(person).map(([k, v]) => <div key={k} className={s.cell}><dt>{k}</dt><dd><RichText nodes={parseRich(v)} /></dd></div>)}
      </dl>
    </>
  );
}

export function NapAmScreen() {
  const { store } = useAppCtx();
  const profiles = useApp((x) => x.profiles);
  const activeId = useApp((x) => x.activeProfileId);
  const saved = useApp((x) => x.tools.napAmPair);
  const [pick1, setPick1] = useState(() => saved?.[0] ?? activeId ?? MANUAL);
  const [pick2, setPick2] = useState(() => saved?.[1] ?? NONE);
  const [raw1, setRaw1] = useState<Raw>(BLANK);
  const [raw2, setRaw2] = useState<Raw>(BLANK);
  const [applied, setApplied] = useState<[Raw, Raw]>([BLANK, BLANK]);

  // Đổi người đang xem ở thanh trên thì Người 1 đổi theo
  const [prevActive, setPrevActive] = useState(activeId);
  if (activeId !== prevActive) {
    setPrevActive(activeId);
    setPick1(activeId ?? MANUAL);
  }

  // Hồ sơ đã chọn có thể vừa bị xoá ở màn hình khác
  const p1 = profiles.find((p) => p.id === pick1), p2 = profiles.find((p) => p.id === pick2);
  const c1 = p1 || pick1 === MANUAL ? pick1 : (activeId ?? MANUAL);
  const c2 = p2 || pick2 === MANUAL ? pick2 : NONE;
  const prof1 = profiles.find((p) => p.id === c1);

  useEffect(() => {
    const pair: [string, string] | undefined = prof1 && p2 ? [prof1.id, p2.id] : undefined;
    if (pair?.[0] !== saved?.[0] || pair?.[1] !== saved?.[1]) setNapAmPair(store, pair);
  }, [prof1, p2, saved, store]);

  const a = resolveChoice(c1, prof1, applied[0], 'Người 1');
  const b = resolveChoice(c2, p2, applied[1], 'Người 2');
  const hasManual = c1 === MANUAL || c2 === MANUAL;
  const error = (a && 'error' in a && a.error) || (b && 'error' in b && b.error) || null;
  const x1 = !error && a && 'person' in a ? a.person : null;
  const x2 = !error && b && 'person' in b ? b.person : null;
  const compat = x1 && x2 ? napAmCompat(x1.res, x2.res) : null;
  const nameOf = (n: string, p?: Profile) => (p ? n + ' · ' + p.name : n);

  return (
    <div className={ui.stack}>
      <section className={ui.card} aria-labelledby="na-form-title">
        <h2 id="na-form-title">Mạng theo năm sinh & xem hợp hôn</h2>
        <p className={ui.muted}>Nạp Âm là lớp Ngũ hành dân gian tính theo NĂM SINH, khác với Cục Nạp Âm dùng để an sao ở tab Tử Vi (tính từ Can Chi Cung Mệnh, phụ thuộc cả tháng và giờ sinh).</p>
        <PersonField label="Người 1" value={c1} onChange={setPick1} profiles={profiles} raw={raw1} onRaw={setRaw1} />
        <PersonField label="Người 2" value={c2} onChange={setPick2} profiles={profiles} optional raw={raw2} onRaw={setRaw2} />
        {hasManual && (
          <>
            <p className={ui.muted}>Nạp Âm tính theo <b>năm âm lịch</b> (đổi năm vào ngày Tết), nên người sinh khoảng tháng 1 – giữa tháng 2 dương lịch có thể thuộc năm âm lịch trước. Nhập đủ ngày/tháng để công cụ tự xác định; nếu chỉ nhập năm thì công cụ dùng đúng năm đó.</p>
            <button type="button" className={`${ui.btn} ${ui.primary} ${ui.block}`} onClick={() => setApplied([raw1, raw2])}>Tra Nạp Âm</button>
          </>
        )}
        {error && <p className={ui.error} role="alert">{error}</p>}
      </section>

      {x1 && (
        <div className={ui.stack} aria-live="polite">
          <SpeakButton
            id="napam"
            getText={() => speechOf(
              'Người 1.', cellsSpeech(napAmPersonCells(x1)),
              x2 && compat ? 'Người 2. ' + cellsSpeech(napAmPersonCells(x2)) + ' ' + richSpeech(napAmRelationText(compat.rel, x1.res, x2.res)) : '',
              sectionsSpeech(napAmTongKet(x1.res, x2 && compat ? { r2: x2.res, compat } : null)),
            )}
          />
          <PersonSummary title={nameOf('Người 1', prof1)} person={x1} />
          {x2 && <PersonSummary title={nameOf('Người 2', p2)} person={x2} />}

          {x2 && compat && (
            <>
              <h2 className={ui.sectionTitle}>So sánh — tham khảo khi xem hợp hôn</h2>
              <Banner id="napam.verdict" tone={compat.rel.cls} html={napAmRelationText(compat.rel, x1.res, x2.res)} />
            </>
          )}

          <details className={s.fold}>
            <summary><h2 className={ui.sectionTitle}>Giải thích chỉ số</h2><span className={ui.muted}>3 bài học nhỏ</span></summary>
            <section className={ui.card}><SectionView sections={napAmExplain(x1.res, x2?.res ?? null)} level={4} /></section>
          </details>

          <h2 className={ui.sectionTitle}>Tổng kết</h2>
          <section className={ui.card}><SectionView sections={napAmTongKet(x1.res, x2 && compat ? { r2: x2.res, compat } : null)} level={4} /></section>

          <section className={s.notes}><SectionView sections={[napAmNotes()]} /></section>
        </div>
      )}
      <p className={ui.muted}>{CULTURAL_NOTE}</p>
    </div>
  );
}
