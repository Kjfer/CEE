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

export function formatDateLong(date: string | Date) {
  if (!date) return '';
  let value: Date;
  if (typeof date === 'string') {
    value = date.includes('T') ? new Date(date) : new Date(`${date}T00:00:00`);
  } else {
    value = date;
  }
  if (isNaN(value.getTime())) return 'Fecha inválida';
  return longDateFormatter.format(value).toUpperCase();
}

/** Iniciales de respaldo para avatares sin foto, ej. "Carlos Mendoza" -> "CM". */
export function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const initials = [parts[0], parts[parts.length - 1]]
    .filter(Boolean)
    .map((part) => part[0])
    .join('');
  return initials.toUpperCase() || '?';
}

export function slugify(text: string) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
