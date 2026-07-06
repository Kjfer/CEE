import type {
  ApiResponse,
  Course,
  CourseCategory,
  CourseModality,
  CourseStatus,
  Instructor,
} from '@cee/types';
import { mockAdminCourses } from '@/mocks/courses';
import { slugify } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

const delay = <T>(value: T, ms = 400): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

// Fase 5: panel admin trabaja 100% sobre mocks cuando VITE_USE_MOCKS=true.
// Las mutaciones se aplican sobre este array en memoria; persisten mientras
// dure la sesión de la pestaña, no hay almacenamiento real.
let courses: Course[] = [...mockAdminCourses];

/**
 * Forma de datos que recoge CourseFormPage. No vive en @cee/types porque es
 * un input de formulario (subset de Course), no un contrato de respuesta de
 * backend — a diferencia de DashboardSummary/SalesReport.
 */
export interface CourseFormInput {
  title: string;
  description: string;
  price: number;
  category: CourseCategory;
  modality: CourseModality;
  moodleCourseId: number;
  status: CourseStatus;
  syllabusFileName: string | null;
  /** Archivo real del sílabo a subir a Supabase Storage; ausente si no se cambió. */
  syllabusFile?: File | null;
  durationWeeks: number | null;
  scheduleDescription: string | null;
  startDate: string | null;
  maxStudents: number | null;
  minStudents: number | null;
  alertDaysBefore: number | null;
  instructorIds: string[];
  imageFileName?: string | null;
  imageFile?: File | null;
  level: 'Básico' | 'Intermedio' | 'Avanzado';
  academicHours: number;
}

function buildCourseFromInput(input: CourseFormInput, existing?: Course): Course {
  const now = new Date().toISOString();
  const slug = existing?.slug ?? slugify(input.title);

  return {
    id: existing?.id ?? `c-${Date.now()}`,
    slug,
    title: input.title,
    category: input.category,
    modality: input.modality,
    level: input.level,
    shortDescription: existing?.shortDescription ?? input.description.slice(0, 120),
    description: input.description,
    price: input.price,
    originalPrice: existing?.originalPrice ?? null,
    imageUrl: existing?.imageUrl ?? '',
    startDate:       input.startDate ?? existing?.startDate ?? now,
    durationWeeks:   input.durationWeeks,
    scheduleDescription: input.scheduleDescription,
    maxStudents:     input.maxStudents,
    minStudents:     input.minStudents,
    alertDaysBefore: input.alertDaysBefore,
    academicHours: input.academicHours,
    certification: existing?.certification ?? 'Certificación CEE-FIIS',
    rating: existing?.rating ?? 0,
    enrolledCount: existing?.enrolledCount ?? 0,
    moodleCourseId: input.moodleCourseId,
    syllabusPdfUrl: input.syllabusFileName
      ? `/syllabi/${slug}.pdf`
      : existing?.syllabusPdfUrl ?? '',
    status: input.status,
    graduateProfile: existing?.graduateProfile ?? [],
    syllabus: existing?.syllabus ?? [],
    instructors: input.instructorIds.map((id) => ({
      id,
      name: `Profesor ${id.split('-').pop()}`,
      title: 'TBD',
      bio: '',
      photoUrl: '',
    } as unknown as Instructor)),
    benefits: existing?.benefits ?? [],
    updatedAt: now,
    createdAt: existing?.createdAt ?? now,
  };
}

interface InstructorRow {
  id: string;
  name: string;
  title: string;
  bio: string;
  photo_url: string;
}

interface CourseRow {
  id: string;
  slug: string;
  title: string;
  category: Course['category'];
  modality: Course['modality'];
  level: Course['level'];
  short_description: string;
  description: string;
  price: number;
  original_price: number | null;
  image_url: string;
  start_date: string | null;
  duration_weeks: number | null;
  schedule_description: string | null;
  max_students: number | null;
  min_students: number | null;
  alert_days_before: number | null;
  academic_hours: number;
  certification: string;
  rating: number;
  enrolled_count: number;
  moodle_course_id: number | null;
  syllabus_pdf_url: string | null;
  status: Course['status'];
  graduate_profile: string[];
  benefits: string[];
  syllabus: Course['syllabus'];
  created_at: string;
  updated_at: string;
  course_instructors?: { instructors: InstructorRow }[];
}

