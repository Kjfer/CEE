import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number) {
  return `S/ ${price.toFixed(2)}`;
}

const longDateFormatter = new Intl.DateTimeFormat('es-PE', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

/** Formato de fecha larga en mayúsculas, ej. "11 DE MAYO DE 2026" (locale es-PE). */
export function formatDateLong(date: string) {
  return longDateFormatter.format(new Date(`${date}T00:00:00`)).toUpperCase();
}

const COMBINING_DIACRITICS_REGEX = new RegExp(
  `[${String.fromCharCode(0x0300)}-${String.fromCharCode(0x036f)}]`,
  'g',
);

export function slugify(text: string) {
  return text
    .normalize('NFD')
    .replace(COMBINING_DIACRITICS_REGEX, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
