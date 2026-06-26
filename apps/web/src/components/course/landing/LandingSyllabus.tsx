import type { SyllabusModule } from '@cee/types';
import { Sparkles } from 'lucide-react';
import { SyllabusAccordion } from '@/components/course/SyllabusAccordion';
import { SectionHeading } from './SectionHeading';

interface LandingSyllabusProps {
  modules: SyllabusModule[];
}

/** Plan de estudios (reutiliza SyllabusAccordion) + banner de proyecto integrador genérico. */
export function LandingSyllabus({ modules }: LandingSyllabusProps) {
  return (
    <div>
      <SectionHeading
        eyebrow="Plan de estudios"
        title="Contenido del programa"
        description="Metodología Learning by Doing: cada sesión combina fundamentos conceptuales con la resolución de casos y proyectos aplicados."
      />

      {modules.length > 0 && (
        <div className="mt-8">
          <SyllabusAccordion modules={modules} />
        </div>
      )}

      <div className="mt-8 overflow-hidden rounded-2xl bg-gradient-to-br from-cee-red-900 via-cee-red-700 to-cee-ink p-8 text-white shadow-lg">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Proyecto integrador final</h3>
            <p className="mt-2 leading-relaxed text-white/85">
              Aplicarás todo lo aprendido en un proyecto final con un caso real del sector, el
              mismo tipo de entregable que una empresa esperaría de un profesional senior.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
