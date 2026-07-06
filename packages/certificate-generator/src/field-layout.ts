import type { CertificateData } from './types';

/** Altura de referencia de la plantilla Canva (px). */
export const CERTIFICATE_REFERENCE_HEIGHT = 1414;

/** Incrementar cuando cambie el layout. */
export const CERTIFICATE_LAYOUT_VERSION = 4;

export type FieldAlign = 'left' | 'center';

/**
 * Posiciones medidas píxel a píxel sobre template.png (2000×1414).
 * `top` = centro vertical del texto en el hueco del PNG (ratio 0–1 desde arriba).
 * `left` = ancla horizontal (centro del hueco si align=center).
 *
 * Mapa vertical real del PNG (verificado por recortes):
 *   y≈574–605  "OTORGA EL PRESENTE CERTIFICADO A:" (rojo)
 *   y≈620–700  hueco NOMBRE (vacío)            → centro ~660
 *   y≈765      línea horizontal roja
 *   y≈803–828  "POR SU PARTICIPACIÓN EN EL CURSO:"
 *   y≈840–930  hueco CURSO (vacío)             → centro ~885
 *   y≈978–997  "Con una duración de ___ horas" → gap horas cx 0.567
 *   y≈1072–1096 "Nota: ___ /20"               → gap nota cx 0.5085
 *   y≈1168–1196 "Lima ___ de ___ del 20 ___"  → día 0.20, mes 0.288, año 0.405
 */
export const CERTIFICATE_FIELD_LAYOUT = {
  studentName: { top: 662 / 1414, fontSize: 44, bold: true, maxWidth: 0.72, color: 'maroon' as const },
  courseName: { top: 886 / 1414, fontSize: 30, bold: true, maxWidth: 0.78, color: 'black' as const },
  hours: {
    left: 0.567,
    top: 985 / 1414,
    fontSize: 30,
    bold: false,
    align: 'center' as FieldAlign,
    color: 'black' as const,
  },
  grade: {
    left: 0.5085,
    top: 1082 / 1414,
    fontSize: 30,
    bold: true,
    align: 'center' as FieldAlign,
    color: 'maroon' as const,
  },
  dateDay: {
    left: 0.2005,
    top: 1182 / 1414,
    fontSize: 28,
    bold: false,
    align: 'center' as FieldAlign,
    color: 'black' as const,
  },
  dateMonth: {
    left: 0.2883,
    top: 1182 / 1414,
    fontSize: 28,
    bold: false,
    align: 'center' as FieldAlign,
    color: 'black' as const,
  },
  dateYearSuffix: {
    left: 0.405,
    top: 1182 / 1414,
    fontSize: 28,
    bold: false,
    align: 'center' as FieldAlign,
    color: 'black' as const,
  },
  certificateNumber: {
    left: 0.04,
    top: 0.93,
    fontSize: 11,
    bold: false,
    align: 'left' as FieldAlign,
    color: 'black' as const,
  },
} as const;

export const SPANISH_MONTHS = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
] as const;

export function parseCertificateDate(isoDate: string): {
  day: string;
  month: string;
  yearSuffix: string;
} {
  const d = new Date(`${isoDate}T12:00:00`);
  return {
    day: String(d.getDate()),
    month: SPANISH_MONTHS[d.getMonth()] ?? '',
    yearSuffix: String(d.getFullYear()).slice(-2),
  };
}

export function formatGrade(grade: number): string {
  return Number.isInteger(grade) ? String(grade) : grade.toFixed(1).replace(/\.0$/, '');
}

export function scaleFontSize(baseSize: number, pageHeight: number): number {
  return Math.round(baseSize * (pageHeight / CERTIFICATE_REFERENCE_HEIGHT));
}

/** Convierte centro vertical (top) a línea base PDF (y crece hacia arriba). */
export function middleRatioToPdfBaseline(pageHeight: number, topRatio: number, fontSize: number): number {
  const middleFromTop = pageHeight * topRatio;
  const baselineFromTop = middleFromTop + fontSize * 0.38;
  return pageHeight - baselineFromTop;
}

export type { CertificateData };
