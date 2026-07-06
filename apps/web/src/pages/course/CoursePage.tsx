import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import type { Course } from '@cee/types';
import { ArrowRight, Users, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/shared/PageHeader';
import { CourseRatingStars } from '@/components/course/CourseRatingStars';
import {
  InscriptionForm,
  INSCRIPTION_ANCHOR_ID,
  LandingCertificate,
  LandingCtaBanner,
  LandingFaq,
  LandingInstructors,
  LandingOutcomes,
  LandingQuickFacts,
  LandingSection,
  LandingStats,
  LandingStudentProfile,
  LandingSyllabus,
  LandingTestimonials,
  LandingValueSummary,
  MobileStickyCta,
  scrollToAnchor,
  scrollToInscription,
} from '@/components/course/landing';
import { ROUTES } from '@/constants/routes';
import { useCourseDetail } from '@/hooks/useCourseDetail';
import { formatPrice } from '@/lib/utils';

interface CoursePageProps {
  /** Curso ya resuelto por ProductDetailPage (evita doble fetch). */
  initialCourse?: Course;
}

export default function CoursePage({ initialCourse }: CoursePageProps = {}) {
  const { slug } = useParams<{ slug: string }>();
  const fetched = useCourseDetail(initialCourse ? undefined : slug);
  const course = initialCourse ?? fetched.course;
  const isLoading = initialCourse ? false : fetched.isLoading;
  const error = initialCourse ? null : fetched.error;

  // Al cargar, desplazar a cualquier ancla del hash (#inscripcion enfoca el form; #contenido y demás solo hacen scroll).
  useEffect(() => {
    if (!course) return;
    const anchor = window.location.hash.slice(1);
    if (!anchor) return;
    const timer = window.setTimeout(() => {
      if (anchor === INSCRIPTION_ANCHOR_ID) {
        scrollToInscription();
      } else {
        scrollToAnchor(anchor);
      }
    }, 120);
    return () => window.clearTimeout(timer);
  }, [course]);

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

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={scrollToInscription}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-cee-red transition-transform hover:scale-[1.02]"
          >
            Inscribirme ahora
            <ArrowRight className="h-4 w-4" />
          </button>
          {course.syllabusPdfUrl && (
            <a
              href={course.syllabusPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-white/40 bg-white/10 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-white/20"
            >
              Descargar brochure
              <Download className="h-4 w-4" />
            </a>
          )}
          <div className="flex items-baseline gap-2 text-white">
            <span className="text-xl font-extrabold">{formatPrice(course.price)}</span>
            {course.originalPrice && (
              <span className="text-sm text-white/60 line-through">
                {formatPrice(course.originalPrice)}
              </span>
            )}
          </div>
        </div>
      </PageHeader>

      <div className="mx-auto max-w-7xl px-4 pb-24 pt-8 sm:px-6 lg:px-8 lg:pb-12">
        <LandingQuickFacts product={course} />

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="space-y-12 lg:col-span-2">
            <LandingSection id="informacion" disableReveal>
              <p className="text-base leading-relaxed text-muted-foreground">
                {course.description}
              </p>
            </LandingSection>

            <LandingSection>
              <LandingOutcomes items={course.benefits} />
            </LandingSection>

            <LandingSection>
              <LandingStats course={course} />
            </LandingSection>

            <LandingSection>
              <LandingStudentProfile graduateProfile={course.graduateProfile} />
            </LandingSection>

            <LandingSection id="contenido">
              <LandingSyllabus course={course} />
            </LandingSection>

            <LandingSection>
              <LandingInstructors instructors={course.instructors} />
            </LandingSection>

            <LandingSection>
              <LandingCertificate course={course} />
            </LandingSection>

            <LandingSection>
              <LandingTestimonials />
            </LandingSection>
          </div>

          <div className="lg:col-span-1">
            <div id={INSCRIPTION_ANCHOR_ID} className="scroll-mt-24 lg:sticky lg:top-24">
              <InscriptionForm course={course} source="sidebar" />
            </div>
          </div>
        </div>

        <div className="mt-12 space-y-12">
          <LandingSection>
            <LandingValueSummary course={course} />
          </LandingSection>

          <LandingSection>
            <LandingCtaBanner course={course} />
          </LandingSection>

          <LandingSection>
            <LandingFaq />
          </LandingSection>
        </div>
      </div>

      <MobileStickyCta price={course.price} />
    </>
  );
}
