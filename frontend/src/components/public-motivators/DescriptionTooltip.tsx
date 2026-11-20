interface DescriptionTooltipProps {
  description: string;
  /** Step 1 shows it above the card; Step 2 keeps it below, consistent
   * with where its drag tooltip already appeared. */
  position: 'above' | 'below';
}

/** Dark hover/focus/drag tooltip shared by Step 1 and Step 2. */
export function DescriptionTooltip({ description, position }: DescriptionTooltipProps) {
  const positionClass = position === 'above' ? 'bottom-full mb-1' : 'top-full mt-1';

  return (
    <div
      className={`absolute ${positionClass} left-1/2 -translate-x-1/2 w-[140px] bg-[var(--navy)] text-white text-[10px] leading-tight rounded-lg p-[8px] z-20 pointer-events-none`}
    >
      {description}
    </div>
  );
}
