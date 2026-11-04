// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';

const plugin = vi.hoisted(() => ({
  speak: vi.fn(),
  stop: vi.fn(async () => {}),
  getSupportedVoices: vi.fn(),
  openInstall: vi.fn(),
}));
const env = vi.hoisted(() => ({ native: true }));
vi.mock('@capacitor-community/text-to-speech', () => ({ TextToSpeech: plugin }));
vi.mock('./native', () => ({ isNative: () => env.native }));

const V = (voiceURI: string, localService = true, lang = 'vi-VN') => ({ voiceURI, localService, lang });
const VOICES = [V('en-us-x-local', true, 'en-US'), V('vi-VN-language'), V('vi-vn-x-gft-network', false), V('vi-vn-x-vic-local')];

type Tts = typeof import('./tts');
let tts: Tts;
beforeEach(async () => {
  vi.resetModules();
  tts = await import('./tts');
  env.native = true;
  plugin.speak.mockReset(); plugin.stop.mockClear(); plugin.getSupportedVoices.mockReset();
  plugin.getSupportedVoices.mockResolvedValue({ voices: VOICES });
});

describe('chọn giọng', () => {
  it('chỉ chọn giọng -local, bỏ qua giọng mạng và giọng mặc định', () => {
    expect(tts.pickLocalVoice(VOICES)).toBe(3);
    expect(tts.pickLocalVoice([V('vi-VN-language'), V('vi-vn-x-gft-network', false)])).toBeNull();
    expect(tts.pickLocalVoice([V('en-us-x-local', true, 'en-US')])).toBeNull();
  });
  it('trình duyệt: giọng tiếng Việt chạy trên máy nào cũng được', () => {
    env.native = false;
    expect(tts.pickLocalVoice([V('Microsoft An')])).toBe(0);
  });
});

describe('speak', () => {
  it('gọi plugin với vi-VN, tốc độ, cao độ và giọng trên máy; resolve khi đọc xong đoạn', async () => {
    plugin.speak.mockResolvedValue(undefined);
    await tts.speak('Chào', { rate: 1.15, pitch: 0.9 });
    expect(plugin.speak).toHaveBeenCalledWith({ text: 'Chào', lang: 'vi-VN', rate: 1.15, pitch: 0.9, volume: 1, voice: 3 });
  });
  it('Android không có giọng trên máy: từ chối, KHÔNG đọc qua mạng', async () => {
    plugin.getSupportedVoices.mockResolvedValue({ voices: [V('vi-vn-x-gft-network', false)] });
    await expect(tts.speak('Chào')).rejects.toThrow('no-local-voice');
    expect(plugin.speak).not.toHaveBeenCalled();
  });
});

describe('giọng tiếng Việt', () => {
  it('có giọng trên máy', async () => { expect(await tts.vietnameseVoice()).toBe('ok'); });
  it('chỉ có giọng mạng: báo thiếu', async () => {
    plugin.getSupportedVoices.mockResolvedValue({ voices: [V('vi-vn-x-gft-network', false)] });
    expect(await tts.vietnameseVoice()).toBe('missing');
  });
  it('lỗi dịch vụ: Android báo thiếu, trình duyệt vẫn thử', async () => {
    plugin.getSupportedVoices.mockRejectedValue(new Error('x'));
    expect(await tts.vietnameseVoice()).toBe('missing');
    env.native = false;
    expect(await tts.vietnameseVoice()).toBe('unknown');
  });
});

describe('đọc nối tiếp', () => {
  it('đọc lần lượt, chờ đoạn trước xong mới đọc đoạn sau', async () => {
    const done: (() => void)[] = [];
    plugin.speak.mockImplementation(() => new Promise<void>((r) => { done.push(r); }));
    const p = tts.readAloud('a', ['một', 'hai'], {});
    expect(tts.readingOwner()).toBe('a');
    await vi.waitFor(() => expect(plugin.speak).toHaveBeenCalledTimes(1));
    done[0]();
    await vi.waitFor(() => expect(plugin.speak).toHaveBeenCalledTimes(2));
    done[1]();
    expect(await p).toBe(true);
    expect(tts.readingOwner()).toBeNull();
  });

  it('dừng giữa chừng: không đọc đoạn sau', async () => {
    const done: (() => void)[] = [];
    plugin.speak.mockImplementation(() => new Promise<void>((r) => { done.push(r); }));
    const p = tts.readAloud('a', ['một', 'hai'], {});
    await vi.waitFor(() => expect(plugin.speak).toHaveBeenCalledTimes(1));
    tts.stopReading();
    expect(plugin.stop).toHaveBeenCalled();
    expect(tts.readingOwner()).toBeNull();
    done[0]();
    expect(await p).toBe(true);
    expect(plugin.speak).toHaveBeenCalledTimes(1);
  });

  it('bấm đọc nơi khác: thay lần đọc đang chạy', async () => {
    const done: (() => void)[] = [];
    plugin.speak.mockImplementation(() => new Promise<void>((r) => { done.push(r); }));
    const a = tts.readAloud('a', ['một', 'hai'], {});
    await vi.waitFor(() => expect(plugin.speak).toHaveBeenCalledTimes(1));
    const b = tts.readAloud('b', ['ba'], {});
    expect(tts.readingOwner()).toBe('b');
    done[0]();
    expect(await a).toBe(true);
    expect(tts.readingOwner()).toBe('b');
    await vi.waitFor(() => expect(plugin.speak).toHaveBeenCalledTimes(2));
    done[1]();
    await b;
    expect(plugin.speak.mock.calls.map((c) => c[0].text)).toEqual(['một', 'ba']);
  });

  it('dừng lúc còn đang tìm giọng: không đọc chữ nào', async () => {
    const p = tts.readAloud('a', ['một'], {});
    tts.stopReading();
    expect(await p).toBe(true);
    expect(plugin.speak).not.toHaveBeenCalled();
  });

  it('cài thêm giọng làm đổi số thứ tự: lần kiểm sau lấy số mới', async () => {
    await tts.vietnameseVoice();
    plugin.getSupportedVoices.mockResolvedValue({ voices: [V('af-za-x-local', true, 'af-ZA'), ...VOICES] });
    await tts.vietnameseVoice();
    plugin.speak.mockResolvedValue(undefined);
    await tts.readAloud('a', ['một'], {});
    expect(plugin.speak.mock.calls[0][0].voice).toBe(4);
  });

  it('máy lỗi giữa chừng: báo false và nhả nút', async () => {
    plugin.speak.mockRejectedValue(new Error('x'));
    expect(await tts.readAloud('a', ['một'], {})).toBe(false);
    expect(tts.readingOwner()).toBeNull();
  });
});
