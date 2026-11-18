export function Hero() {
  return (
    <div className="card bg-white border border-[var(--line)] rounded-2xl p-[18px] shadow-[var(--shadow)]">
      <span className="inline-block rounded-full px-[9px] py-[3px] text-[11px] font-extrabold bg-[#fff0f1] text-[var(--red)]">
        Hipótesis 1 · alcance reducido
      </span>
      <h1 className="text-[26px] mt-[7px] mb-[7px]">
        Del entendimiento a la aplicación real del nuevo rol
      </h1>
      <p className="text-[15px] m-0 text-[var(--mut)]">
        No busca puntuar personas. Busca identificar qué necesita cambiar en el arquitecto y qué
        necesita cambiar en el sistema para que el nuevo rol pueda ejercerse.
      </p>
      <div className="p-[11px_13px] border-l-4 border-[var(--blue)] bg-[var(--sky)] rounded-lg mt-3">
        <b>Hipótesis de observación:</b> Si observamos a los arquitectos en su trabajo diario,
        podremos identificar y diagnosticar brechas en las capacidades necesarias para comprender
        el negocio, cocrear soluciones y tomar decisiones orientadas al valor.
      </div>
    </div>
  );
}
