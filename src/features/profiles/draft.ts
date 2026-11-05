/* Bản nháp hồ sơ dùng chung cho form đầy đủ và phần hỏi lần lượt ở Tĩnh thất, để hai nơi kiểm tra ngày theo đúng một logic. */
import { useMemo } from 'react';
import { resolveBirth } from '../../core';
import type { ProfileInput } from '../../state/actions';
import type { Relation } from '../../state/schema';

export interface Draft {
  name: string; relation: Relation | ''; gender: 'M' | 'F'; calendar: 'solar' | 'lunar';
  day: string; month: string; year: string; leapMonth: boolean; hourIdx: number; lateTy: boolean;
}

export const MISSING_DATE = 'Vui lòng nhập đủ ngày, tháng, năm sinh (năm từ 1900 đến 2100).';

export function toDraft(p?: ProfileInput): Draft {
  if (!p) return { name: '', relation: '', gender: 'M', calendar: 'solar', day: '', month: '', year: '', leapMonth: false, hourIdx: 6, lateTy: false };
  return { ...p, relation: p.relation ?? '', day: String(p.day), month: String(p.month), year: String(p.year) };
}

export function toInput(d: Draft): ProfileInput | null {
  const day = parseInt(d.day, 10), month = parseInt(d.month, 10), year = parseInt(d.year, 10);
  if (![day, month, year].every(Number.isInteger)) return null;
  const p: ProfileInput = { name: d.name, gender: d.gender, calendar: d.calendar, day, month, year, leapMonth: d.leapMonth, hourIdx: d.hourIdx, lateTy: d.lateTy };
  if (d.relation) p.relation = d.relation;
  return p;
}

/** Quy đổi ngày đang nhập, chỉ tính lại khi các ô ngày giờ đổi. */
export function useDraftBirth(input: ProfileInput | null) {
  return useMemo(() => (input ? resolveBirth(input) : null), [input?.calendar, input?.day, input?.month, input?.year, input?.leapMonth, input?.hourIdx, input?.lateTy]); // eslint-disable-line react-hooks/exhaustive-deps
}
