// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { AppProvider } from '../../app/context';
import { initialRouter } from '../../app/router';
import { createStore } from '../../state/store';
import { emptyState, type PalmSession, type PersistedState, type Profile } from '../../state/schema';
import { PALM_QUESTIONS } from '../../content/palm/questions';
import { handWarp, PalmDiagram } from './PalmDiagram';
import { PalmResultScreen } from './PalmResultScreen';
import { PalmScreen } from './PalmScreen';
import { QuestionField } from './QuestionField';
import { MachineAnswers, answerLabel } from './MachineAnswers';
import { heldPhoto, holdPhoto } from './photoMemory';

const person: Profile = {
  id: 'a', name: 'An', gender: 'M', calendar: 'solar', day: 15, month: 6, year: 1996, leapMonth: false, hourIdx: 6, lateTy: false, createdAt: 't', updatedAt: 't',
};
const lm = Array.from({ length: 21 }, (_, i) => ({ x: 0.2 + (i % 7) * 0.08, y: 0.9 - Math.floor(i / 7) * 0.3 }));
const session = (over: Partial<PalmSession> = {}): PalmSession => ({
  id: 's1', profileId: 'a', date: '2026-11-10T00:00:00Z', hand: 'right', role: 'current', version: 1, landmarks: lm,
  lines: { sinh: [[{ x: 0.3, y: 0.5 }, { x: 0.4, y: 0.8 }]], tam: [[{ x: 0.7, y: 0.4 }, { x: 0.4, y: 0.4 }], [{ x: 0.35, y: 0.42 }, { x: 0.3, y: 0.45 }]] },
  answers: { Q01: 'right', Q02: 'H01', Q14: 'T01', Q17: 'SD02', Q18: 'SD01', Q20: 'TD16', 'Q21-huong': 'TD02', 'Q21-dai': 'TD05' }, measured: {}, ...over,
});
const withState = (extra: Partial<PersistedState> = {}): PersistedState => ({ ...emptyState(), profiles: [person], activeProfileId: 'a', ...extra });
function setup(state: PersistedState, ui: React.ReactNode) {
  const store = createStore<PersistedState>(state);
  const nav = createStore(initialRouter());
  render(<AppProvider store={store} nav={nav}>{ui}</AppProvider>);
  return { store, nav };
}
afterEach(cleanup);

describe('QuestionField', () => {
  const q = PALM_QUESTIONS.find((x) => x.id === 'Q14')!;
  it('chọn một: có "Không rõ", chưa trả lời thì không chip nào được chọn', () => {
    const on = vi.fn();
    render(<QuestionField q={q} value={undefined} onChange={on} />);
    expect(screen.getAllByRole('radio').filter((b) => b.getAttribute('aria-checked') === 'true')).toHaveLength(0);
    fireEvent.click(screen.getByRole('radio', { name: 'Nhọn' }));
    expect(on).toHaveBeenLastCalledWith('T02');
    fireEvent.click(screen.getByRole('radio', { name: 'Không rõ' }));
    expect(on).toHaveBeenLastCalledWith(null);
  });

  it('"Không rõ" được chọn khi giá trị là null, và nhãn máy chọn sẵn chỉ hiện khi được yêu cầu', () => {
    const { rerender } = render(<QuestionField q={q} value={null} onChange={() => {}} fromMachine />);
    expect(screen.getByRole('radio', { name: 'Không rõ' }).getAttribute('aria-checked')).toBe('true');
    expect(screen.getByText('Máy đã chọn sẵn từ ảnh')).toBeTruthy();
    rerender(<QuestionField q={q} value="T01" onChange={() => {}} />);
    expect(screen.queryByText('Máy đã chọn sẵn từ ảnh')).toBeNull();
  });

  it('chọn nhiều: bật tắt từng mục, không có "Không rõ"', () => {
    const multi = PALM_QUESTIONS.find((x) => x.id === 'Q19')!;
    const on = vi.fn();
    render(<QuestionField q={multi} value={['SD09']} onChange={on} />);
    expect(screen.queryByRole('radio', { name: 'Không rõ' })).toBeNull();
    fireEvent.click(screen.getByRole('checkbox', { name: 'Lên ngón giữa' }));
    expect(on).toHaveBeenLastCalledWith(['SD09', 'SD10']);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Lên ngón trỏ' }));
    expect(on).toHaveBeenLastCalledWith([]);
  });
});

