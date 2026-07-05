import clsx from 'clsx';
import type { CatalogKindFilter } from '@/hooks/useCatalog';

const TABS: { value: CatalogKindFilter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'program', label: 'Programas' },
  { value: 'course', label: 'Cursos' },
];

interface CatalogTabsProps {
  value: CatalogKindFilter;
  onChange: (value: CatalogKindFilter) => void;
}

export function CatalogTabs({ value, onChange }: CatalogTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Filtrar por tipo de producto"
      className="inline-flex flex-wrap gap-1 rounded-lg border border-border bg-muted/40 p-1"
    >
      {TABS.map((tab) => (
        <button
          key={tab.value}
          type="button"
          role="tab"
          aria-selected={value === tab.value}
          onClick={() => onChange(tab.value)}
          className={clsx(
            'min-h-[40px] rounded-md px-4 py-2 text-sm font-medium transition-colors',
            value === tab.value
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
