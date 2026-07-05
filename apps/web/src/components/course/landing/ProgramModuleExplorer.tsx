import type { ProgramModule } from '@cee/types';
import clsx from 'clsx';
import { Clock } from 'lucide-react';
import { moduleLabel } from '@/lib/roman';
import { SectionHeading } from './SectionHeading';
import { scrollToAnchor } from './landing-utils';

interface ProgramModuleExplorerProps {
  modules: ProgramModule[];
  selectedSortOrder: number;
  onSelect: (sortOrder: number) => void;
}

function findModule(modules: ProgramModule[], sortOrder: number): ProgramModule | undefined {
  return modules.find((m) => m.sortOrder === sortOrder);
}

/** Explorador de módulos en el detalle del programa (columna principal). */
export function ProgramModuleExplorer({
  modules,
  selectedSortOrder,
  onSelect,
}: ProgramModuleExplorerProps) {
  if (modules.length === 0) return null;

  const active = findModule(modules, selectedSortOrder) ?? modules[0];
  const panelId = `module-panel-${active.sortOrder}`;
  const tabId = `module-tab-${active.sortOrder}`;

  return (
    <section aria-label="Explorar módulos del programa">
      <SectionHeading
        eyebrow="Contenido del programa"
        title="Módulos y cursos"
        description="Revisa el contenido de cada módulo. Tu selección se usará al enviar la solicitud de inscripción."
      />

      <div
        role="tablist"
        aria-label="Seleccionar módulo"
        className="mt-6 flex flex-wrap gap-2"
      >
        {modules.map((mod) => {
          const isSelected = mod.sortOrder === selectedSortOrder;
          return (
            <button
              key={mod.course.id}
              type="button"
              role="tab"
              id={`module-tab-${mod.sortOrder}`}
              aria-selected={isSelected}
              aria-controls={`module-panel-${mod.sortOrder}`}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => onSelect(mod.sortOrder)}
              className={clsx(
                'inline-flex min-h-[44px] items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition-colors',
                isSelected
                  ? 'border-cee-red bg-cee-red text-white shadow-sm'
                  : 'border-border bg-card text-foreground hover:border-cee-red/40',
              )}
            >
              {moduleLabel(mod.sortOrder)}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={panelId}
        aria-labelledby={tabId}
        className="mt-4 rounded-xl border border-border bg-card p-5 sm:p-6"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-cee-red">
              {moduleLabel(active.sortOrder)}
            </p>
            <h3 className="mt-1 text-lg font-bold leading-snug text-foreground sm:text-xl">
              {active.course.title}
            </h3>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            {active.course.academicHours} h académicas
          </span>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {active.course.shortDescription || active.course.description}
        </p>

        {active.course.benefits.length > 0 && (
          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Lo que aprenderás
            </p>
            <ul className="mt-3 space-y-2">
              {active.course.benefits.slice(0, 3).map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-foreground">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cee-red" aria-hidden />
                  <span className="leading-snug">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          type="button"
          onClick={() => scrollToAnchor(`modulo-${active.sortOrder}`)}
          className="mt-5 text-sm font-semibold text-cee-red underline-offset-2 hover:underline"
        >
          Ver plan completo del {moduleLabel(active.sortOrder).toLowerCase()}
        </button>
      </div>
    </section>
  );
}
