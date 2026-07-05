import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { CatalogItem, CourseCategory } from '@cee/types';
import { ProgramCard } from '@/components/catalog/ProgramCard';
import { CourseCard } from '@/components/shared/CourseCard';
import { CourseCardSkeleton } from '@/components/shared/CourseCardSkeleton';
import { CourseFilter } from '@/components/shared/CourseFilter';
import { AboutSection } from '@/components/home/AboutSection';
import { BlogSection } from '@/components/home/BlogSection';
import { EventSlider } from '@/components/home/EventSlider';
import { HomeSideActions } from '@/components/home/HomeSideActions';
import { SectionAnchors } from '@/components/home/SectionAnchors';
import { NextStartBadge } from '@/components/shared/NextStartBadge';
import { WhyChooseUsSection } from '@/components/home/WhyChooseUsSection';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { useCatalog } from '@/hooks/useCatalog';
import { useEvents } from '@/hooks/useEvents';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useSiteSettings } from '@/hooks/useSiteSettings';

function getFeaturedItem(items: CatalogItem[]): CatalogItem | undefined {
  const published = items.filter((item) => {
    const status = item.kind === 'course' ? item.course.status : item.program.status;
    const startDate = item.kind === 'course' ? item.course.startDate : item.program.startDate;
    return status === 'published' && startDate;
  });

  return [...published].sort((a, b) => {
    const dateA = a.kind === 'course' ? a.course.startDate! : a.program.startDate!;
    const dateB = b.kind === 'course' ? b.course.startDate! : b.program.startDate!;
    return new Date(dateA).getTime() - new Date(dateB).getTime();
  })[0];
}

function toNextStartBadgeProps(item: CatalogItem | undefined) {
  if (!item) return undefined;
  if (item.kind === 'course') {
    return { title: item.course.title, startDate: item.course.startDate, status: item.course.status };
  }
  return {
    title: item.program.title,
    startDate: item.program.startDate,
    status: item.program.status,
  };
}

const FEATURED_COUNT = 6;

const SECTION_ANCHORS = [
  { id: 'hero', label: 'Inicio' },
  { id: 'eventos', label: 'Eventos' },
  { id: 'programas', label: 'Programas' },
  { id: 'nosotros', label: 'Nosotros' },
  { id: 'blog', label: 'Blog' },
];

// Eliminated hardcoded HERO_IMAGES

