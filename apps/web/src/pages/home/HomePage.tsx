import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { CourseCategory } from '@cee/types';
import { CourseCard } from '@/components/shared/CourseCard';
import { CourseFilter } from '@/components/shared/CourseFilter';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { useCourses } from '@/hooks/useCourses';

const FEATURED_COUNT = 6;

export default function HomePage() {
  const [category, setCategory] = useState<CourseCategory | 'Todas'>('Todas');
  const { courses, isLoading } = useCourses({ category });

  return (
    <>
      <section className="border-b-4 border-cee-gray bg-cee-red text-white">
        <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 sm:py-28 lg:px-8">
          <h1 className="text-3xl font-extrabold leading-tight sm:text-5xl">
            Especialízate con el Centro de Especialización Ejecutiva
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-white/85 sm:text-lg">
            Programas ejecutivos de la FIIS-UNI diseñados para impulsar tu carrera profesional.
          </p>
          <Button asChild size="lg" className="mt-8 bg-white text-cee-red hover:bg-white/90">
            <Link to={ROUTES.CATALOG}>Explorar Cursos</Link>
          </Button>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold">Programas destacados</h2>
          <CourseFilter value={category} onChange={setCategory} />
        </div>

        {isLoading ? (
          <p className="mt-10 text-center text-muted-foreground">Cargando cursos...</p>
        ) : courses.length === 0 ? (
          <p className="mt-10 text-center text-muted-foreground">
            No hay cursos disponibles en esta categoría.
          </p>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
