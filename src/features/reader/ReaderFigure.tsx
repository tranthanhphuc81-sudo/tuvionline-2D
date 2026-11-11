/* Người đọc ở Tĩnh thất: nhân vật vẽ sẵn (Lottie, đổi màu áo được) hoặc ảnh người dùng tự đưa lên, hiện theo một trong ba cách:
   - đứng tự do: người đã tách nền, thở nhẹ, đang đọc thì lắc lư khẽ và toả sáng quanh viền;
   - ghép mặt: cái đầu cắt từ ảnh đặt lên thân nhân vật vẽ sẵn, cử động theo nhân vật, áo đổi màu được;
   - khung tròn: ảnh vuông trong khung viền vàng.
   Cách đã chọn mà ảnh không làm được (không tách được nền, không thấy mặt) thì lùi về cách còn lại. Chỉ là hình trang trí,
   không có ảnh thì quay về nhân vật vẽ sẵn. */
import { useEffect, useSyncExternalStore } from 'react';
import { useApp } from '../../app/context';
import type { CustomReaderInfo } from '../../content/reader/personas';
import type { ReaderLook } from '../../state/schema';
import { Character, type CharacterState } from './Character';
import { loadReaderPhoto, readerPhoto, subscribeReaderPhoto, type ReaderPhoto } from './customPhoto';
import { useReader } from './hooks';
import s from './reader.module.css';

const NONE: ReaderPhoto = { photo: null, cutout: null, head: null };

export function useReaderPhoto(): ReaderPhoto {
  useEffect(() => { void loadReaderPhoto(); }, []);
  return useSyncExternalStore(subscribeReaderPhoto, readerPhoto, () => NONE);
}

/** Cách hiện người dùng đã chọn (bản cũ chỉ có `frame`). */
export const chosenLook = (c: CustomReaderInfo | undefined): ReaderLook => c?.look ?? (c?.frame ? 'frame' : 'stand');

/** Cách hiện thật sự, theo những bản ảnh đang có. */
export function shownLook(want: ReaderLook, p: ReaderPhoto): ReaderLook | null {
  if (!p.photo) return null;
  if (want === 'face' && p.head) return 'face';
  if (want !== 'frame' && p.cutout) return 'stand';
  return 'frame';
}

/** Thân vẽ sẵn để ghép mặt: giọng nữ dùng dáng thon của Cô đồ, giọng nam dùng dáng Thầy. */
export const faceBody = (c: CustomReaderInfo | undefined) => (c?.voice === 'nu' ? 'co-do' : 'thay');

export function useReaderLook() {
  const p = useReaderPhoto();
  const custom = useApp((x) => x.settings.readerCustom);
  return { ...p, look: shownLook(chosenLook(custom), p), body: faceBody(custom) };
}

export function ReaderFigure({ state, className }: { state: CharacterState; className?: string }) {
  const { persona, robe } = useReader();
  const { look, photo, cutout, head, body } = useReaderLook();
  if (persona.custom && look === 'face') return <Character name={body} robe={robe} face={head} state={state} className={className} />;
  if (persona.custom && look === 'stand') {
    return (
      <div className={`${className ?? ''} ${s.standWrap}`} aria-hidden="true">
        <img className={s.stand} src={cutout!} alt="" data-state={state} draggable={false} />
      </div>
    );
  }
  if (persona.custom && look === 'frame') {
    return (
      <div className={`${className ?? ''} ${s.photoWrap}`} aria-hidden="true">
        <img className={s.photo} src={photo!} alt="" data-state={state} draggable={false} />
      </div>
    );
  }
  return <Character name={persona.custom ? 'thay' : persona.id} robe={robe} state={state} className={className} />;
}
