import { parseRich, type Tone } from '../../content/rich';
import { SectionView } from '../../ui/components/SectionView';

/** Dải thông báo tô màu theo mức thuận/nghịch (legacy .note-banner). */
export function Banner({ id, tone, html }: { id: string; tone: Tone; html: string }) {
  return <SectionView sections={[{ id, title: '', blocks: [{ id: id + '.0', kind: 'verdict', tone, rich: parseRich(html) }] }]} />;
}
