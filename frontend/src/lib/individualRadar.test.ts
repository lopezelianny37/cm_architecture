import { describe, expect, it } from 'vitest';
import { computeIndividualGapRadar } from './individualRadar';
import type { BehaviorObservation } from '../types/api';

function behavior(state: BehaviorObservation['state']): BehaviorObservation {
  return { state, fact: '', artifact: '' };
}

describe('computeIndividualGapRadar', () => {
  it('returns all 0 when every behavior is "si" (Observado)', () => {
    const behaviors = Array.from({ length: 8 }, () => behavior('si'));
    expect(computeIndividualGapRadar(behaviors)).toEqual(new Array(8).fill(0));
  });

  it('returns all 1 when every behavior is "no" (No observado)', () => {
    const behaviors = Array.from({ length: 8 }, () => behavior('no'));
    expect(computeIndividualGapRadar(behaviors)).toEqual(new Array(8).fill(1));
  });

  it('maps a mix of states correctly, treating "na" as excluded (defaults to 0)', () => {
    const behaviors = [
      behavior('si'),
      behavior('par'),
      behavior('no'),
      behavior('na'),
    ];
    expect(computeIndividualGapRadar(behaviors)).toEqual([0, 0.5, 1, 0]);
  });

  it('defaults to 0 when there is no valid data at all (all "na")', () => {
    const behaviors = Array.from({ length: 8 }, () => behavior('na'));
    expect(computeIndividualGapRadar(behaviors)).toEqual(new Array(8).fill(0));
  });
});
