/* Người đọc ở Tĩnh thất: nhân vật vẽ sẵn (Lottie, đổi màu áo được) hoặc ảnh người dùng tự đưa lên, đặt trong khung tròn
   viền vàng, thở nhẹ; đang đọc thì khung sáng lên. Chỉ là hình trang trí, không có ảnh thì quay về nhân vật vẽ sẵn. */
import { useEffect, useSyncExternalStore } from 'react';
import { Character, type CharacterState } from './Character';
import { loadReaderPhoto, readerPhoto, subscribeReaderPhoto } from './customPhoto';
import { useReader } from './hooks';
import s from './reader.module.css';

export function useReaderPhoto(): string | null {
  useEffect(() => { void loadReaderPhoto(); }, []);
  return useSyncExternalStore(subscribeReaderPhoto, readerPhoto, () => null);
}

export function ReaderFigure({ state, className }: { state: CharacterState; className?: string }) {
  const { persona, robe } = useReader();
  const photo = useReaderPhoto();
  if (persona.custom && photo) {
    return (
      <div className={`${className ?? ''} ${s.photoWrap}`} aria-hidden="true">
        <img className={s.photo} src={photo} alt="" data-state={state} draggable={false} />
      </div>
    );
  }
  return <Character name={persona.custom ? 'thay' : persona.id} robe={robe} state={state} className={className} />;
}
