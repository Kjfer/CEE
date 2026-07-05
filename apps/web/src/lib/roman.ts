/** Convierte un entero positivo a numeral romano (I, II, III, …). */
export function toRoman(n: number): string {
  if (!Number.isInteger(n) || n < 1) return '';
  const values = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
  const numerals = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I'];
  let result = '';
  let remaining = n;
  for (let i = 0; i < values.length; i++) {
    while (remaining >= values[i]) {
      result += numerals[i];
      remaining -= values[i];
    }
  }
  return result;
}

/** Etiqueta de módulo para UI: "Módulo II" */
export function moduleLabel(sortOrder: number): string {
  return `Módulo ${toRoman(sortOrder)}`;
}

/** Título display de un curso dentro de un programa: "Nombre del Curso II" */
export function formatModuleTitle(baseTitle: string, sortOrder: number): string {
  const roman = toRoman(sortOrder);
  return roman ? `${baseTitle} ${roman}` : baseTitle;
}
