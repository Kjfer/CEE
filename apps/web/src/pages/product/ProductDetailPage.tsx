import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageLoader } from '@/components/shared/PageLoader';
import CoursePage from '@/pages/course/CoursePage';
import ProgramPage from '@/pages/program/ProgramPage';
import { ROUTES } from '@/constants/routes';
import { coursesService } from '@/services/courses.service';
import { programsService } from '@/services/programs.service';

/**
 * Resuelve /programas/:slug → programa o curso independiente.
 * Si el slug es de un curso que es módulo, redirige al programa padre.
 */
export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'program'; slug: string }
    | { status: 'course'; slug: string }
    | { status: 'not-found' }
  >({ status: 'loading' });
  const [program, setProgram] = useState<Awaited<
    ReturnType<typeof programsService.getBySlug>
  >['data'] | null>(null);
  const [course, setCourse] = useState<Awaited<
    ReturnType<typeof coursesService.getBySlug>
  >['data'] | null>(null);

  useEffect(() => {
    if (!slug) {
      setState({ status: 'not-found' });
      return;
    }

    let cancelled = false;
    setState({ status: 'loading' });
    setProgram(null);
    setCourse(null);

    const resolve = async () => {
      try {
        const { data: prog } = await programsService.getBySlug(slug);
        if (!cancelled) {
          setProgram(prog);
          setState({ status: 'program', slug });
        }
        return;
      } catch {
        /* no es programa; intentar curso */
      }

      try {
        const link = await programsService.getProgramLinkByCourseSlug(slug);
        if (link && !cancelled) {
          navigate(`${ROUTES.COURSE.replace(':slug', link.programSlug)}#modulo-${link.sortOrder}`, {
            replace: true,
          });
          return;
        }

        const { data: c } = await coursesService.getBySlug(slug);
        if (!cancelled) {
          setCourse(c);
          setState({ status: 'course', slug });
        }
      } catch {
        if (!cancelled) setState({ status: 'not-found' });
      }
    };

    void resolve();
    return () => {
      cancelled = true;
    };
  }, [slug, navigate]);

  if (state.status === 'loading') {
    return <PageLoader />;
  }

  if (state.status === 'not-found') {
    return (
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold">Programa no encontrado</h1>
      </section>
    );
  }

  if (state.status === 'program' && program) {
    return <ProgramPage program={program} />;
  }

  if (state.status === 'course' && course) {
    return <CoursePage initialCourse={course} />;
  }

  return <PageLoader />;
}
