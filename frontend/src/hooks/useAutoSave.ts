import { useEffect, useRef } from 'react';

/**
 * Debounces calls to `onSave` by 500ms, replicating the prototype's
 * auto-save behavior. Skips the save on the very first render (mount)
 * so loading data from the API doesn't trigger an immediate re-save.
 */
export function useAutoSave<T>(value: T, onSave: (value: T) => void, delay = 500) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      onSaveRef.current(value);
    }, delay);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, delay]);
}
