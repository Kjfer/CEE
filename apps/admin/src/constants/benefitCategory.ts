import type { BenefitCategory } from '@cee/types';

export const BENEFIT_CATEGORY_LABELS: Record<BenefitCategory, string> = {
  descuento: 'Descuento',
  acceso: 'Acceso',
  servicio: 'Servicio',
};

export const BENEFIT_CATEGORY_OPTIONS: { value: BenefitCategory; label: string }[] = [
  { value: 'descuento', label: BENEFIT_CATEGORY_LABELS.descuento },
  { value: 'acceso', label: BENEFIT_CATEGORY_LABELS.acceso },
  { value: 'servicio', label: BENEFIT_CATEGORY_LABELS.servicio },
];
