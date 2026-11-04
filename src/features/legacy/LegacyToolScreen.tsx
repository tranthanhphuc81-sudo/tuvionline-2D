import { CULTURAL_NOTE } from '../../content/common/notes';
import { selectActiveProfile } from '../../state/actions';
import { openLegacy } from '../../platform/legacy';
import { useApp } from '../../app/context';
import ui from '../../ui/components/ui.module.css';
import { LEGACY, type LegacyKey } from './legacyLinks';

const INFO: Record<LegacyKey, { title: string; intro: string; usesProfile: boolean }> = {
  tuvi: { title: 'Tử Vi Đẩu Số', intro: 'Lá số 12 cung, 14 chính tinh và phụ tinh, Tứ Hoá, Đại Hạn, tra vận theo năm, giải thích và tổng kết.', usesProfile: true },
  battu: { title: 'Bát Tự Tứ Trụ', intro: 'Bốn trụ Năm – Tháng – Ngày – Giờ theo tiết khí, Thập Thần, Vượng Suy, Đại Vận và Lưu Niên.', usesProfile: true },
  luchao: { title: 'Lục Hào', intro: 'Gieo quẻ bằng ba đồng xu, xem quẻ chủ, quẻ biến, Nạp Giáp, Lục Thân, Thế – Ứng và luận đoán theo việc hỏi.', usesProfile: false },
  battrach: { title: 'Bát Trạch', intro: 'Mệnh Quái theo năm sinh (đổi năm theo Lập Xuân), nhóm Đông/Tây Tứ Mệnh, 8 sao Du Niên và hướng hợp.', usesProfile: true },
  laban: { title: 'La Bàn Phong Thủy', intro: 'La bàn dùng cảm biến của máy, tô màu 8 hướng theo Mệnh Quái. Cần máy thật có cảm biến từ trường; luôn có chế độ xoay tay.', usesProfile: false },
  napam: { title: 'Nạp Âm & hợp hôn', intro: 'Mạng Nạp Âm theo năm âm lịch (đổi năm vào Tết) và quan hệ sinh khắc giữa hai người, kể cả các ngoại lệ dân gian.', usesProfile: true },
  tonghop: { title: 'Tổng hợp', intro: 'Bảng tổng hợp bốn hệ thống của bản web.', usesProfile: true },
};

/** Màn hình tạm cho công cụ chưa dựng lại: giới thiệu ngắn + mở bản web đầy đủ (tự điền hồ sơ đang xem). */
export function LegacyToolScreen({ tool }: { tool: LegacyKey }) {
  const profile = useApp(selectActiveProfile);
  const info = INFO[tool];
  return (
    <div className={ui.stack}>
      <section className={ui.card}>
        <h2>{info.title}</h2>
        <p>{info.intro}</p>
        <p className={ui.muted}>
          Màn hình mới của công cụ này đang được dựng lại. Trong lúc đó bạn dùng bản web đầy đủ đã kiểm chứng ngay trong app
          {info.usesProfile && profile ? <> — trang sẽ tự điền hồ sơ <b>{profile.name}</b>.</> : '.'} Bấm Back để quay lại.
        </p>
        <button type="button" className={`${ui.btn} ${ui.primary} ${ui.block}`} onClick={() => openLegacy(LEGACY[tool], info.usesProfile ? profile : null)}>
          Mở bản web đầy đủ
        </button>
      </section>
      <p className={ui.muted}>{CULTURAL_NOTE}</p>
    </div>
  );
}
