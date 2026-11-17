import { useEffect, useRef } from 'react';

/**
 * Debounces calls to `onSave` by 500ms, replicating the prototype's
 * auto-save behavior.
 *
 * `enabled` must be false while the initial value hasn't finished loading
 * from the API yet (e.g. still `null`/`loading`). The render where `enabled`
 * first becomes true is treated as the baseline and is never saved back —
 * only genuine edits after that trigger a save. Without this, loading data
 * from the server would immediately re-save it as if the user had typed it.
 */
export function useAutoSave<T>(
  value: T,
  onSave: (value: T) => void,
  options: { delay?: number; enabled?: boolean } = {},
) {
  const { delay = 500, enabled = true } = options;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasBaseline = useRef(false);
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;

  useEffect(() => {
    if (!enabled) return;

    if (!hasBaseline.current) {
      hasBaseline.current = true;
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
  }, [value, enabled, delay]);
}
