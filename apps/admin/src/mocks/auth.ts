import type { User } from '@cee/types';
import { useAuthStore } from '@/store/authStore';

export const mockAdminUser: User = {
  id: 'admin-001',
  name: 'José Espinoza',
  email: 'jespinoza@cee-fiis.edu.pe',
  role: 'admin',
  avatarUrl: 'https://picsum.photos/seed/admin-jose-espinoza/100/100',
};

/** Simula el login del admin mientras no exista backend (Fase 6). */
export function mockLogin() {
  useAuthStore.getState().login(mockAdminUser);
}
