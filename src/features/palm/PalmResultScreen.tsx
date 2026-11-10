/* Kết quả xem chỉ tay: ảnh thật (ngay sau khi xem) hoặc sơ đồ, tổng kết theo chủ đề, từng mục, so sánh hai tay,
   so với lần xem trước, và lịch sử các lần xem. `id` có thì xem lại đúng lần đó. Câu luận tạm chỉ hiện chữ; Thầy đọc ở bước sau. */
import { useEffect, useMemo, useState } from 'react';
import { analyzePalm, diffHands, type PalmHandInput, type PalmInput } from '../../core';
import { getReading, palmMetas, palmView, type PalmReading } from '../../content/palm/index';
import {
  PALM_DELETE_CONFIRM, PALM_DELETE_ONE_CONFIRM, PALM_DIFF_ADDED, PALM_DIFF_HINT, PALM_DIFF_REMOVED, PALM_DIFF_SAME, PALM_HISTORY_HINT, PALM_HISTORY_TITLE,
  PALM_LINE_NAME, PALM_NOTE, PALM_RESULT_EMPTY, PALM_ROLE_LABEL, PALM_TONE_LABEL, PALM_WHY, palmDate, palmDiffTitle, palmOldNote,
} from '../../content/palm/ui';
import { useApp, useAppCtx, useNav } from '../../app/context';
import { palmHistory, removePalmSession, selectActiveProfile } from '../../state/actions';
import type { PalmLineKey, PalmSession } from '../../state/schema';
import { Segmented } from '../../ui/components/Segmented';
import ui from '../../ui/components/ui.module.css';
import { PALM_LINE_COLOR, PalmDiagram, smoothPath } from './PalmDiagram';
import { dropPhoto, heldPhoto } from './photoMemory';
import s from './palm.module.css';

const handInput = (p: PalmSession): PalmHandInput => ({ answers: p.answers });
const HAND_NAME = { left: 'Tay trái', right: 'Tay phải' } as const;

function Reading({ r }: { r: PalmReading }) {
  const [why, setWhy] = useState(false);
  return (
    <div className={s.item}>
      <p style={{ margin: 0 }}><span className={s.tone} data-tone={r.tone}>{PALM_TONE_LABEL[r.tone]}</span>{r.text}</p>
      <button type="button" className={s.why} aria-expanded={why} onClick={() => setWhy(!why)}>{PALM_WHY}</button>
      {why && <p className={s.feature}>{r.feature}</p>}
    </div>
  );
}

/** Đường chỉ vẽ lên chính ảnh tay vừa chụp (chỉ có ngay sau khi xem, ảnh không được lưu). */
function PalmPhoto({ session, url }: { session: PalmSession; url: string }) {
  const keys = Object.keys(session.lines) as PalmLineKey[];
  const K = 512;
  return (
    <svg className={s.photo} viewBox={`0 0 ${K} ${K}`} role="img" aria-label={`Ảnh bàn tay của bạn với các đường ${keys.map((k) => PALM_LINE_NAME[k]).join(', ')}`}>
      <g transform={session.hand === 'left' ? `translate(${K} 0) scale(-1 1)` : undefined} fill="none" strokeLinecap="round" strokeLinejoin="round">
        <image href={url} x={0} y={0} width={K} height={K} />
        {keys.map((k) => (session.lines[k] ?? []).map((seg, i) => {
          const d = smoothPath(seg.map((p) => ({ x: p.x * K, y: p.y * K })));
          return (
            <g key={k + i}>
              <path d={d} stroke="#fff" strokeWidth={7} opacity={0.55} />
              <path d={d} stroke={PALM_LINE_COLOR[k]} strokeWidth={4} />
            </g>
          );
        }))}
      </g>
    </svg>
  );
}

