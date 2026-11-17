import { FLOWQ } from '../../constants/gemba.constants';

interface FlowQAProps {
  answers: string[];
  onChange: (answers: string[]) => void;
}

export function FlowQA({ answers, onChange }: FlowQAProps) {
  function updateAt(index: number, value: string) {
    onChange(answers.map((a, i) => (i === index ? value : a)));
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-[11px]">
      {FLOWQ.map((question, i) => (
        <label key={question} className="block text-[11px] font-bold text-[var(--mut)] bg-[#f8fafc] border border-[var(--line)] rounded-lg p-[10px]">
          {question}
          <textarea
            className="w-full mt-1 p-2 border border-[var(--line)] rounded-lg bg-white"
            rows={2}
            value={answers[i] ?? ''}
            onChange={(e) => updateAt(i, e.target.value)}
          />
        </label>
      ))}
    </div>
  );
}
