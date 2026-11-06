/* Chia sẻ file qua bảng chia sẻ của Android (ảnh kết quả, file sao lưu). Chỉ gửi khi người dùng bấm và tự chọn nơi nhận.
   Android: ghi vào Cache/share rồi đưa URI cho @capacitor/share. Trình duyệt: Web Share nếu có, không thì tải file về. */
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { isNative } from './native';

export type ShareOutcome = 'shared' | 'saved' | 'cancelled';

const SHARE_DIR = 'share';

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(',')[1] ?? '');
    r.onerror = () => reject(r.error ?? new Error('Không đọc được dữ liệu file'));
    r.readAsDataURL(blob);
  });
}

/** File chia sẻ có thể chứa ngày sinh, nên không để lại lâu trong bộ nhớ đệm. Không có thư mục thì thôi. */
export async function clearShareCache(): Promise<void> {
  if (!isNative()) return;
  await Filesystem.rmdir({ path: SHARE_DIR, directory: Directory.Cache, recursive: true }).catch(() => undefined);
}

async function shareNative(blob: Blob, name: string, title: string): Promise<ShareOutcome> {
  await clearShareCache();
  const { uri } = await Filesystem.writeFile({ path: `${SHARE_DIR}/${name}`, data: await blobToBase64(blob), directory: Directory.Cache, recursive: true });
  try {
    await Share.share({ title, files: [uri], dialogTitle: title });
    return 'shared';
  } catch (e) {
    if (/cancel/i.test(String((e as Error)?.message ?? e))) return 'cancelled';
    throw e;
  }
}

async function shareWeb(blob: Blob, name: string, title: string): Promise<ShareOutcome> {
  const file = new File([blob], name, { type: blob.type });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ title, files: [file] });
      return 'shared';
    } catch (e) {
      if ((e as Error)?.name === 'AbortError') return 'cancelled';
      // Trình duyệt từ chối chia sẻ thì tải file về
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
  return 'saved';
}

export function shareFile(blob: Blob, name: string, title: string): Promise<ShareOutcome> {
  return isNative() ? shareNative(blob, name, title) : shareWeb(blob, name, title);
}
