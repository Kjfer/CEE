import { useEffect, useState } from 'react';
import type { Certificate } from '@cee/types';
import { certificatesService } from '@/services/certificates.service';

export function useMyCertificates(profileId: string | undefined) {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profileId) {
      setCertificates([]);
      setIsLoading(false);
      return;
    }

    let mounted = true;
    setIsLoading(true);
    certificatesService
      .getMyCertificates(profileId)
      .then(({ data }) => {
        if (mounted) setCertificates(data);
      })
      .catch((err) => {
        if (mounted) setError(err instanceof Error ? err.message : 'Error al cargar certificados.');
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [profileId]);

  return { certificates, isLoading, error };
}
