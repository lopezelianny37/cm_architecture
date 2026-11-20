import { describe, expect, it } from 'vitest';
import { impactToTrackFraction, trackFractionToImpact } from './impactTrack';

describe('impactToTrackFraction', () => {
  it('maps +4 to the top of the track (0)', () => {
    expect(impactToTrackFraction(4)).toBe(0);
  });

  it('maps -4 to the bottom of the track (1)', () => {
    expect(impactToTrackFraction(-4)).toBe(1);
  });

  it('maps 0 to the middle of the track (0.5)', () => {
    expect(impactToTrackFraction(0)).toBe(0.5);
  });

  it('maps intermediate values proportionally', () => {
    expect(impactToTrackFraction(2)).toBeCloseTo(0.25);
    expect(impactToTrackFraction(-2)).toBeCloseTo(0.75);
  });

  it('clamps out-of-range input', () => {
    expect(impactToTrackFraction(10)).toBe(0);
    expect(impactToTrackFraction(-10)).toBe(1);
  });
});

describe('trackFractionToImpact', () => {
  it('maps the top of the track (0) to +4', () => {
    expect(trackFractionToImpact(0)).toBe(4);
  });

  it('maps the bottom of the track (1) to -4', () => {
    expect(trackFractionToImpact(1)).toBe(-4);
  });

  it('maps the middle of the track (0.5) to 0', () => {
    expect(trackFractionToImpact(0.5)).toBe(0);
  });

  it('snaps to the nearest integer level', () => {
    expect(trackFractionToImpact(0.1)).toBe(3);
    expect(trackFractionToImpact(0.125)).toBe(3);
  });

  it('clamps a fraction outside 0..1', () => {
    expect(trackFractionToImpact(-0.3)).toBe(4);
    expect(trackFractionToImpact(1.3)).toBe(-4);
  });

  it('round-trips with impactToTrackFraction for every whole level', () => {
    for (let impact = -4; impact <= 4; impact++) {
      expect(trackFractionToImpact(impactToTrackFraction(impact))).toBe(impact);
    }
  });
});
