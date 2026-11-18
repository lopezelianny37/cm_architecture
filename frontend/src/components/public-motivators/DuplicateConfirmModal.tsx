import type { ExistingSubmission } from '../../lib/publicMotivatorsApi';

interface DuplicateConfirmModalProps {
  existing: ExistingSubmission;
  onReplace: () => void;
  onCancel: () => void;
  loading: boolean;
}

export function DuplicateConfirmModal({
  existing,
  onReplace,
  onCancel,
  loading,
}: DuplicateConfirmModalProps) {
  const date = new Date(existing.submittedAt).toLocaleDateString('es-AR');

  return (
    <div
      className="fixed inset-0 bg-[rgba(7,29,73,.45)] grid place-items-center p-[18px] z-[60]"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-[480px] bg-white rounded-2xl p-[18px] shadow-[var(--shadow)]">
        <h2 className="text-[19px] m-0 mb-2">Ya existe un registro</h2>
        <p className="text-[var(--mut)] mb-3">
          Ya existe un registro con este nombre o correo, de {date}. Si continúas, se eliminará
          el anterior y se guardará esta nueva información.
        </p>
        <div className="flex justify-end gap-[9px]">
          <button
            type="button"
            disabled={loading}
            className="border border-[var(--line)] rounded-lg px-3 min-h-11 bg-white disabled:opacity-50"
            onClick={onCancel}
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={loading}
            className="border-0 rounded-lg px-[13px] min-h-11 font-extrabold bg-[var(--red)] text-white disabled:opacity-50"
            onClick={onReplace}
          >
            Reemplazar
          </button>
        </div>
      </div>
    </div>
  );
}
