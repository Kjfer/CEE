import { create } from 'zustand';

interface LayoutState {
  /**
   * Indica que hay una barra de acción fija en el borde inferior (p. ej. el CTA
   * móvil de la landing del programa). Los FAB flotantes (WhatsApp / chatbot) la
   * leen para elevarse y no taparla en móvil.
   */
  hasBottomBar: boolean;
  setHasBottomBar: (value: boolean) => void;
}

export const useLayoutStore = create<LayoutState>((set) => ({
  hasBottomBar: false,
  setHasBottomBar: (value) => set({ hasBottomBar: value }),
}));
