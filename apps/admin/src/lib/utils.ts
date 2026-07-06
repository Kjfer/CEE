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

export function calculateAcademicHours(weeks: number, scheduleText: string): number {
  if (!weeks || !scheduleText) return 0;
  
  const timeRegex = /(?:[0-1]?[0-9]|2[0-3]):[0-5][0-9]\s*(?:-|a|al|to)\s*(?:[0-1]?[0-9]|2[0-3]):[0-5][0-9]/gi;
  const matches = scheduleText.match(timeRegex);
  
  if (!matches || matches.length === 0) return 0;

  let totalHoursPerWeek = 0;

  for (const match of matches) {
    const times = match.match(/(?:[0-1]?[0-9]|2[0-3]):[0-5][0-9]/g);
    if (times && times.length === 2) {
      const [start, end] = times;
      const [startHour, startMin] = start.split(':').map(Number);
      const [endHour, endMin] = end.split(':').map(Number);
      
      const startTotal = startHour + startMin / 60;
      const endTotal = endHour + endMin / 60;
      
      let diff = endTotal - startTotal;
      if (diff < 0) {
        diff += 24;
      }
      totalHoursPerWeek += diff;
    }
  }

  return Math.round(totalHoursPerWeek * weeks);
}
