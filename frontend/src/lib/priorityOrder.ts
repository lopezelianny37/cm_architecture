export interface PriorityEntry {
  motivator: string;
  priorityOrder: number;
}

/**
 * Converts the visual left-to-right drag order into the backend's
 * priorityOrder convention: 1 = most important (leftmost card at submit
 * time), 10 = least important (rightmost). See
 * SPEC_MOVING_MOTIVATORS_ADDENDUM.md §2, Step 1.
 */
export function computePriorityOrder(visualOrderLeftToRight: string[]): PriorityEntry[] {
  return visualOrderLeftToRight.map((motivator, index) => ({
    motivator,
    priorityOrder: index + 1,
  }));
}
