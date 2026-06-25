import type { ApiResponse, Benefit, BenefitCategory } from '@cee/types';
import { mockAdminBenefits } from '@/mocks/benefits';
import { supabase } from '@/lib/supabase';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

const delay = <T>(value: T, ms = 400): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

// Fase 5 / panel admin: trabaja 100% sobre mocks cuando VITE_USE_MOCKS=true.
// Las mutaciones se aplican sobre este array en memoria; persisten mientras
// dure la sesión de la pestaña, no hay almacenamiento real (mismo patrón que coursesService).
let benefits: Benefit[] = [...mockAdminBenefits];

/** Forma de datos que recoge BenefitFormPage (input de UI, no contrato de backend). */
export interface BenefitFormInput {
  title: string;
  description: string;
  discountLabel: string;
  category: BenefitCategory;
  code: string | null;
  validUntil: string | null;
  isActive: boolean;
}

function buildBenefitFromInput(input: BenefitFormInput, existing?: Benefit): Benefit {
  return {
    id: existing?.id ?? `ben-${Date.now()}`,
    title: input.title,
    description: input.description,
    discountLabel: input.discountLabel,
    category: input.category,
    code: input.code,
    validUntil: input.validUntil,
    isActive: input.isActive,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
  };
}

interface BenefitRow {
  id: string;
  title: string;
  description: string;
  discount_label: string;
  category: BenefitCategory;
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

function toRowPayload(input: BenefitFormInput) {
  return {
    title: input.title,
    description: input.description,
    discount_label: input.discountLabel,
    category: input.category,
    code: input.code,
    valid_until: input.validUntil,
    is_active: input.isActive,
  };
}

export const benefitsService = {
  async getBenefits(): Promise<ApiResponse<Benefit[]>> {
    if (USE_MOCKS) {
      return delay({ data: benefits });
    }

    const { data, error } = await supabase
      .from('benefits')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error('No se pudieron cargar los beneficios.');
    return { data: (data ?? []).map((row) => formatBenefit(row as BenefitRow)) };
  },

  async getBenefitById(id: string): Promise<ApiResponse<Benefit>> {
    if (USE_MOCKS) {
      const found = benefits.find((b) => b.id === id);
      if (!found) throw new Error(`Beneficio no encontrado: ${id}`);
      return delay({ data: found });
    }

    const { data, error } = await supabase.from('benefits').select('*').eq('id', id).single();
    if (error || !data) throw new Error(`Beneficio no encontrado: ${id}`);
    return { data: formatBenefit(data as BenefitRow) };
  },

  async createBenefit(input: BenefitFormInput): Promise<ApiResponse<Benefit>> {
    if (USE_MOCKS) {
      const created = buildBenefitFromInput(input);
      benefits = [created, ...benefits];
      return delay({ data: created });
    }

    const { data, error } = await supabase
      .from('benefits')
      .insert(toRowPayload(input))
      .select('*')
      .single();

    if (error || !data) throw new Error('No se pudo crear el beneficio.');
    return { data: formatBenefit(data as BenefitRow) };
  },

  async updateBenefit(id: string, input: BenefitFormInput): Promise<ApiResponse<Benefit>> {
    if (USE_MOCKS) {
      const existing = benefits.find((b) => b.id === id);
      if (!existing) throw new Error(`Beneficio no encontrado: ${id}`);
      const updated = buildBenefitFromInput(input, existing);
      benefits = benefits.map((b) => (b.id === id ? updated : b));
      return delay({ data: updated });
    }

    const { data, error } = await supabase
      .from('benefits')
      .update(toRowPayload(input))
      .eq('id', id)
      .select('*')
      .single();

    if (error || !data) throw new Error(`Beneficio no encontrado: ${id}`);
    return { data: formatBenefit(data as BenefitRow) };
  },

  async toggleActive(id: string, isActive: boolean): Promise<ApiResponse<Benefit>> {
    if (USE_MOCKS) {
      const existing = benefits.find((b) => b.id === id);
      if (!existing) throw new Error(`Beneficio no encontrado: ${id}`);
      const updated: Benefit = { ...existing, isActive };
      benefits = benefits.map((b) => (b.id === id ? updated : b));
      return delay({ data: updated });
    }

    const { data, error } = await supabase
      .from('benefits')
      .update({ is_active: isActive })
      .eq('id', id)
      .select('*')
      .single();

    if (error || !data) throw new Error(`Beneficio no encontrado: ${id}`);
    return { data: formatBenefit(data as BenefitRow) };
  },

  async deleteBenefit(id: string): Promise<ApiResponse<void>> {
    if (USE_MOCKS) {
      benefits = benefits.filter((b) => b.id !== id);
      return delay({ data: undefined as void });
    }

    const { error } = await supabase.from('benefits').delete().eq('id', id);
    if (error) throw new Error('No se pudo eliminar el beneficio.');
    return { data: undefined as void };
  },
};