export function PalmResultScreen({ id }: { id?: string }) {
  const nav = useNav();
  const { store } = useAppCtx();
  const profile = useApp(selectActiveProfile);
  const all = useApp((x) => x.palmSessions);
  const history = useMemo(() => (profile ? palmHistory(all, profile.id) : []), [all, profile]);
  const latest = (role: PalmSession['role']) => history.find((p) => p.role === role);
  const old = id ? history.find((p) => p.id === id) : undefined;
  const current = old ? undefined : latest('current');
  const innate = old ? undefined : latest('innate');
  const shown = old ?? current ?? innate;
  const photo = shown && !old ? heldPhoto(shown.id) : null;
  const [look, setLook] = useState<'photo' | 'art'>('photo');
  // Rời màn kết quả mới nhất là bỏ ảnh khỏi bộ nhớ (màn xem lại lần cũ không giữ ảnh nên không đụng tới)
  useEffect(() => (id ? undefined : dropPhoto), [id]);

  const view = useMemo(() => {
    if (!shown) return null;
    const dominant = shown.answers.Q01 === 'left' ? 'left' : 'right';
    // Chỉ có một tay thì phân tích tay đó như tay hiện tại, không so sánh
    const input: PalmInput = { dominant, method: 'dominant', current: handInput(shown), ...(current && innate ? { innate: handInput(innate) } : {}) };
    return palmView(analyzePalm(input, palmMetas()));
  }, [shown, current, innate]);

  /** Lần trước đó của cùng tay, để so qua thời gian. */
  const previous = shown ? history.filter((p) => p.role === shown.role && p.date < shown.date)[0] : undefined;
  const diff = useMemo(() => {
    if (!shown || !previous) return null;
    const d = diffHands(handInput(shown), handInput(previous), palmMetas());
    const read = (ids: string[]) => ids.map((x) => getReading(x)).filter((r): r is PalmReading => !!r);
    return { added: read(d.added), removed: read(d.removed) };
  }, [shown, previous]);

  if (!shown || !view) {
    return (
      <div className={ui.stack}>
        <p>{PALM_RESULT_EMPTY}</p>
        <button type="button" className={`${ui.btn} ${ui.primary} ${ui.block}`} onClick={() => nav.replace({ name: 'palm' })}>✋ Xem chỉ tay</button>
      </div>
    );
  }

  const wipe = () => {
    if (old) {
      if (!window.confirm(PALM_DELETE_ONE_CONFIRM)) return;
      removePalmSession(store, old.id);
    } else {
      if (!window.confirm(PALM_DELETE_CONFIRM)) return;
      for (const p of history) removePalmSession(store, p.id);
      dropPhoto();
    }
    nav.back();
  };
  const latestIds = new Set([current?.id, innate?.id]);
  const earlier = old ? [] : history.filter((p) => !latestIds.has(p.id));

  return (
    <div className={ui.stack}>
      {old && <p className={ui.info} role="status">{palmOldNote(old.date)}</p>}
      <p className={ui.muted}>{view.opening}</p>
      <section className={ui.card}>
        <h2>{PALM_ROLE_LABEL[shown.role]}</h2>
        <p className={ui.muted}>{HAND_NAME[shown.hand]} · xem ngày {palmDate(shown.date)}</p>
        {photo && (
          <div className={s.viewSwitch}>
            <Segmented<'photo' | 'art'> label="Cách xem" hideLabel value={look} onChange={setLook} options={[{ value: 'photo', label: 'Ảnh tay của bạn' }, { value: 'art', label: 'Tranh sơ đồ' }]} />
          </div>
        )}
        {photo && look === 'photo' ? <PalmPhoto session={shown} url={photo} /> : <PalmDiagram session={shown} />}
        {photo && look === 'photo' && <p className={ui.muted}>Ảnh chỉ hiện lúc này và không được lưu. Mở lại kết quả sau sẽ thấy tranh sơ đồ.</p>}
        {current && innate && <p className={ui.muted}>Có cả hai tay nên phần so sánh nằm ở cuối kết quả.</p>}
      </section>

      {view.topics.length > 0 && (
        <section className={ui.stack} aria-label="Tổng kết theo chủ đề">
          <h2 className={ui.sectionTitle}>Tổng kết theo chủ đề</h2>
          <div className={ui.card}>
            {view.topics.map((t) => (
              <div key={t.topic} className={s.item}>
                <h3 className={s.topicTitle}>{t.title}</h3>
                <ul className={s.topicLines}>{t.lines.map((l, i) => <li key={i}>{l}</li>)}</ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {view.sections.map((sec) => (
        <section key={sec.key} className={ui.stack} aria-label={sec.title}>
          <h2 className={ui.sectionTitle}>{sec.title}</h2>
          <div className={ui.card}>{sec.items.map((r) => <Reading key={r.id} r={r} />)}</div>
        </section>
      ))}

      {view.compare && view.compare.length > 0 && (
        <section className={ui.stack} aria-label="So sánh hai tay">
          <h2 className={ui.sectionTitle}>So sánh hai tay</h2>
          {view.compare.map((c) => (
            <div key={c.key} className={ui.card}>
              <h3 className={s.topicTitle}>{c.title}</h3>
              {c.items.map((r) => <Reading key={r.id} r={getReading(r.id)!} />)}
            </div>
          ))}
        </section>
      )}

      {previous && diff && (
        <section className={ui.stack} aria-label={palmDiffTitle(previous.date)}>
          <h2 className={ui.sectionTitle}>{palmDiffTitle(previous.date)}</h2>
          <div className={ui.card}>
            {!diff.added.length && !diff.removed.length && <p>{PALM_DIFF_SAME}</p>}
            {diff.added.length > 0 && <h3 className={s.topicTitle}>{PALM_DIFF_ADDED}</h3>}
            {diff.added.map((r) => <Reading key={'+' + r.id} r={r} />)}
            {diff.removed.length > 0 && <h3 className={s.topicTitle}>{PALM_DIFF_REMOVED}</h3>}
            {diff.removed.map((r) => <Reading key={'-' + r.id} r={r} />)}
            <p className={ui.muted}>{PALM_DIFF_HINT}</p>
          </div>
        </section>
      )}

      <p>{view.closing}</p>
      <p className={ui.muted}>{PALM_NOTE}</p>

      {earlier.length > 0 && (
        <section className={ui.stack} aria-label={PALM_HISTORY_TITLE}>
          <h2 className={ui.sectionTitle}>{PALM_HISTORY_TITLE}</h2>
          <p className={ui.muted}>{PALM_HISTORY_HINT}</p>
          <ul className={s.machineList}>
            {earlier.map((p) => (
              <li key={p.id} className={s.machineRow}>
                <button type="button" className={s.historyItem} onClick={() => nav.push({ name: 'palm.result', id: p.id })}>
                  <span>{palmDate(p.date)} · {HAND_NAME[p.hand]} ({p.role === 'current' ? 'tay thuận' : 'tay còn lại'})</span>
                  <span aria-hidden="true">›</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!old && <button type="button" className={`${ui.btn} ${ui.block}`} onClick={() => nav.replace({ name: 'palm' })}>Xem tay khác hoặc xem lại</button>}
      <button type="button" className={`${ui.btn} ${ui.danger} ${ui.block}`} onClick={wipe}>{old ? 'Xoá lần xem này' : 'Xoá mọi kết quả chỉ tay'}</button>
    </div>
  );
}
