import { AutoSaveField } from './AutoSaveField';

interface CsatSectionProps {
  score: number | null;
  comment: string;
  onScoreChange: (score: number | null) => void;
  onSaveComment: (comment: string) => void;
}

export function CsatSection({ score, comment, onScoreChange, onSaveComment }: CsatSectionProps) {
  return (
    <div className="grid grid-cols-1 tablet:grid-cols-2 gap-[11px]">
      <label className="block text-[11px] font-bold text-[var(--mut)]">
        En una escala de 1 a 5, ¿qué tan útil fue el acompañamiento Gemba?
        <select
          className="w-full mt-1 p-2 border border-[var(--line)] rounded-lg bg-white"
          value={score ?? ''}
          onChange={(e) => onScoreChange(e.target.value === '' ? null : Number(e.target.value))}
        >
          <option value="">Sin responder</option>
          <option value="1">1 · Nada útil</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5 · Muy útil</option>
        </select>
      </label>
      <AutoSaveField
        label="¿Qué deberíamos mantener o ajustar?"
        initialValue={comment}
        as="textarea"
        rows={3}
        onSave={onSaveComment}
      />
    </div>
  );
}
