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
interface Session {
  id: string; chunks: readonly string[]; opts: SpeakOptions; index: number; paused: boolean;
  finish(ok: boolean): void;
}
/** Vị trí đang đọc cho thanh điều khiển. `index` tính từ 0. */
export interface ReadingState { id: string; index: number; total: number; paused: boolean; /** đoạn đang đọc, để làm phụ đề */ text: string }

let token = 0;
let session: Session | null = null;
let state: ReadingState | null = null;
const listeners = new Set<() => void>();
const publish = () => {
  state = session && { id: session.id, index: session.index, total: session.chunks.length, paused: session.paused, text: session.chunks[session.index] ?? '' };
  listeners.forEach((f) => f());
};

export const readingOwner = (): string | null => session?.id ?? null;
export const readingState = (): ReadingState | null => state;
export function subscribeReading(f: () => void): () => void {
  listeners.add(f);
  return () => { listeners.delete(f); };
}

const haltSpeech = () => TextToSpeech.stop().catch(() => { /* đã dừng */ });

function end(s: Session, ok: boolean): void {
  session = null;
  publish();
  s.finish(ok);
}

/** Đọc từ `s.index` tới hết. Mỗi lần gọi là một lượt: tăng `token` thì lượt cũ tự thôi, kể cả khi đoạn đang đọc không báo xong. */
async function play(s: Session): Promise<void> {
  const mine = ++token;
  try {
    const voice = await loadVoice();
    while (mine === token && s.index < s.chunks.length) {
      await say(s.chunks[s.index], voice, s.opts);
      if (mine !== token) return;
      s.index++;
      if (s.index < s.chunks.length) publish();
    }
  } catch {
    if (mine === token) end(s, false);
    return;
  }
  if (mine === token) end(s, true);
}

/** Dừng đọc ngay. Gọi lúc không đọc gì cũng không sao. */
export function stopReading(): void {
  if (!session) return;
  token++;
  end(session, true);
  void haltSpeech();
}

/** Tạm dừng. Đoạn đang đọc bị ngắt, đọc tiếp sẽ đọc lại từ đầu đoạn đó vì plugin không dừng giữa câu được. */
export function pauseReading(): void {
  if (!session || session.paused) return;
  token++;
  session.paused = true;
  publish();
  void haltSpeech();
}

export function resumeReading(): void {
  if (!session?.paused) return;
  session.paused = false;
  publish();
  void play(session);
}

/** Lùi (`-1`) hoặc tiến (`1`) một đoạn; đang ở đoạn đầu mà lùi thì đọc lại đoạn đầu. Đang tạm dừng thì chỉ đổi vị trí. */
export async function skipReading(delta: number): Promise<void> {
  const s = session;
  if (!s) return;
  s.index = Math.min(Math.max(s.index + delta, 0), s.chunks.length - 1);
  publish();
  if (s.paused) return;
  const mine = ++token;
  await haltSpeech();
  if (mine === token && session === s && !s.paused) void play(s);
}

/** Đổi tốc độ, cao độ của lần đọc `id` đang chạy: đọc lại đoạn hiện tại với giọng mới. Lần đọc khác thì bỏ qua. */
export function setReadingOptions(id: string, opts: SpeakOptions): void {
  if (session?.id !== id) return;
  session.opts = opts;
  void skipReading(0);
}

/** Đọc lần lượt các đoạn, thay cho lần đọc đang chạy nếu có. Trả `false` nếu máy lỗi giữa chừng; bị dừng hoặc đọc xong đều là `true`. */
export function readAloud(id: string, chunks: readonly string[], opts: SpeakOptions): Promise<boolean> {
  stopReading();
  return new Promise((finish) => {
    const s: Session = { id, chunks, opts, index: 0, paused: false, finish };
    session = s;
    publish();
    void play(s);
  });
}