function formatInstructor(row: InstructorRow): Instructor {
  return { id: row.id, name: row.name, title: row.title, bio: row.bio, photoUrl: row.photo_url } as unknown as Instructor;
}

function formatCourse(row: CourseRow): Course {
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
    imageUrl: row.image_url ?? '',
    startDate: row.start_date ?? '',
    durationWeeks: row.duration_weeks,
    scheduleDescription: row.schedule_description,
    maxStudents:     row.max_students,
    minStudents:     row.min_students,
    alertDaysBefore: row.alert_days_before,
    academicHours: row.academic_hours,
    certification: row.certification,
    rating: Number(row.rating),
    enrolledCount: row.enrolled_count,
    moodleCourseId: row.moodle_course_id,
    syllabusPdfUrl: row.syllabus_pdf_url ?? '',
    status: row.status,
    graduateProfile: row.graduate_profile ?? [],
    benefits: row.benefits ?? [],
    syllabus: row.syllabus ?? [],
    instructors: (row.course_instructors ?? []).map((ci) => formatInstructor(ci.instructors)),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const COURSE_SELECT = '*, course_instructors(instructors(*))';

async function uploadSyllabus(file: File): Promise<string> {
  const path = `${crypto.randomUUID()}.pdf`;
  const { error } = await supabase.storage
    .from('syllabus-pdfs')
    .upload(path, file, { contentType: 'application/pdf' });

  if (error) {
    throw new Error('No se pudo subir el sílabo PDF.');
  }

  return supabase.storage.from('syllabus-pdfs').getPublicUrl(path).data.publicUrl;
}

async function uploadCourseImage(file: File): Promise<string> {
  const ext = file.name.split('.').pop() || 'png';
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from('course-images')
    .upload(path, file, { contentType: file.type });

  if (error) {
    throw new Error('No se pudo subir la imagen del curso.');
  }

  return supabase.storage.from('course-images').getPublicUrl(path).data.publicUrl;
}

export const coursesService = {
  async getCourses(): Promise<ApiResponse<Course[]>> {
    if (USE_MOCKS) {
      return delay({ data: courses });
    }

    const { data, error } = await supabase
      .from('courses')
      .select(COURSE_SELECT)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error('No se pudieron cargar los cursos.');
    }
    return { data: (data ?? []).map((row) => formatCourse(row as unknown as CourseRow)) };
  },

  async getCourseById(id: string): Promise<ApiResponse<Course>> {
    if (USE_MOCKS) {
      const found = courses.find((c) => c.id === id);
      if (!found) {
        throw new Error(`Curso no encontrado: ${id}`);
      }
      return delay({ data: found });
    }

    const { data, error } = await supabase
      .from('courses')
      .select(COURSE_SELECT)
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new Error(`Curso no encontrado: ${id}`);
    }
    return { data: formatCourse(data as unknown as CourseRow) };
  },

  async createCourse(input: CourseFormInput): Promise<ApiResponse<Course>> {
    if (USE_MOCKS) {
      const created = buildCourseFromInput(input);
      courses = [created, ...courses];
      return delay({ data: created });
    }

    const syllabusPdfUrl = input.syllabusFile ? await uploadSyllabus(input.syllabusFile) : null;
    const imageUrl = input.imageFile ? await uploadCourseImage(input.imageFile) : '';

    const { data, error } = await supabase
      .from('courses')
      .insert({
        slug: slugify(input.title),
        title: input.title,
        category: input.category,
        modality: input.modality,
        level: 'Básico',
        short_description: input.description.slice(0, 120),
        description: input.description,
        price: input.price,
        image_url: imageUrl,
        start_date:         input.startDate,
        duration_weeks:     input.durationWeeks,
        schedule_description: input.scheduleDescription,
        max_students:       input.maxStudents,
        min_students:       input.minStudents,
        alert_days_before:  input.alertDaysBefore,
        academic_hours: 0,
        certification: 'Certificación CEE-FIIS',
        moodle_course_id: input.moodleCourseId,
        syllabus_pdf_url: syllabusPdfUrl,
        status: input.status,
      })
      .select(COURSE_SELECT)
      .single();

    if (error || !data) {
      throw new Error('No se pudo crear el curso.');
    }

    if (input.instructorIds.length > 0) {
      const courseInstructors = input.instructorIds.map((instId) => ({
        course_id: data.id,
        instructor_id: instId,
      }));
      await supabase.from('course_instructors').insert(courseInstructors);
      
      // Refetch to include the newly added instructors
      const refetched = await supabase
        .from('courses')
        .select(COURSE_SELECT)
        .eq('id', data.id)
        .single();
      
      if (refetched.data) {
        return { data: formatCourse(refetched.data as unknown as CourseRow) };
      }
    }

    return { data: formatCourse(data as unknown as CourseRow) };
  },

  async updateCourse(id: string, input: CourseFormInput): Promise<ApiResponse<Course>> {
    if (USE_MOCKS) {
      const existing = courses.find((c) => c.id === id);
      if (!existing) {
        throw new Error(`Curso no encontrado: ${id}`);
      }
      buildCourseFromInput(input, existing);
    }

    const syllabusPdfUrl = input.syllabusFile
      ? await uploadSyllabus(input.syllabusFile)
      : input.syllabusFileName === null ? null : undefined;

    const newImageUrl = input.imageFile
      ? await uploadCourseImage(input.imageFile)
      : input.imageFileName === null ? '' : undefined;

    const updates: Partial<CourseRow> = {
      title: input.title,
      slug: slugify(input.title),
      category: input.category,
      modality: input.modality,
      short_description: input.description.slice(0, 120),
      description: input.description,
      price: input.price,
      start_date:         input.startDate,
      duration_weeks:     input.durationWeeks,
      schedule_description: input.scheduleDescription,
      max_students:     input.maxStudents,
      min_students:     input.minStudents,
      alert_days_before: input.alertDaysBefore,
      moodle_course_id: input.moodleCourseId,
      status: input.status,
    };

    if (syllabusPdfUrl !== undefined) {
      updates.syllabus_pdf_url = syllabusPdfUrl;
    }
    if (newImageUrl !== undefined) {
      updates.image_url = newImageUrl;
    }

    const { data, error } = await supabase
      .from('courses')
      .update(updates)
      .eq('id', id)
      .select(COURSE_SELECT)
      .single();

    if (error || !data) {
      throw new Error(`Curso no encontrado: ${id}`);
    }

    // Update instructors
    await supabase.from('course_instructors').delete().eq('course_id', id);
    if (input.instructorIds.length > 0) {
      const courseInstructors = input.instructorIds.map((instId) => ({
        course_id: id,
        instructor_id: instId,
      }));
      await supabase.from('course_instructors').insert(courseInstructors);
    }

    // Refetch to include updated instructors
    const refetched = await supabase
      .from('courses')
      .select(COURSE_SELECT)
      .eq('id', id)
      .single();

    if (refetched.error || !refetched.data) {
      throw new Error(`Error recargando curso: ${id}`);
    }

    return { data: formatCourse(refetched.data as unknown as CourseRow) };
  },

  async updateCourseStatus(id: string, status: CourseStatus): Promise<ApiResponse<Course>> {
    if (USE_MOCKS) {
      const existing = courses.find((c) => c.id === id);
      if (!existing) {
        throw new Error(`Curso no encontrado: ${id}`);
      }
      const updated: Course = { ...existing, status, updatedAt: new Date().toISOString() };
      courses = courses.map((c) => (c.id === id ? updated : c));
      return delay({ data: updated });
    }

    const { data, error } = await supabase
      .from('courses')
      .update({ status })
      .eq('id', id)
      .select(COURSE_SELECT)
      .single();

    if (error || !data) {
      throw new Error(`Curso no encontrado: ${id}`);
    }
    return { data: formatCourse(data as unknown as CourseRow) };
  },

  async deleteCourse(id: string): Promise<ApiResponse<void>> {
    if (USE_MOCKS) {
      courses = courses.filter((c) => c.id !== id);
      return delay({ data: undefined as void });
    }

    const { error } = await supabase.from('courses').delete().eq('id', id);
    if (error) {
      if (error.code === '23503') {
        throw new Error('No se puede eliminar un curso con ventas registradas.');
      }
      throw new Error('No se pudo eliminar el curso.');
    }
    return { data: undefined as void };
  },
};
