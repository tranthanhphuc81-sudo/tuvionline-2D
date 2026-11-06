/* Đọc thành lời (ARCHITECTURE.md mục 6). Android WebView không có speechSynthesis nên dùng @capacitor-community/text-to-speech;
   trên trình duyệt dùng `webSpeech.ts`. `speak()` là lớp thấp cho Phase 6; `readAloud()` đọc nối tiếp nhiều đoạn,
   mỗi lúc chỉ một nơi đọc. */
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { isNative } from './native';
import { webSpeech } from './webSpeech';

const LANG = 'vi-VN';
const engine = () => (isNative() ? TextToSpeech : webSpeech);

export interface SpeakOptions { rate?: number; pitch?: number }

/* App cam kết không gửi dữ liệu đi đâu, nên trên Android chỉ dùng giọng `…-local`. Giọng mặc định `vi-VN-language` có thể đọc qua
   máy chủ Google (log máy ảo: vi-vn-x-vic-server) dù báo localService = true. Không có giọng trên máy thì báo, không lùi sang mạng. */
interface VoiceInfo { lang: string; voiceURI: string; localService: boolean }

export function pickLocalVoice(voices: readonly VoiceInfo[], preferred: string | null = null): number | null {
  const chosen = preferred === null ? -1 : voices.findIndex((v) => v.voiceURI === preferred && /^vi([-_]|$)/i.test(v.lang) && v.localService);
  if (chosen >= 0) return chosen;
  const vi = voices.map((v, i) => ({ v, i })).filter((x) => /^vi([-_]|$)/i.test(x.v.lang) && x.v.localService);
  return (vi.find((x) => /-local$/i.test(x.v.voiceURI)) ?? (isNative() ? undefined : vi[0]))?.i ?? null;
}

/* Plugin không có giới hạn chờ: dịch vụ giọng đọc kẹt (máy thiếu gói giọng) thì promise không bao giờ xong và app đứng im.
   Giới hạn rộng gấp đôi tốc độ đọc thường, để câu dài trên máy chậm không bị cắt oan. Trình duyệt đã có giới hạn trong webSpeech.ts. */
const SPEAK_TIMEOUT = 'speech-timeout';
const VOICES_LIMIT_MS = 5000, SPEAK_BASE_MS = 8000, MIN_CHARS_PER_SEC = 6;
/** Quá thời gian này mà plugin chưa báo xong thì coi là treo. */
export const speakLimitMs = (text: string, rate = 1): number => SPEAK_BASE_MS + (text.length / (MIN_CHARS_PER_SEC * rate)) * 1000;

function withLimit<T>(p: Promise<T>, ms: number, code: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const expired = new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error(code)), ms); });
  return Promise.race([p, expired]).finally(() => clearTimeout(timer));
}

let voiceIndex: number | null = null;
let preferredVoice: string | null = null;
let lastError: string | null = null;
let sayCount = 0;

/** Mã lỗi của lần đọc hỏng gần nhất, để hiện cho người dùng và báo lại khi cần dò lỗi. */
export const lastSpeechError = (): string | null => lastError;

/** Giọng người dùng chọn trong Cài đặt; `null` = tự chọn. Giọng đã gỡ khỏi máy thì quay về tự chọn. */
export function setPreferredVoice(uri: string | null): void {
  if (uri === preferredVoice) return;
  preferredVoice = uri;
  voiceIndex = null;
}

/** Các giọng tiếng Việt chạy trên máy, để chọn trong Cài đặt. */
export async function localVietnameseVoices(): Promise<string[]> {
  try {
    const { voices } = await engine().getSupportedVoices();
    return voices.filter((v) => /^vi([-_]|$)/i.test(v.lang) && v.localService && (!isNative() || /-local$/i.test(v.voiceURI))).map((v) => v.voiceURI);
  } catch {
    return [];
  }
}

async function loadVoice(): Promise<number | null> {
  if (voiceIndex !== null) return voiceIndex;
  for (let attempt = 0; attempt < 2; attempt++) {
    const { voices } = await withLimit(engine().getSupportedVoices(), VOICES_LIMIT_MS, 'voices-timeout');
    if (voices.length) return (voiceIndex = pickLocalVoice(voices, preferredVoice));
    await new Promise((r) => setTimeout(r, 600)); // dịch vụ giọng nói chưa sẵn sàng
  }
  return null;
}

async function say(text: string, voice: number | null, { rate = 1, pitch = 1 }: SpeakOptions): Promise<void> {
  if (voice === null && isNative()) throw new Error('no-local-voice');
  const mine = ++sayCount;
  try {
    const spoken = engine().speak({ text, lang: LANG, rate, pitch, volume: 1, ...(voice === null ? {} : { voice }) });
    await (isNative() ? withLimit(spoken, speakLimitMs(text, rate), SPEAK_TIMEOUT) : spoken);
  } catch (e) {
    // Lượt đọc cũ hết giờ sau khi đoạn mới đã bắt đầu thì bỏ qua, không được ngắt đoạn mới.
    if (mine !== sayCount) throw e;
    lastError = e instanceof Error ? e.message : String(e);
    if (lastError === SPEAK_TIMEOUT) void haltSpeech();
    throw e;
  }
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
/** Một đoạn đọc. `text` rỗng = không đọc thành tiếng, chỉ hiện phụ đề đủ lâu để xem chữ. */
export interface SpeechItem { text: string; caption?: string }
interface Session {
  id: string; chunks: readonly SpeechItem[]; opts: SpeakOptions; index: number; paused: boolean;
  finish(ok: boolean): void;
}
/** Vị trí đang đọc cho thanh điều khiển. `index` tính từ 0. */
export interface ReadingState { id: string; index: number; total: number; paused: boolean; /** chữ của đoạn đang đọc, để làm phụ đề */ text: string; cue: SpeechItem }
const READ_CHARS_PER_SEC = 15, MIN_SILENT_MS = 3000;
/** Thời gian dừng ở đoạn chỉ có chữ. */
export const silentMs = (caption: string): number => Math.max(MIN_SILENT_MS, (caption.length / READ_CHARS_PER_SEC) * 1000);

let token = 0;
let session: Session | null = null;
let state: ReadingState | null = null;
const listeners = new Set<() => void>();
const publish = () => {
  const cue = session?.chunks[session.index] ?? { text: '' };
  state = session && { id: session.id, index: session.index, total: session.chunks.length, paused: session.paused, text: cue.caption ?? cue.text, cue };
  listeners.forEach((f) => f());
};

export const readingOwner = (): string | null => session?.id ?? null;
export const readingState = (): ReadingState | null => state;
export function subscribeReading(f: () => void): () => void {
  listeners.add(f);
  return () => { listeners.delete(f); };
}

const haltSpeech = () => engine().stop().catch(() => { /* đã dừng */ });

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
      const cue = s.chunks[s.index];
      if (cue.text) await say(cue.text, voice, s.opts);
      else await new Promise((r) => setTimeout(r, silentMs(cue.caption ?? '')));
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
export function readAloud(id: string, chunks: readonly (string | SpeechItem)[], opts: SpeakOptions): Promise<boolean> {
  stopReading();
  return new Promise((finish) => {
    const s: Session = { id, chunks: chunks.map((c) => (typeof c === 'string' ? { text: c } : c)), opts, index: 0, paused: false, finish };
    session = s;
    publish();
    void play(s);
  });
}
