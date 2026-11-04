// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { applyTheme } from './theme';

describe('applyTheme', () => {
  it('đặt/bỏ data-theme trên <html> và tạo thẻ theme-color', () => {
    applyTheme('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(document.querySelector('meta[name="theme-color"]')).not.toBeNull();
    applyTheme('system');
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
  });
});