describe('PalmDiagram', () => {
  it('vẽ từng đoạn của mỗi đường, đọc được bằng trình đọc màn hình, tay trái được lật', () => {
    const { container, rerender } = render(<PalmDiagram session={session()} />);
    expect(screen.getByRole('img').getAttribute('aria-label')).toContain('Sinh đạo, Tâm đạo');
    // 1 đoạn Sinh đạo + 2 đoạn Tâm đạo
    expect(container.querySelectorAll('[data-line]')).toHaveLength(3);
    expect(container.querySelector('[data-hand]')!.getAttribute('transform')).not.toContain('scale(-1 1)');
    rerender(<PalmDiagram session={session({ hand: 'left' })} />);
    expect(container.querySelector('[data-hand]')!.getAttribute('transform')).toContain('scale(-1 1)');
  });
});

describe('Màn hình kết quả', () => {
  it('chưa có kết quả: mời xem chỉ tay', () => {
    setup(withState(), <PalmResultScreen />);
    expect(screen.getByText(/chưa có kết quả xem chỉ tay/)).toBeTruthy();
  });

  it('có kết quả: lời nhắc đầu và cuối, các mục, và "Vì sao?" mở mô tả đặc điểm', () => {
    setup(withState({ palmSessions: [session()] }), <PalmResultScreen />);
    expect(screen.getByText(/Xem tay là để soi lại mình/)).toBeTruthy();
    expect(screen.getByText(/đức năng thắng số/)).toBeTruthy();
    expect(screen.getByText(/mang tính văn hoá, tham khảo, không phải căn cứ/)).toBeTruthy();
    const why = screen.getAllByRole('button', { name: 'Vì sao?' })[0];
    expect(why.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(why);
    expect(why.getAttribute('aria-expanded')).toBe('true');
  });

  it('chỉ hiện kết quả của hồ sơ đang xem', () => {
    setup(withState({ palmSessions: [session({ profileId: 'b' })] }), <PalmResultScreen />);
    expect(screen.getByText(/chưa có kết quả xem chỉ tay/)).toBeTruthy();
  });

  it('xoá kết quả cần xác nhận, rồi xoá hết các lần xem của hồ sơ', () => {
    const { store } = setup(withState({ palmSessions: [session(), session({ id: 's2', role: 'innate', hand: 'left' })] }), <PalmResultScreen />);
    const ask = vi.spyOn(window, 'confirm').mockReturnValueOnce(false).mockReturnValueOnce(true);
    fireEvent.click(screen.getByRole('button', { name: 'Xoá mọi kết quả chỉ tay' }));
    expect(store.getState().palmSessions).toHaveLength(2);
    fireEvent.click(screen.getByRole('button', { name: 'Xoá mọi kết quả chỉ tay' }));
    expect(store.getState().palmSessions).toHaveLength(0);
    ask.mockRestore();
  });

  it('có cả hai tay thì có phần so sánh', () => {
    setup(withState({ palmSessions: [session(), session({ id: 's2', role: 'innate', hand: 'left', answers: { Q01: 'right', Q17: 'SD02', Q02: 'H03' } })] }), <PalmResultScreen />);
    expect(screen.getByRole('heading', { name: 'So sánh hai tay' })).toBeTruthy();
  });
});

describe('Màn hình xem chỉ tay, bước đầu', () => {
  it('có hồ sơ: lời giới thiệu về ảnh không rời máy, hai câu chọn tay, hai nút lấy ảnh', () => {
    setup(withState(), <PalmScreen />);
    expect(screen.getByText(/không gửi đi đâu và không được lưu lại/)).toBeTruthy();
    expect(screen.getByText('Bạn thuận tay nào?')).toBeTruthy();
    expect(screen.getByText('Bạn chụp tay nào?')).toBeTruthy();
    expect(screen.getByRole('button', { name: /Chụp ảnh lòng bàn tay/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Chọn từ thư viện ảnh' })).toBeTruthy();
    expect(screen.queryByText(/Đã có kết quả được lưu/)).toBeNull();
  });

  it('đổi tay thuận thì tay chụp đi theo; đã có kết quả thì có lối xem lại', () => {
    const { nav } = setup(withState({ palmSessions: [session()] }), <PalmScreen />);
    const radios = (name: string) => screen.getAllByRole('radio', { name });
    fireEvent.click(radios('Tay trái')[0]);
    expect(radios('Tay trái')[1].getAttribute('aria-checked')).toBe('true');
    fireEvent.click(screen.getByRole('button', { name: /Đã có kết quả được lưu/ }));
    expect(nav.getState().stacks.home.at(-1)?.name).toBe('palm.result');
  });

  it('chưa có hồ sơ: mời thêm hồ sơ', () => {
    setup(emptyState(), <PalmScreen />);
    expect(screen.getByRole('button', { name: /Thêm hồ sơ/ })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Chụp ảnh/ })).toBeNull();
  });
});

describe('Bảng máy đo được', () => {
  const qs = PALM_QUESTIONS.filter((q) => ['Q04', 'Q22'].includes(q.id));
  it('mỗi câu một dòng, chạm Sửa mới mở lựa chọn, ghi nhận là đã sửa', () => {
    const on = vi.fn();
    const { rerender } = render(<MachineAnswers questions={qs} answers={{ Q04: 'H10', Q22: ['TD19', 'TD11'] }} machine={{ Q04: 'H10', Q22: ['TD19', 'TD11'] }} onChange={on} />);
    expect(screen.getByText('Dài')).toBeTruthy();
    expect(screen.getByText('Đứt, Uốn lượn')).toBeTruthy();
    expect(screen.queryByRole('radio')).toBeNull();
    fireEvent.click(screen.getAllByRole('button', { name: 'Sửa' })[0]);
    fireEvent.click(screen.getByRole('radio', { name: 'Rộng' }));
    expect(on).toHaveBeenCalledWith('Q04', 'H11');
    rerender(<MachineAnswers questions={qs} answers={{ Q04: 'H11', Q22: ['TD19', 'TD11'] }} machine={{ Q04: 'H10', Q22: ['TD19', 'TD11'] }} onChange={on} />);
    expect(screen.getByText(/bạn đã sửa/)).toBeTruthy();
  });

  it('không rõ thì ghi "Không rõ"', () => {
    expect(answerLabel(qs[0], null)).toBe('Không rõ');
    expect(answerLabel(qs[1], [])).toBe('Không rõ');
  });
});

describe('Ảnh thật ở màn kết quả', () => {
  const canvas = { toDataURL: () => 'data:image/jpeg;base64,AAAA' } as unknown as HTMLCanvasElement;
  it('ngay sau khi xem: vẽ đường lên ảnh, đổi qua tranh được; rời màn hình là bỏ ảnh', () => {
    holdPhoto('s1', canvas);
    setup(withState({ palmSessions: [session()] }), <PalmResultScreen />);
    expect(screen.getByRole('img', { name: /Ảnh bàn tay của bạn/ })).toBeTruthy();
    fireEvent.click(screen.getByRole('radio', { name: 'Tranh sơ đồ' }));
    expect(screen.getByRole('img', { name: /Sơ đồ bàn tay/ })).toBeTruthy();
    cleanup();
    expect(heldPhoto('s1')).toBeNull();
  });

  it('ảnh của lần xem khác thì không hiện', () => {
    holdPhoto('khac', canvas);
    setup(withState({ palmSessions: [session()] }), <PalmResultScreen />);
    expect(screen.queryByRole('img', { name: /Ảnh bàn tay của bạn/ })).toBeNull();
    expect(screen.queryByRole('radio', { name: 'Tranh sơ đồ' })).toBeNull();
  });
});

describe('Lịch sử và so với lần trước', () => {
  const older = session({ id: 'old', date: '2026-05-01T00:00:00Z', answers: { Q01: 'right', Q02: 'H01', Q17: 'SD03', Q20: 'TD15' } });
  const newer = session({ id: 'new', date: '2026-11-10T00:00:00Z' });

  it('kết quả mới nhất: có phần so với lần trước và danh sách các lần xem trước', () => {
    const { nav } = setup(withState({ palmSessions: [older, newer] }), <PalmResultScreen />);
    expect(screen.getByRole('heading', { name: 'So với lần xem ngày 1/5/2026' })).toBeTruthy();
    expect(screen.getByText('Mới thấy ở lần này')).toBeTruthy();
    expect(screen.getByText('Không còn thấy so với lần trước')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /1\/5\/2026 · Tay phải/ }));
    expect(nav.getState().stacks.home.at(-1)).toEqual({ name: 'palm.result', id: 'old' });
  });

  it('chỉ có một lần thì không có so sánh, không có lịch sử', () => {
    setup(withState({ palmSessions: [newer] }), <PalmResultScreen />);
    expect(screen.queryByText(/So với lần xem ngày/)).toBeNull();
    expect(screen.queryByText('Các lần xem trước')).toBeNull();
  });

  it('xem lại lần cũ: có lời nhắc, xoá chỉ xoá đúng lần đó', () => {
    const { store } = setup(withState({ palmSessions: [older, newer] }), <PalmResultScreen id="old" />);
    expect(screen.getByText(/Đây là kết quả lần xem ngày 1\/5\/2026/)).toBeTruthy();
    expect(screen.queryByText('Các lần xem trước')).toBeNull();
    const ask = vi.spyOn(window, 'confirm').mockReturnValue(true);
    fireEvent.click(screen.getByRole('button', { name: 'Xoá lần xem này' }));
    expect(store.getState().palmSessions.map((p) => p.id)).toEqual(['new']);
    ask.mockRestore();
  });
});

