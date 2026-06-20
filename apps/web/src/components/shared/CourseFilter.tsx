import type { CourseCategory } from '@cee/types';

const CATEGORIES: Array<CourseCategory | 'Todas'> = [
  'Todas',
  'Ingeniería',
  'Gestión',
  'Tecnología',
  'Habilidades Blandas',
  'Finanzas',
];

interface CourseFilterProps {
  value: CourseCategory | 'Todas';
  onChange: (value: CourseCategory | 'Todas') => void;
}

export function CourseFilter({ value, onChange }: CourseFilterProps) {
  return (
    <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
      Categoría
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as CourseCategory | 'Todas')}
        className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {CATEGORIES.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
    </label>
  );
}
