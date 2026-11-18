import { PUBLIC_MACRODOMAINS } from '../../constants/gemba.constants';
import { isValidEmail } from '../../lib/validation';

export interface IdentificacionData {
  name: string;
  email: string;
  macrodomain: string;
}

interface StepIdentificacionProps {
  data: IdentificacionData;
  onChange: (data: IdentificacionData) => void;
  onNext: () => void;
}

export function isIdentificacionValid(data: IdentificacionData): boolean {
  return data.name.trim().length > 0 && isValidEmail(data.email) && data.macrodomain.length > 0;
}

export function StepIdentificacion({ data, onChange, onNext }: StepIdentificacionProps) {
  const emailTouched = data.email.length > 0;
  const emailValid = isValidEmail(data.email);
  const canAdvance = isIdentificacionValid(data);

  return (
    <div className="card bg-white border border-[var(--line)] rounded-2xl p-[18px] shadow-[var(--shadow)]">
      <span className="inline-block rounded-full px-[9px] py-[3px] text-[11px] font-extrabold bg-[var(--sky)] text-[var(--blue)] mb-2">
        Paso 0 · Identificación
      </span>
      <h2 className="text-[19px] m-0 mb-3">Antes de empezar</h2>
      <div className="flex flex-col gap-[11px]">
        <label className="block text-[11px] font-bold text-[var(--mut)]">
          Nombre
          <input
            className="w-full mt-1 p-2 min-h-11 border border-[var(--line)] rounded-lg"
            value={data.name}
            placeholder="Tu nombre completo"
            onChange={(e) => onChange({ ...data, name: e.target.value })}
          />
        </label>
        <label className="block text-[11px] font-bold text-[var(--mut)]">
          Correo electrónico
          <input
            className="w-full mt-1 p-2 min-h-11 border border-[var(--line)] rounded-lg"
            type="email"
            value={data.email}
            placeholder="tu.correo@empresa.com"
            onChange={(e) => onChange({ ...data, email: e.target.value })}
          />
          {emailTouched && !emailValid && (
            <span className="block text-[var(--red)] text-[11px] font-normal mt-1">
              Ingresá un correo electrónico válido.
            </span>
          )}
        </label>
        <label className="block text-[11px] font-bold text-[var(--mut)]">
          Macrodominio
          <select
            className="w-full mt-1 p-2 min-h-11 border border-[var(--line)] rounded-lg bg-white"
            value={data.macrodomain}
            onChange={(e) => onChange({ ...data, macrodomain: e.target.value })}
          >
            <option value="">Seleccioná tu macrodominio</option>
            {PUBLIC_MACRODOMAINS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="flex justify-end mt-4">
        <button
          type="button"
          disabled={!canAdvance}
          className="border-0 rounded-lg px-[13px] min-h-11 font-extrabold bg-[var(--red)] text-white disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={onNext}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
