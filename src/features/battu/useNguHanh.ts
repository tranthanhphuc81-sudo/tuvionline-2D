/* Trạng thái phân tích ngũ hành của một hồ sơ, dùng chung cho màn Bát Tự và Tĩnh thất (Phase 3C.6):
   phân tích gốc, câu trả lời kiểm chứng còn dùng được, phân tích sau khi gộp câu trả lời, câu hỏi kế tiếp. */
import { useMemo } from 'react';
import type { BatTuChart } from '../../core';
import { analyze, resolveWithFeedback, toNguHanhChart, verificationQuestions } from '../../core/nguhanh';
import { useApp } from '../../app/context';
import { birthKeyOf } from '../../state/schema';
import { ASK_OPTIONS, nextNguHanhQuestion } from '../reader/nguhanhScript';

export function useNguHanh(ch: BatTuChart, nowYear: number, profileId: string) {
  const allAnswers = useApp((x) => x.nguHanhAnswers);
  const birthKey = useApp((x) => { const p = x.profiles.find((q) => q.id === profileId); return p ? birthKeyOf(p) : ''; });
  const mine = useMemo(() => allAnswers.filter((x) => x.profileId === profileId && x.birthKey === birthKey), [allAnswers, profileId, birthKey]);
  const base = useMemo(() => analyze(toNguHanhChart(ch)), [ch]);
  // "Không nhớ" được lưu để khỏi hỏi lại nhưng không đưa vào engine, không đổi trọng số
  const resolved = useMemo(() => {
    const fb = mine.filter((x) => x.outcome !== 'khong-nho').map((x) => ({ target: x.target, outcome: x.outcome as 'tot' | 'binh' | 'xau' }));
    return fb.length ? resolveWithFeedback(base, fb) : null;
  }, [base, mine]);
  const a = resolved ? resolved.analysis : base;
  const questions = useMemo(() => verificationQuestions(base, { nowYear, ...ASK_OPTIONS }), [base, nowYear]);
  const next = useMemo(() => nextNguHanhQuestion(base, !!resolved?.decided, mine, nowYear), [base, resolved, mine, nowYear]);
  return { base, a, mine, resolved, questions, next };
}
