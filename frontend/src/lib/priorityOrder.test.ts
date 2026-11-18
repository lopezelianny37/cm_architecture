import { describe, expect, it } from 'vitest';
import { computePriorityOrder } from './priorityOrder';

describe('computePriorityOrder', () => {
  it('assigns priorityOrder=1 (most important) to the leftmost card', () => {
    const order = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    const result = computePriorityOrder(order);
    expect(result[0]).toEqual({ motivator: 'A', priorityOrder: 1 });
  });

  it('assigns priorityOrder=10 (least important) to the rightmost card', () => {
    const order = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    const result = computePriorityOrder(order);
    expect(result[result.length - 1]).toEqual({ motivator: 'J', priorityOrder: 10 });
  });

  it('produces a full 1..10 permutation for a 10-item order', () => {
    const order = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    const result = computePriorityOrder(order);
    const priorities = result.map((r) => r.priorityOrder).sort((a, b) => a - b);
    expect(priorities).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it('reflects a reorder: moving the rightmost card to the leftmost slot gives it priorityOrder=1', () => {
    const original = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    const afterDrag = [original[original.length - 1], ...original.slice(0, -1)]; // J moved to the front
    const result = computePriorityOrder(afterDrag);
    expect(result.find((r) => r.motivator === 'J')).toEqual({ motivator: 'J', priorityOrder: 1 });
  });
});
