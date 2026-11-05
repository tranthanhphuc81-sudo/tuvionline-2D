// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { act, render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';

vi.mock('../../platform/native', () => ({ isNative: () => true }));
const plugin = vi.hoisted(() => ({ speak: vi.fn(), stop: vi.fn(async () => {}), getSupportedVoices: vi.fn(), openInstall: vi.fn() }));
vi.mock('@capacitor-community/text-to-speech', () => ({ TextToSpeech: plugin }));
import { ReadingBar } from './ReadingBar';
import { readAloud, stopReading } from '../../platform/tts';

beforeEach(() => {
  plugin.speak.mockReset();
  plugin.speak.mockImplementation(() => new Promise(() => {}));
  plugin.getSupportedVoices.mockResolvedValue({ voices: [{ voiceURI: 'vi-vn-x-vic-local', lang: 'vi-VN', localService: true }] });
});
afterEach(() => { act(() => stopReading()); cleanup(); });

describe('Thanh điều khiển đọc', () => {
  it('chỉ hiện khi đang đọc, biến mất khi dừng', async () => {
    render(<ReadingBar />);
    expect(screen.queryByRole('group')).toBeNull();
    act(() => { void readAloud('a', ['một', 'hai'], {}); });
    expect(screen.getByRole('group', { name: 'Điều khiển đọc thành lời' })).toBeTruthy();
    expect(screen.getByText('Đoạn 1/2')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Dừng đọc' }));
    expect(screen.queryByRole('group')).toBeNull();
    expect(plugin.stop).toHaveBeenCalled();
  });

  it('tạm dừng đổi thành Đọc tiếp, bấm lại thì đọc từ đầu đoạn dở', async () => {
    render(<ReadingBar />);
    act(() => { void readAloud('a', ['một', 'hai'], {}); });
    await waitFor(() => expect(plugin.speak).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getByRole('button', { name: 'Tạm dừng' }));
    fireEvent.click(screen.getByRole('button', { name: 'Đọc tiếp' }));
    await waitFor(() => expect(plugin.speak).toHaveBeenCalledTimes(2));
    expect(plugin.speak.mock.calls[1][0].text).toBe('một');
  });

  it('nút tiến/lùi đổi vị trí; đoạn cuối thì khoá nút tiến', async () => {
    render(<ReadingBar />);
    act(() => { void readAloud('a', ['một', 'hai'], {}); });
    await waitFor(() => expect(plugin.speak).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getByRole('button', { name: 'Đoạn sau' }));
    expect(await screen.findByText('Đoạn 2/2')).toBeTruthy();
    expect((screen.getByRole('button', { name: 'Đoạn sau' }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Nghe lại đoạn trước' }));
    expect(await screen.findByText('Đoạn 1/2')).toBeTruthy();
  });
});
