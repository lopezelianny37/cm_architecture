import type { RecordRow } from '../../types/api';

interface RosterTableProps {
  records: RecordRow[];
  onOpen: (id: string) => void;
}

export function RosterTable({ records, onOpen }: RosterTableProps) {
  if (records.length === 0) {
    return (
      <div className="text-center py-[30px] text-[var(--mut)]">
        Aún no hay arquitectos registrados. Crea el primer ciclo.
      </div>
    );
  }

  return (
    <div className="overflow-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {['Arquitecto', 'Macrodominio', 'Iniciativa', 'Estado de la iniciativa', 'Baseline', 'Brechas', ''].map((h) => (
              <th
                key={h}
                className="p-[9px] border-b border-[var(--line)] text-left text-[11px] text-[var(--mut)] whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {records.map((r) => {
            const gapsCount = (r.gaps ?? []).filter((g) => (g.text ?? '').trim().length > 0).length;
            return (
              <tr key={r.id}>
                <td className="p-[9px] border-b border-[var(--line)] whitespace-nowrap">
                  <b>{r.architect_name || 'Sin nombre'}</b>
                </td>
                <td className="p-[9px] border-b border-[var(--line)] whitespace-nowrap">
                  {r.macrodomain || '—'}
                </td>
                <td className="p-[9px] border-b border-[var(--line)] whitespace-nowrap">
                  {r.initiative_name || '—'}
                </td>
                <td className="p-[9px] border-b border-[var(--line)] whitespace-nowrap">
                  {r.initiative_status || '—'}
                </td>
                <td className="p-[9px] border-b border-[var(--line)] whitespace-nowrap">
                  <span
                    className="inline-block rounded-full px-[9px] py-[3px] text-[11px] font-extrabold"
                    style={
                      r.isComplete
                        ? { background: '#e8f7f1', color: 'var(--green)' }
                        : { background: '#fff4dc', color: 'var(--amber)' }
                    }
                  >
                    {r.isComplete ? 'Completo' : 'En curso'}
                  </span>
                </td>
                <td className="p-[9px] border-b border-[var(--line)] whitespace-nowrap">{gapsCount}</td>
                <td className="p-[9px] border-b border-[var(--line)] whitespace-nowrap">
                  <button
                    className="print:hidden border border-[var(--line)] rounded-lg px-3 min-h-11 bg-white"
                    onClick={() => onOpen(r.id)}
                  >
                    Abrir
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
