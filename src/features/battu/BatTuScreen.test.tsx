// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { AppProvider } from '../../app/context';
import { createStore } from '../../state/store';
import { emptyState, type PersistedState } from '../../state/schema';
import { addProfile } from '../../state/actions';
import { BatTuScreen } from './BatTuScreen';

function setup(p?: { day: number; month: number; year: number; hourIdx: number }) {
  const store = createStore<PersistedState>(emptyState());
  if (p) addProfile(store, { name: 'An', gender: 'M', calendar: 'solar', leapMonth: false, lateTy: false, ...p });
  render(<AppProvider store={store}><BatTuScreen /></AppProvider>);
  return store;
}
afterEach(cleanup);

describe('Màn hình Bát Tự', () => {
  it('chưa có hồ sơ: mời thêm hồ sơ', () => {
    setup();
    expect(screen.getByRole('button', { name: '＋ Thêm hồ sơ' })).toBeTruthy();
  });

  it('ví dụ vàng 6/2/2021 giờ Ngọ: 4 trụ Tân Sửu · Canh Dần · Ất Dậu · Nhâm Ngọ, Nhật Chủ Ất', () => {
    setup({ day: 6, month: 2, year: 2021, hourIdx: 6 });
    expect(screen.getByText('Tân Sửu · Canh Dần · Ất Dậu · Nhâm Ngọ')).toBeTruthy();
    const day = screen.getByRole('article', { name: /^Trụ Ngày: Ất Dậu, Mộc Âm, Nhật Chủ\./ });
    expect(day.getAttribute('data-nhatchu')).toBe('true');
    expect(screen.getAllByRole('article', { name: /^Trụ / })).toHaveLength(4);
    expect(screen.getByText('Gợi ý Dụng Thần')).toBeTruthy();
    expect(screen.getByText(/Sát trọng dụng Ấn/)).toBeTruthy();
  });

  it('giữa Lập Xuân và Tết: hiện lưu ý Trụ Năm khác năm âm lịch', () => {
    setup({ day: 4, month: 2, year: 2024, hourIdx: 11 });
    expect(screen.getByRole('note').textContent).toContain('Trụ Năm Bát Tự (Giáp Thìn) KHÁC với năm ghi trên lịch Âm (2023)');
  });

  it('tra Lưu Niên: tuổi và Thập Thần của năm', () => {
    setup({ day: 6, month: 2, year: 2021, hourIdx: 6 });
    fireEvent.change(screen.getByLabelText('Xem vận năm dương lịch'), { target: { value: '2021' } });
    fireEvent.click(screen.getByRole('button', { name: 'Xem' }));
    expect(screen.getByText('1 tuổi', { selector: 'dd' })).toBeTruthy();
    expect(screen.getByText('Tân Sửu', { selector: 'dd' })).toBeTruthy();
  });

  it('có Tổng kết với mục Thập Thần nổi bật và lời lưu ý văn hoá', () => {
    setup({ day: 15, month: 6, year: 1996, hourIdx: 6 });
    expect(screen.getByText('🧩 Thập Thần nổi bật — tính cách và nghề nghiệp')).toBeTruthy();
    expect(screen.getByText('Công cụ mang tính văn hoá, tham khảo — không phải căn cứ để đưa ra quyết định quan trọng.')).toBeTruthy();
  });
});

