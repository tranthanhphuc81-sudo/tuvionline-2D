// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { findMouthGap, jawMask, refineEye, type TalkParts } from './cutout';
import { parseAnim } from './customPhoto';
import { blinkKeys, FLAP, jawKeys, withFace } from './faceRig';
import { StandFigure } from './ReaderFigure';
import thay from '../../assets/journey/character/thay.json';

afterEach(cleanup);

const talk: TalkParts = {
  upper: 'data:image/webp;base64,UP', jaw: 'data:image/webp;base64,JAW',
  rig: { mouth: [100, 176], drop: 6, eyes: [[82, 136], [118, 136]], lid: [18, 9], skin: '#c08060', line: '#704030' },
};
const markers = thay.markers;

describe('Người đọc ảnh cử động', () => {
  it('vùng hàm: dưới khe môi, giữa cằm; trên khe môi và ngoài má thì không', () => {
    expect(jawMask(100, 190, [100, 176], 27, 30)).toBe(1);
    expect(jawMask(100, 170, [100, 176], 27, 30)).toBe(0);
    expect(jawMask(140, 180, [100, 176], 27, 30)).toBe(0);
    const edge = jawMask(124, 180, [100, 176], 27, 30);
    expect(edge).toBeGreaterThan(0); expect(edge).toBeLessThan(1);
  });

  it('dò lại mắt: điểm lệch thì kéo về hàng tối (lòng đen); không có gì tối thì giữ nguyên; dịch có giới hạn', () => {
    const W = 100, H = 100;
    const img = (darkY: number | null) => {
      const data = new Uint8ClampedArray(W * H * 4);
      for (let i = 0; i < W * H; i++) { const y = Math.floor(i / W); const dark = darkY !== null && Math.abs(y - darkY) <= 1; data.set(dark ? [40, 30, 30, 255] : [200, 160, 140, 255], i * 4); }
      return { data, width: W, height: H };
    };
    expect(refineEye(img(47), [50, 50], 100, 100)[1]).toBeCloseTo(47, 0);
    expect(refineEye(img(53), [50, 50], 100, 100)[1]).toBeCloseTo(53, 0);
    expect(refineEye(img(null), [50, 50], 100, 100)).toEqual([50, 50]);
    expect(refineEye(img(42), [50, 50], 100, 200)[1]).toBeGreaterThanOrEqual(50 - 8); // tối đa 4% chiều cao mặt
    expect(refineEye(img(47), [50, 50], 100, 100)[0]).toBe(50);
  });

  it('khe miệng: cười nhe răng thì cắt ở khe tối dưới hàng răng, không chẻ đôi răng; lấy màu lòng miệng từ ảnh', () => {
    const W = 100, H = 100;
    // da, hàng răng trắng ở y 44–49, khe tối y 50–51, môi dưới
    const data = new Uint8ClampedArray(W * H * 4);
    for (let i = 0; i < W * H; i++) {
      const y = Math.floor(i / W);
      data.set(y >= 44 && y <= 49 ? [245, 245, 240, 255] : y >= 50 && y <= 51 ? [60, 20, 20, 255] : y >= 52 && y <= 55 ? [150, 80, 70, 255] : [200, 160, 140, 255], i * 4);
    }
    const gap = findMouthGap({ data, width: W, height: H }, [50, 46], 100, 100); // điểm của mô hình rơi giữa hàng răng
    expect(gap.y).toBeGreaterThanOrEqual(50); expect(gap.y).toBeLessThanOrEqual(51);
    expect(gap.color[0]).toBeLessThan(60);
    const flat = new Uint8ClampedArray(W * H * 4).fill(200);
    expect(findMouthGap({ data: flat, width: W, height: H }, [50, 46], 100, 100).y).toBe(46); // không có khe rõ: giữ điểm cũ
  });

  it('khung hình hàm: lúc nghỉ khép, các đoạn đang đọc mấp máy, đầu cuối mỗi đoạn khép lại', () => {
    const keys = jawKeys(markers, 360, [102, 109, 0], [102, 112, 0]);
    const at = (t: number) => keys.find((k) => k.t === t)?.s[1];
    expect(keys.filter((k) => k.t > 0 && k.t < 120)).toEqual([]); // idle: không có khung nào giữa đoạn
    for (const m of markers.filter((x) => x.cm !== 'idle')) {
      expect(at(m.tm)).toBe(109);
      expect(at(m.tm + m.dr)).toBe(109);
      expect(Math.max(...keys.filter((k) => k.t > m.tm && k.t < m.tm + m.dr).map((k) => k.s[1]))).toBe(112);
    }
    expect(keys.map((k) => k.t)).toEqual([...keys.map((k) => k.t)].sort((a, b) => a - b));
    expect(keys.at(-1)).toEqual({ t: 360, s: [102, 109, 0] });
    expect(FLAP[0]).toBe(0); expect(FLAP.at(-1)).toBe(0);
  });

  it('chớp mắt: mí ẩn gần hết thời gian, hiện thoáng chốc vài lần mỗi vòng', () => {
    const keys = blinkKeys(360);
    const shown = keys.filter((k) => k.s[0] === 100);
    expect(shown.length).toBe(12); // 6 lần chớp, mỗi lần hai khung
    expect(keys[0].s[0]).toBe(0); expect(keys.at(-1)!.s[0]).toBe(0);
    expect(new Set(keys.map((k) => (k as { i?: object }).i)).size).toBe(keys.length); // không dùng chung object
  });

  it('ghép mặt có cử động: mí mắt, hàm, đầu theo thứ tự trên xuống, mọi lớp gắn vào đầu', () => {
    const out = withFace(thay, 'data:image/webp;base64,HEAD', talk);
    const names = out.layers.map((l) => l.nm);
    const head = out.layers.find((l) => l.nm === 'đầu')!;
    expect(names.slice(names.indexOf('mí mắt'), names.indexOf('đầu') + 1)).toEqual(['mí mắt', 'mí mắt', 'hàm người dùng', 'mặt người dùng', 'đầu']);
    for (const l of out.layers.filter((x) => ['mí mắt', 'hàm người dùng', 'mặt người dùng'].includes(x.nm as string))) expect((l as { parent?: number }).parent).toBe(head.ind);
    expect(out.assets).toContainEqual(expect.objectContaining({ id: 'userHead', p: talk.upper }));
    expect(out.assets).toContainEqual(expect.objectContaining({ id: 'userJaw', p: talk.jaw }));
    // Lottie ghi thẳng vào dữ liệu: không object nào được dùng chung hai chỗ (lỗi cũ làm nhân vật không hiện)
    const seen = new Set<object>();
    const walk = (v: unknown) => {
      if (!v || typeof v !== 'object') return;
      expect(seen.has(v as object)).toBe(false);
      seen.add(v as object);
      Object.values(v as object).forEach(walk);
    };
    out.layers.filter((l) => ['mí mắt', 'hàm người dùng', 'mặt người dùng'].includes(l.nm as string)).forEach(walk);
  });

  it('đọc bộ phận cử động đã lưu: hỏng hay sai dạng thì bỏ qua, ảnh vẫn hiện đứng yên', () => {
    expect(parseAnim(null)).toEqual({});
    expect(parseAnim('{hỏng')).toEqual({});
    expect(parseAnim(JSON.stringify({ head: talk, stand: { upper: 'x' } }))).toEqual({ head: talk });
  });

  it('người đứng tự do: có bộ phận thì ghép ba lớp, đang đọc thì bật nhịp hàm', () => {
    const { container, rerender } = render(<StandFigure src="data:image/webp;base64,S" talk={talk} state="idle" />);
    const fig = container.querySelector('[data-talking]')!;
    expect([...fig.querySelectorAll('img')].map((i) => i.getAttribute('src'))).toEqual([talk.upper, talk.jaw]);
    expect(fig.querySelectorAll('span')).toHaveLength(2);
    expect(fig.getAttribute('data-talking')).toBe('false');
    rerender(<StandFigure src="data:image/webp;base64,S" talk={talk} state="talk" />);
    expect(container.querySelector('[data-talking]')!.getAttribute('data-talking')).toBe('true');
    rerender(<StandFigure src="data:image/webp;base64,S" state="talk" />);
    expect([...container.querySelectorAll('img')].map((i) => i.getAttribute('src'))).toEqual(['data:image/webp;base64,S']);
  });
});
