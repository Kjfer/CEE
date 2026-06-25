import { Link } from 'react-router-dom';
import { TeacherCard } from '@/components/course/TeacherCard';
import { PageHeader } from '@/components/shared/PageHeader';
import { ROUTES } from '@/constants/routes';
import { useTeachers } from '@/hooks/useTeachers';

export default function ProfessorsPage() {
  const { teachers, isLoading } = useTeachers();

  return (
    <>
      <PageHeader
        eyebrow="CEE-FIIS"
        title="Profesores"
        description="Conoce a la plana docente del CEE-FIIS: profesionales con trayectoria académica y empresarial que acompañan cada programa."
        breadcrumb={[{ label: 'Inicio', path: ROUTES.HOME }, { label: 'Profesores' }]}
      />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {isLoading ? (
          <p className="text-center text-muted-foreground">Cargando profesores...</p>
        ) : teachers.length === 0 ? (
          <p className="text-center text-muted-foreground">
            No hay profesores disponibles por el momento.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {teachers.map((teacher) => (
              <Link
                key={teacher.id}
                to={ROUTES.TEACHER_PROFILE.replace(':slug', teacher.slug)}
                className="rounded-xl transition hover:-translate-y-0.5"
              >
                <TeacherCard instructor={teacher} />
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
