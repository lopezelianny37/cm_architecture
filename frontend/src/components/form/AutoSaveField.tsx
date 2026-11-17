import { useState } from 'react';
import { useAutoSave } from '../../hooks/useAutoSave';

interface AutoSaveFieldProps {
  label: string;
  initialValue: string;
  onSave: (value: string) => void;
  placeholder?: string;
  as?: 'input' | 'textarea';
  rows?: number;
}

export function AutoSaveField({
  label,
  initialValue,
  onSave,
  placeholder,
  as = 'input',
  rows = 4,
}: AutoSaveFieldProps) {
  const [value, setValue] = useState(initialValue);
  useAutoSave(value, onSave);

  const className = 'w-full mt-1 p-2 border border-[var(--line)] rounded-lg bg-white';

  return (
    <label className="block text-[11px] font-bold text-[var(--mut)]">
      {label}
      {as === 'textarea' ? (
        <textarea
          className={className}
          rows={rows}
          value={value}
          placeholder={placeholder}
          onChange={(e) => setValue(e.target.value)}
        />
      ) : (
        <input
          className={className}
          value={value}
          placeholder={placeholder}
          onChange={(e) => setValue(e.target.value)}
        />
      )}
    </label>
  );
}
