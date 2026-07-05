import type { ApiResponse, BlogPost } from '@cee/types';
import { supabase } from '@/lib/supabase';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

const delay = <T>(value: T, ms = 400): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

let mockPosts: BlogPost[] = [
  {
    id: 'post-1',
    title: '5 Consejos para mejorar tu Gestión de Proyectos',
    summary: 'Aprende las claves fundamentales para liderar equipos y entregar resultados a tiempo.',
    content: '<p>Contenido extenso del post...</p>',
    imageUrl: 'https://picsum.photos/seed/post1/800/400',
    date: new Date().toISOString(),
    slug: '5-consejos-mejorar-gestion-proyectos',
  },
];

export interface BlogPostFormInput {
  title: string;
  summary: string;
  content: string;
  imageUrl: string;
  slug: string;
  date?: string;
}

interface BlogPostRow {
  id: string;
  title: string;
  summary: string;
  content: string;
  image_url: string;
  date: string;
  slug: string;
}

function formatPost(row: BlogPostRow): BlogPost {
  return {
    id: row.id,
    title: row.title,
    summary: row.summary,
    content: row.content,
    imageUrl: row.image_url,
    date: row.date,
    slug: row.slug,
  };
}

export const blogService = {
  async getPosts(): Promise<ApiResponse<BlogPost[]>> {
    if (USE_MOCKS) {
      return delay({ data: mockPosts });
    }
    const { data, error } = await supabase.from('blog_posts').select('*').order('date', { ascending: false });
    if (error) throw new Error('No se pudieron cargar las entradas de blog.');
    return { data: (data ?? []).map((r) => formatPost(r as BlogPostRow)) };
  },

  async getPostById(id: string): Promise<ApiResponse<BlogPost>> {
    if (USE_MOCKS) {
      const found = mockPosts.find((p) => p.id === id);
      if (!found) throw new Error('Post no encontrado');
      return delay({ data: found });
    }
    const { data, error } = await supabase.from('blog_posts').select('*').eq('id', id).single();
    if (error || !data) throw new Error('Post no encontrado');
    return { data: formatPost(data as BlogPostRow) };
  },

  async createPost(input: BlogPostFormInput): Promise<ApiResponse<BlogPost>> {
    if (USE_MOCKS) {
      const created: BlogPost = {
        id: `post-${Date.now()}`,
        ...input,
        date: input.date || new Date().toISOString(),
      };
      mockPosts = [created, ...mockPosts];
      return delay({ data: created });
    }
    const { data, error } = await supabase
      .from('blog_posts')
      .insert({
        title: input.title,
        summary: input.summary,
        content: input.content,
        image_url: input.imageUrl,
        slug: input.slug,
        date: input.date || new Date().toISOString(),
      })
      .select('*')
      .single();

    if (error || !data) throw new Error('No se pudo crear el post.');
    return { data: formatPost(data as BlogPostRow) };
  },

  async updatePost(id: string, input: BlogPostFormInput): Promise<ApiResponse<BlogPost>> {
    if (USE_MOCKS) {
      const existing = mockPosts.find((p) => p.id === id);
      if (!existing) throw new Error('Post no encontrado');
      const updated = { ...existing, ...input, date: input.date || existing.date };
      mockPosts = mockPosts.map((p) => (p.id === id ? updated : p));
      return delay({ data: updated });
    }
    const { data, error } = await supabase
      .from('blog_posts')
      .update({
        title: input.title,
        summary: input.summary,
        content: input.content,
        image_url: input.imageUrl,
        slug: input.slug,
        date: input.date,
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error || !data) throw new Error('No se pudo actualizar el post.');
    return { data: formatPost(data as BlogPostRow) };
  },

  async deletePost(id: string): Promise<ApiResponse<void>> {
    if (USE_MOCKS) {
      mockPosts = mockPosts.filter((p) => p.id !== id);
      return delay({ data: undefined as void });
    }
    const { error } = await supabase.from('blog_posts').delete().eq('id', id);
    if (error) throw new Error('No se pudo eliminar el post.');
    return { data: undefined as void };
  },
};
