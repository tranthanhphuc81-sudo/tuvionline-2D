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

  const pending = () => {
    const done: (() => void)[] = [];
    plugin.speak.mockImplementation(() => new Promise<void>((r) => { done.push(r); }));
    return done;
  };
  const spoken = () => plugin.speak.mock.calls.map((c) => c[0].text);

  it('lùi một đoạn: đọc lại đoạn trước rồi đọc tiếp bình thường', async () => {
    const done = pending();
    const p = tts.readAloud('a', ['một', 'hai', 'ba'], {});
    await vi.waitFor(() => expect(plugin.speak).toHaveBeenCalledTimes(1));
    done[0]();
    await vi.waitFor(() => expect(plugin.speak).toHaveBeenCalledTimes(2));
    await tts.skipReading(-1);
    expect(plugin.stop).toHaveBeenCalled();
    await vi.waitFor(() => expect(plugin.speak).toHaveBeenCalledTimes(3));
    expect(tts.readingState()).toMatchObject({ id: 'a', index: 0, total: 3, paused: false, text: 'một' });
    done[1](); // đoạn "hai" bị ngắt báo xong muộn: không được nhảy vị trí
    await Promise.resolve();
    expect(tts.readingState()?.index).toBe(0);
    done[2]();
    await vi.waitFor(() => expect(plugin.speak).toHaveBeenCalledTimes(4));
    done[3]();
    await vi.waitFor(() => expect(plugin.speak).toHaveBeenCalledTimes(5));
    done[4]();
    expect(await p).toBe(true);
    expect(spoken()).toEqual(['một', 'hai', 'một', 'hai', 'ba']);
  });

  it('đang ở đoạn đầu mà lùi: đọc lại đoạn đầu; tiến ở đoạn cuối không vượt quá', async () => {
    pending();
    void tts.readAloud('a', ['một', 'hai'], {});
    await vi.waitFor(() => expect(plugin.speak).toHaveBeenCalledTimes(1));
    await tts.skipReading(-1);
    await vi.waitFor(() => expect(plugin.speak).toHaveBeenCalledTimes(2));
    await tts.skipReading(5);
    await vi.waitFor(() => expect(plugin.speak).toHaveBeenCalledTimes(3));
    expect(spoken()).toEqual(['một', 'một', 'hai']);
    tts.stopReading();
  });

  it('tạm dừng rồi đọc tiếp: đọc lại từ đầu đoạn đang dở, vẫn giữ quyền đọc', async () => {
    const done = pending();
    const p = tts.readAloud('a', ['một', 'hai'], {});
    await vi.waitFor(() => expect(plugin.speak).toHaveBeenCalledTimes(1));
    tts.pauseReading();
    expect(plugin.stop).toHaveBeenCalled();
    expect(tts.readingState()?.paused).toBe(true);
    expect(tts.readingOwner()).toBe('a');
    done[0]();
    await Promise.resolve();
    expect(plugin.speak).toHaveBeenCalledTimes(1);
    tts.resumeReading();
    await vi.waitFor(() => expect(plugin.speak).toHaveBeenCalledTimes(2));
    done[1]();
    await vi.waitFor(() => expect(plugin.speak).toHaveBeenCalledTimes(3));
    done[2]();
    expect(await p).toBe(true);
    expect(spoken()).toEqual(['một', 'một', 'hai']);
  });

  it('đang tạm dừng mà lùi: chỉ đổi vị trí, chưa đọc', async () => {
    pending();
    void tts.readAloud('a', ['một', 'hai'], {});
    await vi.waitFor(() => expect(plugin.speak).toHaveBeenCalledTimes(1));
    await tts.skipReading(1);
    await vi.waitFor(() => expect(plugin.speak).toHaveBeenCalledTimes(2));
    tts.pauseReading();
    await tts.skipReading(-1);
    expect(tts.readingState()).toMatchObject({ index: 0, paused: true });
    expect(plugin.speak).toHaveBeenCalledTimes(2);
    tts.stopReading();
    expect(tts.readingState()).toBeNull();
  });

  it('đoạn chỉ có chữ: không đọc, dừng đủ lâu rồi sang đoạn sau', async () => {
    vi.useFakeTimers();
    const done = pending();
    void tts.readAloud('a', [{ text: '', caption: 'chữ' }, 'hai'], {});
    await vi.advanceTimersByTimeAsync(1);
    expect(tts.readingState()?.text).toBe('chữ');
    expect(plugin.speak).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(3000);
    expect(spoken()).toEqual(['hai']);
    done[0]();
    vi.useRealTimers();
    tts.stopReading();
  });

  it('phụ đề là chữ gốc khi có caption', async () => {
    pending();
    void tts.readAloud('a', [{ text: 'ngày 1 tháng 2', caption: '1/2' }], {});
    expect(tts.readingState()?.text).toBe('1/2');
    tts.stopReading();
  });

  it('giọng đã chọn được ưu tiên, giọng không còn trên máy thì tự chọn', () => {
    expect(tts.pickLocalVoice([V('vi-vn-x-vic-local'), V('vi-vn-x-vid-local')], 'vi-vn-x-vid-local')).toBe(1);
    expect(tts.pickLocalVoice([V('vi-vn-x-vic-local')], 'vi-vn-x-vid-local')).toBe(0);
  });

  it('máy lỗi giữa chừng: báo false và nhả nút', async () => {
    plugin.speak.mockRejectedValue(new Error('x'));
    expect(await tts.readAloud('a', ['một'], {})).toBe(false);
    expect(tts.readingOwner()).toBeNull();
  });
});
