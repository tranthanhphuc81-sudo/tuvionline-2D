// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { act, render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { AppProvider } from '../../app/context';
import { createStore } from '../../state/store';
import { emptyState, type PersistedState } from '../../state/schema';

vi.mock('../../platform/native', () => ({ isNative: () => true }));
const plugin = vi.hoisted(() => ({ speak: vi.fn(), stop: vi.fn(async () => {}), getSupportedVoices: vi.fn(), openInstall: vi.fn() }));
vi.mock('@capacitor-community/text-to-speech', () => ({ TextToSpeech: plugin }));
import { SpeakButton } from './SpeakButton';
import { stopReading } from '../../platform/tts';

function setup() {
  const store = createStore<PersistedState>({ ...emptyState(), settings: { theme: 'system', ttsRate: 0.85, ttsPitch: 1.1 } });
  render(<AppProvider store={store}><SpeakButton id="x" getText={() => 'Một câu. Hai câu.'} /></AppProvider>);
}
beforeEach(() => { plugin.speak.mockReset(); plugin.getSupportedVoices.mockReset(); plugin.getSupportedVoices.mockResolvedValue({ voices: [{ voiceURI: 'vi-vn-x-vic-local', lang: 'vi-VN', localService: true }] }); });
afterEach(() => { act(() => stopReading()); cleanup(); });

describe('Nút đọc', () => {
  it('bấm: đọc theo cài đặt, đổi thành Dừng; bấm lần nữa thì dừng', async () => {
    plugin.speak.mockImplementation(() => new Promise(() => {}));
    setup();
    fireEvent.click(screen.getByRole('button', { name: '🔊 Đọc kết quả' }));
    await waitFor(() => expect(plugin.speak).toHaveBeenCalledWith({ text: 'Một câu. Hai câu.', lang: 'vi-VN', rate: 0.85, pitch: 1.1, volume: 1, voice: 0 }));
    const stop = screen.getByRole('button', { name: '⏹ Dừng đọc' });
    fireEvent.click(stop);
    await waitFor(() => expect(screen.getByRole('button', { name: '🔊 Đọc kết quả' })).toBeTruthy());
    expect(plugin.stop).toHaveBeenCalled();
  });

  it('máy không có giọng tiếng Việt: hướng dẫn cài, không đọc', async () => {
    plugin.getSupportedVoices.mockResolvedValue({ voices: [{ voiceURI: 'vi-vn-x-gft-network', lang: 'vi-VN', localService: false }] });
    setup();
    fireEvent.click(screen.getByRole('button', { name: '🔊 Đọc kết quả' }));
    expect((await screen.findByRole('status')).textContent).toContain('Google Text-to-speech');
    expect(plugin.speak).not.toHaveBeenCalled();
  });

  it('máy lỗi khi đọc: báo rõ, nút trở lại', async () => {
    plugin.speak.mockRejectedValue(new Error('x'));
    setup();
    fireEvent.click(screen.getByRole('button', { name: '🔊 Đọc kết quả' }));
    expect((await screen.findByRole('status')).textContent).toContain('Không đọc được trên máy này');
    expect(screen.getByRole('button', { name: '🔊 Đọc kết quả' })).toBeTruthy();
  });
});
