import type { StatusFilter } from '../../types/api';

interface FiltersProps {
  macrodomains: string[];
  macrodomain: string;
  status: StatusFilter;
  onMacrodomainChange: (value: string) => void;
  onStatusChange: (value: StatusFilter) => void;
}

export function Filters({
  macrodomains,
  macrodomain,
  status,
  onMacrodomainChange,
  onStatusChange,
}: FiltersProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_0.7fr] gap-[10px]">
      <label className="block text-[11px] font-bold text-[var(--mut)]">
        Arquitectura
        <select className="in w-full mt-1 p-2 border border-[var(--line)] rounded-lg" disabled value="all">
          <option value="all">Arquitectura IB</option>
        </select>
      </label>
      <label className="block text-[11px] font-bold text-[var(--mut)]">
        Macrodominio
        <select
          className="in w-full mt-1 p-2 border border-[var(--line)] rounded-lg"
          value={macrodomain}
          onChange={(e) => onMacrodomainChange(e.target.value)}
        >
          <option value="all">Todos los macrodominios</option>
          {macrodomains.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-[11px] font-bold text-[var(--mut)]">
        Vista
        <select
          className="in w-full mt-1 p-2 border border-[var(--line)] rounded-lg"
          value={status}
          onChange={(e) => onStatusChange(e.target.value as StatusFilter)}
        >
          <option value="all">Todos</option>
          <option value="complete">Diagnóstico completo</option>
          <option value="open">En curso</option>
        </select>
      </label>
    </div>
  );
}
