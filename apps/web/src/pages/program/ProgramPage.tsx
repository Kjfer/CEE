import { useEffect, useState } from 'react';
import { ArrowRight, Download, Layers, Users } from 'lucide-react';
import type { Course, ProgramWithModules } from '@cee/types';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/shared/PageHeader';
import { CourseRatingStars } from '@/components/course/CourseRatingStars';
import {
  INSCRIPTION_ANCHOR_ID,
  LandingCertificate,
  LandingCtaBanner,
  LandingFaq,
  LandingOutcomes,
  LandingQuickFacts,
  LandingSection,
  LandingStats,
  LandingStudentProfile,
  LandingTestimonials,
  LandingValueSummary,
  MobileStickyCta,
  ProgramInscriptionForm,
  ProgramModuleExplorer,
  ProgramModulesAccordion,
  scrollToAnchor,
  scrollToInscription,
} from '@/components/course/landing';
import { ROUTES } from '@/constants/routes';
import { formatPrice } from '@/lib/utils';

interface ProgramPageProps {
  program: ProgramWithModules;
}

/** Landing de un programa (contenedor de N módulos/cursos). */
export default function ProgramPage({ program }: ProgramPageProps) {
  const [selectedSortOrder, setSelectedSortOrder] = useState(1);
  const [openModule, setOpenModule] = useState<string | undefined>('modulo-1');

  const handleModuleSelect = (sortOrder: number) => {
    setSelectedSortOrder(sortOrder);
    setOpenModule(`modulo-${sortOrder}`);
  };

  const asCourseStats = program as unknown as Course;

  useEffect(() => {
    const anchor = window.location.hash.slice(1);
    if (!anchor) return;
    const timer = window.setTimeout(() => {
      if (anchor === INSCRIPTION_ANCHOR_ID) {
        scrollToInscription();
      } else if (anchor.startsWith('modulo-')) {
        setOpenModule(anchor);
        const sortOrder = Number.parseInt(anchor.replace('modulo-', ''), 10);
        if (Number.isFinite(sortOrder) && sortOrder > 0) {
          setSelectedSortOrder(sortOrder);
        }
        scrollToAnchor(anchor);
      } else {
        scrollToAnchor(anchor);
      }
    }, 120);
    return () => window.clearTimeout(timer);
  }, [program]);

  return (
    <>
      <PageHeader
        as="header"
        size="md"
        title={program.title}
        description={program.shortDescription}
        breadcrumb={[
          { label: 'Inicio', path: ROUTES.HOME },
          { label: 'Programas', path: ROUTES.CATALOG },
          { label: program.title },
        ]}
        beforeTitle={
          <div className="mb-4 flex flex-wrap gap-2">
            <Badge className="bg-white text-cee-red hover:bg-white/90">
              <Layers className="mr-1 inline h-3 w-3" />
              Programa · {program.moduleCount} módulos
            </Badge>
            <Badge variant="outline" className="border-white/40 text-white">
              {program.category}
            </Badge>
            <Badge variant="outline" className="border-white/40 text-white">
              Nivel {program.level}
            </Badge>
          </div>
        }
      >
        <div className="mt-5 flex flex-wrap items-center gap-4 text-sm">
          {program.rating > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-amber-400">{program.rating.toFixed(1)}</span>
              <CourseRatingStars rating={program.rating} />
            </div>
          )}
          <div className="flex items-center gap-1.5 text-white/80">
            <Users className="h-4 w-4" />
            {program.enrolledCount.toLocaleString('es-PE')} inscritos
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={scrollToInscription}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-cee-red transition-transform hover:scale-[1.02]"
          >
            Inscribirme ahora
            <ArrowRight className="h-4 w-4" />
          </button>
          {program.syllabusPdfUrl && (
            <a
              href={program.syllabusPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-white/40 bg-white/10 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-white/20"
            >
              Descargar brochure
              <Download className="h-4 w-4" />
            </a>
          )}
          <div className="flex items-baseline gap-2 text-white">
            <span className="text-xl font-extrabold">{formatPrice(program.price)}</span>
            {program.originalPrice && (
              <span className="text-sm text-white/60 line-through">
                {formatPrice(program.originalPrice)}
              </span>
            )}
          </div>
        </div>
      </PageHeader>

      <div className="mx-auto max-w-7xl px-4 pb-24 pt-8 sm:px-6 lg:px-8 lg:pb-12">
        <LandingQuickFacts product={program} />

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="space-y-12 lg:col-span-2">
            <LandingSection id="informacion" disableReveal>
              <p className="text-base leading-relaxed text-muted-foreground">
                {program.description}
              </p>
            </LandingSection>

            <LandingSection>
              <LandingOutcomes items={program.benefits} />
            </LandingSection>

            <LandingSection>
              <LandingStats course={asCourseStats} />
            </LandingSection>

            <LandingSection>
              <LandingStudentProfile graduateProfile={program.graduateProfile} />
            </LandingSection>

            <LandingSection>
              <ProgramModuleExplorer
                modules={program.modules}
                selectedSortOrder={selectedSortOrder}
                onSelect={handleModuleSelect}
              />
            </LandingSection>

            <LandingSection>
              <ProgramModulesAccordion
                modules={program.modules}
                openModule={openModule}
                onOpenModuleChange={setOpenModule}
              />
            </LandingSection>

            <LandingSection>
              <LandingCertificate course={asCourseStats} />
            </LandingSection>

            <LandingSection>
              <LandingTestimonials />
            </LandingSection>
          </div>

          <div className="lg:col-span-1">
            <div id={INSCRIPTION_ANCHOR_ID} className="scroll-mt-24 lg:sticky lg:top-24">
              <ProgramInscriptionForm
                program={program}
                selectedSortOrder={selectedSortOrder}
                source="program-sidebar"
              />
            </div>
          </div>
        </div>

        <div className="mt-12 space-y-12">
          <LandingSection>
            <LandingValueSummary course={asCourseStats} />
          </LandingSection>
          <LandingSection>
            <LandingCtaBanner course={asCourseStats} />
          </LandingSection>
          <LandingSection>
            <LandingFaq />
          </LandingSection>
        </div>
      </div>

      <MobileStickyCta price={program.price} />
    </>
  );
}
