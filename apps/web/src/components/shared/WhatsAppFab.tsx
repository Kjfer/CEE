import { useLocation } from 'react-router-dom';
import { CONTACT_INFO } from '@/constants/contact.constants';
import { WhatsAppIcon } from '@/components/shared/WhatsAppIcon';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/lib/utils';

export function WhatsAppFab() {
  const { pathname } = useLocation();
  const isHome = pathname === ROUTES.HOME;

  return (
    <a
      href={CONTACT_INFO.whatsappUrl}
      target="_blank"
      rel="noreferrer"
      aria-label="Escríbenos por WhatsApp"
      className={cn(
        'fixed right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:scale-100',
        isHome ? 'bottom-20 lg:bottom-6' : 'bottom-6',
      )}
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
}
