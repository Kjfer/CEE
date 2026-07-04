import { supabase } from '@/lib/supabase';
import type { SiteSettings, ApiResponse } from '@cee/types';

export const settingsService = {
  async getSiteSettings(): Promise<ApiResponse<SiteSettings>> {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (error) {
      throw new Error(`Error al obtener la configuración del sitio: ${error.message}`);
    }

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
};
