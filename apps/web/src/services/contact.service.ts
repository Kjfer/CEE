import type { ApiResponse, ContactLead } from '@cee/types';
import { API_ENDPOINTS } from '@/constants/api.constants';
import { api } from '@/services/api';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

const delay = <T>(value: T, ms = 400): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

function validateLead(data: Omit<ContactLead, 'id' | 'createdAt'>): void {
  if (!data.name.trim() || !data.email.trim() || !data.phone.trim() || !data.message.trim()) {
    throw new Error('Todos los campos requeridos deben completarse.');
  }
  if (!data.email.includes('@') || !data.email.includes('.')) {
    throw new Error('El formato del email no es válido.');
  }
  if (data.message.trim().length < 10) {
    throw new Error('El mensaje debe tener al menos 10 caracteres.');
  }
}

export const contactService = {
  async send(data: Omit<ContactLead, 'id' | 'createdAt'>): Promise<ApiResponse<ContactLead>> {
    if (USE_MOCKS) {
      validateLead(data);
      const lead: ContactLead = {
        ...data,
        id: `mock-lead-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      return delay({ data: lead });
    }
    const response = await api.post<ApiResponse<ContactLead>>(API_ENDPOINTS.CONTACT, data);
    return response.data;
  },
};