export default function HomePage() {
  const [category, setCategory] = useState<CourseCategory | 'Todas'>('Todas');
  const [heroImageIndex, setHeroImageIndex] = useState(0);
  const { items, isLoading } = useCatalog({ category });
  const { events, isLoading: eventsLoading } = useEvents();
  const { settings } = useSiteSettings();
  const heroImages = settings?.heroImages?.length 
    ? settings.heroImages 
    : ['https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1600&q=75'];
    
  const publishedItems = items.filter((item) =>
    item.kind === 'course' ? item.course.status === 'published' : item.program.status === 'published',
  );
  const featuredItem = getFeaturedItem(publishedItems);
  const featuredForBadge = toNextStartBadgeProps(featuredItem);
  const heroRef = useRef<HTMLDivElement>(null);
  const eventosSectionRef = useScrollReveal<HTMLDivElement>({ selector: ':scope > *' });
  const programasHeaderRef = useScrollReveal<HTMLDivElement>();
  const coursesGridRef = useScrollReveal<HTMLDivElement>({ selector: ':scope > *' });
  const nosotrosSectionRef = useScrollReveal<HTMLDivElement>();
  const blogSectionRef = useScrollReveal<HTMLDivElement>({ selector: ':scope > *' });

  // Carrusel de imágenes hero
  useEffect(() => {
    const interval = setInterval(() => {
      setHeroImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [heroImages.length]);

  // Funciones de navegación del carrusel
  const handlePrevImage = () => {
    setHeroImageIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  };

  const handleNextImage = () => {
    setHeroImageIndex((prev) => (prev + 1) % heroImages.length);
  };

  // Animación de entrada del hero
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
    <div className="snap-container">
      <SectionAnchors sections={SECTION_ANCHORS} />
      <HomeSideActions />

      <section
        id="hero"
        className="relative isolate flex flex-col overflow-hidden bg-cee-ink text-white sm:min-h-screen sm:flex-row"
      >
        {/* Imagen de fondo (desktop): carrusel que cambia cada 5 segundos */}
        <div className="absolute inset-0 hidden sm:block overflow-hidden">
          <div className="relative h-full w-full">
            {/* Contenedor de imágenes con animación de deslizamiento */}
            <div
              className="absolute h-full w-full transition-transform duration-700"
              style={{
                transform: `translateX(-${heroImageIndex * 100}%)`,
              }}
            >
              {heroImages.map((image, idx) => (
                <div
                  key={idx}
                  className="absolute h-full w-full overflow-hidden"
                  style={{ left: `${idx * 100}%` }}
                >
                  <img
                    src={image}
                    alt=""
                    className="h-full w-full object-cover blur-[1px] scale-105"
                    loading={idx === heroImageIndex ? 'eager' : 'lazy'}
                    fetchPriority={idx === heroImageIndex ? 'high' : 'low'}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-cee-ink/30 via-cee-ink/10 to-transparent" />
        </div>

        {/* Bloque guinda con degradé: contiene TODO el texto, alineado a la izquierda */}
        <div className="relative z-10 flex w-full flex-col justify-center bg-gradient-to-r from-cee-red-800 via-cee-red-700 via-20% to-transparent px-6 py-14 sm:w-2/5 sm:py-0 sm:pl-10 sm:pr-20 lg:pl-16 lg:pr-32">
          <div ref={heroRef} className="max-w-xl">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
              <span className="h-px w-6 bg-white/50" aria-hidden="true" />
              CEE-FIIS · Desde 1999
            </p>
            <h1 className="mt-2 text-4xl leading-tight sm:text-4xl font-bold">
              Especialízate con el Centro de Especialización Ejecutiva
            </h1>
            <p className="mt-3 text-base text-white/85">
              Programas ejecutivos de la FIIS-UNI diseñados para impulsar tu carrera profesional.
            </p>

            <NextStartBadge course={featuredForBadge} isLoading={isLoading} className="mt-5" />

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="bg-white text-cee-red shadow-lg shadow-cee-ink/20 transition-transform hover:scale-[1.03] hover:bg-white/90">
                <Link to={ROUTES.CONTACT}>Inscríbete ahora</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/40 bg-transparent text-white hover:border-white hover:bg-white hover:text-cee-red"
              >
                <Link to={ROUTES.CATALOG}>Explorar Cursos</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Imagen (mobile): debajo del texto, a ancho completo */}
        <div className="relative h-48 w-full sm:hidden overflow-hidden">
          <div className="relative h-full w-full">
            <div className="sm:hidden w-full h-[50vh] relative overflow-hidden">
              <div
                className="absolute h-full w-full transition-transform duration-700"
                style={{
                  transform: `translateX(-${heroImageIndex * 100}%)`,
                }}
              >
                {heroImages.map((image, idx) => (
                  <img
                    key={idx}
                    src={image}
                    alt=""
                    className="absolute h-full w-full object-cover"
                    style={{ left: `${idx * 100}%` }}
                    loading="lazy"
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="absolute inset-0 bg-cee-ink/30" />
        </div>

        {/* Controles del carrusel: botones de navegación y indicadores */}
        <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-8 sm:bottom-8">
          {/* Botón anterior */}
          <button
            onClick={handlePrevImage}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-cee-red text-white transition hover:bg-cee-red-dark backdrop-blur-sm shadow-lg flex-shrink-0"
            aria-label="Imagen anterior"
          >
            <ChevronLeft className="h-7 w-7" />
          </button>

          {/* Indicadores de página */}
          <div className="flex gap-3">
            {heroImages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setHeroImageIndex(idx)}
                className={`rounded-full transition-all ${
                  idx === heroImageIndex ? 'bg-cee-red w-8 h-4' : 'bg-cee-red/60 w-4 h-4 hover:bg-cee-red'
                }`}
                aria-label={`Ir a imagen ${idx + 1}`}
              />
            ))}
          </div>

          {/* Botón siguiente */}
          <button
            onClick={handleNextImage}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-cee-red text-white transition hover:bg-cee-red-dark backdrop-blur-sm shadow-lg flex-shrink-0"
            aria-label="Siguiente imagen"
          >
            <ChevronRight className="h-7 w-7" />
          </button>
        </div>
      </section>

      <section
        id="eventos"
        ref={eventosSectionRef}
        className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
      >
        <div className="mb-6 flex flex-col gap-1 sm:mb-8">
          <p className="text-xs font-medium uppercase tracking-widest text-cee-red">
            Agenda CEE
          </p>
          <h2 className="text-2xl font-bold">Próximos Eventos</h2>
        </div>
        <EventSlider events={events} isLoading={eventsLoading} />
      </section>

      <section
        id="programas"
        className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
      >
        <div
          ref={programasHeaderRef}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <h2 className="text-2xl font-bold">Programas destacados</h2>
          <CourseFilter value={category} onChange={setCategory} />
        </div>

        {isLoading ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <CourseCardSkeleton key={i} />
            ))}
          </div>
        ) : publishedItems.length === 0 ? (
          <p className="mt-10 text-center text-muted-foreground">
            No hay programas disponibles en esta categoría.
          </p>
        ) : (
          <div ref={coursesGridRef} className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {publishedItems.slice(0, FEATURED_COUNT).map((item) =>
              item.kind === 'program' ? (
                <ProgramCard
                  key={item.program.id}
                  program={item.program}
                  moduleCount={item.moduleCount}
                />
              ) : (
                <CourseCard key={item.course.id} course={item.course} />
              ),
            )}
          </div>
        )}

        <div className="mt-10 flex justify-center">
          <Button asChild variant="outline" size="lg">
            <Link to={ROUTES.CATALOG}>Ver más</Link>
          </Button>
        </div>
      </section>

      <section
        id="nosotros"
        ref={nosotrosSectionRef}
        className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
      >
        <AboutSection />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <WhyChooseUsSection />
      </section>

      <section
        id="blog"
        ref={blogSectionRef}
        className="bg-dot-pattern bg-surface-grey py-16 pb-24 sm:py-20 sm:pb-24"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <BlogSection />
        </div>
      </section>
    </div>
  );
}
