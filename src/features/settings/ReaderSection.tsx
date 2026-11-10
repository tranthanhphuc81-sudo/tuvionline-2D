/* Cài đặt → Người đọc: chọn nhân vật ngồi ở Tĩnh thất và đọc kết quả, màu áo, hoặc dùng ảnh của chính mình; nghe thử từng giọng.
   Lời đọc tự xưng theo nhân vật (thầy, cô, bà, ông, chị…). */
import { useRef, useState } from 'react';
import { CUSTOM_READER, CUSTOM_TA, DEFAULT_CUSTOM, PERSONAS, ROBES, ROBE_IDS, robeOf, readerPersona } from '../../content/reader/personas';
import { speechFailedText } from '../../content/speech';
import { isNative } from '../../platform/native';
import { lastSpeechError, openVoiceInstall, setPreferredVoice, speak } from '../../platform/tts';
import { setSetting } from '../../state/actions';
import type { CustomReader } from '../../state/schema';
import { useApp, useAppCtx } from '../../app/context';
import { Segmented } from '../../ui/components/Segmented';
import ui from '../../ui/components/ui.module.css';
import { Character } from '../reader/Character';
import { removeReaderPhoto, saveReaderPhoto } from '../reader/customPhoto';
import { thayVoice, useReader } from '../reader/hooks';
import { useReaderPhoto, useStandingPhoto } from '../reader/ReaderFigure';
import s from '../reader/reader.module.css';

const CUTOUT_FAILED = 'Chưa tách được người ra khỏi nền ảnh này nên ảnh sẽ nằm trong khung tròn. Ảnh chân dung rõ mặt, nền đơn giản sẽ tách đẹp hơn.';
const sample = (ta: string) => `${ta.charAt(0).toLocaleUpperCase('vi') + ta.slice(1)} chào bạn. Số là tham khảo, đức năng thắng số.`;

