/* Báo lúc khởi động (chuyển dữ liệu bản trước, dữ liệu hỏng). Tách khỏi HomeScreen để Tĩnh thất dùng mà không kéo màn
   Tổng hợp vào gói chính (ARCHITECTURE 4.2). */
import { useAppCtx } from '../../app/context';
import ui from '../../ui/components/ui.module.css';

export function BootNoticeBanner() {
  const { notice } = useAppCtx();
  if (!notice) return null;
  if (notice.kind === 'imported-legacy') {
    return <p className={ui.info} role="status">Đã chuyển thông tin bạn nhập ở bản trước thành hồ sơ đầu tiên. Bạn có thể đổi tên hồ sơ trong mục Quản lý hồ sơ.</p>;
  }
  return (
    <p className={ui.error} role="alert">
      Dữ liệu đã lưu trên máy bị hỏng nên không đọc được ({notice.error}). App khởi động với dữ liệu trống; bản sao dữ liệu cũ vẫn được
      giữ nguyên trên máy để khôi phục sau.
    </p>
  );
}
