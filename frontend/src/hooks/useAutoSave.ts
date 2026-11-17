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
 *
 * If the component unmounts while a debounced save is still pending (e.g.
 * the user edits a field and switches tabs before the 500ms elapse), the
 * pending save is flushed immediately instead of being silently cancelled —
 * otherwise the edit is lost. A value change that merely *reschedules* the
 * debounce (the normal case) still cancels the previous timeout without
 * flushing, since the newer value will schedule its own save.
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

  // Tracks a save that's been scheduled but hasn't fired yet, so the
  // unmount-only effect below can flush it instead of losing it.
  const hasPendingRef = useRef(false);
  const pendingValueRef = useRef<T>(value);

  useEffect(() => {
    if (!enabled) return;

    if (!hasBaseline.current) {
      hasBaseline.current = true;
      return;
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    hasPendingRef.current = true;
    pendingValueRef.current = value;

    timeoutRef.current = setTimeout(() => {
      hasPendingRef.current = false;
      onSaveRef.current(value);
    }, delay);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, enabled, delay]);

  // Separate effect with no dependencies: its cleanup only runs when the
  // component actually unmounts, never when `value` merely changes between
  // renders. That's what lets it distinguish "reschedule" from "unmount".
  useEffect(() => {
    return () => {
      if (hasPendingRef.current) {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        hasPendingRef.current = false;
        onSaveRef.current(pendingValueRef.current);
      }
    };
  }, []);
}
