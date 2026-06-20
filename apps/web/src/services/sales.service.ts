import type { SalesReport } from '@cee/types';
import { API_ENDPOINTS } from '@/constants/api.constants';
import { mockSalesReport } from '@/mocks';
import { api } from '@/services/api';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

const delay = <T>(value: T, ms = 400): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

export const salesService = {
  async getReport(range?: string): Promise<SalesReport> {
    if (USE_MOCKS) {
      return delay(mockSalesReport);
    }
    const response = await api.get<SalesReport>(`${API_ENDPOINTS.SALES}/report`, {
      params: range ? { range } : undefined,
    });
    return response.data;
  },
};