describe('Co giãn tranh theo tỉ lệ tay thật', () => {
  // Bàn tay giả: cổ tay (0,1), khớp gốc ngón giữa (0,0); các ngón thẳng đứng, dài đúng tỉ lệ tranh thì hệ số là 1
  const hand = (fingerScale: number, width: number) => {
    const p = Array.from({ length: 21 }, () => ({ x: 0, y: 0 }));
    p[0] = { x: 0, y: 1 };
    const bases = [[-0.4, 0.6], [-width / 2, 0], [0, 0], [width / 4, 0], [width / 2, 0]];
    const ratios = [0.48, 0.84, 0.95, 0.82, 0.65];
    const first = [1, 5, 9, 13, 17];
    first.forEach((j, f) => {
      const [bx, by] = bases[f];
      // ngón cái: khớp 1 nằm ở gốc, chuỗi 2 → 4 mới tính
      const start = f === 0 ? 2 : j;
      if (f === 0) p[1] = { x: bx, y: by + 0.1 };
      const segs = f === 0 ? 2 : 3, L = ratios[f] * fingerScale;
      for (let s2 = 0; s2 <= segs; s2++) p[start + s2] = { x: bx, y: by - (L * s2) / segs };
    });
    return p;
  };
  it('tay đúng tỉ lệ tranh thì không đổi; ngón dài, bàn rộng thì giãn ra, có giới hạn', () => {
    const same = handWarp(hand(1, 0.68));
    expect(same.sx).toBeCloseTo(1);
    same.k.forEach((k) => expect(k).toBeCloseTo(1));
    const long = handWarp(hand(1.1, 0.75));
    expect(long.sx).toBeGreaterThan(1);
    long.k.forEach((k) => expect(k).toBeCloseTo(1.1));
    const extreme = handWarp(hand(2, 2));
    expect(extreme.sx).toBe(1.15);
    extreme.k.forEach((k) => expect(k).toBe(1.2));
  });

  it('mỗi ngón vẽ riêng để co giãn', () => {
    const { container } = render(<PalmDiagram session={session()} />);
    expect(container.querySelectorAll('[data-finger]')).toHaveLength(5);
  });
});
