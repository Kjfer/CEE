import type { CourseCategory, CourseModality } from '@cee/types';
import { cn } from '@/lib/utils';

const CATEGORIES: CourseCategory[] = [
  'Gestión',
  'Tecnología',
  'Finanzas',
  'Habilidades Blandas',
  'Ingeniería',
];

const MODALITIES: CourseModality[] = ['Virtual', 'Presencial', 'Híbrido'];

export interface FilterState {
  categories: CourseCategory[];
  modalities: CourseModality[];
  priceMin: string;
  priceMax: string;
}

interface FilterSidebarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onClear: () => void;
}

export function FilterSidebar({ filters, onChange, onClear }: FilterSidebarProps) {
  function toggleCategory(cat: CourseCategory) {
    const next = filters.categories.includes(cat)
      ? filters.categories.filter((c) => c !== cat)
      : [...filters.categories, cat];
    onChange({ ...filters, categories: next });
  }

  function toggleModality(mod: CourseModality) {
    const next = filters.modalities.includes(mod)
      ? filters.modalities.filter((m) => m !== mod)
      : [...filters.modalities, mod];
    onChange({ ...filters, modalities: next });
  }

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.modalities.length > 0 ||
    filters.priceMin !== '' ||
    filters.priceMax !== '';

  return (
    <aside className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Filtros</h2>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-medium text-cee-red underline-offset-2 hover:underline"
          >
            Limpiar todo
          </button>
        )}
      </div>

      {/* Categoría */}
      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Categoría
        </h3>
        <ul className="flex flex-col gap-2">
          {CATEGORIES.map((cat) => {
            const checked = filters.categories.includes(cat);
            return (
              <li key={cat}>
                <label className="flex cursor-pointer items-center gap-2.5 text-sm">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleCategory(cat)}
                    className={cn(
                      'h-4 w-4 rounded border-border accent-cee-red',
                    )}
                  />
                  <span className={cn(checked && 'font-medium text-foreground')}>
                    {cat}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </section>

      <hr className="border-border" />

      {/* Modalidad */}
      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Modalidad
        </h3>
        <ul className="flex flex-col gap-2">
          {MODALITIES.map((mod) => {
            const checked = filters.modalities.includes(mod);
            return (
              <li key={mod}>
                <label className="flex cursor-pointer items-center gap-2.5 text-sm">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleModality(mod)}
                    className="h-4 w-4 rounded border-border accent-cee-red"
                  />
                  <span className={cn(checked && 'font-medium text-foreground')}>
                    {mod}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </section>

      <hr className="border-border" />

      {/* Rango de precio */}
      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Precio (S/)
        </h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            placeholder="Mín"
            value={filters.priceMin}
            onChange={(e) => onChange({ ...filters, priceMin: e.target.value })}
            className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-cee-red"
          />
          <span className="shrink-0 text-muted-foreground">—</span>
          <input
            type="number"
            min={0}
            placeholder="Máx"
            value={filters.priceMax}
            onChange={(e) => onChange({ ...filters, priceMax: e.target.value })}
            className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-cee-red"
          />
        </div>
      </section>
    </aside>
  );
}
