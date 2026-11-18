import { useState } from 'react';
import { useAutoSave } from '../../hooks/useAutoSave';

interface AutoSaveFieldOption {
  value: string;
  label: string;
}

interface AutoSaveFieldProps {
  label: string;
  initialValue: string;
  onSave: (value: string) => void;
  placeholder?: string;
  as?: 'input' | 'textarea' | 'select';
  rows?: number;
  options?: AutoSaveFieldOption[];
}

export function AutoSaveField({
  label,
  initialValue,
  onSave,
  placeholder,
  as = 'input',
  rows = 4,
  options,
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
      ) : as === 'select' ? (
        <select className={className} value={value} onChange={(e) => setValue(e.target.value)}>
          {(options ?? []).map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
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
