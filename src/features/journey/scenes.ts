/* Cấu hình 5 trạm (ARCHITECTURE.md mục 12.1, 12.5). Thêm trạm hoặc thay tranh thật chỉ sửa dữ liệu ở đây. */
import type { ParticleKind } from './particles';

export interface SceneLayer { src: string; /** 0 = xa nhất, 1 = gần nhất */ depth: number }
export interface ParticleSpec { kind: ParticleKind; count: number }
export type SceneInteraction = 'step' | 'incense' | 'invite';

export interface Scene {
  id: string;
  layers: SceneLayer[];
  particles: ParticleSpec[];
  interaction: SceneInteraction;
  durationMs: { full: number; short: number };
}

const files = import.meta.glob('../../assets/journey/placeholder/*.svg', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;

function layers(id: string): SceneLayer[] {
  return [0, 1, 2, 3].map((n) => ({ src: files[`../../assets/journey/placeholder/${id}-${n}.svg`], depth: n / 3 }));
}
const DUR = { full: 5000, short: 500 };

export const SCENES: readonly Scene[] = [
  { id: 'gate', layers: layers('gate'), particles: [{ kind: 'leaf', count: 14 }], interaction: 'step', durationMs: DUR },
  { id: 'garden', layers: layers('garden'), particles: [{ kind: 'ripple', count: 8 }, { kind: 'firefly', count: 10 }], interaction: 'step', durationMs: DUR },
  { id: 'hall', layers: layers('hall'), particles: [{ kind: 'smoke', count: 16 }], interaction: 'incense', durationMs: DUR },
  { id: 'corridor', layers: layers('corridor'), particles: [{ kind: 'smoke', count: 6 }], interaction: 'invite', durationMs: DUR },
  { id: 'study', layers: layers('study'), particles: [{ kind: 'smoke', count: 6 }], interaction: 'step', durationMs: DUR },
];

/** Tải trước ảnh của trạm kế tiếp để bước tới không bị trắng. */
export function preloadScene(scene: Scene | undefined): void {
  scene?.layers.forEach((l) => { new Image().src = l.src; });
}
