/**
 * Subconjunto de nombres (sin descripciones) para etiquetar ejes de radar y barras.
 * Fuente de verdad completa: backend/src/common/constants/gemba.constants.ts
 * Decisión Fase 2: duplicar aquí en vez de un paquete `shared/` (ver plan de Fase 2).
 */

export const BEH_NAMES: string[] = [
  'Comprende antes de proponer',
  'Flujo de valor del negocio y conexión con estrategia y valor',
  'Explora alternativas y trade-offs',
  'Piensa regional y reutiliza',
  'Facilita e influye',
  'Lenguaje apropiado según audiencia',
  'Hace visible la contribución',
  'Cocrea y orienta decisiones a valor',
];

export const MOT_NAMES: string[] = [
  'Aceptación',
  'Curiosidad',
  'Libertad',
  'Estatus',
  'Meta',
  'Honor',
  'Maestría',
  'Orden',
  'Poder',
  'Relaciones',
];

export const TYPES: string[] = [
  'Conocimiento',
  'Habilidad / skill',
  'Comportamiento',
  'Motivación',
  'Proceso',
  'Acceso',
  'Prioridad / capacidad',
  'Rol / responsabilidades',
  'Información',
  'Gobernanza',
];

/** Primeras 3 palabras de cada behavior, para etiquetas cortas en el radar (igual al prototipo). */
export const BEH_SHORT_LABELS: string[] = BEH_NAMES.map((name) =>
  name.split(' ').slice(0, 3).join(' '),
);
