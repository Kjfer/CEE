import { useCallback, useMemo } from 'react';
import { useToastStore, type ToastVariant } from '@/store/toastStore';

export function useToast() {
  const show = useToastStore((state) => state.show);

  const toast = useCallback(
    (title: string, description?: string, variant: ToastVariant = 'info') =>
      show({ title, description, variant }),
    [show],
  );
  const success = useCallback(
    (title: string, description?: string) => show({ title, description, variant: 'success' }),
    [show],
  );
  const error = useCallback(
    (title: string, description?: string) => show({ title, description, variant: 'error' }),
    [show],
  );

  return useMemo(() => ({ toast, success, error }), [toast, success, error]);
}
