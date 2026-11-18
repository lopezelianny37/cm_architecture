/**
 * Subconjunto de nombres (sin descripciones) para etiquetar ejes de radar y barras.
 * Fuente de verdad completa: backend/src/common/constants/gemba.constants.ts
 * Decisión Fase 2: duplicar aquí en vez de un paquete `shared/` (ver plan de Fase 2).
 */

export interface BehaviorDef {
  name: string;
  description: string;
}

export const BEH: BehaviorDef[] = [
  {
    name: 'Comprende antes de proponer',
    description:
      'Pregunta por propósito, problema, usuario y resultado esperado antes de hablar de tecnología.',
  },
  {
    name: 'Flujo de valor del negocio y conexión con estrategia y valor',
    description:
      'Comprende el flujo punta a punta, actores, dependencias y puntos de decisión, y conecta la iniciativa con prioridades estratégicas y valor esperado.',
  },
  {
    name: 'Explora alternativas y trade-offs',
    description: 'Compara valor, riesgo, costo, velocidad y complejidad antes de recomendar.',
  },
  {
    name: 'Piensa regional y reutiliza',
    description: 'Busca capacidades existentes y cuestiona soluciones aisladas.',
  },
  {
    name: 'Facilita e influye',
    description:
      'Escucha, resume y desafía supuestos con evidencias; no confía solo en lo que le dicen, va más allá para generar acuerdos con otras áreas, incluso Negocio, aporta dirección y remueve barreras.',
  },
  {
    name: 'Lenguaje apropiado según audiencia',
    description:
      'Usa conceptos y términos de acuerdo con la audiencia y emplea con naturalidad el lenguaje de negocio propio de la iniciativa.',
  },
  {
    name: 'Hace visible la contribución',
    description: 'Explica qué decisión, resultado o valor habilitó Arquitectura.',
  },
];

export const BEH_NAMES: string[] = BEH.map((b) => b.name);

export const WASTE_TYPES: string[] = ['Retrabajo', 'Supuesto', 'Espera', 'Oportunidad'];

export interface MotivatorDef {
  name: string;
  description: string;
}

export const MOT: MotivatorDef[] = [
  { name: 'Aceptación', description: 'Las personas que me rodean aprueban lo que hago y quién soy.' },
  { name: 'Curiosidad', description: 'Tengo muchas cosas que investigar y sobre las cuales pensar.' },
  { name: 'Libertad', description: 'Soy independiente de otros con mi trabajo y mis responsabilidades.' },
  { name: 'Estatus', description: 'Mi posición es buena y reconocida por las personas que trabajan conmigo.' },
  { name: 'Meta', description: 'Mi propósito en la vida se refleja en el trabajo que hago.' },
  { name: 'Honor', description: 'Mis valores personales se reflejan en cómo trabajo.' },
  { name: 'Maestría', description: 'Mi trabajo desafía mis competencias, pero sigue dentro de mis capacidades.' },
  { name: 'Orden', description: 'Existen suficientes reglas y políticas para un ambiente estable.' },
  { name: 'Poder', description: 'Hay suficiente espacio para influir en lo que sucede a mi alrededor.' },
  { name: 'Relaciones', description: 'Tengo buenas relaciones sociales con las personas en mi trabajo.' },
];

export const MOT_NAMES: string[] = MOT.map((m) => m.name);

export const TYPES: string[] = ['Conocimiento', 'Competencia'];

/** Primeras 3 palabras de cada behavior, para etiquetas cortas en el radar (igual al prototipo). */
export const BEH_SHORT_LABELS: string[] = BEH_NAMES.map((name) =>
  name.split(' ').slice(0, 3).join(' '),
);

export interface ConditionDef {
  name: string;
  question: string;
}

export const COND: ConditionDef[] = [
  { name: 'Acceso a Negocio', question: '¿Tuvo acceso directo al referente cuando lo necesitó?' },
  {
    name: 'Participación temprana',
    question: '¿Arquitectura entró antes de que problema y solución estuvieran cerrados?',
  },
  {
    name: 'Información',
    question: '¿Tuvo estrategia, KPIs, portafolio, dependencias y capacidades disponibles?',
  },
  {
    name: 'Tiempo / prioridad',
    question: '¿Tuvo espacio para discovery y análisis, o las urgencias lo impidieron?',
  },
  {
    name: 'Claridad de rol',
    question: '¿Estaba claro qué lideraba, en qué contribuía y qué acompañaba Arquitectura?',
  },
  {
    name: 'Patrocinio / liderazgo',
    question: '¿El entorno respaldó que desafiara supuestos y cocreara con Negocio?',
  },
  {
    name: 'Foros y gobernanza',
    question: '¿Los foros permitieron explorar alternativas y tomar decisiones con evidencia?',
  },
];

export const FLOWQ: string[] = [
  '¿En qué paso entró Negocio?',
  '¿Cuándo apareció una solución?',
  '¿Qué paso generó mayor espera o retrabajo?',
  '¿Qué paso faltó y hubiera cambiado la decisión?',
];

/**
 * Fixed, closed list for the public Moving Motivators wizard's macrodomain
 * select — see SPEC_MOVING_MOTIVATORS_ADDENDUM.md, Ambiguity #9. No "Otro",
 * no free text. Order matters (rendered in this order). Must byte-match
 * backend/src/common/constants/gemba.constants.ts's PUBLIC_MACRODOMAINS.
 */
export const PUBLIC_MACRODOMAINS: string[] = [
  'CX & Engagement',
  'Business Line',
  'Enterprise Technology',
  'Enablement Service',
  'Technology Foundation',
];
