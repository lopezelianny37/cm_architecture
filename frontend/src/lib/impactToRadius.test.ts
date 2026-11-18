import { describe, expect, it } from 'vitest';
import { impactToRadius } from './impactToRadius';

describe('impactToRadius', () => {
  it('maps -4 (debilita al máximo) to 0 (centro)', () => {
    expect(impactToRadius(-4)).toBe(0);
  });

  it('maps 0 (neutro) to 0.5', () => {
    expect(impactToRadius(0)).toBe(0.5);
  });

  it('maps 4 (fortalece al máximo) to 1 (borde)', () => {
    expect(impactToRadius(4)).toBe(1);
  });

  it('maps 2 to 0.75', () => {
    expect(impactToRadius(2)).toBe(0.75);
  });
});
