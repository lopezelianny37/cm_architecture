import { useState } from 'react';

/**
 * Tracks which item (by name/key) currently has mouse hover or keyboard
 * focus, for a component that shows a description tooltip on either —
 * shared between StepOrdenar (Step 1) and StepImpacto (Step 2) so hovering
 * or focusing a motivator card behaves the same way in both steps.
 */
export function useHoverFocusActive() {
  const [active, setActive] = useState<string | null>(null);

  function bind(name: string) {
    return {
      onMouseEnter: () => setActive(name),
      onMouseLeave: () => setActive((a) => (a === name ? null : a)),
      onFocus: () => setActive(name),
      onBlur: () => setActive((a) => (a === name ? null : a)),
    };
  }

  return { active, bind };
}
