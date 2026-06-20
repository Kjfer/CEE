import type { SalesReport } from '@cee/types';

// breakdown incluye TODOS los cursos publicados con ventas (c001, c002, c004, c006, c008, c009).
// kpis.totalSales (1284) = suma exacta de salesCount: 315+270+215+198+170+116 = 1284.
// kpis.totalRevenue (45290) = suma exacta de revenue: 10990+9440+7510+6920+5940+4490 = 45290.
// También coincide con el trend de 4 semanas: 9800+11200+12050+12240 = 45290.
export const mockSalesReport: SalesReport = {
  kpis: {
    totalSales: 1284,
    totalRevenue: 45290,
    conversionRate: 4.8,
    salesDeltaPct: 12.5,
    revenueDeltaPct: 8.2,
    conversionDeltaPct: -1.1,
  },
  trend: [
    { label: 'Sem 1', revenue: 9800 },
    { label: 'Sem 2', revenue: 11200 },
    { label: 'Sem 3', revenue: 12050 },
    { label: 'Sem 4', revenue: 12240 },
  ],
  breakdown: [
    {
      courseId: 'c009',
      courseName: 'Gestión Financiera para No Financieros',
      salesCount: 315,
      revenue: 10990,
      lastTransaction: '2024-10-24T14:30:00Z',
    },
    {
      courseId: 'c006',
      courseName: 'Marketing Digital y Growth Hacking',
      salesCount: 270,
      revenue: 9440,
      lastTransaction: '2024-10-23T09:15:00Z',
    },
    {
      courseId: 'c001',
      courseName: 'Gestión de Proyectos Ágiles con Scrum y Kanban',
      salesCount: 215,
      revenue: 7510,
      lastTransaction: '2024-10-24T11:42:00Z',
    },
    {
      courseId: 'c008',
      courseName: 'Comunicación Ejecutiva y Oratoria de Alto Impacto',
      salesCount: 198,
      revenue: 6920,
      lastTransaction: '2024-10-22T16:05:00Z',
    },
    {
      courseId: 'c004',
      courseName: 'Liderazgo y Habilidades Directivas',
      salesCount: 170,
      revenue: 5940,
      lastTransaction: '2024-10-20T10:20:00Z',
    },
    {
      courseId: 'c002',
      courseName: 'Análisis de Datos para Negocios con Python',
      salesCount: 116,
      revenue: 4490,
      lastTransaction: '2024-10-19T08:55:00Z',
    },
  ],
};
