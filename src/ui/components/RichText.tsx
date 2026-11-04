import { Fragment, type ReactNode } from 'react';
import type { RichNode } from '../../content/rich';

/** Vẽ cây RichNode (không dùng dangerouslySetInnerHTML). */
export function RichText({ nodes }: { nodes: readonly RichNode[] }) {
  return <>{nodes.map(render)}</>;
}

function render(n: RichNode, i: number): ReactNode {
  if (typeof n === 'string') return <Fragment key={i}>{n}</Fragment>;
  const kids = n.children.map(render);
  switch (n.tag) {
    case 'b': return <b key={i}>{kids}</b>;
    case 'i': return <i key={i}>{kids}</i>;
    case 'small': return <small key={i}>{kids}</small>;
    case 'ul': return <ul key={i}>{kids}</ul>;
    case 'li': return <li key={i}>{kids}</li>;
    case 'br': return <br key={i} />;
  }
}
