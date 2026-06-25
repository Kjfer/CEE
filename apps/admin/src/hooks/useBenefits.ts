import { useEffect, useState } from 'react';
import type { Benefit } from '@cee/types';
import { benefitsService } from '@/services/benefitsService';

export function useBenefits() {
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    benefitsService
      .getBenefits()
      .then((response) => {
        if (isMounted) {
          setBenefits(response.data);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const toggleActive = async (id: string, isActive: boolean) => {
    const response = await benefitsService.toggleActive(id, isActive);
    setBenefits((prev) => prev.map((b) => (b.id === id ? response.data : b)));
  };

  const remove = async (id: string) => {
    await benefitsService.deleteBenefit(id);
    setBenefits((prev) => prev.filter((b) => b.id !== id));
  };

  return { benefits, isLoading, toggleActive, remove };
}
