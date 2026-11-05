/* Đọc thành lời trên trình duyệt. Không dùng phần web của plugin vì nó gọi cancel() ngay trước speak() (Chrome Android có thể nuốt
   mất câu đọc), chỉ đặt `lang` cố định và không có giới hạn chờ nên trình duyệt im lặng thì app cũng không biết.
   Cùng dạng với plugin (`speak`, `stop`, `getSupportedVoices`) để `tts.ts` dùng chung một luồng. */

export interface WebSpeakOptions { text: string; lang: string; rate?: number; pitch?: number; volume?: number; voice?: number }

const VOICES_WAIT_MS = 1000, CANCEL_GAP_MS = 150, START_TIMEOUT_MS = 10000;
/** Quá thời gian này mà chưa báo xong thì coi như xong: có trình duyệt không bắn sự kiện `end`. */
export const speechLimitMs = (text: string, rate = 1): number => 10000 + (text.length / (4 * rate)) * 1000;

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function synthesis(): SpeechSynthesis {
  // Trình duyệt nhúng trong Zalo, Facebook là WebView, không có speechSynthesis.
  if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') throw new Error('unsupported');
  return window.speechSynthesis;
}

let voices: SpeechSynthesisVoice[] = [];
let generation = 0;
/** Giữ tham chiếu: câu đọc bị dọn khỏi bộ nhớ giữa chừng thì không còn sự kiện nào báo về. */
let current: SpeechSynthesisUtterance | null = null;

export const webSpeech = {
  /** Danh sách giọng trên Chrome nạp không đồng bộ, lần gọi đầu thường rỗng. */
  async getSupportedVoices(): Promise<{ voices: SpeechSynthesisVoice[] }> {
    const synth = synthesis();
    if (!voices.length) voices = synth.getVoices();
    if (!voices.length) {
      await new Promise<void>((done) => {
        const finish = () => { clearTimeout(timer); synth.removeEventListener('voiceschanged', finish); done(); };
        const timer = setTimeout(finish, VOICES_WAIT_MS);
        synth.addEventListener('voiceschanged', finish);
      });
      voices = synth.getVoices();
    }
    return { voices };
  },

  async stop(): Promise<void> {
    generation++;
    synthesis().cancel();
  },

  async speak({ text, lang, rate = 1, pitch = 1, volume = 1, voice }: WebSpeakOptions): Promise<void> {
    const synth = synthesis();
    const mine = ++generation;
    if (synth.speaking || synth.pending) {
      synth.cancel();
      await wait(CANCEL_GAP_MS);
      if (mine !== generation) throw new Error('canceled');
    }
    synth.resume(); // Chrome có thể kẹt ở trạng thái tạm dừng sau khi trang bị ẩn
    return new Promise<void>((resolve, reject) => {
      const u = new SpeechSynthesisUtterance(text);
      const chosen = voice === undefined ? undefined : voices[voice];
      if (chosen) u.voice = chosen;
      u.lang = chosen ? chosen.lang.replace('_', '-') : lang; // Android bỏ qua `voice` nếu `lang` không khớp
      u.rate = rate; u.pitch = pitch; u.volume = volume;
      let endTimer: ReturnType<typeof setTimeout> | undefined;
      const finish = (error?: Error) => {
        clearTimeout(startTimer); clearTimeout(endTimer);
        if (current === u) current = null;
        if (error) reject(error); else resolve();
      };
      const startTimer = setTimeout(() => { synth.cancel(); finish(new Error('no-start')); }, START_TIMEOUT_MS);
      u.onstart = () => { clearTimeout(startTimer); endTimer = setTimeout(() => finish(), speechLimitMs(text, rate)); };
      u.onend = () => finish();
      u.onerror = (e) => finish(new Error(e.error || 'speech-error'));
      current = u;
      synth.speak(u);
    });
  },
};
