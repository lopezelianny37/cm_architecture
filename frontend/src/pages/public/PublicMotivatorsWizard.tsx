import { useState } from 'react';
import { StepIdentificacion, type IdentificacionData } from '../../components/public-motivators/StepIdentificacion';
import { StepOrdenar } from '../../components/public-motivators/StepOrdenar';
import { StepImpacto } from '../../components/public-motivators/StepImpacto';
import { DuplicateConfirmModal } from '../../components/public-motivators/DuplicateConfirmModal';
import { ConfirmationScreen } from '../../components/public-motivators/ConfirmationScreen';
import { MOT_NAMES } from '../../constants/gemba.constants';
import { computePriorityOrder } from '../../lib/priorityOrder';
import {
  isDuplicateResult,
  submitMotivators,
  type ExistingSubmission,
} from '../../lib/publicMotivatorsApi';

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
  const [impacts, setImpacts] = useState<Record<string, number>>({});

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [duplicate, setDuplicate] = useState<ExistingSubmission | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(confirmReplace: boolean) {
    setSubmitting(true);
    setSubmitError(null);

    try {
      const result = await submitMotivators({
        name: identificacion.name.trim(),
        email: identificacion.email.trim(),
        macrodomain: identificacion.macrodomain,
        priorities: computePriorityOrder(order),
        impacts: MOT_NAMES.map((name) => ({ motivator: name, impact: impacts[name] ?? 0 })),
        confirmReplace,
      });

      if (isDuplicateResult(result)) {
        setDuplicate(result.existing);
      } else {
        setDuplicate(null);
        setSubmitted(true);
      }
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'No se pudo enviar la información. Intentá de nuevo.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[var(--bg)]">
        <div className="max-w-[640px] mx-auto p-5">
          <ConfirmationScreen />
        </div>
      </div>
    );
  }

  // Step 0 is a simple 3-field form, so it stays narrow like the
  // confirmation screen; Steps 1-2 hold the 10 motivator cards and get a
  // much wider container to use the available screen space on wide
  // monitors (Home.tsx/FormView.tsx are untouched — this width only
  // applies to the public wizard).
  const containerMaxWidth = step === 0 ? 'max-w-[640px]' : 'max-w-[1400px]';

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className={`${containerMaxWidth} mx-auto p-5`}>
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

        {step === 2 && (
          <StepImpacto
            order={order}
            impacts={impacts}
            onChange={setImpacts}
            onBack={() => setStep(1)}
            onSubmit={() => handleSubmit(false)}
            submitting={submitting}
            error={submitError}
          />
        )}

        {duplicate && (
          <DuplicateConfirmModal
            existing={duplicate}
            loading={submitting}
            onReplace={() => handleSubmit(true)}
            onCancel={() => setDuplicate(null)}
          />
        )}
      </div>
    </div>
  );
}
