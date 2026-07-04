import type { CSSProperties } from "react";
import clsx from "clsx";
import { CeciCompact } from "./CeciAvatar";
import { useChatStore } from "@/store/chatStore";
import { useLayoutStore } from "@/store/layoutStore";

export function CeciFab() {
  const isOpen = useChatStore((s) => s.isOpen);
  const openChat = useChatStore((s) => s.openChat);
  const hasBottomBar = useLayoutStore((s) => s.hasBottomBar);
  const hasConsentBanner = useLayoutStore((s) => s.hasConsentBanner);
  const consentBannerHeight = useLayoutStore((s) => s.consentBannerHeight);
  // Offset inferior en móvil: el banner de cookies (altura real) tiene prioridad,
  // luego la barra de CTA móvil; en desktop (lg) siempre vuelve a bottom-6.
  const mobileBottom = hasConsentBanner
    ? `${consentBannerHeight + 16}px`
    : hasBottomBar
      ? "6rem"
      : "1.5rem";

  if (isOpen) return null;

  return (
    <button
      onClick={openChat}
      aria-label="Abrir chat CEE"
      style={{ "--fab-bottom": mobileBottom } as CSSProperties}
      className={clsx(
        "fixed bottom-6 right-[88px] z-[10000] border cursor-pointer flex items-center gap-2.5 h-14 rounded-[28px]",
        "border-[rgba(92,212,255,0.35)] text-white",
        "bg-gradient-to-br from-[#8e2438] via-[#6d1a29] to-[#5a1520]",
        "hover:-translate-y-0.5 hover:scale-[1.03] pl-2 pr-5 py-1",
        "animate-ceci-fab-entry animate-ceci-fab-ping shadow-holo-fab",
        "transition-all duration-200",
      )}
    >
      <span className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-transparent overflow-hidden">
        <CeciCompact />
      </span>
      <span className="flex flex-col items-start text-white text-left leading-tight">
        <span className="text-[13px] font-bold tracking-wide">
          Asesor Virtual CEE
        </span>
        <span className="text-[10px] opacity-80">¿En qué te ayudo?</span>
      </span>
    </button>
  );
}
