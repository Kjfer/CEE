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
        termsPdfUrl: data.terms_pdf_url,
        termsPdfPath: data.terms_pdf_path,
        termsPdfName: data.terms_pdf_name,
        termsPdfUpdatedAt: data.terms_pdf_updated_at,
        updatedAt: data.updated_at,
      },
    };
  },
};
