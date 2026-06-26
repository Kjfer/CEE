/** Id del ancla del formulario de inscripción dentro de la landing del programa. */
export const INSCRIPTION_ANCHOR_ID = 'inscripcion';

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/**
 * Desplaza la vista hasta el formulario de inscripción y, si existe, enfoca el
 * primer campo para mantener un flujo accesible. Respeta prefers-reduced-motion.
 */
export function scrollToInscription() {
  if (typeof document === 'undefined') return;
  const target = document.getElementById(INSCRIPTION_ANCHOR_ID);
  if (!target) return;

  target.scrollIntoView({
    behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    block: 'start',
  });

  const firstField = target.querySelector<HTMLElement>(
    'input:not([type="hidden"]):not([aria-hidden="true"]), select, textarea',
  );
  firstField?.focus({ preventScroll: true });
}
