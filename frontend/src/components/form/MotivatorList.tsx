import { useState } from 'react';
import type { MotivatorItem } from '../../types/api';

interface MotivatorListProps {
  motivators: MotivatorItem[];
  onChange: (items: MotivatorItem[]) => void;
}

function reindex(items: MotivatorItem[]): MotivatorItem[] {
  return items.map((item, i) => ({ ...item, order: i }));
}

export function MotivatorList({ motivators, onChange }: MotivatorListProps) {
  const sorted = [...motivators].sort((a, b) => a.order - b.order);
  const [draggedName, setDraggedName] = useState<string | null>(null);

  function handleDrop(targetName: string) {
    if (!draggedName || draggedName === targetName) return;

    const fromIndex = sorted.findIndex((m) => m.name === draggedName);
    const toIndex = sorted.findIndex((m) => m.name === targetName);
    if (fromIndex === -1 || toIndex === -1) return;

    const reordered = [...sorted];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);

    onChange(reindex(reordered));
    setDraggedName(null);
  }

  function handleImpactChange(name: string, impact: number) {
    onChange(sorted.map((m) => (m.name === name ? { ...m, impact } : m)));
  }

  function move(name: string, direction: 'up' | 'down') {
    const index = sorted.findIndex((m) => m.name === name);
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sorted.length) return;

    const reordered = [...sorted];
    [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
    onChange(reindex(reordered));
  }

  return (
    <div className="grid gap-2">
      {sorted.map((m, i) => (
        <div
          key={m.name}
          draggable
          onDragStart={() => setDraggedName(m.name)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop(m.name)}
          className="grid grid-cols-1 tablet:grid-cols-[36px_1fr_150px_44px_44px] items-center gap-[9px] p-[10px] border border-[var(--line)] rounded-xl bg-white"
        >
          <div className="print:hidden hidden tablet:block text-[20px] text-[#8a96aa] text-center cursor-grab">↕</div>
          <div>
            <b className="block">
              {i + 1}. {m.name}
            </b>
            <span className="text-[12px] text-[var(--mut)]">{m.description}</span>
          </div>
          <div className="grid items-center gap-[5px]" style={{ gridTemplateColumns: '24px 1fr 24px' }}>
            <span>−</span>
            <input
              type="range"
              min={-2}
              max={2}
              step={1}
              value={m.impact}
              onChange={(e) => handleImpactChange(m.name, Number(e.target.value))}
              className="w-full"
            />
            <span>+</span>
          </div>
          <button
            type="button"
            className="print:hidden w-11 h-11 border border-[var(--line)] rounded-lg bg-white"
            onClick={() => move(m.name, 'up')}
            aria-label={`Subir ${m.name}`}
          >
            ↑
          </button>
          <button
            type="button"
            className="print:hidden w-11 h-11 border border-[var(--line)] rounded-lg bg-white"
            onClick={() => move(m.name, 'down')}
            aria-label={`Bajar ${m.name}`}
          >
            ↓
          </button>
        </div>
      ))}
    </div>
  );
}
