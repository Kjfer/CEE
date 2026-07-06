import type { Course } from '@cee/types';
import { Sparkles, FileText, Download } from 'lucide-react';
import { SectionHeading } from './SectionHeading';
import { Button } from '@/components/ui/button';

interface LandingSyllabusProps {
  course: Course;
}

/** Plan de estudios y brochure. */
export function LandingSyllabus({ course }: LandingSyllabusProps) {
  return (
    <div>
      <SectionHeading
        eyebrow="Plan de estudios"
        title="Brochure del Curso"
        description="Conoce en detalle todos los temas que desarrollaremos, la metodología y los beneficios."
      />

      {course.syllabusPdfUrl ? (
        <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-gray-50 p-8 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-cee-red-600">
            <FileText className="h-8 w-8" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">Descarga el sílabo oficial</h3>
          <p className="mb-6 max-w-md text-sm text-gray-500">
            Obtén el brochure en formato PDF con la descripción completa de los módulos, 
            perfil del egresado y detalles académicos de este curso.
          </p>
          <Button asChild className="gap-2 bg-cee-red-600 hover:bg-cee-red-700">
            <a href={course.syllabusPdfUrl} target="_blank" rel="noreferrer">
              <Download className="h-4 w-4" />
              Descargar Brochure PDF
            </a>
          </Button>
        </div>
      ) : (
        <div className="mt-6 p-6 text-center text-gray-500 border rounded-xl bg-gray-50">
          Brochure próximamente disponible.
        </div>
      )}

      <div className="mt-6 overflow-hidden rounded-xl bg-gradient-to-br from-cee-red-900 via-cee-red-700 to-cee-ink p-6 text-white shadow-lg">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold">Proyecto integrador final</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-white/85">
              Aplicarás todo lo aprendido en un proyecto final con un caso real del sector, el
              mismo tipo de entregable que una empresa esperaría de un profesional senior.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
