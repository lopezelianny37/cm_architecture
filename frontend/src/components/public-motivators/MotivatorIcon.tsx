interface MotivatorIconProps {
  name: string;
  className?: string;
}

const SHARED_PROPS = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

/**
 * One simple, original line-pictogram per motivator — same spirit as the
 * official Management 3.0 Moving Motivators cards (lupa for Curiosidad,
 * medalla for Honor, etc.) but hand-drawn here, not a copy of their
 * copyrighted artwork. "Honor" is this app's existing name for what M3.0
 * calls "Honra".
 */
export function MotivatorIcon({ name, className }: MotivatorIconProps) {
  const props = { viewBox: '0 0 48 48', className, width: '100%', height: '100%' };

  switch (name) {
    case 'Curiosidad':
      // Magnifying glass.
      return (
        <svg {...props}>
          <circle cx="20" cy="20" r="11" {...SHARED_PROPS} />
          <line x1="28.5" y1="28.5" x2="39" y2="39" {...SHARED_PROPS} />
        </svg>
      );

    case 'Honor':
      // Medal with a star, and ribbon tails.
      return (
        <svg {...props}>
          <path d="M18 26 L13 40 L24 34 L35 40 L30 26" {...SHARED_PROPS} />
          <circle cx="24" cy="18" r="10" {...SHARED_PROPS} />
          <path
            d="M24 12 L26 17 L31 17.5 L27 21 L28.5 26 L24 23 L19.5 26 L21 21 L17 17.5 L22 17 Z"
            fill="currentColor"
            stroke="none"
          />
        </svg>
      );

    case 'Aceptación':
      // Simple face + shoulders.
      return (
        <svg {...props}>
          <circle cx="24" cy="17" r="8" {...SHARED_PROPS} />
          <circle cx="21" cy="16" r="1.3" fill="currentColor" stroke="none" />
          <circle cx="27" cy="16" r="1.3" fill="currentColor" stroke="none" />
          <path d="M19.5 20 Q24 24 28.5 20" {...SHARED_PROPS} />
          <path d="M9 40 Q24 24 39 40" {...SHARED_PROPS} />
        </svg>
      );

    case 'Maestría':
      // Chess pieces: a rook and a pawn.
      return (
        <svg {...props}>
          <path
            d="M9 20 L9 17 L12 17 L12 19 L15 19 L15 17 L18 17 L18 19 L21 19 L21 17 L24 17 L24 20 L22 23 L22 37 L11 37 L11 23 Z"
            {...SHARED_PROPS}
          />
          <circle cx="34" cy="16" r="4.5" {...SHARED_PROPS} />
          <path d="M28 37 L31 24 L37 24 L40 37 Z" {...SHARED_PROPS} />
        </svg>
      );

    case 'Poder':
      // Hand pushing a row of falling dominoes.
      return (
        <svg {...props}>
          <path
            d="M6 30 L6 20 Q6 18 8 18 Q10 18 10 20 L10 28 L11 16 Q11 14 13 14 Q15 14 15 16 L15 27 L16 15 Q16 13 18 13 Q20 13 20 15 L20 27 L21 18 Q21 16 23 16 Q25 16 25 18 L25 32 Q25 38 19 38 L13 38 Q8 38 6 34 Z"
            {...SHARED_PROPS}
          />
          <rect x="29" y="18" width="5" height="14" rx="1" transform="rotate(8 31.5 25)" {...SHARED_PROPS} />
          <rect x="35" y="16" width="5" height="14" rx="1" transform="rotate(16 37.5 23)" {...SHARED_PROPS} />
          <rect x="41" y="14" width="5" height="14" rx="1" transform="rotate(24 43.5 21)" {...SHARED_PROPS} />
        </svg>
      );

    case 'Libertad':
      // Bird in flight, with a small cloud.
      return (
        <svg {...props}>
          <path d="M6 28 Q11 20 16 28 Q21 20 26 28" {...SHARED_PROPS} />
          <path
            d="M29 16 Q29 12 33 12 Q34 9 38 10 Q42 10 42 14 Q45 14 45 17 Q45 20 42 20 L30 20 Q28 20 28 18 Q28 16 29 16 Z"
            {...SHARED_PROPS}
          />
        </svg>
      );

    case 'Relaciones':
      // Two overlapping speech bubbles.
      return (
        <svg {...props}>
          <path
            d="M7 12 H25 Q27 12 27 14 V22 Q27 24 25 24 H14 L8 29 L9.5 24 H9 Q7 24 7 22 Z"
            {...SHARED_PROPS}
          />
          <path
            d="M21 20 H39 Q41 20 41 22 V30 Q41 32 39 32 H28 L22 37 L23.5 32 H23 Q21 32 21 30 Z"
            {...SHARED_PROPS}
          />
        </svg>
      );

    case 'Orden':
      // Stacked blocks.
      return (
        <svg {...props}>
          <rect x="10" y="28" width="12" height="12" {...SHARED_PROPS} />
          <rect x="26" y="28" width="12" height="12" {...SHARED_PROPS} />
          <rect x="18" y="14" width="12" height="12" {...SHARED_PROPS} />
        </svg>
      );

    case 'Meta':
      // Mountain with a flag, and a small cloud.
      return (
        <svg {...props}>
          <path d="M6 38 L17 16 L28 38 Z" {...SHARED_PROPS} />
          <line x1="17" y1="16" x2="17" y2="7" {...SHARED_PROPS} />
          <path d="M17 7 L24 10 L17 13 Z" fill="currentColor" stroke="none" />
          <path
            d="M30 24 Q30 21 33 21 Q34 18.5 37 19.5 Q40 19.5 40 22.5 Q42.5 22.5 42.5 25 Q42.5 27.5 40 27.5 L31 27.5 Q29.5 27.5 29.5 25.5 Q29.5 24 30 24 Z"
            {...SHARED_PROPS}
          />
        </svg>
      );

    case 'Estatus':
      // Podium, 2nd / 1st / 3rd.
      return (
        <svg {...props}>
          <rect x="6" y="24" width="11" height="14" {...SHARED_PROPS} />
          <rect x="18.5" y="16" width="11" height="22" {...SHARED_PROPS} />
          <rect x="31" y="28" width="11" height="10" {...SHARED_PROPS} />
          <text x="11.5" y="33" fontSize="8" textAnchor="middle" fill="currentColor" stroke="none">2</text>
          <text x="24" y="29" fontSize="8" textAnchor="middle" fill="currentColor" stroke="none">1</text>
          <text x="36.5" y="35" fontSize="8" textAnchor="middle" fill="currentColor" stroke="none">3</text>
        </svg>
      );

    default:
      return (
        <svg {...props}>
          <circle cx="24" cy="24" r="12" {...SHARED_PROPS} />
        </svg>
      );
  }
}
