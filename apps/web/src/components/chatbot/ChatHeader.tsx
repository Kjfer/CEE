import { CeciCompact } from './CeciAvatar';
import { useChatStore } from '@/store/chatStore';

export function ChatHeader() {
  const closeChat = useChatStore((s) => s.closeChat);

  return (
    <header className="relative flex items-center gap-2.5 px-3.5 py-3 text-white flex-shrink-0 rounded-t-2xl bg-gradient-to-br from-[#8e2438] via-[#6d1a29] to-[#4d1119]">
      {/* Cian glow line */}
      <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#38BDF8] to-transparent shadow-[0_0_10px_rgba(56,189,248,0.8)]" />

      <span className="h-9 w-9 rounded-full bg-white/10 border-2 border-[rgba(92,212,255,0.45)] shadow-[0_0_10px_rgba(56,189,248,0.35)] flex items-center justify-center flex-shrink-0 overflow-hidden">
        <CeciCompact />
      </span>

      <div className="flex flex-col flex-1 min-w-0">
        <span className="text-sm font-bold tracking-wide">Ceci · Asesor Virtual</span>
        <span className="text-[11px] opacity-85 flex items-center gap-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 animate-ceci-online" />
          En línea · CEE FIIS-UNI
        </span>
      </div>

      <button
        onClick={closeChat}
        aria-label="Cerrar chat"
        className="flex items-center justify-center h-8 w-8 rounded-lg bg-white/10 border border-[rgba(92,212,255,0.3)] hover:bg-white/20 hover:shadow-[0_0_8px_rgba(56,189,248,0.4)] transition-colors text-white"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </header>
  );
}
