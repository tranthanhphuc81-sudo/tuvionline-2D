/* Người đọc ở Tĩnh thất: nhân vật vẽ sẵn (Lottie, đổi màu áo được) hoặc ảnh người dùng tự đưa lên. Ảnh đã tách được nền thì người
   đứng tự do như nhân vật vẽ sẵn: thở nhẹ, đang đọc thì lắc lư khẽ và toả sáng quanh viền. Không tách được nền (hoặc người dùng chọn
   giữ khung) thì ảnh nằm trong khung tròn viền vàng. Chỉ là hình trang trí, không có ảnh thì quay về nhân vật vẽ sẵn. */
import { useEffect, useSyncExternalStore } from 'react';
import { useApp } from '../../app/context';
import { Character, type CharacterState } from './Character';
import { loadReaderPhoto, readerPhoto, subscribeReaderPhoto, type ReaderPhoto } from './customPhoto';
import { useReader } from './hooks';
import s from './reader.module.css';

const NONE: ReaderPhoto = { photo: null, cutout: null };

export function useReaderPhoto(): ReaderPhoto {
  useEffect(() => { void loadReaderPhoto(); }, []);
  return useSyncExternalStore(subscribeReaderPhoto, readerPhoto, () => NONE);
}

/** Ảnh đứng tự do nếu có bản tách nền và người dùng không chọn giữ khung tròn. */
export function useStandingPhoto(): string | null {
  const { cutout } = useReaderPhoto();
  const frame = useApp((x) => x.settings.readerCustom?.frame) ?? false;
  return frame ? null : cutout;
}

export function ReaderFigure({ state, className }: { state: CharacterState; className?: string }) {
  const { persona, robe } = useReader();
  const { photo } = useReaderPhoto();
  const standing = useStandingPhoto();
  if (persona.custom && standing) {
    return (
      <div className={`${className ?? ''} ${s.standWrap}`} aria-hidden="true">
        <img className={s.stand} src={standing} alt="" data-state={state} draggable={false} />
      </div>
    );
  }
  if (persona.custom && photo) {
    return (
      <div className={`${className ?? ''} ${s.photoWrap}`} aria-hidden="true">
        <img className={s.photo} src={photo} alt="" data-state={state} draggable={false} />
      </div>
    );
  }
  return <Character name={persona.custom ? 'thay' : persona.id} robe={robe} state={state} className={className} />;
}
