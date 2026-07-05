import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

const delay = <T>(value: T, ms = 500): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

export const storageService = {
  /**
   * Sube un archivo a un bucket público y devuelve la URL pública.
   * @param file El archivo a subir
   * @param folder Carpeta opcional (ej: 'blog' o 'thumbnails')
   */
  async uploadPublicFile(file: File, folder: string = 'general'): Promise<string> {
    if (USE_MOCKS) {
      // Devolver una imagen de placeholder para los mocks
      await delay(null);
      return `https://picsum.photos/seed/${uuidv4()}/800/400`;
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${uuidv4()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('public-assets')
      .upload(fileName, file, { upsert: false });

    if (uploadError) {
      throw new Error(`Error subiendo archivo: ${uploadError.message}`);
    }

    const { data } = supabase.storage
      .from('public-assets')
      .getPublicUrl(fileName);

    return data.publicUrl;
  }
};
