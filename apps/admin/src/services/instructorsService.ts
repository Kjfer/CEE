import type { ApiResponse, Instructor, ExperienceItem, EducationItem, Testimonial, Publication } from '@cee/types';
import { supabase } from '@/lib/supabase';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

const delay = <T>(value: T, ms = 400): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

// Mock data
let mockInstructors: Instructor[] = [
  {
    id: 'i-1',
    name: 'Juan Pérez',
    title: 'Ingeniero de Software Senior',
    bio: 'Especialista en desarrollo web y arquitectura de software.',
    photoUrl: 'https://i.pravatar.cc/150?u=juan',
    linkedinUrl: 'https://linkedin.com/in/juanperez',
    specialties: ['React', 'Node.js'],
    experience: [],
    education: [],
    rating: 0,
    testimonials: [],
    publications: [],
  },
  {
    id: 'i-2',
    name: 'María García',
    title: 'Data Scientist',
    bio: 'Experta en análisis de datos y machine learning.',
    photoUrl: 'https://i.pravatar.cc/150?u=maria',
    linkedinUrl: '',
    specialties: ['Python', 'Machine Learning', 'Big Data'],
    experience: [],
    education: [],
    rating: 0,
    testimonials: [],
    publications: [],
  },
];

export interface InstructorFormInput {
  name: string;
  title: string;
  bio: string;
  photoUrl: string;
  linkedinUrl: string;
  specialties: string[];
  experience: ExperienceItem[];
  education: EducationItem[];
  rating: number;
  testimonials: Testimonial[];
  publications: Publication[];
}

interface InstructorRow {
  id: string;
  name: string;
  title: string;
  bio: string;
  photo_url: string;
  linkedin_url?: string;
  specialties?: string[];
  experience?: ExperienceItem[];
  education?: EducationItem[];
  rating?: number;
  testimonials?: Testimonial[];
  publications?: Publication[];
}

function formatInstructor(row: InstructorRow): Instructor {
  return {
    id: row.id,
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
  };
}

export const instructorsService = {
  async getInstructors(): Promise<ApiResponse<Instructor[]>> {
    if (USE_MOCKS) {
      return delay({ data: [...mockInstructors] });
    }

    const { data, error } = await supabase
      .from('instructors')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      throw new Error('No se pudieron cargar los profesores.');
    }
    return { data: (data ?? []).map((row) => formatInstructor(row as InstructorRow)) };
  },

  async getInstructorById(id: string): Promise<ApiResponse<Instructor>> {
    if (USE_MOCKS) {
      const found = mockInstructors.find((i) => i.id === id);
      if (!found) throw new Error(`Profesor no encontrado: ${id}`);
      return delay({ data: { ...found } });
    }

    const { data, error } = await supabase
      .from('instructors')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new Error(`Profesor no encontrado: ${id}`);
    }
    return { data: formatInstructor(data as InstructorRow) };
  },

  async createInstructor(input: InstructorFormInput): Promise<ApiResponse<Instructor>> {
    if (USE_MOCKS) {
      const newInstructor: Instructor = {
        id: `i-${Date.now()}`,
        name: input.name,
        title: input.title,
        bio: input.bio,
        photoUrl: input.photoUrl || 'https://i.pravatar.cc/150',
        linkedinUrl: input.linkedinUrl,
        specialties: input.specialties,
        experience: input.experience,
        education: input.education,
        rating: input.rating,
        testimonials: input.testimonials,
        publications: input.publications,
      };
      mockInstructors.push(newInstructor);
      return delay({ data: newInstructor });
    }

    const payload = {
      name: input.name,
      title: input.title,
      bio: input.bio,
      photo_url: input.photoUrl,
      linkedin_url: input.linkedinUrl || null,
      specialties: input.specialties,
      experience: input.experience,
      education: input.education,
      rating: input.rating,
      testimonials: input.testimonials,
      publications: input.publications,
    };

    const { data, error } = await supabase
      .from('instructors')
      .insert(payload)
      .select('*')
      .single();

    if (error || !data) {
      throw new Error('No se pudo registrar el profesor.');
    }
    return { data: formatInstructor(data as InstructorRow) };
  },

  async updateInstructor(id: string, input: InstructorFormInput): Promise<ApiResponse<Instructor>> {
    if (USE_MOCKS) {
      const idx = mockInstructors.findIndex((i) => i.id === id);
      if (idx === -1) throw new Error(`Profesor no encontrado: ${id}`);
      mockInstructors[idx] = { ...mockInstructors[idx], ...input };
      return delay({ data: { ...mockInstructors[idx] } });
    }

    const payload = {
      name: input.name,
      title: input.title,
      bio: input.bio,
      photo_url: input.photoUrl,
      linkedin_url: input.linkedinUrl || null,
      specialties: input.specialties,
      experience: input.experience,
      education: input.education,
      rating: input.rating,
      testimonials: input.testimonials,
      publications: input.publications,
    };

    const { data, error } = await supabase
      .from('instructors')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();

    if (error || !data) {
      throw new Error('No se pudo actualizar el profesor.');
    }
    return { data: formatInstructor(data as InstructorRow) };
  },

  async deleteInstructor(id: string): Promise<ApiResponse<void>> {
    if (USE_MOCKS) {
      mockInstructors = mockInstructors.filter((i) => i.id !== id);
      return delay({ data: undefined });
    }

    const { error } = await supabase.from('instructors').delete().eq('id', id);
    if (error) {
      throw new Error('No se pudo eliminar el profesor. Puede estar asignado a un curso.');
    }
    return { data: undefined };
  },
};
