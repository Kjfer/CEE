import type { Teacher } from '@cee/types';
import { mockTeachers } from '@/mocks';
import { supabase } from '@/lib/supabase';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

const delay = <T>(value: T, ms = 300): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

interface TeacherRow {
  id: string;
  name: string;
  title: string;
  bio: string;
  photo_url: string;
  linkedin_url?: string;
  specialties?: string[];
  experience?: any[];
  education?: any[];
  rating?: number;
  testimonials?: any[];
  publications?: any[];
}

function formatTeacher(row: TeacherRow): Teacher {
  // Generamos un slug simple a partir del nombre y el ID
  const slug = `${row.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${row.id.split('-')[0]}`;
  
  return {
    id: row.id,
    slug,
    name: row.name,
    title: row.title,
    bio: row.bio,
    photoUrl: row.photo_url,
    linkedinUrl: row.linkedin_url,
    specialties: row.specialties ?? [],
    experience: row.experience ?? [],
    education: row.education ?? [],
    rating: row.rating ?? 0,
    testimonials: row.testimonials ?? [],
    publications: row.publications ?? [],
    activeCourses: [],
  };
}

export const teachersService = {
  async getAll(): Promise<Teacher[]> {
    if (USE_MOCKS) {
      return delay([...mockTeachers]);
    }

    const { data, error } = await supabase.from('instructors').select('*').order('name');
    if (error) throw new Error('No se pudieron cargar los profesores.');
    return (data ?? []).map((row) => formatTeacher(row as unknown as TeacherRow));
  },

  async getBySlug(slug: string): Promise<Teacher> {
    if (USE_MOCKS) {
      const found = mockTeachers.find((teacher) => teacher.slug === slug);
      if (!found) throw new Error(`Profesor no encontrado: ${slug}`);
      return delay(found);
    }

    // Buscamos a todos y filtramos en cliente ya que el slug no está en la base de datos
    const allTeachers = await this.getAll();
    const found = allTeachers.find((t) => t.slug === slug);
    if (!found) throw new Error(`Profesor no encontrado: ${slug}`);
    
    // Buscar cursos activos del profesor
    const { data: coursesData } = await supabase
      .from('course_instructors')
      .select(`
        course_id,
        courses (*)
      `)
      .eq('instructor_id', found.id);

    const activeCourses = (coursesData ?? [])
      .map((item) => item.courses)
      .filter((course: any) => course && course.status === 'published')
      .map((row: any) => ({
        id: row.id,
        slug: row.slug,
        title: row.title,
        category: row.category,
        modality: row.modality,
        level: row.level,
        shortDescription: row.short_description,
        description: row.description,
        price: row.price,
        originalPrice: row.original_price,
        imageUrl: row.image_url,
        startDate: row.start_date,
        academicHours: row.academic_hours,
        certification: row.certification,
        rating: row.rating,
        enrolledCount: row.enrolled_count,
        moodleCourseId: row.moodle_course_id,
        syllabusPdfUrl: row.syllabus_pdf_url,
        status: row.status,
        graduateProfile: row.graduate_profile ?? [],
        syllabus: row.syllabus ?? [],
        instructors: [], // Podríamos llenarlo si fuera necesario, pero el CourseCard principal no lo requiere
        benefits: row.benefits ?? [],
        updatedAt: row.updated_at,
        createdAt: row.created_at,
      }));

    return { ...found, activeCourses };
  },
};
