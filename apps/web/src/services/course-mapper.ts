import type { Course, Instructor } from '@cee/types';

export interface InstructorRow {
  id: string;
  name: string;
  title: string;
  bio: string;
  photo_url: string;
}

export interface CourseRow {
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
  start_date: string;
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

export const COURSE_SELECT = '*, course_instructors(instructors(*))';

export function formatInstructor(row: InstructorRow): Instructor {
  return { id: row.id, name: row.name, title: row.title, bio: row.bio, photoUrl: row.photo_url };
}

export function formatCourse(row: CourseRow): Course {
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
