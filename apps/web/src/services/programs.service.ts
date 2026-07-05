import type { ApiResponse, Paginated, Program, ProgramWithModules } from '@cee/types';
import { mockPrograms, mockProgramModulesByProgramId } from '@/mocks/data/programs.mock';
import { mockCourses } from '@/mocks';
import { supabase } from '@/lib/supabase';
import { toRoman } from '@/lib/roman';
import { COURSE_SELECT, formatCourse, type CourseRow } from '@/services/course-mapper';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

const delay = <T>(value: T, ms = 400): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

interface ProgramRow {
  id: string;
  slug: string;
  title: string;
  category: Program['category'];
  modality: Program['modality'];
  level: Program['level'];
  short_description: string;
  description: string;
  price: number;
  original_price: number | null;
  image_url: string;
  start_date: string | null;
  academic_hours: number;
  certification: string;
  rating: number;
  enrolled_count: number;
  duration_weeks: number | null;
  schedule_description: string | null;
  syllabus_pdf_url: string | null;
  status: Program['status'];
  graduate_profile: string[];
  benefits: string[];
  syllabus: Program['syllabus'];
  created_at: string;
  updated_at: string;
  program_courses?: {
    sort_order: number;
    courses: CourseRow;
  }[];
}

function formatProgram(row: ProgramRow): Program {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    modality: row.modality,
    level: row.level,
    shortDescription: row.short_description,
    description: row.description,
    price: Number(row.price),
    originalPrice: row.original_price != null ? Number(row.original_price) : null,
    imageUrl: row.image_url,
    startDate: row.start_date ?? '',
    academicHours: row.academic_hours,
    certification: row.certification,
    rating: Number(row.rating),
    enrolledCount: row.enrolled_count,
    durationWeeks: row.duration_weeks,
    scheduleDescription: row.schedule_description,
    syllabusPdfUrl: row.syllabus_pdf_url ?? '',
    status: row.status,
    graduateProfile: row.graduate_profile ?? [],
    benefits: row.benefits ?? [],
    syllabus: row.syllabus ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function formatProgramWithModules(row: ProgramRow): ProgramWithModules {
  const program = formatProgram(row);
  const links = [...(row.program_courses ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  const modules = links.map(({ sort_order, courses }) => ({
    sortOrder: sort_order,
    romanLabel: toRoman(sort_order),
    course: formatCourse(courses),
  }));
  return { ...program, modules, moduleCount: modules.length };
}

const PROGRAM_SELECT = `
  *,
  program_courses (
    sort_order,
    courses (${COURSE_SELECT})
  )
`;

async function getModuleCourseIds(): Promise<string[]> {
  if (USE_MOCKS) {
    return mockProgramModulesByProgramId.flatMap((m) => m.courseIds);
  }
  const { data, error } = await supabase.from('program_courses').select('course_id');
  if (error) return [];
  return (data ?? []).map((r) => r.course_id as string);
}

export const programsService = {
  getModuleCourseIds,

  async getModuleCountsByProgramId(programIds: string[]): Promise<Map<string, number>> {
    const counts = new Map<string, number>();
    if (programIds.length === 0) return counts;

    if (USE_MOCKS) {
      for (const id of programIds) {
        const link = mockProgramModulesByProgramId.find((m) => m.programId === id);
        counts.set(id, link?.courseIds.length ?? 0);
      }
      return counts;
    }

    const { data, error } = await supabase
      .from('program_courses')
      .select('program_id')
      .in('program_id', programIds);

    if (error) return counts;
    for (const row of data ?? []) {
      const pid = row.program_id as string;
      counts.set(pid, (counts.get(pid) ?? 0) + 1);
    }
    return counts;
  },

  async getAll(params?: Record<string, string | number | boolean>): Promise<Paginated<Program>> {
    if (USE_MOCKS) {
      let results = [...mockPrograms];
      if (params?.category) {
        results = results.filter((p) => p.category === params.category);
      }
      if (params?.modality) {
        results = results.filter((p) => p.modality === params.modality);
      }
      if (params?.search) {
        const q = String(params.search).toLowerCase();
        results = results.filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            p.shortDescription.toLowerCase().includes(q),
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
      .from('programs')
      .select('*', { count: 'exact' })
      .eq('status', 'published');

    if (params?.category) query = query.eq('category', String(params.category));
    if (params?.modality) query = query.eq('modality', String(params.modality));
    if (params?.search) {
      const q = String(params.search);
      query = query.or(`title.ilike.%${q}%,short_description.ilike.%${q}%`);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(start, start + pageSize - 1);

    if (error) throw new Error('No se pudieron cargar los programas.');

    return {
      data: (data ?? []).map((row) => formatProgram(row as unknown as ProgramRow)),
      page,
      pageSize,
      total: count ?? 0,
    };
  },

  async getBySlug(slug: string): Promise<ApiResponse<ProgramWithModules>> {
    if (USE_MOCKS) {
      const found = mockPrograms.find((p) => p.slug === slug);
      if (!found) throw new Error(`Programa no encontrado: ${slug}`);
      const link = mockProgramModulesByProgramId.find((m) => m.programId === found.id);
      const modules = (link?.courseIds ?? [])
        .map((courseId, index) => {
          const course = mockCourses.find((c) => c.id === courseId);
          if (!course) return null;
          const sortOrder = index + 1;
          return { sortOrder, romanLabel: toRoman(sortOrder), course };
        })
        .filter(Boolean) as ProgramWithModules['modules'];
      return delay({
        data: { ...found, modules, moduleCount: modules.length },
      });
    }

    const { data, error } = await supabase
      .from('programs')
      .select(PROGRAM_SELECT)
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (error || !data) throw new Error(`Programa no encontrado: ${slug}`);
    return { data: formatProgramWithModules(data as unknown as ProgramRow) };
  },

  /** Si el curso es módulo de un programa, devuelve slug del programa y sort_order. */
  async getProgramLinkByCourseSlug(
    courseSlug: string,
  ): Promise<{ programSlug: string; sortOrder: number } | null> {
    if (USE_MOCKS) {
      for (const link of mockProgramModulesByProgramId) {
        const program = mockPrograms.find((p) => p.id === link.programId);
        if (!program) continue;
        for (let i = 0; i < link.courseIds.length; i++) {
          const course = mockCourses.find((c) => c.id === link.courseIds[i]);
          if (course?.slug === courseSlug) {
            return { programSlug: program.slug, sortOrder: i + 1 };
          }
        }
      }
      return null;
    }

    const { data: course } = await supabase
      .from('courses')
      .select('id')
      .eq('slug', courseSlug)
      .maybeSingle();
    if (!course) return null;

    const { data: link } = await supabase
      .from('program_courses')
      .select('sort_order, programs(slug)')
      .eq('course_id', course.id)
      .maybeSingle();

    if (!link?.programs) return null;
    const programRef = link.programs as { slug: string } | { slug: string }[];
    const programSlug = Array.isArray(programRef) ? programRef[0]?.slug : programRef.slug;
    if (!programSlug) return null;
    return { programSlug, sortOrder: link.sort_order as number };
  },
};
