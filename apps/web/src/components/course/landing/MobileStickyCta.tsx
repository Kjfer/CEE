import { useEffect } from 'react';
import type { Course } from '@cee/types';
import { ArrowRight } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useLayoutStore } from '@/store/layoutStore';
import { scrollToInscription } from './landing-utils';

interface MobileStickyCtaProps {
  course: Course;
}

/** CTA fijo inferior (solo móvil) que desplaza al formulario de inscripción de la misma página. */
export function MobileStickyCta({ course }: MobileStickyCtaProps) {
  const setHasBottomBar = useLayoutStore((s) => s.setHasBottomBar);

  // Avisa a los FAB flotantes (WhatsApp / chatbot) para que se eleven en móvil y no tapen el CTA.
  useEffect(() => {
    setHasBottomBar(true);
    return () => setHasBottomBar(false);
  }, [setHasBottomBar]);

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 p-3 shadow-2xl backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-1">
        <div className="shrink-0">
          <p className="text-xs text-muted-foreground">Inversión</p>
          <p className="text-lg font-extrabold text-foreground">{formatPrice(course.price)}</p>
        </div>
        <button
          type="button"
          onClick={scrollToInscription}
          className="flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl bg-cee-red px-4 py-3 font-bold text-white transition-colors hover:bg-cee-red-dark"
        >
          Inscribirme
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
