import { TuViEngine, brightness, cungNameFor, tamPhuong, type TuViChart } from '../../core';
import { CUNG_PLAIN, STAR } from '../../content/interp/tuvi';
import { StarName } from './ChartGrid';
import { SpeakButton } from '../../ui/components/SpeakButton';
import { palaceCues } from '../reader/script';
import { useReader, useWho } from '../reader/hooks';
import s from './tuvi.module.css';

const { CHI, mod } = TuViEngine;

function Bright({ star, chi }: { star: string; chi: number }) {
  const br = brightness(star, chi);
  if (!br) return null;
  return <span className={s.bright} data-br={br}>{br > 0 ? ' · cung sáng' : ' · cung tối'}</span>;
}

/** Thẻ chi tiết của cung đang chọn, ngay dưới lá số. */
export function PalaceDetail({ ch, chi, onSelect }: { ch: TuViChart; chi: number; onSelect(c: number): void }) {
  const cung = cungNameFor(ch.menhChi, chi);
  const dh = ch.daiHan.find((d) => d.chi === chi)!;
  const stars = ch.stars[chi] || [];
  const phu = ch.phuTinh[chi] || [];
  const who = useWho();
  const { Ta } = useReader();
  const opp = (chi + 6) % 12;
  // Thầy giảng riêng cung này (ARCHITECTURE 16.1); mã đọc `tuvi.cung` nên lá số tô sáng cung như khi đọc cả bài
  const talk = () => palaceCues(who, {
    chi, chiName: CHI[chi], cung, plain: CUNG_PLAIN[cung], than: chi === ch.thanChi,
    stars: stars.map((x) => ({ name: x, net: STAR[x]?.net, bright: (brightness(x, chi) || undefined) as 1 | -1 | undefined })),
    opposite: { cung: cungNameFor(ch.menhChi, opp), chiName: CHI[opp] }, daiHan: [dh.tuoiStart, dh.tuoiEnd],
  });
  return (
    <section className={s.detail} aria-live="polite" aria-labelledby="tv-detail-title">
      <div className={s.dhead}>
        <button type="button" className={s.navBtn} aria-label="Cung trước" onClick={() => onSelect(mod(chi - 1, 12))}>‹</button>
        <div className={s.dtitle}>
          <h3 id="tv-detail-title">Cung {cung}</h3>
          <span className={s.muted}>tại {CHI[chi]}{chi === ch.thanChi ? ' · có Thân cư' : ''} · Đại hạn {dh.tuoiStart}–{dh.tuoiEnd} tuổi</span>
        </div>
        <button type="button" className={s.navBtn} aria-label="Cung sau" onClick={() => onSelect(mod(chi + 1, 12))}>›</button>
      </div>
      <p className={s.muted}>Cung {cung}: {CUNG_PLAIN[cung]}.</p>
      <SpeakButton key={chi} id="tuvi.cung" label={`${Ta} giảng cung này`} getCues={talk} />
      <dl className={s.kv}>
        <dt>Chính tinh</dt>
        <dd>
          {stars.length ? stars.map((x) => (
            <div key={x}><b><StarName ch={ch} star={x} /></b><Bright star={x} chi={chi} />{STAR[x] && <span className={s.muted}> — {STAR[x].net}</span>}</div>
          )) : <span>Vô chính diệu — xem thêm sao ở cung đối diện ({cungNameFor(ch.menhChi, (chi + 6) % 12)}, {CHI[(chi + 6) % 12]}).</span>}
        </dd>
        <dt>Phụ tinh</dt>
        <dd>{phu.length ? phu.map((x, i) => <span key={x}>{i ? ', ' : ''}<StarName ch={ch} star={x} /></span>) : '—'}</dd>
        <dt>Vòng</dt>
        <dd>{ch.truongSinh[chi]} · <b className={s.jade}>{ch.thaiTue[chi]}</b></dd>
        <dt>Tam phương tứ chính</dt>
        <dd>{tamPhuong(chi).slice(1).map((x) => cungNameFor(ch.menhChi, x) + ' (' + CHI[x] + ')').join(' · ')}</dd>
      </dl>
      <p className={s.hint}>Chạm vào một ô trên lá số để xem cung đó. Đường nối là tam phương tứ chính của cung đang chọn.</p>
    </section>
  );
}

/** Chế độ "Danh sách": 12 thẻ dọc bắt đầu từ Mệnh. */
export function PalaceList({ ch, onPick }: { ch: TuViChart; onPick(c: number): void }) {
  const order = Array.from({ length: 12 }, (_, i) => (ch.menhChi + i) % 12);
  return (
    <ol className={s.plist}>
      {order.map((c) => {
        const dh = ch.daiHan.find((d) => d.chi === c)!;
        const stars = ch.stars[c] || [];
        return (
          <li key={c}>
            <button type="button" className={s.pcard} data-menh={c === ch.menhChi} onClick={() => onPick(c)}>
              <span className={s.phead}>
                <span><b className={s.serif}>{cungNameFor(ch.menhChi, c)}</b> <span className={s.muted}>· {CHI[c]}</span></span>
                <span className={s.muted}>{dh.tuoiStart}–{dh.tuoiEnd} t.{c === ch.thanChi ? ' · Thân' : ''}</span>
              </span>
              <span className={s.pstars}>{stars.length ? stars.map((x) => <StarName key={x} ch={ch} star={x} />) : <span className={s.muted}>vô chính diệu</span>}</span>
              {(ch.phuTinh[c] || []).length > 0 && <span className={s.small}>{(ch.phuTinh[c] || []).join(', ')}</span>}
              <span className={s.small}>{ch.truongSinh[c]} · {ch.thaiTue[c]}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
