import type { DashboardCategoryPoint, DashboardKpis } from '@cee/types';

export interface DashboardSummaryRequest {
  from: string;
  to: string;
  kpis: DashboardKpis;
  coursesByCategory: DashboardCategoryPoint[];
}

export const dashboardSummaryService = {
  /**
   * Pide a la función serverless propia (apps/admin/api/dashboard-summary.ts)
   * un resumen ejecutivo en lenguaje natural de las métricas ya calculadas del
   * Dashboard. La llamada a Groq vive en el servidor a propósito — nunca se
   * expone la API key de Groq en el navegador para este flujo.
   */
  async getSummary(payload: DashboardSummaryRequest): Promise<string> {
    const res = await fetch('/api/dashboard-summary', {
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
