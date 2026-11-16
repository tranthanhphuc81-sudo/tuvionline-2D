/* Nút gõ chuông (ARCHITECTURE 16.4): chạm thì máy rung nhẹ và chuông ngân một tiếng. Không bắt buộc, không chặn gì.
   Máy để im lặng hoặc rung thì chỉ rung, không phát tiếng (soundAllowed). */
import { tapLight } from '../../platform/haptics';
import { ringBell } from '../../platform/ambientAudio';
import { soundAllowed } from '../../platform/device';

export function BellButton({ className, onRing }: { className?: string; /** lối vào: dùng chuông của bộ tiếng đang phát thay vì tạo tiếng mới */ onRing?(): boolean }) {
  const ring = () => {
    void tapLight();
    if (!onRing?.()) ringBell(soundAllowed());
  };
  return (
    <button type="button" className={className} aria-label="Gõ chuông" onPointerUp={(e) => e.stopPropagation()} onClick={ring}>
      <span aria-hidden="true">🔔</span>
    </button>
  );
}
