import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { RosterTable } from './RosterTable';
import type { RecordRow } from '../../types/api';

function buildRow(overrides: Partial<RecordRow> = {}): RecordRow {
  return {
    id: 'r1',
    architect_name: 'Arquitecta de prueba',
    macrodomain: 'Business Line',
    initiative_name: 'Iniciativa X',
    initiative_status: null,
    gaps: [],
    csat_score: null,
    isComplete: false,
    ...overrides,
  };
}

describe('RosterTable — columna Estado de la iniciativa', () => {
  it('renders the new column header', () => {
    render(<RosterTable records={[buildRow()]} onOpen={vi.fn()} />);
    expect(screen.getByText('Estado de la iniciativa')).toBeInTheDocument();
  });

  it('shows the initiative_status value when present', () => {
    render(
      <RosterTable
        records={[buildRow({ initiative_status: 'En evaluación con negocio' })]}
        onOpen={vi.fn()}
      />,
    );
    expect(screen.getByText('En evaluación con negocio')).toBeInTheDocument();
  });

  it('falls back to an em dash when initiative_status is null', () => {
    render(<RosterTable records={[buildRow({ initiative_status: null })]} onOpen={vi.fn()} />);
    const row = screen.getByText('Arquitecta de prueba').closest('tr')!;
    expect(row.textContent).toContain('—');
  });
});
