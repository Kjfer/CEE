import type { ProgramModule } from '@cee/types';
import clsx from 'clsx';
import { formatModuleTitle, moduleLabel } from '@/lib/roman';

interface ModuleStartSelectorProps {
  modules: ProgramModule[];
  selectedSortOrder: number;
  onSelect: (sortOrder: number) => void;
}

/** Selector de módulo de inicio; default Módulo I con badge "Recomendado". */
export function ModuleStartSelector({ modules, selectedSortOrder, onSelect }: ModuleStartSelectorProps) {
  if (modules.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-muted/30 p-4">
      <p className="text-sm font-bold text-foreground">¿Desde qué módulo deseas empezar?</p>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
        Recomendamos comenzar por el Módulo I y seguir el orden secuencial para aprovechar al máximo
        el programa.
      </p>
      <div className="mt-3 grid gap-2">
        {modules.map((mod) => {
          const isSelected = mod.sortOrder === selectedSortOrder;
          const isRecommended = mod.sortOrder === 1;
          return (
            <button
              key={mod.course.id}
              type="button"
              onClick={() => onSelect(mod.sortOrder)}
              className={clsx(
                'flex min-h-[44px] w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left text-sm transition-colors',
                isSelected
                  ? 'border-cee-red bg-cee-red/5 ring-1 ring-cee-red/30'
                  : 'border-border bg-card hover:border-cee-red/40',
              )}
            >
              <span className="font-medium text-foreground">
                {moduleLabel(mod.sortOrder)} — {formatModuleTitle(mod.course.title, mod.sortOrder)}
              </span>
              {isRecommended && (
                <span className="ml-2 shrink-0 rounded-full bg-cee-red/10 px-2 py-0.5 text-[10px] font-bold uppercase text-cee-red">
                  Recomendado
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
