import { PALM_GUIDE_STEPS } from '../../content/palm/ui';
import s from './palm.module.css';

/** Các bước chạm đường, dùng ở màn bắt đầu và trong bảng "Cách chạm". */
export function PalmGuideSteps() {
  return (
    <ol className={s.guide}>
      {PALM_GUIDE_STEPS.map((g) => (
        <li key={g.title}><b>{g.title}.</b> {g.text}</li>
      ))}
    </ol>
  );
}
