// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

class Utterance {
  voice: unknown = null; lang = ''; rate = 1; pitch = 1; volume = 1;
  onstart?: () => void; onend?: () => void; onerror?: (e: { error: string }) => void;
  constructor(public text: string) {}
}

function fakeSynth(list: { lang: string }[] = []) {
  const log: string[] = [];
  const synth = {
    speaking: false, pending: false, list,
    spoken: [] as Utterance[],
    cancel: vi.fn(() => { log.push('cancel'); synth.speaking = false; }),
    resume: vi.fn(),
    speak: vi.fn((u: Utterance) => { log.push('speak'); synth.spoken.push(u); }),
    getVoices: vi.fn(() => synth.list),
    addEventListener: vi.fn(), removeEventListener: vi.fn(),
    log,
  };
  return synth;
}

type Mod = typeof import('./webSpeech');
let web: Mod['webSpeech'];
let limit: Mod['speechLimitMs'];
let synth: ReturnType<typeof fakeSynth>;
const opts = { text: 'Chào', lang: 'vi-VN' };

beforeEach(async () => {
  vi.resetModules();
  vi.useFakeTimers();
  synth = fakeSynth();
  vi.stubGlobal('speechSynthesis', synth);
  vi.stubGlobal('SpeechSynthesisUtterance', Utterance);
  ({ webSpeech: web, speechLimitMs: limit } = await import('./webSpeech'));
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

describe('đọc trên trình duyệt', () => {
  it('không có gì đang đọc thì không gọi cancel trước khi đọc', async () => {
    const p = web.speak(opts);
    await vi.advanceTimersByTimeAsync(0);
    expect(synth.log).toEqual(['speak']);
    synth.spoken[0].onstart?.(); synth.spoken[0].onend?.();
    await p;
  });

  it('đang đọc thì cancel, chờ một nhịp rồi mới đọc', async () => {
    synth.speaking = true;
    void web.speak(opts);
    await vi.advanceTimersByTimeAsync(0);
    expect(synth.log).toEqual(['cancel']);
    await vi.advanceTimersByTimeAsync(200);
    expect(synth.log).toEqual(['cancel', 'speak']);
  });

  it('bị dừng trong lúc chờ thì không đọc nữa', async () => {
    synth.speaking = true;
    const p = web.speak(opts);
    const failed = expect(p).rejects.toThrow('canceled');
    await web.stop();
    await vi.advanceTimersByTimeAsync(200);
    await failed;
    expect(synth.speak).not.toHaveBeenCalled();
  });

  it('dùng giọng đã chọn và đặt lang theo giọng, đổi vi_VN thành vi-VN', async () => {
    synth.list = [{ lang: 'en_US' }, { lang: 'vi_VN' }];
    await web.getSupportedVoices();
    void web.speak({ ...opts, voice: 1 });
    await vi.advanceTimersByTimeAsync(0);
    expect(synth.spoken[0].voice).toBe(synth.list[1]);
    expect(synth.spoken[0].lang).toBe('vi-VN');
  });

  it('không chọn được giọng vẫn đọc với lang', async () => {
    void web.speak(opts);
    await vi.advanceTimersByTimeAsync(0);
    expect(synth.spoken[0].voice).toBeNull();
    expect(synth.spoken[0].lang).toBe('vi-VN');
  });

  it('trình duyệt báo lỗi: trả đúng mã lỗi', async () => {
    const p = web.speak(opts);
    const failed = expect(p).rejects.toThrow('not-allowed');
    await vi.advanceTimersByTimeAsync(0);
    synth.spoken[0].onerror?.({ error: 'not-allowed' });
    await failed;
  });

  it('im lặng không bắt đầu đọc: báo no-start, không treo', async () => {
    const p = web.speak(opts);
    const failed = expect(p).rejects.toThrow('no-start');
    await vi.advanceTimersByTimeAsync(10000);
    await failed;
    expect(synth.cancel).toHaveBeenCalled();
  });

  it('đã đọc mà không báo xong: tự qua đoạn sau', async () => {
    const p = web.speak(opts);
    await vi.advanceTimersByTimeAsync(0);
    synth.spoken[0].onstart?.();
    await vi.advanceTimersByTimeAsync(limit(opts.text));
    await expect(p).resolves.toBeUndefined();
  });

  it('danh sách giọng nạp muộn: chờ voiceschanged', async () => {
    let fire = () => {};
    synth.addEventListener.mockImplementation((_e: string, f: () => void) => { fire = f; });
    const p = web.getSupportedVoices();
    await vi.advanceTimersByTimeAsync(0);
    synth.list = [{ lang: 'vi-VN' }];
    fire();
    expect((await p).voices).toHaveLength(1);
  });

  it('không có voiceschanged thì thôi chờ, không treo', async () => {
    const p = web.getSupportedVoices();
    await vi.advanceTimersByTimeAsync(1000);
    expect((await p).voices).toEqual([]);
  });

  it('trình duyệt nhúng không có speechSynthesis: báo unsupported', async () => {
    vi.unstubAllGlobals();
    await expect(web.speak(opts)).rejects.toThrow('unsupported');
  });
});
