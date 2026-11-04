import type { Block, RichNode, Section } from '../../content/rich';
import { RichText } from './RichText';
import s from './SectionView.module.css';

const hasList = (nodes: readonly RichNode[]): boolean => nodes.some((n) => typeof n !== 'string' && (n.tag === 'ul' || hasList(n.children)));

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
            <div key={r.label} className={s.barRow}>
              <span className={s.barName}>{r.label}</span>
              <span className={s.bar} aria-hidden="true"><span style={{ width: r.pct + '%' }} /></span>
              <span className={s.barPct}>{r.pct}%</span>
            </div>
          ))}
        </div>
      );
    case 'swatches':
      return (
        <ul className={s.swatches}>
          {b.items.map((i) => <li key={i.label}><span className={s.dot} style={{ background: i.hex }} aria-hidden="true" />{i.label}</li>)}
        </ul>
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
