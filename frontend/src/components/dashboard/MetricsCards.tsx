interface MetricsCardsProps {
  totalArchitects: number;
  completeRecords: number;
  totalGaps: number;
}

export function MetricsCards({ totalArchitects, completeRecords, totalGaps }: MetricsCardsProps) {
  return (
    <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-[10px]">
      <div className="bg-[#f8fafc] border border-[var(--line)] rounded-xl p-[13px]">
        <span className="block text-[11px] text-[var(--mut)]">Arquitectos en alcance</span>
        <b className="text-[24px] text-[var(--navy)]">{totalArchitects}</b>
      </div>
      <div className="bg-[#f8fafc] border border-[var(--line)] rounded-xl p-[13px]">
        <span className="block text-[11px] text-[var(--mut)]">Diagnóstico completo</span>
        <b className="text-[24px] text-[var(--navy)]">{completeRecords}</b>
      </div>
      <div className="bg-[#f8fafc] border border-[var(--line)] rounded-xl p-[13px]">
        <span className="block text-[11px] text-[var(--mut)]">Brechas identificadas</span>
        <b className="text-[24px] text-[var(--navy)]">{totalGaps}</b>
      </div>
    </div>
  );
}
