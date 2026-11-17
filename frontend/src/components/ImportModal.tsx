import { useState } from 'react';

interface ImportModalProps {
  open: boolean;
  onClose: () => void;
  onImport: (file: File) => Promise<void>;
}

export function ImportModal({ open, onClose, onImport }: ImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  async function handleImportClick() {
    if (!file) return;
    setLoading(true);
    try {
      await onImport(file);
    } finally {
      setLoading(false);
      setFile(null);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-[rgba(7,29,73,.45)] grid place-items-center p-[18px] z-[60]"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-[560px] bg-white rounded-2xl p-[18px] shadow-[var(--shadow)]">
        <h2 className="text-[19px] m-0 mb-2">Cargar información</h2>
        <p className="text-[var(--mut)] mb-3">
          Selecciona el archivo JSON descargado desde este modelo. Reemplazará la información
          guardada para tu usuario.
        </p>
        <div className="border-2 border-dashed border-[var(--line)] rounded-xl p-[18px] text-center">
          <input
            type="file"
            accept="application/json,.json"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </div>
        <div className="flex justify-end gap-[9px] mt-3">
          <button
            type="button"
            className="border border-[var(--line)] rounded-lg px-3 py-2 bg-white"
            onClick={() => {
              setFile(null);
              onClose();
            }}
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={!file || loading}
            className="border-0 rounded-lg px-[13px] py-2 font-extrabold bg-[var(--red)] text-white disabled:opacity-50"
            onClick={handleImportClick}
          >
            Cargar respaldo
          </button>
        </div>
      </div>
    </div>
  );
}
