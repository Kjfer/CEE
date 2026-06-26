import { ROUTES } from '@/constants/routes';

/**
 * Query param usado por el formulario de contacto general (`/contacto?curso=<id>`)
 * para precargar un curso. Lo consume `useCursoSeleccionado`. Se mantiene para no
 * romper el flujo de contacto existente.
 */
export const COURSE_QUERY_PARAM = 'curso';

/** Ancla del formulario de inscripción dentro de la landing del programa. */
export const INSCRIPCION_ANCHOR = 'inscripcion';

/**
 * "Inscribirme" lleva ahora a la landing del programa (detalle) anclando al
 * formulario de captura de leads integrado: `/programas/<slug>#inscripcion`.
 */
export function buildInscripcionUrl(slug: string) {
  return `${ROUTES.COURSE.replace(':slug', slug)}#${INSCRIPCION_ANCHOR}`;
}
