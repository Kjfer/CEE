import type { ApiResponse, Setting } from '@cee/types';
import { mockSettings } from '@/mocks/settings.mock';
import { supabase } from '@/lib/supabase';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

const delay = <T>(value: T, ms = 300): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

// In-memory cache for mock mode (mutations persist for the session)
let settingsCache: Setting[] = [...mockSettings];

interface SettingRow {
  key: string;
  value: string;
  description?: string | null;
  updated_at?: string | null;
}

function rowToSetting(row: SettingRow): Setting {
  return {
    key:         row.key,
    value:       row.value,
    description: row.description ?? undefined,
    updatedAt:   row.updated_at ?? undefined,
  };
}

export const settingsService = {
  async getSettings(): Promise<ApiResponse<Setting[]>> {
    if (USE_MOCKS) {
      return delay({ data: [...settingsCache] });
    }
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .order('key', { ascending: true });
    if (error) throw new Error('No se pudieron cargar la configuración.');
    // Si la tabla está vacía (aún no se han guardado settings), usar los valores
    // por defecto del mock para que el formulario tenga valores iniciales útiles.
    if (!data || data.length === 0) {
      return { data: [...mockSettings] };
    }
    return { data: data.map((r) => rowToSetting(r as SettingRow)) };
  },

  async updateSetting(key: string, value: string): Promise<ApiResponse<Setting>> {
    if (USE_MOCKS) {
      const now = new Date().toISOString();
      const idx = settingsCache.findIndex((s) => s.key === key);
      if (idx !== -1) {
        settingsCache[idx] = { ...settingsCache[idx], value, updatedAt: now };
        return delay({ data: settingsCache[idx] });
      }
      const newSetting: Setting = { key, value, updatedAt: now };
      settingsCache = [...settingsCache, newSetting];
      return delay({ data: newSetting });
    }
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('settings')
      .upsert({ key, value, updated_at: now })
      .select('*')
      .single();
    if (error || !data) throw new Error(`No se pudo actualizar la configuración: ${key}`);
    return { data: rowToSetting(data as SettingRow) };
  },

  async getSettingValue(key: string): Promise<string> {
    if (USE_MOCKS) {
      return settingsCache.find((s) => s.key === key)?.value ?? '';
    }
    const { data } = await supabase
      .from('settings')
      .select('value')
      .eq('key', key)
      .single();
    return (data as { value: string } | null)?.value ?? '';
  },

  // ---------- Site Settings (Nosotros) ----------
  async getSiteSettings() {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (error) throw new Error(`Error al obtener la configuración del sitio: ${error.message}`);

    return {
      data: {
        id: data.id,
        aboutTitle: data.about_title,
        aboutSubtitle: data.about_subtitle,
        aboutDescription: data.about_description,
        mission: data.mission,
        vision: data.vision,
        history: data.history,
        aboutImageUrl: data.about_image_url,
        heroImages: data.hero_images,
        updatedAt: data.updated_at,
      },
    };
  },

  async updateSiteSettings(input: Record<string, unknown>) {
    const payload: Record<string, unknown> = {};
    if (input.aboutTitle !== undefined) payload.about_title = input.aboutTitle;
    if (input.aboutSubtitle !== undefined) payload.about_subtitle = input.aboutSubtitle;
    if (input.aboutDescription !== undefined) payload.about_description = input.aboutDescription;
    if (input.mission !== undefined) payload.mission = input.mission;
    if (input.vision !== undefined) payload.vision = input.vision;
    if (input.history !== undefined) payload.history = input.history;
    if (input.aboutImageUrl !== undefined) payload.about_image_url = input.aboutImageUrl;
    if (input.heroImages !== undefined) payload.hero_images = input.heroImages;

    const now = new Date().toISOString();
    payload.updated_at = now;

    const { data, error } = await supabase
      .from('site_settings')
      .update(payload)
      .eq('id', 1)
      .select('*')
      .single();

    if (error) throw new Error(`Error al actualizar la configuración del sitio: ${error.message}`);

    return {
      data: {
        id: data.id,
        aboutTitle: data.about_title,
        aboutSubtitle: data.about_subtitle,
        aboutDescription: data.about_description,
        mission: data.mission,
        vision: data.vision,
        history: data.history,
        aboutImageUrl: data.about_image_url,
        heroImages: data.hero_images,
        updatedAt: data.updated_at,
      },
    };
  },

  async uploadSiteImage(file: File): Promise<string> {
    const ext = file.name.split('.').pop() || 'png';
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from('site-images')
      .upload(path, file, { contentType: file.type });

    if (error) throw new Error('No se pudo subir la imagen del sitio.');

    return supabase.storage.from('site-images').getPublicUrl(path).data.publicUrl;
  }
};
