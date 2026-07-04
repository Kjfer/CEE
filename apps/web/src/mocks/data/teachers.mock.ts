import type { Teacher } from '@cee/types';
import { mockInstructors } from './instructors.mock';
import { mockCourses } from './courses.mock';
import { slugify } from '@/lib/utils';

export const mockTeachers: Teacher[] = mockInstructors.map((instructor) => ({
  ...instructor,
  slug: slugify(instructor.name),
  activeCourses: mockCourses.slice(0, 2),
}));
