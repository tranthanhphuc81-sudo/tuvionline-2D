import type { Block, RichNode, Section } from '../../content/rich';
import { RichText } from './RichText';
import s from './SectionView.module.css';

const hasList = (nodes: readonly RichNode[]): boolean => nodes.some((n) => typeof n !== 'string' && (n.tag === 'ul' || hasList(n.children)));

/** Vòng 5 hành: nút tròn xếp ngũ giác (kích cỡ theo tỷ lệ), cạnh sinh (+) nét liền, cạnh khắc (−) nét đứt; cạnh liên quan Dụng thần được tô đậm. */
function CycleView({ b }: { b: Extract<Block, { kind: 'cycle' }> }) {
  const C = 110, R = 80;
  const pos = b.nodes.map((_, i) => ({ x: C + R * Math.sin((i * 2 * Math.PI) / 5), y: C - R * Math.cos((i * 2 * Math.PI) / 5) }));
  const aria = b.nodes.map((n) => n.label + ' ' + n.pct + ' phần trăm' + (n.role ? ', ' + n.role : '')).join('; ');
  return (
    <figure className={s.cycle}>
      <svg viewBox="0 0 220 220" role="img" aria-label={'Vòng tương sinh tương khắc của năm hành. ' + aria}>
        <defs>
          <marker id="cy-sinh" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L6 3L0 6z" fill="currentColor" /></marker>
        </defs>
        {b.edges.map((e, i) => {
          const a = pos[e.from], z = pos[e.to], d = Math.hypot(z.x - a.x, z.y - a.y), k = 17 / d;
          return <line key={i} className={s.cycleEdge} data-kind={e.kind} data-active={e.active} x1={a.x + (z.x - a.x) * k} y1={a.y + (z.y - a.y) * k} x2={z.x - (z.x - a.x) * k} y2={z.y - (z.y - a.y) * k} markerEnd="url(#cy-sinh)" />;
        })}
        {b.nodes.map((n, i) => (
          <g key={n.label} className={s.cycleNode} data-focus={!!n.focus}>
            <circle cx={pos[i].x} cy={pos[i].y} r={11 + Math.min(n.pct, 40) / 8} />
            <text x={pos[i].x} y={pos[i].y + 3} textAnchor="middle">{n.label}</text>
          </g>
        ))}
      </svg>
      <figcaption className={s.note}><span className={s.cycleKey}>Nét liền: sinh (+). Nét đứt: khắc (−).</span> <RichText nodes={b.caption} /></figcaption>
    </figure>
  );
}

function BlockView({ b }: { b: Block }) {
  switch (b.kind) {
    case 'p':
      return hasList(b.rich) ? <div className={s.p}><RichText nodes={b.rich} /></div> : <p className={s.p}><RichText nodes={b.rich} /></p>;
    case 'note':
      return <p className={s.note}><RichText nodes={b.rich} /></p>;
    case 'list':
      return <ul className={s.list}>{b.items.map((it, i) => <li key={i}><RichText nodes={it} /></li>)}</ul>;
    case 'verdict':
      return (
        <div className={s.verdict} data-tone={b.tone}>
          <RichText nodes={b.rich} />
          {b.how && <div className={s.how}>{b.how}</div>}
        </div>
      );
    case 'item':
      return (
        <div className={s.item}>
          <div className={s.itemHead}>
            <span className={s.itemTitle}><RichText nodes={b.title} /></span>
            {b.label && <span className={s.tag} data-tone={b.tone}>{b.label}</span>}
          </div>
          <p className={s.itemBody}><RichText nodes={b.rich} /></p>
        </div>
      );
    case 'kv':
      return <dl className={s.kv}>{b.rows.map((r) => <div key={r.k} className={s.kvRow}><dt>{r.k}</dt><dd>{r.v}</dd></div>)}</dl>;
    case 'bars':
      return (
        <div className={s.bars}>
          {b.rows.map((r) => (
            <div key={r.label} className={b.rows.some((x) => x.label.length > 12) ? `${s.barRow} ${s.barRowStack}` : s.barRow} role="img" aria-label={`${r.label}, ${r.pct} phần trăm`}>
              <span className={s.barName}>{r.label}</span>
              <span className={s.bar} aria-hidden="true"><span style={{ width: r.pct + '%' }} /></span>
              <span className={s.barPct}>{r.pct}%</span>
            </div>
          ))}
        </div>
      );
    case 'cycle': return <CycleView b={b} />;
    case 'swatches':
      return (
        <ul className={s.swatches}>
          {b.items.map((i) => <li key={i.label}><span className={s.dot} style={{ background: i.hex }} aria-hidden="true" />{i.label}</li>)}
        </ul>
      );
    case 'cards':
      return (
        <div className={s.cards}>
          {b.cards.map((c) => (
            <div key={c.label} className={s.card}>
              <div className={s.cardLabel}>{c.label}</div>
              <div className={s.cardValue}>{c.value}</div>
              <div className={s.cardBody}><RichText nodes={c.rich} /></div>
            </div>
          ))}
        </div>
      );
    case 'table':
      return (
        <table className={s.table}>
          <thead><tr>{b.head.map((h) => <th key={h} scope="col">{h}</th>)}</tr></thead>
          <tbody>
            {b.rows.map((row, i) => (
              <tr key={i}>{row.map((cell, j) => <td key={j} data-label={b.head[j]}><RichText nodes={cell} /></td>)}</tr>
            ))}
          </tbody>
        </table>
      );
    case 'chips':
      return (
        <p className={s.p}>
          <span className={s.chips}>{b.chips.map((c, i) => <span key={i} className={s.chip} data-tone={c.tone}>{c.text}</span>)}</span>
          {b.after && <> <RichText nodes={b.after} /></>}
        </p>
      );
  }
}

/** Vẽ một dãy Section (tiêu đề h3 + các khối). `level` chọn thẻ tiêu đề. */
export function SectionView({ sections, level = 3 }: { sections: readonly Section[]; level?: 3 | 4 }) {
  const H = level === 3 ? 'h3' : 'h4';
  return (
    <div className={s.wrap}>
      {sections.map((sec) => (
        <section key={sec.id} className={s.section} data-id={sec.id}>
          {sec.title && <H className={s.title}>{sec.title}</H>}
          {sec.blocks.map((b) => <BlockView key={b.id} b={b} />)}
        </section>
      ))}
    </div>
  );
}
