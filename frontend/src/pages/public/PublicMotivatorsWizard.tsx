import { useState } from 'react';
import { StepIdentificacion, type IdentificacionData } from '../../components/public-motivators/StepIdentificacion';
import { StepOrdenar } from '../../components/public-motivators/StepOrdenar';
import { MOT_NAMES } from '../../constants/gemba.constants';

type WizardStep = 0 | 1 | 2;

export function PublicMotivatorsWizard() {
  const [step, setStep] = useState<WizardStep>(0);
  const [identificacion, setIdentificacion] = useState<IdentificacionData>({
    name: '',
    email: '',
    macrodomain: '',
  });
  // Left-to-right visual order. Starts at the fixed MOT order (not
  // pre-ranked) rather than a shuffle — both are allowed per the addendum,
  // a fixed order keeps the wizard deterministic and testable.
  const [order, setOrder] = useState<string[]>(MOT_NAMES);

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="max-w-[900px] mx-auto p-5">
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

        {step === 1 && (
          <StepOrdenar
            order={order}
            onChange={setOrder}
            onBack={() => setStep(0)}
            onNext={() => setStep(2)}
          />
        )}

        {step >= 2 && (
          <div className="card bg-white border border-[var(--line)] rounded-2xl p-[18px] shadow-[var(--shadow)]">
            <p className="text-[var(--mut)]">Paso {step} — próximamente.</p>
            <button
              type="button"
              className="border border-[var(--line)] rounded-lg px-3 min-h-11 bg-white mt-2"
              onClick={() => setStep(1)}
            >
              Volver
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
