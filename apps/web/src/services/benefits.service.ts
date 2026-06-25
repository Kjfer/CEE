import type { Benefit } from '@cee/types';
import { mockBenefits } from '@/mocks';
import { supabase } from '@/lib/supabase';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

const delay = <T>(value: T, ms = 300): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

interface BenefitRow {
  id: string;
  title: string;
  description: string;
  discount_label: string;
  category: Benefit['category'];
  code: string | null;
  valid_until: string | null;
  is_active: boolean;
  created_at: string;
}

function formatBenefit(row: BenefitRow): Benefit {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    discountLabel: row.discount_label,
    category: row.category,
    code: row.code,
    validUntil: row.valid_until,
    isActive: row.is_active,
    createdAt: row.created_at,
  };
}

export const benefitsService = {
  /** Beneficios activos visibles para el estudiante en su perfil. */
  async getActive(): Promise<Benefit[]> {
    if (USE_MOCKS) {
      return delay(mockBenefits.filter((b) => b.isActive));
    }

    const { data, error } = await supabase
      .from('benefits')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw new Error('No se pudieron cargar los beneficios.');
    return (data ?? []).map((row) => formatBenefit(row as BenefitRow));
  },
};
