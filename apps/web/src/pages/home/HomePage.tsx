import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import type { CourseCategory } from '@cee/types';
import { CourseCard } from '@/components/shared/CourseCard';
import { CourseFilter } from '@/components/shared/CourseFilter';
import { Button } from '@/components/ui/button';
import { InstitutionalLogos } from '@/components/shared/InstitutionalLogos';
import { ROUTES } from '@/constants/routes';
import { useCourses } from '@/hooks/useCourses';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const FEATURED_COUNT = 6;

export default function HomePage() {
  const [category, setCategory] = useState<CourseCategory | 'Todas'>('Todas');
  const { courses, isLoading } = useCourses({ category });
  const heroRef = useRef<HTMLDivElement>(null);
  const coursesGridRef = useScrollReveal<HTMLDivElement>({ selector: ':scope > *' });

  useEffect(() => {
    if (!heroRef.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const tween = gsap.fromTo(
      heroRef.current.children,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'power2.out' },
    );

    return () => {
      tween.kill();
    };
  }, []);

  return (
    <>
      <section className="relative overflow-hidden bg-cee-red text-white">
        <div
          className="absolute inset-y-0 right-0 hidden w-3/5 sm:block sm:[clip-path:polygon(15%_0,100%_0,100%_100%,0_100%)]"
          style={{ aspectRatio: '16 / 10' }}
        >
          <img
            src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1920&q=80"
            alt=""
            className="h-full w-full object-cover"
            loading="eager"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-[rgba(104,34,34,0.55)]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div ref={heroRef} className="max-w-xl">
            <h1 className="text-3xl leading-tight sm:text-5xl">
              Especialízate con el Centro de Especialización Ejecutiva
            </h1>
            <p className="mt-4 text-base text-white/85 sm:text-lg">
              Programas ejecutivos de la FIIS-UNI diseñados para impulsar tu carrera profesional.
            </p>
            <Button asChild size="lg" className="mt-8 bg-white text-cee-red transition-transform hover:scale-[1.03] hover:bg-white/90">
              <Link to={ROUTES.CATALOG}>Explorar Cursos</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-muted/50">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-6 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Con el respaldo de
          </p>
          <InstitutionalLogos variant="color" />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl">Programas destacados</h2>
          <CourseFilter value={category} onChange={setCategory} />
        </div>

        {isLoading ? (
          <p className="mt-10 text-center text-muted-foreground">Cargando cursos...</p>
        ) : courses.length === 0 ? (
          <p className="mt-10 text-center text-muted-foreground">
            No hay cursos disponibles en esta categoría.
          </p>
        ) : (
          <div ref={coursesGridRef} className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.slice(0, FEATURED_COUNT).map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}

        <div className="mt-10 flex justify-center">
          <Button asChild variant="outline" size="lg">
            <Link to={ROUTES.CATALOG}>Ver más</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
