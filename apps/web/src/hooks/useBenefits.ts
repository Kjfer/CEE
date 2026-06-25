import { useEffect, useState } from 'react';
import type { Benefit } from '@cee/types';
import { benefitsService } from '@/services/benefits.service';

export function useBenefits() {
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    benefitsService
      .getActive()
      .then((data) => {
        if (isMounted) setBenefits(data);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return { benefits, isLoading };
}
