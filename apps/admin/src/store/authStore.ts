import { create } from 'zustand';
import type { User } from '@cee/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}

/**
 * Auth mock de Fase 5: en memoria, sin localStorage. El admin se "loguea"
 * vía mockLogin() (src/mocks/auth.ts) al levantar la app; no persiste entre
 * refrescos (la regla del repo solo autoriza localStorage en
 * apps/web/src/store/authStore.ts). Persistencia real llega en Fase 6.
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
