import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RadarChart } from './RadarChart';

const LABELS = ['A', 'B', 'C'];
const VALUES = [0.5, 0.5, 0.5];

describe('RadarChart — highlightRingLevel', () => {
  it('draws all 4 grid rings in the default gray when highlightRingLevel is not passed', () => {
    const { container } = render(
      <RadarChart labels={LABELS} values={VALUES} color="#000" ariaLabel="test" />,
    );
    const rings = container.querySelectorAll('svg > polygon');
    // 4 grid rings + 1 data polygon = 5 polygons total; only inspect the
    // first 4 (the grid rings, rendered before the data polygon).
    const gridRings = Array.from(rings).slice(0, 4);
    expect(gridRings).toHaveLength(4);
    for (const ring of gridRings) {
      expect(ring).toHaveAttribute('stroke', '#dce3ed');
    }
  });

  it('draws only the requested ring level in red, leaving the others gray', () => {
    const { container } = render(
      <RadarChart
        labels={LABELS}
        values={VALUES}
        color="#000"
        ariaLabel="test"
        highlightRingLevel={2}
      />,
    );
    const rings = Array.from(container.querySelectorAll('svg > polygon')).slice(0, 4);
    // gridLevels = [1, 2, 3, 4], rendered in that order -> index 1 is level 2.
    expect(rings[1]).toHaveAttribute('stroke', '#d71920');

    const others = [rings[0], rings[2], rings[3]];
    for (const ring of others) {
      expect(ring).toHaveAttribute('stroke', '#dce3ed');
    }
  });

  it('highlights a different ring when a different level is requested', () => {
    const { container } = render(
      <RadarChart
        labels={LABELS}
        values={VALUES}
        color="#000"
        ariaLabel="test"
        highlightRingLevel={4}
      />,
    );
    const rings = Array.from(container.querySelectorAll('svg > polygon')).slice(0, 4);
    expect(rings[3]).toHaveAttribute('stroke', '#d71920');
    expect(rings[0]).toHaveAttribute('stroke', '#dce3ed');
  });
});
