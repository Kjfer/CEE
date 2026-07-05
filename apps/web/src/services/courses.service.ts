import type { ApiResponse, Course, Paginated } from '@cee/types';
import { API_ENDPOINTS } from '@/constants/api.constants';
import { mockCourses } from '@/mocks';
import { mockProgramModulesByProgramId } from '@/mocks/data/programs.mock';
import { supabase } from '@/lib/supabase';
import { api } from '@/services/api';
import {
  COURSE_SELECT,
  formatCourse,
  type CourseRow,
} from '@/services/course-mapper';
import { programsService } from '@/services/programs.service';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

const delay = <T>(value: T, ms = 400): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

function getMockModuleCourseIds(): string[] {
  return mockProgramModulesByProgramId.flatMap((m) => m.courseIds);
}

export const coursesService = {
  async getAll(params?: Record<string, string | number | boolean>): Promise<Paginated<Course>> {
    const standaloneOnly = params?.standaloneOnly === true || params?.standaloneOnly === 'true';

    if (USE_MOCKS) {
      let results = [...mockCourses];
      if (standaloneOnly) {
        const moduleIds = new Set(getMockModuleCourseIds());
        results = results.filter((c) => !moduleIds.has(c.id));
      }
      if (params?.category) {
        results = results.filter((c) => c.category === params.category);
      }
      if (params?.modality) {
        results = results.filter((c) => c.modality === params.modality);
      }
      if (params?.search) {
        const q = String(params.search).toLowerCase();
        results = results.filter(
          (c) =>
            c.title.toLowerCase().includes(q) ||
            c.shortDescription.toLowerCase().includes(q),
        );
      }
      const page = Number(params?.page ?? 1);
      const pageSize = Number(params?.pageSize ?? 12);
      const start = (page - 1) * pageSize;
      return delay({
        data: results.slice(start, start + pageSize),
        page,
        pageSize,
        total: results.length,
      });
    }

    const page = Number(params?.page ?? 1);
    const pageSize = Number(params?.pageSize ?? 12);
    const start = (page - 1) * pageSize;

    let query = supabase
      .from('courses')
      .select(COURSE_SELECT, { count: 'exact' })
      .eq('status', 'published');

    if (standaloneOnly) {
      const moduleIds = await programsService.getModuleCourseIds();
      if (moduleIds.length > 0) {
        query = query.not('id', 'in', `(${moduleIds.join(',')})`);
      }
    }

    if (params?.category) query = query.eq('category', String(params.category));
    if (params?.modality) query = query.eq('modality', String(params.modality));
    if (params?.search) {
      const q = String(params.search);
      query = query.or(`title.ilike.%${q}%,short_description.ilike.%${q}%`);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(start, start + pageSize - 1);

    if (error) {
      throw new Error('No se pudieron cargar los cursos.');
    }

    return {
      data: (data ?? []).map((row) => formatCourse(row as unknown as CourseRow)),
      page,
      pageSize,
      total: count ?? 0,
    };
  },

  async getBySlug(slug: string): Promise<ApiResponse<Course>> {
    if (USE_MOCKS) {
      const found = mockCourses.find((c) => c.slug === slug);
      if (!found) throw new Error(`Curso no encontrado: ${slug}`);
      return delay({ data: found });
    }

    const { data, error } = await supabase
      .from('courses')
      .select(COURSE_SELECT)
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (error || !data) throw new Error(`Curso no encontrado: ${slug}`);
    return { data: formatCourse(data as unknown as CourseRow) };
  },

  async getById(id: string): Promise<ApiResponse<Course>> {
    if (USE_MOCKS) {
      const found = mockCourses.find((c) => c.id === id);
      if (!found) throw new Error(`Curso no encontrado: ${id}`);
      return delay({ data: found });
    }

    const { data, error } = await supabase
      .from('courses')
      .select(COURSE_SELECT)
      .eq('id', id)
      .eq('status', 'published')
      .single();

    if (error || !data) throw new Error(`Curso no encontrado: ${id}`);
    return { data: formatCourse(data as unknown as CourseRow) };
  },

  async create(data: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Course>> {
    if (USE_MOCKS) {
      const now = new Date().toISOString();
      return delay({ data: { ...data, id: `mock-${Date.now()}`, createdAt: now, updatedAt: now } });
    }
    const response = await api.post<ApiResponse<Course>>(API_ENDPOINTS.COURSES, data);
    return response.data;
  },

  async update(id: string, data: Partial<Course>): Promise<ApiResponse<Course>> {
    if (USE_MOCKS) {
      const existing = mockCourses.find((c) => c.id === id);
      if (!existing) throw new Error(`Curso no encontrado: ${id}`);
      return delay({ data: { ...existing, ...data, updatedAt: new Date().toISOString() } });
    }
    const response = await api.patch<ApiResponse<Course>>(`${API_ENDPOINTS.COURSES}/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    if (USE_MOCKS) {
      return delay({ data: undefined as void });
    }
    const response = await api.delete<ApiResponse<void>>(`${API_ENDPOINTS.COURSES}/${id}`);
    return response.data;
  },
};
