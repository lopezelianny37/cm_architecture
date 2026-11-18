import { useState } from 'react';
import { StepIdentificacion, type IdentificacionData } from '../../components/public-motivators/StepIdentificacion';

type WizardStep = 0 | 1 | 2;

export function PublicMotivatorsWizard() {
  const [step, setStep] = useState<WizardStep>(0);
  const [identificacion, setIdentificacion] = useState<IdentificacionData>({
    name: '',
    email: '',
    macrodomain: '',
  });

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="max-w-[640px] mx-auto p-5">
        <div className="mb-4">
          <div className="font-extrabold text-[var(--navy)] text-[16px]">
            Experimento Gemba · Arquitectura IB
            <small className="block text-[var(--mut)] text-[11px] font-medium">
              Moving Motivators · autoevaluación
            </small>
          </div>
        </div>

        {step === 0 && (
          <StepIdentificacion
            data={identificacion}
            onChange={setIdentificacion}
            onNext={() => setStep(1)}
          />
        )}

        {step >= 1 && (
          <div className="card bg-white border border-[var(--line)] rounded-2xl p-[18px] shadow-[var(--shadow)]">
            <p className="text-[var(--mut)]">Paso {step} — próximamente.</p>
            <button
              type="button"
              className="border border-[var(--line)] rounded-lg px-3 min-h-11 bg-white mt-2"
              onClick={() => setStep(0)}
            >
              Volver
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
