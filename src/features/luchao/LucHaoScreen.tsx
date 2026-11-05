/* Màn hình Lục Hào (Phase 3.4): chọn ngày xem, cách gieo, việc hỏi; gieo (rung nhẹ khi xong); quẻ chủ, quẻ biến,
   luận đoán, giải thích, tổng kết. Quẻ gần nhất được lưu (tools.lucHaoLastCast) và GIỮ NGUYÊN khi đổi việc hỏi/ngày xem. */
import { useMemo, useState } from 'react';
import { DUNG_THAN_KEYS, LucHaoEngine, LySoUtil, castContext, castHexagram, haoViews, randomTosses, type DungThanKey } from '../../core';
import { CULTURAL_NOTE } from '../../content/common/notes';
import { parseRich } from '../../content/rich';
import { lucHaoExplain, lucHaoNotes, lucHaoTossBanner, lucHaoVerdict } from '../../content/luchao/explain';
import { lucHaoTongKet } from '../../content/luchao/tongket';
import { setLucHaoCast, setLucHaoDate } from '../../state/actions';
import { tapLight } from '../../platform/haptics';
import { useApp, useAppCtx } from '../../app/context';
import { RichText } from '../../ui/components/RichText';
import { Segmented } from '../../ui/components/Segmented';
import { SectionView } from '../../ui/components/SectionView';
import { SpeakButton } from '../../ui/components/SpeakButton';
import { buildScript, lucHaoLead } from '../reader/script';
import { useCueFocus, useWho } from '../reader/hooks';
import { cellsSpeech, sectionsSpeech, speechOf } from '../../content/speech';
import ui from '../../ui/components/ui.module.css';
import { BienCard, HaoList, HexagramDiagram } from './Hexagram';
import s from './luchao.module.css';

const { CAN, CHI } = LucHaoEngine;
const DT_OPTION: Record<DungThanKey, string> = {
  'the': 'Bản thân, việc chung (Thế)', 'Phụ Mẫu': 'Cha mẹ, nhà cửa, giấy tờ (Phụ Mẫu)', 'Huynh Đệ': 'Anh chị em, bạn bè (Huynh Đệ)',
  'Tử Tôn': 'Con cái, bệnh tật, bình an (Tử Tôn)', 'Thê Tài': 'Vợ, tiền bạc, làm ăn (Thê Tài)', 'Quan Quỷ': 'Chồng, công danh, kiện tụng (Quan Quỷ)',
  'ung': 'Đối tượng khác / kết quả (Ứng)',
};
const TOSS_OPTS: [number, string][] = [[6, '6 – Lão Âm (động)'], [7, '7 – Thiếu Dương'], [8, '8 – Thiếu Âm'], [9, '9 – Lão Dương (động)']];
const HAO_LABELS = ['Hào 1 (Sơ)', 'Hào 2 (Nhị)', 'Hào 3 (Tam)', 'Hào 4 (Tứ)', 'Hào 5 (Ngũ)', 'Hào 6 (Thượng)'];
const SEASON_NAME = { xuan: 'Xuân', ha: 'Hạ', thu: 'Thu', dong: 'Đông', tuquy: 'Tứ quý' } as const;
const today = (): [number, number, number] => { const t = new Date(); return [t.getDate(), t.getMonth() + 1, t.getFullYear()]; };

