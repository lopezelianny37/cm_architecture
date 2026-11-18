import { describe, expect, it } from 'vitest';
import { computeIndividualObservationRadar } from './individualRadar';
import type { BehaviorObservation } from '../types/api';

function behavior(state: BehaviorObservation['state']): BehaviorObservation {
  return { state, fact: '', artifact: '' };
}

describe('computeIndividualObservationRadar', () => {
  it('places Observado (si) at the edge: radius 1', () => {
    const behaviors = Array.from({ length: 7 }, () => behavior('si'));
    expect(computeIndividualObservationRadar(behaviors)).toEqual(new Array(7).fill(1));
  });

  it('places N/A at the center: radius 0', () => {
    const behaviors = Array.from({ length: 7 }, () => behavior('na'));
    expect(computeIndividualObservationRadar(behaviors)).toEqual(new Array(7).fill(0));
  });

  it('places No observado between center and Parcial: radius 1/3', () => {
    const behaviors = Array.from({ length: 7 }, () => behavior('no'));
    expect(computeIndividualObservationRadar(behaviors)).toEqual(new Array(7).fill(1 / 3));
  });

  it('places Parcial between No observado and Observado: radius 2/3', () => {
    const behaviors = Array.from({ length: 7 }, () => behavior('par'));
    expect(computeIndividualObservationRadar(behaviors)).toEqual(new Array(7).fill(2 / 3));
  });

  it('maps a mix of states to their respective level/3, in order', () => {
    const behaviors = [behavior('na'), behavior('no'), behavior('par'), behavior('si')];
    expect(computeIndividualObservationRadar(behaviors)).toEqual([0, 1 / 3, 2 / 3, 1]);
  });
});
