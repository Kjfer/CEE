import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Autoplay from 'embla-carousel-autoplay';
import { CalendarDays } from 'lucide-react';
import type { EventSlide } from '@cee/types';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const dateFormatter = new Intl.DateTimeFormat('es-PE', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

interface EventSliderProps {
  events: EventSlide[];
}

export function EventSlider({ events }: EventSliderProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    api.on('select', () => setCurrent(api.selectedScrollSnap()));
  }, [api]);

  if (events.length === 0) return null;

  return (
    <Carousel
      setApi={setApi}
      opts={{ loop: true }}
      plugins={
        prefersReducedMotion
          ? []
          : [Autoplay({ delay: 5500, stopOnMouseEnter: true, stopOnInteraction: false })]
      }
      className="group"
    >
      <CarouselContent>
        {events.map((event, index) => (
          <CarouselItem key={event.id}>
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl sm:aspect-[21/9]">
              <img
                src={event.imageUrl}
                alt={event.title}
                className="absolute inset-0 h-full w-full object-cover"
                loading={index === 0 ? 'eager' : 'lazy'}
                fetchPriority={index === 0 ? 'high' : 'auto'}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-cee-ink/85 via-cee-ink/30 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-cee-red/40 via-transparent to-transparent" />

              <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-5 sm:p-8 lg:p-10">
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm sm:text-sm">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {dateFormatter.format(new Date(`${event.date}T00:00:00`))}
                </span>
                <h3 className="max-w-2xl text-xl font-semibold leading-tight text-white sm:text-3xl">
                  {event.title}
                </h3>
                <Button
                  asChild
                  size="lg"
                  className="mt-1 w-fit bg-white text-cee-red transition-transform hover:scale-[1.03] hover:bg-white/90"
                >
                  <Link to={event.ctaHref}>{event.ctaLabel}</Link>
                </Button>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>

      {events.length > 1 && (
        <>
          <CarouselPrevious className="opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100 group-focus-within:opacity-100 border-white/40 bg-black/30 text-white hover:bg-black/50 hover:text-white" />
          <CarouselNext className="opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100 group-focus-within:opacity-100 border-white/40 bg-black/30 text-white hover:bg-black/50 hover:text-white" />

          <div className="absolute inset-x-0 bottom-3 flex justify-center gap-2 sm:bottom-4">
            {events.map((event, index) => (
              <button
                key={event.id}
                type="button"
                aria-label={`Ir al evento ${index + 1}: ${event.title}`}
                aria-current={index === current}
                onClick={() => api?.scrollTo(index)}
                className={cn(
                  'h-2 w-2 rounded-full bg-white/50 transition-all',
                  index === current && 'w-6 bg-white',
                )}
              />
            ))}
          </div>
        </>
      )}
    </Carousel>
  );
}
