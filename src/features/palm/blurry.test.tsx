// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
vi.mock('./vision/photo', () => ({ preparePhoto: vi.fn(async () => 'blurry') }));
import { AppProvider } from '../../app/context';
import { initialRouter } from '../../app/router';
import { createStore } from '../../state/store';
import { emptyState, type PersistedState } from '../../state/schema';
import { PalmScreen } from './PalmScreen';

afterEach(cleanup);

describe('Ảnh mờ', () => {
  it('báo chụp lại và không sang bước chạm đường', async () => {
    const state: PersistedState = { ...emptyState(), profiles: [{ id: 'a', name: 'An', gender: 'M', calendar: 'solar', day: 1, month: 1, year: 1990, leapMonth: false, hourIdx: 0, lateTy: false, createdAt: 't', updatedAt: 't' }], activeProfileId: 'a' };
    const { container } = render(<AppProvider store={createStore(state)} nav={createStore(initialRouter())}><PalmScreen /></AppProvider>);
    const input = container.querySelectorAll('input[type=file]')[1] as HTMLInputElement;
    fireEvent.change(input, { target: { files: [new File(['x'], 'a.jpg', { type: 'image/jpeg' })] } });
    await waitFor(() => expect(screen.getByRole('alert').textContent).toMatch(/mờ hoặc nhoè/));
    expect(screen.queryByText(/1\/4\. Sinh đạo/)).toBeNull();
    expect(screen.getByRole('button', { name: /Chụp ảnh lòng bàn tay/ })).toBeTruthy();
  });
});
