import type { ApiResponse, Video } from '@cee/types';
import { supabase } from '@/lib/supabase';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

const delay = <T>(value: T, ms = 400): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

let mockVideos: Video[] = [
  {
    id: 'vid-1',
    title: 'Seminario de Gestión Ágil',
    description: 'Descubre cómo aplicar metodologías ágiles en tus proyectos diarios.',
    thumbnailUrl: 'https://picsum.photos/seed/vid1/600/400',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    duration: 3600,
    category: 'Gestión',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'vid-2',
    title: 'Masterclass: Machine Learning',
    description: 'Conceptos básicos e intermedios de Machine Learning aplicados a la industria.',
    thumbnailUrl: 'https://picsum.photos/seed/vid2/600/400',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    duration: 5400,
    category: 'Tecnología',
    createdAt: new Date().toISOString(),
  },
];

export interface VideoFormInput {
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  duration: number;
  category: string;
}

interface VideoRow {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  video_url: string;
  duration: number;
  category: string;
  created_at: string;
}

function formatVideo(row: VideoRow): Video {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    thumbnailUrl: row.thumbnail_url,
    videoUrl: row.video_url,
    duration: row.duration,
    category: row.category,
    createdAt: row.created_at,
  };
}

export const mediaService = {
  async getVideos(): Promise<ApiResponse<Video[]>> {
    if (USE_MOCKS) {
      return delay({ data: mockVideos });
    }
    const { data, error } = await supabase.from('videos').select('*').order('created_at', { ascending: false });
    if (error) throw new Error('No se pudieron cargar los videos.');
    return { data: (data ?? []).map((r) => formatVideo(r as VideoRow)) };
  },

  async getVideoById(id: string): Promise<ApiResponse<Video>> {
    if (USE_MOCKS) {
      const found = mockVideos.find((v) => v.id === id);
      if (!found) throw new Error('Video no encontrado');
      return delay({ data: found });
    }
    const { data, error } = await supabase.from('videos').select('*').eq('id', id).single();
    if (error || !data) throw new Error('Video no encontrado');
    return { data: formatVideo(data as VideoRow) };
  },

  async createVideo(input: VideoFormInput): Promise<ApiResponse<Video>> {
    if (USE_MOCKS) {
      const created: Video = {
        id: `vid-${Date.now()}`,
        ...input,
        createdAt: new Date().toISOString(),
      };
      mockVideos = [created, ...mockVideos];
      return delay({ data: created });
    }
    const { data, error } = await supabase
      .from('videos')
      .insert({
        title: input.title,
        description: input.description,
        thumbnail_url: input.thumbnailUrl,
        video_url: input.videoUrl,
        duration: input.duration,
        category: input.category,
      })
      .select('*')
      .single();

    if (error || !data) throw new Error('No se pudo crear el video.');
    return { data: formatVideo(data as VideoRow) };
  },

  async updateVideo(id: string, input: VideoFormInput): Promise<ApiResponse<Video>> {
    if (USE_MOCKS) {
      const existing = mockVideos.find((v) => v.id === id);
      if (!existing) throw new Error('Video no encontrado');
      const updated = { ...existing, ...input };
      mockVideos = mockVideos.map((v) => (v.id === id ? updated : v));
      return delay({ data: updated });
    }
    const { data, error } = await supabase
      .from('videos')
      .update({
        title: input.title,
        description: input.description,
        thumbnail_url: input.thumbnailUrl,
        video_url: input.videoUrl,
        duration: input.duration,
        category: input.category,
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error || !data) throw new Error('No se pudo actualizar el video.');
    return { data: formatVideo(data as VideoRow) };
  },

  async deleteVideo(id: string): Promise<ApiResponse<void>> {
    if (USE_MOCKS) {
      mockVideos = mockVideos.filter((v) => v.id !== id);
      return delay({ data: undefined as void });
    }
    const { error } = await supabase.from('videos').delete().eq('id', id);
    if (error) throw new Error('No se pudo eliminar el video.');
    return { data: undefined as void };
  },
};
