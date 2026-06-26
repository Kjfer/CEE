import clsx from 'clsx';
import { CeciCompact } from './CeciAvatar';
import { useChatStore } from '@/store/chatStore';
import { useLayoutStore } from '@/store/layoutStore';

export function CeciFab() {
  const isOpen = useChatStore((s) => s.isOpen);
  const openChat = useChatStore((s) => s.openChat);
  const hasBottomBar = useLayoutStore((s) => s.hasBottomBar);

  if (isOpen) return null;

  return (
    <button
      onClick={openChat}
      aria-label="Abrir chat CEE"
      className={clsx(
        'fixed right-[88px] z-[10000] border-none cursor-pointer flex items-center gap-2.5 h-14 rounded-[28px]',
        // Elevar sobre la barra de CTA móvil cuando exista; en desktop siempre bottom-6.
        hasBottomBar ? 'bottom-24 lg:bottom-6' : 'bottom-6',
        'bg-[#7B1E2E] hover:scale-[1.03] pl-2 pr-5 py-1',
        'animate-ceci-fab-entry shadow-clay-fab transition-all duration-300',
      )}
    >
      <span className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-[#5a1520]">
        <CeciCompact />
      </span>
      <span className="flex flex-col items-start text-white text-left leading-tight">
        <span className="text-[13px] font-bold">Asesor Virtual CEE</span>
        <span className="text-[10px] opacity-80">¿En qué te ayudo?</span>
      </span>
    </button>
  );
}
