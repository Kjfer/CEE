import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExecutiveSummaryCardProps {
  summary: string | null;
  loading: boolean;
  failed: boolean;
}

// Resumen ejecutivo generado por IA (vía apps/bot, nunca Groq directo desde
// el navegador). Si falla o aún no hay nada que mostrar, no renderiza nada:
// nunca debe bloquear ni opacar la carga de los KPIs reales del Dashboard.
export function ExecutiveSummaryCard({ summary, loading, failed }: ExecutiveSummaryCardProps) {
  if (failed) return null;
  if (!loading && !summary) return null;

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-xl bg-white p-5 shadow-sm',
        'border-l-[4px] border-l-[#682222] transition-all duration-[400ms] ease-in-out',
      )}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#682222]/10 text-[#682222]">
        <Sparkles className="h-[18px] w-[18px]" strokeWidth={1.75} />
      </span>
      <div className="flex-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#A9A9A9]">
          📌 Resumen del período
        </p>
        {loading ? (
          <div className="mt-2.5 space-y-2">
            <div className="h-3.5 w-full animate-pulse rounded bg-gray-100" />
            <div className="h-3.5 w-4/5 animate-pulse rounded bg-gray-100" />
          </div>
        ) : (
          <p className="mt-1.5 text-sm leading-relaxed text-gray-800">{summary}</p>
        )}
      </div>
    </div>
  );
}
