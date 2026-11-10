/* Kết quả xem chỉ tay: sơ đồ các nét đã chạm, tổng kết theo chủ đề, rồi từng mục. Câu luận tạm thời chỉ hiện chữ; Thầy đọc ở bước sau. */
import { useMemo, useState } from 'react';
import { analyzePalm, type PalmHandInput, type PalmInput } from '../../core';
import { palmMetas, palmView } from '../../content/palm/index';
import { PALM_DELETE_CONFIRM, PALM_NOTE, PALM_RESULT_EMPTY, PALM_ROLE_LABEL, PALM_TONE_LABEL, PALM_WHY } from '../../content/palm/ui';
import { getReading, type PalmReading } from '../../content/palm/index';
import { useApp, useAppCtx, useNav } from '../../app/context';
import { removePalmSession, selectActiveProfile } from '../../state/actions';
import type { PalmSession } from '../../state/schema';
import ui from '../../ui/components/ui.module.css';
import { PalmDiagram } from './PalmDiagram';
import s from './palm.module.css';

const handInput = (p: PalmSession): PalmHandInput => ({ answers: p.answers });

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

export function PalmResultScreen() {
  const nav = useNav();
  const { store } = useAppCtx();
  const profile = useApp(selectActiveProfile);
  const all = useApp((x) => x.palmSessions);
  const mine = useMemo(() => all.filter((p) => profile && p.profileId === profile.id), [all, profile]);
  const current = mine.find((p) => p.role === 'current');
  const innate = mine.find((p) => p.role === 'innate');
  const shown = current ?? innate;

  const view = useMemo(() => {
    if (!shown) return null;
    const dominant = shown.answers.Q01 === 'left' ? 'left' : 'right';
    // Chưa có tay thuận thì tay còn lại giữ vai "bẩm sinh" một mình: phân tích như tay hiện tại, không so sánh
    const input: PalmInput = { dominant, method: 'dominant', current: handInput(shown), ...(current && innate ? { innate: handInput(innate) } : {}) };
    return palmView(analyzePalm(input, palmMetas()));
  }, [shown, current, innate]);

  if (!shown || !view) {
    return (
      <div className={ui.stack}>
        <p>{PALM_RESULT_EMPTY}</p>
        <button type="button" className={`${ui.btn} ${ui.primary} ${ui.block}`} onClick={() => nav.replace({ name: 'palm' })}>✋ Xem chỉ tay</button>
      </div>
    );
  }

  const wipe = () => {
    if (!window.confirm(PALM_DELETE_CONFIRM)) return;
    for (const p of mine) removePalmSession(store, p.id);
    nav.back();
  };

  return (
    <div className={ui.stack}>
      <p className={ui.muted}>{view.opening}</p>
      <section className={ui.card}>
        <h2>{PALM_ROLE_LABEL[shown.role]}</h2>
        <PalmDiagram session={shown} />
        {current && innate && <p className={ui.muted}>Có cả hai tay nên phần so sánh nằm ở cuối kết quả.</p>}
      </section>

      {view.topics.length > 0 && (
        <section className={ui.stack} aria-labelledby="palm-topics">
          <h2 id="palm-topics" className={ui.sectionTitle}>Tổng kết theo chủ đề</h2>
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

      <p>{view.closing}</p>
      <p className={ui.muted}>{PALM_NOTE}</p>
      <button type="button" className={`${ui.btn} ${ui.block}`} onClick={() => nav.replace({ name: 'palm' })}>Xem tay khác hoặc xem lại</button>
      <button type="button" className={`${ui.btn} ${ui.danger} ${ui.block}`} onClick={wipe}>Xoá kết quả chỉ tay</button>
    </div>
  );
}
