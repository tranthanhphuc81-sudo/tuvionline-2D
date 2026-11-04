import { describe, it, expect } from 'vitest';
import { parseRich, toPlainText } from './rich';

describe('parseRich / toPlainText', () => {
  it('giữ thẻ cho phép, lồng nhau', () => {
    expect(parseRich('Cung Mệnh có <b>Tử Vi</b> (<i>vua</i>)')).toEqual(['Cung Mệnh có ', { tag: 'b', children: ['Tử Vi'] }, ' (', { tag: 'i', children: ['vua'] }, ')']);
    expect(parseRich('a<br>b')).toEqual(['a', { tag: 'br', children: [] }, 'b']);
    expect(parseRich('<ul><li><b>A:</b> x</li><li>y</li></ul>')).toEqual([{ tag: 'ul', children: [{ tag: 'li', children: [{ tag: 'b', children: ['A:'] }, ' x'] }, { tag: 'li', children: ['y'] }] }]);
  });
  it('thẻ ngoài danh sách in ra như chữ, không chạy mã', () => {
    expect(parseRich('<script>alert(1)</script>')).toEqual(['<script>alert(1)</script>']);
    expect(parseRich('<span class="x">a</span>')).toEqual(['<span class="x">a</span>']);
  });
  it('thẻ đóng lẻ in ra như chữ; thẻ mở không đóng vẫn bọc phần còn lại', () => {
    expect(parseRich('a</b>c')).toEqual(['a</b>c']);
    expect(parseRich('<b>a')).toEqual([{ tag: 'b', children: ['a'] }]);
  });
  it('giải mã thực thể cơ bản', () => {
    expect(parseRich('A &amp; B &lt;3')).toEqual(['A & B <3']);
  });
  it('chữ thuần: <br> và <li> xuống dòng', () => {
    expect(toPlainText(parseRich('Tứ Hoá:<ul><li>Lộc</li><li>Kỵ</li></ul>Hết<br>dòng 2'))).toBe('Tứ Hoá:\nLộc\nKỵ\nHết\ndòng 2');
  });
});
