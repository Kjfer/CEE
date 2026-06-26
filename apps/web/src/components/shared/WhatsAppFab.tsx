import clsx from "clsx";
import { CONTACT_INFO } from "@/constants/contact.constants";
import { WhatsAppIcon } from "@/components/shared/WhatsAppIcon";
import { useChatStore } from "@/store/chatStore";
import { useLayoutStore } from "@/store/layoutStore";

// Orden de apilamiento de elementos flotantes: MobileStickyCta (z-40) < WhatsAppFab (z-50) < CeciFab/ChatPanel (z-[10000]).
export function WhatsAppFab() {
  const highlightWhatsApp = useChatStore((s) => s.highlightWhatsApp);
  const chatOpen = useChatStore((s) => s.isOpen);
  const hasBottomBar = useLayoutStore((s) => s.hasBottomBar);

  return (
    <a
      href={CONTACT_INFO.whatsappUrl}
      target="_blank"
      rel="noreferrer"
      aria-label="Escríbenos por WhatsApp"
      className={clsx(
        "fixed z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:scale-100",
        // Elevar sobre la barra de CTA móvil cuando exista; en desktop siempre bottom-6.
        hasBottomBar ? "bottom-24 lg:bottom-6" : "bottom-6",
        chatOpen ? "left-6" : "right-6",
        highlightWhatsApp && "animate-ceci-wa-pulse",
      )}
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
}
