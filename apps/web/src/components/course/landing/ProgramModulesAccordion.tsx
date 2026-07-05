import type { ProgramModule } from '@cee/types';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { moduleLabel } from '@/lib/roman';
import { SectionHeading } from './SectionHeading';
import { CourseModuleDetail } from './CourseModuleDetail';

interface ProgramModulesAccordionProps {
  modules: ProgramModule[];
  /** Valor controlado del acordeón (p. ej. desde hash #modulo-2) */
  openModule?: string;
  onOpenModuleChange?: (value: string) => void;
}

/** Módulos del programa en acordeón expandible con detalle de cada curso. */
export function ProgramModulesAccordion({
  modules,
  openModule,
  onOpenModuleChange,
}: ProgramModulesAccordionProps) {
  if (modules.length === 0) return null;

  return (
    <div id="contenido" className="scroll-mt-24">
      <SectionHeading
        eyebrow="Plan de estudios"
        title="Módulos del programa"
        description="Cada módulo es un curso completo. Te recomendamos seguir el orden secuencial (I → II → III…) para aprovechar al máximo la formación."
      />

      <Accordion
        type="single"
        collapsible
        value={openModule}
        onValueChange={onOpenModuleChange}
        className="mt-6 rounded-xl border border-border bg-card px-4 sm:px-5"
      >
        {modules.map((mod) => {
          const itemId = `modulo-${mod.sortOrder}`;
          return (
            <AccordionItem key={mod.course.id} value={itemId} id={itemId} className="scroll-mt-24">
              <AccordionTrigger className="text-left text-sm font-semibold hover:no-underline sm:text-base">
                <span>
                  <span className="text-cee-red">{moduleLabel(mod.sortOrder)}</span>
                  <span className="mx-1.5 text-muted-foreground">·</span>
                  {mod.course.title}
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    ({mod.course.academicHours} h)
                  </span>
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <CourseModuleDetail course={mod.course} />
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
