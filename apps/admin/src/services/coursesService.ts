import type { ApiResponse, Course, CourseStatus } from '@cee/types';
import { mockAdminCourses } from '@/mocks/courses';

const delay = <T>(value: T, ms = 400): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

// Fase 5: panel admin trabaja 100% sobre mocks (sin backend real hasta Fase 6).
// Las mutaciones se aplican sobre este array en memoria; persisten mientras
// dure la sesión de la pestaña, no hay almacenamiento real.
let courses: Course[] = [...mockAdminCourses];

export const coursesService = {
  async getCourses(): Promise<ApiResponse<Course[]>> {
    return delay({ data: courses });
  },

  async updateCourseStatus(id: string, status: CourseStatus): Promise<ApiResponse<Course>> {
    const existing = courses.find((c) => c.id === id);
    if (!existing) {
      throw new Error(`Curso no encontrado: ${id}`);
    }
    const updated: Course = { ...existing, status, updatedAt: new Date().toISOString() };
    courses = courses.map((c) => (c.id === id ? updated : c));
    return delay({ data: updated });
  },

  async deleteCourse(id: string): Promise<ApiResponse<void>> {
    courses = courses.filter((c) => c.id !== id);
    return delay({ data: undefined as void });
  },
};
