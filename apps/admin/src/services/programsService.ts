import type {
  ApiResponse,
  Program,
  CourseCategory,
  CourseModality,
  CourseStatus,
} from '@cee/types';
import { slugify } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

const delay = <T>(value: T, ms = 400): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

let programsMock: Program[] = []; // In-memory mock if needed

export interface ProgramFormInput {
  title: string;
  short_description: string;
  description: string;
  price: number;
  original_price: number | null;
  category: CourseCategory;
  modality: CourseModality;
  level: string;
  status: CourseStatus;
  academic_hours: number;
  certification: string;
  start_date: string | null;
  duration_weeks: number | null;
  schedule_description: string | null;
  imageFileName?: string | null;
  imageFile?: File | null;
}

export const programsService = {
  async getPrograms(): Promise<ApiResponse<Program[]>> {
    if (USE_MOCKS) return delay({ data: programsMock, error: undefined });

    const { data, error } = await supabase
      .from('programs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return { data: null as any, error: error.message };
    return { data: data as Program[], error: undefined };
  },

  async getProgram(id: string): Promise<ApiResponse<Program>> {
    if (USE_MOCKS) {
      const p = programsMock.find((x) => x.id === id);
      return delay(p ? { data: p, error: undefined } : { data: null as any, error: 'Not found' });
    }

    const { data, error } = await supabase
      .from('programs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return { data: null as any, error: error.message };
    return { data: data as Program, error: undefined };
  },

  async createProgram(input: ProgramFormInput): Promise<ApiResponse<Program>> {
    if (USE_MOCKS) {
      const newProgram: Program = {
        ...input,
        id: `p-${Date.now()}`,
        slug: slugify(input.title),
        rating: 5,
        enrolled_count: 0,
        graduate_profile: [],
        benefits: [],
        syllabus: '[]',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        original_price: input.original_price?.toString() || null,
        price: input.price.toString(),
        image_url: '',
      } as any;
      programsMock = [newProgram, ...programsMock];
      return delay({ data: newProgram, error: undefined });
    }

    // 1. Upload files if present
    let image_url = '';
    if (input.imageFile) {
      const ext = input.imageFile.name.split('.').pop();
      const path = `${crypto.randomUUID()}.${ext}`;
      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from('course-images')
        .upload(path, input.imageFile);
      if (uploadErr) return { data: null as any, error: uploadErr.message };
      const { data: { publicUrl } } = supabase.storage.from('course-images').getPublicUrl(uploadData.path);
      image_url = publicUrl;
    }

    // 2. Insert program
    const { data, error } = await supabase
      .from('programs')
      .insert({
        title: input.title,
        slug: slugify(input.title),
        category: input.category,
        modality: input.modality,
        level: input.level,
        short_description: input.short_description,
        description: input.description,
        price: input.price,
        original_price: input.original_price,
        academic_hours: input.academic_hours,
        certification: input.certification,
        start_date: input.start_date,
        duration_weeks: input.duration_weeks,
        schedule_description: input.schedule_description,
        status: input.status,
        image_url,
      })
      .select()
      .single();

    if (error) return { data: null as any, error: error.message };
    return { data: data as Program, error: undefined };
  },

  async updateProgram(id: string, input: ProgramFormInput): Promise<ApiResponse<Program>> {
    if (USE_MOCKS) {
      const index = programsMock.findIndex(p => p.id === id);
      if (index === -1) return delay({ data: null as any, error: 'Not found' });
      const updated: Program = { 
        ...programsMock[index], 
        ...input,
        price: input.price.toString(),
        original_price: input.original_price?.toString() || null,
        updated_at: new Date().toISOString() 
      } as any;
      programsMock[index] = updated;
      return delay({ data: updated, error: undefined });
    }

    // 1. Get current
    const { data: current, error: getErr } = await supabase.from('programs').select('*').eq('id', id).single();
    if (getErr) return { data: null as any, error: getErr.message };

    // 2. Handle files
    let image_url = current.image_url;
    if (input.imageFile) {
      const ext = input.imageFile.name.split('.').pop();
      const path = `${crypto.randomUUID()}.${ext}`;
      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from('course-images')
        .upload(path, input.imageFile);
      if (uploadErr) return { data: null as any, error: uploadErr.message };
      const { data: { publicUrl } } = supabase.storage.from('course-images').getPublicUrl(uploadData.path);
      image_url = publicUrl;
    }

    // 3. Update
    const { data, error } = await supabase
      .from('programs')
      .update({
        title: input.title,
        slug: slugify(input.title),
        category: input.category,
        modality: input.modality,
        level: input.level,
        short_description: input.short_description,
        description: input.description,
        price: input.price,
        original_price: input.original_price,
        academic_hours: input.academic_hours,
        certification: input.certification,
        start_date: input.start_date,
        duration_weeks: input.duration_weeks,
        schedule_description: input.schedule_description,
        status: input.status,
        image_url,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) return { data: null as any, error: error.message };
    return { data: data as Program, error: undefined };
  },

  async deleteProgram(id: string): Promise<ApiResponse<null>> {
    if (USE_MOCKS) {
      programsMock = programsMock.filter(p => p.id !== id);
      return delay({ data: null as any, error: undefined });
    }

    const { error } = await supabase.from('programs').delete().eq('id', id);
    if (error) return { data: null as any, error: error.message };
    return { data: null as any, error: undefined };
  },

  // --- Program Courses (Modules) ---
  
  async getProgramCourses(programId: string): Promise<ApiResponse<any[]>> {
    if (USE_MOCKS) return delay({ data: [], error: undefined });

    const { data, error } = await supabase
      .from('program_courses')
      .select(`
        id,
        sort_order,
        course_id,
        course:courses(id, title, status, academic_hours)
      `)
      .eq('program_id', programId)
      .order('sort_order', { ascending: true });

    if (error) return { data: null as any, error: error.message };
    return { data, error: undefined };
  },

  async addCoursesToProgram(programId: string, coursesData: { course_id: string, sort_order: number }[]): Promise<ApiResponse<null>> {
    if (USE_MOCKS) return delay({ data: null as any, error: undefined });

    const rows = coursesData.map(c => ({ program_id: programId, course_id: c.course_id, sort_order: c.sort_order }));
    const { error } = await supabase
      .from('program_courses')
      .insert(rows);

    if (error) return { data: null as any, error: error.message };
    
    // Auto update program hours
    await programsService.updateProgramHoursFromCourses(programId);
    
    return { data: null as any, error: undefined };
  },

  async updateProgramHoursFromCourses(programId: string): Promise<ApiResponse<null>> {
    if (USE_MOCKS) return delay({ data: null as any, error: undefined });

    // Fetch all courses for this program to get their academic_hours
    const { data: programCourses, error: fetchError } = await supabase
      .from('program_courses')
      .select(`course_id, course:courses(academic_hours)`)
      .eq('program_id', programId);
      
    if (fetchError) return { data: null as any, error: fetchError.message };

    // Sum academic hours
    let totalHours = 0;
    programCourses?.forEach(pc => {
      // @ts-ignore - course is an object here but types might complain
      const hours = pc.course?.academic_hours || 0;
      totalHours += hours;
    });

    // Update program
    const { error: updateError } = await supabase
      .from('programs')
      .update({ academic_hours: totalHours })
      .eq('id', programId);

    if (updateError) return { data: null as any, error: updateError.message };
    return { data: null as any, error: undefined };
  },

  async removeCourseFromProgram(programId: string, courseId: string): Promise<ApiResponse<null>> {
    if (USE_MOCKS) return delay({ data: null as any, error: undefined });

    const { error } = await supabase
      .from('program_courses')
      .delete()
      .eq('program_id', programId)
      .eq('course_id', courseId);

    if (error) return { data: null as any, error: error.message };
    
    // Auto update program hours
    await programsService.updateProgramHoursFromCourses(programId);
    
    return { data: null as any, error: undefined };
  }
};
