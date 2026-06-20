import { useEffect, useState } from 'react';
import type { Course, CourseCategory } from '@cee/types';
import { coursesService } from '@/services/courses.service';

interface UseCoursesOptions {
  category?: CourseCategory | 'Todas';
}

export function useCourses(options?: UseCoursesOptions) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const category = options?.category;

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    coursesService
      .getAll(category && category !== 'Todas' ? { category } : undefined)
      .then((response) => {
        if (isMounted) {
          setCourses(response.data);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [category]);

  return { courses, isLoading };
}
