/* Người đọc ở Tĩnh thất: nhân vật vẽ sẵn (Lottie, đổi màu áo được) hoặc ảnh người dùng tự đưa lên, hiện theo một trong ba cách:
   - đứng tự do: người đã tách nền, thở nhẹ, đang đọc thì lắc lư khẽ và toả sáng quanh viền;
   - ghép mặt: cái đầu cắt từ ảnh đặt lên thân nhân vật vẽ sẵn, cử động theo nhân vật, áo đổi màu được (faceRig.ts);
   - khung tròn: ảnh vuông trong khung viền vàng.
   Hai cách đầu, nếu tách được hàm và mắt (cutout.ts), thì miệng mấp máy khi đang đọc và mắt chớp định kỳ.
   Cách đã chọn mà ảnh không làm được (không tách được nền, không thấy mặt) thì lùi về cách còn lại. Chỉ là hình trang trí,
   không có ảnh thì quay về nhân vật vẽ sẵn. */
import { useEffect, useSyncExternalStore, type CSSProperties } from 'react';
import { useApp } from '../../app/context';
import type { CustomReaderInfo } from '../../content/reader/personas';
import type { ReaderLook } from '../../state/schema';
import { Character, type CharacterState } from './Character';
import { CUT_H, CUT_W, type TalkParts } from './cutout';
import { loadReaderPhoto, readerPhoto, subscribeReaderPhoto, type ReaderPhoto } from './customPhoto';
import { useReader } from './hooks';
import s from './reader.module.css';

const NONE: ReaderPhoto = { photo: null, cutout: null, head: null, anim: {} };

export function useReaderPhoto(): ReaderPhoto {
  useEffect(() => { void loadReaderPhoto(); }, []);
  return useSyncExternalStore(subscribeReaderPhoto, readerPhoto, () => NONE);
}

/** Cách hiện người dùng đã chọn (bản cũ chỉ có `frame`). */
export const chosenLook = (c: CustomReaderInfo | undefined): ReaderLook => c?.look ?? (c?.frame ? 'frame' : 'stand');

/** Cách hiện thật sự, theo những bản ảnh đang có. */
export function shownLook(want: ReaderLook, p: Pick<ReaderPhoto, 'photo' | 'cutout' | 'head'>): ReaderLook | null {
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

const pct = (v: number, of: number) => `${Math.round((v / of) * 10000) / 100}%`;

/** Người đứng tự do. Có bộ phận cử động thì ghép từ ba lớp: ảnh đã tô kín chỗ hàm, hàm dưới (CSS hạ xuống khi đang đọc) và hai
    mí mắt (CSS hiện thoáng chốc để chớp). */
export function StandFigure({ src, talk, state, className }: { src: string; talk?: TalkParts; state: CharacterState; className?: string }) {
  const rig = talk?.rig;
  const style = rig ? ({ '--drop': pct(rig.drop, CUT_H) } as CSSProperties) : undefined;
  return (
    <div className={`${className ?? ''} ${s.standWrap}`} aria-hidden="true">
      <div className={s.standFig} data-state={state} data-talking={state !== 'idle'} style={style}>
        <img className={s.standImg} src={talk ? talk.upper : src} alt="" draggable={false} />
        {talk && rig && <>
          <img className={`${s.standImg} ${s.standJaw}`} src={talk.jaw} alt="" draggable={false} />
          {rig.eyes.map(([x, y], i) => (
            <span key={i} className={s.lid} style={{ left: pct(x - rig.lid[0] / 2, CUT_W), top: pct(y - rig.lid[1] / 2, CUT_H), width: pct(rig.lid[0], CUT_W), height: pct(rig.lid[1], CUT_H), background: rig.skin, borderBottomColor: rig.line }} />
          ))}
        </>}
      </div>
    </div>
  );
}

export function ReaderFigure({ state, className }: { state: CharacterState; className?: string }) {
  const { persona, robe } = useReader();
  const { look, photo, cutout, head, anim, body } = useReaderLook();
  if (persona.custom && look === 'face') return <Character name={body} robe={robe} face={head} talk={anim.head} state={state} className={className} />;
  if (persona.custom && look === 'stand') return <StandFigure src={cutout!} talk={anim.stand} state={state} className={className} />;
  if (persona.custom && look === 'frame') {
    return (
      <div className={`${className ?? ''} ${s.photoWrap}`} aria-hidden="true">
        <img className={s.photo} src={photo!} alt="" data-state={state} draggable={false} />
      </div>
    );
  }
  return <Character name={persona.custom ? 'thay' : persona.id} robe={robe} state={state} className={className} />;
}
