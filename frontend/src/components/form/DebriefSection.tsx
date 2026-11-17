import { AutoSaveField } from './AutoSaveField';

interface DebriefSectionProps {
  strength: string;
  selfgap: string;
  block: string;
  tryNext: string;
  onSaveStrength: (v: string) => void;
  onSaveSelfgap: (v: string) => void;
  onSaveBlock: (v: string) => void;
  onSaveTry: (v: string) => void;
}

export function DebriefSection({
  strength,
  selfgap,
  block,
  tryNext,
  onSaveStrength,
  onSaveSelfgap,
  onSaveBlock,
  onSaveTry,
}: DebriefSectionProps) {
  return (
    <div className="grid grid-cols-1 tablet:grid-cols-2 gap-[11px]">
      <AutoSaveField
        label="¿Qué hiciste bien respecto del nuevo rol?"
        initialValue={strength}
        as="textarea"
        rows={3}
        onSave={onSaveStrength}
      />
      <AutoSaveField
        label="¿Qué brecha detectas tú?"
        initialValue={selfgap}
        as="textarea"
        rows={3}
        onSave={onSaveSelfgap}
      />
      <AutoSaveField
        label="¿Qué te impidió trabajar diferente?"
        initialValue={block}
        as="textarea"
        rows={3}
        onSave={onSaveBlock}
      />
      <AutoSaveField
        label="¿Qué probarías distinto la próxima vez?"
        initialValue={tryNext}
        as="textarea"
        rows={3}
        onSave={onSaveTry}
      />
    </div>
  );
}
