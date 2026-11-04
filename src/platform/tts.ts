/* Đọc thành lời (ARCHITECTURE.md mục 6). Android WebView không có speechSynthesis nên dùng @capacitor-community/text-to-speech;
   trên trình duyệt plugin tự dùng speechSynthesis. `speak()` là lớp thấp cho Phase 6; `readAloud()` đọc nối tiếp nhiều đoạn,
   mỗi lúc chỉ một nơi đọc. */
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { isNative } from './native';

const LANG = 'vi-VN';

export interface SpeakOptions { rate?: number; pitch?: number }

/* App cam kết không gửi dữ liệu đi đâu, nên trên Android chỉ dùng giọng `…-local`. Giọng mặc định `vi-VN-language` có thể đọc qua
   máy chủ Google (log máy ảo: vi-vn-x-vic-server) dù báo localService = true. Không có giọng trên máy thì báo, không lùi sang mạng. */
interface VoiceInfo { lang: string; voiceURI: string; localService: boolean }

export function pickLocalVoice(voices: readonly VoiceInfo[]): number | null {
  const vi = voices.map((v, i) => ({ v, i })).filter((x) => /^vi([-_]|$)/i.test(x.v.lang) && x.v.localService);
  return (vi.find((x) => /-local$/i.test(x.v.voiceURI)) ?? (isNative() ? undefined : vi[0]))?.i ?? null;
}

let voiceIndex: number | null = null;

async function loadVoice(): Promise<number | null> {
  if (voiceIndex !== null) return voiceIndex;
  for (let attempt = 0; attempt < 2; attempt++) {
    const { voices } = await TextToSpeech.getSupportedVoices();
    if (voices.length) return (voiceIndex = pickLocalVoice(voices));
    await new Promise((r) => setTimeout(r, 600)); // dịch vụ giọng nói chưa sẵn sàng
  }
  return null;
}

async function say(text: string, voice: number | null, { rate = 1, pitch = 1 }: SpeakOptions): Promise<void> {
  if (voice === null && isNative()) throw new Error('no-local-voice');
  await TextToSpeech.speak({ text, lang: LANG, rate, pitch, volume: 1, ...(voice === null ? {} : { voice }) });
}

/** Đọc một đoạn. Promise resolve khi đọc xong đoạn đó; reject nếu máy không đọc được hoặc không có giọng trên máy. */
export async function speak(text: string, opts: SpeakOptions = {}): Promise<void> {
  await say(text, await loadVoice(), opts);
}

/** `missing` = trên Android không có giọng tiếng Việt chạy trên máy. Trình duyệt không chọn được thì `unknown`, vẫn thử đọc. */
export async function vietnameseVoice(): Promise<'ok' | 'missing' | 'unknown'> {
  voiceIndex = null; // số thứ tự giọng đổi khi người dùng cài thêm gói giọng
  try {
    if ((await loadVoice()) !== null) return 'ok';
  } catch { /* coi như không có */ }
  return isNative() ? 'missing' : 'unknown';
}

/** Mở màn hình cài dữ liệu giọng đọc của Android. Trên trình duyệt không có gì để mở. */
export async function openVoiceInstall(): Promise<void> {
  if (!isNative()) return;
  try { await TextToSpeech.openInstall(); } catch { /* máy không có màn hình này: hướng dẫn trên màn hình vẫn còn */ }
}

/* ===== Đọc nối tiếp ===== */
let token = 0;
let owner: string | null = null;
const listeners = new Set<() => void>();
const setOwner = (o: string | null) => { owner = o; listeners.forEach((f) => f()); };

export const readingOwner = (): string | null => owner;
export function subscribeReading(f: () => void): () => void {
  listeners.add(f);
  return () => { listeners.delete(f); };
}

/** Dừng đọc ngay. Gọi lúc không đọc gì cũng không sao. */
export function stopReading(): void {
  if (owner === null) return;
  token++;
  setOwner(null);
  void TextToSpeech.stop().catch(() => { /* đã dừng */ });
}

/** Đọc lần lượt các đoạn, thay cho lần đọc đang chạy nếu có. Trả `false` nếu máy lỗi giữa chừng; bị dừng hoặc đọc xong đều là `true`. */
export async function readAloud(id: string, chunks: readonly string[], opts: SpeakOptions): Promise<boolean> {
  stopReading();
  const mine = ++token;
  setOwner(id);
  try {
    const voice = await loadVoice();
    for (const c of chunks) {
      if (mine !== token) return true;
      await say(c, voice, opts);
    }
  } catch {
    if (mine !== token) return true;
    setOwner(null);
    return false;
  }
  if (mine === token) setOwner(null);
  return true;
}
