import { useEffect, useRef } from 'react';
import { backStack } from '../platform/back';

/** Đăng ký trình xử lý Back khi `enabled`; huỷ khi unmount (ARCHITECTURE.md mục 1.3). Handler trả true = đã xử lý. */
export function useBackHandler(handler: () => boolean, enabled = true): void {
  const ref = useRef(handler);
  ref.current = handler;
  useEffect(() => {
    if (!enabled) return;
    return backStack.register(() => ref.current());
  }, [enabled]);
}
