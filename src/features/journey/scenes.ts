/* Cấu hình 5 trạm (ARCHITECTURE.md mục 12.1, 12.5). Thêm trạm hoặc thay tranh thật chỉ sửa dữ liệu ở đây. */
import type { AmbientMix } from '../../platform/ambientAudio';
import type { Ambience, SceneSeason, TimeOfDay } from './ambience';
import type { ParticleKind } from './particles';

export type VariantKey = TimeOfDay | SceneSeason | 'tet' | 'ram' | 'mung1';
export interface SceneLayer { src: string; /** 0 = xa nhất, 1 = gần nhất */ depth: number; /** chỉ hiện khi đúng biến thể */ when?: VariantKey }
export interface ParticleSpec { kind: ParticleKind; count: number; when?: VariantKey }
export type SceneInteraction = 'step' | 'incense' | 'invite';

export interface Scene {
  id: string;
  layers: SceneLayer[];
  particles: ParticleSpec[];
  ambience: AmbientMix;
  /** tiếng chuông khi bước vào trạm */
  bell?: boolean;
  interaction: SceneInteraction;
  durationMs: { full: number; short: number };
}

const files = import.meta.glob('../../assets/journey/art/*.svg', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;

function layers(id: string): SceneLayer[] {
  return [0, 1, 2, 3].map((n) => ({ src: files[`../../assets/journey/art/${id}-${n}.svg`], depth: n / 3 }));
}
const over = (name: string, when: VariantKey, depth = 0.6): SceneLayer => ({ src: files[`../../assets/journey/art/over-${name}.svg`], depth, when });
const DUR = { full: 5000, short: 500 };

export const SCENES: readonly Scene[] = [
  {
    id: 'gate', layers: [...layers('gate'), over('tet', 'tet', 0.72)], particles: [{ kind: 'leaf', count: 14 }],
    ambience: { wind: 0.25, bird: 0.15, chime: 0.1 }, interaction: 'step', durationMs: DUR,
  },
  {
    id: 'garden',
    layers: [...layers('garden'), over('xuan', 'xuan', 0.72), over('ha', 'ha', 0.72), over('thu', 'thu', 0.72), over('dong', 'dong', 0.72), over('moon', 'ram', 0)],
    particles: [{ kind: 'ripple', count: 8 }, { kind: 'firefly', count: 10, when: 'night' }],
    ambience: { wind: 0.2, bird: 0.15, stream: 0.2, chime: 0.1 }, interaction: 'step', durationMs: DUR,
  },
  {
    id: 'hall', layers: layers('hall'), particles: [{ kind: 'smoke', count: 16 }, { kind: 'smoke', count: 10, when: 'mung1' }],
    ambience: { wind: 0.05 }, bell: true, interaction: 'incense', durationMs: { ...DUR, full: 9000 },
  },
  { id: 'corridor', layers: layers('corridor'), particles: [{ kind: 'smoke', count: 6 }], ambience: { wind: 0.03 }, interaction: 'invite', durationMs: DUR },
  { id: 'study', layers: layers('study'), particles: [{ kind: 'smoke', count: 6 }], ambience: { lamp: 0.2 }, interaction: 'step', durationMs: DUR },
];

const matches = (when: VariantKey | undefined, a: Ambience) => !when || when === a.timeOfDay || when === a.season || when === a.lunarEvent;

/** Lớp ảnh và hạt của trạm theo giờ, mùa, ngày âm. */
export function activeLayers(scene: Scene, a: Ambience): SceneLayer[] {
  return scene.layers.filter((l) => matches(l.when, a)).sort((x, y) => x.depth - y.depth);
}
export function activeParticles(scene: Scene, a: Ambience): ParticleSpec[] {
  return scene.particles.filter((p) => matches(p.when, a));
}

/** Tải trước ảnh của trạm kế tiếp để bước tới không bị trắng. */
export function preloadScene(scene: Scene | undefined): void {
  scene?.layers.forEach((l) => { new Image().src = l.src; });
}
