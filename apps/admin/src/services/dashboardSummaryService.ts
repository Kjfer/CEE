import type { DashboardCategoryPoint, DashboardKpis } from '@cee/types';

const BOT_URL = (import.meta.env.VITE_BOT_URL as string | undefined) ?? 'http://localhost:3000';

export interface DashboardSummaryRequest {
  from: string;
  to: string;
  kpis: DashboardKpis;
  coursesByCategory: DashboardCategoryPoint[];
}

export const dashboardSummaryService = {
  /**
   * Pide al backend (apps/bot) un resumen ejecutivo en lenguaje natural de las
   * métricas ya calculadas del Dashboard. La llamada a Groq vive en el
   * backend a propósito — nunca se expone la API key de Groq en el navegador
   * para este flujo.
   */
  async getSummary(payload: DashboardSummaryRequest): Promise<string> {
    const res = await fetch(`${BOT_URL}/api/dashboard-summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`Error del servidor (${res.status}).`);
    }

    const data = (await res.json()) as { summary: string };
    return data.summary;
  },
};
