import { describe, it, expect } from 'vitest';
import { initialRouter, push, routerBack, selectTab, currentRoute, replaceTop } from './router';
import { createBackStack } from '../platform/backStack';

describe('router', () => {
  it('mỗi tab một ngăn xếp riêng, chuyển tab không mất màn hình con', () => {
    let s = initialRouter();
    s = push(s, { name: 'profiles' });
    s = selectTab(s, 'tuvi');
    expect(currentRoute(s)).toEqual({ name: 'tuvi' });
    s = selectTab(s, 'home');
    expect(currentRoute(s)).toEqual({ name: 'profiles' });
  });
  it('chạm lại tab đang mở thì về gốc', () => {
    let s = push(initialRouter(), { name: 'settings' });
    s = selectTab(s, 'home');
    expect(s.stacks.home).toEqual([{ name: 'home' }]);
  });
  it('replaceTop đổi màn hình trên cùng', () => {
    let s = selectTab(initialRouter(), 'phongthuy');
    s = replaceTop(s, { name: 'phongthuy', sub: 'napam' });
    expect(currentRoute(s)).toEqual({ name: 'phongthuy', sub: 'napam' });
  });
});

describe('bảng quy tắc Back (ARCHITECTURE mục 1.3)', () => {
  it('màn hình con → lùi; tab khác → về Tổng hợp; gốc Tổng hợp → thu nhỏ', () => {
    let s = selectTab(initialRouter(), 'battu');
    s = push(s, { name: 'settings' });
    let r = routerBack(s);
    expect(r.action).toBe('handled');
    expect(currentRoute(r.state)).toEqual({ name: 'battu' });
    r = routerBack(r.state);
    expect(r.state.tab).toBe('home');
    r = routerBack(r.state);
    expect(r.action).toBe('minimize');
  });
  it('trình xử lý đăng ký sau cùng chạy trước; trả false thì chuyển tiếp', () => {
    const b = createBackStack();
    const log: string[] = [];
    b.setFallback(() => { log.push('router'); return 'handled'; });
    const off1 = b.register(() => { log.push('sheet'); return true; });
    const off2 = b.register(() => { log.push('dialog-closed'); return false; });
    expect(b.dispatch()).toBe('handled');
    expect(log).toEqual(['dialog-closed', 'sheet']);
    off1(); off2();
    b.dispatch();
    expect(log).toEqual(['dialog-closed', 'sheet', 'router']);
    expect(b.size).toBe(0);
  });
  it('không có fallback riêng thì thu nhỏ', () => {
    expect(createBackStack().dispatch()).toBe('minimize');
  });
});