export function ReaderSection({ voices }: { voices: readonly string[] }) {
  const { store } = useAppCtx();
  const reader = useApp((x) => x.settings.reader);
  const robe = useApp((x) => x.settings.readerRobe);
  const custom = useApp((x) => x.settings.readerCustom) ?? DEFAULT_CUSTOM;
  const voice = useApp((x) => x.settings.ttsVoice);
  const rate = useApp((x) => x.settings.ttsRate);
  const pitch = useApp((x) => x.settings.ttsPitch);
  const { persona } = useReader();
  const { photo, cutout } = useReaderPhoto();
  const standing = useStandingPhoto();
  const file = useRef<HTMLInputElement>(null);
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [photoNote, setPhotoNote] = useState<string | null>(null);
  const isCustom = reader === CUSTOM_READER;
  const current = isCustom ? CUSTOM_READER : persona.id;

  const setCustom = (patch: Partial<CustomReader>) => setSetting(store, 'readerCustom', { ...custom, ...patch });
  const listen = async (uri?: string) => {
    setNote(null);
    if (uri !== undefined) setPreferredVoice(uri);
    try { await speak(sample(persona.ta), thayVoice(rate, pitch)); } catch { setNote(speechFailedText(isNative(), lastSpeechError())); }
    if (uri !== undefined) setPreferredVoice(voice ?? null);
  };
  const pickPhoto = async (f: File | undefined) => {
    if (!f) return;
    setBusy(true); setPhotoNote(null); setNote(null);
    try {
      const r = await saveReaderPhoto(f);
      setSetting(store, 'readerCustom', { ...custom, frame: undefined });
      setSetting(store, 'reader', CUSTOM_READER);
      if (!r.cutout) setPhotoNote(CUTOUT_FAILED);
    } catch { setPhotoNote('Không đọc được ảnh này. Bạn thử chọn ảnh khác nhé.'); }
    setBusy(false);
  };

  return (
    <section className={ui.card} aria-labelledby="reader-title">
      <h2 id="reader-title">Người đọc</h2>
      <p className={ui.muted}>Chọn người ngồi ở Tĩnh thất và đọc kết quả cho bạn. Lời đọc tự xưng theo nhân vật.</p>
      <div className={s.grid} role="radiogroup" aria-label="Nhân vật">
        {PERSONAS.map((p) => (
          <button key={p.id} type="button" role="radio" aria-checked={current === p.id} aria-label={`${p.name}: ${p.note}`} className={s.card} onClick={() => setSetting(store, 'reader', p.id)}>
            <Character name={p.id} state="idle" robe={ROBES[robeOf(p, robe)].colors} className={s.preview} />
            <span className={s.cardName} aria-hidden="true">{p.name}</span>
            <span className={s.cardNote} aria-hidden="true">{p.note}</span>
          </button>
        ))}
        <button type="button" role="radio" aria-checked={isCustom} aria-label="Ảnh của bạn: dùng ảnh tự chọn làm người đọc" className={s.card}
          onClick={() => (photo ? setSetting(store, 'reader', CUSTOM_READER) : file.current?.click())}>
          {standing ? <img className={s.previewStand} src={standing} alt="" />
            : photo ? <img className={s.previewPhoto} src={photo} alt="" /> : <span className={s.previewEmpty} aria-hidden="true">＋</span>}
          <span className={s.cardName} aria-hidden="true">Ảnh của bạn</span>
          <span className={s.cardNote} aria-hidden="true">{photo ? custom.name : 'Chọn một ảnh'}</span>
        </button>
      </div>
      <input ref={file} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => { void pickPhoto(e.target.files?.[0]); e.target.value = ''; }} />

      {isCustom ? (
        <div className={ui.stack}>
          <p className={ui.muted}>Ảnh chỉ lưu trên máy này, không gửi đi đâu và không nằm trong file sao lưu. App tự tách người ra khỏi nền ngay trên máy để người đứng trong Tĩnh thất như các nhân vật vẽ sẵn. Nên chọn ảnh chân dung rõ mặt, nền đơn giản.</p>
          {photo && !busy && (
            <div className={s.stage} aria-label="Xem trước người đọc ở Tĩnh thất" role="img">
              {standing ? <img className={s.stagePerson} src={standing} alt="" /> : <img className={s.stagePhoto} src={photo} alt="" />}
            </div>
          )}
          {busy && <p className={ui.info} role="status">Đang tách người ra khỏi nền ảnh…</p>}
          {photoNote && <p className={ui.info} role="status">{photoNote}</p>}
          {cutout && !busy && (
            <Segmented<'stand' | 'frame'> label="Cách hiện ảnh" value={custom.frame ? 'frame' : 'stand'} onChange={(v) => setCustom({ frame: v === 'frame' ? true : undefined })}
              options={[{ value: 'stand', label: 'Đứng tự do' }, { value: 'frame', label: 'Khung tròn' }]} />
          )}
          <div className={ui.row}>
            <button type="button" className={ui.btn} disabled={busy} onClick={() => file.current?.click()}>{photo ? 'Đổi ảnh' : 'Chọn ảnh'}</button>
            {photo && <button type="button" className={ui.btn} disabled={busy} onClick={() => { void removeReaderPhoto(); setPhotoNote(null); setSetting(store, 'reader', undefined); }}>Bỏ ảnh</button>}
          </div>
          <label className={ui.field}>
            <span className={ui.label}>Tên người đọc</span>
            <input className={ui.input} value={custom.name} maxLength={30} onChange={(e) => setCustom({ name: e.target.value })} />
          </label>
          <label className={ui.field}>
            <span className={ui.label}>Người đọc tự xưng là</span>
            <select className={ui.input} value={custom.ta} onChange={(e) => setCustom({ ta: e.target.value })}>
              {CUSTOM_TA.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          <Segmented<'nam' | 'nu'> label="Giọng" value={custom.voice} onChange={(v) => setCustom({ voice: v })} options={[{ value: 'nam', label: 'Nam, trầm' }, { value: 'nu', label: 'Nữ, cao' }]} />
        </div>
      ) : (
        <div className={ui.stack}>
          <span className={ui.label} id="robe-label">Màu áo</span>
          <div className={s.robes} role="radiogroup" aria-labelledby="robe-label">
            {ROBE_IDS.map((id) => (
              <button key={id} type="button" role="radio" aria-checked={robeOf(persona, robe) === id} aria-label={ROBES[id].name + (id === persona.robe ? ' (mặc định)' : '')}
                className={s.robe} style={{ background: ROBES[id].colors[0] }} onClick={() => setSetting(store, 'readerRobe', id === persona.robe ? undefined : id)} />
            ))}
          </div>
        </div>
      )}

      <div className={ui.stack}>
        <span className={ui.label}>Giọng đọc trên máy</span>
        <p className={ui.muted}>Điện thoại không cho biết giọng nào là nam hay nữ: bạn nghe thử rồi chọn. Cao độ đã tự chỉnh theo người đọc {readerPersona(reader, custom).name}.</p>
        <div role="radiogroup" aria-label="Giọng đọc">
          <div className={s.voiceRow}>
            <input type="radio" id="voice-auto" name="voice" checked={!voice} onChange={() => setSetting(store, 'ttsVoice', undefined)} />
            <label htmlFor="voice-auto" style={{ flex: 1 }}>Tự chọn</label>
            <button type="button" className={ui.btn} onClick={() => void listen()}>🔊 Nghe thử</button>
          </div>
          {voices.map((v, i) => (
            <div key={v} className={s.voiceRow}>
              <input type="radio" id={`voice-${i}`} name="voice" checked={voice === v} onChange={() => setSetting(store, 'ttsVoice', v)} />
              <label htmlFor={`voice-${i}`} style={{ flex: 1 }}>Giọng {i + 1}</label>
              <button type="button" className={ui.btn} aria-label={`Nghe thử giọng ${i + 1}`} onClick={() => void listen(v)}>🔊 Nghe thử</button>
            </div>
          ))}
        </div>
        {isNative() && <button type="button" className={`${ui.btn} ${ui.block}`} onClick={() => void openVoiceInstall()}>Tải thêm giọng tiếng Việt</button>}
        {note && <p className={ui.info} role="status">{note}</p>}
      </div>
    </section>
  );
}
