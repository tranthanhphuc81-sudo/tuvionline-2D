/* Rung nhẹ (ARCHITECTURE.md mục 6): chỉ gọi plugin trên Android; trên trình duyệt không làm gì. */
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { isNative } from './native';

/** Một cú rung nhẹ — dùng khi gieo quẻ xong. Không bao giờ ném lỗi. */
export async function tapLight(): Promise<void> {
  if (!isNative()) return;
  try { await Haptics.impact({ style: ImpactStyle.Light }); } catch { /* máy không hỗ trợ rung */ }
}
