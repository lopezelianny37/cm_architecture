export interface PriorityEntry {
  motivator: string;
  priorityOrder: number;
}

/**
 * Converts the visual left-to-right drag order into the backend's
 * priorityOrder convention: 1 = most important (rightmost card at submit
 * time), 10 = least important (leftmost) — decoupled from the visual drag
 * direction. See SPEC_MOVING_MOTIVATORS_ADDENDUM.md §2, Step 1.
 */
export function computePriorityOrder(visualOrderLeftToRight: string[]): PriorityEntry[] {
  const n = visualOrderLeftToRight.length;
  return visualOrderLeftToRight.map((motivator, index) => ({
    motivator,
    priorityOrder: n - index,
  }));
}
