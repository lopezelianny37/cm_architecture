import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PriorityBarChart } from './PriorityBarChart';

describe('PriorityBarChart', () => {
  it('renders one label per item, in the order given by the caller', () => {
    render(
      <PriorityBarChart
        ariaLabel="test"
        items={[
          { motivator: 'A', score: 1 },
          { motivator: 'B', score: 5 },
          { motivator: 'C', score: 10 },
        ]}
      />,
    );

    expect(screen.getAllByText(/^[ABC]$/).map((el) => el.textContent)).toEqual([
      'A',
      'B',
      'C',
    ]);
  });

  it('renders the tallest bar for the lowest score (most important), leftmost', () => {
    render(
      <PriorityBarChart
        ariaLabel="test"
        items={[
          { motivator: 'A', score: 1 },
          { motivator: 'B', score: 5 },
          { motivator: 'C', score: 10 },
        ]}
      />,
    );

    const heightOf = (name: string) => {
      const bar = screen.getByTitle(new RegExp(`^${name}:`));
      return parseFloat((bar as HTMLElement).style.height);
    };

    const heightA = heightOf('A');
    const heightB = heightOf('B');
    const heightC = heightOf('C');

    expect(heightA).toBeGreaterThan(heightB);
    expect(heightB).toBeGreaterThan(heightC);
    expect(heightA).toBe(100); // score 1 -> tallest possible bar (10 - 1 = 9, the max here)
    expect(heightC).toBe(0); // score 10 -> no bar
  });
});
