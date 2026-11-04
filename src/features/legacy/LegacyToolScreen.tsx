import { CULTURAL_NOTE } from '../../content/common/notes';
import { openLegacy } from '../../platform/legacy';
import ui from '../../ui/components/ui.module.css';
import { LEGACY } from './legacyLinks';

/** Màn hình tạm cho La Bàn đến khi dựng lại ở Phase 4: giới thiệu ngắn + mở bản web đầy đủ. */
export function LegacyToolScreen() {
  return (
    <div className={ui.stack}>
      <section className={ui.card}>
        <h2>La Bàn Phong Thủy</h2>
        <p>La bàn dùng cảm biến của máy, tô màu 8 hướng theo Mệnh Quái. Cần máy thật có cảm biến từ trường; luôn có chế độ xoay tay.</p>
        <p className={ui.muted}>Màn hình mới của công cụ này đang được dựng lại. Trong lúc đó bạn dùng bản web đầy đủ đã kiểm chứng ngay trong app. Bấm Back để quay lại.</p>
        <button type="button" className={`${ui.btn} ${ui.primary} ${ui.block}`} onClick={() => openLegacy(LEGACY.laban, null)}>
          Mở bản web đầy đủ
        </button>
      </section>
      <p className={ui.muted}>{CULTURAL_NOTE}</p>
    </div>
  );
}
