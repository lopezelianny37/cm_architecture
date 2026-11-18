import { describe, expect, it } from 'vitest';
import { gapValueToRadius } from './radarVisualization';

describe('gapValueToRadius', () => {
  it('maps Observado (gap=0) to radius 1 (edge — no gap)', () => {
    expect(gapValueToRadius(0)).toBe(1);
  });

  it('maps Parcial (gap=0.5) to radius 0.5 (midpoint)', () => {
    expect(gapValueToRadius(0.5)).toBe(0.5);
  });

  it('maps No observado (gap=1) to radius 0 (center — biggest gap)', () => {
    expect(gapValueToRadius(1)).toBe(0);
  });

  it('inverts a full array of gap values the same way', () => {
    expect([0, 0.5, 1].map(gapValueToRadius)).toEqual([1, 0.5, 0]);
  });
});
