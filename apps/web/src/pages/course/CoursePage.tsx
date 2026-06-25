import { useParams } from 'react-router-dom';
import { Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/shared/PageHeader';
import { CourseBenefitsList } from '@/components/course/CourseBenefitsList';
import { CourseRatingStars } from '@/components/course/CourseRatingStars';
import { CourseSidebar } from '@/components/course/CourseSidebar';
import { SyllabusAccordion } from '@/components/course/SyllabusAccordion';
import { TeacherCard } from '@/components/course/TeacherCard';
import { ROUTES } from '@/constants/routes';
import { useCourseDetail } from '@/hooks/useCourseDetail';

export default function CoursePage() {
  const { slug } = useParams<{ slug: string }>();
  const { course, isLoading, error } = useCourseDetail(slug);

  if (isLoading) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-muted-foreground">Cargando curso...</p>
      </section>
    );
  }

  if (error || !course) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold">Curso no encontrado</h1>
      </section>
    );
  }

  const instructorNames = course.instructors.map((instructor) => instructor.name).join(', ');
  const benefits = [...course.benefits, ...course.graduateProfile];

  return (
    <>
      <PageHeader
        as="header"
        size="md"
        title={course.title}
        description={course.shortDescription}
        breadcrumb={[
          { label: 'Inicio', path: ROUTES.HOME },
          { label: 'Programas', path: ROUTES.CATALOG },
          { label: course.title },
        ]}
        beforeTitle={
          <div className="mb-4 flex flex-wrap gap-2">
            <Badge className="bg-white text-cee-red hover:bg-white/90">{course.category}</Badge>
            <Badge variant="outline" className="border-white/40 text-white">
              Nivel {course.level}
            </Badge>
          </div>
        }
      >
        <div className="mt-5 flex flex-wrap items-center gap-4 text-sm">
          {course.rating > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-amber-400">{course.rating.toFixed(1)}</span>
              <CourseRatingStars rating={course.rating} />
            </div>
          )}
          <div className="flex items-center gap-1.5 text-white/80">
            <Users className="h-4 w-4" />
            {course.enrolledCount.toLocaleString('es-PE')} inscritos
          </div>
        </div>

        {instructorNames && (
          <p className="mt-2 text-sm text-white/80">
            Dictado por <span className="font-medium text-white">{instructorNames}</span>
          </p>
        )}
      </PageHeader>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="space-y-10 lg:col-span-2">
            <p className="text-lg text-muted-foreground">{course.description}</p>

            {benefits.length > 0 && <CourseBenefitsList items={benefits} />}

            <div>
              <h2 className="text-xl font-semibold">Contenido del curso</h2>
              <div className="mt-3">
                <SyllabusAccordion modules={course.syllabus} />
              </div>
            </div>

            {course.instructors.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold">Plana docente</h2>
                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                  {course.instructors.map((instructor) => (
                    <TeacherCard key={instructor.id} instructor={instructor} />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24">
              <CourseSidebar course={course} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
