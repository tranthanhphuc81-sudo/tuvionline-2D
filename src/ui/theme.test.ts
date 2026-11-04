// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { applyTheme } from './theme';
import { toLegacyShared } from '../platform/legacy';

describe('applyTheme', () => {
  it('đặt/bỏ data-theme trên <html> và tạo thẻ theme-color', () => {
    applyTheme('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(document.querySelector('meta[name="theme-color"]')).not.toBeNull();
    applyTheme('system');
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
  });
});

describe('toLegacyShared', () => {
  it('chuyển hồ sơ sang định dạng lyso-shared-v1 của trang legacy', () => {
    expect(toLegacyShared({ gender: 'F', calendar: 'lunar', day: 1, month: 2, year: 2023, leapMonth: true, hourIdx: 0, lateTy: true }))
      .toEqual({ gender: 'F', calType: 'lunar', dd: 1, mm: 2, yy: 2023, leap: 1, hourIdx: 0, lateTy: true });
    expect(toLegacyShared({ gender: 'M', calendar: 'solar', day: 1, month: 2, year: 2023, leapMonth: true, hourIdx: 3, lateTy: false }).leap).toBe(0);
  });
});
