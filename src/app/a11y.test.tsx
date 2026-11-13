// @vitest-environment jsdom
/* Kiểm truy cập tự động bằng axe-core (CLAUDE.md: nhãn aria cho nút chỉ có biểu tượng; 13/11/2026).
   Chạy offline trong jsdom nên KHÔNG kiểm được độ tương phản (jsdom không tính màu, đã có tests/contrast-tokens.test.ts)
   và vùng chạm 44px (jsdom không dàn trang). Các luật còn lại của WCAG 2.0/2.1 A, AA: nhãn nút và ô nhập, vai trò và
   thuộc tính ARIA hợp lệ, id không trùng, danh sách đúng cấu trúc, ảnh có chữ thay thế…; thêm nhóm best-practice
   (thứ tự tiêu đề không nhảy cấp, vai trò ARIA không đè lên nút bấm). */
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import { axeViolations } from '../../tests/axe';
import { App } from './App';
import { AppProvider } from './context';
import { createStore } from '../state/store';
import { emptyState, type PersistedState } from '../state/schema';
import { addProfile } from '../state/actions';
import { initialRouter } from './router';
import { Journey } from '../features/journey/Journey';
import { SCENES } from '../features/journey/scenes';

type Birth = { day: number; month: number; year: number; hourIdx: number };
function setup(withProfile: boolean | Birth = true) {
  const store = createStore<PersistedState>(emptyState());
  const b: Birth = typeof withProfile === 'object' ? withProfile : { day: 15, month: 6, year: 1996, hourIdx: 6 };
  if (withProfile) addProfile(store, { name: 'An', gender: 'M', calendar: 'solar', leapMonth: false, lateTy: false, ...b });
  const nav = createStore(initialRouter());
  render(<AppProvider store={store} nav={nav}><App /></AppProvider>);
}

afterEach(cleanup);

const violations = axeViolations;

const TABS = [/Tĩnh thất/, /Tử Vi/, /Bát Tự/, /Lục Hào/, /Phong thủy/];

/* axe quét cả trang mất 1–3 giây mỗi lần, chậm hơn khi cả bộ test chạy song song: nới thời gian chờ. */
describe('truy cập (axe-core)', { timeout: 30000 }, () => {
  it('chưa có hồ sơ: màn mời thêm hồ sơ', async () => {
    setup(false);
    expect(await violations()).toEqual([]);
  });

  for (const tab of TABS) {
    it(`tab ${tab.source}`, async () => {
      setup();
      await act(async () => { fireEvent.click(screen.getByRole('tab', { name: tab })); });
      expect(await violations()).toEqual([]);
    });
  }

  it('Phong thủy: La Bàn và Nạp Âm', async () => {
    setup();
    await act(async () => { fireEvent.click(screen.getByRole('tab', { name: /Phong thủy/ })); });
    for (const sub of ['La Bàn', 'Nạp Âm']) {
      await act(async () => { fireEvent.click(screen.getByRole('radio', { name: sub })); });
      expect(await violations(), sub).toEqual([]);
    }
  });

  it('Cài đặt và màn chọn hồ sơ', async () => {
    setup();
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Cài đặt' })); });
    expect(await violations(), 'Cài đặt').toEqual([]);
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /Đang xem: An/ })); });
    expect(await violations(), 'Hồ sơ').toEqual([]);
  });

  it('Quản lý hồ sơ và form hồ sơ', async () => {
    setup();
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /Đang xem: An/ })); });
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Quản lý hồ sơ' })); });
    expect(await violations(), 'Quản lý hồ sơ').toEqual([]);
    cleanup();
    setup(false);
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Điền cả hồ sơ một lần' })); });
    expect(await violations(), 'Form hồ sơ').toEqual([]);
  });

  it('Lục Hào: sau khi gieo quẻ, và chế độ nhập tay', async () => {
    setup();
    await act(async () => { fireEvent.click(screen.getByRole('tab', { name: /Lục Hào/ })); });
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /Gieo quẻ/ })); });
    expect(await violations(), 'đã gieo').toEqual([]);
    await act(async () => { fireEvent.click(screen.getByRole('radio', { name: 'Nhập tay' })); });
    expect(await violations(), 'nhập tay').toEqual([]);
  });

  it('Tử Vi: chọn cung khác và một Đại hạn', async () => {
    setup();
    await act(async () => { fireEvent.click(screen.getByRole('tab', { name: /Tử Vi/ })); });
    const palaces = screen.getAllByRole('button', { pressed: false });
    await act(async () => { fireEvent.click(palaces[0]); });
    const dh = document.querySelector<HTMLButtonElement>('button[role="listitem"]');
    if (dh) await act(async () => { fireEvent.click(dh); });
    expect(await violations()).toEqual([]);
  });

  it('Bát Tự: lá Chân tòng sau khi xem cách luận khác', async () => {
    setup({ day: 10, month: 3, year: 1958, hourIdx: 3 });
    await act(async () => { fireEvent.click(screen.getByRole('tab', { name: /Bát Tự/ })); });
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Xem cách luận khác' })); });
    expect(await violations()).toEqual([]);
  });

  it('Bát Tự: thẻ kiểm chứng sau một câu trả lời', async () => {
    setup({ day: 13, month: 3, year: 1986, hourIdx: 3 }); // lá Giả: có thẻ kiểm chứng
    await act(async () => { fireEvent.click(screen.getByRole('tab', { name: /Bát Tự/ })); });
    await act(async () => { fireEvent.click(screen.getAllByRole('button', { name: 'Thuận lợi' })[0]); });
    expect(await violations()).toEqual([]);
  });

  it('form hồ sơ: âm lịch và đang báo lỗi', async () => {
    setup(false);
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Điền cả hồ sơ một lần' })); });
    await act(async () => { fireEvent.click(screen.getByRole('radio', { name: 'Âm lịch' })); });
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Lưu hồ sơ' })); });
    expect(screen.getAllByRole('alert').length).toBeGreaterThan(0);
    expect(await violations()).toEqual([]);
  });

  it('lối vào: từng cảnh của hành trình đầy đủ', async () => {
    render(<AppProvider store={createStore<PersistedState>(emptyState())}><Journey plan="full" onDone={() => {}} /></AppProvider>);
    const seen: string[] = [];
    for (let i = 0; i < SCENES.length; i++) {
      const id = document.querySelector('[data-scene]')?.getAttribute('data-scene') ?? '?';
      seen.push(id);
      expect(await violations(), id).toEqual([]);
      const d = screen.getByRole('dialog');
      await act(async () => { fireEvent.pointerDown(d, { clientY: 300 }); fireEvent.pointerUp(d, { clientY: 300 }); });
    }
    expect(new Set(seen).size).toBeGreaterThan(1);
  });

  it('Xem chỉ tay (màn nạp khi cần)', async () => {
    setup();
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /mở xem chỉ tay/ })); });
    await screen.findByRole('heading', { name: /Xem chỉ tay/ }, { timeout: 5000 });
    expect(await violations()).toEqual([]);
  });
});