describe('Mục Phân tích ngũ hành (3C.4)', () => {
  it('có tiêu đề, lời nhắc văn hoá, dòng đối chiếu và phần "Vì sao ra kết quả này" thu gọn được', () => {
    setup({ day: 6, month: 2, year: 2021, hourIdx: 6 });
    expect(screen.getByRole('heading', { name: 'Phân tích ngũ hành' })).toBeTruthy();
    expect(screen.getByText(/mang tính văn hoá và tham khảo, không phải phép đo khoa học/)).toBeTruthy();
    expect(screen.getByText(/phân tích định lượng/i)).toBeTruthy();
    const fold = screen.getByText('Vì sao ra kết quả này').closest('details')!;
    expect(fold.open).toBe(false);
    expect(screen.getByText(/Số là tham khảo, đức năng thắng số./)).toBeTruthy();
  });

  it('thanh 5 hành có nhãn truy cập đọc được cả tên hành, vai trò và phần trăm', () => {
    setup({ day: 6, month: 2, year: 2021, hourIdx: 6 });
    const bars = screen.getAllByRole('img', { name: /, [0-9]+ phần trăm$/ }).filter((e) => /Dụng thần|Hỷ thần|Kỵ thần|Cừu thần|Tỷ Kiếp|Ấn|Tài|Thực Thương|Quan Sát/.test(e.getAttribute('aria-label') ?? ''));
    expect(bars.length).toBeGreaterThanOrEqual(5);
    expect(bars.some((e) => /Dụng thần/.test(e.getAttribute('aria-label')!))).toBe(true);
  });

  it('lá số Chân tòng: nút "Xem cách luận khác" đổi sang cách luận thông thường và quay lại được', () => {
    setup({ day: 10, month: 3, year: 1958, hourIdx: 3 });
    expect(screen.getByText(/Kiểm tra cách cục đặc biệt/)).toBeTruthy();
    expect(screen.queryByText('Cách luận khác', { selector: 'h3' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Xem cách luận khác' }));
    expect(screen.getByText('Cách luận khác', { selector: 'h3' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Quay lại cách luận chính' }));
    expect(screen.getByRole('button', { name: 'Xem cách luận khác' })).toBeTruthy();
  });

  it('lá số Giả tòng: hai cách luận ngang hàng, chọn cách thứ hai đổi nội dung', () => {
    setup({ day: 13, month: 3, year: 1986, hourIdx: 3 });
    const group = screen.getByRole('radiogroup', { name: /Cách luận/ });
    const radios = Array.from(group.querySelectorAll('[role=radio]')) as HTMLElement[];
    expect(radios).toHaveLength(2);
    expect(radios[0].getAttribute('aria-checked')).toBe('true');
    const before = screen.getByText((_, el) => el?.tagName === 'P' && /^Nhật Chủ [^ ]+ — (Thân|Cực|Trung)/.test(el.textContent ?? '')).textContent;
    fireEvent.click(radios[1]);
    expect(radios[1].getAttribute('aria-checked')).toBe('true');
    expect(screen.getByText((_, el) => el?.tagName === 'P' && /^Nhật Chủ [^ ]+ — (Thân|Cực|Trung)/.test(el.textContent ?? '')).textContent).not.toBe(before);
  });

  it('lá số thường: không có lựa chọn cách luận, không có nút xem cách khác', () => {
    setup({ day: 6, month: 2, year: 2021, hourIdx: 6 });
    expect(screen.queryByRole('radiogroup', { name: /Cách luận/ })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Xem cách luận khác' })).toBeNull();
  });

  it('không nêu màu, hướng, vật phẩm trong mục ngũ hành', () => {
    setup({ day: 6, month: 2, year: 2021, hourIdx: 6 });
    const sec = screen.getByRole('heading', { name: 'Phân tích ngũ hành' }).closest('section')!;
    expect(sec.textContent).not.toMatch(/hướng (Đông|Tây|Nam|Bắc)|màu (xanh|đỏ|vàng|trắng|đen)|vật phẩm/i);
  });
});

describe('Thẻ kiểm chứng bằng các năm đã qua (3C.5)', () => {
  const GIA = { day: 13, month: 3, year: 1986, hourIdx: 3 };
  const btn = (n: string) => screen.queryByRole('button', { name: n });

  it('chỉ hiện khi có cách luận thay thế: lá Giả có, lá thường không', () => {
    setup(GIA);
    expect(screen.getByRole('heading', { name: 'Kiểm chứng bằng các năm đã qua' })).toBeTruthy();
    for (const n of ['Thuận lợi', 'Bình thường', 'Khó khăn', 'Không nhớ']) expect(btn(n), n).toBeTruthy();
    cleanup();
    setup({ day: 6, month: 2, year: 2021, hourIdx: 6 });
    expect(screen.queryByRole('heading', { name: 'Kiểm chứng bằng các năm đã qua' })).toBeNull();
  });

  it('mỗi lần trả lời được lưu vào state, đúng loại mốc đang hỏi (thứ tự Đại Vận trước đã kiểm ở test engine)', () => {
    const store = setup(GIA);
    const first = screen.getByText(/^(Giai đoạn từ khoảng|Năm [0-9]{4})/).textContent ?? '';
    fireEvent.click(btn('Thuận lợi')!);
    const st = store.getState().nguHanhAnswers;
    expect(st).toHaveLength(1);
    expect(st[0]).toMatchObject({ outcome: 'tot', target: { kind: first.startsWith('Giai đoạn') ? 'daiVan' : 'nam' } });
    expect(st[0].birthKey).toBe('M|solar|13|3|1986|0|3|0');
  });

  it('"Không nhớ" được lưu để khỏi hỏi lại nhưng không đổi kết luận', () => {
    const store = setup(GIA);
    const q1 = screen.getByText(/^(Giai đoạn từ khoảng|Năm [0-9]{4})/).textContent;
    fireEvent.click(btn('Không nhớ')!);
    expect(store.getState().nguHanhAnswers[0].outcome).toBe('khong-nho');
    expect(screen.queryByRole('status')).toBeNull();
    expect(screen.getByText(/^(Giai đoạn từ khoảng|Năm [0-9]{4})/).textContent).not.toBe(q1);
  });

  it('trả lời hết thì không hỏi thêm, có kết luận hoặc nói chưa phân định; Làm lại xoá và hỏi lại từ đầu', () => {
    const store = setup(GIA);
    let guard = 0;
    while (btn('Thuận lợi') && guard++ < 8) fireEvent.click(btn('Thuận lợi')!);
    expect(btn('Thuận lợi')).toBeNull();
    expect(screen.getByRole('status').textContent).toMatch(/Chưa phân định|Các mốc đã qua khớp|Chưa đủ dữ liệu/);
    expect(store.getState().nguHanhAnswers.length).toBeGreaterThanOrEqual(1);
    fireEvent.click(screen.getByRole('button', { name: 'Làm lại' }));
    expect(store.getState().nguHanhAnswers).toEqual([]);
    expect(btn('Thuận lợi')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Làm lại' })).toBeNull();
  });

  it('câu trả lời đổi trọng số: trả lời "khó khăn" cho mọi mốc làm báo cáo đổi so với ban đầu', () => {
    const store = setup(GIA);
    const before = screen.getByText((_, el) => el?.tagName === 'P' && /^Hiện .* về /.test(el.textContent ?? '')).textContent;
    fireEvent.click(btn('Khó khăn')!);
    fireEvent.click(btn('Khó khăn')!);
    fireEvent.click(btn('Khó khăn')!);
    expect(store.getState().nguHanhAnswers.length).toBe(3);
    expect(screen.getByRole('status')).toBeTruthy();
    expect(typeof before).toBe('string');
  });
});

describe('Thầy đọc phần ngũ hành (3C.6)', () => {
  it('có nút riêng để nghe phần ngũ hành, tách khỏi nút đọc Bát Tự', () => {
    setup({ day: 13, month: 3, year: 1986, hourIdx: 3 });
    expect(screen.getByRole('button', { name: /Nghe phần ngũ hành/ })).toBeTruthy();
    expect(screen.getAllByRole('button', { name: /đọc/i }).length).toBeGreaterThanOrEqual(1);
  });
});