export function LucHaoScreen() {
  const { store } = useAppCtx();
  const who = useWho();
  const cueFocus = useCueFocus('luchao');
  const cast = useApp((x) => x.tools.lucHaoLastCast);
  const [method, setMethod] = useState<'random' | 'manual'>(cast?.method ?? 'random');
  const [key, setKey] = useState<DungThanKey>('the');
  const [dateIn, setDateIn] = useState(() => (cast?.date ?? today()).map(String) as [string, string, string]);
  const [manual, setManual] = useState<number[]>(() => (cast?.method === 'manual' ? [...cast.tosses] : [7, 7, 7, 7, 7, 7]));

  const date = dateIn.map((x) => parseInt(x, 10)) as [number, number, number];
  const dateOk = LySoUtil.validSolar(...date);
  const result = useMemo(() => (cast && dateOk ? { r: castHexagram(cast.tosses), ctx: castContext(...date) } : null), [cast, dateOk, date[0], date[1], date[2]]); // eslint-disable-line react-hooks/exhaustive-deps

  const theHao = result?.r.hao.find((h) => h.isThe);
  const summary: [string, string][] = result ? [
    ['Quẻ chủ', result.r.name],
    ['Cung / Bước', result.r.cung + ' — ' + result.r.step],
    ['Thế / Ứng', 'Hào ' + result.r.theHao + ' / Hào ' + result.r.ungHao],
    ['Nhật thần (ngày xem)', CAN[result.ctx.nhat.can] + ' ' + CHI[result.ctx.nhat.chi]],
    ['Nguyệt lệnh (tháng xem)', CHI[result.ctx.thangChi] + ' — mùa ' + SEASON_NAME[result.ctx.season]],
  ] : [];

  const setDatePart = (i: number, v: string) => {
    const next = [...dateIn] as [string, string, string];
    next[i] = v;
    setDateIn(next);
    const d = next.map((x) => parseInt(x, 10)) as [number, number, number];
    if (cast && LySoUtil.validSolar(...d)) setLucHaoDate(store, d);
  };
  const doCast = (tosses: number[], m: 'random' | 'manual') => {
    setLucHaoCast(store, tosses, undefined, { method: m, date: dateOk ? date : today() });
    void tapLight();
  };

  return (
    <div className={ui.stack}>
      <section className={ui.card} aria-labelledby="kd-form-title">
        <h2 id="kd-form-title">Gieo quẻ</h2>
        <div className={s.dateRow}>
          {(['Ngày xem', 'Tháng', 'Năm'] as const).map((lbl, i) => (
            <label key={lbl} className={ui.field}>
              <span className={ui.label}>{lbl}</span>
              <input className={ui.input} type="number" inputMode="numeric" value={dateIn[i]} aria-invalid={!dateOk} onChange={(e) => setDatePart(i, e.target.value)} />
            </label>
          ))}
          <button type="button" className={ui.btn} title="Đặt ngày xem quẻ là hôm nay" onClick={() => { const t = today(); setDateIn(t.map(String) as [string, string, string]); if (cast) setLucHaoDate(store, t); }}>📅 Hôm nay</button>
        </div>
        {!dateOk && <p className={ui.error} role="alert">Ngày xem quẻ {dateIn.join('/')} không tồn tại trên lịch dương — vui lòng kiểm tra lại.</p>}
        <Segmented<'random' | 'manual'> label="Cách gieo" value={method} onChange={setMethod} options={[{ value: 'random', label: 'Gieo ngẫu nhiên' }, { value: 'manual', label: 'Nhập tay' }]} />
        <label className={ui.field}>
          <span className={ui.label}>Hỏi về việc gì (chọn Dụng Thần)</span>
          <select className={ui.input} value={key} onChange={(e) => setKey(e.target.value as DungThanKey)}>
            {DUNG_THAN_KEYS.map((k) => <option key={k} value={k}>{DT_OPTION[k]}</option>)}
          </select>
        </label>
        {method === 'manual' && (
          <div className={s.manualGrid}>
            {HAO_LABELS.map((lbl, i) => (
              <label key={lbl} className={ui.field}>
                <span className={ui.label}>{lbl}</span>
                <select className={ui.input} value={manual[i]} onChange={(e) => { const m = [...manual]; m[i] = parseInt(e.target.value, 10); setManual(m); }}>
                  {TOSS_OPTS.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
                </select>
              </label>
            ))}
          </div>
        )}
        <p className={ui.muted}>Đồng xu: mặt chữ=2đ(Âm), mặt hình=3đ(Dương). Tổng 6=Lão Âm động, 7=Thiếu Dương, 8=Thiếu Âm, 9=Lão Dương động.</p>
        {method === 'random'
          ? <button type="button" className={`${ui.btn} ${ui.primary} ${ui.block}`} onClick={() => doCast(randomTosses(), 'random')}>{cast ? '🎲 Gieo quẻ mới' : '🎲 Gieo quẻ'}</button>
          : <button type="button" className={`${ui.btn} ${ui.primary} ${ui.block}`} onClick={() => doCast(manual, 'manual')}>Lập quẻ từ 6 số đã nhập</button>}
      </section>

      {!cast && <p className={ui.muted}>Chọn việc muốn hỏi rồi bấm gieo. Quẻ vừa gieo được giữ lại — đổi việc hỏi hay ngày xem không làm gieo lại.</p>}

      {cast && result && (
        <div className={ui.stack} aria-live="polite">
          <dl className={s.summary}>
            {summary.map(([k, v]) => <div key={k} className={s.cell} data-wide={k === 'Nguyệt lệnh (tháng xem)'}><dt>{k}</dt><dd>{v}</dd></div>)}
          </dl>
          {result && <SpeakButton id="luchao" getCues={() => buildScript('luchao', who, { cells: summary, leads: theHao ? [lucHaoLead(theHao.idx, result.r.theHao)] : [], sections: [lucHaoVerdict(result.r, result.ctx, key), ...lucHaoTongKet(result.r, result.ctx, key)] })} />}
          {cast.method === 'random' && <p className={ui.info}><RichText nodes={parseRich(lucHaoTossBanner(cast.tosses))} /></p>}

          <h2 className={ui.sectionTitle}>Quẻ chủ</h2>
          <div className={s.diagramRow}>
            <HexagramDiagram r={result.r} />
            <HaoList views={haoViews(result.r, result.ctx, key)} focus={cueFocus} />
          </div>

          {result.r.bien && <><h2 className={ui.sectionTitle}>Quẻ biến</h2><BienCard r={result.r} /></>}

          <h2 className={ui.sectionTitle}>Luận đoán</h2>
          <section className={ui.card}><SectionView sections={[lucHaoVerdict(result.r, result.ctx, key)]} /></section>

          <details className={s.fold}>
            <summary><h2 className={ui.sectionTitle}>Giải thích chỉ số</h2><span className={ui.muted}>6 bài học nhỏ</span></summary>
            <section className={ui.card}><SectionView sections={lucHaoExplain(result.r, key)} level={4} /></section>
          </details>

          <h2 className={ui.sectionTitle}>Tổng kết</h2>
          <section className={ui.card}><SectionView sections={lucHaoTongKet(result.r, result.ctx, key)} level={4} /></section>

          <section className={s.notes}><SectionView sections={[lucHaoNotes()]} /></section>
        </div>
      )}

      <p className={ui.muted}>{CULTURAL_NOTE}</p>
    </div>
  );
}
