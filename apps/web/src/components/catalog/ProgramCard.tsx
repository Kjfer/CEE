import { Link, useNavigate } from 'react-router-dom';
import type { Program } from '@cee/types';
import { Layers } from 'lucide-react';
import { CourseCountdown } from '@/components/shared/CourseCountdown';
import { ROUTES } from '@/constants/routes';
import { formatPrice } from '@/lib/utils';
import { buildInscripcionUrl } from '@/lib/inscripcion';
import { CATEGORY_GRADIENTS } from '@/constants/category-gradients';

interface ProgramCardProps {
  program: Program;
  moduleCount: number;
}

export function ProgramCard({ program, moduleCount }: ProgramCardProps) {
  const navigate = useNavigate();
  const programUrl = ROUTES.COURSE.replace(':slug', program.slug);

  const handleInscribirse = () => {
    navigate(buildInscripcionUrl(program.slug));
  };

  return (
    <article className="flex flex-col overflow-hidden rounded-lg border border-border bg-card text-card-foreground transition duration-200 hover:-translate-y-1 hover:shadow-md">
      <div
        className="relative w-full shrink-0 bg-cover bg-center aspect-video"
        style={{ backgroundImage: CATEGORY_GRADIENTS[program.category] }}
      >
        <img
          src={program.imageUrl}
          alt={program.title}
          className="h-full w-full object-cover"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-cee-red px-2.5 py-1 text-[10px] font-bold uppercase text-white shadow">
          <Layers className="h-3 w-3" />
          Programa · {moduleCount} módulos
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <span className="w-fit rounded-full border border-cee-red/30 bg-transparent px-3 py-1 text-xs font-semibold uppercase text-cee-red">
          {program.category}
        </span>
        <Link to={programUrl} className="text-lg font-semibold hover:text-cee-red">
          {program.title}
        </Link>
        <p className="line-clamp-3 text-sm text-muted-foreground">{program.shortDescription}</p>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{program.academicHours} horas</span>
          <span className="text-base font-semibold text-cee-red">
            {program.enrolledCount.toLocaleString('es-PE')} inscritos
          </span>
        </div>

        <CourseCountdown course={program} />

        <div className="mt-auto flex items-center justify-between">
          <p className="text-lg font-bold text-cee-red">{formatPrice(program.price)}</p>
        </div>

        <div className="flex gap-2">
          <Link
            to={`${programUrl}#contenido`}
            className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium hover:bg-accent"
          >
            Ver detalles
          </Link>
          <button
            type="button"
            onClick={handleInscribirse}
            className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Inscribirme
          </button>
        </div>
      </div>
    </article>
  );
}
